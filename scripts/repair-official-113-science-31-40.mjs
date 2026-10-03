import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const review = (number, page, note) => ({ status: `已依113年官方自然科題本第${number}題核對`, note, evidenceSources: [`${base}113-science-p${page}.webp`] });
const repairs = {
  "OFF-0855": {
    question: "小茵在臺灣學校觀察正午陽光從教室窗戶照入的範圍。圖中白色區域為當日被直射陽光照到的座位；教室窗戶、座位排列與方位如圖。連續觀察兩個月，受光範圍先由第1排逐漸擴大到第3排，再縮小到第2排。最可能的觀察時段為何？",
    requiresImage: true, requiresContext: false, questionImages: [`${base}113-science-p9.webp`], questionImage: `${base}113-science-p9.webp`,
    explanation: "答案 D，冬至前至冬至後。臺灣位於北半球，冬至前正午太陽高度逐漸降低，陽光以較斜角度由窗戶照入，室內受光範圍向較深處擴大；冬至後正午太陽高度逐漸升高，光線變得較直，照入範圍縮回。題目觀察到先擴大再縮小，符合跨越冬至。",
    solutionSteps: ["先從教室平面圖確認窗戶方位及受光範圍的深淺方向；越往教室內部，表示直射光照得越深。", "正午太陽高度降低時，光線較斜、照入室內較深；太陽高度升高時，光線較直、受光範圍較靠窗。", "範圍先由第1排擴大到第3排、再縮回第2排，表示正午太陽高度先降低再升高，因此跨越冬至，選 D。"],
    teacherTip: "季節判讀可追蹤正午太陽高度：北半球夏至最高、冬至最低；不要把一天中的日出日落方向和季節變化混為一談。",
    answerKeyReview: review(31, 9, "保留必要教室方位與座位圖；依受光深度先增後減判定跨冬至。"),
  },
  "OFF-0856": {
    question: "安賽蜜是甜味劑，不易被人體消化，會由尿液排出。研究團隊測得一座 840 萬公升游泳池中的安賽蜜濃度為 2.1×10⁻⁷ g/L，並由此推算池水約含有 75 公升尿液。若要完成這項換算，最需要參考哪個資料？（濃度 g/L 表示每公升溶液含有的溶質質量。）",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。先用池水體積乘以安賽蜜濃度，求出池中安賽蜜總質量；再用這個質量除以尿液中的安賽蜜濃度，才能換算尿液體積。因此需要加拿大人尿液中安賽蜜的平均濃度。",
    solutionSteps: ["池水中的安賽蜜總質量＝8,400,000 L × 2.1×10⁻⁷ g/L＝1.764 g。", "要由安賽蜜質量反推尿液體積，還需要尿液每公升含多少安賽蜜，也就是尿液中的平均濃度。", "所以應參考加拿大人尿液中安賽蜜的平均濃度，選 D；池水密度或池中溶質總質量都不能直接完成第二步。"],
    teacherTip: "濃度題先確認量綱：總溶質質量＝溶液體積×濃度；若要反推溶液體積，還需要該溶液的濃度。",
    answerKeyReview: review(32, 10, "依原題池容量與濃度計算安賽蜜質量 0.1764 g，並辨認反推尿液體積所需資料。"),
  },
  "OFF-0857": {
    question: "圖示為人體泌尿系統與血管。丙是腎臟；乙血管中的氧氣含量比甲血管高。關於丙的功能及血液流經順序，哪項正確？",
    options: ["形成尿素，甲→丙→乙", "形成尿素，乙→丙→甲", "形成尿液，甲→丙→乙", "形成尿液，乙→丙→甲"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 D。尿素主要在肝臟形成；腎臟負責過濾血液、調節水與鹽類並形成尿液。血液進入腎臟後，部分氧氣供組織使用，因此含氧較高的乙為流入腎臟的血管，含氧較低的甲為流出血管，路徑是乙→丙→甲。",
    solutionSteps: ["先分清器官功能：肝臟形成尿素，腎臟形成尿液。", "腎臟細胞進行代謝會消耗氧氣，所以進入腎臟的血液含氧量較高，離開時較低。", "乙含氧較多，故乙流入丙（腎臟），再由甲流出；選 D。"],
    teacherTip: "泌尿題區分「製造尿素」的肝臟與「形成尿液」的腎臟；血液進出器官時，可用氧氣含量判斷方向。",
    answerKeyReview: review(33, 10, "依原題腎臟標示及甲、乙血氧差轉寫完整選項並判定血流方向。"),
  },
  "OFF-0858": {
    question: "把甲、乙、丙、丁四個不同材質的實心正立方體分別放入 1 L 水中，水的密度為 1.0 g/cm³。各立方體體積與密度為：甲 40 cm³、0.5 g/cm³；乙 30 cm³、1.0 g/cm³；丙 20 cm³、2.0 g/cm³；丁 10 cm³、3.0 g/cm³。它們不反應、不吸水也不溶於水。靜止平衡後，哪一個物體位於液面下的體積最大？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。甲浮起時排開的水體積等於其質量除以水密度：40×0.5÷1＝20 cm³。乙密度等於水，完全浸沒時液面下體積為 30 cm³。丙、丁密度大於水而沉底，完全浸沒，分別為 20、10 cm³。因此乙的液面下體積最大。",
    solutionSteps: ["先算各物體質量：甲 20 g、乙 30 g、丙 40 g、丁 30 g。", "甲密度小於水會浮起，排水量 20 g，液面下體積 20 cm³；乙密度等於水，完全浸沒，液面下 30 cm³。", "丙、丁會沉入水中，完全浸沒，液面下體積分別為 20、10 cm³；最大是乙，選 B。"],
    teacherTip: "浮體的排水體積由重量決定；沉體完全浸沒時，液面下體積等於物體本身體積。",
    answerKeyReview: review(34, 10, "完整轉錄表九數據並以浮力平衡、浸沒體積比較四物體。"),
  },
  "OFF-0859": {
    question: "某小島發生地震，規模為 M，震央震度為 5 弱。圖（二十）標出等震度區及甲、乙、丙三測站；表（十）列出三次地震中部分測站資料，只有一次是本次地震：地震一：甲站震度 5 弱、規模 5.2；地震二：乙站震度 2 級、規模 5.2；地震三：丙站震度 2 級、規模 6.1。依圖中的各站震度分布，M 為何？",
    options: ["M＝5.2", "5.2＜M＜6.1", "M＝6.1", "M＞6.1"],
    requiresImage: true, requiresContext: false, questionImages: [`${base}113-science-p10.webp`], questionImage: `${base}113-science-p10.webp`,
    explanation: "答案 C，M＝6.1。先依等震度圖判讀甲、乙、丙各站震度，再與表中三組「測站震度＋規模」配對。圖中丙站的震度為 2 級，對應表中的地震三，因此本次地震規模是 6.1。震度是各地地面搖晃程度，會隨距離與地質改變；規模則描述地震本身。",
    solutionSteps: ["從等震度圖讀取測站位置所在色帶，確認丙站落在 2 級區。", "表格中符合丙站震度 2 級的資料是地震三，其規模為 6.1。", "因此本次 M＝6.1，選 C；不要把震央震度 5 弱直接當成規模。"],
    teacherTip: "規模是單一地震的能量指標；震度是不同地點的搖晃程度，必須將測站位置與等震度圖對照。",
    answerKeyReview: review(35, 10, "保留必要等震度分布圖；依丙測站落在 2 級區與表十配對核對 M＝6.1。"),
  },
  "OFF-0860": {
    question: "主軸上的 P 點發出光線射向透鏡，圖中標示物距及透鏡後光線的行進情形。哪個選項最可能代表焦距為 10 cm 的凸透鏡？",
    options: ["A", "B", "C", "D"],
    requiresImage: true, requiresContext: false, optionsInImage: true, questionImages: [`${base}113-science-p11.webp`], questionImage: `${base}113-science-p11.webp`,
    explanation: "答案 B。凸透鏡前方物點若位於焦點，經透鏡後的光線會互相平行。圖 B 的物距為 10 cm，且出射光平行，表示焦距約為 10 cm。",
    solutionSteps: ["辨認圖中的物距：P 到透鏡為 10 cm。", "焦點發出的光通過凸透鏡後會平行於主軸；若物點在焦距位置，出射光不會在有限距離會聚。", "符合「物距 10 cm、出射光平行」的是圖 B，故選 B。"],
    teacherTip: "凸透鏡三條特殊光線中，通過焦點的入射光折射後平行主軸；也可用透鏡公式檢查物距與像距。",
    answerKeyReview: review(36, 11, "保留光路選項圖；以物距 10 cm 且出射光平行判斷焦點位置。"),
  },
  "OFF-0861": {
    question: "甲、乙兩種金屬分別與足量鹽酸完全反應，只產生氫氣與金屬氯化物。甲取 24.3 g、乙取 65.4 g，兩次反應都產生 2.0 g 氫氣。比較兩反應消耗的鹽酸質量及產物總質量，何者正確？",
    options: ["鹽酸消耗量相同；產物總質量相同", "鹽酸消耗量相同；產物總質量不同", "鹽酸消耗量不同；產物總質量相同", "鹽酸消耗量不同；產物總質量不同"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 B。兩反應都生成 2.0 g 氫氣，表示被消耗的氫元素質量相同；反應只生成氫氣和金屬氯化物，形成相同量氫氣需消耗相同量的鹽酸。金屬起始質量分別為 24.3 g 和 65.4 g，且金屬完全反應，因此依質量守恆，兩組產物總質量不同。",
    solutionSteps: ["鹽酸中的氫離子形成氫氣；相同的氫氣質量 2.0 g 代表反應提供相同質量的氫。", "每生成 1 mol H₂ 需要 2 mol HCl，因此兩反應消耗的鹽酸量相同。", "金屬質量不同且都完全反應，總反應物質量不同；依質量守恆，產物總質量也不同，選 B。"],
    teacherTip: "化學反應前後總質量守恆；先用氣體生成量比較消耗物，再比較所有反應物總質量。",
    answerKeyReview: review(37, 11, "將表十一四種比較結果轉為文字；依相同氫氣量推得相同 HCl 消耗量，再用質量守恆判斷產物總質量。"),
  },
  "OFF-0862": {
    question: "無摩擦水平面上，質量 M 的木塊原本靜止。水平力 F 推動木塊沿力的方向移動距離 S，外力所作的功全部轉為木塊動能。小明提議把木塊改成質量 2M、其餘條件不變；小華提議改成質量 M/2、其餘條件不變。兩人都認為動能會變成原本的 2 倍。兩人的策略是否合理？",
    options: ["兩人皆合理", "只有小明合理", "只有小華合理", "兩人皆不合理"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 D。功的大小為 F×S；兩個方案都沒有改變外力或位移，所以作功不變。依動能定理，動能改變量等於合力作功，因此改變質量會改變速度，不會使動能變成兩倍。",
    solutionSteps: ["原情境中外力作功 W＝FS；題目說摩擦力為零且作功全轉成動能。", "兩人的方案都只改質量，F 和 S 不變，所以 W 仍是 FS。", "依動能定理，動能增加量等於作功；兩種方案的動能都不會變成 2 倍，選 D。質量不同時速度會相應改變。"],
    teacherTip: "動能定理把「作功」和「動能變化」直接連起來；不要只看質量變大或加速度變化就推斷動能。",
    answerKeyReview: review(38, 11, "完整文字化小明、小華策略；依 W＝FS 及動能定理核對兩者皆不成立。"),
  },
  "OFF-0863": {
    question: "金毛杜鵑的學名為 Rhododendron oldhamii，所屬科為 Ericaceae。若要搜尋與它同屬但不同種的植物，哪種查詢最適合？",
    options: ["搜尋學名第一個字為 Ericaceae 的植物", "搜尋學名第二個字為 oldhamii 的植物", "搜尋學名第一個字為 Rhododendron 的植物", "只搜尋學名 Rhododendron oldhamii"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 C。雙名法的第一個字是屬名，第二個字是種小名。Rhododendron 是屬名；搜尋相同屬名可找到同屬植物，再排除第二個字為 oldhamii 的原種。Ericaceae 是科名，不是學名第一字。",
    solutionSteps: ["先辨認分類階層：Ericaceae 是杜鵑花科；Rhododendron 是屬名；oldhamii 是種小名。", "同屬代表第一個學名相同；不同種則要有不同的種小名。", "因此用 Rhododendron 作為學名第一字搜尋，選 C。"],
    teacherTip: "雙名法順序是「屬名＋種小名」；屬名第一字大寫，種小名小寫，科名不能代替屬名。",
    answerKeyReview: review(39, 11, "依題本學名、屬名與科名核對查詢方式 C。"),
  },
  "OFF-0864": {
    question: "要以直流電源在鐵片表面鍍銅，應選哪個實驗裝置？判讀時須同時確認：鐵片接電源負極作為陰極，銅片接正極作為陽極，電解液為硫酸銅水溶液。",
    options: ["A", "B", "C", "D"],
    requiresImage: true, requiresContext: false, optionsInImage: true, questionImages: [`${base}113-science-p12.webp`], questionImage: `${base}113-science-p12.webp`,
    explanation: "答案 B。電鍍時被鍍物鐵片需接負極作陰極，Cu²⁺在陰極得到電子並沉積成銅；銅片接正極作陽極，可補充溶液中的 Cu²⁺。適當電解液為硫酸銅水溶液，且不需要鹽橋。圖 B 的正負極及電解液配置符合條件。",
    solutionSteps: ["先找被鍍物：鐵片是要鍍上銅的物體，應接直流電源負極，讓 Cu²⁺得到電子還原成銅。", "銅片作正極陽極，銅原子氧化成 Cu²⁺進入溶液；使用硫酸銅水溶液提供銅離子。", "排除電極接反或採用鹽橋電池的裝置，符合配置的是 B。"],
    teacherTip: "電鍍記憶：被鍍物接負極（陰極），鍍層金屬接正極（陽極），電解液含鍍層金屬離子。",
    answerKeyReview: review(40, 12, "保留必要電鍍裝置圖；用陰極、陽極與電解液條件核對 B。"),
  },
};

for (const [id, patch] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 113 Science Q31–40 against original question pages.");
