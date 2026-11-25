"""Daily Calorie Tracker local server with SQLite storage and optional Gemini Vision AI."""

from __future__ import annotations

import base64
import csv
import io
import json
import mimetypes
import os
import re
import sqlite3
import threading
import urllib.error
import urllib.parse
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timedelta
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Iterator

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DIST_DIR = BASE_DIR / "dist"
DEFAULT_DATA_DIR = BASE_DIR / "data"
VALID_MEALS = ("breakfast", "lunch", "dinner", "snack")
DEFAULT_DAILY_GOAL = 2000
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"


class CalorieStore:
    """Thread-safe SQLite store for food entries and user settings."""

    def __init__(self, db_path: Path) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._init_db()

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._lock, self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    meal_type TEXT NOT NULL,
                    food_name TEXT NOT NULL,
                    portion TEXT NOT NULL DEFAULT '1份',
                    calories REAL NOT NULL DEFAULT 0,
                    protein REAL NOT NULL DEFAULT 0,
                    carbs REAL NOT NULL DEFAULT 0,
                    fat REAL NOT NULL DEFAULT 0,
                    estimation_source TEXT NOT NULL DEFAULT 'manual',
                    notes TEXT NOT NULL DEFAULT '',
                    photo_data TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date)"
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
                """
            )
            conn.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES ('daily_goal', ?)",
                (str(DEFAULT_DAILY_GOAL),),
            )
            conn.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES ('gemini_model', ?)",
                (DEFAULT_GEMINI_MODEL,),
            )
            conn.commit()

    def get_settings(self) -> dict[str, Any]:
        with self._lock, self._connect() as conn:
            rows = conn.execute("SELECT key, value FROM settings").fetchall()
        raw = {row["key"]: row["value"] for row in rows}
        env_key = os.environ.get("GEMINI_API_KEY", "").strip()
        saved_key = raw.get("gemini_api_key", "").strip()
        active_key = saved_key or env_key
        masked = ""
        if active_key:
            masked = (
                f"{active_key[:4]}...{active_key[-4:]}"
                if len(active_key) > 10
                else "****"
            )
        return {
            "daily_goal": int(float(raw.get("daily_goal", DEFAULT_DAILY_GOAL))),
            "gemini_model": raw.get("gemini_model", DEFAULT_GEMINI_MODEL)
            or DEFAULT_GEMINI_MODEL,
            "has_api_key": bool(active_key),
            "api_key_source": "saved" if saved_key else ("env" if env_key else "none"),
            "api_key_masked": masked,
        }

    def get_active_api_key(self) -> tuple[str, str]:
        with self._lock, self._connect() as conn:
            rows = conn.execute(
                "SELECT key, value FROM settings WHERE key IN ('gemini_api_key', 'gemini_model')"
            ).fetchall()
        raw = {row["key"]: row["value"] for row in rows}
        api_key = raw.get("gemini_api_key", "").strip() or os.environ.get(
            "GEMINI_API_KEY", ""
        ).strip()
        model = raw.get("gemini_model", DEFAULT_GEMINI_MODEL).strip() or DEFAULT_GEMINI_MODEL
        return api_key, model

    def update_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock, self._connect() as conn:
            if "daily_goal" in payload:
                goal = int(float(payload["daily_goal"]))
                if goal < 500 or goal > 10000:
                    raise ValueError("每日目標熱量需介於 500 至 10000 大卡之間")
                conn.execute(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES ('daily_goal', ?)",
                    (str(goal),),
                )
            if "gemini_model" in payload and str(payload["gemini_model"]).strip():
                conn.execute(
                    "INSERT OR REPLACE INTO settings (key, value) VALUES ('gemini_model', ?)",
                    (str(payload["gemini_model"]).strip(),),
                )
            if "gemini_api_key" in payload:
                key_val = str(payload["gemini_api_key"]).strip()
                if key_val == "__CLEAR__":
                    conn.execute("DELETE FROM settings WHERE key = 'gemini_api_key'")
                elif key_val:
                    conn.execute(
                        "INSERT OR REPLACE INTO settings (key, value) VALUES ('gemini_api_key', ?)",
                        (key_val,),
                    )
            conn.commit()
        return self.get_settings()

    @staticmethod
    def _validate_entry(payload: dict[str, Any]) -> dict[str, Any]:
        date_str = str(payload.get("date", "")).strip()
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date_str):
            raise ValueError("日期格式必須為 YYYY-MM-DD")

        meal_type = str(payload.get("meal_type", "")).strip().lower()
        if meal_type not in VALID_MEALS:
            raise ValueError("餐別必須為 breakfast、lunch、dinner 或 snack")

        food_name = str(payload.get("food_name", "")).strip()
        if not food_name:
            raise ValueError("請輸入食物名稱")

        portion = str(payload.get("portion", "1份")).strip() or "1份"

        try:
            calories = round(float(payload.get("calories", 0)), 1)
            protein = round(float(payload.get("protein", 0) or 0), 1)
            carbs = round(float(payload.get("carbs", 0) or 0), 1)
            fat = round(float(payload.get("fat", 0) or 0), 1)
        except (TypeError, ValueError) as exc:
            raise ValueError("熱量與營養素必須為數字") from exc

        if calories < 0 or protein < 0 or carbs < 0 or fat < 0:
            raise ValueError("熱量與營養素不可為負數")

        photo_data = str(payload.get("photo_data", "") or "")
        if len(photo_data) > 2_500_000:
            raise ValueError("照片檔案過大，請使用較小的圖片")

        estimation_source = str(payload.get("estimation_source", "manual")).strip() or "manual"
        notes = str(payload.get("notes", "") or "").strip()

        return {
            "date": date_str,
            "meal_type": meal_type,
            "food_name": food_name,
            "portion": portion,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fat": fat,
            "estimation_source": estimation_source,
            "notes": notes,
            "photo_data": photo_data,
        }

    def create_entry(self, payload: dict[str, Any]) -> dict[str, Any]:
        clean = self._validate_entry(payload)
        now = datetime.now().isoformat(timespec="seconds")
        with self._lock, self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO entries (
                    date, meal_type, food_name, portion, calories,
                    protein, carbs, fat, estimation_source, notes, photo_data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    clean["date"],
                    clean["meal_type"],
                    clean["food_name"],
                    clean["portion"],
                    clean["calories"],
                    clean["protein"],
                    clean["carbs"],
                    clean["fat"],
                    clean["estimation_source"],
                    clean["notes"],
                    clean["photo_data"],
                    now,
                ),
            )
            entry_id = cursor.lastrowid
            conn.commit()
            row = conn.execute(
                "SELECT * FROM entries WHERE id = ?", (entry_id,)
            ).fetchone()
        return dict(row)

    def update_entry(self, entry_id: int, payload: dict[str, Any]) -> dict[str, Any] | None:
        clean = self._validate_entry(payload)
        with self._lock, self._connect() as conn:
            existing = conn.execute(
                "SELECT id FROM entries WHERE id = ?", (entry_id,)
            ).fetchone()
            if not existing:
                return None
            conn.execute(
                """
                UPDATE entries
                SET date = ?, meal_type = ?, food_name = ?, portion = ?,
                    calories = ?, protein = ?, carbs = ?, fat = ?,
                    estimation_source = ?, notes = ?, photo_data = ?
                WHERE id = ?
                """,
                (
                    clean["date"],
                    clean["meal_type"],
                    clean["food_name"],
                    clean["portion"],
                    clean["calories"],
                    clean["protein"],
                    clean["carbs"],
                    clean["fat"],
                    clean["estimation_source"],
                    clean["notes"],
                    clean["photo_data"],
                    entry_id,
                ),
            )
            conn.commit()
            row = conn.execute(
                "SELECT * FROM entries WHERE id = ?", (entry_id,)
            ).fetchone()
        return dict(row)

    def delete_entry(self, entry_id: int) -> bool:
        with self._lock, self._connect() as conn:
            cursor = conn.execute("DELETE FROM entries WHERE id = ?", (entry_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_day_summary(self, date_str: str) -> dict[str, Any]:
        with self._lock, self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM entries WHERE date = ? ORDER BY id DESC", (date_str,)
            ).fetchall()
        entries = [dict(r) for r in rows]
        meal_totals = {meal: 0.0 for meal in VALID_MEALS}
        meal_counts = {meal: 0 for meal in VALID_MEALS}
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fat = 0.0

        for item in entries:
            kcal = float(item["calories"])
            meal = item["meal_type"]
            if meal in meal_totals:
                meal_totals[meal] = round(meal_totals[meal] + kcal, 1)
                meal_counts[meal] += 1
            total_calories += kcal
            total_protein += float(item.get("protein", 0))
            total_carbs += float(item.get("carbs", 0))
            total_fat += float(item.get("fat", 0))

        settings = self.get_settings()
        return {
            "date": date_str,
            "daily_goal": settings["daily_goal"],
            "entries": entries,
            "meal_totals": meal_totals,
            "meal_counts": meal_counts,
            "totals": {
                "calories": round(total_calories, 1),
                "protein": round(total_protein, 1),
                "carbs": round(total_carbs, 1),
                "fat": round(total_fat, 1),
            },
        }

    def get_history(self, end_date_str: str, days: int = 7) -> list[dict[str, Any]]:
        days = max(1, min(days, 31))
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        start_date = end_date - timedelta(days=days - 1)

        with self._lock, self._connect() as conn:
            rows = conn.execute(
                """
                SELECT date, meal_type, SUM(calories) AS kcal, COUNT(*) AS cnt
                FROM entries
                WHERE date BETWEEN ? AND ?
                GROUP BY date, meal_type
                """,
                (start_date.isoformat(), end_date.isoformat()),
            ).fetchall()

        by_date: dict[str, dict[str, Any]] = {}
        for i in range(days):
            d = (start_date + timedelta(days=i)).isoformat()
            by_date[d] = {
                "date": d,
                "total_calories": 0.0,
                "entry_count": 0,
                "meal_totals": {m: 0.0 for m in VALID_MEALS},
            }

        for row in rows:
            d = row["date"]
            meal = row["meal_type"]
            kcal = round(float(row["kcal"] or 0), 1)
            cnt = int(row["cnt"] or 0)
            if d in by_date and meal in VALID_MEALS:
                by_date[d]["meal_totals"][meal] = kcal
                by_date[d]["total_calories"] = round(
                    by_date[d]["total_calories"] + kcal, 1
                )
                by_date[d]["entry_count"] += cnt

        return list(by_date.values())

    def export_csv(self, date_str: str | None = None) -> bytes:
        with self._lock, self._connect() as conn:
            if date_str:
                rows = conn.execute(
                    "SELECT date, meal_type, food_name, portion, calories, protein, carbs, fat, estimation_source, notes, created_at FROM entries WHERE date = ? ORDER BY date DESC, id ASC",
                    (date_str,),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT date, meal_type, food_name, portion, calories, protein, carbs, fat, estimation_source, notes, created_at FROM entries ORDER BY date DESC, id ASC"
                ).fetchall()

        meal_labels = {
            "breakfast": "早餐",
            "lunch": "午餐",
            "dinner": "晚餐",
            "snack": "點心",
        }
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(
            [
                "日期",
                "餐別",
                "食物名稱",
                "份量",
                "熱量(kcal)",
                "蛋白質(g)",
                "碳水化合物(g)",
                "脂肪(g)",
                "估算來源",
                "備註",
                "建立時間",
            ]
        )
        for row in rows:
            writer.writerow(
                [
                    row["date"],
                    meal_labels.get(row["meal_type"], row["meal_type"]),
                    row["food_name"],
                    row["portion"],
                    row["calories"],
                    row["protein"],
                    row["carbs"],
                    row["fat"],
                    row["estimation_source"],
                    row["notes"],
                    row["created_at"],
                ]
            )
        return ("\ufeff" + buf.getvalue()).encode("utf-8")


def analyze_photo_with_gemini(
    api_key: str,
    model: str,
    image_data: str,
    hint_name: str = "",
    hint_portion: str = "",
    meal_type: str = "",
) -> dict[str, Any]:
    """Call Gemini REST API to recognize food items and estimate calories from a photo."""
    match = re.match(r"^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$", image_data, re.DOTALL)
    if not match:
        raise ValueError("照片格式無效，請上傳 PNG/JPEG/WEBP 圖片")

    mime_type = match.group(1)
    b64_data = match.group(2)
    # Validate base64 cleanly
    base64.b64decode(b64_data, validate=True)

    meal_zh = {
        "breakfast": "早餐",
        "lunch": "午餐",
        "dinner": "晚餐",
        "snack": "點心",
    }.get(meal_type, "")

    prompt = (
        "你是專業營養師與食物熱量估算助手。請辨識這張食物照片中的所有餐點或食物，"
        "使用繁體中文回答，並估算每項食物的份量、熱量(大卡 kcal)、蛋白質(g)、碳水化合物(g)與脂肪(g)。\n"
    )
    if meal_zh:
        prompt += f"餐別參考：{meal_zh}\n"
    if hint_name:
        prompt += f"使用者提供的食物名稱線索：{hint_name}\n"
    if hint_portion:
        prompt += f"使用者提供的份量線索：{hint_portion}\n"
    prompt += (
        "請只回傳純 JSON，格式為：\n"
        '{"summary": "整體餐點簡短說明", "items": [{"name": "食物名稱", "portion": "估計份量(如1碗/150g)", '
        '"calories": 350, "protein": 18, "carbs": 42, "fat": 12, "note": "估算依據"}]}'
    )

    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    safe_model = urllib.parse.quote(model, safe="-.")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{safe_model}:generateContent?key={urllib.parse.quote(api_key, safe='')}"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw_resp = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini API 回應錯誤 ({exc.code})：{detail[:300]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"無法連線至 Gemini API：{exc.reason}") from exc

    candidates = raw_resp.get("candidates") or []
    if not candidates:
        raise RuntimeError("Gemini API 未回傳辨識結果")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join(part.get("text", "") for part in parts).strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.DOTALL).strip()

    parsed = json.loads(text)
    items = []
    for item in parsed.get("items", []):
        items.append(
            {
                "name": str(item.get("name", "未命名食物")).strip(),
                "portion": str(item.get("portion", "1份")).strip() or "1份",
                "calories": max(0.0, round(float(item.get("calories", 0) or 0), 1)),
                "protein": max(0.0, round(float(item.get("protein", 0) or 0), 1)),
                "carbs": max(0.0, round(float(item.get("carbs", 0) or 0), 1)),
                "fat": max(0.0, round(float(item.get("fat", 0) or 0), 1)),
                "note": str(item.get("note", "")).strip(),
            }
        )

    return {
        "ai_available": True,
        "summary": str(parsed.get("summary", "")).strip(),
        "items": items,
    }


def make_handler(store: CalorieStore, public_dir: Path = PUBLIC_DIR):
    """Create an HTTP request handler bound to a CalorieStore instance."""

    class CalorieRequestHandler(BaseHTTPRequestHandler):
        server_version = "DailyCalorieTracker/1.0"

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
            # Keep server output concise
            return

        def _send_json(self, status: int, data: Any) -> None:
            payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(payload)

        def _read_json_body(self) -> dict[str, Any]:
            length = int(self.headers.get("Content-Length", "0") or "0")
            if length > 4_000_000:
                raise ValueError("請求內容過大")
            raw = self.rfile.read(length) if length > 0 else b"{}"
            try:
                data = json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError as exc:
                raise ValueError("JSON 格式錯誤") from exc
            if not isinstance(data, dict):
                raise ValueError("JSON 必須為物件")
            return data

        def _serve_static(self, req_path: str) -> None:
            rel = "index.html" if req_path in ("", "/") else req_path.lstrip("/")
            target = (public_dir / rel).resolve()
            root = public_dir.resolve()
            if not str(target).startswith(str(root)) or not target.is_file():
                self._send_json(HTTPStatus.NOT_FOUND, {"error": "找不到資源"})
                return

            mime, _ = mimetypes.guess_type(str(target))
            content = target.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header(
                "Content-Type",
                f"{mime or 'application/octet-stream'}; charset=utf-8"
                if (mime or "").startswith(("text/", "application/javascript"))
                else (mime or "application/octet-stream"),
            )
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)

        def do_GET(self) -> None:  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            query = urllib.parse.parse_qs(parsed.query)

            if path == "/api/health":
                settings = store.get_settings()
                self._send_json(
                    HTTPStatus.OK,
                    {"ok": True, "has_ai_key": settings["has_api_key"]},
                )
                return

            if path == "/api/entries":
                date_str = (
                    query.get("date", [datetime.now().strftime("%Y-%m-%d")])[0]
                ).strip()
                if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date_str):
                    self._send_json(
                        HTTPStatus.BAD_REQUEST, {"error": "日期格式必須為 YYYY-MM-DD"}
                    )
                    return
                self._send_json(HTTPStatus.OK, store.get_day_summary(date_str))
                return

            if path == "/api/history":
                end_date = (
                    query.get("end_date", [datetime.now().strftime("%Y-%m-%d")])[0]
                ).strip()
                days_raw = query.get("days", ["7"])[0]
                try:
                    datetime.strptime(end_date, "%Y-%m-%d")
                    days = int(days_raw)
                except ValueError:
                    self._send_json(HTTPStatus.BAD_REQUEST, {"error": "參數格式錯誤"})
                    return
                self._send_json(
                    HTTPStatus.OK,
                    {
                        "end_date": end_date,
                        "days": store.get_history(end_date, days),
                        "daily_goal": store.get_settings()["daily_goal"],
                    },
                )
                return

            if path == "/api/settings":
                self._send_json(HTTPStatus.OK, store.get_settings())
                return

            if path == "/api/export":
                date_str = query.get("date", [None])[0]
                csv_bytes = store.export_csv(date_str)
                filename = (
                    f"diet-calories-{date_str}.csv"
                    if date_str
                    else "diet-calories-all.csv"
                )
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "text/csv; charset=utf-8")
                self.send_header(
                    "Content-Disposition", f'attachment; filename="{filename}"'
                )
                self.send_header("Content-Length", str(len(csv_bytes)))
                self.end_headers()
                self.wfile.write(csv_bytes)
                return

            if path in ("/download/html", "/download/zip"):
                target = (
                    DIST_DIR / "CalorieNote-網頁試用版.html"
                    if path == "/download/html"
                    else DIST_DIR / "CalorieNote-網頁試用版.zip"
                )
                if not target.is_file():
                    self._send_json(HTTPStatus.NOT_FOUND, {"error": "尚未產生下載檔案"})
                    return
                content = target.read_bytes()
                ctype = "text/html; charset=utf-8" if path == "/download/html" else "application/zip"
                ascii_name = "CalorieNote-standalone.html" if path == "/download/html" else "CalorieNote-web.zip"
                utf8_name = urllib.parse.quote(target.name)
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", ctype)
                self.send_header(
                    "Content-Disposition",
                    f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{utf8_name}",
                )
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

            if path.startswith("/api/"):
                self._send_json(HTTPStatus.NOT_FOUND, {"error": "找不到 API 路徑"})
                return

            self._serve_static(path)

        def do_POST(self) -> None:  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            try:
                body = self._read_json_body()
            except ValueError as exc:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return

            if path == "/api/entries":
                try:
                    created = store.create_entry(body)
                except ValueError as exc:
                    self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                    return
                self._send_json(HTTPStatus.CREATED, created)
                return

            if path == "/api/analyze-photo":
                image_data = str(body.get("image_data", "") or "")
                if not image_data:
                    self._send_json(
                        HTTPStatus.BAD_REQUEST, {"error": "請先上傳食物照片"}
                    )
                    return

                api_key, model = store.get_active_api_key()
                if not api_key:
                    self._send_json(
                        HTTPStatus.OK,
                        {
                            "ai_available": False,
                            "message": "尚未設定 Gemini API Key，將使用內建快速食物庫與智慧份量估算。",
                        },
                    )
                    return

                try:
                    result = analyze_photo_with_gemini(
                        api_key=api_key,
                        model=model,
                        image_data=image_data,
                        hint_name=str(body.get("hint_name", "") or ""),
                        hint_portion=str(body.get("hint_portion", "") or ""),
                        meal_type=str(body.get("meal_type", "") or ""),
                    )
                except ValueError as exc:
                    self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                    return
                except Exception as exc:  # noqa: BLE001
                    self._send_json(HTTPStatus.BAD_GATEWAY, {"error": str(exc)})
                    return

                self._send_json(HTTPStatus.OK, result)
                return

            self._send_json(HTTPStatus.NOT_FOUND, {"error": "找不到 API 路徑"})

        def do_PUT(self) -> None:  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            path = parsed.path
            try:
                body = self._read_json_body()
            except ValueError as exc:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return

            if path == "/api/settings":
                try:
                    updated = store.update_settings(body)
                except ValueError as exc:
                    self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                    return
                self._send_json(HTTPStatus.OK, updated)
                return

            match = re.fullmatch(r"/api/entries/(\d+)", path)
            if match:
                entry_id = int(match.group(1))
                try:
                    updated = store.update_entry(entry_id, body)
                except ValueError as exc:
                    self._send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                    return
                if not updated:
                    self._send_json(HTTPStatus.NOT_FOUND, {"error": "找不到該筆紀錄"})
                    return
                self._send_json(HTTPStatus.OK, updated)
                return

            self._send_json(HTTPStatus.NOT_FOUND, {"error": "找不到 API 路徑"})

        def do_DELETE(self) -> None:  # noqa: N802
            parsed = urllib.parse.urlparse(self.path)
            match = re.fullmatch(r"/api/entries/(\d+)", parsed.path)
            if not match:
                self._send_json(HTTPStatus.NOT_FOUND, {"error": "找不到 API 路徑"})
                return
            entry_id = int(match.group(1))
            if not store.delete_entry(entry_id):
                self._send_json(HTTPStatus.NOT_FOUND, {"error": "找不到該筆紀錄"})
                return
            self._send_json(HTTPStatus.OK, {"deleted": entry_id})

    return CalorieRequestHandler


def create_server(
    host: str = "127.0.0.1",
    port: int = 8765,
    db_path: Path | None = None,
    public_dir: Path = PUBLIC_DIR,
) -> ThreadingHTTPServer:
    store = CalorieStore(db_path or (DEFAULT_DATA_DIR / "calories.db"))
    return ThreadingHTTPServer((host, port), make_handler(store, public_dir))


def main() -> None:
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8765"))
    server = create_server(host=host, port=port)
    print(f"Daily Calorie Tracker running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
