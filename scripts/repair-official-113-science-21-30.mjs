import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const review = (number, page, note) => ({
  status: `已依113年官方自然科題本第${number}題核對`,
  note,
  evidenceSources: [`${base}113-science-p${page}.webp`],
});
const repairs = {
  "OFF-0845": {
    question: "同一時間在同一花圃比較三品牌薄荷種子的發芽情形，三條相同條件的種植路線分別播下甲、乙、丙品牌種子。甲播 500 顆、發芽 100 顆；乙播 400 顆、發芽 80 顆；丙播 350 顆、發芽 80 顆。根據發芽率，下列敘述何者合理？",
    options: ["甲、乙兩品牌的發芽率相等", "乙、丙兩品牌的發芽率相等", "甲比乙、丙更容易發芽", "丙比甲、乙更不容易發芽"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 A。發芽率要用發芽顆數除以播種顆數，不能只比較發芽的絕對數量。甲為 100÷500＝20%；乙為 80÷400＝20%；丙為 80÷350，約 22.9%。因此只有甲、乙發芽率相同。",
    solutionSteps: ["先用相同的計算式比較：發芽率＝發芽顆數÷播種顆數×100%。", "甲＝100/500＝20%；乙＝80/400＝20%；丙＝80/350≈22.9%。", "甲和乙比例相同，選 A；雖然丙發芽數較少，但播種數也不同，不能只看發芽顆數。"],
    teacherTip: "比較不同樣本的成功情形，應比較比例或百分率；分母不同時不能只比成功的數量。",
    answerKeyReview: review(21, 7, "依原表逐項轉錄播種數與發芽數，重新計算三品牌發芽率。"),
  },
  "OFF-0846": {
    question: "把某被子植物莖部形成層外側的構造剝除後，植物逐漸因根部得不到養分而死亡。小書推論它較可能是雙子葉植物；小花推論它較可能是單子葉植物。哪位的推論合理？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C，只有小書合理。雙子葉植物的莖通常具有形成層，形成層外側有韌皮部；剝除外側構造可能切斷韌皮部，葉片製造的有機養分無法向下運到根部，植物會逐漸死亡。單子葉植物通常沒有典型的維管束形成層。",
    solutionSteps: ["葉片製造的有機養分主要經韌皮部運送到根部及其他部位。", "剝除形成層外側構造會傷及韌皮部，造成根部長期得不到有機養分。", "典型形成層常見於雙子葉植物，因此小書的判斷合理，選 C。"],
    teacherTip: "形成層負責次級生長；剝除莖外側構造的題目，常考韌皮部運輸有機養分與木質部運水的差別。",
    answerKeyReview: review(22, 7, "依題幹剝除形成層外側、根部養分中斷的線索核對雙子葉植物推論。"),
  },
  "OFF-0847": {
    question: "金屬常以氧化物形式存在於岩石礦物中。報導指出可利用氫和氧容易反應的特性，從金屬氧化物移除氧，得到純金屬與水。對此反應的分類與理由，何者合理？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A。氫與金屬氧化物反應後和氧結合生成水，氫得到氧而被氧化；金屬氧化物失去氧而被還原，兩者同時發生，因此是氧化還原反應。",
    solutionSteps: ["追蹤氧的去向：氧從金屬氧化物移到氫，形成水。", "氫得到氧，發生氧化；金屬氧化物失去氧，發生還原。", "氧化和還原同時發生，屬氧化還原反應，選 A；不是酸鹼中和。"],
    teacherTip: "判斷氧化還原可追蹤得氧、失氧；得氧為氧化，失氧為還原，兩者成對發生。",
    answerKeyReview: review(23, 7, "依原題對氫移除金屬氧化物中的氧之描述判斷氧化還原反應。"),
  },
  "OFF-0848": {
    question: "在赤道某地連續觀察太陽，第二天 9 時至 12 時間，晴朗無雲時看見的太陽明亮面積由完整逐漸減少，之後恢復。最合理的原因為何？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。太陽明亮面積在白天短時間內減少又恢復，表示有天體遮住部分太陽後離開視線；這是日食，原因是月球運行到太陽與地球之間，月球影子投到地球上。",
    solutionSteps: ["排除雲遮：題目已說天氣晴朗無雲，而且遮蔽後又恢復。", "發生在白天且太陽圓面變暗，是月球遮住太陽造成的日食。", "月球影子落在地球上，選 C；地球自轉進入夜晚不會使觀察到的太陽圓面逐漸被遮住。"],
    teacherTip: "太陽圓面被遮擋是日食；月球進入地球影子、看見月面變暗才是月食。",
    answerKeyReview: review(24, 8, "依原圖第二日上午太陽可見面積下降再回升判定日食；改以文字描述必要圖表現象。"),
  },
  "OFF-0849": {
    question: "圖中甲為岩石，說明指出它由岩漿侵入地殼或流出地表後冷卻凝固形成；乙為岩層近水平、較早形成者位於下方的岩石。甲的碎屑經長時間作用形成乙時，該作用最可能是什麼？",
    options: ["甲為變質岩、乙為沉積岩", "甲為火成岩、乙為火成岩", "丙為高溫與高壓，使岩石成分與結構改變", "丙為壓密與膠結，使碎屑顆粒結合"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 D。岩漿冷卻凝固形成火成岩甲；火成岩風化、侵蝕後形成碎屑，碎屑沉積後經壓密與膠結形成沉積岩乙。高溫高壓造成的是變質作用，不是碎屑變成沉積岩的過程。",
    solutionSteps: ["由岩漿冷卻凝固形成的岩石屬火成岩。", "火成岩碎屑經搬運、沉積後，顆粒間水分減少並受壓密，再由礦物質膠結。", "因此丙是壓密與膠結作用，選 D。"],
    teacherTip: "記住岩石循環：岩漿冷卻成火成岩；碎屑經壓密、膠結成沉積岩；高溫高壓可形成變質岩。",
    answerKeyReview: review(25, 8, "將題本岩石照片旁的生成描述轉錄成題幹文字，答案依岩石循環核對。"),
  },
  "OFF-0850": {
    question: "一個原本不帶電、放在絕緣支架上的金屬球，經感應起電後帶正電。接著以手觸碰金屬球使它接地，最後最可能帶何種電？原因為何？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A。金屬球帶正電代表電子不足；接地時，地球中的電子可經由手流入金屬球，補足原先的電子缺額，使金屬球回到不帶電。正電荷不會像電子一樣在金屬中自由流動。",
    solutionSteps: ["感應起電後金屬球帶正電，表示電子數少於質子數。", "手把金屬球與大地連通後，電子由地球流入金屬球。", "電子補足缺額，金屬球不帶電，選 A。"],
    teacherTip: "金屬導體中可移動的是電子；接地時要依導體原有電性判斷電子流入或流出。",
    answerKeyReview: review(26, 8, "依原題帶正電金屬球接地圖示與電子移動方向核對 A。"),
  },
  "OFF-0851": {
    question: "在一大氣壓下，將 100 g、初溫 −20°C 的冰塊置於燒杯中，以穩定熱源均勻加熱。溫度先上升至圖示平台溫度 T₁，在 t₁ 至 t₂ 間維持平台，之後再上升。下列敘述何者正確？",
    options: ["T₁＝0°C", "t₁ 表示冰塊的熔點", "時間大於 t₂ 後，燒杯中的水只會以氣態存在", "t₁ 至 t₂ 期間，水是固體與氣體共存"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 A。在一大氣壓下，冰融化時的溫度平台是 0°C，所以 T₁＝0°C。t₁、t₂ 是時間點，不是熔點；平台期間是固態冰與液態水共存，超過 t₂ 後液態水升溫，也不代表已全部變成氣體。",
    solutionSteps: ["加熱曲線的第一段平台代表冰正在熔化，吸收的熱量用於狀態改變而非升溫。", "一大氣壓下冰的熔點為 0°C，因此平台溫度 T₁＝0°C。", "t₁、t₂ 的單位是時間；平台是固液共存，故只有 A 正確。"],
    teacherTip: "加熱曲線的平台代表相變；先分清縱軸溫度 T 與橫軸時間 t，並記得熔化時固液共存。",
    answerKeyReview: review(27, 8, "依題本加熱曲線與一大氣壓條件核對熔化平台為 0°C；將必要圖表趨勢文字化。"),
  },
  "OFF-0852": {
    question: "依地面附近空氣的流動分類兩種天氣系統：甲的地面空氣由周圍流入中心，乙的地面空氣由中心向周圍流出。例子中把颱風、太平洋高氣壓範圍列在甲，把蒙古大陸冷氣團列在乙。若要更正分類，哪個調整合理？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。颱風近地面氣流向中心輻合，應屬甲；太平洋高氣壓範圍屬高壓控制區，近地面氣流向外發散，應移至乙；蒙古大陸冷氣團原列乙，不必移動。",
    solutionSteps: ["先按流向辨認：向中心流入的是低壓輻合；由中心向外的是高壓發散。", "颱風是低壓系統，留在甲；太平洋高氣壓範圍屬高壓控制區，移到乙。", "蒙古大陸冷氣團的分類不需改動，因此只移動太平洋高氣壓範圍，選 B。"],
    teacherTip: "判斷近地面氣流時，低壓輻合、高壓發散；氣團與氣壓系統是不同概念，不要混為一談。",
    answerKeyReview: review(28, 9, "完整文字化原表的流向定義與三個天氣例子，依高、低壓近地面氣流方向核對 B。"),
  },
  "OFF-0853": {
    question: "自來水加氯消毒後仍有餘氯。表七是在 25°C 靜置：時間 0、3、5、10、30、60、120、240 分鐘，餘氯量依序為 0.39、0.33、0.28、0.22、0.18、0.15、0.13、0.09 ppm。表八為加熱：時間 0、3、5、10 分鐘及沸騰時，溫度 25、27、31、37°C 及沸騰，餘氯量 0.39、0.30、0.20、0.03、0.00 ppm。哪種判讀最合理？",
    options: ["只看表七即可判斷溫度與餘氯下降的關係", "只看表八即可判斷靜置時間與餘氯下降的關係", "表七可證明 10°C 時餘氯也會隨靜置時間下降", "以表七為靜置對照，可和表八比較以判斷加熱是否降低餘氯"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 D。表七提供不加熱、維持 25°C 時的靜置基準；表八則在相同的初始條件下升溫。以同一時間的數據對照，才能把加熱造成的變化與單純靜置造成的變化區分。單看表七沒有溫度變因；表八中時間與溫度一起改變，不能只靠它拆開兩種影響。",
    solutionSteps: ["控制變因實驗要有可比較的基準。表七固定 25°C，呈現只靜置時餘氯隨時間的變化。", "表八加熱時時間和溫度都改變；單獨看表八，無法確認餘氯下降是時間還是升溫造成。", "把表八與表七相同時間的靜置結果比較，才可評估加熱效果，選 D。"],
    teacherTip: "實驗設計先找對照組，確認要比較的條件是否相同；不要從沒有控制的單一表格過度推論。",
    answerKeyReview: review(29, 9, "完整轉錄原題兩表數據及時間、溫度條件，依控制變因與對照組判斷 D。"),
  },
  "OFF-0854": {
    question: "青蛙有 13 對染色體，其中 1 對是性染色體。不考慮突變，雌蛙的卵細胞經減數分裂後，含有幾條性染色體？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A，1 條。雌蛙體細胞有一對性染色體；減數分裂使染色體數目減半，每個卵細胞只得到其中一條性染色體。",
    solutionSteps: ["題目說雌蛙體細胞有 1 對性染色體，也就是 2 條。", "卵細胞由減數分裂形成，染色體數減半，每對同源染色體只分到其中一條。", "所以卵細胞含 1 條性染色體，選 A。"],
    teacherTip: "減數分裂後每對同源染色體分開；配子取得每一對中的一條，不是把整對帶入。",
    answerKeyReview: review(30, 9, "依題本青蛙 1 對性染色體及減數分裂結果核對為 1 條。"),
  },
};

for (const [id, patch] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 113 Science Q21–30 against original question pages.");
