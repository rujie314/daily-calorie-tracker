"""Automated tests for Daily Calorie Tracker server, SQLite store, and HTTP API."""

from __future__ import annotations

import json
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_DIR))

from server import CalorieStore, create_server  # noqa: E402


class TestCalorieTrackerAPI(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmp.name) / "test_calories.db"
        self.server = create_server(host="127.0.0.1", port=0, db_path=self.db_path)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.tmp.cleanup()

    def _request(self, path: str, method: str = "GET", body: dict | None = None):
        url = f"http://127.0.0.1:{self.port}{path}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"Content-Type": "application/json"} if body is not None else {}
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, resp.headers, resp.read()

    def test_crud_and_meal_daily_totals(self) -> None:
        # 1. Create entries across all 4 meals
        samples = [
            {
                "date": "2026-11-25",
                "meal_type": "breakfast",
                "food_name": "原味蛋餅",
                "portion": "1份",
                "calories": 260,
                "protein": 9,
                "carbs": 30,
                "fat": 11,
                "estimation_source": "database",
                "photo_data": "data:image/jpeg;base64,ZmFrZQ==",
            },
            {
                "date": "2026-11-25",
                "meal_type": "lunch",
                "food_name": "滷雞腿便當",
                "portion": "1份",
                "calories": 780,
                "protein": 35,
                "carbs": 95,
                "fat": 28,
                "estimation_source": "database",
            },
            {
                "date": "2026-11-25",
                "meal_type": "dinner",
                "food_name": "舒肥雞胸肉",
                "portion": "1份(150g)",
                "calories": 165,
                "protein": 33,
                "carbs": 1,
                "fat": 3,
                "estimation_source": "database",
            },
            {
                "date": "2026-11-25",
                "meal_type": "snack",
                "food_name": "蘋果",
                "portion": "1顆",
                "calories": 85,
                "protein": 0.5,
                "carbs": 22,
                "fat": 0.3,
                "estimation_source": "database",
            },
        ]

        created_ids = []
        for sample in samples:
            status, _, raw = self._request("/api/entries", method="POST", body=sample)
            self.assertEqual(status, 201)
            created_ids.append(json.loads(raw)["id"])

        # 2. Verify per-meal totals and full-day total
        status, _, raw = self._request("/api/entries?date=2026-11-25")
        self.assertEqual(status, 200)
        summary = json.loads(raw)
        self.assertEqual(summary["meal_totals"]["breakfast"], 260.0)
        self.assertEqual(summary["meal_totals"]["lunch"], 780.0)
        self.assertEqual(summary["meal_totals"]["dinner"], 165.0)
        self.assertEqual(summary["meal_totals"]["snack"], 85.0)
        self.assertEqual(summary["totals"]["calories"], 1290.0)
        self.assertEqual(len(summary["entries"]), 4)

        # 3. Update snack entry and check recalculated totals
        status, _, raw = self._request(
            f"/api/entries/{created_ids[-1]}",
            method="PUT",
            body={
                "date": "2026-11-25",
                "meal_type": "snack",
                "food_name": "蘋果",
                "portion": "2顆",
                "calories": 170,
                "protein": 1,
                "carbs": 44,
                "fat": 0.6,
            },
        )
        self.assertEqual(status, 200)
        _, _, raw = self._request("/api/entries?date=2026-11-25")
        updated_summary = json.loads(raw)
        self.assertEqual(updated_summary["meal_totals"]["snack"], 170.0)
        self.assertEqual(updated_summary["totals"]["calories"], 1375.0)

        # 4. Verify 7-day history endpoint
        status, _, raw = self._request("/api/history?end_date=2026-11-25&days=7")
        self.assertEqual(status, 200)
        history = json.loads(raw)
        self.assertEqual(len(history["days"]), 7)
        self.assertEqual(history["days"][-1]["total_calories"], 1375.0)

        # 5. Verify CSV export
        status, headers, raw = self._request("/api/export?date=2026-11-25")
        self.assertEqual(status, 200)
        self.assertIn("text/csv", headers.get("Content-Type", ""))
        csv_text = raw.decode("utf-8-sig")
        self.assertIn("滷雞腿便當", csv_text)

        # 6. Delete entry
        status, _, _ = self._request(f"/api/entries/{created_ids[0]}", method="DELETE")
        self.assertEqual(status, 200)
        _, _, raw = self._request("/api/entries?date=2026-11-25")
        after_delete = json.loads(raw)
        self.assertEqual(after_delete["meal_totals"]["breakfast"], 0.0)
        self.assertEqual(after_delete["totals"]["calories"], 1115.0)

    def test_settings_and_photo_fallback(self) -> None:
        status, _, raw = self._request(
            "/api/settings", method="PUT", body={"daily_goal": 1850}
        )
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(raw)["daily_goal"], 1850)

        # Without API key, /api/analyze-photo returns ai_available=False cleanly
        status, _, raw = self._request(
            "/api/analyze-photo",
            method="POST",
            body={"image_data": "data:image/jpeg;base64,ZmFrZQ=="},
        )
        self.assertEqual(status, 200)
        self.assertFalse(json.loads(raw)["ai_available"])

    def test_static_files_and_validation(self) -> None:
        status, _, raw = self._request("/")
        self.assertEqual(status, 200)
        self.assertIn("CalorieNote", raw.decode("utf-8"))

        with self.assertRaises(urllib.error.HTTPError) as ctx:
            self._request(
                "/api/entries",
                method="POST",
                body={
                    "date": "2026-11-25",
                    "meal_type": "invalid_meal",
                    "food_name": "測試",
                    "calories": 100,
                },
            )
        self.assertEqual(ctx.exception.code, 400)
        ctx.exception.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
