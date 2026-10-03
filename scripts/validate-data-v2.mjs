import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const required = ["id", "subject", "gradeSemester", "unit", "knowledgePoint", "difficulty", "type", "question", "explanation", "solutionSteps", "teacherTip", "relatedWords", "sourceType", "review"];
const allIds = new Set();
const allQuestions = new Set();
const errors = [];
let total = 0;

const contextPattern = /根據(?:本文|上文|文章|選文|材料|短文|報導|資料)|依據(?:本文|上文|文章|選文|材料|短文|報導|資料)|本文(?:中|主旨|作者|提到|認為|敘述|寫作)|文中(?:提到|指出|敘述|作者)|這篇(?:文章|短文)|由本文|閱讀(?:本文|上文|下文|文章|選文|材料)|according to (?:the|this) (?:text|article|reading|passage)|in the (?:text|article|reading|passage)|the writer|the author/i;

function answerIsNamed(question) {
  if (!Number.isInteger(question.answer) || !question.options?.[question.answer]) return false;
  const solution = `${question.explanation} ${(question.solutionSteps || []).join(" ")}`;
  if (solution.toLowerCase().includes(String(question.options[question.answer]).toLowerCase())) return true;
  const letter = String.fromCharCode(65 + question.answer);
  return new RegExp(`(?:answer|correct answer|答案|正解|正確答案|標答|選項|故選|所以選|因此)\\s*(?:is|為|是|:|=)?\\s*[「"']?${letter}\\b`, "i").test(solution);
}

function validate(question, location) {
  const isConstructedResponse = question.type === "非選擇題";
  for (const field of required) {
    if (!(field in question) || question[field] === "" || question[field] === null) errors.push(`${location}: 缺少 ${field}`);
  }
  if (isConstructedResponse) {
    if (!Array.isArray(question.options) || question.options.length !== 0 || question.answer !== null) errors.push(`${location}: 非選題不可保留選項或索引答案`);
    if (!Array.isArray(question.responseParts) || question.responseParts.length < 2) errors.push(`${location}: 非選題至少需兩個小題答案`);
    for (const [index, part] of (question.responseParts || []).entries()) {
      if (!part.label || !part.prompt || !part.answerDisplay || !Array.isArray(part.acceptableAnswers) || !part.acceptableAnswers.length) errors.push(`${location}: 非選題第 ${index + 1} 小題資料不完整`);
      const solution = `${question.explanation} ${(question.solutionSteps || []).join(" ")}`;
      if (part.answerDisplay && !solution.includes(part.answerDisplay)) errors.push(`${location}: 非選題第 ${index + 1} 小題答案未出現在解析中`);
    }
  } else {
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${location}: 選項數量不是 4`);
    if (new Set(question.options).size !== question.options.length) errors.push(`${location}: 選項重複`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) errors.push(`${location}: 答案索引無效`);
  }
  if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 3) errors.push(`${location}: 解題步驟不足`);
  if (question.subject === "數學" && /^(?:無|元|公里|平方公分|分|分鐘|度|人|張|公分)$/.test(question.unit)) errors.push(`${location}: 數學單元欄不可填答案單位或「無」`);
  if (question.subject === "英文" && (!Array.isArray(question.relatedWords) || question.relatedWords.length < 2)) errors.push(`${location}: 缺少英文提示`);
  if (question.subject === "英文" && !isConstructedResponse && !answerIsNamed(question)) errors.push(`${location}: 英文解析未能明確指出標答`);
  if (question.subject === "英文" && /\b(?:in|according to) (?:report|passage|text|article)\s+\d+/i.test(question.question)) errors.push(`${location}: 英文題引用未提供的材料`);
  const contextIsEmbedded = /(?:【(?:閱讀材料(?:摘要|改寫(?:自)?|自)?[^】]*|資料(?:[甲乙])?)】|閱讀材料(?:（|\(|:)|對話(?:（|\(|:)|Katie 的日記|Reading material(?::|】)|大將軍仇鸞，始為曾銑所劾)/i.test(question.question);
  if (question.sourceType === "官方歷屆真題" && (!question.source?.year || !question.source?.questionNumber || !question.source?.url || typeof question.requiresImage !== "boolean" || (question.requiresImage && !question.questionImage) || (question.requiresContext && !question.questionImages?.length && !contextIsEmbedded))) errors.push(`${location}: 真題來源、圖表判斷或後台紀錄不完整`);
  if (!isConstructedResponse && question.sourceType === "官方歷屆真題" && question.options.join("") === "ABCD" && !question.requiresImage) errors.push(`${location}: 文字真題選項尚未拆分`);
  if (question.sourceType === "官方歷屆真題" && contextPattern.test(question.question) && !contextIsEmbedded && (!question.requiresContext || !question.questionImages?.length)) errors.push(`${location}: 引用本文但缺少閱讀材料`);
  if (question.sourceType === "官方歷屆真題" && question.requiresContext && !question.questionImages?.length && !contextIsEmbedded) errors.push(`${location}: 題組前文缺少材料頁`);
  if (question.sourceType === "官方歷屆真題" && question.optionsInImage && (!question.requiresImage || question.options.some((option, index) => option !== "ABCD"[index]))) errors.push(`${location}: 圖片選項設定錯誤`);
  if (/試題結束|請翻頁繼續作答|\(cid:\d+\)/i.test(`${question.question} ${(question.options || []).join(" ")}`)) errors.push(`${location}: 含試卷頁尾或 OCR 雜訊`);
  if (allIds.has(question.id)) errors.push(`${location}: ID 重複 ${question.id}`);
  else allIds.add(question.id);
  const normalized = `${question.question}|${(question.options || []).join("|")}`.replace(/\s+/g, "").toLowerCase();
  if (allQuestions.has(normalized) && !question.requiresImage) errors.push(`${location}: 題幹與選項重複`);
  else allQuestions.add(normalized);
  total++;
}

for (const file of files) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  if (rows.length !== 1000) errors.push(`${file}: 題數 ${rows.length}`);
  rows.forEach((question, index) => validate(question, `${file}[${index}]`));
  console.log(`${file}: ${rows.length} 題通過格式掃描`);
}

const scienceAuthored = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const scienceTopicBatch = scienceAuthored.filter(question => /^SCI-06(?:0[1-9]|1\d|20)$/.test(question.id));
const respiratoryTopicCount = scienceTopicBatch.filter(question => /呼吸|肺泡|氣體交換|血氧|支氣管|肺循環|運氧/.test(question.knowledgePoint)).length;
if (scienceTopicBatch.length !== 20 || respiratoryTopicCount > 7) errors.push(`SCI-0601–0620: 題目數應為20，呼吸系統考點最多7題（目前 ${scienceTopicBatch.length} 題、${respiratoryTopicCount} 題）`);
for (const [id, unit, point] of [["SCI-0602", "生物", "人體恆定與排汗"], ["SCI-0604", "生物", "人體骨骼與關節"], ["SCI-0607", "生物", "天擇與族群變化"], ["SCI-0608", "理化", "介質中的波速與頻率變化"], ["SCI-0609", "地球科學", "日食觀測安全"], ["SCI-0610", "理化", "化學反應中的沉澱"], ["SCI-0614", "生物", "濕地生物多樣性與食物網"], ["SCI-0615", "地球科學", "化石與古氣候推論"], ["SCI-0616", "地球科學", "露點與凝結"], ["SCI-0617", "地球科學", "天氣與氣候尺度"], ["SCI-0618", "地球科學", "等壓線與風力"], ["SCI-0619", "生物", "心臟瓣膜與血液逆流"], ["SCI-0620", "理化", "位置時間資料與速率"]]) {
  const question = scienceAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point) errors.push(`${id}: 經審題目單元或考點回歸錯誤`);
}

const mission = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const clientScript = await readFile(join(root, "app.js"), "utf8");
const appShell = await readFile(join(root, "index.html"), "utf8");
const social114IcebergMapSvg = await readFile(join(root, "assets", "official-exams", "114-social-q53-iceberg-map.svg"), "utf8");
mission.forEach((question, index) => validate(question, `mission[${index}]`));
const questionDataVersion = clientScript.match(/QUESTION_DATA_VERSION="([^"]+)"/)?.[1];
if (!questionDataVersion || !serviceWorker.includes(`./data/mission-questions.json?v=${questionDataVersion}`)) errors.push("題庫版本與服務工作者快取版本不一致");
for (const [assetIndex, pattern] of [[1, /href="\.\/(styles\.css\?v=[^"]+)"/], [2, /src="\.\/(bootstrap\.js\?v=[^"]+)"/]]) {
  const entry = appShell.match(pattern)?.[1];
  if (!entry || !serviceWorker.includes(`ASSETS[${assetIndex}]="./${entry}"`)) errors.push(`主頁資源與服務工作者第${assetIndex}項快取版本不一致`);
}
const math114ConstructedOne = mission.find(question => question.id === "OFF-0960");
if (!math114ConstructedOne || math114ConstructedOne.requiresImage || math114ConstructedOne.questionImage || math114ConstructedOne.questionImages?.length || math114ConstructedOne.requiresContext || !["人口占比", "調查比率", "56%", "49%", "20%／40%"].every(value => math114ConstructedOne.question.includes(value))) errors.push("114數學非選第1題: 公式與完整表格資料須可直接閱讀，且不可顯示整頁試卷圖");
const math114ConstructedTwo = mission.find(question => question.id === "OFF-0961");
if (!math114ConstructedTwo?.requiresImage || math114ConstructedTwo.questionImage !== "./assets/official-exams/114-math-q02-tiling-diagram.svg" || math114ConstructedTwo.questionImages?.length !== 1 || !serviceWorker.includes("114-math-q02-tiling-diagram.svg")) errors.push("114數學非選第2題: 只應顯示拼貼示意圖裁切，並加入離線快取");
const math114SymmetryQuestion = mission.find(question => question.id === "OFF-0962");
if (math114SymmetryQuestion?.answer !== 2 || !math114SymmetryQuestion.explanation.includes("中央垂直線") || !math114SymmetryQuestion.explanation.includes("中央水平線") || math114SymmetryQuestion.questionImages?.[0] !== "./assets/official-exams/114-math-q03-line-symmetry.svg") errors.push("114數學第3題: 各線段刪除組合須有可檢查的對稱軸理由，並保留線段圖");
for (const id of ["OFF-0962", "OFF-0963", "OFF-0964", "OFF-0965", "OFF-0966", "OFF-0967", "OFF-0968", "OFF-0969"]) {
  const question = mission.find(item => item.id === id);
  if (!question?.teacherTip || question.teacherTip.includes("先列出已知條件與所求")) errors.push(`${id}: 教師提示不可使用通用模板`);
}
const math114FoldingQuestion = mission.find(question => question.id === "OFF-0979");
if (!math114FoldingQuestion?.requiresImage || math114FoldingQuestion.questionImages?.length !== 1 || math114FoldingQuestion.questionImages[0] !== "./assets/official-exams/114-math-q20-folding-diagrams.svg" || !serviceWorker.includes("114-math-q20-folding-diagrams.svg")) errors.push("114數學第20題: 摺疊圖須單獨裁切並納入離線快取");
for (const id of ["OFF-0970", "OFF-0971", "OFF-0972", "OFF-0973", "OFF-0974", "OFF-0975", "OFF-0976", "OFF-0977", "OFF-0978", "OFF-0979"]) {
  const question = mission.find(item => item.id === id);
  if (!question?.teacherTip || question.teacherTip.includes("先列出已知條件與所求")) errors.push(`${id}: 教師提示不可使用通用模板`);
}
const math112ConstructedOne = mission.find(question => question.id === "OFF-0532");
if (!math112ConstructedOne || math112ConstructedOne.requiresImage || math112ConstructedOne.questionImage || math112ConstructedOne.questionImages?.length || math112ConstructedOne.requiresContext || !math112ConstructedOne.question.includes("疫苗效力公式")) errors.push("112數學非選第1題: 公式與條件已完整文字呈現，不應再顯示整頁試卷圖");
const math112ConstructedTwo = mission.find(question => question.id === "OFF-0533");
if (!math112ConstructedTwo?.requiresImage || math112ConstructedTwo.questionImage !== "./assets/official-exams/112-math-nonchoice-q02-main-figures.svg" || math112ConstructedTwo.questionImages?.length !== 2 || math112ConstructedTwo.questionImages.some(path => /112-math-p1[12]\.webp/.test(path)) || !serviceWorker.includes("112-math-nonchoice-q02-main-figures.svg") || !serviceWorker.includes("112-math-nonchoice-q02-reference-triangles.svg")) errors.push("112數學非選第2題: 僅顯示題目相關裁切圖並加入離線快取，不得展示整頁掃描");
const math113GridQuestion = mission.find(question => question.id === "OFF-0749");
if (!math113GridQuestion?.requiresImage || math113GridQuestion.questionImages?.length !== 2 || math113GridQuestion.questionImages.some(path => /113-math-p3\.webp/.test(path)) || !serviceWorker.includes("113-math-q04-reference-grid.svg") || !serviceWorker.includes("113-math-q04-axis-options.svg")) errors.push("113數學第4題: 方格紙與座標選項須使用局部圖，不得出現整頁掃描並須離線快取");
const math113TreeQuestion = mission.find(question => question.id === "OFF-0750");
if (!math113TreeQuestion?.requiresImage || math113TreeQuestion.questionImage !== "./assets/official-exams/113-math-q05-tree-pattern.svg" || !serviceWorker.includes("113-math-q05-tree-pattern.svg")) errors.push("113數學第5題: 便利貼圖需使用題目局部裁切並離線快取");
const math113BallQuestion = mission.find(question => question.id === "OFF-0751");
if (!math113BallQuestion || /\(A\)|\(B\)|\(C\)|\(D\)|(?:^|\s)\d\s*\(/.test(math113BallQuestion.question) || !math113BallQuestion.question.includes("前 30 次共抽出 4 顆紅球")) errors.push("113數學第6題: 題幹不得殘留選項 OCR 碎片，且須完整保留抽球條件");
const math113SymmetryQuestion = mission.find(question => question.id === "OFF-0752");
if (!math113SymmetryQuestion?.requiresImage || math113SymmetryQuestion.questionImage !== "./assets/official-exams/113-math-q07-symmetry-figures.svg" || math113SymmetryQuestion.questionImages?.length !== 1 || !serviceWorker.includes("113-math-q07-symmetry-figures.svg")) errors.push("113數學第7題: 對稱圖案須使用局部裁切並離線快取");
if (math113TreeQuestion?.questionImages?.some(path => /113-math-p3\.webp/.test(path)) || math113SymmetryQuestion?.questionImages?.some(path => /113-math-p4\.webp/.test(path))) errors.push("113數學第5、7題: 不得將整頁試卷掃描當題目插圖");
const math113CongruentParallelograms = mission.find(question => question.id === "OFF-0763");
if (!math113CongruentParallelograms?.explanation.includes("∠EFG＝∠EFC") || math113CongruentParallelograms.questionImages?.[0] !== "./assets/official-exams/113-math-q18-parallelogram.svg" || !serviceWorker.includes("113-math-q18-parallelogram.svg")) errors.push("113數學第18題: 全等角推理須連結 C 在線段 FG 上，並使用局部圖");
const math113AngleSumQuestion = mission.find(question => question.id === "OFF-0765");
if (!math113AngleSumQuestion?.explanation.includes("∠1−∠3＝5°") || !math113AngleSumQuestion.explanation.includes("∠4−∠2＝5°") || math113AngleSumQuestion.questionImages?.[0] !== "./assets/official-exams/113-math-q20-angle-figure.svg" || !serviceWorker.includes("113-math-q20-angle-figure.svg")) errors.push("113數學第20題: 四邊形內角和推導須正確且使用局部圖");
for (const id of ["OFF-0748", "OFF-0750", "OFF-0752", "OFF-0753", "OFF-0754", "OFF-0755"]) {
  const question = mission.find(item => item.id === id);
  if (!question?.teacherTip || question.teacherTip.includes("先列出已知條件與所求")) errors.push(`${id}: 教師提示不可使用通用模板`);
}
for (const [id, imageName] of [["OFF-0766", "113-math-q21-semicircles.svg"], ["OFF-0767", "113-math-q22-area-triangle.svg"], ["OFF-0768", "113-math-q23-folded-trapezoid.svg"]]) {
  const question = mission.find(item => item.id === id);
  if (!question?.requiresImage || question.questionImages?.length !== 1 || !question.questionImages[0].endsWith(imageName) || !serviceWorker.includes(imageName)) errors.push(`${id}: 只顯示題目局部圖並加入離線快取`);
}
for (const id of ["OFF-0746", "OFF-0747"]) {
  const question = mission.find(item => item.id === id);
  if (!question?.requiresImage || question.questionImages?.length !== 3 || question.questionImages.some(path => /113-math-p1[12]\.webp/.test(path) || !serviceWorker.includes(path.split("/").pop()))) errors.push(`${id}: 非選題相關圖須以局部圖呈現，不可載入整頁掃描，且須離線快取`);
}
for (const id of ["OFF-0756", "OFF-0757", "OFF-0758", "OFF-0759", "OFF-0760", "OFF-0761", "OFF-0762", "OFF-0763", "OFF-0764", "OFF-0765", "OFF-0766", "OFF-0767", "OFF-0768", "OFF-0769", "OFF-0770"]) {
  const question = mission.find(item => item.id === id);
  if (!question?.teacherTip || question.teacherTip.includes("先列出已知條件與所求")) errors.push(`${id}: 教師提示不可使用通用模板`);
}
const math110PromotionQuestion = mission.find(question => question.id === "OFF-0105");
if (math110PromotionQuestion?.answer !== 1 || math110PromotionQuestion.requiresImage || math110PromotionQuestion.question.includes("圖（六）") || !math110PromotionQuestion.question.includes("每組優惠價 39 元") || !math110PromotionQuestion.explanation.includes("多付 61−48=13 元")) errors.push("110數學第16題: 促銷條件需完整文字呈現且不得保留未顯示的圖號");
const social110ReturnQuestion = mission.find(question => question.id === "OFF-0140");
if (social110ReturnQuestion?.answer !== 2 || social110ReturnQuestion.requiresImage || social110ReturnQuestion.question.includes("圖(十一)") || !social110ReturnQuestion.question.includes("剛好 20%") || !social110ReturnQuestion.explanation.includes("獲利÷投資本金")) errors.push("110社會第25題: 報酬率資料需完整呈現在文字中，不得依賴未顯示圖表");
const social110WindCorridorQuestion = mission.find(question => question.id === "OFF-0149");
if (social110WindCorridorQuestion?.answer !== 3 || !social110WindCorridorQuestion.requiresImage || !social110WindCorridorQuestion.solutionSteps?.some(step => step.includes("南北"))) errors.push("110社會第34題: 風花圖解釋須指出主風向軸並保留原圖");
const cloudedLeopardMapQuestion = mission.find(question => question.id === "OFF-0175");
if (cloudedLeopardMapQuestion?.answer !== 0 || !cloudedLeopardMapQuestion.requiresImage || !cloudedLeopardMapQuestion.question.includes("調查三年多仍未發現雲豹") || !cloudedLeopardMapQuestion.question.includes("排除距村莊、部落或主要道路 3 公里內")) errors.push("110社會第60題: 地圖題須保留完整共同材料與原圖");
const science110Q1 = mission.find(question => question.id === "OFF-0179");
if (science110Q1?.source?.questionNumber !== 1 || science110Q1?.answer !== 0 || !science110Q1.requiresImage || !science110Q1.questionImage?.includes("110-science-q01-table.png")) errors.push("110自然第1題: 天平注意事項題須對應官方題號、標答及表格圖");
const science110Q2 = mission.find(question => question.id === "OFF-0180");
if (science110Q2?.source?.questionNumber !== 2 || science110Q2?.answer !== 3 || science110Q2.requiresImage || science110Q2.requiresContext || !science110Q2.question.includes("潮差高度不可能") || !science110Q2.explanation.includes("2−(−2)=4")) errors.push("110自然第2題: 潮差題須完整文字呈現並維持官方答案D");
const science110Q3 = mission.find(question => question.id === "OFF-0181");
if (science110Q3?.source?.questionNumber !== 3 || science110Q3?.answer !== 2 || !science110Q3.requiresImage || !science110Q3.questionImage?.includes("110-science-q03-map.png")) errors.push("110自然第3題: 地震警報圖須保留且答案索引須為C");
const science110Q7 = mission.find(question => question.id === "OFF-0185");
if (science110Q7?.source?.questionNumber !== 7 || science110Q7?.answer !== 0 || !science110Q7.requiresImage || !science110Q7.questionImage?.includes("110-science-q07-table.png") || !science110Q7.explanation.includes("5.1×10⁴ CFU/g")) errors.push("110自然第7題: 銀幣實驗須保留表格、測量單位與官方答案A");
const science110Q12 = mission.find(question => question.id === "OFF-0190");
if (science110Q12?.source?.questionNumber !== 12 || science110Q12?.answer !== 3 || !science110Q12.requiresImage || !science110Q12.questionImage?.includes("110-science-q12-chart.png") || science110Q12.options?.some(option => /\(21%\)|\(1%\)/.test(option))) errors.push("110自然第12題: 空氣成分圖須保留，圖標籤不可混入選項");
const science110Q17 = mission.find(question => question.id === "OFF-0195");
if (science110Q17?.source?.questionNumber !== 17 || science110Q17?.answer !== 0 || !science110Q17.requiresImage || science110Q17.options?.some(option => /1002|1006/.test(option))) errors.push("110自然第17題: 等壓線數值應留在圖中，不可混入選項");
const science110Q19 = mission.find(question => question.id === "OFF-0197");
if (science110Q19?.source?.questionNumber !== 19 || science110Q19?.answer !== 1 || !science110Q19.requiresImage || /\b100\s*圖\(八\)|\b80\s*深色|\b60\s*時期/.test(science110Q19.question)) errors.push("110自然第19題: 蛾類比例圖需保留且題幹不可混入座標刻度");
const science110Q23 = mission.find(question => question.id === "OFF-0201");
if (science110Q23?.source?.questionNumber !== 23 || science110Q23?.answer !== 2 || /正確答案為 C|比例 2 2/.test(science110Q23.explanation)) errors.push("110自然第23題: NO/NO₂氧化還原解釋不可殘留 OCR 亂碼");
const science110Q24 = mission.find(question => question.id === "OFF-0202");
if (science110Q24?.source?.questionNumber !== 24 || science110Q24?.answer !== 0 || science110Q24.requiresImage || science110Q24.question.includes("表(六)")) errors.push("110自然第24題: 燈泡資料完整轉錄後不得引用未呈現的表格");
const science110Q33 = mission.find(question => question.id === "OFF-0211");
if (science110Q33?.source?.questionNumber !== 33 || science110Q33?.answer !== 1 || !science110Q33.requiresImage || !science110Q33.questionImage?.includes("110-science-q33-electrolysis.png")) errors.push("110自然第33題: 電鍍與電解接線圖須保留且答案為碳棒乙");
const science110Q43 = mission.find(question => question.id === "OFF-0221");
if (science110Q43?.source?.questionNumber !== 43 || science110Q43?.answer !== 1 || !science110Q43.requiresImage || !science110Q43.questionImage?.includes("110-science-q43-speed-graphs.png") || /\(A\).*\(B\).*v\(m\/s\)/.test(science110Q43.question)) errors.push("110自然第43題: 速度圖選項須由圖像承載，題幹不可殘留座標 OCR");
const science110Q52 = mission.find(question => question.id === "OFF-0230");
if (science110Q52?.source?.questionNumber !== 52 || science110Q52?.answer !== 1 || !science110Q52.requiresImage || !science110Q52.questionImage?.includes("110-science-q52-evolution-tree.png") || !science110Q52.question.includes("151–149 Ma")) errors.push("110自然第52題: 恐龍演化樹圖與年代表材料不得缺漏");
const science110Q53 = mission.find(question => question.id === "OFF-0231");
if (science110Q53?.source?.questionNumber !== 53 || science110Q53?.answer !== 3 || !science110Q53.requiresImage || !science110Q53.questionImage?.includes("110-science-q53-strata-options.png")) errors.push("110自然第53題: 地層剖面四選項圖須保留且答案索引為D");
const science110Q54 = mission.find(question => question.id === "OFF-0232");
if (science110Q54?.source?.questionNumber !== 54 || science110Q54?.answer !== 1 || !/三角龍\s*68–65 Ma/.test(science110Q54.question) || !/暴龍\s*68–66 Ma/.test(science110Q54.question)) errors.push("110自然第54題: 化石年代比較所需共用資料不完整");
const science111Q8 = mission.find(question => question.id === "OFF-0404");
if (science111Q8?.source?.year !== 111 || science111Q8?.source?.questionNumber !== 8 || science111Q8?.answer !== 1 || !science111Q8.explanation.includes("氫原子、口腔皮膜細胞、月球、太陽")) errors.push("111自然第8題: 尺度比較題的正確次序及答案索引錯誤");
const science111Q10 = mission.find(question => question.id === "OFF-0406");
if (science111Q10?.source?.year !== 111 || science111Q10?.source?.questionNumber !== 10 || science111Q10?.answer !== 0 || !science111Q10.explanation.includes("部分電離")) errors.push("111自然第10題: 蘋果酸電解質說明需指出弱酸部分電離");
for (const [id, yearQuestion, image] of [["OFF-0411", 15, "111-science-q15-aquifer.png"], ["OFF-0412", 16, "111-science-q16-magnetic-grid.png"], ["OFF-0413", 17, "111-science-q17-microscopes.png"], ["OFF-0416", 20, "111-science-q20-climate-chart.png"]]) {
  const question = mission.find(item => item.id === id);
  if (question?.source?.year !== 111 || question.source.questionNumber !== yearQuestion || !question.requiresImage || !question.questionImage?.includes(image)) errors.push(`${id}: 必要官方圖表或題號設定錯誤`);
}
for (const id of ["OFF-0410", "OFF-0411", "OFF-0412", "OFF-0413", "OFF-0414", "OFF-0415", "OFF-0416"]) {
  const question = mission.find(item => item.id === id);
  if (!question || question.solutionSteps.some(step => step.includes("先依題目條件判讀") || step.includes("此選項必須同時符合"))) errors.push(`${id}: 解題過程仍是通用套版，須說明本題推理`);
}
const englishAuthored = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
for (const [id, answer, unit, evidence] of [["ENG-0387", 1, "功能性閱讀", "larger than 5 mm"], ["ENG-0389", 2, "功能性閱讀", "2:35 p.m."], ["ENG-0391", 0, "功能性閱讀", "40 minutes"], ["ENG-0394", 1, "功能性閱讀", "300 × 1.5 = 450 g"], ["ENG-0397", 2, "功能性閱讀", "$80 − $20 = $60"], ["ENG-0399", 0, "對話理解", "take half"], ["ENG-0400", 3, "功能性閱讀", "requested"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || question.unit !== unit || !question.question.includes(evidence) && !question.explanation.includes(evidence)) errors.push(`${id}: 經審閱讀題的證據、單元或答案索引回歸錯誤`);
}
for (const [id, answer, point, evidence] of [["ENG-0409", 1, "百分率基準與路程比較", "2.4÷6.4×100%＝37.5%"], ["ENG-0414", 2, "均分與單價計算", "45 ÷ 3 = 15"], ["ENG-0419", 1, "開放時間與剩餘時長", "30 minutes"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || question.unit !== "功能性閱讀" || question.knowledgePoint !== point || !question.explanation.includes(evidence)) errors.push(`${id}: 數量／時間題的考點分類、答案索引或計算解析錯誤`);
}
const conditionalNoticeQuestion = englishAuthored.find(question => question.id === "ENG-0436");
if (conditionalNoticeQuestion?.answer !== 3 || conditionalNoticeQuestion.unit !== "功能性閱讀" || !conditionalNoticeQuestion.question.includes("The road is still flooded") || !conditionalNoticeQuestion.explanation.includes("classes will be held online")) errors.push("ENG-0436: 公告條件、題目情境或標答解釋不一致");
const imperativeConditionalQuestion = englishAuthored.find(question => question.id === "ENG-0421");
if (imperativeConditionalQuestion?.knowledgePoint !== "條件句與祈使句") errors.push("ENG-0421: 祈使句型的考點分類錯誤");
const emptyTabletBatteryQuestion = englishAuthored.find(question => question.id === "ENG-0431");
if (emptyTabletBatteryQuestion?.answer !== 0 || !emptyTabletBatteryQuestion.question.includes("already at 0%") || !emptyTabletBatteryQuestion.explanation.includes("at 0%")) errors.push("ENG-0431: 平板無電的未來結果缺少必要電量條件");
const icePhaseChangeQuestion = englishAuthored.find(question => question.id === "ENG-0441");
if (icePhaseChangeQuestion?.answer !== 1 || !icePhaseChangeQuestion.question.includes("standard atmospheric pressure") || !icePhaseChangeQuestion.question.includes("liquid water")) errors.push("ENG-0441: 冰的相變題缺少標準壓力或正確液態產物資訊");
const saltSolutionQuestion = englishAuthored.find(question => question.id === "ENG-0490");
if (saltSolutionQuestion?.answer !== 0 || !saltSolutionQuestion.question.includes("salt dissolves in water") || !saltSolutionQuestion.question.includes("solution's freezing point")) errors.push("ENG-0490: 鹽水凝固點題缺少溶液條件或考點錯置");
const pastPlantCounterfactual = englishAuthored.find(question => question.id === "ENG-0496");
if (pastPlantCounterfactual?.answer !== 2 || !pastPlantCounterfactual.question.includes("soil was still damp") || !pastPlantCounterfactual.question.includes("identical plant")) errors.push("ENG-0496: 第三類條件句缺少可比較的過去情境");
const villageRoadCondition = englishAuthored.find(question => question.id === "ENG-0499");
if (villageRoadCondition?.answer !== 1 || !villageRoadCondition.question.includes("only road") || !villageRoadCondition.question.includes("landslide")) errors.push("ENG-0499: 道路無法通行的情境前提不足");
const firstConditionalMetadata = englishAuthored.find(question => question.id === "ENG-0500");
if (firstConditionalMetadata?.knowledgePoint !== "第一類條件句") errors.push("ENG-0500: 條件句考點分類錯誤");
const futurePassiveQuestion = englishAuthored.find(question => question.id === "ENG-0534");
if (futurePassiveQuestion?.answer !== 2 || !futurePassiveQuestion.question.includes("by the mayor") || !futurePassiveQuestion.explanation.includes("future passive")) errors.push("ENG-0534: 未來被動題未提供施事者線索或正確答案索引");
const zooFeedingRuleQuestion = englishAuthored.find(question => question.id === "ENG-0542");
if (zooFeedingRuleQuestion?.answer !== 3 || !zooFeedingRuleQuestion.question.includes("rules prohibit feeding") || !zooFeedingRuleQuestion.explanation.includes("prohibition")) errors.push("ENG-0542: 禁止餵食規則未提供明示依據或答案索引錯誤");
const audioGuideCostQuestion = englishAuthored.find(question => question.id === "ENG-0576");
if (audioGuideCostQuestion?.answer !== 1 || audioGuideCostQuestion.unit !== "生活數據閱讀" || !audioGuideCostQuestion.explanation.includes("$18 − $12 = $6")) errors.push("ENG-0576: 語音導覽差額題的分類、答案索引或計算錯誤");
const evidenceBasedMatchQuestion = englishAuthored.find(question => question.id === "ENG-0641");
if (evidenceBasedMatchQuestion?.answer !== 0 || !evidenceBasedMatchQuestion.question.includes("scored three goals") || !evidenceBasedMatchQuestion.explanation.includes("比分是三比一")) errors.push("ENG-0641: 比賽結果題須以比分提供直接證據");
for (const id of Array.from({ length: 10 }, (_, index) => `ENG-${String(642 + index).padStart(4, "0")}`)) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question?.explanation || question.explanation.includes("答案選項") || question.explanation.includes("正確：") || question.explanation.includes("不正確：")) errors.push(`${id}: 英文解說模板不可殘留，需使用完整中文解析`);
}
const independentVideoEditingQuestion = englishAuthored.find(question => question.id === "ENG-0599");
if (independentVideoEditingQuestion?.answer !== 3 || !independentVideoEditingQuestion.question.includes("without help from a teacher") || !independentVideoEditingQuestion.explanation.includes("themselves")) errors.push("ENG-0599: 反身代名詞題未交代獨立完成情境或答案索引錯誤");
const nextMondayVisitQuestion = englishAuthored.find(question => question.id === "ENG-0600");
if (nextMondayVisitQuestion?.answer !== 0 || !nextMondayVisitQuestion.question.includes("next Monday") || !nextMondayVisitQuestion.question.includes("one museum trip planned")) errors.push("ENG-0600: 未來式題缺少明確時間線索或答案索引錯誤");
for (const [id, answer, evidence] of [["ENG-0677", 1, "were playing"], ["ENG-0678", 2, "since"], ["ENG-0679", 2, "on Friday"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (question?.answer !== answer || !question.explanation.includes(evidence) || question.explanation.includes("答案選項")) errors.push(`${id}: 時態／介系詞解析的答案索引或中譯回歸錯誤`);
}
const squareVisitorsQuestion = englishAuthored.find(question => question.id === "ENG-0375");
if (squareVisitorsQuestion?.answer !== 0 || squareVisitorsQuestion.unit !== "功能性閱讀" || !squareVisitorsQuestion.question.includes("2,400") || !squareVisitorsQuestion.question.includes("4,800") || !squareVisitorsQuestion.explanation.includes("4,800 ÷ 2,400 = 2")) errors.push("ENG-0375: 訪客倍數題的數據、單元或解題計算不完整");
const irrigationSavingsQuestion = englishAuthored.find(question => question.id === "ENG-0376");
if (irrigationSavingsQuestion?.answer !== 3 || irrigationSavingsQuestion.unit !== "功能性閱讀" || !irrigationSavingsQuestion.explanation.includes("36 − 18 = 18 liters")) errors.push("ENG-0376: 用水差額題的單元、正解索引或計算解析錯誤");
const englishFeverReply = englishAuthored.find(question => question.id === "ENG-0402");
if (englishFeverReply?.answer !== 0 || !englishFeverReply.solutionSteps?.[2]?.includes("B、C、D 都沒有")) errors.push("ENG-0402: 康復祝福題解析排除選項標號錯誤");
const englishPoliteRequest = englishAuthored.find(question => question.id === "ENG-0405");
if (englishPoliteRequest?.answer !== 0 || !englishPoliteRequest.solutionSteps?.[2]?.includes("B 表示介意") || englishPoliteRequest.solutionSteps?.[2]?.includes("A 表示介意")) errors.push("ENG-0405: Would you mind 題解析排除選項標號錯誤");
const englishZeroConditional = englishAuthored.find(question => question.id === "ENG-0423");
if (englishZeroConditional?.knowledgePoint !== "零類條件句" || englishZeroConditional?.difficulty !== "基礎" || englishZeroConditional?.answer !== 1) errors.push("ENG-0423: 一般事實句的條件句知識點、難度或答案分類錯誤");
const englishPassiveQuestion = englishAuthored.find(question => question.id === "ENG-0512");
if (englishPassiveQuestion?.answer !== 1 || englishPassiveQuestion?.options?.[0] !== "did / opened" || !englishPassiveQuestion.solutionSteps?.some(step => step.includes("did") && step.includes("原形 open"))) errors.push("ENG-0512: 被動疑問句需避免主動/被動選項同時成立並說明 did 後接原形");
const englishPresentPerfectContext = englishAuthored.find(question => question.id === "ENG-0521");
if (englishPresentPerfectContext?.options?.[englishPresentPerfectContext.answer] !== "has tried" || !englishPresentPerfectContext.question.includes("so far this semester")) errors.push("ENG-0521: 現在完成式題須明示本學期截至目前的時間範圍並維持正確答案");
const englishFuturePassive = englishAuthored.find(question => question.id === "ENG-0534");
if (englishFuturePassive?.answer !== 2 || englishFuturePassive?.options?.[1] !== "will opened" || !englishFuturePassive.question.includes("by the mayor") || !englishFuturePassive.explanation.includes("does not fit the stated agent")) errors.push("ENG-0534: 未來被動題需明示施事者並排除主動排程讀法");
const englishComparative = englishAuthored.find(question => question.id === "ENG-0522");
if (englishComparative?.answer !== 1 || !englishComparative.explanation.includes("去掉 e 再加 r") || englishComparative.explanation.includes("雙寫 g") || englishComparative.teacherTip.includes("雙寫 g")) errors.push("ENG-0522: large 比較級規則不可誤稱雙寫 g");
const englishPurposeInfinitive = englishAuthored.find(question => question.id === "ENG-0551");
if (englishPurposeInfinitive?.answer !== 2 || !englishPurposeInfinitive.question.includes("in order ___")) errors.push("ENG-0551: 目的不定詞題需排除分詞片語的另一種合理讀法");
const englishWeeklyUpdate = englishAuthored.find(question => question.id === "ENG-0561");
if (englishWeeklyUpdate?.options?.[englishWeeklyUpdate.answer] !== "is updated" || !englishWeeklyUpdate.question.includes("by the IT staff")) errors.push("ENG-0561: 網站更新題須明示施事者，避免主動更新也成立");
const englishTicketVerb = englishAuthored.find(question => question.id === "ENG-0565");
if (englishTicketVerb?.options?.[englishTicketVerb.answer] !== "show" || !englishTicketVerb.question.includes("their tickets to the guard")) errors.push("ENG-0565: 出示票券題須明確票券出示方向");
const englishPodcastTense = englishAuthored.find(question => question.id === "ENG-0575");
if (englishPodcastTense?.options?.[englishPodcastTense.answer] !== "have heard" || !englishPodcastTense.question.includes("several times so far")) errors.push("ENG-0575: 現在完成式經驗題須明確連結截至目前");
const englishOpenedAgent = englishAuthored.find(question => question.id === "ENG-0582");
if (englishOpenedAgent?.options?.[englishOpenedAgent.answer] !== "was opened" || !englishOpenedAgent.question.includes("by the mayor")) errors.push("ENG-0582: 被動開設題須明示施事者，避免 opened 作不及物動詞");
const englishDisplayedAgent = englishAuthored.find(question => question.id === "ENG-0583");
if (englishDisplayedAgent?.options?.[englishDisplayedAgent.answer] !== "will be displayed" || !englishDisplayedAgent.question.includes("by the judges")) errors.push("ENG-0583: 展示被動題須明示施事者");
const englishPurposeForm = englishAuthored.find(question => question.id === "ENG-0597");
if (englishPurposeForm?.options?.[englishPurposeForm.answer] !== "to make" || !englishPurposeForm.question.includes("in order ___")) errors.push("ENG-0597: 目的不定詞題須避免 making 結果分詞也成立");
const chinese112 = number => mission.find(question => question.source?.year === 112 && question.subject === "國文" && question.source?.questionNumber === number);
const chinese112Q01to10Keys = ["D", "D", "C", "C", "D", "C", "A", "A", "A", "D"];
const chinese112Q01to10Clues = [
  "核心", "與其", "分號", "無非", "ㄓㄨˇ", "形聲字", "高尚審美觀", "凸出的字面沾墨", "版築", "疾澍"
];
for (let number = 1; number <= 10; number += 1) {
  const row = chinese112(number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  if (!row || answerLetter !== chinese112Q01to10Keys[number - 1] || row.options?.length !== 4 || !row.solutionSteps?.length || !row.teacherTip || !row.explanation?.includes(chinese112Q01to10Clues[number - 1])) errors.push(`112國文第${number}題: 官方答案索引、關鍵解題依據或解題欄位與逐題覆核不符`);
  if (number !== 8 && (row?.requiresImage || row?.questionImage || row?.questionImages?.length)) errors.push(`112國文第${number}題: 文字題不應依賴整頁試卷圖`);
}
const chinese112Stamp = chinese112(8);
if (!chinese112Stamp?.requiresImage || chinese112Stamp.questionImage !== "./assets/official-exams/112-chinese-q08-stamp-options.svg" || !chinese112Stamp.questionImages?.includes(chinese112Stamp.questionImage) || !serviceWorker.includes("112-chinese-q08-stamp-options.svg")) errors.push("112國文第8題: 陽刻選項圖缺漏或未加入離線快取");
const chinese112SdgChart = chinese112(17);
if (!chinese112SdgChart?.requiresImage || chinese112SdgChart.questionImage !== "./assets/official-exams/112-chinese-q17-sdg-chart.svg" || !chinese112SdgChart.questionImages?.includes(chinese112SdgChart.questionImage) || !serviceWorker.includes("112-chinese-q17-sdg-chart.svg") || !serviceWorker.includes("112-chinese-p5.webp")) errors.push("112國文第17題: SDG圖表裁切圖或所依賴的原卷底圖未加入離線快取");
const chinese112Q11to20Keys = ["C", "A", "B", "C", "B", "D", "A", "C", "A", "B"];
const chinese112Q11to20Clues = [
  "代墊報名費", "典範", "有方法使眾人協力", "幡然悔悟", "春去盡", "學識層層累積", "15 至 49 歲女性", "耕作時間延長", "近期將有慶典", "客人稀少"
];
for (let number = 11; number <= 20; number += 1) {
  const row = chinese112(number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  if (!row || answerLetter !== chinese112Q11to20Keys[number - 11] || row.options?.length !== 4 || !row.solutionSteps?.length || !row.teacherTip || !row.explanation?.includes(chinese112Q11to20Clues[number - 11])) errors.push(`112國文第${number}題: 官方答案索引、關鍵解題依據或解題欄位與逐題覆核不符`);
  if (number !== 17 && (row?.requiresImage || row?.questionImage || row?.questionImages?.length)) errors.push(`112國文第${number}題: 文字題不應依賴整頁試卷圖`);
}
const chinese112Q21to30Keys = ["C", "D", "D", "B", "D", "A", "A", "B", "C", "A"];
const chinese112Q21to30Clues = [
  "十五年間", "以前未曾一探", "當時已謂之工", "工作與生計", "我們明亮的心情", "心情愈沉重", "水花大小會影響分數", "最高給 10 分", "得 69 分", "精神滋養"
];
for (let number = 21; number <= 30; number += 1) {
  const row = chinese112(number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  const hasAuditClue = row && (row.explanation?.includes(chinese112Q21to30Clues[number - 21]) || row.question?.includes(chinese112Q21to30Clues[number - 21]));
  if (!row || answerLetter !== chinese112Q21to30Keys[number - 21] || row.options?.length !== 4 || !row.solutionSteps?.length || !row.teacherTip || !hasAuditClue) errors.push(`112國文第${number}題: 官方答案索引、關鍵解題依據或解題欄位與逐題覆核不符`);
  if (row?.requiresImage || row?.questionImage || row?.questionImages?.length) errors.push(`112國文第${number}題: 題目材料已內嵌，不應再顯示原卷整頁圖`);
}
const chinese112DivingContext = chinese112(27)?.question;
for (const number of [28, 29]) {
  const row = chinese112(number);
  if (!row || !row.question.includes("7名評審") || !row.question.includes("最高2分與最低2分") || !row.question.includes("難度係數")) errors.push(`112國文第${number}題: 跳水計分共用規則或必要步驟缺漏`);
}
if (!chinese112DivingContext?.includes("1871年在倫敦泰晤士河") || !chinese112(29)?.question.includes("7、8、8、7、9、7、9分")) errors.push("112國文第27–29題: 跳水題組必要資料缺漏");
const napoleonQuestion36 = chinese112(36);
const napoleonQuestion37 = chinese112(37);
const napoleonFigure = chinese112(38);
if (napoleonQuestion36?.answer !== 2 || !napoleonQuestion36.explanation.includes("不願被視為波旁王朝繼承者") || !napoleonQuestion36.explanation.includes("不是選址的主要原因")) errors.push("112國文第36題: 解題應區分巴黎選址理由與仿效查理曼／教皇主持");
if (napoleonQuestion37?.answer !== 1 || !napoleonQuestion37.explanation.includes("以免損及教廷顏面")) errors.push("112國文第37題: 解題須對準避免冒犯教廷的作畫動機");
if (napoleonFigure?.answer !== 0 || !napoleonFigure.explanation.includes("十字架在畫面正中央")) errors.push("112國文第38題: 解題須引用原文所述十字架位於畫面正中央");
if (!napoleonFigure?.requiresImage || napoleonFigure.questionImage !== "./assets/official-exams/112-chinese-q38-figure.svg" || !napoleonFigure.question.includes("十字架") || !napoleonFigure.questionImages?.includes(napoleonFigure.questionImage) || !serviceWorker.includes("112-chinese-q38-figure.svg") || !serviceWorker.includes("112-chinese-p13.webp")) errors.push("112國文第38題: 必要示意圖未正確裁切顯示或加入離線快取");
const embeddedClassical = "大將軍仇鸞，始為曾銑所劾";
for (const number of [39, 40]) {
  const row = chinese112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length || !row.question.includes(embeddedClassical) || !row.question.includes("註：「內」指宮廷")) errors.push(`112國文第${number}題: 古文材料未完整內嵌或不必要地依賴掃描頁`);
}
const yangZhuPassage = chinese112(41)?.question;
for (const number of [41, 42]) {
  const row = chinese112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length || !row.question.includes("楊朱見梁王") || !row.question.includes("吞舟之魚，不游支流") || !row.question.includes("將治大者不治細")) errors.push(`112國文第${number}題:《列子・楊朱》完整共用選文缺漏或仍依賴掃描頁`);
}
if (!yangZhuPassage?.includes("【閱讀材料")) errors.push("112國文第41–42題: 題組材料標示不完整");
const chinese112Q31to42Keys = ["C", "B", "C", "B", "B", "C", "B", "A", "D", "D", "B", "D"];
for (let number = 31; number <= 42; number += 1) {
  const row = chinese112(number);
  const expectedKey = chinese112Q31to42Keys[number - 31];
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  if (!row || answerLetter !== expectedKey || row.options?.length !== 4 || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim()) errors.push(`112國文第${number}題: 官方答案、四選項或完整解題欄位缺漏`);
  if (number !== 38 && (row?.requiresImage || row?.questionImage || row?.questionImages?.length)) errors.push(`112國文第${number}題: 完整文字材料已提供，不應依賴不必要的試卷圖`);
}
const chinese112Q31to42Clues = [
  "互動與動態感", "1968 年成立", "私人能否主張月球土地所有權", "瀏覽紀錄、按讚喜好", "隱私作為代價",
  "新帝國開創者身分", "損及教廷顏面", "十字架在畫面正中央", "仇鸞權勢日增", "御用龍舟",
  "羊群需有人統御", "小蚌難得明珠"
];
for (let number = 31; number <= 42; number += 1) {
  const row = chinese112(number);
  const clue = chinese112Q31to42Clues[number - 31];
  if (row && !row.explanation.includes(clue)) errors.push(`112國文第${number}題: 解題未說明本題核對的關鍵依據`);
}
const chinese113 = number => mission.find(question => question.source?.year === 113 && question.subject === "國文" && question.source?.questionNumber === number);
const chinese113Q01to10Keys = ["D", "D", "B", "B", "C", "D", "B", "C", "B", "A"];
for (let number = 1; number <= 10; number += 1) {
  const row = chinese113(number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  if (!row || answerLetter !== chinese113Q01to10Keys[number - 1] || row.options?.length !== 4 || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim()) errors.push(`113國文第${number}題: 官方答案、四選項或完整解題欄位缺漏`);
  if (number !== 10 && (row?.requiresImage || row?.questionImage || row?.questionImages?.length)) errors.push(`113國文第${number}題: 文字內容已足以作答，不應依賴整頁試卷圖`);
}
const chinese113Q2 = chinese113(2);
if (!chinese113Q2?.explanation.includes("失誤招領處") || !chinese113Q2.explanation.includes("失物招領處") || chinese113Q2.explanation.includes("題本原文其實") || chinese113Q2.explanation.includes("本題需按字形判斷")) errors.push("113國文第2題: 解說須明確指出C的錯字，且不得含有未定稿文字");
const chinese113Q10 = chinese113(10);
if (!chinese113Q10?.requiresImage || chinese113Q10.questionImage !== "./assets/official-exams/113-chinese-q10-glyph-options.svg" || !chinese113Q10.questionImages?.includes(chinese113Q10.questionImage) || !serviceWorker.includes("113-chinese-q10-glyph-options.svg") || !serviceWorker.includes("113-chinese-p4.webp")) errors.push("113國文第10題: 必要字形比較圖未裁切或缺少離線快取依賴");
const chinese113Q13 = chinese113(13);
if (chinese113Q13?.answer !== 2 || !chinese113Q13.explanation.includes("答案 C") || !chinese113Q13.explanation.includes("光照") || chinese113Q13.explanation.includes("答案 D")) errors.push("113國文第13題: 官方解析答案為C，需避免舊修復腳本將答案覆寫為D");
const chinese113Q11to20Keys = ["C", "C", "C", "B", "C", "D", "B", "A", "D", "A"];
const chinese113Q11to20Clues = ["鐵畫銀鉤", "稅賦沉重", "揀選值得珍惜的過往", "尋好夢，夢難成", "臭著臉", "行將就木", "不以聖賢為目標", "良材", "追求顯赫聲名", "本」在「木」字形下方"];
for (let number = 11; number <= 20; number += 1) {
  const row = chinese113(number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  if (!row || answerLetter !== chinese113Q11to20Keys[number - 11] || row.options?.length !== 4 || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim() || !row.explanation.includes(chinese113Q11to20Clues[number - 11])) errors.push(`113國文第${number}題: 官方答案、解題依據或必需欄位有誤`);
  if (number !== 20 && (row?.requiresImage || row?.questionImage || row?.questionImages?.length)) errors.push(`113國文第${number}題: 文字題不應引用整頁試卷圖`);
}
const chinese113Q20 = chinese113(20);
if (!chinese113Q20?.requiresImage || chinese113Q20.questionImage !== "./assets/official-exams/113-chinese-q20-zhi-shi-options.svg" || !chinese113Q20.questionImages?.includes(chinese113Q20.questionImage) || !serviceWorker.includes("113-chinese-q20-zhi-shi-options.svg") || !serviceWorker.includes("113-chinese-p6.webp")) errors.push("113國文第20題: 必要字形表須裁切呈現並加入離線快取");
const chinese113Q21to30Keys = ["C", "A", "D", "A", "A", "D", "A", "B", "D", "C"];
const chinese113Q21to30Clues = ["事必成，然後舉", "借糧救濟貧民", "假日 8 時至 16 時", "身者，繭也", "完成學業與返家的時間表", "單一目標", "顏色與勳章的對應關係消失", "諷刺人性、英國時政與權貴", "美式生活消耗資源較多", "限制食物浪費也可延後 13 天"];
for (let number = 21; number <= 30; number += 1) {
  const row = chinese113(number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  if (!row || answerLetter !== chinese113Q21to30Keys[number - 21] || row.options?.length !== 4 || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim() || !row.explanation.includes(chinese113Q21to30Clues[number - 21])) errors.push(`113國文第${number}題: 官方答案、解題依據或必需欄位有誤`);
  if (row?.requiresImage || row?.questionImage || row?.questionImages?.length) errors.push(`113國文第${number}題: 完整閱讀材料已內嵌，不應依賴整頁試卷圖`);
}
const chinese113Q31to42Keys = ["A", "A", "B", "D", "C", "C", "B", "B", "B", "C", "D", "B"];
const chinese113Q31to42Clues = ["絹本", "展期不得超過", "巢狀包含", "互相競爭", "民眾也更難信任", "家庭困境", "創意與童真", "理解不夠全面", "衡量自身舉措", "受處罰", "不論身分地位", "執法不一致"];
for (let number = 31; number <= 42; number += 1) {
  const row = chinese113(number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  const clue = chinese113Q31to42Clues[number - 31];
  if (!row || answerLetter !== chinese113Q31to42Keys[number - 31] || row.options?.length !== 4 || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim() || !row.explanation.includes(clue) || !row.question.includes("【閱讀材料】")) errors.push(`113國文第${number}題: 官方答案、完整閱讀材料、解題依據或提示有誤`);
  if (row?.requiresImage || row?.questionImage || row?.questionImages?.length) {
    if (number !== 33 || row.questionImage !== "./assets/official-exams/113-chinese-q33-ai-hierarchy.svg" || row.questionImages?.length !== 1 || !serviceWorker.includes("113-chinese-q33-ai-hierarchy.svg")) errors.push(`113國文第${number}題: 不必要或未離線快取的掃描圖`);
  }
}
const chinese113Q36 = chinese113(36);
const chinese113Q37 = chinese113(37);
if (!chinese113Q36?.question.includes("也是最使他滿意的一幅") || !chinese113Q37?.question.includes("也是最使他滿意的一幅") || chinese113Q37.question.includes("也是假使他滿意的一幅")) errors.push("113國文第37題: 《魯冰花》共用選文轉錄錯誤");
const chinese113Q31to42Tips = Array.from({ length: 12 }, (_, index) => chinese113(index + 31)?.teacherTip?.trim());
if (new Set(chinese113Q31to42Tips).size !== 12) errors.push("113國文第31–42題: 教師提示有重複套語");
const chinese113Q33 = chinese113(33);
if (!chinese113Q33?.requiresImage || chinese113Q33.questionImage !== "./assets/official-exams/113-chinese-q33-ai-hierarchy.svg") errors.push("113國文第33題: 必要的概念層級圖缺失");
const english112 = number => mission.find(question => question.source?.year === 112 && question.subject === "英文" && question.source?.questionNumber === number);
const grapeQuestion = english112(1);
if (!grapeQuestion?.requiresImage || grapeQuestion.questionImage !== "./assets/official-exams/112-english-q01-grapes.svg" || !grapeQuestion.questionImages?.includes(grapeQuestion.questionImage) || !serviceWorker.includes("112-english-q01-grapes.svg") || !serviceWorker.includes("112-english-p2.webp")) errors.push("112英文第1題: 必要插圖裁切或離線快取缺失");
for (const number of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  const row = english112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`112英文第${number}題: 完整文字題不應顯示整頁試卷掃描圖`);
}
for (const [numbers, image, sourcePage] of [
  [[24, 25], "112-english-q24-25-menu-calendar.svg", "112-english-p4.webp"],
  [[26, 27], "112-english-q26-27-bird-notes.svg", "112-english-p5.webp"],
  [[28, 29], "112-english-q28-29-food-waste-chart.svg", "112-english-p6.webp"]
]) {
  for (const number of numbers) {
    const row = english112(number);
    if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || row.questionImages?.length !== 1 || row.questionImages[0] !== row.questionImage || !serviceWorker.includes(image) || !serviceWorker.includes(sourcePage)) errors.push(`112英文第${number}題: 必要共用圖表未專用裁切、完整引用或加入離線快取`);
  }
}
for (const number of [30, 31, 32, 33, 34, 35]) {
  const row = english112(number);
  const mustInclude = number <= 32 ? ["0.002 g", "6 cm", "flies too low"] : ["Elisabeth Röckel", "Therese Malfatti", "Elise Barensfeld", "1867"];
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length || !mustInclude.every(fragment => row.question.includes(fragment))) errors.push(`112英文第${number}題: 完整閱讀材料缺漏或仍依賴考卷掃描圖`);
}
for (const number of [36, 37, 38]) {
  const row = english112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length || !["gender", "kitchen toys", "building toys", "language", "math and science", "chances in life"].every(fragment => row.question.toLowerCase().includes(fragment))) errors.push(`112英文第${number}題: Jesse Cohen 完整選文缺漏或仍依賴考卷掃描圖`);
}
for (const number of [39, 40, 41]) {
  const row = english112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length || !["Yale University", "Sunday Times", "Sri Lanka", "empathy", "Homs"].every(fragment => row.question.includes(fragment))) errors.push(`112英文第${number}題: Marie Colvin 完整選文缺漏或仍依賴考卷掃描圖`);
}
for (const number of [42, 43]) {
  const row = english112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length || !["Speaking American", "Lucia Leisure", "sneakers", "plimsolls", "kicks", "vans"].every(fragment => row.question.includes(fragment))) errors.push(`112英文第${number}題: 評論短文或填空線索缺漏，或仍依賴考卷掃描圖`);
}
for (const [subject, numbers] of [["英文", Array.from({ length: 13 }, (_, index) => index + 11)], ["國文", [7]], ["社會", [8]]]) {
  for (const number of numbers) {
    const row = mission.find(question => question.source?.year === 112 && question.subject === subject && question.source?.questionNumber === number);
    if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`112${subject}第${number}題: 文字完整題仍掛載不必要試卷頁圖`);
  }
}
for (let number = 2; number <= 20; number++) {
  const row = mission.find(question => question.source?.year === 111 && question.subject === "英文" && question.source?.questionNumber === number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111英文第${number}題: 文字完整題仍掛載不必要試卷頁圖`);
}
const chinese111 = number => mission.find(question => question.source?.year === 111 && question.subject === "國文" && question.source?.questionNumber === number);
const chinese110 = number => mission.find(question => question.source?.year === 110 && question.subject === "國文" && question.source?.questionNumber === number);
for (const [number, answer, clue] of [[1, 0, "讓步連詞"], [2, 3, "了解生命的限制"], [3, 2, "主體和背景顏色相近"], [4, 1, "都讀 ㄉㄧˇ"], [5, 2, "1916－30＝1886"], [6, 0, "知足自得的態度"], [7, 0, "一磚一瓦"], [8, 3, "麇身、牛尾"], [9, 3, "未眠客"], [10, 1, "不與傳統和過去截然無關"]]) {
  const row = chinese110(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`110國文第${number}題: 官方答案、解題說明或材料線索不符`);
}
for (const [number, answer, clue] of [[11, 1, "教育部《親朋稱呼表》"], [12, 1, "無用之用，是為大用"], [13, 0, "共用筆畫構成圖樣"], [14, 1, "近音混淆"], [15, 2, "彼此毫不相關"], [16, 1, "在 105 學年下降"], [17, 0, "姚黃、魏紫是牡丹品種"], [18, 3, "水較清澈，透光性較佳"], [19, 2, "立即報酬"], [20, 3, "必看、必玩、必吃的清單"]]) {
  const row = chinese110(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`110國文第${number}題: 官方答案、解題說明或材料線索不符`);
}
for (const number of [11, 12, 14, 15, 17, 18, 19, 20]) {
  const row = chinese110(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`110國文第${number}題: 文字完整題仍掛載不必要試卷頁圖`);
}
for (const [number, filename] of [[13, "110-chinese-q13-figure.svg"], [16, "110-chinese-q16-chart.png"]]) {
  const row = chinese110(number);
  if (!row?.requiresImage || !row.questionImage?.endsWith(filename) || row.questionImages?.length !== 1) errors.push(`110國文第${number}題: 必要字形圖或圖表缺失`);
}
for (const [number, answer, clue] of [[21, 1, "B「曾幾何時"], [22, 3, "放對位置"], [23, 0, "都應寫作「妄」"], [24, 3, "過度逐字分析"], [25, 1, "都以對偶寫景"], [26, 2, "奉承顯然奏效"], [27, 0, "不能列為第一流作者"], [28, 1, "體恤偷禾者"], [29, 3, "相須而適相值"], [30, 2, "史官「相與見旦」"]]) {
  const row = chinese110(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`110國文第${number}題: 官方答案、解題說明或材料線索不符`);
}
for (let number = 21; number <= 30; number++) {
  const row = chinese110(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`110國文第${number}題: 文字完整題仍掛載不必要試卷頁圖`);
}
for (let number = 1; number <= 10; number++) {
  const row = chinese110(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`110國文第${number}題: 文字完整題仍掛載不必要試卷頁圖`);
}
if (!chinese110(6)?.question.includes("被摧折遍地的花草樹木") || !chinese110(6)?.question.includes("他寧取盆中長綠")) errors.push("110國文第6題: 〈盆栽〉共作詩的後段材料缺漏");
for (const [number, answer, clue] of [[41, 2, "把王起要他與賀拔惎絕交的實情全數告訴賀拔惎"], [42, 3, "把友情看得重於狀元名位"]]) {
  const row = chinese111(number);
  if (!row || row.answer !== answer || !row.question.includes("主文柄") || !row.question.includes("奈輕負至交") || !row.explanation.includes(clue) || !row.solutionSteps?.length) errors.push(`111國文第${number}題: 原文、答案或解題依據缺漏`);
  if (row?.requiresImage || row?.questionImage || row?.questionImages?.length) errors.push(`111國文第${number}題: 完整轉錄文字題仍掛載整頁試卷圖`);
}
if (chinese111(42)?.options?.[2] !== "比起白敏中的前倨後恭，賀拔惎的真誠顯得更為可靠") errors.push("111國文第42題: 原卷選項轉錄不一致");
for (const [number, answer, clue] of [[11, 0, "3.5 公斤"], [12, 3, "都讀 ㄙㄚ"], [13, 2, "並未說西餐費時費工"], [14, 0, "端正、糾正"], [15, 3, "吉光片羽"], [16, 0, "說書人"], [17, 0, "攸關"], [18, 0, "先把水量定好"], [19, 1, "斑駁陸離"], [20, 2, "截然不同的春季氣候"]]) {
  const row = chinese111(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`111國文第${number}題: 官方答案、解題說明或推論線索不符`);
}
for (const [number, answer, clue] of [[21, 3, "字形由「冊」與「刀」組合"], [22, 0, "不自隘其器／不自吝其光"], [23, 1, "活著自由自在"], [24, 0, "先提出世俗看法"], [25, 3, "未提供其 97 年確切名次"], [26, 2, "50 元工本費"], [27, 2, "憑取貨聯單"], [28, 3, "並非象徵作者卑鄙惡劣"], [29, 1, "仍然焦慮於下一次該如何改變"], [30, 1, "冷漠麻木"]]) {
  const row = chinese111(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`111國文第${number}題: 官方答案、解題說明或推論線索不符`);
}
for (const [number, clues] of [[21, ["問", "門裡有人", "恣", "盎", "照明的燈光", "刪", "簡冊"]], [22, ["學者如取水", "操瓢者止於瓢", "教者如分火", "千燈而明自若"]], [23, ["楚王", "神龜", "泥地拖尾"]], [24, ["世人之事君者", "自有道者論之則不然", "孫叔敖日夜不息"]], [25, ["97 年", "107 年十大死因", "順位上升", "順位下降", "蓄意自我傷害列第 11"]], [26, ["十種", "電風扇", "特殊材料費另報價", "08:00–12:00", "週三、週日"]], [27, ["電子鍋", "週三、週日", "50 元工本費", "取貨聯單"]], [28, ["【甲】", "【乙】", "【丙】", "【丁】", "蟑螂、是老鼠"]], [29, ["反覆把自己摺成不同的生物", "圓體", "紙弄得殘破不堪", "我應該把自己摺成什麼"]], [30, ["六月底", "每星期約有七百人", "心腸都變硬", "巡邏隊的身影消失"]]]) {
  const row = chinese111(number);
  const text = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !text.includes(clue.replace(/\s+/g, "")))) errors.push(`111國文第${number}題: 題幹、原文或共用材料缺漏`);
}
for (const [number, clues] of [[11, ["內容物重量最好在體重", "側背時則建議低於", "力量承受度", "最重的東西應放", "物品重量0.5、2、1", "物品重量1、2、0.5", "物品重量2、4、2"]], [12, ["哽", "ㄧㄝˋ", "ㄎㄥ", "ㄏㄤˊ", "ㄔㄢˊ", "ㄕㄢˋ", "ㄙㄚ"]], [13, ["中菜西吃", "熱度鑊氣", "多道同食", "大鍋蒸煮煨燉"]], [14, ["修身以為弓", "矯思以為矢", "立義以為的"]], [15, ["車水馬龍", "別開生面", "因噎廢食", "吉光片羽"]], [16, ["稗官詞", "小鼓兒", "寸板兒", "醪，音 ㄌㄠˊ", "以說演故事為業"]], [17, ["攸關", "不屈不撓", "死不賴帳", "對抗意志力"]], [18, ["水米成交", "猶米之釀而為酒", "熬前挹水必限以數"]], [19, ["杞人", "養尊處", "ㄅㄢ", "ㄇㄠˊ", "ㄇㄢˋ"]], [20, ["江南二月試羅衣", "春盡燕山雪尚飛", "子規", "羅衣"]]]) {
  const row = chinese111(number);
  const text = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !text.includes(clue.replace(/\s+/g, "")))) errors.push(`111國文第${number}題: 題幹、原文或共用材料缺漏`);
}
for (const number of [1, 2, 3, 5, 6, 7, 8, 9, 10]) {
  const row = chinese111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111國文第${number}題: 文字題仍掛載不必要試卷頁圖`);
}
for (let number = 11; number <= 20; number++) {
  const row = chinese111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111國文第${number}題: 文字完整題仍掛載不必要試卷頁圖`);
}
for (let number = 21; number <= 30; number++) {
  const row = chinese111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111國文第${number}題: 已轉錄完整的文字題仍依賴整頁掃描`);
}
for (const [number, answer, clue] of [[31, 3, "政府擔心被困居民發生暴動"], [32, 2, "沒有說電動車真的由機械人駕駛"], [33, 1, "不干擾青山綠水間的蟲鳴鳥叫"], [34, 2, "體會文字的力量"], [35, 3, "兩種閱讀都不可或缺，應該並存"], [36, 1, "被鍊住、面向內壁的人"], [37, 1, "孤獨傳達真理"], [38, 0, "即使有人見過洞外真相"], [39, 3, "吳錢 ＞ 鄧通錢 ＝ 四銖錢"], [40, 1, "都應有"]]) {
  const row = chinese111(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`111國文第${number}題: 官方答案、解題說明或推論線索不符`);
}
for (const [number, clues] of [[31, ["每星期約有七百人", "心腸都變硬", "各城門的打鬥", "發生暴動", "巡邏隊的身影消失"]], [32, ["白色電動車", "接待中心與美術館間", "雨天", "白抹布", "赭紅色"]], [33, ["不會干擾", "蟲鳴鳥叫", "寧靜的氛圍", "花花綠綠的雨傘"]], [34, ["多媒體、具象、活潑、外擴、零碎、動態", "文字為主", "白晝", "黑夜", "體會文字力量"]], [35, ["網路閱讀的特質，可喻為白晝", "紙本閱讀的特質，可喻為黑夜", "閱讀並存"]], [36, ["有個洞穴中有一群人", "面向洞穴的內壁", "營火", "雕像的影子", "陽光"]], [37, ["被鍊著", "營火", "遮蔽物", "雕像", "陽光", "得到啟蒙"]], [38, ["影子是真實的事物", "發現真相", "只願相信內壁上的影子"]], [39, ["漢文帝", "形制、文字、重量都與天子的四銖錢相同", "吳錢略重", "半兩"]], [40, ["四銖錢", "半兩", "形制與文字則和天子錢相同", "莢錢"]]]) {
  const row = chinese111(number);
  const text = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !text.includes(clue.replace(/\s+/g, "")))) errors.push(`111國文第${number}題: 題幹、原文或共用材料缺漏`);
}
for (let number = 31; number <= 40; number++) {
  const row = chinese111(number);
  if (number === 36) continue;
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111國文第${number}題: 文字完整題仍掛載不必要試卷頁圖`);
}
const chinese111Q36 = chinese111(36);
if (!chinese111Q36?.requiresImage || chinese111Q36.questionImage !== "./assets/official-exams/111-chinese-q36-cave.svg" || chinese111Q36.questionImages?.length !== 1) errors.push("111國文第36題: 必要洞穴圖未改為單一專用示意圖");
const official = mission.filter(question => question.sourceType === "官方歷屆真題");
const similar = mission.filter(question => question.type === "會考類題");
if (official.length !== 1098) errors.push(`官方真題 ${official.length}，應為 1098`);
if (similar.length !== 10) errors.push(`類題 ${similar.length}，應為 10`);
for (const [id, number, expectedQuestion, expectedAnswer] of [["OFF-0049", 1, "In the picture, the boy is", "bowing to"], ["OFF-0050", 2, "Listen! The baby", "is crying"]]) {
  const row = mission.find(question => question.id === id);
  if (!row || row.source?.year !== 110 || row.source?.questionNumber !== number || !row.question.includes(expectedQuestion) || row.options[row.answer] !== expectedAnswer) errors.push(`${id}: 110年英文題號、題幹或標答錯置`);
}
for (const [number, expectedImage] of [[49, "113-social-q49-seat-change-maps.svg"], [50, "113-social-q49-seat-change-maps.svg"], [51, "113-social-q51-taiwan-population-map.svg"]]) {
  const row = official.find(question => question.source?.year === 113 && question.subject === "社會" && question.source.questionNumber === number);
  if (!row || !row.questionImage?.endsWith(expectedImage) || !row.questionImages?.includes(row.questionImage) || !row.requiresImage) errors.push(`113社會第${number}題: 圖表來源或題目圖片引用錯誤`);
}
for (const [number, expectedImage] of [[6, "113-science-q06-wire-repair.svg"], [8, "113-science-q08-earth-sun-diagrams.svg"], [15, "113-science-q15-isobar-map.svg"]]) {
  const row = official.find(question => question.source?.year === 113 && question.subject === "自然" && question.source.questionNumber === number);
  if (!row || !row.questionImage?.endsWith(expectedImage) || !row.questionImages?.includes(row.questionImage) || !row.requiresImage) errors.push(`113自然第${number}題: 圖示來源或題目圖片引用錯誤`);
  if (number === 8 && /文中畫雙底線處/.test(row?.question || "")) errors.push("113自然第8題: 題幹依賴未呈現的底線格式");
}
for (const [number, expectedImage] of [[31, "113-science-q31-classroom-map.png"], [35, "113-science-q35-intensity-map.png"], [36, "113-science-q36-lens-ray-options.png"], [40, "113-science-q40-copper-plating-options.png"]]) {
  const row = official.find(question => question.source?.year === 113 && question.subject === "自然" && question.source.questionNumber === number);
  if (!row || !row.questionImage?.endsWith(expectedImage) || !row.questionImages?.includes(row.questionImage) || !row.requiresImage) errors.push(`113自然第${number}題: 必要圖示來源或引用錯誤`);
  if (!serviceWorker.includes(`"${row?.questionImage}"`)) errors.push(`113自然第${number}題: 必要圖示未加入離線預載`);
}
const fruitFlyQuestion = official.find(question => question.id === "OFF-0836");
if (!fruitFlyQuestion?.question.includes("4 隻長翅") || !fruitFlyQuestion.question.includes("6 隻短翅") || !fruitFlyQuestion.question.includes("400 隻長翅、600 隻短翅") || !fruitFlyQuestion.explanation.includes("750：250")) errors.push("113自然第12題: 樣本觀察與外推表格資料不完整");
const eclipseQuestion = official.find(question => question.source?.year === 113 && question.subject === "自然" && question.source.questionNumber === 24);
if (!eclipseQuestion?.question.includes("100%") || !eclipseQuestion.question.includes("0%")) errors.push("113自然第24題: 太陽遮蔽圖表數值未轉寫完整");
const weatherSystemsQuestion = official.find(question => question.source?.year === 113 && question.subject === "自然" && question.source.questionNumber === 28);
if (!weatherSystemsQuestion?.question.includes("太平洋暖氣團") || !weatherSystemsQuestion.options?.[1]?.includes("太平洋暖氣團") || weatherSystemsQuestion.answer !== 1) errors.push("113自然第28題: 天氣系統例示或答案索引錯誤");
const concentrationQuestion = official.find(question => question.id === "OFF-0856");
if (!concentrationQuestion?.question.includes("840 萬公升") || !concentrationQuestion.explanation.includes("1.764 g") || !concentrationQuestion.explanation.includes("0.02352 g/L")) errors.push("113自然第32題: 官方池水容量、安賽蜜總量或尿液濃度換算錯誤");
const turtleClassificationQuestion = official.find(question => question.id === "OFF-0867");
if (!turtleClassificationQuestion?.question.includes("CR、EN、VU 合稱生存受脅類別") || !turtleClassificationQuestion.question.includes("目前列為 EN")) errors.push("113自然第43題: IUCN 題組未提供生存受脅分類線索");
const math112BlocksQuestion = official.find(question => question.id === "OFF-0534");
if (!math112BlocksQuestion?.requiresImage || math112BlocksQuestion.questionImage !== "./assets/official-exams/112-math-q03-figure.png" || math112BlocksQuestion.questionImages?.includes("./assets/official-exams/112-math-p2.webp") || !serviceWorker.includes("112-math-q03-figure.png")) errors.push("112數學第3題: 積木圖應使用專用圖示，不應顯示整頁試卷");
const math112PromotionQuestion = official.find(question => question.id === "OFF-0547");
if (!math112PromotionQuestion?.solutionSteps?.[0]?.includes("套餐單價為 s") || math112PromotionQuestion.solutionSteps[0].includes("整理題目已知條件") || !math112PromotionQuestion.explanation.includes("p＝90")) errors.push("112數學第16題: 促銷套餐建模步驟有殘缺或方程錯誤");
const math112FoldQuestion = official.find(question => question.id === "OFF-0550");
if (!math112FoldQuestion?.question.includes("弧 BC＝35°") || !math112FoldQuestion.question.includes("弧 AD") || !math112FoldQuestion.explanation.includes("180°−35°−35°＝110°") || math112FoldQuestion.explanation.includes("∠ACB＝35°")) errors.push("112數學第19題: 弧 BC 的摺疊對稱推導缺失或誤當角度");
const math112AngleQuestion = official.find(question => question.id === "OFF-0551");
if (!math112AngleQuestion?.explanation.includes("∠1＝2β") || !math112AngleQuestion.explanation.includes("∠2＝180°−β−γ＝∠A＝∠4")) errors.push("112數學第20題: 中垂線等腰關係與標示角推導不完整");
const math112SimilarityQuestion = official.find(question => question.id === "OFF-0553");
if (!math112SimilarityQuestion?.explanation.includes("△EBC 面積＝6＋8＝14") || !math112SimilarityQuestion.explanation.includes("3/7") || math112SimilarityQuestion.answer !== 2) errors.push("112數學第22題: 面積差或相似比推導錯誤");
const math112AgingQuestion = official.find(question => question.id === "OFF-0555");
if (!math112AgingQuestion?.questionImage?.endsWith("112-math-q24-chart.png") || !math112AgingQuestion.explanation.includes("水平距離") || /2018 年|2026 年/.test(math112AgingQuestion.explanation) || math112AgingQuestion.answer !== 3) errors.push("112數學第24題: 人口折線圖時間跨度判讀錯誤或沿用不可靠年份估值");
for (const [id, clue] of [["OFF-0553", "用大三角形減去"], ["OFF-0554", "長度平方通常"], ["OFF-0555", "比較各國曲線在 x 軸"], ["OFF-0556", "百分點差"]]) {
  const item = official.find(question => question.id === id);
  if (!item?.teacherTip?.includes(clue)) errors.push(`${id}: 112數學圖形/圖表解題提醒仍是泛用模板`);
}
const math114GeometryQuestion = official.find(question => question.id === "OFF-0964");
if (!math114GeometryQuestion?.question.includes("∠BAD＝p") || !math114GeometryQuestion.question.includes("∠ACB＝70°") || math114GeometryQuestion.questionImage || math114GeometryQuestion.requiresImage) errors.push("114數學第5題: 角度位置未文字化或仍引用整頁試卷圖");
const math114PopulationQuestion = official.find(question => question.id === "OFF-0966");
if (!math114PopulationQuestion?.question.includes("−109") || !math114PopulationQuestion.question.includes("+112") || !math114PopulationQuestion.question.includes("+204") || math114PopulationQuestion.questionImage || math114PopulationQuestion.requiresImage) errors.push("114數學第7題: 人口變動數據未文字化或仍引用整頁試卷圖");
for (const [id, clue] of [["OFF-0099", "扇形弧長合成整個圓周"], ["OFF-0100", "玩偶中獎券共 2 張"], ["OFF-0338", "3-4-5 直角三角形"], ["OFF-0339", "對稱軸不變"], ["OFF-0340", "兩個角落三角形"], ["OFF-0341", "發光效率等於流明除以瓦數"], ["OFF-0342", "施工差額"]]) {
  const item = official.find(question => question.id === id);
  if (!item?.teacherTip?.includes(clue)) errors.push(`${id}: 解題提醒與該題不符或未完成更正`);
}
const math111AreaRatioQuestion = official.find(question => question.id === "OFF-0340");
if (!math111AreaRatioQuestion?.explanation.includes("△ABC 扣除 △BDE 與 △AFC") || !math111AreaRatioQuestion.explanation.includes("3/8") || math111AreaRatioQuestion.answer !== 3) errors.push("111數學第23題: 四邊形面積比推導未以兩個相似三角形說清楚");
const math111ConstructedOne = official.find(question => question.id === "OFF-0318");
if (!math111ConstructedOne?.explanation.includes("4¹⁸") || !math111ConstructedOne.explanation.includes("細胞數足夠")) errors.push("111數學非選第1題: 指數成長或細胞數量比較推導缺漏");
const math111ConstructedTwo = official.find(question => question.id === "OFF-0319");
if (!math111ConstructedTwo?.explanation.includes("11/24") || !math111ConstructedTwo.explanation.includes("x+y=28")) errors.push("111數學非選第2題: 抽牌剩餘大牌機率推導缺漏");
const math111ChoiceOne = official.find(question => question.id === "OFF-MATH-111-Q01-MC");
if (math111ChoiceOne?.answer !== 0 || !math111ChoiceOne.questionImage?.endsWith("111-math-q1-figure.png")) errors.push("111數學選擇第1題: 絕對值數線題須有正確選項及局部圖");
const math111ChoiceTwo = official.find(question => question.id === "OFF-MATH-111-Q02-MC");
if (math111ChoiceTwo?.answer !== 3 || !math111ChoiceTwo.explanation.includes("4x")) errors.push("111數學選擇第2題: 多項式除法餘式答案或解釋不符");
const math111ChoiceFour = official.find(question => question.id === "OFF-0321");
if (math111ChoiceFour?.answer !== 1 || !math111ChoiceFour.questionImage?.endsWith("111-math-q04-figure.png") || !math111ChoiceFour.explanation.includes("224")) errors.push("111數學第4題: 展開圖尺寸、圖形或體積解釋不符");
const math111ChoiceEight = official.find(question => question.id === "OFF-0325");
if (math111ChoiceEight?.answer !== 0 || !math111ChoiceEight.explanation.includes("a＝2、c＝−7")) errors.push("111數學第8題: 因式分解係數與所求值不符");
const math111ChoiceNine = official.find(question => question.id === "OFF-0326");
if (math111ChoiceNine?.answer !== 2 || !math111ChoiceNine.explanation.includes("3/7")) errors.push("111數學第9題: 不放回抽球的樣本數或機率不符");
for (const [id, key, clue] of [["OFF-0328", 2, "B＝5,800"], ["OFF-0329", 1, "0.00000752"], ["OFF-0330", 3, "√13"], ["OFF-0331", 2, "68%"], ["OFF-0332", 1, "∠1＝∠2"], ["OFF-0333", 0, "21.7"], ["OFF-0334", 0, "55°"], ["OFF-0335", 1, "250"], ["OFF-0336", 1, "35°"], ["OFF-0337", 2, "32−23＝9"]]) {
  const item = official.find(question => question.id === id);
  if (item?.answer !== key || !item.explanation.includes(clue)) errors.push(`${id}: 111數學題目的關鍵計算或答案不符`);
}
const math114ProbabilityQuestion = official.find(question => question.id === "OFF-0970");
if (!math114ProbabilityQuestion?.question.includes("阿嘉亮出的牌是 1、3") || !math114ProbabilityQuestion.question.includes("小楊亮出的牌是 5、2") || math114ProbabilityQuestion.questionImage || math114ProbabilityQuestion.requiresImage) errors.push("114數學第11題: 牌面資訊未完整轉錄或仍引用整頁試卷圖");
for (const [id, clue] of [["OFF-0970", "蓋牌各有 3 張"], ["OFF-0971", "長度 3 的邊接合"], ["OFF-0972", "平方方程開平方"], ["OFF-0973", "咖啡、三明治各自的總數"], ["OFF-0974", "原點位於 A、E 間"], ["OFF-0975", "△ADF∼△AEC"], ["OFF-0976", "頂角 60°"], ["OFF-0977", "最大公因數不能大於 11"], ["OFF-0978", "增量成本"], ["OFF-0979", "摺疊前後對應角相等"], ["OFF-0980", "交點高度"], ["OFF-0981", "DE:EG=3:2"], ["OFF-0982", "AB=AB′"], ["OFF-0983", "前齒數除後齒數"], ["OFF-0984", "實際齒數配對"]]) {
  const item = official.find(question => question.id === id);
  if (!item?.teacherTip?.includes(clue)) errors.push(`${id}: 114數學教師提醒與題目考點不符或缺失`);
}
for (const [id, clue] of [["OFF-0974", "原點在 A 與 E 之間"], ["OFF-0975", "EF∥BC"], ["OFF-0976", "H/8"], ["OFF-0977", "gcd(a,b)＝11"]]) {
  const item = official.find(question => question.id === id);
  if (!item?.question.includes(clue) || item.questionImage || item.requiresImage) errors.push(`${id}: 題目資料缺失或仍引用整頁試卷圖`);
}
const math114CinemaQuestion = official.find(question => question.id === "OFF-0978");
if (!math114CinemaQuestion?.question.includes("320 元") || !math114CinemaQuestion.question.includes("優惠一為飲料 35 元") || !math114CinemaQuestion.question.includes("爆米花一盒加飲料一杯共 90 元") || math114CinemaQuestion.questionImage || math114CinemaQuestion.requiresImage) errors.push("114數學第19題: 價目/優惠資訊缺失或仍引用整頁試卷圖");
const english114PictureQuestion = official.find(question => question.id === "OFF-0917");
if (english114PictureQuestion?.answer !== 3 || !english114PictureQuestion.questionImage?.endsWith("114-english-q01-picture.svg") || english114PictureQuestion.questionImage.includes("-p2.webp")) errors.push("114英文第1題: 題圖應使用專用插圖裁切，而非整頁試卷");
for (const [id, clue] of [["OFF-0534", "前視圖會把不同深度"], ["OFF-0536", "把點的 x 座標代入"], ["OFF-0537", "負帶分數的負號"], ["OFF-0538", "垂直線 x＝常數"], ["OFF-0539", "平行線的同側內角互補"], ["OFF-0542", "黃色代表每杯"], ["OFF-0544", "直角柱的兩個底面全等"], ["OFF-0547", "看到『買一送一』"], ["OFF-0549", "分時段且各有上限"], ["OFF-0550", "摺線是對稱軸"], ["OFF-0551", "垂直平分線上的點"]]) {
  const item = official.find(question => question.id === id);
  if (!item?.teacherTip?.includes(clue)) errors.push(`${id}: 112數學教師提醒缺少對應考點`);
}
const english114ChatQuestion = official.find(question => question.id === "OFF-0938");
if (!english114ChatQuestion?.question.includes("Jenny: ‘I agree.") || !english114ChatQuestion.question.includes("Mark: ‘I didn't mean that")) errors.push("114英文第22題: 群聊發言者標籤或回應缺失");
const english114CityCardQuestion = official.find(question => question.id === "OFF-0941");
if (!english114CityCardQuestion?.question.includes("Museum of White Lake City History are in Zone 1") || !english114CityCardQuestion.question.includes("White Lake is in Zone 2") || english114CityCardQuestion.answer !== 2) errors.push("114英文第25題: 地圖分區文字與最省方案答案不一致");
for (const id of ["OFF-0951", "OFF-0952", "OFF-0953"]) {
  const item = official.find(question => question.id === id);
  if (!item || (item.question.match(/The picture shows a UK electricity worker in the 1970s/g) || []).length !== 1) errors.push(`${id}: 114英文閱讀材料重複或缺漏`);
}
const english114Q31to43Keys = ["B", "D", "A", "B", "C", "C", "C", "B", "C", "C", "A", "B", "A"];
const english114Q31to43 = [];
for (let number = 31; number <= 43; number += 1) {
  const row = official.find(question => question.source?.year === 114 && question.subject === "英文" && question.source.questionNumber === number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  if (!row || answerLetter !== english114Q31to43Keys[number - 31] || row.options?.length !== 4 || !row.question?.trim() || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim()) errors.push(`114英文第${number}題: 官方答案、四選項或解題材料缺漏`);
  if (number >= 35 && row) {
    if (/【Reading material】\s*【Reading material】/.test(row.question) || /【閱讀材料】\s*【Reading material】/.test(row.question)) errors.push(`114英文第${number}題: 閱讀材料標籤重複`);
    if (row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`114英文第${number}題: 題幹材料足以作答，不應附整頁考卷圖`);
  }
  english114Q31to43.push(row);
}
if (new Set(english114Q31to43.slice(4).map(row => row?.teacherTip?.trim())).size !== 9) errors.push("114英文第35–43題: 教師提示有重複套語");
const workEnergyQuestion = official.find(question => question.id === "OFF-0862");
if (!workEnergyQuestion?.question.includes("加速度較大") || !workEnergyQuestion.explanation.includes("W＝FS") || !workEnergyQuestion.solutionSteps.some(step => step.includes("½mv²＝FS"))) errors.push("113自然第38題: 兩種質量策略或動能推導不完整");
const science114 = number => official.find(question => question.source?.year === 114 && question.subject === "自然" && question.source.questionNumber === number);
for (const [number, answer, clue] of [[1, 2, "超聲波頻率超出人耳可聽範圍"], [2, 1, "天平甲測質量"], [3, 0, "捕食麻雀幼鳥"], [4, 0, "硫磺（硫）是元素"], [5, 3, "暖空氣沿鋒面向左上方爬升"], [6, 0, "地表因而下沉"], [7, 1, "只改變節日／太陽直射位置"], [8, 0, "照光呈綠色的甲部位"], [9, 3, "F′右＝F右＝1 N"], [10, 1, "甲乙間作用力增大"]]) {
  const row = science114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114自然第${number}題: 官方答案、解題依據或教師提醒與已審題內容不符`);
}
const groundwaterSubsidence = science114(6);
if (!groundwaterSubsidence?.options?.some(option => option.includes("地層下陷")) || groundwaterSubsidence.solutionSteps?.some(step => step.includes("照片 A"))) errors.push("114自然第6題: 地層下陷選項文字或解題引用未顯示的照片");
for (const [number, clues] of [[43, ["−13°C", "96%", "100%"]], [44, ["pH 3.0", "醋酸", "乳酸", "100%", "70%"]], [45, ["每隔 30 秒", "低於 1 分鐘", "1～5 分鐘", "超過 5 分鐘"]], [46, ["低於 1 分鐘", "1～5 分鐘", "超過 5 分鐘"]], [47, ["100 gw", "150 gw", "200 gw", "10 cm"]], [48, ["(100, 100)", "(200, 150)", "(300, 200)"]], [49, ["頭頂俯視", "上弦月", "下弦月", "太陽光方向固定"]], [50, ["上弦月", "下弦月", "半圓"]]]) {
  const row = science114(number);
  if (!row || clues.some(clue => !row.question.includes(clue))) errors.push(`114自然第${number}題: 原卷必要文字或數據未完整轉入題幹`);
}
for (const [number, image] of [[45, "114-science-q45-bleeding-spots.svg"], [49, "114-science-q49-moon-phase-options.svg"], [50, "114-science-q50-moon-path.svg"]]) {
  const row = science114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114自然第${number}題: 必要示意圖未正確顯示或未加入離線快取`);
}
for (const [number, answer, clue] of [[43, 3, "加快後續變色"], [44, 2, "各水溶液 pH 為 3"], [45, 3, "約 330 秒"], [46, 3, "血小板"], [47, 1, "150×10=1500"], [48, 3, "F=0.5M+50 gw"], [49, 2, "只有 C 在兩處都維持同一受光方向"], [50, 1, "14～15 天"]]) {
  const row = science114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114自然第${number}題: 官方答案、解題依據或教師提醒與已審題內容不符`);
}
for (const [number, answer, clue] of [[11, 2, "30 ppm"], [12, 2, "大腦"], [13, 3, "背風側"], [14, 2, "最多有兩顆白球"], [15, 1, "板塊在軟流圈上移動"], [16, 2, "不可能約 7 百萬年前"], [17, 0, "w=20"], [18, 2, "最大靜摩擦力為 400 gw"], [19, 2, "難溶的碳酸鈣沉澱"], [20, 1, "甲的血糖較早、較大幅上升"]]) {
  const row = science114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114自然第${number}題: 官方答案、解題依據或教師提醒與已審題內容不符`);
}
for (const [number, image] of [[15, "114-science-q15-plate-map.png"], [16, "114-science-q16-strata.png"], [18, "114-science-q18-friction-graph.png"], [20, "114-science-q20-glucose-chart.png"]]) {
  const row = science114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114自然第${number}題: 單題必要圖表缺漏或未加入離線快取`);
}
const redLightInference = science114(14);
if (!redLightInference?.explanation.includes("選項 D") || !redLightInference.explanation.includes("題目單選措辭略有歧義") || !redLightInference.teacherTip.includes("較寬鬆上界")) errors.push("114自然第14題: 紅光推論中選項D的邏輯歧義未揭露");
for (const [number, answer, clue] of [[21, 3, "70°C 的質量變化率均高於 50°C"], [22, 2, "木質部"], [23, 1, "B為8百帕"], [24, 0, "四個不同屬"], [25, 1, "0.96 mW"], [26, 3, "Q=mcΔT"], [27, 3, "反光鏡"], [28, 1, "碘被還原"], [29, 3, "m丙＞m甲＞m乙"], [30, 0, "兩隻黑眼親代都必須帶有 a"], [31, 0, "電流方向向北"], [32, 1, "68 g H₂S"]]) {
  const row = science114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114自然第${number}題: 官方答案、解題依據或教師提醒與已審題內容不符`);
}
for (const [number, image] of [[21, "114-science-q21-polymer-charts.png"], [23, "114-science-q23-isobar-options.png"], [24, "114-science-q24-bird-table.png"], [25, "114-science-q25-battery-table.png"], [27, "114-science-q27-antique-microscope.png"], [31, "114-science-q31-circuit-setups.png"]]) {
  const row = science114(number);
  if (!row?.requiresImage || !row.questionImages?.includes(`./assets/official-exams/${image}`) || !serviceWorker.includes(image)) errors.push(`114自然第${number}題: 必要原卷圖表缺漏或未加入離線快取`);
}
for (const [number, clues] of [[22, ["外側韌皮部", "內側木質部"]], [26, ["忽略熱量 散失"]], [28, ["碘液被還原", "乙（加水對照組）"]], [29, ["X 的密度大於 Y", "X 5 mL、Y 5 mL"]], [30, ["黑眼與紅眼子代", "A 為顯性"]], [32, ["70 g", "64 g", "2 g"]]]) {
  const row = science114(number);
  if (!row || clues.some(clue => !row.question.includes(clue)) || row.requiresImage || row.questionImages?.length) errors.push(`114自然第${number}題: 題幹必要條件缺漏或文字題仍依賴試卷截圖`);
}
const specificHeatOptions = science114(26);
if (!specificHeatOptions?.options.some(option => option.includes("相同質量")) || !specificHeatOptions.options.some(option => option.includes("溫度上升較快"))) errors.push("114自然第26題: 比熱比較所需的控制條件或判準選項缺漏");
for (const [number, answer, clue] of [[33, 3, "與震央同側的乙處"], [34, 3, "乙沒有細胞核"], [35, 0, "種子萌芽長成幼苗也靠有絲分裂生長"], [36, 0, "僅甲"], [37, 1, "地球與火星可以分居太陽兩側"], [38, 2, "位置並保持一致"], [39, 2, "F₂與F₇相等且大於F₅"], [40, 0, "降溫並凝結"], [41, 3, "每單位質量可產生能量多"], [42, 1, "0.021×3 元"]]) {
  const row = science114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114自然第${number}題: 官方答案、解題依據或教師提醒與已審題內容不符`);
}
for (const [number, image] of [[33, "114-science-q33-fault-maps.png"], [35, "114-science-q35-division.png"], [39, "114-science-q39-velocity-time-graph.png"], [41, "114-science-q41-fuel-energy-chart.png"]]) {
  const row = science114(number);
  if (!row?.requiresImage || !row.questionImages?.includes(`./assets/official-exams/${image}`) || !serviceWorker.includes(image)) errors.push(`114自然第${number}題: 必要原卷圖表缺漏或未加入離線快取`);
}
for (const [number, clues] of [[34, ["細胞核", "葉綠素", "菌絲"]], [36, ["本氏液陰性", "本氏液陽性"]], [37, ["水星、金星、地球、火星、木星"]], [38, ["至少1.5 m", "1.2 m"]], [40, ["塞住瓶口並倒置", "冰塊"]], [42, ["700 W", "0.021 kWh", "一度電 3 元"]]]) {
  const row = science114(number);
  if (!row || clues.some(clue => !row.question.includes(clue)) || row.requiresImage || row.questionImages?.length) errors.push(`114自然第${number}題: 題幹關鍵材料未完整提供或文字題仍依賴試卷截圖`);
}
const bleedingTime = science114(45);
if (!bleedingTime?.explanation.includes("330 秒") || !bleedingTime.solutionSteps.some(step => step.includes("11 個點位"))) errors.push("114自然第45題: 30秒採樣點位換算缺少明確解題步驟");
const social114Q31 = official.find(question => question.subject === "社會" && question.source?.year === 114 && question.source.questionNumber === 31);
if (!social114Q31?.question.includes("高砂義勇隊") || !social114Q31.question.includes("南洋") || social114Q31.requiresImage || social114Q31.questionImages?.length) errors.push("114社會第31題: 關鍵史料未轉錄到題幹或仍依賴掃描圖");
const social114 = number => official.find(question => question.subject === "社會" && question.source?.year === 114 && question.source.questionNumber === number);
const chinese114 = number => official.find(question => question.subject === "國文" && question.source?.year === 114 && question.source.questionNumber === number);
for (const [number, answer, clue] of [[1, 3, "用自己的話說明"], [2, 0, "杏林之光"], [3, 0, "原住民服飾吸收漢人剪裁"], [4, 1, "金文 → 小篆 → 隸書 → 楷書"], [5, 3, "不用現金支付使人對花錢的感受變得較遲鈍"], [6, 2, "爆冷門"], [7, 2, "句號置於丙"], [8, 2, "請人磨平硯眼是自作聰明"], [9, 1, "帶有表演性質"], [10, 2, "以假象竊名"]]) {
  const row = chinese111(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`111國文第${number}題: 官方答案、解題說明或關鍵依據與已審內容不符`);
}
for (const [number, clues] of [[1, ["閱讀", "重新組織知識", "用自己的方式說明", "貨真價實的知識"]], [2, ["黃醫師", "杏林之光", "近悅遠來", "眾望所歸", "桃李芬芳"]], [3, ["臺灣原住民", "漢人", "泰雅族", "日本布"]], [4, ["金文", "小篆", "隸書", "楷書"]], [5, ["紙鈔", "卡片", "輸贏情況", "不斷輸錢"]], [6, ["東道主法國隊", "九局下逆轉", "波多黎各", "輕取哥倫比亞"]], [7, ["【甲】", "【乙】", "【丙】", "【丁】", "何況記憶"]], [8, ["佳硯", "鴝鵒眼", "微凸", "磨而平之"]], [9, ["24小時", "樂於被窺視", "知道鏡頭在哪裡"]], [10, ["名不可以倖取", "外似而中實不然", "竊其名", "無不立敗"]]]) {
  const row = chinese111(number);
  const text = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !text.includes(clue.replace(/\s+/g, "")))) errors.push(`111國文第${number}題: 題幹／選項材料不完整`);
}
for (const number of [1, 2, 3, 5, 6, 7, 8, 9, 10]) {
  const row = chinese111(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`111國文第${number}題: 完整文字題不應顯示試卷截圖`);
}
const chinese111Glyphs = chinese111(4);
if (!chinese111Glyphs?.questionImage.endsWith("111-chinese-q04-glyph-options.svg") || chinese111Glyphs.questionImages?.[0] !== chinese111Glyphs.questionImage || !chinese111Glyphs.question.includes("金文 → 小篆 → 隸書 → 楷書") || !serviceWorker.includes("111-chinese-q04-glyph-options.svg")) errors.push("111國文第4題: 字形局部圖及離線材料缺漏");
for (const [number, answer, clue] of [[1, 3, "④「引發情緒反應」"], [2, 1, "家屬必須在場"], [3, 1, "「木」也由樹幹"], [4, 1, "快樂與悲傷等量並存"], [5, 0, "後起的楷書"], [6, 0, "法國於 3 月 17 日封城後"], [7, 1, "仄起平收"], [8, 2, "黃、光、藏、香、行"], [9, 2, "並非最高等級"], [10, 0, "穴蜜多產於乾燥地區"]]) {
  const row = chinese114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114國文第${number}題: 官方答案、文本推論或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[1, ["臺灣自來水公司", "275元", "三日內", "終止供水"]], [2, ["屍所", "禁止將屍體帶到他處", "家屬必須在場", "公同一干人眾"]], [3, ["月", "小", "木", "出", "汝"]], [4, ["我的快樂除以我的悲傷", "得到的商", "卻只是1"]], [5, ["東漢", "《說文解字》", "小篆", "籀文"]], [6, ["法國", "30%", "阿根廷", "25%", "賽普勒斯及新加坡", "性別不平等"]], [7, ["甲、乙二圖"]], [8, ["芙蓉映水菊花黃", "枯荷葉底鷺鷥藏", "斜月", "新雁"]], [9, ["成品內沒有花", "玫瑰烏龍", "純花茶", "香片"]], [10, ["十居其八", "十居其二", "北方乾燥", "南方卑溼"]]]) {
  const row = chinese114(number);
  const stemAndOptions = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !stemAndOptions.includes(clue.replace(/\s+/g, "")))) errors.push(`114國文第${number}題: 必要原文、資料或選項情境缺漏`);
}
for (const number of [1, 2, 4, 6, 8, 9, 10]) {
  const row = chinese114(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`114國文第${number}題: 已轉錄完整的文字材料仍依賴整頁掃描`);
}
for (const [number, image] of [[3, "114-chinese-q03-origin-chart.png"], [5, "114-chinese-q05-seal-script-options.png"], [7, "114-chinese-q07-couplet-diagrams.png"]]) {
  const row = chinese114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114國文第${number}題: 必要字形／春聯圖缺漏或未加入離線快取`);
}
for (const [number, answer, clue] of [[11, 3, "時間沉澱後"], [12, 2, "冒號可用來引出說明"], [13, 2, "延遲拖延"], [14, 0, "「揶揄」讀 ㄧㄝˊ ㄩˊ"], [15, 0, "唐傳奇"], [16, 0, "「有志竟成」"], [17, 2, "具體景象"], [18, 3, "接觸到的是鄰居"], [19, 0, "不可名狀"], [20, 3, "李善長更適任"]]) {
  const row = chinese114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114國文第${number}題: 官方答案、文本推論或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[11, ["旅行回來", "時間如果不是個偉大的作者", "不寫也罷"]], [12, ["我的本行是科學而非文學", "科學需要人文的關懷", "文學需要理性的自覺"]], [13, ["淪為一段佳話", "如今終於竣工", "不愧有你的幫忙"]], [14, ["「揶」揄", "晾", "藩", "栽"]], [15, ["《聊齋志異》共492篇", "奇聞逸事", "真正的短篇小說", "唐傳奇"]], [16, ["有志竟成", "趕進殺絕", "情不自盡", "眼不見為靜"]], [17, ["誰向江頭遺恨濃", "碧波流不斷", "桃李小園空", "阿誰：何人"]], [18, ["野徑入桑麻", "秋來未著花", "欲去問西家", "歸來每日斜"]], [19, ["不可名狀", "不以為意", "不言而喻", "不置可否"]], [20, ["善長勛舊", "吾將相汝", "是如易柱，須得大木", "束小木為之"]]]) {
  const row = chinese114(number);
  const stemAndOptions = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !stemAndOptions.includes(clue.replace(/\s+/g, "")))) errors.push(`114國文第${number}題: 必要原文、文章細節或選項用字缺漏`);
}
for (let number = 11; number <= 20; number++) {
  const row = chinese114(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`114國文第${number}題: 文字完整題目不應依賴整頁試卷截圖`);
}
for (const [number, answer, clue] of [[21, 3, "塞內加爾也可能"], [22, 1, "工作更繁忙"], [23, 3, "畏懼與不畏懼"], [24, 1, "嫁名給梅聖俞"], [25, 1, "暴露牠們藏在泥灘中的位置"], [26, 0, "兩代價值觀差異"], [27, 1, "少了蘭嶼這段"], [28, 2, "次生林提供豐富食物"], [29, 2, "腦中形成畫面"], [30, 3, "情節轉折"]]) {
  const row = chinese114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114國文第${number}題: 官方答案、文本推論或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[21, ["荷蘭對美國", "阿根廷對澳大利亞", "日本對克羅埃西亞", "巴西對南韓", "英格蘭對塞內加爾", "法國對波蘭", "摩洛哥對西班牙", "葡萄牙對瑞士"]], [22, ["每早過戶", "本流既大", "不暇唱曲"]], [23, ["遠方之卒守塞", "募民屯戍", "一歲而更"]], [24, ["皆歷詆慶曆", "乃魏泰所為", "嫁之聖俞"]], [25, ["北極圓蛤", "公呆", "噴水示警", "生命短暫"]], [26, ["公呆", "外婆", "孫子", "世代"]], [27, ["灰面鵟鷹", "蘭嶼", "琉球", "菲律賓", "八卦山"]], [28, ["次生林", "上升氣流"]], [29, ["四項", "場景外觀", "場景事件", "角色外貌", "角色行動"]], [30, ["380", "390", "400", "右鼓棒斷成兩半", "巴迪．瑞奇"]]]) {
  const row = chinese114(number);
  const stemAndOptions = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !stemAndOptions.includes(clue.replace(/\s+/g, "")))) errors.push(`114國文第${number}題: 原文、賽程／表格資料或共用閱讀材料缺漏`);
}
for (const number of [22, 23, 24, 25, 26, 28, 29, 30]) {
  const row = chinese114(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`114國文第${number}題: 文字完整材料不應依賴整頁試卷截圖`);
}
for (const [number, image] of [[21, "114-chinese-q21-bracket.png"], [27, "114-chinese-q27-migration-maps.png"]]) {
  const row = chinese114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114國文第${number}題: 必要賽程圖／遷徙路線圖缺漏或未加入離線快取`);
}
for (const [number, answer, clue] of [[31, 2, "最無法呼應「角色外貌」"], [32, 2, "重視良好的生活品質"], [33, 3, "忍受犧牲也有極限"], [34, 0, "屬於直接漲價"], [35, 3, "價格變化不容易直接看出來"], [36, 1, "兩種分類都沒有把南唐君主列為中原正統帝王"], [37, 2, "明確肯定李氏三代對文化的貢獻"], [38, 0, "所以圖上應分別在諸樊下接光、夷昧下接僚"], [39, 3, "不能接受僚繼位"], [40, 1, "日常俗務、世俗瑣事"]]) {
  const row = chinese114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114國文第${number}題: 官方答案、文本推論或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[31, ["原題畫線處", "安德魯的練習室", "電子節拍器", "角色外貌"]], [32, ["工作熱忱", "生活品質", "自我實現", "到了「夠」的時候"]], [33, ["犧牲已到達極限"]], [34, ["62%", "縮水式漲價", "減少內容量"]], [35, ["銅板價小包裝", "不同用途", "價格比較"]], [36, ["《舊五代史》", "《新五代史》", "僭偽列傳", "世家"]], [37, ["五代十國", "三位君主", "教坊", "網羅畫師"]], [38, ["吳王諸樊", "餘祭", "夷昧", "季子札", "公子光"]], [39, ["諸樊死後", "王位依序傳給餘祭、夷眛", "立夷眛之子僚為王", "真正嫡嗣"]], [40, ["日前令郎", "比來", "一旦", "俗故忽忽"]]]) {
  const row = chinese114(number);
  const stemAndOptions = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !stemAndOptions.includes(clue.replace(/\s+/g, "")))) errors.push(`114國文第${number}題: 史料／閱讀文本／原題標示關鍵內容缺漏`);
}
for (const [number, answer, clue] of [[41, 3, "自然清奇之美"], [42, 1, "喜出望外"]]) {
  const row = chinese114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114國文第${number}題: 共用古文解讀、答案或教學說明不符`);
}
for (const number of [41, 42]) {
  const row = chinese114(number);
  if (!row || !row.question.includes("天質圓瑩") || !row.question.includes("坐致握中") || !row.question.includes("俗故忽忽") || !row.question.includes("令郎注官甚便") || !row.question.includes("注官：依當時官制授職") || row.requiresImage || row.questionImages?.length) errors.push(`114國文第${number}題: 共用古文材料或注釋缺漏／不必要地依賴試卷掃描`);
}
for (const number of [31, 32, 33, 34, 35, 36, 37, 39, 40]) {
  const row = chinese114(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`114國文第${number}題: 文字材料完整題不應依賴整頁掃描`);
}
const chinese114FamilyDiagram = chinese114(38);
if (!chinese114FamilyDiagram?.requiresImage || chinese114FamilyDiagram.questionImage !== "./assets/official-exams/114-chinese-q38-family-options.svg" || !chinese114FamilyDiagram.questionImages?.includes(chinese114FamilyDiagram.questionImage) || !serviceWorker.includes("114-chinese-q38-family-options.svg")) errors.push("114國文第38題: 親屬關係圖缺漏或未加入離線快取");
for (const [number, answer, clue] of [[1, 0, "日本和臺灣一樣位於環太平洋地震帶"], [2, 0, "補充農場與牧場人力"], [3, 1, "相同現象"], [4, 1, "河流曲流旁的聚落環境相符"], [5, 1, "醫療可近性與資源均衡"], [6, 2, "帝國大學"], [7, 3, "近代平等觀念傳入"], [8, 2, "宋代市舶司"], [9, 2, "中國共產黨成立"], [10, 1, "版畫批判教會販售贖罪券"]]) {
  const row = social114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114社會第${number}題: 官方答案、史料推理或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[1, ["地震", "颱風"]], [2, ["2019年底", "外展農業移工"]], [3, ["舊金山", "春節", "清明節", "華語"]], [5, ["離島", "2018年"]], [7, ["入學", "財產", "出入自由", "婚姻自由"]], [8, ["十一世紀", "收取關稅", "進口商品"]], [9, ["巴黎和會", "五四運動", "俄國革命"]]]) {
  const row = social114(number);
  if (!row || clues.some(clue => !row.question.includes(clue)) || row.requiresImage || row.questionImages?.length) errors.push(`114社會第${number}題: 閱讀材料必要資訊缺漏或文字題仍依賴截圖`);
}
for (const [number, image] of [[4, "114-social-q04-wazai-map.png"], [6, "114-social-q06-taipei-map.png"], [10, "114-social-q10-indulgence-woodcut.png"]]) {
  const row = social114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114社會第${number}題: 必要歷史地圖或圖像史料缺漏／未離線快取`);
}
for (const [number, answer, clue] of [[11, 2, "在地調適與文化交流"], [12, 3, "強迫勞動"], [13, 3, "增加供給者與選擇"], [14, 2, "沒有任何一人是另一人的直系尊親屬"], [15, 2, "比例差異明顯"], [16, 2, "東南亞"], [17, 0, "甲位在河流通過的低地谷線"], [18, 1, "甲地生活成本高、工資遠高於鄰國乙地"], [19, 3, "漠南非洲"], [20, 2, "糖漏"]]) {
  const row = social114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114社會第${number}題: 官方答案、資料推論或教師提醒與已審內容不符`);
}
for (const [number, image] of [[14, "114-social-q14-family-diagram.png"], [16, "114-social-q16-western-route-map.png"], [17, "114-social-q17-contour-map.png"], [19, "114-social-q19-population-pyramids.png"]]) {
  const row = social114(number);
  if (!row?.requiresImage || !row.questionImages?.includes(`./assets/official-exams/${image}`) || !serviceWorker.includes(image)) errors.push(`114社會第${number}題: 必要圖表缺漏或未加入離線快取`);
}
const social114SugarMap = social114(20);
if (!social114SugarMap?.requiresImage || !social114SugarMap.questionImages?.includes("./assets/official-exams/114-social-q20-sugar-tool.png") || !social114SugarMap.questionImages.includes("./assets/official-exams/114-social-q20-taiwan-map.png") || !serviceWorker.includes("114-social-q20-sugar-tool.png") || !serviceWorker.includes("114-social-q20-taiwan-map.png")) errors.push("114社會第20題: 製糖工具與臺灣位置圖缺一或未離線快取");
for (const [number, clues] of [[11, ["跨國咖啡公司", "當地文字", "創意餐點"]], [12, ["2022年6月21日起", "新疆", "強迫維吾爾人勞動"]], [13, ["意見回饋箱", "競爭程"]], [15, ["水果臺", "F News", "馬水新聞", "W電視", "28%", "21%"]], [18, ["1天的薪水", "約1小時"]]]) {
  const row = social114(number);
  if (!row || clues.some(clue => !row.question.includes(clue)) || row.requiresImage || row.questionImages?.length) errors.push(`114社會第${number}題: 題幹必要閱讀／表格資訊缺漏或文字題仍依賴截圖`);
}
for (const [number, answer, clue] of [[21, 0, "中央任命官員管理地方"], [22, 2, "八年抗戰"], [23, 0, "1989年東德人"], [24, 3, "便利科技可能提高參與意願"], [25, 3, "降低勞工舉證困難"], [26, 0, "兩類已婚女性勞動參與率都低於尚無子女者"], [27, 3, "分散博斯普魯斯海峽船流"], [28, 1, "北緯1.33度"], [29, 1, "選項 B 的塗色範圍"], [30, 2, "植被與健康土壤"]]) {
  const row = social114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114社會第${number}題: 官方答案、資料推論或教師提醒與已審內容不符`);
}
const socialLaborChart = social114(26);
if (!socialLaborChart?.questionImage?.endsWith("114-social-q26-labor-chart.png") || !socialLaborChart.question.includes("三類已婚女性") || !socialLaborChart.solutionSteps?.some(step => ["尚無子女", "未滿6歲子女", "6歲以上子女"].every(label => step.includes(label))) || socialLaborChart.explanation.includes("未婚女性") || !socialLaborChart.explanation.includes("兩類已婚女性")) errors.push("114社會第26題: 人口分組誤讀或必要勞參率圖表缺漏");
for (const [number, image] of [[22, "114-social-q22-newspaper-clipping.png"], [23, "114-social-q23-europe-map.png"], [26, "114-social-q26-labor-chart.png"], [27, "114-social-q27-black-sea-canal-map.png"], [28, "114-social-q28-singapore-map.png"], [29, "114-social-q29-china-rainfall-options.png"]]) {
  const row = social114(number);
  if (!row?.requiresImage || !row.questionImages?.includes(`./assets/official-exams/${image}`) || !serviceWorker.includes(image)) errors.push(`114社會第${number}題: 必要歷史／地理圖表缺漏或未離線快取`);
}
if (social114(26)?.questionImage !== "./assets/official-exams/114-social-q26-labor-chart.png") errors.push("114社會第26題: 女性勞動力圖表未顯示");
for (const [number, answer, clue] of [[31, 0, "高砂義勇隊"], [32, 1, "荷蘭東印度公司"], [33, 3, "1946年有出口紀錄"], [34, 2, "行使同意權"], [35, 1, "受到制度與民意監督"], [36, 0, "檢察官依法偵查、提起公訴"], [37, 2, "公平貿易"], [38, 0, "無行為能力人"], [39, 0, "日幣相對披索貶值"], [40, 3, "北約成員"]]) {
  const row = social114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114社會第${number}題: 官方答案、史料／情境推理或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[31, ["大武祠", "高砂義勇隊", "南洋作戰"]], [32, ["江戶幕府", "荷蘭人監禁"]], [33, ["1946年", "60,696", "1950年", "1960年"]], [34, ["法官", "立法委員"]], [35, ["修築運河", "社會住宅", "公聽會"]], [36, ["檢察官", "被告", "辯護律師", "法官"]], [37, ["社會企業", "商業活動", "社會或環境問題"]], [38, ["失智症患者", "監護", "法律效果"]], [39, ["相同金額", "日幣", "菲律賓披索", "10%"]]]) {
  const row = social114(number);
  if (!row || clues.some(clue => !row.question.includes(clue)) || row.requiresImage || row.questionImages?.length) errors.push(`114社會第${number}題: 必要史料／數據未轉錄完整或文字題仍依賴整頁掃描`);
}
const kaliningradMap = social114(40);
if (!kaliningradMap?.question.includes("加里寧格勒") || !kaliningradMap.requiresImage || kaliningradMap.questionImage !== "./assets/official-exams/114-social-q40-kaliningrad-map.png" || !kaliningradMap.questionImages?.includes(kaliningradMap.questionImage) || !serviceWorker.includes("114-social-q40-kaliningrad-map.png")) errors.push("114社會第40題: 加里寧格勒地圖缺漏或未加入離線快取");
for (const [number, answer, clue] of [[41, 3, "2020年夏季臺灣沒有颱風登陸"], [42, 2, "告訴乃論至多74件"], [43, 1, "阿茲提克容器"], [44, 0, "原產於美洲"], [45, 3, "西班牙文"], [46, 3, "社會規範及民意"], [47, 3, "偏好及誘因感受不同"], [48, 2, "行政救濟途徑"], [49, 0, "祆教"], [50, 1, "向中國輸出鴉片"]]) {
  const row = social114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114社會第${number}題: 官方答案、資料推論或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[41, ["翡翠水庫", "80.9%", "94.6%", "62.1%", "德基水庫", "2.7%"]], [42, ["民事", "刑事", "超過半數", "告訴乃論"]], [43, ["墨西哥首都", "六十萬件", "風、火、水、土", "官方語文"]], [44, ["古文明農業", "雕像", "原產美洲", "主食"]], [45, ["今日當地官方語文"]], [46, ["數字4", "字母I、O", "BAD、BUM、END"]], [47, ["6666", "生日或紀念日", "隨機分配"]], [48, ["車牌", "違規", "《道路交通管理處罰條例》"]], [49, ["伊朗高原", "阿拉伯軍隊", "薩珊王朝", "印度半島西部"]], [50, ["十九世紀上半葉", "控制印度的英國殖民者", "中國商人"]]]) {
  const row = social114(number);
  if (!row || clues.some(clue => !row.question.includes(clue)) || ([43, 44].includes(number) ? !row.requiresImage : row.requiresImage || row.questionImages?.length)) errors.push(`114社會第${number}題: 關鍵閱讀材料／數據缺漏或題幹與必要圖像配置不符`);
}
for (const [number, image] of [[43, "114-social-q43-artifacts.svg"], [44, "114-social-q44-god-statue.svg"]]) {
  const row = social114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114社會第${number}題: 必要文物／雕像圖缺漏或未加入離線快取`);
}
for (const [number, image] of [[43, "114-social-q43-artifacts.svg"], [44, "114-social-q44-god-statue.svg"], [53, "114-social-q53-iceberg-map.svg"]]) {
  const row = social114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114社會第${number}題: 必要圖像未使用專用裁切或未加入離線快取`);
}
const parsiTombstone = social114(51);
if (!parsiTombstone?.question.includes("西元1850年") || !parsiTombstone.question.includes("伊嗣俟紀元1219年") || parsiTombstone.requiresImage || parsiTombstone.questionImages?.length) errors.push("114社會第51題: 墓碑日期線索未提供或仍依賴整頁掃描");
for (const [number, answer, clue] of [[51, 3, "耶茲德格德三世"], [52, 2, "阿根廷於1927年主張南喬治亞島主權"], [53, 1, "整體朝東北漂流"], [54, 3, "破壞沿岸環境並威脅生物"]]) {
  const row = social114(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || !row.solutionSteps?.length || !row.teacherTip) errors.push(`114社會第${number}題: 官方答案、材料推論或教師提醒與已審內容不符`);
}
for (const [number, clues] of [[51, ["巴斯人", "西元1850年", "伊嗣俟紀元1219年"]], [52, ["南喬治亞島", "1775年", "阿根廷", "1982年"]], [53, ["2017年", "4,200平方公里", "圖(二十一)", "冰山"]], [54, ["海豹", "企鵝", "巨大冰山", "撞上南喬治亞島"]]]) {
  const row = social114(number);
  if (!row || clues.some(clue => !row.question.includes(clue))) errors.push(`114社會第${number}題: 閱讀材料或日期線索缺漏`);
}
const icebergMap = social114(53);
if (!icebergMap?.requiresImage || icebergMap.questionImage !== "./assets/official-exams/114-social-q53-iceberg-map.svg" || !icebergMap.questionImages?.includes(icebergMap.questionImage) || !serviceWorker.includes("114-social-q53-iceberg-map.svg") || !social114IcebergMapSvg.includes("2017、2019及2020年") || !social114IcebergMapSvg.includes("viewBox=")) errors.push("114社會第53題: 冰山漂流位置圖未呈現三個日期／必要裁切或未加入離線快取");
for (const number of [41, 42, 45, 46, 47, 48, 49, 50, 52, 54]) {
  const row = social114(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`114社會第${number}題: 可文字作答題仍掛載整頁截圖`);
}
const social110 = number => official.find(question => question.subject === "社會" && question.source?.year === 110 && question.source.questionNumber === number);
const social111 = number => official.find(question => question.subject === "社會" && question.source?.year === 111 && question.source.questionNumber === number);
for (const number of [1, 4, 5, 6, 7, 8, 9, 10]) {
  const row = social111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111社會第${number}題: 文字完整題目仍依賴整頁截圖`);
}
for (const number of [11, 13, 14, 17, 19, 20]) {
  const row = social111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111社會第${number}題: 文字完整題目仍依賴整頁截圖`);
}
const social111Nationality = social111(13);
if (!social111Nationality?.explanation.includes("不是只看出生地") || !social111Nationality.solutionSteps?.some(step => step.includes("不能只憑在臺灣出生"))) errors.push("111社會第13題: 國籍推論未說明出生地主義限制");
const social111Newspaper = social111(20);
if (!["艋舺", "打狗", "220 圓", "臺南火車站"].every(value => social111Newspaper?.question.includes(value)) || !social111Newspaper?.explanation.includes("打狗") || social111Newspaper.requiresImage) errors.push("111社會第20題: 歷史報紙材料缺少關鍵地名/用語或仍依賴截圖");
const social111Heatwave = social111(29);
if (!social111Heatwave?.question.includes("34.3") || !social111Heatwave.explanation.includes("39.3°C（含）以上") || !social111Heatwave.solutionSteps?.some(step => step.includes("至少達 39.3°C"))) errors.push("111社會第29題: 熱浪門檻的五度差與含等號條件不一致");
for (const [number, image] of [[12, "111-social-q12-fertility-chart.png"], [15, "111-social-q15-us-climate-map.png"], [16, "111-social-q16-borneo-forest.png"], [18, "111-social-q18-capes.png"]]) {
  const row = social111(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`111社會第${number}題: 必要專用圖表缺漏或未加入離線快取`);
}
for (const [number, image] of [[31, "111-social-q31-trade-stages.png"], [33, "111-social-q33-meeting-flow.png"], [36, "111-social-q36-shopping-map.png"], [38, "111-social-q38-language-coin.png"], [39, "111-social-q39-gender-charts.png"], [40, "111-social-q40-africa-trade-article.png"]]) {
  const row = social111(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`111社會第${number}題: 必要專用圖像缺漏或未加入離線快取`);
}
for (const number of [32, 34, 35, 37]) {
  const row = social111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111社會第${number}題: 文字完整題目不應依賴整頁試卷圖`);
}
const social111Mediation = social111(35);
if (!social111Mediation?.explanation.includes("送法院核定") || !social111Mediation.explanation.includes("民事確定判決有同一效力") || !social111Mediation.solutionSteps?.some(step => step.includes("經核定的民事調解"))) errors.push("111社會第35題: 調解的法院核定及效力條件未說明");
for (const [number, images] of [[41, ["111-social-q41-world-map.png"]], [42, ["111-social-q42-trade-diagram.png"]], [43, ["111-social-q43-propaganda-cartoon.png"]], [46, ["111-social-q46-diqian-taiwan-map.png"]], [47, ["111-social-q47-japanese-landuse-map.png"]], [48, ["111-social-q47-japanese-landuse-map.png", "111-social-q48-water-map.png"]]]) {
  const row = social111(number);
  if (!row?.requiresImage || images.some(image => !row.questionImages?.includes(`./assets/official-exams/${image}`) || !serviceWorker.includes(image))) errors.push(`111社會第${number}題: 必要圖像材料缺漏或未加入離線快取`);
}
for (const number of [44, 45, 49, 50]) {
  const row = social111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111社會第${number}題: 完整閱讀材料題不應掛載整頁截圖`);
}
const social111KoreanWar = social111(43);
if (!social111KoreanWar?.explanation.includes("韓戰") || !social111KoreanWar.explanation.includes("1950 年") || social111KoreanWar.explanation.includes("第二次世界大戰")) errors.push("111社會第43題: 漫畫年代判讀誤植或未解釋韓戰與聯合國介入");
const social111SharedMap = social111(48);
if (!social111SharedMap?.questionImages?.includes("./assets/official-exams/111-social-q48-water-map.png") || !social111SharedMap.question.includes("圖(二十五)與圖(二十六)")) errors.push("111社會第48題: 缺少判讀地名所需的歷史水塘/河流圖");
const social111AirPollution = [52, 53, 54].map(social111);
if (social111AirPollution.some(row => !row?.question.includes("吐出一個全黑的物體") || row.question.includes("出了一個全黑的物體"))) errors.push("111社會第52–54題: 夏目漱石共用引文仍有OCR誤字或題間內容不一致");
if (social111AirPollution.some(row => !row.question.includes("西歐盛行風") || !row.question.includes("低技術勞動階級") || !row.question.includes("污染嚴重的區域"))) errors.push("111社會第52–54題: 共用空污閱讀材料缺少盛行風或階級居住線索");
const social111CityDiagram = social111(53);
if (!social111CityDiagram?.requiresImage || social111CityDiagram.questionImage !== "./assets/official-exams/111-social-q53-city-diagram.png" || !social111CityDiagram.questionImages?.includes(social111CityDiagram.questionImage) || !serviceWorker.includes("111-social-q53-city-diagram.png")) errors.push("111社會第53題: 必要城市風向示意圖缺漏或未加入離線快取");
for (const number of [51, 52, 54]) {
  const row = social111(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111社會第${number}題: 材料已完整轉錄，不應依賴整頁試卷圖`);
}
const pilgrimageTable = social111(1);
if (!["沙烏地阿拉伯 600,108", "印尼 221,000", "巴基斯坦 179,210", "其他國家 635,106"].every(value => pilgrimageTable?.question.includes(value))) errors.push("111社會第1題: 朝覲來源國人數表未完整轉入題幹");
const reservoirSediment = social111(4);
if (!["40 座", "15 座", "74.8%", "49.2%"].every(value => reservoirSediment?.question.includes(value))) errors.push("111社會第4題: 水庫淤積統計數據未完整轉入題幹");
for (const [number, image] of [[1, "110-social-q01-islands.svg"], [3, "110-social-q03-salt-chart.svg"], [5, "110-social-q05-map.png"], [7, "110-social-q07-great-leap-photos.svg"], [10, "110-social-q10-taiwan-locations.svg"]]) {
  const row = social110(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`110社會第${number}題: 必要圖像未使用題目專用裁切或未加入離線快取`);
}
for (const [number, image] of [[15, "110-social-q15-management-plan.svg"], [16, "110-social-q16-forest-chart.svg"], [17, "110-social-q17-hump-route.svg"], [21, "110-social-q21-tang-mission-route.svg"], [26, "110-social-q26-tobacco-tax-chart.svg"], [29, "110-social-q29-us-aircraft-map.svg"], [30, "110-social-q30-age-pyramid.svg"], [40, "110-social-q40-wwi-casualties-chart.svg"], [49, "110-social-q49-school-size-chart.svg"], [50, "110-social-q50-parliament-seat-options.svg"], [52, "110-social-q52-egypt-location-map.svg"], [60, "110-social-q60-clouded-leopard-habitat-options.svg"]]) {
  const row = social110(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`110社會第${number}題: 必要圖像未使用題目專用裁切或未加入離線快取`);
}
for (const number of [2, 4, 6, 8, 9, 11, 12, 13, 14, 18, 19, 20, 22, 23, 24, 25, 27, 28, 31, 32, 33, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 51, 53, 54, 55, 56, 57, 58, 59, 61, 62, 63]) {
  const row = social110(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`110社會第${number}題: 文字完整題目仍依賴截圖`);
}
const socialCoordinates = social110(19);
if (!["23.45°N、121.50°E", "23.45°N、120.14°E", "23.47°N、121.36°E", "23.48°N、119.51°E"].every(coordinate => socialCoordinates?.question.includes(coordinate)) || socialCoordinates?.requiresImage || socialCoordinates?.questionImages?.length) errors.push("110社會第19題: 原卷座標表未轉錄完整或仍依賴掃描圖");
const expectedChinese110Answers = [3, 3, 3, 2, 2, 1, 1, 0, 0, 2, 1, 0, 1, 3, 0, 3, 2, 3];
for (let index = 0; index < expectedChinese110Answers.length; index += 1) {
  const number = index + 31;
  const row = chinese110(number);
  if (!row || row.answer !== expectedChinese110Answers[index] || row.options?.length !== 4 || !row.explanation || !row.solutionSteps?.length || !row.teacherTip) errors.push(`110國文第${number}題: 答案、四選項或解題說明缺漏`);
  if (row?.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`110國文第${number}題: 完整文字題不應附整頁試卷截圖`);
}
for (const [number, clues] of [[33, ["喝茶加檸檬", "馬克杯", "既濃又甜", "伯爵茶"]], [34, ["牛奶先加後加", "英國人"]], [35, ["質數", "餘數", "寫作"]], [36, ["孤絕", "自身價值"]], [37, ["20%", "30%", "南蘇丹", "2017"]], [38, ["2萬戶", "10萬人口", "每天"]], [39, ["花蓮", "□□過", "□入", "□出"]], [40, ["什麼都看不見", "防波堤", "風雨"]], [41, ["風球", "燭光", "蚊帳"]], [42, ["郭靖", "九十九招", "洪七公"]], [43, ["郭靖", "九十九招", "天下第一"]], [44, ["《茶經》", "揚子江", "虎丘井", "淮水"]], [45, ["大明水記", "山水", "井水"]], [46, ["柳開千軸", "張景一書", "駭眾取名"]], [47, ["悉出家書予之", "屬辭益有法度"]], [48, ["柳開：948–1001／973", "張景：970–1018／1000", "宋祁：998–1061／1024", "沈括：1031–1095／1063"]]]) {
  const row = chinese110(number);
  if (!row || clues.some(clue => !row.question.includes(clue))) errors.push(`110國文第${number}題: 原卷閱讀材料或作答線索不完整`);
}
const chinese110Passages = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48].map(chinese110);
if (chinese110Passages.some(row => /喝茶加糖是美式|謝明璇|既淡又甜|天地方突然|挾著頭雨|任海對堤防堤|鴨羣露水裡|火光在義然|只有撒外|倚椿一攔|多多又不占便宜|這支國際組織裡的營養不良情況|自縫車入/.test(row?.question || ""))) errors.push("110國文第33–48題: 原卷材料含已知 OCR 或轉錄錯誤");
for (const [first, second] of [[42, 43], [44, 45], [46, 47], [47, 48]]) {
  if (chinese110(first)?.question.split("\n\n")[0] !== chinese110(second)?.question.split("\n\n")[0]) errors.push(`110國文第${first}–${second}題: 共用閱讀材料不一致`);
}
const windCorridor = social110(34);
if (!windCorridor?.optionsInImage || windCorridor.options?.join("") !== "ABCD" || !windCorridor.questionImages?.includes("./assets/official-exams/110-social-q34-corridor-options.svg") || !windCorridor.questionImages?.includes("./assets/official-exams/110-social-q34-wind-rose.svg") || !serviceWorker.includes("110-social-q34-corridor-options.svg")) errors.push("110社會第34題: 風花圖或圖像選項缺失");
if (social110(38)?.options?.some(option => /[0-9]$/.test(option))) errors.push("110社會第38題: 選項含試卷頁碼 OCR 雜訊");
const parliamentOptions = social110(50);
if (!parliamentOptions?.optionsInImage || parliamentOptions.options?.join("") !== "ABCD" || !parliamentOptions.questionImages?.includes("./assets/official-exams/110-social-q50-parliament-seat-options.svg")) errors.push("110社會第50題: 圖像選項未正確顯示或題目缺少選項圖");
const sexRatioQuestion = social110(54);
if (!sexRatioQuestion?.question.includes("114、108、105") || sexRatioQuestion.requiresImage || sexRatioQuestion.questionImages?.length) errors.push("110社會第54題: 新生兒性別比數據缺失或仍依賴圖表截圖");
const leopardMapOptions = social110(60);
if (!leopardMapOptions?.optionsInImage || leopardMapOptions.options?.join("") !== "ABCD" || !leopardMapOptions.questionImages?.includes("./assets/official-exams/110-social-q60-clouded-leopard-habitat-options.svg")) errors.push("110社會第60題: 雲豹棲地圖選項未正確顯示");
const islandRoute = social110(1);
if (islandRoute?.optionsInImage || islandRoute?.options?.join("|") !== "①→②→④|②→⑦→⑨|③→⑤→⑧|④→⑥→⑩") errors.push("110社會第1題: 島嶼行程選項未轉成可讀文字");
for (const number of [43, 44, 46, 47, 48]) {
  const row = science114(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`114自然第${number}題: 無需圖片的題目仍依賴掃描頁`);
}
const expectedCounts = { 110: { 國文: 48, 英文: 41, 數學: 28, 社會: 63, 自然: 54 }, 111: { 國文: 42, 英文: 43, 數學: 27, 社會: 54, 自然: 50 }, 112: { 國文: 42, 英文: 43, 數學: 27, 社會: 54, 自然: 50 }, 113: { 國文: 42, 英文: 43, 數學: 27, 社會: 54, 自然: 50 }, 114: { 國文: 42, 英文: 43, 數學: 27, 社會: 54, 自然: 50 } };
for (const [year, subjects] of Object.entries(expectedCounts)) {
  for (const [subject, expected] of Object.entries(subjects)) {
    const rows = official.filter(question => String(question.source.year) === year && question.subject === subject);
    const choiceRows = rows.filter(question => question.type !== "非選擇題");
    const constructedRows = rows.filter(question => question.type === "非選擇題");
    const expectedChoiceCount = subject === "數學" ? (Number(year) === 110 ? 26 : 25) : expected;
    const choiceNumbers = choiceRows.map(question => question.source.questionNumber).sort((a, b) => a - b);
    const constructedNumbers = constructedRows.map(question => question.source.questionNumber).sort((a, b) => a - b);
    if (rows.length !== expected) errors.push(`${year}${subject}: ${rows.length}/${expected}`);
    if (choiceNumbers.length !== expectedChoiceCount || choiceNumbers.some((number, index) => number !== index + 1)) errors.push(`${year}${subject}: 選擇題題號不完整；目前 ${choiceNumbers.join(",")}`);
    if (subject === "數學" && (constructedRows.length !== 2 || constructedNumbers.some((number, index) => number !== index + 1) || constructedRows.some(question => question.source.section !== "非選擇題"))) errors.push(`${year}${subject}: 非選擇題應有獨立標示的第1、2題`);
    if (subject === "數學" && choiceRows.some(question => question.source.section !== "選擇題")) errors.push(`${year}${subject}: 選擇題缺少獨立題型標示`);
  }
}
for (const question of official) {
  const images = question.requiresImage ? (question.questionImages?.length ? question.questionImages : [question.questionImage].filter(Boolean)) : [];
  for (const image of images) {
    try {
      await access(join(root, image.replace(/^\.\//, "")));
    } catch {
      errors.push(`${question.id}: 找不到頁圖 ${image}`);
    }
  }
}
if (total !== 6108) errors.push(`總題數 ${total}，應為 6108`);
console.log(`official: ${official.length} 題；similar: ${similar.length} 題；總計 ${total} 題`);
if (errors.length) {
  console.error(errors.slice(0, 100).join("\n"));
  console.error(`共 ${errors.length} 個錯誤`);
  process.exit(1);
}
console.log(`驗證完成：${total} 題、${allIds.size} 個唯一 ID、五年題號與頁圖完整。`);
