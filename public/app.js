import {
  MEAL_META,
  QUICK_PRESETS_BY_MEAL,
  searchFoods,
  estimateFoodCalories,
  extractHintFromFilename,
} from "./food-db.js";
import { createStorageAdapter } from "./storage.js";

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];
const RING_CIRCUMFERENCE = 2 * Math.PI * 58; // r=58 -> 364.42
let storage = null;

const state = {
  currentDate: getLocalToday(),
  selectedMeal: guessMealByHour(),
  editingId: null,
  manualCaloriesOverride: false,
  estimationSource: "manual",
  photoData: "",
  photoFilename: "",
  settings: {
    daily_goal: 2000,
    gemini_model: "gemini-2.5-flash",
    has_api_key: false,
    api_key_masked: "",
  },
  dayData: null,
  historyData: null,
};

const els = {
  datePicker: document.getElementById("date-picker"),
  prevDayBtn: document.getElementById("prev-day-btn"),
  nextDayBtn: document.getElementById("next-day-btn"),
  todayBtn: document.getElementById("today-btn"),
  loadSampleBtn: document.getElementById("load-sample-btn"),
  exportCsvBtn: document.getElementById("export-csv-btn"),
  openSettingsBtn: document.getElementById("open-settings-btn"),

  // Dashboard
  ringFill: document.getElementById("calorie-ring-fill"),
  dailyTotalKcal: document.getElementById("daily-total-kcal"),
  dailyGoalKcal: document.getElementById("daily-goal-kcal"),
  remainingBadge: document.getElementById("remaining-badge"),
  dailyProtein: document.getElementById("daily-protein"),
  dailyCarbs: document.getElementById("daily-carbs"),
  dailyFat: document.getElementById("daily-fat"),
  trendChart: document.getElementById("trend-chart"),
  trendAvgLabel: document.getElementById("trend-avg-label"),

  // Form
  formTitle: document.getElementById("form-title"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  foodForm: document.getElementById("food-form"),
  mealTabs: document.querySelectorAll(".meal-tab"),
  aiStatusPill: document.getElementById("ai-status-pill"),
  photoDropzone: document.getElementById("photo-dropzone"),
  photoInput: document.getElementById("photo-input"),
  dropzoneEmpty: document.getElementById("dropzone-empty"),
  dropzonePreview: document.getElementById("dropzone-preview"),
  photoPreviewImg: document.getElementById("photo-preview-img"),
  analyzePhotoBtn: document.getElementById("analyze-photo-btn"),
  removePhotoBtn: document.getElementById("remove-photo-btn"),
  aiResultsBox: document.getElementById("ai-results-box"),

  foodNameInput: document.getElementById("food-name-input"),
  autocompleteList: document.getElementById("autocomplete-list"),
  quickFoodChips: document.getElementById("quick-food-chips"),
  portionInput: document.getElementById("portion-input"),
  unitSuggestionHint: document.getElementById("unit-suggestion-hint"),
  estimateSourceBadge: document.getElementById("estimate-source-badge"),
  estimateNote: document.getElementById("estimate-note"),
  reEstimateBtn: document.getElementById("re-estimate-btn"),
  caloriesInput: document.getElementById("calories-input"),
  proteinInput: document.getElementById("protein-input"),
  carbsInput: document.getElementById("carbs-input"),
  fatInput: document.getElementById("fat-input"),
  notesInput: document.getElementById("notes-input"),
  submitEntryBtn: document.getElementById("submit-entry-btn"),

  // Meals list
  mealsStack: document.getElementById("meals-stack"),
  footerBreakdown: document.getElementById("footer-breakdown"),
  footerTotalKcal: document.getElementById("footer-total-kcal"),

  // Settings modal
  settingsModal: document.getElementById("settings-modal"),
  closeSettingsBtn: document.getElementById("close-settings-btn"),
  settingsForm: document.getElementById("settings-form"),
  settingDailyGoal: document.getElementById("setting-daily-goal"),
  settingGeminiKey: document.getElementById("setting-gemini-key"),
  settingGeminiModel: document.getElementById("setting-gemini-model"),
  settingKeyStatus: document.getElementById("setting-key-status"),
  clearApiKeyBtn: document.getElementById("clear-api-key-btn"),
  tdeeGender: document.getElementById("tdee-gender"),
  tdeeAge: document.getElementById("tdee-age"),
  tdeeHeight: document.getElementById("tdee-height"),
  tdeeWeight: document.getElementById("tdee-weight"),
  tdeeActivity: document.getElementById("tdee-activity"),
  tdeeGoalMode: document.getElementById("tdee-goal-mode"),
  tdeePreviewText: document.getElementById("tdee-preview-text"),
  applyTdeeBtn: document.getElementById("apply-tdee-btn"),

  // Lightbox
  photoModal: document.getElementById("photo-modal"),
  closePhotoModalBtn: document.getElementById("close-photo-modal-btn"),
  lightboxImg: document.getElementById("lightbox-img"),
  lightboxCaption: document.getElementById("lightbox-caption"),

  toastContainer: document.getElementById("toast-container"),
};

function getLocalToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDate(dateStr, deltaDays) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  const ny = dt.getFullYear();
  const nm = String(dt.getMonth() + 1).padStart(2, "0");
  const nd = String(dt.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

function guessMealByHour() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "breakfast";
  if (h >= 11 && h < 14) return "lunch";
  if (h >= 17 && h < 21) return "dinner";
  return "snack";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatNumber(n) {
  return Math.round(Number(n) || 0).toLocaleString("zh-TW");
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? "error" : ""}`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// === 初始化與資料載入 ===
async function init() {
  storage = await createStorageAdapter();
  els.datePicker.value = state.currentDate;
  setSelectedMeal(state.selectedMeal);
  bindEvents();
  await Promise.all([loadSettings(), loadDayAndHistory()]);
  updateTdeePreview();
}

async function loadSettings() {
  try {
    state.settings = await storage.getSettings();
    updateAiStatusBadge();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function loadDayAndHistory() {
  try {
    const [dayData, historyData] = await Promise.all([
      storage.getDaySummary(state.currentDate),
      storage.getHistory(state.currentDate, 7),
    ]);
    state.dayData = dayData;
    state.historyData = historyData;
    renderDashboard();
    renderMeals();
    renderTrendChart();
  } catch (err) {
    showToast(err.message, true);
  }
}

function updateAiStatusBadge() {
  if (state.settings.has_api_key) {
    els.aiStatusPill.textContent = "AI 照片辨識已啟用";
    els.aiStatusPill.classList.add("ready");
  } else {
    els.aiStatusPill.textContent = "內建食物庫估算";
    els.aiStatusPill.classList.remove("ready");
  }
}

// === 儀表板與圖表渲染 ===
function renderDashboard() {
  if (!state.dayData) return;
  const { totals, daily_goal: goal, meal_totals: mealTotals, meal_counts: mealCounts } = state.dayData;
  const totalKcal = totals.calories || 0;

  els.dailyTotalKcal.textContent = formatNumber(totalKcal);
  els.dailyGoalKcal.textContent = formatNumber(goal);

  const ratio = goal > 0 ? Math.min(totalKcal / goal, 1) : 0;
  const offset = RING_CIRCUMFERENCE * (1 - ratio);
  els.ringFill.style.strokeDashoffset = String(offset);
  els.ringFill.classList.toggle("over", totalKcal > goal);

  const diff = Math.round(goal - totalKcal);
  if (diff >= 0) {
    els.remainingBadge.textContent = `還可攝取 ${formatNumber(diff)} kcal`;
    els.remainingBadge.classList.remove("over");
  } else {
    els.remainingBadge.textContent = `超出目標 ${formatNumber(Math.abs(diff))} kcal`;
    els.remainingBadge.classList.add("over");
  }

  els.dailyProtein.textContent = `${totals.protein} g`;
  els.dailyCarbs.textContent = `${totals.carbs} g`;
  els.dailyFat.textContent = `${totals.fat} g`;

  for (const meal of MEAL_ORDER) {
    document.getElementById(`mini-${meal}-kcal`).textContent = `${formatNumber(mealTotals[meal] || 0)} kcal`;
    document.getElementById(`mini-${meal}-count`).textContent = `${mealCounts[meal] || 0} 項`;
  }
}

function renderTrendChart() {
  if (!state.historyData) return;
  const days = state.historyData.days || [];
  const goal = state.historyData.daily_goal || 2000;
  const maxVal = Math.max(goal * 1.15, ...days.map((d) => d.total_calories), 500);

  const activeDays = days.filter((d) => d.total_calories > 0);
  const avg = activeDays.length
    ? activeDays.reduce((s, d) => s + d.total_calories, 0) / activeDays.length
    : 0;
  els.trendAvgLabel.textContent = `有紀錄日平均 ${formatNumber(avg)} kcal`;

  els.trendChart.innerHTML = days
    .map((d) => {
      const pct = Math.min(100, Math.round((d.total_calories / maxVal) * 100));
      const label = d.date.slice(5).replace("-", "/");
      const isActive = d.date === state.currentDate;
      const isOver = d.total_calories > goal;
      return `
        <div class="trend-col ${isActive ? "active" : ""} ${isOver ? "over" : ""}" data-jump-date="${escapeHtml(d.date)}" title="${escapeHtml(d.date)}：${formatNumber(d.total_calories)} kcal">
          <span class="trend-val">${d.total_calories > 0 ? Math.round(d.total_calories) : "-"}</span>
          <div class="trend-bar-track">
            <div class="trend-bar-fill" style="height: ${pct}%"></div>
          </div>
          <span class="trend-date">${escapeHtml(label)}</span>
        </div>
      `;
    })
    .join("");
}

function renderMeals() {
  if (!state.dayData) return;
  const { entries, meal_totals: mealTotals, totals } = state.dayData;
  const dayTotal = totals.calories || 0;

  const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] };
  for (const item of entries) {
    if (grouped[item.meal_type]) grouped[item.meal_type].push(item);
  }

  const sourceLabels = {
    database: "資料庫估算",
    keyword: "智慧估算",
    ai_vision: "AI 照片辨識",
    manual: "手動輸入",
  };

  els.mealsStack.innerHTML = MEAL_ORDER.map((meal) => {
    const meta = MEAL_META[meal];
    const items = grouped[meal];
    const mealKcal = mealTotals[meal] || 0;
    const sharePct = dayTotal > 0 ? Math.round((mealKcal / dayTotal) * 100) : 0;

    const itemsHtml = items.length
      ? items
          .map((item) => {
            const thumbHtml = item.photo_data
              ? `<img src="${escapeHtml(item.photo_data)}" alt="${escapeHtml(item.food_name)}" class="food-thumb" data-lightbox-id="${item.id}" />`
              : `<div class="food-thumb-placeholder" aria-hidden="true">${meta.icon}</div>`;

            const noteText = item.notes ? ` · ${escapeHtml(item.notes)}` : "";
            return `
              <div class="food-item-row">
                <div class="food-item-left">
                  ${thumbHtml}
                  <div class="food-info">
                    <div class="food-name-line">
                      <strong>${escapeHtml(item.food_name)}</strong>
                      <span class="portion-tag">${escapeHtml(item.portion)}</span>
                      <span class="source-tag">${escapeHtml(sourceLabels[item.estimation_source] || "估算")}</span>
                    </div>
                    <div class="food-sub-line">
                      蛋 ${item.protein}g · 碳 ${item.carbs}g · 脂 ${item.fat}g${noteText}
                    </div>
                  </div>
                </div>
                <div class="food-item-right">
                  <span class="food-kcal">${formatNumber(item.calories)} kcal</span>
                  <div class="item-actions">
                    <button type="button" class="btn btn-ghost btn-xs" data-edit-id="${item.id}">編輯</button>
                    <button type="button" class="btn btn-ghost btn-xs" data-delete-id="${item.id}">刪除</button>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")
      : `<div class="meal-empty">
           <span>尚未紀錄${meta.label}飲食</span>
           <button type="button" class="btn btn-ghost btn-xs" data-add-to-meal="${meal}">＋ 新增${meta.label}</button>
         </div>`;

    return `
      <article class="card meal-card" id="meal-card-${meal}">
        <div class="meal-card-head">
          <div class="meal-title-group">
            <div class="meal-icon-box" aria-hidden="true">${meta.icon}</div>
            <div>
              <h3>${meta.label}</h3>
              <span class="muted">${items.length} 項食物 · 佔今日 ${sharePct}%</span>
            </div>
          </div>
          <div class="meal-head-right">
            <span class="meal-total-pill">${formatNumber(mealKcal)} kcal</span>
            <button type="button" class="btn btn-outline btn-xs" data-add-to-meal="${meal}">＋ 新增</button>
          </div>
        </div>
        <div class="meal-items">${itemsHtml}</div>
      </article>
    `;
  }).join("");

  els.footerBreakdown.textContent = MEAL_ORDER.map(
    (m) => `${MEAL_META[m].label} ${formatNumber(mealTotals[m] || 0)}`
  ).join(" · ");
  els.footerTotalKcal.textContent = formatNumber(dayTotal);
}

// === 表單、餐別與自動估算邏輯 ===
function setSelectedMeal(meal) {
  state.selectedMeal = meal;
  els.mealTabs.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.meal === meal);
  });
  renderQuickFoodChips();
}

function renderQuickFoodChips() {
  const presets = QUICK_PRESETS_BY_MEAL[state.selectedMeal] || [];
  els.quickFoodChips.innerHTML = presets
    .map(
      (name) =>
        `<button type="button" class="chip-btn" data-quick-food="${escapeHtml(name)}">${escapeHtml(name)}</button>`
    )
    .join("");
}

function runAutoEstimate(force = false) {
  if (state.manualCaloriesOverride && !force) return;
  const name = els.foodNameInput.value.trim();
  const portion = els.portionInput.value.trim();
  const est = estimateFoodCalories(name, portion);

  state.estimationSource = est.source;
  els.estimateSourceBadge.textContent = est.sourceLabel;
  els.estimateNote.textContent = est.note || "輸入食物名稱與份量後，系統會自動估算熱量。";
  els.unitSuggestionHint.textContent = `建議基準：${est.suggestedUnit}`;

  els.caloriesInput.value = est.calories;
  els.proteinInput.value = est.protein;
  els.carbsInput.value = est.carbs;
  els.fatInput.value = est.fat;
}

function renderAutocomplete(query) {
  const matches = searchFoods(query, 8);
  if (!matches.length || !query.trim()) {
    els.autocompleteList.classList.add("hidden");
    els.autocompleteList.innerHTML = "";
    return;
  }

  els.autocompleteList.innerHTML = matches
    .map(
      (item) => `
      <div class="autocomplete-item" data-pick-food="${escapeHtml(item.name)}" data-pick-unit="${escapeHtml(item.baseUnit)}">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <span class="autocomplete-meta"> · ${escapeHtml(item.category)}</span>
        </div>
        <span class="autocomplete-meta">${item.baseKcal} kcal / ${escapeHtml(item.baseUnit)}</span>
      </div>
    `
    )
    .join("");
  els.autocompleteList.classList.remove("hidden");
}

function resetForm() {
  state.editingId = null;
  state.manualCaloriesOverride = false;
  state.estimationSource = "manual";
  els.formTitle.textContent = "新增飲食紀錄";
  els.submitEntryBtn.textContent = "＋ 加入今日紀錄";
  els.cancelEditBtn.classList.add("hidden");
  els.foodNameInput.value = "";
  els.portionInput.value = "1份";
  els.caloriesInput.value = "0";
  els.proteinInput.value = "0";
  els.carbsInput.value = "0";
  els.fatInput.value = "0";
  els.notesInput.value = "";
  els.estimateSourceBadge.textContent = "等待輸入食物";
  els.estimateNote.textContent = "輸入食物名稱與份量後，系統會自動估算熱量。";
  clearPhoto();
}

function startEditEntry(entry) {
  state.editingId = entry.id;
  state.manualCaloriesOverride = true;
  state.estimationSource = entry.estimation_source || "manual";

  setSelectedMeal(entry.meal_type);
  els.formTitle.textContent = "編輯飲食紀錄";
  els.submitEntryBtn.textContent = "儲存修改";
  els.cancelEditBtn.classList.remove("hidden");

  els.foodNameInput.value = entry.food_name;
  els.portionInput.value = entry.portion;
  els.caloriesInput.value = entry.calories;
  els.proteinInput.value = entry.protein;
  els.carbsInput.value = entry.carbs;
  els.fatInput.value = entry.fat;
  els.notesInput.value = entry.notes || "";
  els.estimateSourceBadge.textContent = "編輯既有紀錄";
  els.estimateNote.textContent = "可直接修改熱量或點擊「重新估算」。";

  if (entry.photo_data) {
    setPhotoPreview(entry.photo_data, "已上傳照片");
  } else {
    clearPhoto();
  }

  els.entryFormCardScroll();
}

els.entryFormCardScroll = () => {
  document.querySelector(".entry-form-card").scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// === 照片壓縮與辨識 ===
async function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("讀取照片失敗"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("無法解析圖片格式"));
      img.onload = () => {
        const maxSide = 900;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          const scale = maxSide / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function setPhotoPreview(dataUrl, filename = "") {
  state.photoData = dataUrl;
  state.photoFilename = filename;
  els.photoPreviewImg.src = dataUrl;
  els.dropzoneEmpty.classList.add("hidden");
  els.dropzonePreview.classList.remove("hidden");
}

function clearPhoto() {
  state.photoData = "";
  state.photoFilename = "";
  els.photoInput.value = "";
  els.photoPreviewImg.removeAttribute("src");
  els.dropzonePreview.classList.add("hidden");
  els.dropzoneEmpty.classList.remove("hidden");
  els.aiResultsBox.classList.add("hidden");
  els.aiResultsBox.innerHTML = "";
}

async function handlePhotoSelected(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("請選擇圖片檔案（JPG / PNG / WEBP）", true);
    return;
  }
  try {
    const compressed = await compressImageFile(file);
    setPhotoPreview(compressed, file.name || "");

    const hintName = extractHintFromFilename(file.name);
    if (hintName && !els.foodNameInput.value.trim()) {
      els.foodNameInput.value = hintName;
      state.manualCaloriesOverride = false;
      runAutoEstimate(true);
    }

    if (state.settings.has_api_key) {
      await analyzeCurrentPhoto();
    } else {
      showOfflinePhotoAssistant(hintName);
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

function showOfflinePhotoAssistant(hintName = "") {
  const presets = QUICK_PRESETS_BY_MEAL[state.selectedMeal] || [];
  els.aiResultsBox.innerHTML = `
    <div>
      <strong>📷 已加入食物照片</strong>
      ${
        hintName
          ? `<p style="margin:4px 0 0;">依檔名線索已自動帶入「${escapeHtml(hintName)}」，您可直接微調份量或熱量。</p>`
          : `<p style="margin:4px 0 0;">尚未設定 Gemini API Key，請輸入食物名稱（或點選下方快速餐點）自動估算大卡；也可在右上角「目標與 AI 設定」啟用照片 AI 辨識。</p>`
      }
      <div class="quick-chips" style="margin-top:8px;">
        ${presets
          .map(
            (p) =>
              `<button type="button" class="chip-btn" data-quick-food="${escapeHtml(p)}">${escapeHtml(p)}</button>`
          )
          .join("")}
      </div>
    </div>
  `;
  els.aiResultsBox.classList.remove("hidden");
}

async function analyzeCurrentPhoto() {
  if (!state.photoData) {
    showToast("請先上傳食物照片", true);
    return;
  }

  els.analyzePhotoBtn.disabled = true;
  els.analyzePhotoBtn.textContent = "辨識中...";
  try {
    const res = await storage.analyzePhoto({
      image_data: state.photoData,
      hint_name: els.foodNameInput.value.trim(),
      hint_portion: els.portionInput.value.trim(),
      meal_type: state.selectedMeal,
    });

    if (!res.ai_available) {
      showOfflinePhotoAssistant(extractHintFromFilename(state.photoFilename));
      return;
    }

    const items = res.items || [];
    if (!items.length) {
      els.aiResultsBox.innerHTML = `<div>未能從照片辨識出明確食物，請手動輸入食物名稱估算。</div>`;
      els.aiResultsBox.classList.remove("hidden");
      return;
    }

    // Store temporarily on element for quick apply
    els.aiResultsBox._detectedItems = items;

    els.aiResultsBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <strong>✨ AI 照片辨識結果${res.summary ? `：${escapeHtml(res.summary)}` : ""}</strong>
        ${
          items.length > 1
            ? `<button type="button" class="btn btn-primary btn-xs" id="apply-all-ai-btn">全部 ${items.length} 項加入此餐</button>`
            : ""
        }
      </div>
      ${items
        .map(
          (item, idx) => `
          <div class="ai-item-row">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span class="muted"> (${escapeHtml(item.portion)}) · ${item.calories} kcal</span>
              ${item.note ? `<div class="muted">${escapeHtml(item.note)}</div>` : ""}
            </div>
            <button type="button" class="btn btn-outline btn-xs" data-apply-ai-idx="${idx}">套用</button>
          </div>
        `
        )
        .join("")}
    `;
    els.aiResultsBox.classList.remove("hidden");

    // If only 1 item detected, auto-fill immediately for speed
    if (items.length === 1) {
      applyAiItemToForm(items[0]);
    }
  } catch (err) {
    showToast(err.message, true);
  } finally {
    els.analyzePhotoBtn.disabled = false;
    els.analyzePhotoBtn.textContent = "✨ 照片估算熱量";
  }
}

function applyAiItemToForm(item) {
  state.manualCaloriesOverride = true;
  state.estimationSource = "ai_vision";
  els.foodNameInput.value = item.name;
  els.portionInput.value = item.portion;
  els.caloriesInput.value = item.calories;
  els.proteinInput.value = item.protein;
  els.carbsInput.value = item.carbs;
  els.fatInput.value = item.fat;
  if (item.note && !els.notesInput.value.trim()) {
    els.notesInput.value = item.note;
  }
  els.estimateSourceBadge.textContent = "AI 照片辨識";
  els.estimateNote.textContent = item.note || "已套用 AI 辨識之份量與熱量估算。";
}

// === TDEE 計算 ===
function calculateSuggestedTdee() {
  const gender = els.tdeeGender.value;
  const age = Number(els.tdeeAge.value) || 28;
  const height = Number(els.tdeeHeight.value) || 165;
  const weight = Number(els.tdeeWeight.value) || 60;
  const activity = Number(els.tdeeActivity.value) || 1.375;
  const delta = Number(els.tdeeGoalMode.value) || 0;

  const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
  const tdee = Math.round(bmr * activity);
  return Math.max(1000, Math.round((tdee + delta) / 50) * 50);
}

function updateTdeePreview() {
  const suggested = calculateSuggestedTdee();
  els.tdeePreviewText.textContent = `建議每日目標：約 ${formatNumber(suggested)} kcal`;
}

// === 事件綁定 ===
function bindEvents() {
  // 日期切換
  els.datePicker.addEventListener("change", () => {
    if (!els.datePicker.value) return;
    state.currentDate = els.datePicker.value;
    loadDayAndHistory();
  });

  els.prevDayBtn.addEventListener("click", () => {
    state.currentDate = shiftDate(state.currentDate, -1);
    els.datePicker.value = state.currentDate;
    loadDayAndHistory();
  });

  els.nextDayBtn.addEventListener("click", () => {
    state.currentDate = shiftDate(state.currentDate, 1);
    els.datePicker.value = state.currentDate;
    loadDayAndHistory();
  });

  els.todayBtn.addEventListener("click", () => {
    state.currentDate = getLocalToday();
    els.datePicker.value = state.currentDate;
    loadDayAndHistory();
  });

  els.loadSampleBtn.addEventListener("click", async () => {
    try {
      await storage.seedSampleDay(state.currentDate);
      showToast("已載入今日早中晚點心範例紀錄");
      await loadDayAndHistory();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  els.exportCsvBtn.addEventListener("click", () => {
    storage.exportCsv(state.currentDate);
  });

  // 儀表板點擊餐別 / 趨勢圖點擊日期
  document.querySelectorAll("[data-select-meal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const meal = btn.dataset.selectMeal;
      setSelectedMeal(meal);
      document.getElementById(`meal-card-${meal}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  els.trendChart.addEventListener("click", (e) => {
    const col = e.target.closest("[data-jump-date]");
    if (!col) return;
    state.currentDate = col.dataset.jumpDate;
    els.datePicker.value = state.currentDate;
    loadDayAndHistory();
  });

  // 表單餐別切換
  els.mealTabs.forEach((btn) => {
    btn.addEventListener("click", () => setSelectedMeal(btn.dataset.meal));
  });

  // 食物名稱自動完成 & 估算
  els.foodNameInput.addEventListener("input", () => {
    renderAutocomplete(els.foodNameInput.value);
    state.manualCaloriesOverride = false;
    runAutoEstimate();
  });

  els.portionInput.addEventListener("input", () => {
    state.manualCaloriesOverride = false;
    runAutoEstimate();
  });

  els.caloriesInput.addEventListener("input", () => {
    state.manualCaloriesOverride = true;
    state.estimationSource = "manual";
    els.estimateSourceBadge.textContent = "手動微調";
  });

  els.reEstimateBtn.addEventListener("click", () => {
    state.manualCaloriesOverride = false;
    runAutoEstimate(true);
    showToast("已重新依食物與份量估算熱量");
  });

  els.autocompleteList.addEventListener("click", (e) => {
    const item = e.target.closest("[data-pick-food]");
    if (!item) return;
    els.foodNameInput.value = item.dataset.pickFood;
    if (!els.portionInput.value.trim() || els.portionInput.value === "1份") {
      els.portionInput.value = item.dataset.pickUnit || "1份";
    }
    els.autocompleteList.classList.add("hidden");
    state.manualCaloriesOverride = false;
    runAutoEstimate(true);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-wrap")) {
      els.autocompleteList.classList.add("hidden");
    }
  });

  // 快速食物標籤 & 快速份量按鈕
  document.addEventListener("click", (e) => {
    const quickBtn = e.target.closest("[data-quick-food]");
    if (quickBtn) {
      els.foodNameInput.value = quickBtn.dataset.quickFood;
      state.manualCaloriesOverride = false;
      runAutoEstimate(true);
      els.autocompleteList.classList.add("hidden");
      return;
    }

    const portionBtn = e.target.closest("[data-portion]");
    if (portionBtn) {
      els.portionInput.value = portionBtn.dataset.portion;
      state.manualCaloriesOverride = false;
      runAutoEstimate(true);
    }
  });

  // 照片上傳、拖曳與貼上
  els.photoDropzone.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    els.photoInput.click();
  });

  els.photoInput.addEventListener("change", () => {
    const file = els.photoInput.files?.[0];
    if (file) handlePhotoSelected(file);
  });

  els.photoDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    els.photoDropzone.classList.add("dragover");
  });

  els.photoDropzone.addEventListener("dragleave", () => {
    els.photoDropzone.classList.remove("dragover");
  });

  els.photoDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    els.photoDropzone.classList.remove("dragover");
    const file = e.dataTransfer?.files?.[0];
    if (file) handlePhotoSelected(file);
  });

  document.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handlePhotoSelected(file);
          break;
        }
      }
    }
  });

  els.removePhotoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearPhoto();
  });

  els.analyzePhotoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    analyzeCurrentPhoto();
  });

  // AI 結果套用按鈕
  els.aiResultsBox.addEventListener("click", async (e) => {
    const applyBtn = e.target.closest("[data-apply-ai-idx]");
    if (applyBtn) {
      const idx = Number(applyBtn.dataset.applyAiIdx);
      const item = els.aiResultsBox._detectedItems?.[idx];
      if (item) applyAiItemToForm(item);
      return;
    }

    if (e.target.id === "apply-all-ai-btn") {
      const items = els.aiResultsBox._detectedItems || [];
      if (!items.length) return;
      try {
        for (let i = 0; i < items.length; i += 1) {
          const item = items[i];
          await storage.createEntry({
            date: state.currentDate,
            meal_type: state.selectedMeal,
            food_name: item.name,
            portion: item.portion,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            estimation_source: "ai_vision",
            notes: item.note || "",
            photo_data: i === 0 ? state.photoData : "",
          });
        }
        showToast(`已將 ${items.length} 項餐點加入${MEAL_META[state.selectedMeal].label}`);
        resetForm();
        await loadDayAndHistory();
      } catch (err) {
        showToast(err.message, true);
      }
    }
  });

  // 表單送出（新增或更新）
  els.foodForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const foodName = els.foodNameInput.value.trim();
    if (!foodName) {
      showToast("請輸入食物名稱", true);
      els.foodNameInput.focus();
      return;
    }

    const payload = {
      date: state.currentDate,
      meal_type: state.selectedMeal,
      food_name: foodName,
      portion: els.portionInput.value.trim() || "1份",
      calories: Number(els.caloriesInput.value) || 0,
      protein: Number(els.proteinInput.value) || 0,
      carbs: Number(els.carbsInput.value) || 0,
      fat: Number(els.fatInput.value) || 0,
      estimation_source: state.estimationSource,
      notes: els.notesInput.value.trim(),
      photo_data: state.photoData,
    };

    try {
      if (state.editingId) {
        await storage.updateEntry(state.editingId, payload);
        showToast("已更新飲食紀錄");
      } else {
        await storage.createEntry(payload);
        showToast(`已加入${MEAL_META[state.selectedMeal].label}：${foodName}`);
      }
      resetForm();
      await loadDayAndHistory();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  els.cancelEditBtn.addEventListener("click", resetForm);

  // 右側各餐卡片互動（新增、編輯、刪除、放大照片）
  els.mealsStack.addEventListener("click", async (e) => {
    const addBtn = e.target.closest("[data-add-to-meal]");
    if (addBtn) {
      setSelectedMeal(addBtn.dataset.addToMeal);
      els.foodNameInput.focus();
      els.entryFormCardScroll();
      return;
    }

    const editBtn = e.target.closest("[data-edit-id]");
    if (editBtn) {
      const id = Number(editBtn.dataset.editId);
      const entry = state.dayData?.entries.find((x) => x.id === id);
      if (entry) startEditEntry(entry);
      return;
    }

    const delBtn = e.target.closest("[data-delete-id]");
    if (delBtn) {
      const id = Number(delBtn.dataset.deleteId);
      try {
        await storage.deleteEntry(id);
        if (state.editingId === id) resetForm();
        showToast("已刪除紀錄");
        await loadDayAndHistory();
      } catch (err) {
        showToast(err.message, true);
      }
      return;
    }

    const thumb = e.target.closest("[data-lightbox-id]");
    if (thumb) {
      const id = Number(thumb.dataset.lightboxId);
      const entry = state.dayData?.entries.find((x) => x.id === id);
      if (entry?.photo_data) {
        els.lightboxImg.src = entry.photo_data;
        els.lightboxCaption.textContent = `${entry.food_name}（${entry.portion}）· ${formatNumber(entry.calories)} kcal`;
        els.photoModal.classList.remove("hidden");
      }
    }
  });

  // 燈箱關閉
  els.closePhotoModalBtn.addEventListener("click", () => {
    els.photoModal.classList.add("hidden");
  });
  els.photoModal.addEventListener("click", (e) => {
    if (e.target === els.photoModal) els.photoModal.classList.add("hidden");
  });

  // 設定 Modal
  els.openSettingsBtn.addEventListener("click", () => {
    els.settingDailyGoal.value = state.settings.daily_goal;
    els.settingGeminiModel.value = state.settings.gemini_model || "gemini-2.5-flash";
    els.settingGeminiKey.value = "";
    els.settingKeyStatus.textContent = state.settings.has_api_key
      ? `目前已設定 API Key（${state.settings.api_key_masked}），留空代表維持現狀`
      : "目前尚未設定 API Key";
    els.settingsModal.classList.remove("hidden");
  });

  els.closeSettingsBtn.addEventListener("click", () => {
    els.settingsModal.classList.add("hidden");
  });
  els.settingsModal.addEventListener("click", (e) => {
    if (e.target === els.settingsModal) els.settingsModal.classList.add("hidden");
  });

  [els.tdeeGender, els.tdeeAge, els.tdeeHeight, els.tdeeWeight, els.tdeeActivity, els.tdeeGoalMode].forEach(
    (el) => el.addEventListener("input", updateTdeePreview)
  );

  els.applyTdeeBtn.addEventListener("click", () => {
    els.settingDailyGoal.value = calculateSuggestedTdee();
    showToast("已帶入建議每日熱量目標");
  });

  els.clearApiKeyBtn.addEventListener("click", async () => {
    try {
      state.settings = await storage.updateSettings({ gemini_api_key: "__CLEAR__" });
      updateAiStatusBadge();
      els.settingKeyStatus.textContent = "已清除儲存的 API Key";
      showToast("已清除 Gemini API Key");
    } catch (err) {
      showToast(err.message, true);
    }
  });

  els.settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      daily_goal: Number(els.settingDailyGoal.value),
      gemini_model: els.settingGeminiModel.value.trim() || "gemini-2.5-flash",
    };
    const keyVal = els.settingGeminiKey.value.trim();
    if (keyVal) payload.gemini_api_key = keyVal;

    try {
      state.settings = await storage.updateSettings(payload);
      updateAiStatusBadge();
      els.settingsModal.classList.add("hidden");
      showToast("設定已儲存");
      await loadDayAndHistory();
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

init();
