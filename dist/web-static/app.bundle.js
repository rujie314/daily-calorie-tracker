(function () {
  "use strict";

  // === food-db.js ===
// 台灣常見飲食與一般食物熱量資料庫 + 智慧份量/關鍵字熱量估算引擎
const MEAL_META = {
  breakfast: { id: "breakfast", label: "早餐", icon: "🌅", hint: "建議佔全日 25–30%" },
  lunch: { id: "lunch", label: "午餐", icon: "☀️", hint: "建議佔全日 35–40%" },
  dinner: { id: "dinner", label: "晚餐", icon: "🌙", hint: "建議佔全日 25–35%" },
  snack: { id: "snack", label: "點心", icon: "🍓", hint: "建議控制在 10–15%" },
};
const FOOD_DB = [
  // === 早餐類 ===
  { id: "egg-crepe", name: "原味蛋餅", aliases: ["蛋餅"], category: "早餐", baseKcal: 260, baseUnit: "份", gramsPerUnit: 150, protein: 9, carbs: 30, fat: 11 },
  { id: "cheese-egg-crepe", name: "起司蛋餅", aliases: ["乳酪蛋餅"], category: "早餐", baseKcal: 340, baseUnit: "份", gramsPerUnit: 175, protein: 13, carbs: 31, fat: 17 },
  { id: "bacon-egg-crepe", name: "培根蛋餅", aliases: [], category: "早餐", baseKcal: 350, baseUnit: "份", gramsPerUnit: 175, protein: 13, carbs: 30, fat: 19 },
  { id: "tuna-egg-crepe", name: "鮪魚蛋餅", aliases: [], category: "早餐", baseKcal: 330, baseUnit: "份", gramsPerUnit: 185, protein: 16, carbs: 30, fat: 15 },
  { id: "hashbrown-crepe", name: "薯餅蛋餅", aliases: [], category: "早餐", baseKcal: 430, baseUnit: "份", gramsPerUnit: 210, protein: 10, carbs: 45, fat: 22 },
  { id: "radish-cake", name: "蘿蔔糕", aliases: ["菜頭粿"], category: "早餐", baseKcal: 220, baseUnit: "份(2片)", gramsPerUnit: 160, protein: 4, carbs: 36, fat: 7 },
  { id: "teppan-noodle", name: "鐵板麵(含蛋)", aliases: ["蘑菇鐵板麵", "黑胡椒鐵板麵", "鐵板麵"], category: "早餐", baseKcal: 480, baseUnit: "份", gramsPerUnit: 300, protein: 14, carbs: 64, fat: 18 },
  { id: "ham-egg-toast", name: "火腿蛋吐司", aliases: ["火腿蛋三明治"], category: "早餐", baseKcal: 310, baseUnit: "份", gramsPerUnit: 160, protein: 14, carbs: 35, fat: 12 },
  { id: "club-sandwich", name: "總匯三明治", aliases: ["三明治"], category: "早餐", baseKcal: 450, baseUnit: "份", gramsPerUnit: 220, protein: 20, carbs: 44, fat: 21 },
  { id: "pork-muffin", name: "豬肉滿福堡加蛋", aliases: ["滿福堡", "豬肉滿福堡"], category: "早餐", baseKcal: 390, baseUnit: "個", gramsPerUnit: 165, protein: 21, carbs: 29, fat: 21 },
  { id: "rice-roll-tw", name: "傳統飯糰", aliases: ["飯糰", "紫米飯糰"], category: "早餐", baseKcal: 420, baseUnit: "顆", gramsPerUnit: 220, protein: 11, carbs: 62, fat: 14 },
  { id: "onigiri", name: "超商三角飯糰", aliases: ["御飯糰", "鮭魚飯糰", "鮪魚飯糰"], category: "早餐", baseKcal: 195, baseUnit: "顆", gramsPerUnit: 115, protein: 5, carbs: 37, fat: 3 },
  { id: "shaobing-youtiao", name: "燒餅油條", aliases: ["燒餅", "油條"], category: "早餐", baseKcal: 510, baseUnit: "套", gramsPerUnit: 180, protein: 11, carbs: 56, fat: 26 },
  { id: "scallion-pancake", name: "蔥抓餅", aliases: ["蔥油餅"], category: "早餐", baseKcal: 380, baseUnit: "份", gramsPerUnit: 160, protein: 8, carbs: 48, fat: 17 },
  { id: "mantou-egg", name: "饅頭夾蛋", aliases: ["黑糖饅頭夾蛋", "饅頭"], category: "早餐", baseKcal: 310, baseUnit: "個", gramsPerUnit: 165, protein: 12, carbs: 49, fat: 7 },
  { id: "pan-fried-bun", name: "水煎包", aliases: ["煎包", "高麗菜水煎包"], category: "早餐", baseKcal: 165, baseUnit: "顆", gramsPerUnit: 95, protein: 5, carbs: 22, fat: 6 },
  { id: "xiaolongbao", name: "小籠包", aliases: ["湯包"], category: "早餐", baseKcal: 72, baseUnit: "顆", gramsPerUnit: 30, protein: 3, carbs: 7, fat: 3.5 },
  { id: "oatmeal", name: "燕麥片", aliases: ["大燕麥片", "麥片"], category: "早餐", baseKcal: 150, baseUnit: "碗(40g乾)", gramsPerUnit: 40, protein: 5, carbs: 27, fat: 2.5 },
  { id: "unsweetened-soy", name: "無糖豆漿", aliases: ["豆漿"], category: "早餐", baseKcal: 110, baseUnit: "杯(350ml)", gramsPerUnit: 350, protein: 11, carbs: 6, fat: 4.5 },
  { id: "sweet-soy", name: "有糖豆漿", aliases: ["甜豆漿", "冰豆漿"], category: "早餐", baseKcal: 180, baseUnit: "杯(350ml)", gramsPerUnit: 350, protein: 10, carbs: 24, fat: 4.5 },

  // === 主食 / 飯 / 便當 ===
  { id: "white-rice", name: "白飯", aliases: ["米飯", "白米飯"], category: "主食", baseKcal: 280, baseUnit: "碗(200g)", gramsPerUnit: 200, protein: 5, carbs: 62, fat: 0.5 },
  { id: "brown-rice", name: "糙米飯", aliases: ["五穀飯", "紫米飯"], category: "主食", baseKcal: 250, baseUnit: "碗(200g)", gramsPerUnit: 200, protein: 5.5, carbs: 52, fat: 1.8 },
  { id: "sweet-potato", name: "烤地瓜", aliases: ["地瓜", "番薯", "蒸地瓜"], category: "主食", baseKcal: 170, baseUnit: "條(150g)", gramsPerUnit: 150, protein: 2, carbs: 39, fat: 0.3 },
  { id: "braised-pork-rice", name: "滷肉飯", aliases: ["魯肉飯", "肉燥飯"], category: "飯類", baseKcal: 450, baseUnit: "碗", gramsPerUnit: 260, protein: 14, carbs: 58, fat: 18 },
  { id: "chicken-rice", name: "火雞肉飯", aliases: ["雞肉飯", "嘉義雞肉飯"], category: "飯類", baseKcal: 390, baseUnit: "碗", gramsPerUnit: 250, protein: 18, carbs: 54, fat: 11 },
  { id: "pork-rib-bento", name: "排骨便當", aliases: ["炸排骨便當", "滷排骨便當"], category: "便當/餐盒", baseKcal: 820, baseUnit: "份", gramsPerUnit: 520, protein: 32, carbs: 96, fat: 33 },
  { id: "fried-chicken-bento", name: "炸雞腿便當", aliases: ["雞腿便當"], category: "便當/餐盒", baseKcal: 920, baseUnit: "份", gramsPerUnit: 550, protein: 36, carbs: 98, fat: 41 },
  { id: "braised-chicken-bento", name: "滷雞腿便當", aliases: [], category: "便當/餐盒", baseKcal: 780, baseUnit: "份", gramsPerUnit: 530, protein: 35, carbs: 95, fat: 28 },
  { id: "braised-belly-bento", name: "控肉便當", aliases: ["焢肉便當"], category: "便當/餐盒", baseKcal: 880, baseUnit: "份", gramsPerUnit: 520, protein: 28, carbs: 95, fat: 42 },
  { id: "healthy-bento", name: "健康水煮餐盒", aliases: ["低脂餐盒", "舒肥雞胸餐盒", "健康餐盒"], category: "便當/餐盒", baseKcal: 510, baseUnit: "份", gramsPerUnit: 420, protein: 38, carbs: 58, fat: 12 },
  { id: "salmon-bento", name: "烤鮭魚餐盒", aliases: ["鮭魚便當"], category: "便當/餐盒", baseKcal: 640, baseUnit: "份", gramsPerUnit: 450, protein: 34, carbs: 64, fat: 26 },
  { id: "curry-rice", name: "咖哩飯", aliases: ["豬排咖哩飯", "雞肉咖哩飯"], category: "飯類", baseKcal: 680, baseUnit: "盤", gramsPerUnit: 420, protein: 22, carbs: 92, fat: 24 },
  { id: "fried-rice", name: "蛋炒飯", aliases: ["蝦仁炒飯", "肉絲炒飯", "炒飯"], category: "飯類", baseKcal: 740, baseUnit: "份", gramsPerUnit: 380, protein: 20, carbs: 94, fat: 30 },
  { id: "oyakodon", name: "親子丼", aliases: [], category: "飯類", baseKcal: 620, baseUnit: "碗", gramsPerUnit: 400, protein: 30, carbs: 84, fat: 16 },
  { id: "gyudon", name: "牛丼", aliases: ["牛肉蓋飯"], category: "飯類", baseKcal: 690, baseUnit: "碗", gramsPerUnit: 410, protein: 24, carbs: 88, fat: 25 },
  { id: "sushi-set", name: "壽司拼盤", aliases: ["握壽司", "壽司"], category: "飯類", baseKcal: 480, baseUnit: "盒(8貫)", gramsPerUnit: 300, protein: 22, carbs: 72, fat: 10 },
  { id: "congee", name: "皮蛋瘦肉粥", aliases: ["廣東粥", "稀飯", "粥"], category: "飯類", baseKcal: 360, baseUnit: "碗", gramsPerUnit: 450, protein: 16, carbs: 54, fat: 8 },

  // === 麵食 / 水餃 ===
  { id: "beef-noodle", name: "紅燒牛肉麵", aliases: ["牛肉麵", "清燉牛肉麵"], category: "麵食", baseKcal: 680, baseUnit: "碗", gramsPerUnit: 650, protein: 34, carbs: 78, fat: 24 },
  { id: "yangchun-noodle", name: "陽春湯麵", aliases: ["陽春麵", "湯麵"], category: "麵食", baseKcal: 380, baseUnit: "碗", gramsPerUnit: 450, protein: 13, carbs: 60, fat: 9 },
  { id: "sesame-noodle", name: "麻醬麵", aliases: ["麻醬乾麵"], category: "麵食", baseKcal: 540, baseUnit: "碗", gramsPerUnit: 280, protein: 16, carbs: 66, fat: 23 },
  { id: "dry-noodle", name: "肉燥乾拌麵", aliases: ["乾拌麵", "乾麵", "傻瓜乾麵"], category: "麵食", baseKcal: 450, baseUnit: "碗", gramsPerUnit: 250, protein: 14, carbs: 62, fat: 16 },
  { id: "pot-noodle", name: "鍋燒意麵", aliases: ["鍋燒麵"], category: "麵食", baseKcal: 580, baseUnit: "碗", gramsPerUnit: 550, protein: 20, carbs: 62, fat: 27 },
  { id: "udon", name: "豆皮烏龍麵", aliases: ["烏龍麵"], category: "麵食", baseKcal: 420, baseUnit: "碗", gramsPerUnit: 500, protein: 16, carbs: 68, fat: 8 },
  { id: "ramen", name: "豚骨拉麵", aliases: ["日式拉麵", "拉麵"], category: "麵食", baseKcal: 760, baseUnit: "碗", gramsPerUnit: 650, protein: 30, carbs: 76, fat: 35 },
  { id: "pasta-bolognese", name: "番茄肉醬義大利麵", aliases: ["義大利麵", "肉醬麵"], category: "麵食", baseKcal: 620, baseUnit: "盤", gramsPerUnit: 380, protein: 22, carbs: 78, fat: 23 },
  { id: "pasta-carbonara", name: "奶油白醬義大利麵", aliases: ["白醬義大利麵", "培根白醬麵"], category: "麵食", baseKcal: 750, baseUnit: "盤", gramsPerUnit: 380, protein: 24, carbs: 74, fat: 38 },
  { id: "dumpling", name: "高麗菜豬肉水餃", aliases: ["水餃", "韭菜水餃"], category: "麵食", baseKcal: 55, baseUnit: "顆", gramsPerUnit: 24, protein: 2.3, carbs: 6.2, fat: 2.2 },
  { id: "potsticker", name: "鍋貼", aliases: ["招牌鍋貼"], category: "麵食", baseKcal: 75, baseUnit: "顆", gramsPerUnit: 28, protein: 2.6, carbs: 7.5, fat: 3.8 },
  { id: "instant-noodle", name: "泡麵", aliases: ["速食麵", "維力炸醬麵"], category: "麵食", baseKcal: 460, baseUnit: "碗", gramsPerUnit: 95, protein: 9, carbs: 58, fat: 21 },

  // === 肉類 / 蛋豆 / 單點小吃 ===
  { id: "chicken-breast", name: "舒肥雞胸肉", aliases: ["雞胸肉", "水煮雞胸"], category: "肉類/蛋豆", baseKcal: 165, baseUnit: "份(150g)", gramsPerUnit: 150, protein: 33, carbs: 1, fat: 3 },
  { id: "boiled-egg", name: "水煮蛋", aliases: ["白煮蛋", "水煮雞蛋"], category: "肉類/蛋豆", baseKcal: 75, baseUnit: "顆", gramsPerUnit: 55, protein: 6.5, carbs: 0.6, fat: 5 },
  { id: "tea-egg", name: "茶葉蛋", aliases: ["滷蛋"], category: "肉類/蛋豆", baseKcal: 78, baseUnit: "顆", gramsPerUnit: 55, protein: 6.5, carbs: 1.2, fat: 5.2 },
  { id: "fried-egg", name: "荷包蛋", aliases: ["煎蛋", "太陽蛋"], category: "肉類/蛋豆", baseKcal: 115, baseUnit: "顆", gramsPerUnit: 55, protein: 6.5, carbs: 0.7, fat: 9.5 },
  { id: "grilled-salmon", name: "香煎鮭魚", aliases: ["鮭魚", "烤鮭魚"], category: "肉類/蛋豆", baseKcal: 280, baseUnit: "片(140g)", gramsPerUnit: 140, protein: 28, carbs: 0, fat: 18 },
  { id: "steak", name: "沙朗牛排", aliases: ["牛排", "菲力牛排"], category: "肉類/蛋豆", baseKcal: 420, baseUnit: "份(200g)", gramsPerUnit: 200, protein: 42, carbs: 0, fat: 27 },
  { id: "braised-tofu", name: "滷板豆腐", aliases: ["滷豆腐", "板豆腐", "豆腐"], category: "肉類/蛋豆", baseKcal: 95, baseUnit: "塊(100g)", gramsPerUnit: 100, protein: 9, carbs: 3, fat: 5 },
  { id: "luwei", name: "滷味拼盤", aliases: ["加熱滷味", "滷味"], category: "小吃/湯品", baseKcal: 430, baseUnit: "份", gramsPerUnit: 350, protein: 24, carbs: 38, fat: 19 },
  { id: "fried-chicken-fillet", name: "酥炸雞排", aliases: ["雞排", "香雞排"], category: "小吃/湯品", baseKcal: 630, baseUnit: "片", gramsPerUnit: 240, protein: 38, carbs: 32, fat: 38 },
  { id: "popcorn-chicken", name: "鹽酥雞", aliases: ["鹹酥雞"], category: "小吃/湯品", baseKcal: 520, baseUnit: "份(180g)", gramsPerUnit: 180, protein: 28, carbs: 26, fat: 33 },
  { id: "oyster-omelette", name: "蚵仔煎", aliases: [], category: "小吃/湯品", baseKcal: 480, baseUnit: "份", gramsPerUnit: 260, protein: 14, carbs: 56, fat: 22 },
  { id: "stinky-tofu", name: "炸臭豆腐", aliases: ["臭豆腐"], category: "小吃/湯品", baseKcal: 530, baseUnit: "份(5塊)", gramsPerUnit: 250, protein: 20, carbs: 34, fat: 35 },
  { id: "meatball-soup", name: "貢丸湯", aliases: [], category: "小吃/湯品", baseKcal: 170, baseUnit: "碗", gramsPerUnit: 320, protein: 8, carbs: 4, fat: 13 },
  { id: "miso-soup", name: "味噌湯", aliases: ["豆腐味噌湯"], category: "小吃/湯品", baseKcal: 85, baseUnit: "碗", gramsPerUnit: 280, protein: 5, carbs: 9, fat: 3 },
  { id: "corn-soup", name: "玉米濃湯", aliases: [], category: "小吃/湯品", baseKcal: 190, baseUnit: "碗", gramsPerUnit: 280, protein: 5, carbs: 24, fat: 8 },
  { id: "hotpot", name: "個人小火鍋", aliases: ["小火鍋", "涮涮鍋"], category: "便當/餐盒", baseKcal: 780, baseUnit: "鍋", gramsPerUnit: 800, protein: 38, carbs: 62, fat: 40 },
  { id: "hamburger", name: "牛肉起司漢堡", aliases: ["漢堡", "麥香雞", "大麥克"], category: "速食", baseKcal: 490, baseUnit: "個", gramsPerUnit: 200, protein: 25, carbs: 42, fat: 24 },
  { id: "fries", name: "炸薯條(中)", aliases: ["薯條"], category: "速食", baseKcal: 330, baseUnit: "份", gramsPerUnit: 115, protein: 4, carbs: 42, fat: 16 },
  { id: "pizza", name: "夏威夷披薩", aliases: ["披薩", "比薩"], category: "速食", baseKcal: 260, baseUnit: "片", gramsPerUnit: 110, protein: 11, carbs: 30, fat: 10 },

  // === 蔬菜 / 水果 ===
  { id: "blanched-veggies", name: "燙青菜(少油)", aliases: ["燙青菜", "青菜", "高麗菜", "花椰菜"], category: "蔬菜/水果", baseKcal: 85, baseUnit: "盤", gramsPerUnit: 150, protein: 3, carbs: 8, fat: 4.5 },
  { id: "salad-light", name: "和風生菜沙拉", aliases: ["生菜沙拉", "沙拉"], category: "蔬菜/水果", baseKcal: 130, baseUnit: "碗", gramsPerUnit: 200, protein: 5, carbs: 14, fat: 6 },
  { id: "caesar-salad", name: "凱撒雞肉沙拉", aliases: ["凱撒沙拉"], category: "蔬菜/水果", baseKcal: 360, baseUnit: "份", gramsPerUnit: 260, protein: 24, carbs: 16, fat: 22 },
  { id: "apple", name: "蘋果", aliases: [], category: "蔬菜/水果", baseKcal: 85, baseUnit: "顆", gramsPerUnit: 170, protein: 0.5, carbs: 22, fat: 0.3 },
  { id: "banana", name: "香蕉", aliases: [], category: "蔬菜/水果", baseKcal: 105, baseUnit: "根", gramsPerUnit: 120, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: "guava", name: "芭樂", aliases: ["番石榴"], category: "蔬菜/水果", baseKcal: 75, baseUnit: "顆(200g)", gramsPerUnit: 200, protein: 2, carbs: 18, fat: 0.6 },
  { id: "kiwi", name: "奇異果", aliases: [], category: "蔬菜/水果", baseKcal: 48, baseUnit: "顆", gramsPerUnit: 80, protein: 0.9, carbs: 11, fat: 0.4 },
  { id: "papaya", name: "木瓜", aliases: [], category: "蔬菜/水果", baseKcal: 115, baseUnit: "半顆(280g)", gramsPerUnit: 280, protein: 1.4, carbs: 28, fat: 0.4 },
  { id: "cherry-tomato", name: "小番茄", aliases: ["聖女番茄", "番茄"], category: "蔬菜/水果", baseKcal: 45, baseUnit: "份(15顆)", gramsPerUnit: 150, protein: 1.4, carbs: 10, fat: 0.3 },

  // === 飲料 ===
  { id: "boba-full", name: "珍珠奶茶(全糖)", aliases: ["珍奶", "珍珠奶茶", "波霸奶茶"], category: "飲料", baseKcal: 650, baseUnit: "大杯(700ml)", gramsPerUnit: 700, protein: 6, carbs: 98, fat: 25 },
  { id: "boba-low", name: "珍珠奶茶(微糖)", aliases: ["微糖珍奶"], category: "飲料", baseKcal: 480, baseUnit: "大杯(700ml)", gramsPerUnit: 700, protein: 6, carbs: 64, fat: 22 },
  { id: "fresh-milk-tea", name: "鮮奶茶(微糖)", aliases: ["紅茶拿鐵", "鮮奶茶"], category: "飲料", baseKcal: 210, baseUnit: "大杯(700ml)", gramsPerUnit: 700, protein: 7, carbs: 29, fat: 7 },
  { id: "sugar-free-tea", name: "無糖綠茶/烏龍茶", aliases: ["無糖綠茶", "四季春", "烏龍茶", "黑咖啡", "美式咖啡"], category: "飲料", baseKcal: 5, baseUnit: "杯(500ml)", gramsPerUnit: 500, protein: 0, carbs: 1, fat: 0 },
  { id: "latte", name: "拿鐵咖啡(無糖)", aliases: ["拿鐵", "冰拿鐵", "熱拿鐵"], category: "飲料", baseKcal: 165, baseUnit: "中杯(360ml)", gramsPerUnit: 360, protein: 8.5, carbs: 13, fat: 8.5 },
  { id: "black-tea-sweet", name: "古早味紅茶(微糖)", aliases: ["紅茶", "綠茶(微糖)"], category: "飲料", baseKcal: 120, baseUnit: "杯(500ml)", gramsPerUnit: 500, protein: 0, carbs: 30, fat: 0 },
  { id: "cola", name: "可樂", aliases: ["汽水", "雪碧"], category: "飲料", baseKcal: 140, baseUnit: "罐(330ml)", gramsPerUnit: 330, protein: 0, carbs: 35, fat: 0 },
  { id: "whey-shake", name: "乳清蛋白飲", aliases: ["高蛋白", "乳清"], category: "飲料", baseKcal: 125, baseUnit: "份(30g)", gramsPerUnit: 30, protein: 24, carbs: 3, fat: 1.5 },

  // === 點心 / 甜點 / 零食 ===
  { id: "tofu-pudding", name: "花生豆花", aliases: ["豆花", "傳統豆花"], category: "點心/甜點", baseKcal: 270, baseUnit: "碗", gramsPerUnit: 350, protein: 9, carbs: 42, fat: 7 },
  { id: "red-bean-soup", name: "紅豆湯", aliases: ["紅豆湯圓"], category: "點心/甜點", baseKcal: 310, baseUnit: "碗", gramsPerUnit: 350, protein: 9, carbs: 64, fat: 1.5 },
  { id: "egg-cake", name: "雞蛋糕", aliases: [], category: "點心/甜點", baseKcal: 240, baseUnit: "份(5顆)", gramsPerUnit: 110, protein: 7, carbs: 34, fat: 8 },
  { id: "pineapple-bun", name: "菠蘿麵包", aliases: ["麵包"], category: "點心/甜點", baseKcal: 360, baseUnit: "個", gramsPerUnit: 100, protein: 8, carbs: 50, fat: 14 },
  { id: "croissant", name: "可頌麵包", aliases: ["可頌"], category: "點心/甜點", baseKcal: 290, baseUnit: "個", gramsPerUnit: 75, protein: 6, carbs: 31, fat: 16 },
  { id: "cheesecake", name: "起司蛋糕", aliases: ["乳酪蛋糕", "蛋糕"], category: "點心/甜點", baseKcal: 340, baseUnit: "片", gramsPerUnit: 100, protein: 6, carbs: 28, fat: 23 },
  { id: "yogurt", name: "無糖希臘優格", aliases: ["優格", "優酪乳"], category: "點心/甜點", baseKcal: 125, baseUnit: "杯(150g)", gramsPerUnit: 150, protein: 12, carbs: 8, fat: 5 },
  { id: "nuts", name: "綜合無調味堅果", aliases: ["堅果", "杏仁", "核桃"], category: "點心/甜點", baseKcal: 185, baseUnit: "份(30g)", gramsPerUnit: 30, protein: 5, carbs: 6, fat: 16 },
  { id: "chips", name: "洋芋片", aliases: ["餅乾", "零食"], category: "點心/甜點", baseKcal: 290, baseUnit: "包(55g)", gramsPerUnit: 55, protein: 3, carbs: 30, fat: 18 },
  { id: "chocolate", name: "黑巧克力(70%)", aliases: ["巧克力"], category: "點心/甜點", baseKcal: 165, baseUnit: "份(30g)", gramsPerUnit: 30, protein: 2.5, carbs: 13, fat: 12 },
];

const ZH_NUMBERS = {
  半: 0.5,
  一: 1,
  兩: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

const KEYWORD_RULES = [
  { pattern: /(炸雞|雞排|鹽酥雞|炸豬排|炸蝦|酥炸|天婦羅)/, kcal: 560, protein: 28, carbs: 34, fat: 34, label: "油炸肉類/主餐" },
  { pattern: /(便當|餐盒|飯盒)/, kcal: 760, protein: 30, carbs: 90, fat: 28, label: "綜合便當餐盒" },
  { pattern: /(炒飯|燴飯|燉飯|焗烤|咖哩飯|丼飯|滷肉飯)/, kcal: 660, protein: 22, carbs: 86, fat: 24, label: "飯類主食" },
  { pattern: /(拉麵|牛肉麵|義大利麵|乾麵|炒麵|拌麵|涼麵|冬粉|米粉)/, kcal: 540, protein: 20, carbs: 68, fat: 19, label: "麵食類" },
  { pattern: /(火鍋|麻辣燙|滷味)/, kcal: 560, protein: 28, carbs: 46, fat: 26, label: "鍋物/滷味" },
  { pattern: /(漢堡|三明治|潛艇堡|可頌|貝果|披薩)/, kcal: 420, protein: 18, carbs: 44, fat: 18, label: "西式麵包/輕食" },
  { pattern: /(蛋餅|蔥抓餅|蘿蔔糕|飯糰|燒餅|油條|水煎包|包子|饅頭)/, kcal: 320, protein: 10, carbs: 40, fat: 13, label: "台式早餐點心" },
  { pattern: /(水餃|煎餃|鍋貼|餛飩|抄手)/, kcal: 62, protein: 2.5, carbs: 7, fat: 2.6, label: "餃子類(單顆基準)" },
  { pattern: /(雞胸|舒肥|雞腿|牛排|豬排|鮭魚|鯖魚|煎魚|海鮮|蝦|肉)/, kcal: 250, protein: 26, carbs: 4, fat: 14, label: "肉類/海鮮蛋白質" },
  { pattern: /(蛋|蒸蛋|炒蛋|荷包蛋|烘蛋)/, kcal: 110, protein: 7, carbs: 2, fat: 8, label: "蛋類料理" },
  { pattern: /(沙拉|青菜|高麗菜|花椰菜|燙菜|蔬菜|菇|時蔬)/, kcal: 110, protein: 4, carbs: 10, fat: 5, label: "蔬菜沙拉" },
  { pattern: /(蘋果|香蕉|芭樂|木瓜|葡萄|橘子|鳳梨|西瓜|芒果|水果)/, kcal: 85, protein: 1, carbs: 21, fat: 0.3, label: "新鮮水果" },
  { pattern: /(奶茶|珍奶|波霸|奶蓋|拿鐵|可可|果汁|汽水|可樂)/, kcal: 280, protein: 5, carbs: 44, fat: 9, label: "含糖/奶類飲品" },
  { pattern: /(咖啡|美式|綠茶|紅茶|烏龍|豆漿|鮮奶|牛奶)/, kcal: 95, protein: 5, carbs: 10, fat: 3.5, label: "一般飲品" },
  { pattern: /(蛋糕|塔|布丁|冰淇淋|餅乾|巧克力|泡芙|鬆餅|甜點|糖)/, kcal: 310, protein: 5, carbs: 38, fat: 15, label: "烘焙甜點" },
  { pattern: /(湯|濃湯|味噌|貢丸湯)/, kcal: 140, protein: 6, carbs: 12, fat: 6, label: "湯品" },
];
const QUICK_PRESETS_BY_MEAL = {
  breakfast: ["原味蛋餅", "火腿蛋吐司", "傳統飯糰", "無糖豆漿", "拿鐵咖啡(無糖)", "地瓜"],
  lunch: ["健康水煮餐盒", "滷雞腿便當", "紅燒牛肉麵", "滷肉飯", "排骨便當", "燙青菜(少油)"],
  dinner: ["香煎鮭魚", "舒肥雞胸肉", "個人小火鍋", "高麗菜豬肉水餃", "和風生菜沙拉", "白飯"],
  snack: ["蘋果", "香蕉", "無糖希臘優格", "茶葉蛋", "綜合無調味堅果", "珍珠奶茶(微糖)"],
};
function searchFoods(query, limit = 8) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];

  const scored = [];
  for (const item of FOOD_DB) {
    const nameLower = item.name.toLowerCase();
    let score = 0;
    if (nameLower === q) score = 100;
    else if (item.aliases.some((a) => a.toLowerCase() === q)) score = 95;
    else if (nameLower.startsWith(q)) score = 80;
    else if (item.aliases.some((a) => a.toLowerCase().startsWith(q))) score = 75;
    else if (nameLower.includes(q)) score = 60;
    else if (item.aliases.some((a) => a.toLowerCase().includes(q))) score = 55;
    else if (item.category.toLowerCase().includes(q)) score = 30;

    if (score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "zh-Hant"));
  return scored.slice(0, limit).map((x) => x.item);
}
function findBestFoodMatch(name) {
  const q = (name || "").trim().toLowerCase();
  if (!q) return null;

  // Strip common modifiers like 微糖 / 無糖 / 少飯 / 大碗 when matching base food
  const cleaned = q
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/(無糖|微糖|半糖|少糖|全糖|少飯|去皮|加蛋|大碗|小碗|大杯|中杯|冰|熱)/g, "")
    .trim();

  const exact = searchFoods(q, 1)[0];
  if (exact && (exact.name.toLowerCase() === q || exact.aliases.some((a) => a.toLowerCase() === q))) {
    return exact;
  }

  // Prefer longest alias/name contained inside user's string when it covers a meaningful portion
  let best = null;
  let bestLen = 0;
  const targetLen = (cleaned || q).length;
  for (const item of FOOD_DB) {
    const candidates = [item.name, ...item.aliases];
    for (const c of candidates) {
      const cl = c.toLowerCase();
      if (q.includes(cl) || (cleaned && cleaned.includes(cl))) {
        const meaningful = cl.length >= 3 || cl.length / Math.max(targetLen, 1) >= 0.5;
        if (meaningful && cl.length > bestLen) {
          best = item;
          bestLen = cl.length;
        }
      }
    }
  }
  if (best) return best;

  // Only fall back to prefix/substring search if no dish-level keyword rule overrides a tiny ingredient
  const fallback = searchFoods(cleaned || q, 1)[0];
  if (fallback && fallback.name.toLowerCase().includes(cleaned || q)) {
    return fallback;
  }
  return null;
}
function parsePortionMultiplier(portionText, foodItem) {
  const text = (portionText || "").trim();
  if (!text) return 1;

  // Check explicit weight/volume e.g. 200g, 150克, 350ml, 500毫升
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|公克|克|ml|毫升|cc)/i);
  if (weightMatch && foodItem && foodItem.gramsPerUnit > 0) {
    const amount = parseFloat(weightMatch[1]);
    if (amount > 0) {
      return Math.max(0.1, amount / foodItem.gramsPerUnit);
    }
  }

  // Check fraction e.g. 1/2, 2/3
  const fracMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den > 0) return Math.max(0.1, num / den);
  }

  // Check decimal / integer e.g. 1.5碗, 2顆, 8顆
  const numMatch = text.match(/(\d+(?:\.\d+)?)/);
  let mult = numMatch ? parseFloat(numMatch[1]) : 1;

  // Check Chinese numerals if no digit found
  if (!numMatch) {
    for (const [zh, val] of Object.entries(ZH_NUMBERS)) {
      if (text.includes(zh)) {
        mult = val;
        break;
      }
    }
  }

  // Size modifiers in portion text
  if (/(大碗|大份|大杯|特大|加大)/.test(text)) mult *= 1.3;
  else if (/(小碗|小份|小杯)/.test(text)) mult *= 0.78;
  else if (/(半份|半碗|半杯|半顆|半條)/.test(text) && !numMatch && !text.includes("半")) {
    mult *= 0.5;
  }

  return Math.max(0.1, mult || 1);
}

function applyNameModifiers(name, base) {
  let { kcal, protein, carbs, fat } = base;
  const notes = [];
  const text = (name || "").trim();

  if (/無糖/.test(text) && kcal >= 80) {
    kcal = Math.max(5, kcal * 0.55);
    carbs *= 0.25;
    notes.push("無糖減糖調整");
  } else if (/微糖/.test(text) && kcal >= 120) {
    kcal *= 0.78;
    carbs *= 0.72;
    notes.push("微糖調整");
  } else if (/半糖/.test(text) && kcal >= 120) {
    kcal *= 0.88;
    carbs *= 0.84;
    notes.push("半糖調整");
  }

  if (/少飯/.test(text)) {
    kcal = Math.max(50, kcal - 95);
    carbs = Math.max(0, carbs - 22);
    notes.push("少飯 -95 kcal");
  }
  if (/去皮/.test(text)) {
    kcal = Math.max(50, kcal - 85);
    fat = Math.max(0, fat - 9);
    notes.push("去皮 -85 kcal");
  }
  if (/加蛋/.test(text) && !/蛋餅|火腿蛋|滿福堡|夾蛋|炒飯/.test(text)) {
    kcal += 80;
    protein += 6.5;
    fat += 5.5;
    notes.push("加蛋 +80 kcal");
  }
  if (/加起司|起司/.test(text) && !/起司/.test(base.matchedName || "")) {
    kcal += 70;
    protein += 4;
    fat += 5.5;
    notes.push("加起司 +70 kcal");
  }
  if (/(大碗|大份)/.test(text)) {
    kcal *= 1.25;
    protein *= 1.2;
    carbs *= 1.28;
    fat *= 1.2;
    notes.push("大份量 x1.25");
  } else if (/(小碗|小份)/.test(text)) {
    kcal *= 0.8;
    protein *= 0.82;
    carbs *= 0.78;
    fat *= 0.82;
    notes.push("小份量 x0.8");
  }

  return { kcal, protein, carbs, fat, notes };
}

/**
 * Estimate calories & macros from food name and portion.
 * Returns { calories, protein, carbs, fat, source, sourceLabel, matchedName, suggestedUnit, note }
 */
function estimateFoodCalories(foodName, portionText = "") {
  const name = (foodName || "").trim();
  if (!name) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      source: "manual",
      sourceLabel: "等待輸入",
      matchedName: null,
      suggestedUnit: "1份",
      note: "",
    };
  }

  const match = findBestFoodMatch(name);
  if (match) {
    const mult = parsePortionMultiplier(portionText, match);
    const modified = applyNameModifiers(name, {
      kcal: match.baseKcal,
      protein: match.protein,
      carbs: match.carbs,
      fat: match.fat,
      matchedName: match.name,
    });
    const noteParts = [`對應「${match.name}」(${match.baseKcal} kcal / ${match.baseUnit})`];
    if (mult !== 1) noteParts.push(`份量倍率 ×${Number(mult.toFixed(2))}`);
    if (modified.notes.length) noteParts.push(modified.notes.join("、"));

    return {
      calories: Math.round(modified.kcal * mult),
      protein: Math.round(modified.protein * mult * 10) / 10,
      carbs: Math.round(modified.carbs * mult * 10) / 10,
      fat: Math.round(modified.fat * mult * 10) / 10,
      source: "database",
      sourceLabel: "內建食物資料庫",
      matchedName: match.name,
      suggestedUnit: match.baseUnit,
      note: noteParts.join(" · "),
    };
  }

  // Fallback keyword heuristics
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(name)) {
      const dummyFood = { gramsPerUnit: 200 };
      const mult = parsePortionMultiplier(portionText, dummyFood);
      const modified = applyNameModifiers(name, {
        kcal: rule.kcal,
        protein: rule.protein,
        carbs: rule.carbs,
        fat: rule.fat,
      });
      return {
        calories: Math.round(modified.kcal * mult),
        protein: Math.round(modified.protein * mult * 10) / 10,
        carbs: Math.round(modified.carbs * mult * 10) / 10,
        fat: Math.round(modified.fat * mult * 10) / 10,
        source: "keyword",
        sourceLabel: "智慧關鍵字估算",
        matchedName: rule.label,
        suggestedUnit: "1份",
        note: `依「${rule.label}」類別估算${mult !== 1 ? ` · 份量 ×${Number(mult.toFixed(2))}` : ""}`,
      };
    }
  }

  // Generic single serving fallback
  const mult = parsePortionMultiplier(portionText, { gramsPerUnit: 200 });
  return {
    calories: Math.round(250 * mult),
    protein: Math.round(10 * mult * 10) / 10,
    carbs: Math.round(30 * mult * 10) / 10,
    fat: Math.round(9 * mult * 10) / 10,
    source: "keyword",
    sourceLabel: "一般餐點預設估算",
    matchedName: null,
    suggestedUnit: "1份",
    note: "查無精確項目，以一般單份餐點 250 kcal 估算（可直接微調）",
  };
}
function extractHintFromFilename(filename) {
  if (!filename) return "";
  const stem = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  if (!stem || /^(img|pxl|dsc|photo|image|screenshot|line|wechat|\d+)$/i.test(stem)) {
    return "";
  }
  const match = findBestFoodMatch(stem);
  return match ? match.name : "";
}

  // === storage.js ===
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
async function createStorageAdapter() {
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

  // === app.js ===
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
})();
