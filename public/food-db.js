// 台灣常見飲食與一般食物熱量資料庫 + 智慧份量/關鍵字熱量估算引擎

export const MEAL_META = {
  breakfast: { id: "breakfast", label: "早餐", icon: "🌅", hint: "建議佔全日 25–30%" },
  lunch: { id: "lunch", label: "午餐", icon: "☀️", hint: "建議佔全日 35–40%" },
  dinner: { id: "dinner", label: "晚餐", icon: "🌙", hint: "建議佔全日 25–35%" },
  snack: { id: "snack", label: "點心", icon: "🍓", hint: "建議控制在 10–15%" },
};

export const FOOD_DB = [
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

export const QUICK_PRESETS_BY_MEAL = {
  breakfast: ["原味蛋餅", "火腿蛋吐司", "傳統飯糰", "無糖豆漿", "拿鐵咖啡(無糖)", "地瓜"],
  lunch: ["健康水煮餐盒", "滷雞腿便當", "紅燒牛肉麵", "滷肉飯", "排骨便當", "燙青菜(少油)"],
  dinner: ["香煎鮭魚", "舒肥雞胸肉", "個人小火鍋", "高麗菜豬肉水餃", "和風生菜沙拉", "白飯"],
  snack: ["蘋果", "香蕉", "無糖希臘優格", "茶葉蛋", "綜合無調味堅果", "珍珠奶茶(微糖)"],
};

export function searchFoods(query, limit = 8) {
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

export function findBestFoodMatch(name) {
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

export function parsePortionMultiplier(portionText, foodItem) {
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
export function estimateFoodCalories(foodName, portionText = "") {
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

export function extractHintFromFilename(filename) {
  if (!filename) return "";
  const stem = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  if (!stem || /^(img|pxl|dsc|photo|image|screenshot|line|wechat|\d+)$/i.test(stem)) {
    return "";
  }
  const match = findBestFoodMatch(stem);
  return match ? match.name : "";
}
