import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const sourcePage = "./assets/official-exams/113-science-p2.webp";
const review = number => ({
  status: "已依113年官方自然科題本第1頁核對並更正錯置題目",
  note: `原資料把第${number}題誤植成第21–24題的路線實驗內容；已按官方題本改回第${number}題。`,
  evidenceSources: [sourcePage],
});
const repairs = {
  "OFF-0825": {
    question: "圖(一)中，甲、乙兩條路線皆由 X 前往 Y。甲為直線路線，乙為曲折路線。根據圖示，下列有關甲、乙兩路線的位移大小與路徑長關係，何者正確？",
    options: [
      "位移大小：甲＝乙；路徑長：甲＝乙",
      "位移大小：甲＝乙；路徑長：甲＜乙",
      "位移大小：甲＜乙；路徑長：甲＝乙",
      "位移大小：甲＜乙；路徑長：甲＜乙",
    ],
    answer: 1, requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。兩條路線的起點都是 X、終點都是 Y，因此位移只由起終點決定，大小相同。甲走直線，乙走曲折路線；曲折路徑較長，所以甲的路徑長小於乙。",
    solutionSteps: ["分清位移與路徑長：位移只看起點和終點，路徑長則沿實際走過的路線計算。", "甲、乙都從 X 到 Y，故位移大小相等。", "甲是直線、乙是曲折線，甲走的距離較短，因此選 B。"],
    teacherTip: "同起點、同終點的兩種走法，位移相同；路線彎曲與否會改變路徑長。",
    answerKeyReview: review(1),
  },
  "OFF-0826": {
    question: "木糖醇是一種可代替蔗糖的食品添加物。若要知道木糖醇和乙醇是否同屬醇類，應查詢木糖醇的哪一項資訊？",
    options: [
      "分子量",
      "組成原子的種類與排列方式",
      "組成的原子總數是否超過 1000 個",
      "氫原子與氧原子的數目比是否為 1：1",
    ],
    answer: 1, requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。醇類的判定要看分子結構是否含有羥基（—OH）等官能基，單看分子量、原子總數或氫氧原子比例都無法確認官能基及其連接方式，因此需查木糖醇分子中原子的種類與排列結構。",
    solutionSteps: ["先辨認題目要判斷的是物質分類，而不是分子大小或總原子數。", "醇類需從分子結構判斷是否含有羥基等官能基，以及原子如何連接。", "只有原子的種類與排列方式能提供此結構資訊，故選 B。"],
    teacherTip: "判斷有機物的官能基要看結構式；分子量和元素比例通常不足以判定原子如何連接。",
    answerKeyReview: review(2),
  },
  "OFF-0827": {
    question: "圖(二)為臺灣一週的氣溫預報圖，呈現不同地區氣溫隨時間的變化；橫軸刻度代表當日正午 12 點。若媒體想根據圖(二)，以簡易標題說明未來幾天的天氣概況，下列哪一說法最合適？",
    options: [
      "11/07 起，北部轉冷，中、南部變得更熱",
      "11/08 起，全臺連日豪雨持續一週",
      "11/08 起，冷空氣南下，當日北部氣溫驟降",
      "11/10 起，中部天氣趨於穩定，日夜溫差逐漸變小",
    ],
    answer: 2, requiresImage: true, requiresContext: false, questionImages: [sourcePage], questionImage: sourcePage,
    explanation: "答案 C。圖中的北部氣溫在 11/08 明顯下降，符合冷空氣南下、北部當日降溫的敘述。圖只呈現氣溫，無法據此判定豪雨；11/07 中南部也沒有持續升溫的趨勢；11/10 後中部日夜溫差仍有明顯起伏，不能說逐漸變小。",
    solutionSteps: ["先看圖例確認北部曲線，再比較 11/07 與 11/08 的正午氣溫變化。", "北部曲線在 11/08 明顯下滑，支持冷空氣南下、北部降溫的標題。", "氣溫圖不能推出降雨量；其他地區的升降與日夜溫差也不符合 A、D，因此選 C。"],
    teacherTip: "解讀預報圖時先對照圖例和日期；氣溫資料不能直接推論降雨，標題也不能把單日變化說成整週趨勢。",
    answerKeyReview: review(3),
  },
  "OFF-0828": {
    question: "圖(三)為元素週期表的一部分。根據圖中資料，下列何項資訊無法得知？",
    options: [
      "氟原子與氯原子的質子數分別為多少",
      "氟原子與氯原子是否有相似的化學性質",
      "氟原子與氯原子在自然界中含量相較何者較多",
      "1 莫耳氯氣（Cl₂）與 1 莫耳溴（Br₂）何者質量較大",
    ],
    answer: 2, requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。週期表可讀出原子序以得知質子數；氟與氯同屬第 17 族，可推知化學性質相似；原子量也能比較 Cl₂ 與 Br₂ 的莫耳質量。元素在自然界中的實際含量不由週期表提供，因此無法從圖中判斷 C。",
    solutionSteps: ["由原子序可知氟、氯的質子數；同族元素通常有相似的化學性質。", "表中的原子量可分別計算 Cl₂ 與 Br₂ 的莫耳質量，溴的莫耳質量較大。", "週期表沒有提供元素在自然界的豐度資料，所以選 C。"],
    teacherTip: "週期表提供原子序、族與原子量等資訊；自然界含量屬於另外的實測資料。",
    answerKeyReview: review(4),
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 113 Science Q1–4; removed misassigned Q21–24 content.");
