// 雙模式資料層：有後端時走 /api/*，純網頁/單檔開啟時自動切換為瀏覽器 IndexedDB 本地儲存

const VALID_MEALS = ["breakfast", "lunch", "dinner", "snack"];
const SETTINGS_KEY = "calorienote_settings_v1";
const FALLBACK_ENTRIES_KEY = "calorienote_entries_v1";
const DB_NAME = "CalorieNoteDB";
const DB_VERSION = 1;
const STORE_NAME = "entries";

function getDefaultSettings() {
  return {
    daily_goal: 2000,
    gemini_model: "gemini-2.5-flash",
    gemini_api_key: "",
  };
}

function readLocalSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return getDefaultSettings();
    return { ...getDefaultSettings(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSettings();
  }
}

function writeLocalSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function maskApiKey(key) {
  if (!key) return "";
  return key.length > 10 ? `${key.slice(0, 4)}...${key.slice(-4)}` : "****";
}

function openIdb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("date", "date", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("無法開啟 IndexedDB"));
  });
}

async function idbGetAll() {
  try {
    const db = await openIdb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      return JSON.parse(localStorage.getItem(FALLBACK_ENTRIES_KEY) || "[]");
    } catch {
      return [];
    }
  }
}

async function idbPut(record, isNew = false) {
  try {
    const db = await openIdb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = isNew ? store.add(record) : store.put(record);
      req.onsuccess = () => resolve({ ...record, id: req.result });
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = JSON.parse(localStorage.getItem(FALLBACK_ENTRIES_KEY) || "[]");
    if (isNew) {
      const nextId = list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
      const created = { ...record, id: nextId };
      list.push(created);
      localStorage.setItem(FALLBACK_ENTRIES_KEY, JSON.stringify(list));
      return created;
    }
    const idx = list.findIndex((x) => x.id === record.id);
    if (idx >= 0) list[idx] = record;
    localStorage.setItem(FALLBACK_ENTRIES_KEY, JSON.stringify(list));
    return record;
  }
}

async function idbDelete(id) {
  try {
    const db = await openIdb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const req = tx.objectStore(STORE_NAME).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = JSON.parse(localStorage.getItem(FALLBACK_ENTRIES_KEY) || "[]");
    localStorage.setItem(
      FALLBACK_ENTRIES_KEY,
      JSON.stringify(list.filter((x) => x.id !== id))
    );
  }
}

function validateEntryPayload(payload) {
  const date = String(payload.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("日期格式必須為 YYYY-MM-DD");
  }
  const meal_type = String(payload.meal_type || "").trim().toLowerCase();
  if (!VALID_MEALS.includes(meal_type)) {
    throw new Error("餐別必須為 breakfast、lunch、dinner 或 snack");
  }
  const food_name = String(payload.food_name || "").trim();
  if (!food_name) {
    throw new Error("請輸入食物名稱");
  }
  const calories = Math.round((Number(payload.calories) || 0) * 10) / 10;
  const protein = Math.round((Number(payload.protein) || 0) * 10) / 10;
  const carbs = Math.round((Number(payload.carbs) || 0) * 10) / 10;
  const fat = Math.round((Number(payload.fat) || 0) * 10) / 10;
  if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
    throw new Error("熱量與營養素不可為負數");
  }
  return {
    date,
    meal_type,
    food_name,
    portion: String(payload.portion || "1份").trim() || "1份",
    calories,
    protein,
    carbs,
    fat,
    estimation_source: String(payload.estimation_source || "manual").trim() || "manual",
    notes: String(payload.notes || "").trim(),
    photo_data: String(payload.photo_data || ""),
  };
}

function shiftIsoDate(dateStr, delta) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, "0");
  const nd = String(dt.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

async function httpJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `請求失敗 (${res.status})`);
  return data;
}

export async function createStorageAdapter() {
  let useServerApi = false;
  if (typeof window !== "undefined" && window.location.protocol.startsWith("http")) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 900);
      const res = await fetch("/api/health", { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) useServerApi = true;
    } catch {
      useServerApi = false;
    }
  }

  return {
    mode: useServerApi ? "server" : "browser",

    async getSettings() {
      if (useServerApi) return httpJson("/api/settings");
      const raw = readLocalSettings();
      return {
        daily_goal: Number(raw.daily_goal) || 2000,
        gemini_model: raw.gemini_model || "gemini-2.5-flash",
        has_api_key: Boolean(raw.gemini_api_key),
        api_key_source: raw.gemini_api_key ? "browser" : "none",
        api_key_masked: maskApiKey(raw.gemini_api_key),
      };
    },

    async updateSettings(payload) {
      if (useServerApi) {
        return httpJson("/api/settings", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      const cur = readLocalSettings();
      if ("daily_goal" in payload) {
        const goal = Math.round(Number(payload.daily_goal));
        if (Number.isNaN(goal) || goal < 500 || goal > 10000) {
          throw new Error("每日目標熱量需介於 500 至 10000 大卡之間");
        }
        cur.daily_goal = goal;
      }
      if ("gemini_model" in payload && String(payload.gemini_model).trim()) {
        cur.gemini_model = String(payload.gemini_model).trim();
      }
      if ("gemini_api_key" in payload) {
        const keyVal = String(payload.gemini_api_key || "").trim();
        if (keyVal === "__CLEAR__") cur.gemini_api_key = "";
        else if (keyVal) cur.gemini_api_key = keyVal;
      }
      writeLocalSettings(cur);
      return this.getSettings();
    },

    async getDaySummary(dateStr) {
      if (useServerApi) {
        return httpJson(`/api/entries?date=${encodeURIComponent(dateStr)}`);
      }
      const all = await idbGetAll();
      const entries = all
        .filter((x) => x.date === dateStr)
        .sort((a, b) => Number(b.id) - Number(a.id));

      const meal_totals = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
      const meal_counts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;

      for (const item of entries) {
        const k = Number(item.calories) || 0;
        if (item.meal_type in meal_totals) {
          meal_totals[item.meal_type] = Math.round((meal_totals[item.meal_type] + k) * 10) / 10;
          meal_counts[item.meal_type] += 1;
        }
        calories += k;
        protein += Number(item.protein) || 0;
        carbs += Number(item.carbs) || 0;
        fat += Number(item.fat) || 0;
      }

      const settings = await this.getSettings();
      return {
        date: dateStr,
        daily_goal: settings.daily_goal,
        entries,
        meal_totals,
        meal_counts,
        totals: {
          calories: Math.round(calories * 10) / 10,
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
        },
      };
    },

    async getHistory(endDateStr, days = 7) {
      if (useServerApi) {
        return httpJson(
          `/api/history?end_date=${encodeURIComponent(endDateStr)}&days=${days}`
        );
      }
      const all = await idbGetAll();
      const settings = await this.getSettings();
      const map = {};
      const list = [];
      for (let i = days - 1; i >= 0; i -= 1) {
        const d = shiftIsoDate(endDateStr, -i);
        const slot = {
          date: d,
          total_calories: 0,
          entry_count: 0,
          meal_totals: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
        };
        map[d] = slot;
        list.push(slot);
      }
      for (const item of all) {
        const slot = map[item.date];
        if (!slot) continue;
        const k = Number(item.calories) || 0;
        if (item.meal_type in slot.meal_totals) {
          slot.meal_totals[item.meal_type] =
            Math.round((slot.meal_totals[item.meal_type] + k) * 10) / 10;
        }
        slot.total_calories = Math.round((slot.total_calories + k) * 10) / 10;
        slot.entry_count += 1;
      }
      return { end_date: endDateStr, days: list, daily_goal: settings.daily_goal };
    },

    async createEntry(payload) {
      if (useServerApi) {
        return httpJson("/api/entries", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      const clean = validateEntryPayload(payload);
      clean.created_at = new Date().toISOString().slice(0, 19);
      return idbPut(clean, true);
    },

    async updateEntry(id, payload) {
      if (useServerApi) {
        return httpJson(`/api/entries/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      const clean = validateEntryPayload(payload);
      clean.id = id;
      clean.created_at = payload.created_at || new Date().toISOString().slice(0, 19);
      return idbPut(clean, false);
    },

    async deleteEntry(id) {
      if (useServerApi) {
        return httpJson(`/api/entries/${id}`, { method: "DELETE" });
      }
      await idbDelete(id);
      return { deleted: id };
    },

    async analyzePhoto({ image_data, hint_name = "", hint_portion = "", meal_type = "" }) {
      if (useServerApi) {
        return httpJson("/api/analyze-photo", {
          method: "POST",
          body: JSON.stringify({ image_data, hint_name, hint_portion, meal_type }),
        });
      }

      const raw = readLocalSettings();
      const apiKey = String(raw.gemini_api_key || "").trim();
      const model = String(raw.gemini_model || "gemini-2.5-flash").trim();
      if (!apiKey) {
        return {
          ai_available: false,
          message: "尚未設定 Gemini API Key，將使用內建食物庫與智慧份量估算。",
        };
      }

      const match = String(image_data || "").match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
      );
      if (!match) {
        throw new Error("照片格式無效，請上傳 PNG/JPEG/WEBP 圖片");
      }

      const mealZh =
        { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "點心" }[meal_type] || "";
      let prompt =
        "你是專業營養師與食物熱量估算助手。請辨識這張食物照片中的所有餐點或食物，使用繁體中文回答，並估算每項食物的份量、熱量(大卡 kcal)、蛋白質(g)、碳水化合物(g)與脂肪(g)。\n";
      if (mealZh) prompt += `餐別參考：${mealZh}\n`;
      if (hint_name) prompt += `使用者提供的食物名稱線索：${hint_name}\n`;
      if (hint_portion) prompt += `使用者提供的份量線索：${hint_portion}\n`;
      prompt +=
        '請只回傳純 JSON，格式為：{"summary":"整體餐點簡短說明","items":[{"name":"食物名稱","portion":"估計份量","calories":350,"protein":18,"carbs":42,"fat":12,"note":"估算依據"}]}';

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: match[1], data: match[2] } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      });

      const rawResp = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(rawResp?.error?.message || `Gemini API 錯誤 (${res.status})`);
      }

      const parts = rawResp?.candidates?.[0]?.content?.parts || [];
      let text = parts.map((p) => p.text || "").join("").trim();
      text = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      const parsed = JSON.parse(text);
      const items = (parsed.items || []).map((item) => ({
        name: String(item.name || "未命名食物").trim(),
        portion: String(item.portion || "1份").trim() || "1份",
        calories: Math.max(0, Math.round((Number(item.calories) || 0) * 10) / 10),
        protein: Math.max(0, Math.round((Number(item.protein) || 0) * 10) / 10),
        carbs: Math.max(0, Math.round((Number(item.carbs) || 0) * 10) / 10),
        fat: Math.max(0, Math.round((Number(item.fat) || 0) * 10) / 10),
        note: String(item.note || "").trim(),
      }));

      return {
        ai_available: true,
        summary: String(parsed.summary || "").trim(),
        items,
      };
    },

    async exportCsv(dateStr) {
      if (useServerApi) {
        window.location.href = `/api/export?date=${encodeURIComponent(dateStr)}`;
        return;
      }
      const all = await idbGetAll();
      const rows = dateStr ? all.filter((x) => x.date === dateStr) : all;
      const mealLabels = {
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
        snack: "點心",
      };
      const csvEscape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
      const lines = [
        ["日期", "餐別", "食物名稱", "份量", "熱量(kcal)", "蛋白質(g)", "碳水化合物(g)", "脂肪(g)", "估算來源", "備註", "建立時間"]
          .map(csvEscape)
          .join(","),
      ];
      for (const r of rows) {
        lines.push(
          [
            r.date,
            mealLabels[r.meal_type] || r.meal_type,
            r.food_name,
            r.portion,
            r.calories,
            r.protein,
            r.carbs,
            r.fat,
            r.estimation_source,
            r.notes,
            r.created_at || "",
          ]
            .map(csvEscape)
            .join(",")
        );
      }
      const blob = new Blob(["\ufeff" + lines.join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = dateStr ? `diet-calories-${dateStr}.csv` : "diet-calories-all.csv";
      a.click();
      URL.revokeObjectURL(url);
    },

    async seedSampleDay(dateStr) {
      const samples = [
        {
          date: dateStr,
          meal_type: "breakfast",
          food_name: "原味蛋餅",
          portion: "1份",
          calories: 260,
          protein: 9,
          carbs: 30,
          fat: 11,
          estimation_source: "database",
          notes: "範例早餐",
        },
        {
          date: dateStr,
          meal_type: "breakfast",
          food_name: "無糖豆漿",
          portion: "1杯(350ml)",
          calories: 110,
          protein: 11,
          carbs: 6,
          fat: 4.5,
          estimation_source: "database",
          notes: "",
        },
        {
          date: dateStr,
          meal_type: "lunch",
          food_name: "滷雞腿便當",
          portion: "1份",
          calories: 780,
          protein: 35,
          carbs: 95,
          fat: 28,
          estimation_source: "database",
          notes: "範例午餐",
        },
        {
          date: dateStr,
          meal_type: "dinner",
          food_name: "舒肥雞胸肉",
          portion: "1份(150g)",
          calories: 165,
          protein: 33,
          carbs: 1,
          fat: 3,
          estimation_source: "database",
          notes: "範例晚餐",
        },
        {
          date: dateStr,
          meal_type: "dinner",
          food_name: "燙青菜(少油)",
          portion: "1盤",
          calories: 85,
          protein: 3,
          carbs: 8,
          fat: 4.5,
          estimation_source: "database",
          notes: "",
        },
        {
          date: dateStr,
          meal_type: "snack",
          food_name: "蘋果",
          portion: "1顆",
          calories: 85,
          protein: 0.5,
          carbs: 22,
          fat: 0.3,
          estimation_source: "database",
          notes: "範例點心",
        },
      ];
      for (const s of samples) {
        await this.createEntry(s);
      }
    },
  };
}
