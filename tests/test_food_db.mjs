import assert from "node:assert/strict";
import {
  FOOD_DB,
  searchFoods,
  estimateFoodCalories,
  extractHintFromFilename,
} from "../public/food-db.js";

assert.ok(FOOD_DB.length >= 70, "Food database should have rich items");

// Exact and alias search
const boba = searchFoods("珍奶", 5);
assert.ok(boba.length > 0 && boba[0].name.includes("珍珠奶茶"));

// Portion scaling: 8 dumplings -> 8 * 55 = 440 kcal
const dumplings = estimateFoodCalories("水餃", "8顆");
assert.equal(dumplings.calories, 440);
assert.equal(dumplings.source, "database");

// Half bowl white rice -> 0.5 * 280 = 140 kcal
const halfRice = estimateFoodCalories("白飯", "半碗");
assert.equal(halfRice.calories, 140);

// Weight-based scaling: 300g 雞胸肉 (base 150g = 165 kcal -> 330 kcal)
const chicken = estimateFoodCalories("舒肥雞胸肉", "300g");
assert.equal(chicken.calories, 330);

// Name modifier: 滷雞腿便當 少飯 -> 780 - 95 = 685 kcal
const lessRice = estimateFoodCalories("滷雞腿便當少飯", "1份");
assert.equal(lessRice.calories, 685);

// Keyword fallback for unlisted custom dish
const customSoup = estimateFoodCalories("番茄豆腐蔬菜湯", "1碗");
assert.equal(customSoup.source, "keyword");
assert.ok(customSoup.calories > 0);

// Filename hint extraction
assert.equal(extractHintFromFilename("滷肉飯_lunch.jpg"), "滷肉飯");
assert.equal(extractHintFromFilename("IMG_20261125.jpg"), "");

console.log("All food-db.js assertions passed!");
