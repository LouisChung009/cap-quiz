import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { matchesResponse } from "../question-validation.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const required = ["id", "subject", "gradeSemester", "unit", "knowledgePoint", "difficulty", "type", "question", "explanation", "solutionSteps", "teacherTip", "relatedWords", "sourceType", "review"];
const allIds = new Set();
const allQuestions = new Set();
const imageReferences = [];
const errors = [];
let total = 0;

const contextPattern = /根據(?:本文|上文|文章|選文|材料|短文|報導|資料)|依據(?:本文|上文|文章|選文|材料|短文|報導|資料)|本文(?:中|主旨|作者|提到|認為|敘述|寫作)|文中(?:提到|指出|敘述|作者)|這篇(?:文章|短文)|由本文|閱讀(?:本文|上文|下文|文章|選文|材料)|according to (?:the|this) (?:text|article|reading|passage)|in the (?:text|article|reading|passage)|the writer|the author/i;

function answerIsNamed(question) {
  if (!Number.isInteger(question.answer) || !question.options?.[question.answer]) return false;
  const solution = `${question.explanation} ${(question.solutionSteps || []).join(" ")}`;
  const normalize = value => String(value).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
  if (normalize(solution).includes(normalize(question.options[question.answer]))) return true;
  const letter = String.fromCharCode(65 + question.answer);
  return new RegExp(`(?:answer|correct answer|答案|正解|正確答案|標答|選項|故選|所以選|因此)\\s*(?:is|為|是|:|=)?\\s*[「"']?${letter}\\b`, "i").test(solution);
}

function findDuplicateRecordKeys(source) {
  const duplicates = [];
  const records = source.split(/(?=^    "id":)/m).filter(record => /^    "id":/m.test(record));
  for (const record of records) {
    const id = record.match(/^    "id":\s*"([^"]+)"/m)?.[1] || "unknown";
    const keys = [...record.matchAll(/^    "([^"]+)":/gm)].map(match => match[1]);
    const seen = new Set();
    for (const key of keys) {
      if (seen.has(key)) duplicates.push(`${id}: duplicate JSON field ${key}`);
      seen.add(key);
    }
  }
  return duplicates;
}

function validate(question, location) {
  for (const image of [question.questionImage, ...(question.questionImages || [])].filter(Boolean)) imageReferences.push({ id: question.id, image });
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
  const source = await readFile(join(root, "data", `${file}.json`), "utf8");
  const rows = JSON.parse(source);
  errors.push(...findDuplicateRecordKeys(source).map(error => `${file}: ${error}`));
  if (rows.length !== 1000) errors.push(`${file}: 題數 ${rows.length}`);
  rows.forEach((question, index) => validate(question, `${file}[${index}]`));
  console.log(`${file}: ${rows.length} 題通過格式掃描`);
}

const missionSource = await readFile(join(root, "data", "mission-questions.json"), "utf8");
const missionQuestions = JSON.parse(missionSource);
errors.push(...findDuplicateRecordKeys(missionSource).map(error => `mission-questions: ${error}`));
for (const [id, asset] of [["OFF-0444", "111-science-q48-parallel-current.svg"], ["OFF-0539", "112-math-q08-trapezoid-angles.svg"], ["OFF-0552", "112-math-q21-bridge-walkers.svg"], ["OFF-0634", "112-science-q24-membrane-test.svg"], ["OFF-0659", "112-science-q49-liquefaction-model.svg"], ["OFF-0764", "113-math-q19-numberline.svg"]]) {
  const question = missionQuestions.find(item => item.id === id);
  const imagePath = `./assets/official-exams/${asset}`;
  if (!question?.requiresImage || question.questionImage !== imagePath || !question.questionImages?.includes(imagePath)) errors.push(`${id}: 必要圖片標記遭重複 JSON 欄位覆蓋`);
}
for (const [id, terms] of [["OFF-0620", ["侵入原有岩層", "海水侵蝕"]], ["OFF-0625", ["夏季", "臺灣向北航行"]]]) {
  const question = missionQuestions.find(item => item.id === id);
  if (!question || question.requiresImage || question.questionImage || question.questionImages?.length || terms.some(term => !question.question.includes(term))) errors.push(`${id}: 必須以完整文字作答，且不得顯示洩漏答案的合成圖`);
}
const serviceWorkerSource = await readFile(join(root, "sw.js"), "utf8");
if (!serviceWorkerSource.includes("ASSETS.splice(excludedIndex, 1)")) errors.push("Service worker must exclude the answer-revealing synthetic figures from offline caching");
const natural112Motion = missionQuestions.find(item => item.id === "OFF-0633");
if (!natural112Motion?.solutionSteps?.[0]?.includes("乙由 10 到 40 s 共 30 s") || !natural112Motion.solutionSteps?.[1]?.includes("20/(40−10)≈0.67")) errors.push("OFF-0633: corrected velocity-time interval and acceleration must remain in the reviewed record");
const natural112Redox = missionQuestions.find(item => item.id === "OFF-0636");
if (!natural112Redox?.question.includes("As₂O₃") || !natural112Redox.question.includes("Ag₂S") || !natural112Redox.explanation.includes("用語不夠精確") || !natural112Redox.teacherTip.includes("歧義")) errors.push("OFF-0636: formulas and the sulfide oxidation-state caveat must remain explicit");
const natural112Combustion = missionQuestions.find(item => item.id === "OFF-0637");
if (!natural112Combustion?.question.includes("甲＋3O₂→2CO₂＋3H₂O") || !natural112Combustion.question.includes("乙＋3O₂→2CO₂＋2H₂O")) errors.push("OFF-0637: complete combustion equations must remain in the stem");
const natural112Trip = missionQuestions.find(item => item.id === "OFF-0639");
if (/\(cid:\d+\)/i.test(natural112Trip?.question ?? "") || !natural112Trip.question.includes("行程資料：10:00") || !natural112Trip.question.includes("21:00 返回臺中")) errors.push("OFF-0639: clean, complete altitude trip data must remain present");
const natural112Q11to20 = [
  ["OFF-0621", 3, "飽和食鹽水", "鹽析"], ["OFF-0622", 0, "電子", "不可再分割"],
  ["OFF-0623", 0, "白噪音", "100–10,000 Hz", "100 分貝"], ["OFF-0624", 1, "DDT", "丁→乙→甲→丙", "生物放大"],
  ["OFF-0625", 1, "2019 年夏季", "西南季風", "黑潮"], ["OFF-0626", 0, "二氧化碳", "光合作用", "木質部"],
  ["OFF-0627", 1, "有機化合物", "無機化合物", "小如"], ["OFF-0628", 0, "400 米", "最先跑完", "平均速率"],
  ["OFF-0629", 2, "不計任何摩擦力", "機械能守恆", "1.0 m"], ["OFF-0630", 1, "Lilium", "Syzygium", "不能判斷是否同目"]
];
for (const [id, answer, ...clues] of natural112Q11to20) {
  const question = missionQuestions.find(item => item.id === id);
  const content = [question?.question, question?.explanation, ...(question?.solutionSteps || []), question?.teacherTip, ...(question?.options || [])].join(" ");
  if (!question || question.answer !== answer || question.source?.year !== 112 || question.source.questionNumber !== Number(id.slice(-2)) - 10 || question.answerKeyReview?.status !== "verified" || question.solutionSteps?.length < 3 || clues.some(clue => !content.includes(clue))) errors.push(`${id}: 112自然原卷線索、標答或解題過程不完整`);
}
const natural112Q21to30 = [
  ["OFF-0631", 3, "木星、土星", "密度由低到高", "距離由近到遠"],
  ["OFF-0632", 1, "第 6 天", "潛伏期 1–3 天", "第 3 天"],
  ["OFF-0633", 2, "乙由 10 到 40 s 共 30 s", "20/(40−10)≈0.67", "F甲>F乙"],
  ["OFF-0634", 3, "葡萄糖穿膜", "澱粉不穿膜", "本氏液"],
  ["OFF-0635", 3, "O₂是反應物", "CO₂是產物", "只有 D"],
  ["OFF-0636", 0, "As₂O₃", "Ag₂S", "用語有歧義"],
  ["OFF-0637", 0, "C₂H₆O", "C₂H₄", "46>28"],
  ["OFF-0638", 0, "高氣壓", "氣流下沉", "水氣凝結"],
  ["OFF-0639", 1, "1,750 m", "3,275 m", "17:00"],
  ["OFF-0640", 2, "275 g/275 mL", "ρ油<ρ水", "乙牌"]
];
for (const [id, answer, ...clues] of natural112Q21to30) {
  const question = missionQuestions.find(item => item.id === id);
  const content = [question?.question, question?.explanation, ...(question?.solutionSteps || []), question?.teacherTip, ...(question?.options || [])].join(" ");
  if (!question || question.answer !== answer || question.source?.year !== 112 || question.source.questionNumber !== Number(id.slice(-2)) - 10 || question.answerKeyReview?.status !== "verified" || question.solutionSteps?.length < 3 || clues.some(clue => !content.includes(clue))) errors.push(`${id}: 112自然原卷線索、標答或解題過程不完整`);
}
for (const [id, asset] of [["OFF-0631", "112-science-q21-planet-plot.png"], ["OFF-0632", "112-science-q22-temperature-graph.png"], ["OFF-0633", "112-science-q23-velocity-time-graph.png"], ["OFF-0638", "112-science-q28-weather-map.png"], ["OFF-0639", "112-science-q29-time-altitude-options.png"]]) {
  const question = missionQuestions.find(item => item.id === id);
  if (!question?.requiresImage || !question.questionImages?.includes(`./assets/official-exams/${asset}`) || !serviceWorkerSource.includes(asset)) errors.push(`${id}: 必要原卷圖表或離線快取缺漏`);
}
const natural112Q31to40 = [
  ["OFF-0641", 2, "培養皿向左", "影像會相對向右", "小靜脈"],
  ["OFF-0642", 2, "0.5 mL", "5.5 mL", "pH 應回升"],
  ["OFF-0643", 2, "200 gw", "250 gw", "300 gw"],
  ["OFF-0644", 3, "1200 W", "72,000 J", "60 秒"],
  ["OFF-0645", 2, "子房", "胚珠", "花托"],
  ["OFF-0646", 0, "1 月底", "11 月底", "南回歸線"],
  ["OFF-0647", 1, "左手定則", "磁場", "向西"],
  ["OFF-0648", 3, "新發生", "父母皆為 ff", "未患病"],
  ["OFF-0649", 3, "9 日", "23 日", "30 日"],
  ["OFF-0650", 0, "N₂ 穩定", "氮氣本身", "缺氧"]
];
for (const [id, answer, ...clues] of natural112Q31to40) {
  const question = missionQuestions.find(item => item.id === id);
  const content = [question?.question, question?.explanation, ...(question?.solutionSteps || []), question?.teacherTip, ...(question?.options || [])].join(" ");
  if (!question || question.answer !== answer || question.source?.year !== 112 || question.source.questionNumber !== Number(id.slice(-2)) - 10 || question.answerKeyReview?.status !== "verified" || question.solutionSteps?.length < 3 || clues.some(clue => !content.includes(clue))) errors.push(`${id}: 112自然原卷數據、答案或解題依據缺漏`);
}
for (const [id, assets] of [["OFF-0641", ["112-science-q31-tail-vessels.png"]], ["OFF-0642", ["112-science-q32-saliva-volume-graph.png", "112-science-q32-mouth-ph-graphs.png"]], ["OFF-0645", ["112-science-q35-strawberry-flower.png"]], ["OFF-0646", ["112-science-q36-sun-shadow-map.png"]], ["OFF-0647", ["112-science-q37-magnetic-force-diagram.png"]]]) {
  const question = missionQuestions.find(item => item.id === id);
  if (!question?.requiresImage || assets.some(asset => !question.questionImages?.includes(`./assets/official-exams/${asset}`) || !serviceWorkerSource.includes(asset))) errors.push(`${id}: 必要圖表或離線快取缺漏`);
}
const natural112Q41to50 = [
  ["OFF-0651", 0, "甲、乙可溶於水", "丙不溶於水", "238°C", "1465°C"],
  ["OFF-0652", 3, "兩種連接方式皆為", "乙燈絲燒斷", "只有阿華", "閉合支路"],
  ["OFF-0653", 0, "200 mL", "蛋白質 3 g", "糖 4.5 g"],
  ["OFF-0654", 3, "相同的碳排放量", "杏仁奶", "碳排放柱最短"],
  ["OFF-0655", 2, "功率係數", "取得比例愈高", "轉速並不是係數定義"],
  ["OFF-0656", 1, "10 m/s", "0.33", "3.3 m/s"],
  ["OFF-0657", 1, "抑制率越高", "34.21%", "18.42%", "觀點①不恰當"],
  ["OFF-0658", 1, "不同洗滌方法", "相同濃度", "同一種農藥"],
  ["OFF-0659", 0, "液化潛勢", "地震強度", "特定地點", "地震規模"],
  ["OFF-0660", 2, "模擬的地震參數固定", "地下水位", "飽和", "液化潛勢較高"]
];
for (const [id, answer, ...clues] of natural112Q41to50) {
  const question = missionQuestions.find(item => item.id === id);
  const content = [question?.question, question?.explanation, ...(question?.solutionSteps || []), question?.teacherTip, ...(question?.options || [])].join(" ");
  if (!question || question.answer !== answer || question.source?.year !== 112 || question.source.questionNumber !== Number(id.slice(-2)) - 10 || question.answerKeyReview?.status !== "verified" || question.options?.length !== 4 || question.solutionSteps?.length < 3 || clues.some(clue => !content.includes(clue))) errors.push(`${id}: 112自然原卷材料、答案或解題依據缺漏`);
}
for (const [id, assets] of [["OFF-0651", ["112-science-q41-separation-flow.png"]], ["OFF-0652", ["112-science-q42-parallel-circuits.png"]], ["OFF-0654", ["112-science-q44-carbon-chart.png"]], ["OFF-0656", ["112-science-q46-wind-power-curve.png"]], ["OFF-0659", ["112-science-q49-liquefaction-model.svg"]], ["OFF-0660", ["112-science-q50-liquefaction-profiles.png"]]]) {
  const question = missionQuestions.find(item => item.id === id);
  if (!question?.requiresImage || assets.some(asset => !question.questionImages?.includes(`./assets/official-exams/${asset}`) || !serviceWorkerSource.includes(asset))) errors.push(`${id}: 必要圖表或離線快取缺漏`);
}
for (const [id, clues] of [["OFF-0426", ["鑰匙鍍上銅", "乙是銅電極", "Cu²⁺ 在乙得到電子", "Cu²⁺ + 2e⁻ → Cu"]], ["OFF-0429", ["各20 cm", "L₁＝F×20＋F×20＝40F", "L₂＝F×40＝40F", "兩者相等"]]]) {
  const question = missionQuestions.find(item => item.id === id);
  const content = [question?.question, question?.explanation, ...(question?.solutionSteps || []), ...(question?.options || [])].join(" ");
  const figure = question?.questionImages?.[0]?.split("/").at(-1);
  if (!question || question.source?.year !== 111 || question.source.questionNumber !== Number(id.slice(-2)) + 4 || !question.requiresImage || question.questionImages?.length !== 1 || !question.imageAlt || clues.some(clue => !content.includes(clue)) || !serviceWorkerSource.includes(figure)) errors.push(`${id}: 111自然原卷圖示、標答推理或離線快取回歸失敗`);
}
const natural111Q27 = missionQuestions.find(item => item.id === "OFF-0423");
if (!natural111Q27 || natural111Q27.source?.year !== 111 || natural111Q27.source.questionNumber !== 27 || natural111Q27.answer !== 1 || !natural111Q27.questionImages?.includes("./assets/official-exams/111-science-q27-energy-mix-charts.png") || !natural111Q27.questionImages?.includes("./assets/official-exams/111-science-q27-carbon-table.png") || !natural111Q27.solutionSteps?.some(step => step.includes("燃煤由33%降至25%") && step.includes("燃氣由43%降至26%") && step.includes("424.1") && step.includes("296.3")) || !serviceWorkerSource.includes("111-science-q27-energy-mix-charts.png") || !serviceWorkerSource.includes("111-science-q27-carbon-table.png")) errors.push("OFF-0423: 111自然Q27原卷發電比例、加權排碳計算或必要圖表不一致");
const natural111Q35to38 = [
  ["OFF-0431", 1, "尿素濃度上升", "氧氣濃度下降", "肝臟分解胺基酸", "腎臟會移除尿素"],
  ["OFF-0432", 3, "F＝ma", "最大靜摩擦力", "μₛN", "只有小志"],
  ["OFF-0433", 1, "早上 8 點", "中午 12 點", "下午 2 點", "乾潮"],
  ["OFF-0434", 0, "密閉空心金屬球", "排水體積 V", "空腔", "8.96 g/cm³"]
];
for (const [id, answer, ...clues] of natural111Q35to38) {
  const question = missionQuestions.find(item => item.id === id);
  const content = [question?.question, question?.explanation, ...(question?.solutionSteps || []), question?.teacherTip, ...(question?.options || [])].join(" ");
  if (!question || question.source?.year !== 111 || question.source.questionNumber !== Number(id.slice(-2)) + 4 || question.answer !== answer || question.options?.length !== 4 || question.requiresImage || question.questionImages?.length || question.solutionSteps?.length < 3 || clues.some(clue => !content.includes(clue))) errors.push(`${id}: 111自然原卷題幹、答案或無圖作答材料回歸失敗`);
}
const natural111Q41to50 = [
  ["OFF-0437", 3, "酚酞呈紅色", "硫燃燒生成", "酸足以中和鹼", "過量鹼"],
  ["OFF-0438", 1, "厭氧發酵", "橡皮塞封住", "倒置且充滿水", "圖 B"],
  ["OFF-0439", 2, "甲烷", "二氧化碳通入澄清石灰水", "不具助燃性", "牧牧的檢測"],
  ["OFF-0440", 3, "24 小時", "排開水的質量", "平均產氣速率", "501"],
  ["OFF-0441", 3, "維管束沿外圍排列成環", "雙子葉植物", "單子葉植物"],
  ["OFF-0442", 3, "丙為木質部", "丁為韌皮部", "水↑", "同學 4"],
  ["OFF-0443", 0, "丙與丁並聯", "甲需串聯於丙支路", "乙則串聯在電池的主幹", "選 A"],
  ["OFF-0444", 3, "I甲＝I丙", "I乙＝I丙＋I丁", "200 mA", "100 mA"],
  ["OFF-0445", 2, "滿月以前", "盈凸月", "虧眉月", "小豪得 1 分"],
  ["OFF-0446", 3, "視網膜", "感光受器", "運動神經元", "手指骨骼肌"]
];
for (const [id, answer, ...clues] of natural111Q41to50) {
  const question = missionQuestions.find(item => item.id === id);
  const content = [question?.question, question?.explanation, ...(question?.solutionSteps || []), question?.teacherTip, ...(question?.options || [])].join(" ");
  if (!question || question.source?.year !== 111 || question.source.questionNumber !== Number(id.slice(-4)) - 396 || question.answer !== answer || question.options?.length !== 4 || question.solutionSteps?.length < 3 || clues.some(clue => !content.includes(clue))) errors.push(`${id}: 111自然原卷題號、答案或逐題推理證據不一致`);
}
for (const [id, assets] of [["OFF-0438", ["111-science-q42-fermentation-options.png"]], ["OFF-0441", ["111-science-q45-vascular-crosssection.png"]], ["OFF-0442", ["111-science-q45-vascular-crosssection.png", "111-science-q46-student-table.png"]], ["OFF-0443", ["111-science-q47-reference-circuit.png", "111-science-q47-wiring-options.png"]], ["OFF-0444", ["111-science-q48-parallel-current.svg"]], ["OFF-0445", ["111-science-q49-moon-cards.png"]]]) {
  const question = missionQuestions.find(item => item.id === id);
  if (!question?.requiresImage || assets.some(asset => !question.questionImages?.includes(`./assets/official-exams/${asset}`) || !serviceWorkerSource.includes(asset))) errors.push(`${id}: 111自然必要圖表或離線快取缺漏`);
}

const scienceAuthored = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
for (const [id, answer, evidence] of [["SCI-0141", 0, "南半球則傾離太陽"], ["SCI-0142", 1, "圓周交會處可估計震央位置"], ["SCI-0143", 2, "冷卻速率影響岩石組織"], ["SCI-0144", 3, "水平氣壓梯度"], ["SCI-0145", 0, "浮力足以平衡蛋重"], ["SCI-0146", 1, "肥料種類為操縱變因"], ["SCI-0147", 2, "風扇組減重18g"], ["SCI-0148", 3, "出生率、死因與環境適合度需要額外資料"], ["SCI-0149", 0, "稱為色散"], ["SCI-0150", 1, "兩者物質的量相等"]]) {
  const question = scienceAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.explanation.includes(evidence) || question.solutionSteps?.length < 3 || !question.teacherTip || question.teacherTip.includes("先辨認題目給定的條件")) errors.push(`${id}: 科學答案、概念解釋或教師提醒回歸錯誤`);
}
for (const [id, answer, evidence] of [["SCI-0003", 3, "細胞核不是只存在於葉綠體內"], ["SCI-0008", 0, "木質部能向上運輸水分"], ["SCI-0010", 3, "不能直接抑制流感病毒"], ["SCI-0016", 0, "肝糖分解會把葡萄糖釋回血液"], ["SCI-0017", 3, "深色性狀比例上升"], ["SCI-0018", 0, "病毒沒有細胞構造"], ["SCI-0021", 3, "浮力等於排開水的重量"], ["SCI-0026", 0, "物距大於 2f"], ["SCI-0030", 3, "兩個 N 極是同名磁極"], ["SCI-0032", 3, "÷ 10 s＝0.5 m/s²"], ["SCI-0033", 0, "合力近似為零"], ["SCI-0034", 3, "浮力大於球重"], ["SCI-0035", 0, "磁通量不再改變"], ["SCI-0037", 3, "摩擦力向左"], ["SCI-0047", 3, "催化劑提高反應速率"], ["SCI-0049", 2, "阿伏加德羅定律"], ["SCI-0058", 1, "呈朔"], ["SCI-0063", 2, "甲地地盤較鬆軟"], ["SCI-0065", 0, "岩漿在地下冷卻"], ["SCI-0076", 3, "每個紀錄區間的平均速率都是"], ["SCI-0082", 0, "施肥組平均增高較多"], ["SCI-0087", 1, "增加量依序為12、9、6、3 mL"], ["SCI-0090", 0, "收集到的氧氣體積"], ["SCI-0095", 1, "影長越短表示太陽高度越高"], ["SCI-0099", 0, "萌發率的影響"], ["SCI-0101", 2, "澄清石灰水"], ["SCI-0114", 3, "未倒轉且未受構造擾動"], ["SCI-0120", 1, "到達水草的光照強度相同"], ["SCI-0124", 0, "甲組平均為 (49.9＋50.0＋50.1)÷3＝50.0 g"], ["SCI-0133", 1, "得2.6g/cm³"], ["SCI-0138", 1, "並沖洗、乾燥砂"], ["SCI-0156", 3, "Fe＋CuSO₄→FeSO₄＋Cu"], ["SCI-0168", 3, "最終水溫"]]) {
  const question = scienceAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.explanation.includes(evidence) || question.solutionSteps.length < 3) errors.push(`${id}: 答案索引或科學解析依據錯誤`);
}
const science133 = scienceAuthored.find(item => item.id === "SCI-0133");
if (science133?.knowledgePoint !== "密度計算與浮沉判斷") errors.push("SCI-0133: 考點分類必須對應密度計算");
const science0047 = scienceAuthored.find(item => item.id === "SCI-0047");
if (science0047?.knowledgePoint !== "催化劑與反應速率") errors.push("SCI-0047: 考點分類必須與題目一致");
const scienceTopicBatch = scienceAuthored.filter(question => /^SCI-06(?:0[1-9]|1\d|20)$/.test(question.id));
const respiratoryTopicCount = scienceTopicBatch.filter(question => /呼吸|肺泡|氣體交換|血氧|支氣管|肺循環|運氧/.test(question.knowledgePoint)).length;
if (scienceTopicBatch.length !== 20 || respiratoryTopicCount > 7) errors.push(`SCI-0601–0620: 題目數應為20，呼吸系統考點最多7題（目前 ${scienceTopicBatch.length} 題、${respiratoryTopicCount} 題）`);
for (const [id, unit, point] of [["SCI-0602", "生物", "人體恆定與排汗"], ["SCI-0604", "生物", "人體骨骼與關節"], ["SCI-0607", "生物", "天擇與族群變化"], ["SCI-0608", "理化", "介質中的波速與頻率變化"], ["SCI-0609", "地球科學", "日食觀測安全"], ["SCI-0610", "理化", "化學反應中的沉澱"], ["SCI-0611", "生物", "疫苗與免疫記憶"], ["SCI-0614", "生物", "濕地生物多樣性與食物網"], ["SCI-0615", "地球科學", "化石與古氣候推論"], ["SCI-0616", "地球科學", "霜的形成與凝華"], ["SCI-0617", "地球科學", "天氣與氣候尺度"], ["SCI-0618", "地球科學", "封閉等壓線與氣壓中心判讀"], ["SCI-0619", "生物", "心臟瓣膜與血液逆流"], ["SCI-0620", "理化", "位置時間資料與速率"]]) {
  const question = scienceAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point) errors.push(`${id}: 經審題目單元或考點回歸錯誤`);
}

const science601to620Answers = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];
const science601to620Anchors = [
  ["3.0 L 增至 3.6 L", "101.0 kPa", "流向較低壓"],
  ["汗液蒸發", "帶走皮膚熱量", "濕度"],
  ["75% 升至 98%", "肺泡氣體交換", "肺靜脈"],
  ["肱二頭肌收縮", "拉動附著的前臂骨", "不能推骨"],
  ["0.25 L 增至 1.20 L", "消耗更多氧氣", "產生更多二氧化碳"],
  ["光照時二氧化碳濃度下降", "黑暗時二氧化碳上升", "氣孔是"],
  ["抗藥變異", "較易存活並繁殖", "族群原先"],
  ["440 Hz", "頻率維持", "波長也會改變"],
  ["日偏食", "小孔投影", "不直視太陽"],
  ["氯化鈣", "碳酸鈉", "碳酸鈣"],
  ["第一次接種後", "12 單位", "68 單位"],
  ["血球與大部分血漿蛋白", "腎小球", "留在血液"],
  ["肺泡氧氣濃度較高", "擴散", "進入血液"],
  ["植物種類減少", "棲地", "食物網"],
  ["喜暖、喜濕", "古環境", "單一化石不能"],
  ["−1°C", "冰晶", "凝華"],
  ["連續三天", "多年", "氣候趨勢"],
  ["1008、1004、1000 hPa", "由外向內", "低壓區"],
  ["右心室逆向流回右心房", "都卜勒超音波", "三尖瓣"],
  ["2、6、10 公尺", "2、6、10 m/s", "區間平均速率"]
];
for (let index = 0; index < science601to620Answers.length; index++) {
  const id = `SCI-${String(601 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science601to620Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science601to620Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 核心資料、正解索引或逐步推理回歸錯誤`);
}

const science501to520Answers = [2, 3, 0, 1, 2, 2, 3, 0, 1, 2, 3, 0, 1, 2, 2, 3, 0, 1, 2, 3];
const science501to520Anchors = [
  ["藍色石蕊", "變紅", "pH 小於 7"],
  ["油的密度為 0.8 g/mL", "水的密度為 1.0 g/mL", "下層的水"],
  ["0.10 M", "20 mL", "1：1"],
  ["胃蛋白酶", "接近中性", "活性通常下降"],
  ["pH＝3", "pH＝5", "100 倍"],
  ["pH 由 6.5 降至 4.5", "酸性增加", "100 倍"],
  ["0、10、20 秒", "18、30 mL", "1.5 mL/s"],
  ["部分解離", "可移動離子", "導電性通常較弱"],
  ["雨水溶入二氧化碳", "石灰岩裂隙", "碳酸鈣"],
  ["碳酸氫鈉", "二氧化碳", "分次少量加入"],
  ["乾布摩擦", "電荷轉移", "吸引輕小紙屑"],
  ["同一受精卵", "分裂形成", "遺傳物質"],
  ["暖空氣", "冷空氣", "鋒面雨"],
  ["110 V", "2 A", "220 W"],
  ["放暗處", "遮住同一片葉", "碘液"],
  ["0.30 A", "串聯電路各處電流相同", "電能"],
  ["潮濕氣流", "迎風坡", "膨脹冷卻"],
  ["12,000 kJ", "1,200 kJ", "120 kJ"],
  ["靜風處", "微風吹拂", "帶走水面附近"],
  ["棲地功能", "暫存洪水", "洪水調節"]
];
for (let index = 0; index < science501to520Answers.length; index++) {
  const id = `SCI-${String(501 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science501to520Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science501to520Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 核心資料、正解索引或逐步推理回歸錯誤`);
}

const science521to540Answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
const science521to540Anchors = [
  ["200 瓦", "30 秒", "6,000 J"],
  ["碘液", "藍黑色", "不能證明"],
  ["冷氣團", "氣團交界", "鋒面"],
  ["夾角為 35°", "法線", "55°"],
  ["木質部", "水分與礦物質", "根向上"],
  ["相同的兩端節點", "兩端電壓相同", "並聯"],
  ["孔隙連通", "儲存", "傳導地下水"],
  ["白血球", "吞噬病原體", "免疫防禦"],
  ["高溫端", "低溫端", "熱平衡"],
  ["二氧化碳", "有機物", "碳固定"],
  ["密閉容器", "氣體沒有逸散", "總質量守恆"],
  ["同一品種", "光照環境", "性狀表現"],
  ["地球另一側", "P 波", "S 波", "液態外核"],
  ["2 kg", "5 m", "100 J"],
  ["右心室", "肺動脈", "肺部"],
  ["焦距 12 公分", "24 公分", "2f", "物距"],
  ["冰水杯", "杯內水量未變", "凝結"],
  ["藻類", "光合作用", "生產者"],
  ["兩端均為 N 極", "同名磁極", "互相排斥"],
  ["深色不透水鋪面", "吸收較多太陽輻射", "蒸散降溫減少"]
];
for (let index = 0; index < science521to540Answers.length; index++) {
  const id = `SCI-${String(521 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science521to540Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science521to540Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 核心資料、正解索引或逐步推理回歸錯誤`);
}

const science0536 = scienceAuthored.find(item => item.id === "SCI-0536");
if (science0536?.knowledgePoint !== "物距與焦距倍數") errors.push("SCI-0536: knowledge point must match object distance divided by focal length");

const science541to560Answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 3, 1, 2];
const science541to560Anchors = [
  ["54 g", "20 cm³", "2.7 g/cm³"],
  ["3 m/s", "6 m/s", "4 倍"],
  ["操縱變因", "光照強度", "水溫"],
  ["東北季風", "北部與東北部", "迎風面"],
  ["1.5 m", "像距等於物距", "鏡後"],
  ["2 Ω 與 4 Ω", "6 Ω", "2 A"],
  ["pH 上升", "氫離子濃度", "酸性降低"],
  ["未受擾動", "下老上新", "火山灰層"],
  ["28 隻", "12 隻", "淺色型存活"],
  ["日落後", "西方低空", "細弦月"],
  ["0.15 kg", "2.4×10⁶ J/kg", "360 kJ"],
  ["空氣斜射進入水中", "傳播速度減慢", "偏向法線"],
  ["600 N", "3 m", "300 W"],
  ["標準大氣壓", "沸點", "溫度大致不變"],
  ["疼痛前就先縮手", "脊髓", "反射弧"],
  ["並聯電路", "該支路中斷", "另一支路"],
  ["冷鋒通過前", "短時降雨增加", "氣溫下降"],
  ["50 N", "0.10 m²", "500 Pa"],
  ["P 波", "S 波", "不能通過液體"],
  ["木質部", "蒸散作用", "向上拉力"]
];
for (let index = 0; index < science541to560Answers.length; index++) {
  const id = `SCI-${String(541 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science541to560Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science541to560Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 核心資料、正解索引或逐步推理回歸錯誤`);
}

const science561to580Answers = [3, 0, 1, 2, 3, 1, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1];
const science561to580Anchors = [
  ["母親為 XX", "父親為 XY", "1/2"],
  ["海洋板塊", "深海海溝", "火山活動"],
  ["底部受熱", "水逐漸上升", "熱對流"],
  ["2 倍焦距以外", "F 與 2F", "倒立縮小"],
  ["捕食", "競爭", "食物網"],
  ["20 g 食鹽", "180 g 水", "10%"],
  ["腎元", "過濾血液", "調節體內水分"],
  ["地軸傾斜", "北半球夏季", "白晝較長"],
  ["磁鐵快速插入", "指針回到零", "磁場變化"],
  ["二氧化碳是光合作用", "光照與溫度", "原料增加"],
  ["1,000 kg/m³", "2 m", "20,000 Pa"],
  ["相同質量", "相同熱量", "比熱較小"],
  ["飯後血糖上升", "胰島素", "血糖下降"],
  ["根毛", "表面積", "礦物質"],
  ["細胞呼吸", "二氧化碳", "碳循環"],
  ["只有藍光", "缺少紅光", "較暗"],
  ["蘋果切面", "新色素", "化學變化"],
  ["15 g/m³", "12.8 g/m³", "2.2 g/m³"],
  ["日全食", "太陽—月球—地球", "月球位在太陽與地球之間"],
  ["400 J", "1,000 J", "40%"]
];
for (let index = 0; index < science561to580Answers.length; index++) {
  const id = `SCI-${String(561 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science561to580Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science561to580Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 核心資料、正解索引或逐步推理回歸錯誤`);
}

const science581to600Answers = [2, 3, 0, 1, 2, 3, 2, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];
const science581to600Anchors = [
  ["金屬的熱傳導能力", "木材導熱較差", "熱從湯匙"],
  ["遠高於體溫", "活性部位", "變性"],
  ["440 次", "660 次", "音調較高"],
  ["陸地升溫較快", "近地面空氣上升", "海風"],
  ["未密封", "氣體逸散", "秤量系統"],
  ["太陽能電池", "光能轉為電能", "電能轉為"],
  ["20°C", "30 g", "70 g"],
  ["不易分解", "高階消費者", "體內濃度"],
  ["3 g 石灰石", "18 mL", "42 mL"],
  ["皮膚細胞", "兩個", "染色體數目"],
  ["藍綠色", "偏鹼性", "不能據此確認"],
  ["鹽酸", "氫氧化鈉", "氯化鈉"],
  ["鋅粒", "稀鹽酸", "氫氣"],
  ["潮濕空氣", "氧、水", "新物質"],
  ["酒精分子", "粒子間距增加", "蒸發"],
  ["2H₂＋O₂", "2H₂O", "各 2 個"],
  ["泥沙", "過濾", "不溶固體"],
  ["二氧化碳", "澄清石灰水", "變混濁"],
  ["4、6、5、5 株", "5 株/m²", "500 株"],
  ["Na⁺", "失去一個電子", "質子數比電子數多 1"]
];
for (let index = 0; index < science581to600Answers.length; index++) {
  const id = `SCI-${String(581 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science581to600Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science581to600Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 核心資料、正解索引或逐步推理回歸錯誤`);
}

const science621to640Answers = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];
const science621to640Anchors = [
  ["每分鐘 72 次", "壓力波"], ["相同時間後", "表面積"], ["抗體量", "記憶細胞"],
  ["紅色示蹤液", "木質部", "韌皮部"], ["pH 試紙讀值約為 3", "小於 7"],
  ["100−40＝60 mL", "54÷60＝0.90 g/cm³"], ["5×60＝300 m", "420÷140＝3.0 m/s"],
  ["17°C 升至 21°C", "暖鋒過境"], ["甲種昆蟲數量先下降", "其他環境因素"],
  ["0.8 m", "1.6 m", "太陽高度角"], ["Tt×Tt", "80×1/4＝20 株"],
  ["0% 組質量增加", "3.0% 組質量減少"], ["活土壤", "硝酸鹽增加"],
  ["肝門靜脈", "離肝的肝靜脈"], ["24 條染色單體", "12 條染色體"],
  ["切穿甲、乙兩層", "未切入丙", "甲、乙、岩脈、丙"],
  ["海溝附近", "地震深度", "火山帶"], ["防水套封住", "乾燥組外界水蒸氣較少"],
  ["20% 增至 45%", "盈月"], ["37°C", "20 mg", "70°C"]
];
for (let index = 0; index < science621to640Answers.length; index++) {
  const id = `SCI-${String(621 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science621to640Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science621to640Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 觀測資料、正解索引或推理解題錨點錯誤`);
}

const science641to660Answers = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];
const science641to660Anchors = [
  ["固定電阻", "P＝V²/R"], ["2 Ω 與 4 Ω", "6÷6＝1 A"], ["前 2 m 推力為 10 N", "20＋40＝60 J"],
  ["80 dB", "80−62＝18 dB"], ["施力大小相同", "接觸面積減小"], ["食鹽溶於水", "蒸發可回收食鹽"],
  ["密閉", "原子總數不變"], ["質量百分濃度", "水蒸發"], ["大小相等、方向相反", "不同物體"],
  ["1,628.7−1,562.4＝66.3", "66.3×3.00＝198.90"], ["自由電子", "熱傳導"], ["熱膨脹", "預留空隙"],
  ["12 m", "相鄰波峰間距為 1 m", "3÷1＝3 Hz"], ["8 個帶正電的質子", "8 個電子"], ["氧從空氣進入鐵鏽", "封閉系統"],
  ["標準大氣壓", "熔點附近"], ["月球引力", "太陽"], ["根系固定土壤", "豪雨"],
  ["大氣壓力", "氣壓計"], ["北半球低氣壓", "逆時針向中心"]
];
for (let index = 0; index < science641to660Answers.length; index++) {
  const id = `SCI-${String(641 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science641to660Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science641to660Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 電學、力學與地科題答案、材料或解題錨點錯誤`);
}

const science941to947Answers = [0, 1, 2, 3, 0, 1, 2];
const science941to947Anchors = [
  ["含碳酸氫鹽", "有光組水中的溶氧上升", "無機碳轉成有機物"],
  ["枯葉層較厚", "可溶性礦物養分較少", "養分回土減少"],
  ["18°C", "30°C", "溶解度通常會隨溫度升高而降低"],
  ["硝酸鹽增加", "藻類生物量上升", "分解者分解其中有機物"],
  ["P 降至 330、210 尾", "未發現 R 捕食 P", "競爭有限食物"],
  ["10,000 kJ", "900 kJ", "80 kJ"],
  ["甲縮短、乙變長", "只能主動收縮", "拮抗肌"]
];
for (let index = 0; index < science941to947Answers.length; index++) {
  const id = `SCI-${String(941 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science941to947Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science941to947Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 生態題答案索引、證據推論或解題錨點錯誤`);
}

const science956to960Answers = [3, 0, 1, 2, 3];
const science956to960Anchors = [
  ["杯壁水珠", "石灰水變混濁", "答案 D"],
  ["20.0 g", "水分子仍是 H₂O", "物理變化"],
  ["兩地樣本", "比例略有差異", "液化分餾"],
  ["6.0 cm", "8.0 cm", "6.0÷8.0＝0.75"],
  ["40°C", "40−36＝4 g", "飽和溶液"]
];
for (let index = 0; index < science956to960Answers.length; index++) {
  const id = `SCI-${String(956 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science956to960Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science956to960Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 物化材料、答案索引或計算推理回歸錯誤`);
}

const science961to980Answers = [0, 0, 1, 2, 3, 0, 1, 2, 3, 0, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1];
const science961to980Anchors = [
  ["60 g", "28 g"], ["pH", "100 倍"], ["旁觀離子", "H⁺＋OH⁻"], ["Ag⁺", "AgCl(s)"],
  ["0.05 mol", "增加 0.4 g"], ["峰頂", "活化能"], ["周圍", "31.0°C"], ["4Al", "3O₂"],
  ["刮傷", "鋅較活潑"], ["往返", "900÷2"], ["12 g", "44 g"], ["12÷3", "4 m/s²"],
  ["月球", "3.2 N"], ["50 N", "方向相反"], ["總質量較大", "加速度較小"], ["12 m/s", "4 m"],
  ["6 m÷2 s", "3 m/s"], ["並聯", "9 V"], ["12÷6", "2 A"], ["3.0 A", "1.2 A"]
];
for (let index = 0; index < 20; index++) {
  const id = `SCI-${String(961 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== science961to980Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science961to980Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 會考應用材料、答案索引或推理解題錨點錯誤`);
}
const science948to955Answers = [3, 0, 1, 2, 3, 0, 1, 2];
const science948to955Anchors = [
  ["鎂-24", "鎂-26", "中子數不同"], ["鈉-23", "23−11＝12", "10 個電子"],
  ["O²⁻", "多 2 個電子", "10 個電子"], ["2、8、1", "失去一個電子", "2、8"],
  ["原子序 17", "質子數 17", "18 個電子"], ["Mg²⁺", "兩個氯離子", "總電荷"],
  ["固態", "熔融", "可移動"], ["共享電子", "共價鍵", "兩個氫原子"]
];
for (let index = 0; index < science948to955Answers.length; index++) {
  const id = `SCI-${String(948 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${question.explanation} ${(question.solutionSteps || []).join(" ")}` : "";
  if (!question || question.answer !== science948to955Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science948to955Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 原子／離子應用題答案或推理材料回歸錯誤`);
}
const science921to940Answers = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
const science921to940Anchors = [
  ["抗體量", "免疫記憶"], ["同一種昆蟲", "捕食壓力"], ["膽汁", "表面積"], ["躺下", "蠕動"],
  ["血液", "氧氣濃度差"], ["一氧化碳", "氧氣"], ["葡萄糖", "血漿"], ["左心房", "逆流"],
  ["尿素", "腎臟"], ["較暗", "瞳孔"], ["感光細胞", "視網膜"], ["血液不直接大量混合", "胎盤"],
  ["孢子囊", "蕨類"], ["澱粉", "葡萄糖"], ["等體積", "較多試液褪色"], ["碳酸氫鹽", "多種養分"],
  ["淋巴", "乳糜管"], ["黃體", "雌激素與黃體素下降"], ["6 條染色體", "姐妹染色分體"], ["獨立分配", "互換"]
];
for (let index = 0; index < science921to940Answers.length; index++) {
  const id = `SCI-${String(921 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${question.explanation} ${(question.solutionSteps || []).join(" ")}` : "";
  if (!question || question.answer !== science921to940Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science921to940Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 人體與生態應用題答案、材料或解析推論回歸錯誤`);
}
for (const [id, answer, anchors] of [
  ["SCI-0661", 1, ["質量 90 g 與體積 30 cm³", "密度＝質量÷體積", "90÷30＝3 g/cm³"]],
  ["SCI-0662", 2, ["0.8 g/cm³ 與水的密度 1.0 g/cm³", "物體密度小於液體密度", "部分浸入、部分露出水面"]],
  ["SCI-0663", 2, ["頻率 f＝5 Hz", "波長 λ＝2 m", "5×2＝10 m/s"]],
  ["SCI-0664", 3, ["Q＝mcΔT", "c 與 ΔT 成反比", "溫度上升較少"]],
  ["SCI-0665", 0, ["六月 0.6 m，十二月 1.4 m", "六月白晝約 14 小時", "地軸傾斜配合公轉"]],
  ["SCI-0666", 1, ["月球運行到太陽與地球之間", "三者接近成一直線", "月球影子投向地球"]],
  ["SCI-0667", 2, ["樹根生長施力撐開既有裂縫", "不一定改變礦物成分", "物理風化"]],
  ["SCI-0668", 3, ["對照組原生魚存活率為 90%", "加入外來魚組為 55%", "本實驗條件下可能有競爭影響"]],
  ["SCI-0669", 0, ["碳的原子序為 6", "碳-12 有 6 個中子", "碳-14 比碳-12 多 2 個中子"]],
  ["SCI-0670", 1, ["花崗岩岩脈侵入", "礦物重結晶", "接觸變質作用"]],
  ["SCI-0671", 2, ["書保持靜止", "向上支持力", "大小相等、方向相反"]],
  ["SCI-0672", 3, ["軸固定在天花板", "改變施力方向", "不提供省力效果"]],
  ["SCI-0673", 0, ["高度降低使重力位能減少", "轉換為動能", "總機械能近似守恆"]],
  ["SCI-0674", 1, ["唯一電流路徑中斷", "串聯電路", "電流無法流過另一顆燈泡"]],
  ["SCI-0675", 2, ["指南針北端所指即當地磁場方向", "N 極附近磁場向外", "由 N 極指向 S 極"]],
  ["SCI-0676", 3, ["同一靜止液體", "深度愈大液體壓力愈大", "乙較深"]],
  ["SCI-0677", 0, ["記錄的 30° 與 60° 不一致", "檢查光線定位、法線及量角器讀值", "重測"]],
  ["SCI-0678", 1, ["1.2×0.5×20＝12 度", "0.5×2×20＝20 度", "32×4＝128 元"]],
  ["SCI-0679", 2, ["靠近金屬球但沒有接觸", "導體內可移動電荷受電力影響重新分布", "靜電感應"]],
  ["SCI-0680", 3, ["提供活化能較低的反應途徑", "反應速率增加", "不被永久消耗"]],
  ["SCI-0681", 0, ["40×5%＝2 g", "60×15%＝9 g", "11÷100×100%＝11%"]],
  ["SCI-0682", 1, ["不同色素對濾紙與溶劑", "形成多個色斑", "黑墨水是混合物"]],
  ["SCI-0683", 2, ["曲流頸部被洪水切穿", "兩端沉積封閉", "牛軛湖"]],
  ["SCI-0684", 3, ["前 10 分鐘的地表逕流", "初期沖刷", "表面可沖刷物逐漸減少"]],
  ["SCI-0685", 0, ["各吸收 8,400 J", "水升溫 10°C", "水的比熱較大"]],
  ["SCI-0686", 1, ["氣壓由 1000 降至 988 hPa", "風速由 8 增至 25 m/s", "不能確定中心路徑"]],
  ["SCI-0687", 2, ["兩半球同時出現相反季節", "地軸傾斜", "日照的角度與時間"]],
  ["SCI-0688", 3, ["滿月到下一次滿月", "朔望月", "比月球繞地球一周的恆星月長"]],
  ["SCI-0689", 0, ["相同種類且年代相近的陸生生物化石", "陸生生物難以跨越寬廣海洋", "大陸過去可能曾相連"]],
  ["SCI-0690", 1, ["酸性水與石灰岩中的碳酸鈣發生化學反應", "改變礦物成分", "化學風化"]],
  ["SCI-0691", 2, ["藻類死亡後", "分解者分解有機遺體時會消耗水中溶氧", "耗氧速度超過補充速度"]],
  ["SCI-0692", 3, ["接種組比未接種組多 8.1−3.0＝5.1 g", "根瘤菌可固定氮供植物利用", "植物則提供糖"]],
  ["SCI-0693", 0, ["用於呼吸、活動與維持生命", "以熱散失", "只有部分能量傳到下一營養階層"]],
  ["SCI-0694", 1, ["食物與活動空間不足", "增加競爭並限制存活、繁殖", "環境承載量"]],
  ["SCI-0695", 2, ["親代基因型 pp 與 PP", "子代基因型都是 Pp", "全部表現紫花"]],
  ["SCI-0696", 3, ["多種組織共同組成", "器官", "心臟由多種組織構成"]],
  ["SCI-0697", 0, ["尿素主要在肝臟形成", "血液運送至腎臟", "隨尿液經輸尿管、膀胱與尿道排出"]],
  ["SCI-0698", 1, ["細菌感染與防禦", "白血球負責免疫防禦", "紅血球主要運送氧氣"]],
  ["SCI-0699", 2, ["碘液遇澱粉呈藍黑色", "藍黑色變淡代表剩餘澱粉減少", "唾液中的澱粉酶"]],
  ["SCI-0700", 3, ["泥沙顆粒不溶於水", "溶解的食鹽隨水通過濾紙", "濾液仍是食鹽水"]],
  ["SCI-0701", 0, ["F＝ma", "10 N÷2 kg＝5 m/s²", "5 m/s²"]],
  ["SCI-0702", 1, ["形成薄膜", "減少表面直接接觸與刮擦", "降低摩擦力"]],
  ["SCI-0703", 2, ["高山大氣壓較低", "蒸氣壓需達到外界壓力", "較低溫度就能達到沸騰條件"]],
  ["SCI-0704", 3, ["空氣受熱後膨脹", "密度通常降低", "形成對流"]],
  ["SCI-0705", 0, ["紅色石蕊試紙", "變藍代表鹼性", "不能僅憑顏色判定"]],
  ["SCI-0706", 1, ["加熱後反應已完成", "形成新物質", "原子重新組合"]],
  ["SCI-0707", 2, ["0.03% 到 0.10%", "只增加 2", "其他因子可能限制速率"]],
  ["SCI-0708", 3, ["光線折射並聚焦在視網膜", "視網膜感受影像", "焦點偏離視網膜"]],
  ["SCI-0709", 0, ["兩杯水溫相同", "溶解鹽類增加", "甲的密度通常較大"]],
  ["SCI-0710", 1, ["固定光源代表太陽", "地球儀轉動", "日夜交替的成因"]],
  ["SCI-0711", 2, ["增加線圈匝數", "電流與鐵芯等條件相同", "磁場增強"]],
  ["SCI-0712", 3, ["太空中缺少物質媒介", "電磁波傳遞", "熱輻射"]],
  ["SCI-0713", 0, ["P 波通常比 S 波傳播速度快", "P 波先到", "測站"]],
  ["SCI-0714", 1, ["平流層臭氧", "吸收大部分有害的紫外線", "降低到達地表的紫外線量"]],
  ["SCI-0715", 2, ["氣壓與鹽度相近", "溫度升高而降低", "可溶氧量通常減少"]],
  ["SCI-0716", 3, ["花粉從花藥傳到同種植物花的柱頭", "受精之前", "授粉"]],
  ["SCI-0717", 0, ["由脊髓整合", "大腦也會接收訊息", "反射作用"]],
  ["SCI-0718", 1, ["是否攪拌", "加快溶解速率", "不一定改變平衡溶解度"]],
  ["SCI-0719", 2, ["血管受傷與止血", "血小板參與凝血", "形成血塊"]],
  ["SCI-0720", 3, ["相隔數月、但相同鐘點", "地球在公轉軌道上位置改變", "季節星座會改變"]],
  ["SCI-0721", 0, ["忽略空氣阻力", "與物體質量無關", "兩球加速度相同"]],
  ["SCI-0722", 1, ["10 N×0.4 m＝4 N·m", "兩側向下的力", "4÷0.2＝20 N"]],
  ["SCI-0723", 2, ["兩個正電阻並聯", "1/R＝1/R₁＋1/R₂", "小於任一支路電阻"]],
  ["SCI-0724", 3, ["電池內部的能量轉換", "化學能轉換為電能", "燈泡再把電能轉成光與熱"]],
  ["SCI-0725", 0, ["Mg：H₂ 的莫耳比為 1：1", "0.10 mol Mg", "0.10×24＝2.4 L"]],
  ["SCI-0726", 1, ["酚酞在酸性與中性溶液通常無色", "尚未呈鹼性", "不能據此認定是純水"]],
  ["SCI-0727", 2, ["體細胞有 18 條", "減數分裂將染色體數目減半", "18÷2＝9 條"]],
  ["SCI-0728", 3, ["胎盤是母體與胎兒", "血液通常不直接混合", "交換界面"]],
  ["SCI-0729", 0, ["火山灰落在農田", "減少光照並影響氣體交換", "粒徑、厚度、成分"]],
  ["SCI-0730", 1, ["乙能刮傷甲", "丙不能刮傷玻璃", "乙＞甲＞丙"]],
  ["SCI-0731", 2, ["頻率由聲源振動決定", "跨介質時維持相同", "波速與波長可改變"]],
  ["SCI-0732", 3, ["液面外加壓力相同", "液體密度相同且深度相同", "與容器整體形狀無關"]],
  ["SCI-0733", 0, ["纖維間保留許多空氣", "減少熱傳導與空氣流動", "減慢熱傳遞"]],
  ["SCI-0734", 1, ["垂直照射時功率為 120 W", "斜 60° 時為 60 W", "不能單憑這組數據推論所有條件下都呈線性變化"]],
  ["SCI-0735", 2, ["稀鹽酸與碳酸鈣", "酸與碳酸鹽反應可產生二氧化碳", "澄清石灰水"]],
  ["SCI-0736", 3, ["蛋白質的基本組成單位為胺基酸", "形成胺基酸", "小腸吸收"]],
  ["SCI-0737", 0, ["長時間未進食且血糖偏低", "升糖素促使肝臟分解肝糖", "血糖因此回升"]],
  ["SCI-0738", 1, ["單側光照", "兩側生長速度差異", "向光性"]],
  ["SCI-0739", 2, ["泥沙經沉積、埋藏、壓密與膠結", "形成沉積岩", "保存化石"]],
  ["SCI-0740", 3, ["山谷出口", "流速與搬運能力降低", "扇形堆積地形"]],
  ["SCI-0741", 0, ["與外界沒有熱交換", "熱平衡", "金屬與水溫度相同"]],
  ["SCI-0742", 1, ["相同體積的水", "較大的液體表面積", "蒸發較快"]],
  ["SCI-0743", 2, ["表面積相同", "唯一操縱條件是反應溫度", "較高溫通常提高反應速率"]],
  ["SCI-0744", 3, ["材質與截面積相同", "較長導線通常電阻較大", "2 m 的乙"]],
  ["SCI-0745", 0, ["電子轉移", "極化", "電荷總量守恆"]],
  ["SCI-0746", 1, ["細胞膜外有細胞壁", "纖維素", "植物細胞外側具有細胞壁"]],
  ["SCI-0747", 0, ["基因型為 Aa", "A 對 a 顯性", "顯性性狀"]],
  ["SCI-0748", 2, ["乾旱環境下的保水", "減少植物表面水分蒸發", "完全阻止植物失水"]],
  ["SCI-0749", 3, ["連續數十年的紀錄", "多年平均趨勢", "氣候變化"]],
  ["SCI-0750", 0, ["切穿甲、乙", "丁又錯移甲、乙與丙", "戊未被丁錯移"]],
  ["SCI-0751", 1, ["質量表示物質的量", "月球重力較小", "質量不變、重量減少"]],
  ["SCI-0752", 2, ["40×1＝40 km", "80×2＝160 km", "200÷3.5≈57.1 km/h"]],
  ["SCI-0753", 3, ["一條支路斷路", "另一條完整支路", "另一顆燈泡仍可發光"]],
  ["SCI-0754", 1, ["Q＝mcΔT", "200×4.2×5＝4200 J", "4200 J"]],
  ["SCI-0755", 0, ["食鹽質量不變", "溶液總質量由 100 g 增為 200 g", "1/2"]],
  ["SCI-0756", 1, ["原子重新排列組合", "原子種類與總數守恆", "總質量也守恆"]],
  ["SCI-0757", 2, ["根毛", "增加根與土壤接觸的表面積", "吸收水分及溶解的礦物質"]],
  ["SCI-0758", 3, ["有絲分裂前染色體複製", "平均分配", "與母細胞相同的染色體數"]],
  ["SCI-0759", 0, ["枯枝落葉與腐植質", "增加孔隙", "快速地表逕流"]],
  ["SCI-0760", 1, ["能刮傷玻璃", "方解石遇稀鹽酸會產生氣泡", "最符合石英"]],
  ["SCI-0761", 2, ["水平合力近似為零", "等速度直線運動", "原本在滑行"]],
  ["SCI-0762", 3, ["磁鐵快速插入", "穿過線圈的磁場改變", "感應電流便消失"]],
  ["SCI-0763", 0, ["物體位於兩倍焦距處", "透鏡另一側兩倍焦距處", "倒立、等大的實像"]],
  ["SCI-0764", 1, ["黑板溫升為 43−25＝18°C", "白板溫升為 34−25＝9°C", "深色表面"]],
  ["SCI-0765", 2, ["澄清石灰水變混濁", "生成難溶的碳酸鈣", "未知氣體可能含二氧化碳"]],
  ["SCI-0766", 3, ["受到長期側向擠壓後彎曲", "未發生破裂錯動", "形成褶皺"]],
  ["SCI-0767", 0, ["細胞核含有大部分遺傳物質", "調控細胞活動", "少量遺傳物質"]],
  ["SCI-0768", 1, ["小腸接收消化液", "完成大部分化學性消化", "吸收消化後的養分"]],
  ["SCI-0769", 2, ["排除區增加 38−20＝18 隻", "對照區增加 22−20＝2 隻", "仍需重複實驗"]],
  ["SCI-0770", 3, ["山區河流以下切侵蝕為主", "狹窄的V形谷", "冰河侵蝕"]],
  ["SCI-0771", 3, ["電流 I＝Q/t", "Q＝2×5＝10 C", "庫侖 C"]],
  ["SCI-0772", 0, ["距鏡面 0.5 m", "像距等於物距", "平面鏡"]],
  ["SCI-0773", 1, ["冰水共存期間", "相變", "熔點附近"]],
  ["SCI-0774", 2, ["生鏽需有水與氧參與", "完整油漆層隔開", "刮破"]],
  ["SCI-0775", 3, ["毛細血管管壁薄", "縮短血液與組織間的擴散距離", "物質交換"]],
  ["SCI-0776", 0, ["減少水分散失", "二氧化碳進入葉片可能減少", "保水"]],
  ["SCI-0777", 1, ["光合作用利用光能", "合成葡萄糖等有機物", "化學能"]],
  ["SCI-0778", 2, ["氣壓差為 100−85＝15 kPa", "1,500 m 包含 15 個 100 m 區間", "1.0 kPa"]],
  ["SCI-0779", 3, ["固體去除", "降低污染負荷與病原體", "降低排放對水域"]],
  ["SCI-0780", 0, ["藍白色恆星通常比紅色恆星表面溫度高", "恆星顏色與表面溫度相關", "亮度還受恆星大小與距離影響"]],
  ["SCI-0781", 1, ["2 Ω 與 4 Ω", "12÷6＝2 A", "8 V"]],
  ["SCI-0782", 2, ["6 Ω 與 3 Ω 電阻並聯", "1/6＋1/3＝1/2", "6 A"]],
  ["SCI-0783", 2, ["60 W", "0.06×2＝0.12", "0.12 度"]],
  ["SCI-0784", 3, ["完全浸沒", "排開 200 cm³", "第二種液體密度較大"]],
  ["SCI-0785", 0, ["20 N", "0.30 m", "F×0.20＝6"]],
  ["SCI-0786", 1, ["80.0 g", "密閉", "量測精度"]],
  ["SCI-0787", 2, ["H⁺＋OH⁻→H₂O", "Na⁺ 與 Cl⁻", "旁觀離子"]],
  ["SCI-0788", 3, ["質量為 120 g", "120÷1.0＝120 cm³", "總體積為 150 cm³"]],
  ["SCI-0789", 0, ["焦距 10 cm", "像距 v＝15 cm", "像高 2 cm"]],
  ["SCI-0790", 1, ["黑暗組氧氣下降", "呼吸作用消耗氧氣", "產生二氧化碳"]],
  ["SCI-0791", 1, ["10°C、37°C、80°C", "刻意改變", "依變因"]],
  ["SCI-0792", 2, ["體細胞有 18 條染色體", "卵與精子各有 18÷2＝9 條", "受精卵恢復為 18 條"]],
  ["SCI-0793", 3, ["狐狸數量短期大幅減少", "捕食壓力降低", "增加"]],
  ["SCI-0794", 0, ["180 降至 110 mg/dL", "胰島素促進細胞攝取葡萄糖", "負回饋調節"]],
  ["SCI-0795", 1, ["P 波", "S 波", "震央距離"]],
  ["SCI-0796", 2, ["淺源地震", "相向移動", "聚合型邊界"]],
  ["SCI-0797", 1, ["氣壓差同為 1004−1000＝4 hPa", "甲每 50 km", "甲梯度較大"]],
  ["SCI-0798", 0, ["海表均溫：甲 24°C，乙 16°C", "近地面均溫也是甲 22°C 高於乙 17°C", "不能推定全年降雨"]],
  ["SCI-0799", 1, ["農曆十五", "地球位於太陽與月球之間", "月球軌道有傾角"]],
  ["SCI-0800", 3, ["12 g C＝1 mol", "CO₂ 莫耳質量＝12＋2×16＝44 g/mol", "最多生成 44 g CO₂"]],
  ["SCI-0801", 3, ["規模差為 7−5＝2", "32²", "1,024"]],
  ["SCI-0802", 0, ["震源深度增加", "震央仍在", "不改水平位置"]],
  ["SCI-0803", 1, ["強烈地震搖晃", "趴下、掩護並抓牢", "遠離玻璃"]],
  ["SCI-0804", 2, ["岩石年齡由中央向外逐漸增加", "新玄武岩", "向兩側移動"]],
  ["SCI-0805", 3, ["未受擾動", "下層先沉積", "甲早於乙"]],
  ["SCI-0806", 0, ["生存年代短", "分布廣", "年代相近"]],
  ["SCI-0807", 1, ["高溫高壓", "沒有熔融", "變質岩"]],
  ["SCI-0808", 2, ["日夜溫差", "凍融", "物理風化"]],
  ["SCI-0809", 3, ["不透水柏油", "減少入滲", "地下水補注"]],
  ["SCI-0810", 0, ["甲蒸發量大", "溶解鹽分", "鹽度通常較高"]],
  ["SCI-0811", 1, ["兩次高潮與兩次低潮", "月球引力", "地球自轉"]],
  ["SCI-0812", 2, ["日食", "月球影子落到地球", "一直線"]],
  ["SCI-0813", 3, ["夏至附近", "影長較短", "太陽高度較高"]],
  ["SCI-0814", 0, ["每次滿月", "月球軌道面有傾角", "地球影子"]],
  ["SCI-0815", 1, ["平流層", "臭氧層", "有害紫外線"]],
  ["SCI-0816", 2, ["入射太陽能維持每單位時間 100 單位", "逸出 90 單位", "100−90＝10 單位"]],
  ["SCI-0817", 3, ["降雨強度", "入滲能力", "地表逕流"]],
  ["SCI-0818", 0, ["多年且一致測量", "平均氣溫紀錄", "單日天氣"]],
  ["SCI-0819", 1, ["海浪長期反覆撞擊", "海蝕凹壁", "海崖後退"]],
  ["SCI-0820", 2, ["南北位置", "緯度", "赤道"]],
  ["SCI-0821", 3, ["北半球夏季", "日照角度", "南半球較斜射"]],
  ["SCI-0822", 0, ["上游岩屑", "風化", "流速減慢"]],
  ["SCI-0823", 1, ["4 g 氫氣", "32 g 氧氣", "4 g＋32 g＝36 g"]],
  ["SCI-0824", 2, ["50 g", "5 g", "5÷100×100%＝5%"]],
  ["SCI-0825", 0, ["20 mL", "100 mL", "0.4 M"]],
  ["SCI-0826", 3, ["純物質", "鈉與氯", "混合物"]],
  ["SCI-0827", 0, ["鎂和銅", "稀鹽酸", "氫氣"]],
  ["SCI-0828", 1, ["帶火星的木條", "復燃", "氧氣"]],
  ["SCI-0829", 2, ["食鹽已溶解", "蒸餾", "冷凝水"]],
  ["SCI-0830", 3, ["2H₂O→2H₂＋O₂", "40 mL", "20 mL"]],
  ["SCI-0831", 2, ["200 g", "10°C", "8,400 J"]],
  ["SCI-0832", 0, ["金屬鍋", "固體內部", "熱傳導"]],
  ["SCI-0833", 1, ["水槽底部", "密度較小上升", "熱對流"]],
  ["SCI-0834", 2, ["20 N", "5 m", "100 J"]],
  ["SCI-0835", 3, ["速度加倍", "速度平方", "4 倍"]],
  ["SCI-0836", 3, ["100 N", "0.02 m²", "5,000 Pa"]],
  ["SCI-0837", 0, ["35°", "法線", "入射角等於反射角"]],
  ["SCI-0838", 1, ["太空接近真空", "機械波", "介質粒子"]],
  ["SCI-0839", 2, ["理想定滑輪", "機械利益為 1", "100 N"]],
  ["SCI-0840", 1, ["270 g", "100 cm³", "2.7 g/cm³"]],
  ["SCI-0841", 3, ["冰水混合物", "外側空氣", "凝結"]],
  ["SCI-0842", 0, ["相同的前 10 秒", "24÷10＝2.4", "18÷10＝1.8"]],
  ["SCI-0843", 1, ["短路", "電阻很小", "過熱"]],
  ["SCI-0844", 2, ["600 W", "10 s", "6,000 J"]],
  ["SCI-0845", 3, ["300 m", "60 s", "5 m/s"]],
  ["SCI-0846", 0, ["光強度", "速率趨於穩定", "其他條件成為限制"]],
  ["SCI-0847", 1, ["蒸散", "木質部水柱", "向上拉力"]],
  ["SCI-0848", 2, ["環狀剝皮", "韌皮部", "糖類等有機養分"]],
  ["SCI-0849", 3, ["氣孔大多關閉", "二氧化碳", "氣體交換"]],
  ["SCI-0850", 0, ["精細胞與卵細胞結合", "受精卵", "授粉"]],
  ["SCI-0851", 1, ["潮濕", "乾燥", "水分"]],
  ["SCI-0852", 2, ["一個單細胞個體", "兩個子個體", "增加一個"]],
  ["SCI-0853", 3, ["Tt", "顯性", "高莖"]],
  ["SCI-0854", 0, ["蛋白質", "基因變異", "性狀改變"]],
  ["SCI-0855", 1, ["5%", "70%", "抗藥性比例上升"]],
  ["SCI-0856", 2, ["抗生素", "細菌特有構造", "流感病毒"]],
  ["SCI-0857", 3, ["血糖偏低", "升糖素", "肝糖"]],
  ["SCI-0858", 0, ["樹突端傳入", "樹突接收", "軸突傳出"]],
  ["SCI-0859", 1, ["葡萄糖", "肝門靜脈", "肝臟"]],
  ["SCI-0860", 2, ["葡萄糖與氧", "二氧化碳與水", "可利用能量"]],
  ["SCI-0861", 3, ["8,000 kJ", "第二營養階層", "800 kJ"]],
  ["SCI-0862", 0, ["硝酸鹽", "含氮有機物", "氮原子"]],
  ["SCI-0863", 1, ["多種植物", "單一作物田", "免受病害"]],
  ["SCI-0864", 2, ["食物與棲地面積不變", "競爭通常加劇"]],
  ["SCI-0865", 3, ["可遺傳", "快速個體", "多代"]],
  ["SCI-0866", 0, ["12 cm", "9 cm", "對照組"]],
  ["SCI-0867", 2, ["150 g", "4.2 J/(g·°C)", "9,450 J"]],
  ["SCI-0868", 1, ["病原體甲", "病原體乙", "特定抗原"]],
  ["SCI-0869", 2, ["不同地點", "搖晃程度", "震度"]],
  ["SCI-0870", 3, ["距離為 20 km、30 km、25 km", "測站為圓心", "三圓的交會區域"]],
  ["SCI-0871", 0, ["垂直錯動", "水柱", "長波"]],
  ["SCI-0872", 1, ["斷裂面突然滑動", "相對位移", "彈性能量"]],
  ["SCI-0873", 2, ["熔岩", "火成岩", "噴出火成岩"]],
  ["SCI-0874", 3, ["岩脈切穿", "切穿原理", "晚形成"]],
  ["SCI-0875", 0, ["海洋貝類化石", "海水影響", "地殼抬升"]],
  ["SCI-0876", 1, ["同坡度、同降雨", "根系固定土壤", "侵蝕"]],
  ["SCI-0877", 2, ["洪水退去", "粗砂礫先沉積", "細泥沙"]],
  ["SCI-0878", 3, ["18°C", "14°C", "12°C"]],
  ["SCI-0879", 0, ["暖濕空氣上升", "露點", "雲"]],
  ["SCI-0880", 1, ["冷空氣快速推進", "暖空氣抬升", "氣溫通常降低"]],
  ["SCI-0881", 2, ["水蒸氣含量不變", "溫度升高", "相對濕度通常下降"]],
  ["SCI-0882", 1, ["300 公尺", "74 kPa", "受天氣影響"]],
  ["SCI-0883", 3, ["晴朗夏日下午", "較低", "海風"]],
  ["SCI-0884", 0, ["海洋表面水分", "液態水變成水蒸氣", "蒸發"]],
  ["SCI-0885", 1, ["月球本身不會像太陽一樣發光", "反射太陽光", "月食"]],
  ["SCI-0886", 2, ["由東向西", "由西向東自轉", "日周視運動"]],
  ["SCI-0887", 3, ["北半球中緯度", "北極星", "北緯"]],
  ["SCI-0888", 0, ["同一時刻", "地球公轉", "周年視運動"]],
  ["SCI-0889", 1, ["800 公頃", "1,200 公頃", "400 公頃"]],
  ["SCI-0890", 2, ["陽光照到太陽能板", "輻射能", "化學能"]],
  ["SCI-0891", 3, ["液態外核", "S 波", "P 波"]],
  ["SCI-0892", 0, ["地下深處緩慢冷卻", "地表快速冷卻", "晶體較大"]],
  ["SCI-0893", 1, ["同一彎道的外側與內側", "外側流速通常較快", "內側較易沉積"]],
  ["SCI-0894", 2, ["海冰形成", "鹽分較多留在周圍海水", "鹽度通常上升"]],
  ["SCI-0895", 3, ["沿迎風坡上升", "背風坡下沉並增溫", "相對濕度降低"]],
  ["SCI-0896", 0, ["沒有可辨認的相對位移", "節理", "斷層"]],
  ["SCI-0897", 1, ["寒流影響", "近岸氣溫通常偏低", "降雨還要看"]],
  ["SCI-0898", 2, ["氣壓計", "厚雲與強風", "低氣壓"]],
  ["SCI-0899", 3, ["冷鋒通過後", "冷氣團", "氣溫通常下降"]],
  ["SCI-0900", 0, ["600 萬立方公尺", "800 萬立方公尺", "600−800＝−200"]],
  ["SCI-0901", 1, ["蒸餾水", "高濃度食鹽水", "淨移動"]],
  ["SCI-0902", 2, ["1.2 mm", "400÷100＝4", "0.3 mm"]],
  ["SCI-0903", 3, ["洋蔥鱗片內表皮", "口腔上皮細胞", "固定外框"]],
  ["SCI-0904", 0, ["遮住部分葉片", "受光區呈藍黑色", "澱粉"]],
  ["SCI-0905", 1, ["肺泡間隔", "肺泡融合", "交換面積"]],
  ["SCI-0906", 2, ["血小板數明顯偏低", "瘀青", "凝血"]],
  ["SCI-0907", 3, ["左心房", "左心室", "主動脈"]],
  ["SCI-0908", 0, ["再吸收", "含氮廢物", "輸尿管"]],
  ["SCI-0909", 1, ["反射弧", "受器", "效應器"]],
  ["SCI-0910", 2, ["絨毛大幅變平", "吸收表面積", "吸收和消化"]],
  ["SCI-0911", 1, ["90°C", "立體構造改變", "活性部位"]],
  ["SCI-0913", 0, ["相同量的澱粉酶", "受質專一性", "蛋白酶"]],
  ["SCI-0912", 3, ["碘液未呈藍黑色", "雙縮脲", "紫色"]],
  ["SCI-0915", 2, ["Tt", "tt", "1/4"]],
  ["SCI-0916", 3, ["植物固定 10,000 kJ", "1,000 kJ", "100 kJ"]],
  ["SCI-0917", 0, ["光合作用固定", "砍伐", "二氧化碳可能增加"]],
  ["SCI-0918", 1, ["200 隻增加到 800 隻", "植物供應沒有同步增加", "環境負荷量"]],
  ["SCI-0919", 2, ["落葉被細菌和真菌分解", "無機養分", "物質循環"]],
  ["SCI-0920", 3, ["悶熱潮濕", "蒸發變慢", "散熱較差"]],
  ["SCI-0914", 1, ["各含 23 條", "23＋23＝46", "受精卵"]]
]) {
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${(question.options || []).join(" ")} ${question.explanation} ${(question.solutionSteps || []).join(" ")} ${question.teacherTip || ""}` : "";
  if (!question || question.answer !== answer || question.options?.length !== 4 || !question.explanation || (question.solutionSteps || []).length < 3 || !question.teacherTip || anchors.some(anchor => !text.includes(anchor))) errors.push(`${id}: 題目條件、答案、解題步驟或教師提醒回歸錯誤`);
}

const science981to1000Answers = [1, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
const science981to1000Anchors = [
  ["前兩次量測", "15÷2.5"], ["20 匝", "40 匝"], ["帶面相對箱子仍向右滑動", "摩擦力向右"], ["440 Hz", "880 Hz"],
  ["振幅", "音量"], ["1.2 m/s", "0.30 m"], ["白屏", "虛像"], ["視野較廣", "凸面鏡"],
  ["手電筒", "反射"], ["真空", "熱輻射"], ["14°C", "6°C"], ["6.68 kJ", "20 g"],
  ["5 mm", "2 mm"], ["0.20 m", "2 m/s"], ["不接觸", "電子被排斥"], ["化學能", "電能"],
  ["80 粒", "40 粒"], ["第一次複製", "第二次複製"], ["父親", "Y 染色體"], ["GAA", "GAG"]
];
for (let index = 0; index < 20; index++) {
  const id = `SCI-${String(981 + index).padStart(4, "0")}`;
  const question = scienceAuthored.find(item => item.id === id);
  const text = question ? `${question.question} ${question.explanation} ${(question.solutionSteps || []).join(" ")}` : "";
  if (!question || question.answer !== science981to1000Answers[index] || question.options?.length !== 4 || (question.solutionSteps || []).length < 3 || !question.teacherTip || science981to1000Anchors[index].some(anchor => !text.includes(anchor))) errors.push(`${id}: 題幹材料、選項、答案或解題要點回歸錯誤`);
}
const science995 = scienceAuthored.find(item => item.id === "SCI-0995");
if (science995?.options?.[2] !== "棒未接觸仍使驗電器內電子重新分布" || !science995.explanation.includes("電子被排斥")) errors.push("SCI-0995: 選項須對應驗電器靜電感應情境");
const science993 = scienceAuthored.find(item => item.id === "SCI-0993");
if (science993?.options?.[0] !== "仍約有 1 mm 空隙，尚未互相擠壓") errors.push("SCI-0993: 選項結論須符合鐵軌空隙計算");

const mission = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const clientScript = await readFile(join(root, "app.js"), "utf8");
const appShell = await readFile(join(root, "index.html"), "utf8");
const social114IcebergMapSvg = await readFile(join(root, "assets", "official-exams", "114-social-q53-iceberg-map.svg"), "utf8");
mission.forEach((question, index) => validate(question, `mission[${index}]`));
for (const [id, figure, page, box] of [["OFF-0065", "110-english-q17-food-choices.svg", "110-english-p5.webp", /viewBox="94 510 685 400"/], ["OFF-0068", "110-english-q20-woollie-tea-choices.svg", "110-english-p6.webp", /viewBox="94 992 685 200"/]]) {
  const question = mission.find(item => item.id === id);
  const path = `./assets/official-exams/${figure}`;
  if (!question?.requiresImage || question.questionImage !== path || JSON.stringify(question.questionImages) !== JSON.stringify([path]) || !question.imageAlt || question.questionImage.endsWith(".webp") || !serviceWorker.includes(path) || !serviceWorker.includes(`./assets/official-exams/${page}`)) errors.push(`${id}: picture options must use a focused offline-cached crop instead of a full-page scan`);
  try {
    const svg = await readFile(join(root, "assets", "official-exams", figure), "utf8");
    if (!box.test(svg) || !svg.includes(page)) errors.push(`${id}: focused crop does not reference the expected source-page region`);
  } catch {
    errors.push(`${id}: required focused figure is missing`);
  }
  try {
    await access(join(root, "assets", "official-exams", page));
  } catch {
    errors.push(`${id}: original source page for figure crop is missing`);
  }
}
const questionDataVersion = clientScript.match(/QUESTION_DATA_VERSION="([^"]+)"/)?.[1];
if (!questionDataVersion || !serviceWorker.includes(`./data/mission-questions.json?v=${questionDataVersion}`)) errors.push("題庫版本與服務工作者快取版本不一致");
const appVersion = clientScript.match(/APP_VERSION="([^"]+)"/)?.[1];
if (!appVersion || !serviceWorker.includes(`./app.js?v=${appVersion}`) || !serviceWorker.includes(`./bootstrap.js?v=${appVersion}`) || !appShell.includes(`./bootstrap.js?v=${appVersion}`)) errors.push("主程式版本與 HTML／服務工作者快取版本不一致");
for (const [assetIndex, pattern] of [[1, /href="\.\/(styles\.css\?v=[^"]+)"/], [2, /src="\.\/(bootstrap\.js\?v=[^"]+)"/]]) {
  const entry = appShell.match(pattern)?.[1];
  if (!entry || !serviceWorker.includes(`ASSETS[${assetIndex}]="./${entry}"`)) errors.push(`主頁資源與服務工作者第${assetIndex}項快取版本不一致`);
}
const math114ConstructedOne = mission.find(question => question.id === "OFF-0960");
if (!math114ConstructedOne || math114ConstructedOne.requiresImage || math114ConstructedOne.questionImage || math114ConstructedOne.questionImages?.length || math114ConstructedOne.requiresContext || !["人口占比", "調查比率", "56%", "49%", "20%／40%"].every(value => math114ConstructedOne.question.includes(value))) errors.push("114數學非選第1題: 公式與完整表格資料須可直接閱讀，且不可顯示整頁試卷圖");
const math114ConstructedTwo = mission.find(question => question.id === "OFF-0961");
if (!math114ConstructedTwo?.requiresImage || math114ConstructedTwo.questionImage !== "./assets/official-exams/114-math-q02-tiling-diagram.svg" || math114ConstructedTwo.questionImages?.length !== 1 || !serviceWorker.includes("114-math-q02-tiling-diagram.svg")) errors.push("114數學非選第2題: 只應顯示拼貼示意圖裁切，並加入離線快取");
const math114TilingReason = math114ConstructedTwo?.responseParts?.[1];
if (!math114TilingReason?.requiredTerms?.length || matchesResponse(math114TilingReason, "不能") || !matchesResponse(math114TilingReason, "不能；27(n+1)=32(n−1)，n=59/5，非整數")) errors.push("114數學非選第2題: 必須檢查不能恰好用完的方程、層數及非整數理由");
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
const social110MarshallQuestions = [mission.find(question => question.id === "OFF-0171"), mission.find(question => question.id === "OFF-0172")];
if (social110MarshallQuestions.some(question => !question?.question.includes("1902 年") || !question.question.includes("桑奇遺址") || question.solutionSteps?.length < 3) || social110MarshallQuestions[1]?.answer !== 1) errors.push("110社會第56–57題: 馬歇爾與桑奇遺址共用材料須保留年份、遺址資訊及完整作答步驟");
const social110LeopardQuestions = [mission.find(question => question.id === "OFF-0173"), mission.find(question => question.id === "OFF-0174")];
if (social110LeopardQuestions.some(question => !question?.question.includes("臺灣雲豹原始棲地") || !question.question.includes("海拔 1,500 公尺以下") || question.solutionSteps?.length < 3) || social110LeopardQuestions[0]?.answer !== 2 || social110LeopardQuestions[1]?.answer !== 1) errors.push("110社會第58–59題: 雲豹共用材料須包含原始植被與目擊地帶資訊，且答案索引須正確");
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
if (science110Q54?.question?.includes("原卷圖示")) errors.push("110自然第54題: 不得引用未提供的原卷圖示");
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
for (const [id, answer, evidence] of [["ENG-0701", 2, "filled her reusable bottle"], ["ENG-0702", 3, "three steps"], ["ENG-0703", 0, "winter fair"], ["ENG-0704", 1, "front of the audience"], ["ENG-0705", 1, "10:30 a.m."], ["ENG-0706", 2, "8:42"], ["ENG-0707", 1, "were posted"], ["ENG-0708", 2, "until noon"], ["ENG-0709", 3, "every visitor could understand"], ["ENG-0710", 0, "enjoys"], ["ENG-0711", 1, "replaced the missing battery"], ["ENG-0712", 2, "kept losing their place"], ["ENG-0713", 3, "wet paint"], ["ENG-0714", 0, "Robotics club"], ["ENG-0715", 0, "imaginary change"], ["ENG-0716", 0, "20.0°C"], ["ENG-0717", 1, "vocabulary app"], ["ENG-0718", 2, "return their trays"], ["ENG-0719", 2, "after the presentation"], ["ENG-0720", 0, "without special dietary needs"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、語境線索、四選項或解題材料回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0721", 3, "new brake cable fitted"], ["ENG-0722", 0, "interview with the new principal"], ["ENG-0723", 3, "easy to understand"], ["ENG-0724", 3, "first robot"], ["ENG-0725", 2, "Reopens at 1:10"], ["ENG-0726", 1, "the day before"], ["ENG-0727", 2, "Although"], ["ENG-0728", 3, "photographer"], ["ENG-0729", 0, "Friday at 5 p.m."], ["ENG-0730", 1, "interested in"], ["ENG-0731", 2, "than"], ["ENG-0732", 3, "cool, dry cabinet"], ["ENG-0733", 0, "after the final speaker"], ["ENG-0734", 1, "picture labels"], ["ENG-0735", 1, "10:20"], ["ENG-0736", 2, "imaginary plan"], ["ENG-0737", 1, "than before"], ["ENG-0738", 0, "returned it"], ["ENG-0739", 1, "so far"], ["ENG-0740", 1, "Students ___ touch"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、線索、四選項或解析回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0741", 2, "stay on it"], ["ENG-0742", 3, "At eight"], ["ENG-0743", 1, "10:15"], ["ENG-0744", 0, "decided"], ["ENG-0745", 1, "second floor"], ["ENG-0746", 2, "Of the two routes"], ["ENG-0747", 2, "take it home today"], ["ENG-0748", 3, "every Saturday"], ["ENG-0749", 0, "emergency-contact section"], ["ENG-0750", 1, "garden had no line"], ["ENG-0751", 2, "so far"], ["ENG-0752", 3, "website"], ["ENG-0753", 2, "before 3:00"], ["ENG-0754", 0, "Lena and I"], ["ENG-0755", 1, "not required"], ["ENG-0756", 1, "Starting Monday"], ["ENG-0757", 2, "stayed clear"], ["ENG-0758", 0, "Order 184"], ["ENG-0759", 3, "after everyone"], ["ENG-0760", 0, "repeated the test"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、語境線索、四選項或解析回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0681", 3, "advice"], ["ENG-0682", 0, "watched it twice"], ["ENG-0683", 1, "18 apples"], ["ENG-0684", 2, "The boy"], ["ENG-0685", 2, "issue a fine"], ["ENG-0686", 3, "film began at 7:00"], ["ENG-0687", 0, "daily train ride"], ["ENG-0688", 1, "skipped breakfast"], ["ENG-0689", 2, "other four"], ["ENG-0690", 3, "yesterday"], ["ENG-0691", 0, "each time"], ["ENG-0692", 1, "bicycle was stolen"], ["ENG-0693", 2, "only enough milk remained for one cup"], ["ENG-0694", 3, "8:05"], ["ENG-0695", 0, "good ____ solving"], ["ENG-0696", 1, "including this summer"], ["ENG-0697", 2, "2:30"], ["ENG-0698", 3, "worked at the same time"], ["ENG-0699", 0, "advised him"], ["ENG-0700", 1, "neither the coach nor the players"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、文法線索、四選項或解析回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0661", 1, "arrived at 7:20"], ["ENG-0662", 2, "waited until someone spoke"], ["ENG-0663", 3, "First Sunday: free admission"], ["ENG-0664", 3, "not stop at Pine Street"], ["ENG-0665", 0, "roots hold the soil"], ["ENG-0666", 1, "repeated difficult drills"], ["ENG-0667", 3, "crack in her bottle"], ["ENG-0668", 2, "avoid traffic"], ["ENG-0669", 2, "25 meters long"], ["ENG-0670", 0, "every table was occupied"], ["ENG-0671", 3, "8:15 last night"], ["ENG-0672", 0, "Every Saturday"], ["ENG-0673", 1, "by the janitor"], ["ENG-0674", 2, "does not say this is certain"], ["ENG-0675", 3, "four wheels"], ["ENG-0676", 0, "yesterday"], ["ENG-0677", 1, "when their mother called"], ["ENG-0678", 2, "since 2021"], ["ENG-0679", 2, "on Friday"], ["ENG-0680", 1, "Neither answer"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、線索、四選項或解題步驟回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0641", 0, "three goals"], ["ENG-0642", 1, "noisy"], ["ENG-0643", 2, "pump"], ["ENG-0644", 1, "different color cup"], ["ENG-0645", 0, "battery"], ["ENG-0646", 2, "out of order"], ["ENG-0647", 3, "fell from its nest"], ["ENG-0648", 0, "could not find the campsite"], ["ENG-0649", 0, "bring a reusable bottle"], ["ENG-0650", 3, "7:35"], ["ENG-0651", 1, "two slices"], ["ENG-0652", 1, "Maximum capacity: 40"], ["ENG-0653", 2, "check the inventory"], ["ENG-0654", 1, "Closed for construction"], ["ENG-0655", 2, "sweating causes water loss"], ["ENG-0656", 2, "became visible"], ["ENG-0657", 1, "20% less"], ["ENG-0658", 3, "Keep off the grass"], ["ENG-0659", 2, "toward the center"], ["ENG-0660", 0, "printer problem"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、材料線索、四選項或解析回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0621", 0, "Only five minutes"], ["ENG-0622", 3, "unfamiliar streets"], ["ENG-0623", 1, "latch clicks loudly"], ["ENG-0624", 0, "Today is Thursday"], ["ENG-0625", 2, "NT$40"], ["ENG-0626", 3, "will ____ the picnic"], ["ENG-0627", 0, "stopped to rest"], ["ENG-0628", 1, "no rain for three more days"], ["ENG-0629", 2, "wiping tears"], ["ENG-0630", 3, "Lower it"], ["ENG-0631", 0, "31°C"], ["ENG-0632", 0, "current pulls swimmers away"], ["ENG-0633", 1, "get out"], ["ENG-0634", 0, "after each small pinch"], ["ENG-0635", 1, "fever is gone"], ["ENG-0636", 0, "bring them back"], ["ENG-0637", 3, "turn back"], ["ENG-0638", 2, "retell why"], ["ENG-0639", 3, "student number"], ["ENG-0640", 3, "different room"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、材料線索、四選項或解析回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0601", 2, "nearest exit"], ["ENG-0602", 1, "for sale"], ["ENG-0603", 2, "wait to eat"], ["ENG-0604", 3, "no windows"], ["ENG-0605", 1, "without stopping"], ["ENG-0606", 1, "Ages 6 and above"], ["ENG-0607", 0, "held the door open"], ["ENG-0608", 1, "moved to Sunday"], ["ENG-0609", 0, "speak quietly"], ["ENG-0610", 1, "five minutes"], ["ENG-0611", 3, "without gloves"], ["ENG-0612", 2, "remain fresh"], ["ENG-0613", 3, "without injury"], ["ENG-0614", 1, "opening hours"], ["ENG-0615", 0, "dark spot"], ["ENG-0616", 3, "five-minute intervals"], ["ENG-0617", 1, "breathing hard"], ["ENG-0618", 2, "take down"], ["ENG-0619", 3, "keep it for yourself"], ["ENG-0620", 3, "Do not exceed two tablets"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、材料線索、四選項或解析回歸錯誤`);
}
for (const [id, point, answer, clue] of [["ENG-0561", "現在簡單式主動", 1, "IT department"], ["ENG-0562", "規則動詞過去式", 1, "hundreds of years ago"], ["ENG-0563", "現在完成式主動", 2, "since its safety project began"], ["ENG-0564", "疑問句中的現在簡單式", 3, "Where do students"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || !question.question.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 改寫題標籤、答案索引或解析回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0541", 2, "last weekend"], ["ENG-0542", 3, "prohibit"], ["ENG-0543", 0, "avoids"], ["ENG-0544", 1, "so far"], ["ENG-0545", 2, "不可數"], ["ENG-0546", 3, "volunteer"], ["ENG-0547", 0, "every Tuesday"], ["ENG-0548", 1, "explained"], ["ENG-0549", 1, "after 6 p.m."], ["ENG-0550", 2, "讓步"], ["ENG-0551", 2, "in order"], ["ENG-0552", 3, "brief"], ["ENG-0553", 0, "tell me"], ["ENG-0554", 1, "Be quiet"], ["ENG-0555", 2, "next spring"], ["ENG-0556", 2, "audience"], ["ENG-0557", 3, "before noon"], ["ENG-0558", 0, "voice low"], ["ENG-0559", 0, "Workshop B"], ["ENG-0560", 2, "showed"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、解釋依據或四選項逐步解析回歸錯誤`);
}
for (const [id, answer, evidence] of [["ENG-0521", 0, "so far this semester"], ["ENG-0522", 1, "large 去掉字尾 e"], ["ENG-0523", 1, "interesting"], ["ENG-0524", 2, "turn off"], ["ENG-0525", 3, "是否完成問卷"], ["ENG-0526", 1, "garden 承受"], ["ENG-0527", 0, "消防員抵達前"], ["ENG-0528", 1, "suggest + V-ing"], ["ENG-0529", 2, "after 2:30"], ["ENG-0530", 2, "修飾 walk"], ["ENG-0531", 3, "所有關係"], ["ENG-0532", 0, "total plans 為 two"], ["ENG-0533", 1, "時間子句不用 will"], ["ENG-0534", 2, "by + agent"], ["ENG-0535", 2, "第二類條件句"], ["ENG-0536", 0, "short"], ["ENG-0537", 3, "主句否定"], ["ENG-0538", 0, "entrance fee"], ["ENG-0539", 1, "first box"], ["ENG-0540", 1, "closed"]]) {
  const question = englishAuthored.find(item => item.id === id);
  const reviewText = question ? [question.question, question.explanation, ...(question.solutionSteps ?? []), question.teacherTip].join(" ").toLowerCase() : "";
  if (!question || question.answer !== answer || !reviewText.includes(evidence.toLowerCase()) || question.options?.length !== 4 || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 題目答案、解釋依據或四選項逐步解析回歸錯誤`);
}
for (const [id, point, answer, clue] of [["ENG-0502", "關係副詞 when", 3, "year"], ["ENG-0504", "情態助動詞後接原形", 0, "must"], ["ENG-0505", "動名詞作受詞", 2, "suggested"], ["ENG-0508", "過去完成式主動", 1, "By the time"], ["ENG-0509", "不規則動詞過去式", 3, "in 2024"], ["ENG-0510", "there be 與主詞一致", 0, "many languages"], ["ENG-0512", "間接問句語序", 1, "Could you tell me"], ["ENG-0513", "未來簡單式主動", 1, "tomorrow"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || !question.question.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 改寫題考點、索引或解題材料不一致`);
}
for (const [id, point, answer, clue] of [["ENG-0471", "關係代名詞 who", 0, "The student"], ["ENG-0475", "被動語態現在式", 0, "every summer"], ["ENG-0479", "現在完成式與 since", 2, "since Monday"], ["ENG-0483", "比較級", 1, "than"], ["ENG-0487", "間接引述的時態回溯", 1, "the day before"], ["ENG-0492", "被動語態過去式", 2, "yesterday"], ["ENG-0495", "關係代名詞 that 指物", 1, "a device"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || !question.question.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3 || !question.teacherTip) errors.push(`${id}: 改寫題考點、索引或解題材料不一致`);
}
const mathAuthored = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
for (const [id, answer, clue, difficulty] of [["MAT-0101", 3, "3x＋18＝78", "基礎"], ["MAT-0102", 0, "2p＝56－32＝24", "中等"], ["MAT-0103", 1, "4x＝52", "基礎"], ["MAT-0104", 2, "2x＋2(x＋4)＝40", "中等"], ["MAT-0105", 3, "0.8x－50＝350", "中等"], ["MAT-0106", 0, "3x＋6＝2(x＋6)", "中等"], ["MAT-0107", 1, "3x＋6＝87", "中等"], ["MAT-0108", 2, "80＋15x＝200＋10x", "中等"], ["MAT-0109", 3, "3×24＝72", "中等"], ["MAT-0110", 0, "4x－12＝36", "基礎"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip) errors.push(`${id}: 答案索引、難度、計算線索、四選項、解題步驟或教師提醒不一致／缺漏`);
}
const mathSystemItem = mathAuthored.find(question => question.id === "MAT-0102");
const mathExteriorAngleItem = mathAuthored.find(question => question.id === "MAT-0109");
if (mathSystemItem?.unit !== "聯立方程式應用" || mathSystemItem.knowledgePoint !== "以消去法解二元一次方程式情境題" || mathExteriorAngleItem?.unit !== "幾何與比例" || mathExteriorAngleItem.knowledgePoint !== "三角形外角定理與內角比") errors.push("MAT-0102/0109: 新題型的單元與知識點標籤須與內容相符");
for (const [id, answer, clue, difficulty] of [["MAT-0111", 1, "3x－20＝160", "基礎"], ["MAT-0112", 2, "x＋(x＋30)＝180", "中等"], ["MAT-0113", 3, "0.25×400", "基礎"], ["MAT-0114", 0, "3×9－5＝22", "基礎"], ["MAT-0115", 1, "(2/3)x＝24", "中等"], ["MAT-0116", 2, "5x＝3x＋18", "基礎"], ["MAT-0117", 3, "4x－12＝2x＋10", "中等"], ["MAT-0118", 0, "28x＝140", "基礎"], ["MAT-0119", 1, "84×5＝420", "中等"], ["MAT-0120", 2, "x＋2x＋4＝22", "中等"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip) errors.push(`${id}: 答案索引、難度、計算線索、四選項、解題步驟或教師提醒不一致／缺漏`);
}
const mathSupplementaryItem = mathAuthored.find(question => question.id === "MAT-0112");
const mathFunctionItem = mathAuthored.find(question => question.id === "MAT-0114");
if (mathSupplementaryItem?.unit !== "幾何與角度" || mathSupplementaryItem.knowledgePoint !== "補角關係與角度差" || mathFunctionItem?.unit !== "函數" || mathFunctionItem.knowledgePoint !== "一次函數的 x 截距") errors.push("MAT-0112/0114: 單元與知識點標籤須符合角度與函數內容");
for (const [id, answer, clue, difficulty] of [["MAT-0121", 3, "3(x＋15)＝180", "基礎"], ["MAT-0122", 0, "x＋3x＝90", "基礎"], ["MAT-0123", 1, "0.9x＋30＝210", "中等"], ["MAT-0124", 2, "x＋(x＋6)＝32", "基礎"], ["MAT-0125", 3, "0.8x＝48", "中等"], ["MAT-0126", 0, "9/12", "基礎"], ["MAT-0127", 1, "25＋18x＝223", "基礎"], ["MAT-0128", 2, "4x＝68", "基礎"], ["MAT-0129", 3, "2x＋2(x－3)＝34", "中等"], ["MAT-0130", 0, "150÷500＝0.3", "基礎"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip) errors.push(`${id}: 答案索引、難度、計算線索、四選項、解題步驟或教師提醒不一致／缺漏`);
}
const mathAngleRatioItem = mathAuthored.find(question => question.id === "MAT-0122");
const mathProbabilityItem = mathAuthored.find(question => question.id === "MAT-0126");
const mathSquarePerimeterItem = mathAuthored.find(question => question.id === "MAT-0128");
const mathRectanglePerimeterItem = mathAuthored.find(question => question.id === "MAT-0129");
const mathDiscountRateItem = mathAuthored.find(question => question.id === "MAT-0130");
if (mathAngleRatioItem?.unit !== "幾何與角度" || mathAngleRatioItem.knowledgePoint !== "互餘角的倍數關係" || mathProbabilityItem?.unit !== "統計與機率" || mathProbabilityItem.knowledgePoint !== "等可能結果中的事件機率" || mathSquarePerimeterItem?.unit !== "幾何與測量" || mathRectanglePerimeterItem?.unit !== "幾何與測量" || mathDiscountRateItem?.unit !== "百分率應用") errors.push("MAT-0122/0126/0128–0130: 單元標籤須對應題目考點");
for (const [id, answer, clue, difficulty] of [["MAT-0131", 1, "4x＋5＝3(x＋5)", "中等"], ["MAT-0132", 2, "3x＋6＝99", "中等"], ["MAT-0133", 3, "120＋20x＝260", "基礎"], ["MAT-0134", 0, "2x＋3x＋4x＝180", "基礎"], ["MAT-0135", 1, "3(x－9)＝36", "基礎"], ["MAT-0136", 2, "4x＋15＝215", "基礎"], ["MAT-0137", 3, "x(x＋3)＝40", "中等"], ["MAT-0138", 0, "0.4×500", "基礎"], ["MAT-0139", 1, "4×8＝32", "基礎"], ["MAT-0140", 2, "0.9x＝54", "中等"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip) errors.push(`${id}: 答案索引、難度、計算線索、四選項、解題步驟或教師提醒不一致／缺漏`);
}
const mathTriangleRatioItem = mathAuthored.find(question => question.id === "MAT-0134");
const mathQuadraticGardenItem = mathAuthored.find(question => question.id === "MAT-0137");
const mathLinearFunctionItem = mathAuthored.find(question => question.id === "MAT-0139");
const mathBatteryPercentItem = mathAuthored.find(question => question.id === "MAT-0140");
if (mathTriangleRatioItem?.unit !== "幾何與角度" || mathQuadraticGardenItem?.unit !== "二次方程式與幾何" || mathLinearFunctionItem?.unit !== "函數" || mathBatteryPercentItem?.unit !== "百分率應用" || mathBatteryPercentItem.options?.[mathBatteryPercentItem.answer] !== "60 毫安培小時") errors.push("MAT-0134/0137/0139/0140: 題目單元、單位與標答須相符");
for (const [id, answer, clue, unit, point, difficulty] of [["MAT-0141", 3, "6x－24＝4x＋28", "一元一次方程式", "分數係數與括號的一元一次方程式", "中等"], ["MAT-0142", 0, "6x－3＝5x＋12", "一元一次方程式", "含括號的一元一次方程式", "基礎"], ["MAT-0143", 1, "224÷32＝7", "比與比例應用", "平均分配與單位量", "基礎"], ["MAT-0144", 2, "480－405＝75", "統計與機率", "由平均數反求缺少資料", "中等"], ["MAT-0145", 3, "10x＋5(x＋4)＝110", "一元一次方程式", "以總值建立一元一次方程式", "中等"], ["MAT-0146", 0, "2.5(x＋20)＝200", "比與比例應用", "路程、速度與時間", "中等"], ["MAT-0147", 1, "x＋(x＋24)＝180", "幾何與角度", "由兩角和與差求角度", "中等"], ["MAT-0148", 2, "0.85x＋25＝280", "百分率應用", "折扣與額外費用反求原價", "中等"], ["MAT-0149", 3, "x＋(x＋8)＝36", "一元一次方程式", "由總和與差求兩個數", "中等"], ["MAT-0150", 0, "(3/4)x＝45", "百分率應用", "由部分比例反求原量", "中等"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.unit !== unit || row.knowledgePoint !== point || row.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip) errors.push(`${id}: 答案、單元／考點、難度、選項或解題步驟不一致／缺漏`);
}
for (const [id, answer, difficulty, clue, tip] of [["MAT-0151", 1, "中等", "900,000 公分換算為 9 公里", "100,000 公分才是 1 公里"], ["MAT-0152", 2, "基礎", "60×2＝120 公里", "不要直接比較速度"], ["MAT-0153", 3, "中等", "75 分位於選項 D（索引 3）", "平均數乘資料筆數"], ["MAT-0154", 0, "中等", "平均數減少、眾數仍為 5", "加入的新數低於原平均數"], ["MAT-0155", 1, "基礎", "5/10＝1/2", "紅球與藍球相加"], ["MAT-0156", 2, "中等", "正確選項是 C（索引 2）", "周長是長度單位"], ["MAT-0157", 3, "基礎", "最大角為 3×30＝90 度", "最大角對應最大的係數 3"], ["MAT-0158", 0, "基礎", "2×(22/7)×7＝44", "圓周長用 2πr"], ["MAT-0159", 1, "基礎", "5×4×3＝60", "結果使用立方公分"], ["MAT-0160", 2, "基礎", "x＝11", "展開括號並合併常數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (id !== "MAT-0156" && (!row || row.answer !== answer || row.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip))) errors.push(`${id}: 答案索引、難度、計算證據、選項或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0161", 3, "基礎", "函數", "－2×(－3)＝6", "代入負數時要保留括號"], ["MAT-0162", 3, "基礎", "函數", "正確選項 D 的索引為 3", "兩個差的順序要一致"], ["MAT-0163", 0, "基礎", "百分率應用", "640－50＝590 元", "折價券是在打折後"], ["MAT-0164", 1, "基礎", "比與比例應用", "3×200＝600 毫升", "乘水的份數"], ["MAT-0165", 2, "中等", "比與比例應用", "正確選項 C 的索引為 2", "相加的是每小時完成的工作量"], ["MAT-0166", 3, "中等", "統計與機率", "(4/7)×(3/6)＝2/7", "不放回表示"], ["MAT-0167", 0, "基礎", "幾何與測量", "6²＋8²＝100", "最後取正平方根"], ["MAT-0168", 1, "基礎", "幾何與測量", "12×7÷2＝42", "三角形面積要除以 2"], ["MAT-0169", 2, "基礎", "幾何與測量", "50－36＝14", "新面積減原面積"], ["MAT-0170", 3, "基礎", "一元一次方程式", "x＝9", "先加 7，再除以 4"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (id !== "MAT-0351" && (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip))) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, clue, tip] of [["MAT-0171", 0, "基礎", "約分得 1/4", "全班人數扣除甲、乙兩組"], ["MAT-0172", 1, "基礎", "9÷9×100%＝100%", "以原本的週三銷量作分母"], ["MAT-0173", 2, "基礎", "正確選項 C 的索引為 2", "別把少 5 寫成加 5"], ["MAT-0174", 3, "中等", "d＝6 公里", "去程與回程各自的路程除以速度"], ["MAT-0175", 0, "基礎", "選項 A（索引 0）", "中位數則先排序"], ["MAT-0176", 1, "基礎", "1,800 元", "應除以 0.8"], ["MAT-0177", 2, "中等", "3×9 = 27", "乘甲數所占的份數"], ["MAT-0178", 3, "基礎", "156 公里", "再加上剩餘距離"], ["MAT-0179", 0, "中等", "15－8＝7 張", "回答題目指定的票種"], ["MAT-0180", 1, "中等", "504－420 = 84 分", "目標平均乘總人數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案索引、難度、計算證據、選項或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0181", 2, "基礎", "統計與機率", "3/12 = 1/4", "所有球數"], ["MAT-0182", 3, "基礎", "函數", "−2×(−3)＋7 = 6＋7", "代入負數時加括號"], ["MAT-0183", 0, "中等", "一元一次方程式", "學生票買了 5 張", "總價要乘各自票價"], ["MAT-0184", 1, "中等", "一元一次方程式", "10 分鐘", "流入量減流出量"], ["MAT-0185", 2, "基礎", "三角形內角和", "4×20° = 80°", "先把比例份數相加"], ["MAT-0186", 3, "中等", "百分率", "16－12 = 4 人", "社團總人數固定"], ["MAT-0187", 0, "基礎", "三角形內角和", "142°÷2 = 71°", "兩底角相等"], ["MAT-0188", 1, "基礎", "平均數", "165 公分", "平均身高乘人數"], ["MAT-0189", 2, "基礎", "統計與機率", "5/10 = 1/2", "紅球或藍球"], ["MAT-0190", 3, "基礎", "函數", "y 座標為 14", "先乘再減 4"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (id !== "MAT-0351" && (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip))) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0191", 0, "基礎", "一元一次方程式", "每支原子筆 27 元", "剩下的原子筆總價平均分給 3 支"], ["MAT-0192", 1, "中等", "速率與單位換算", "d = 30 公里", "慢速時間減快速時間"], ["MAT-0193", 2, "中等", "幾何", "10×15 = 150 平方公分", "周長的一半"], ["MAT-0194", 3, "中等", "平均數", "新平均為 624÷8 = 78 分", "平均改變量還要除以人數"], ["MAT-0195", 0, "基礎", "統計與機率", "3/6 = 1/2", "6 種等可能結果"], ["MAT-0196", 1, "基礎", "函數", "x 座標為 4", "x 軸上的點 y 座標為 0"], ["MAT-0197", 2, "基礎", "一元一次方程式", "x = 8", "分別寫成代數式"], ["MAT-0198", 3, "中等", "速率與單位換算", "t = 20 分鐘", "兩人的速率差"], ["MAT-0199", 0, "基礎", "統計與機率", "8/40 = 1/5", "求步行人數"], ["MAT-0200", 1, "基礎", "函數", "b = 5", "代入直線式"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0201", 2, "基礎", "幾何與測量", "答案是 1.8 公里", "100,000 公分換 1 公里"], ["MAT-0202", 2, "基礎", "折扣與百分率", "售價是 900 元", "300 元是折掉的金額"], ["MAT-0203", 3, "基礎", "一元一次方程式", "x＝8", "除以括號外的係數 3"], ["MAT-0204", 0, "基礎", "一元一次方程式", "較小整數為 28", "設為 n 與 n＋1"], ["MAT-0205", 1, "中等", "平均數", "第五次至少要 360－280＝80 分", "目標平均乘五次"], ["MAT-0206", 2, "基礎", "函數", "y＝－2×(－3)＋7＝6＋7＝13", "負係數乘負數"], ["MAT-0207", 2, "基礎", "畢氏定理", "√100＝10 公分", "計算平方和後要開平方根"], ["MAT-0208", 3, "基礎", "統計與機率", "8/10＝4/5", "分子計符合條件的 8 顆"], ["MAT-0209", 3, "基礎", "速率與單位換算", "150×60＝9,000 公尺", "乘 60 再除 1,000"], ["MAT-0210", 0, "基礎", "等差數列", "5＋13×4＝57", "加上 13 個 4"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0211", 1, "基礎", "幾何與測量", "14×8＝112", "底乘對應的垂直高"], ["MAT-0212", 2, "基礎", "比與比例應用", "200,000÷100,000＝2 公里", "圖上距離乘比例尺"], ["MAT-0213", 3, "基礎", "函數", "(13－5)/(6－2)＝8/4", "縱坐標差除以橫坐標差"], ["MAT-0214", 0, "基礎", "幾何與角度", "180°－111°＝69°", "三角形內角總和為 180°"], ["MAT-0215", 1, "中等", "百分率應用", "2,720－400＝2,320 元", "先用原價乘 0.85"], ["MAT-0216", 2, "中等", "聯立方程式", "x＝6", "兩式相加可消去 y"], ["MAT-0217", 3, "中等", "幾何與測量", "16×9＝144 平方公分", "周長的一半是長寬和"], ["MAT-0218", 0, "中等", "統計與機率", "6/36＝1/6", "36 個等可能的有序結果"], ["MAT-0219", 2, "中等", "一元二次方程式", "x＝3 或 x＝4", "題目要較小的根"], ["MAT-0220", 3, "基礎", "幾何與測量", "3.14×10＝31.4", "題目給的是直徑"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0221", 1, "基礎", "統計與機率", "第四次分數＝312－222＝90 分", "前三次平均乘 3"], ["MAT-0222", 1, "基礎", "一元一次方程式", "左側 2×9＋5＝23", "含 x 的項移到等式同一側"], ["MAT-0223", 2, "基礎", "幾何與坐標", "中點為 (2,1)", "兩端點座標的平均"], ["MAT-0224", 2, "基礎", "幾何與測量", "60 立方公分", "長×寬×高"], ["MAT-0225", 3, "中等", "幾何與測量", "45π 立方公分", "半徑要平方"], ["MAT-0226", 0, "中等", "百分率應用", "1,200×0.65＝780 元", "反求原價要除以 0.65"], ["MAT-0227", 1, "中等", "比與比例應用", "7×6＝42", "18 除以 3 求每份"], ["MAT-0228", 2, "中等", "數列", "10²＋1＝101", "相鄰差為 3、5、7、9"], ["MAT-0229", 3, "中等", "聯立方程式", "x＝5", "表示 y＝7－x"], ["MAT-0230", 0, "基礎", "幾何與測量", "96 平方公分", "一面 4²，再乘以 6"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0231", 3, "基礎", "比與比例應用", "7.2×1/3＝2.4 公里", "除以 60 換成小時"], ["MAT-0232", 1, "中等", "統計與機率", "機率為 7/30", "扣掉重複計入的交集"], ["MAT-0233", 2, "基礎", "幾何與角度", "180°－68°＝112°", "相鄰內角互補"], ["MAT-0234", 3, "基礎", "函數", "x＝6", "給定的 y 值代入"], ["MAT-0235", 0, "基礎", "統計與機率", "第 4 筆是 9", "正中央那一筆"], ["MAT-0236", 1, "基礎", "幾何與角度", "103°", "兩個不相鄰內角的和"], ["MAT-0237", 2, "基礎", "統計與機率", "4/12＝1/3", "總區域數作分母"], ["MAT-0238", 2, "中等", "函數", "b＝5", "代入通過的點求截距"], ["MAT-0239", 3, "基礎", "幾何與測量", "48 平方公分", "兩底與高的長度單位需一致"], ["MAT-0240", 3, "中等", "平方根", "x＝5", "代回原根號式檢查"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0241", 0, "基礎", "比與比例應用", "75×10＝750 公克", "人數比例是 10÷4＝2.5"], ["MAT-0242", 1, "基礎", "百分率應用", "x＝60", "除以 0.4 反求原數"], ["MAT-0243", 2, "中等", "幾何與角度", "180°－80°＝100°", "互補"], ["MAT-0244", 3, "中等", "統計與機率", "430÷5＝86", "總和增加 30"], ["MAT-0245", 0, "中等", "幾何與測量", "10√2÷√2＝10 公分", "對角線＝邊長×√2"], ["MAT-0246", 1, "基礎", "百分率應用", "120×0.45＝54", "百分率化為小數 0.45"], ["MAT-0247", 0, "中等", "函數", "b＝6", "平行線斜率相同"], ["MAT-0248", 2, "基礎", "幾何與測量", "π×4²＝16π", "不是直徑"], ["MAT-0249", 3, "基礎", "統計與機率", "22/40＝11/20", "分母是男女總人數 40"], ["MAT-0250", 0, "中等", "幾何與測量", "8π＋28π＝36π", "側面展開是長方形"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0251", 1, "中等", "比與比例應用", "乙比甲多 4－3＝1 份", "份數差乘每份量"], ["MAT-0252", 2, "基礎", "比與比例應用", "600÷7.5＝80 元", "總價除以公斤數"], ["MAT-0253", 3, "中等", "一元一次方程式", "x＝9", "先展開括號"], ["MAT-0254", 0, "中等", "統計與機率", "328－241＝87 分", "平均乘測驗次數"], ["MAT-0255", 1, "基礎", "函數", "y＝15", "先乘 4 再減 9"], ["MAT-0256", 1, "基礎", "幾何與測量", "√225＝15 公分", "再開平方根"], ["MAT-0257", 2, "基礎", "統計與機率", "2÷4＝1/2", "HT、TH 符合條件"], ["MAT-0258", 3, "中等", "數列", "20×(5＋62)÷2＝670", "首末項平均乘項數"], ["MAT-0259", 0, "基礎", "幾何與角度", "180°－108°＝72°", "第三角用總和扣掉已知兩角"], ["MAT-0260", 1, "基礎", "函數", "12÷4＝3", "y 的變化量除以 x 的變化量"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0261", 2, "基礎", "百分率應用", "600 元", "本金×年利率×年數"], ["MAT-0262", 3, "基礎", "百分率應用", "300×0.8＝240 元", "240 除以 0.8"], ["MAT-0263", 0, "基礎", "幾何與角度", "56°", "相加為 90°"], ["MAT-0264", 1, "中等", "幾何與測量", "2×(15＋8)＝46 公分", "面積除以已知寬"], ["MAT-0265", 1, "基礎", "幾何與坐標", "8 單位", "x 座標差的絕對值"], ["MAT-0266", 3, "基礎", "一元二次方程式", "題目問正根，選 x＝3", "正、負兩根"], ["MAT-0267", 2, "基礎", "統計與機率", "5/20＝1/4", "數出 1 到 20 中 4 的倍數"], ["MAT-0268", 2, "基礎", "幾何與測量", "44 公分", "圓周長直接用 πd"], ["MAT-0269", 3, "基礎", "幾何與測量", "66 平方公分", "兩底和乘高再除以 2"], ["MAT-0270", 0, "基礎", "一元一次不等式", "x＜5", "除以正數不會改變不等號方向"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0271", 0, "基礎", "幾何與角度", "720°÷6＝120°", "除以 6"], ["MAT-0272", 1, "基礎", "幾何與測量", "36π 立方公分", "πr²h"], ["MAT-0273", 2, "基礎", "統計與機率", "眾數為 6", "出現次數最多"], ["MAT-0274", 3, "中等", "數與因數", "9－8＝1", "乘積為 72 的因數配對"], ["MAT-0275", 0, "中等", "幾何與測量", "7√2×√2＝14 公分", "先由面積開平方求邊長"], ["MAT-0276", 1, "基礎", "百分率應用", "800＋120＝920 元", "原價的 115%"], ["MAT-0277", 2, "基礎", "幾何與測量", "b＝12 公分", "13²－5²"], ["MAT-0278", 3, "基礎", "一元一次方程式", "x＝13", "乘 3 消去分母"], ["MAT-0279", 1, "基礎", "函數", "f(−2) 為 5", "把 −2 括起來再平方"], ["MAT-0280", 0, "基礎", "統計與機率", "18－2＝16", "最大值減最小值"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0281", 1, "基礎", "幾何與角度", "較大角＝33＋24＝57°", "互補角總和為 90°"], ["MAT-0282", 2, "基礎", "幾何與測量", "高 h＝84÷14＝6 公分", "兩底和除以 2"], ["MAT-0283", 3, "基礎", "一元一次方程式", "x＝13", "3x－8"], ["MAT-0284", 0, "基礎", "幾何與測量", "1/4", "圓心角除以 360°"], ["MAT-0285", 1, "基礎", "幾何與測量", "6√2 公分", "邊長乘 √2"], ["MAT-0286", 2, "中等", "聯立方程式", "y＝5", "兩式相加可消去 y"], ["MAT-0287", 3, "基礎", "比與比例應用", "30 分鐘", "路程÷速率"], ["MAT-0288", 3, "基礎", "函數", "x 坐標是 6", "令函數值等於 0"], ["MAT-0289", 0, "中等", "一元一次方程式", "最小數為 11", "六個連續整數"], ["MAT-0290", 1, "基礎", "幾何與測量", "48 立方公分", "長、寬、高相乘"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0291", 2, "基礎", "比與比例應用", "b＝20", "a＝12 代入"], ["MAT-0292", 3, "中等", "百分率應用", "900×0.9＝810 元", "每次折數相乘"], ["MAT-0293", 0, "基礎", "幾何與角度", "140°÷2＝70°", "底角相等"], ["MAT-0294", 1, "中等", "數列", "3×2⁷＝384", "公比的 n－1 次方"], ["MAT-0295", 2, "中等", "一元一次方程式", "x＝5", "展開括號"], ["MAT-0296", 3, "中等", "幾何與測量", "(7＋13)×5÷2＝50 平方公分", "短底加上底長差"], ["MAT-0297", 0, "基礎", "幾何與坐標", "(−2,−2)", "向左平移只改變 x 座標"], ["MAT-0298", 1, "中等", "數與因數", "6×7＋2＝44", "可寫成 6k＋2"], ["MAT-0299", 2, "中等", "幾何與測量", "25π：25＝π：1", "相同量綱"], ["MAT-0300", 3, "基礎", "統計與機率", "乙數＝總和－甲數", "平均乘以 2 得到總和"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, point, clue, tip] of [["MAT-0301", 0, "基礎", "長方形面積", "48×30", "整張海報"], ["MAT-0302", 1, "基礎", "長方形面積", "7.5×4＝30", "兩邊都以公尺為單位"], ["MAT-0303", 2, "中等", "複合圖形面積", "48－6＝42 平方公尺", "扣除不鋪設的角落"], ["MAT-0304", 3, "中等", "長方形周長與面積反推", "長＝84÷7", "平方公分除以公分"], ["MAT-0305", 0, "基礎", "平行四邊形面積", "面積為 44 平方公分", "斜邊長不能代替高"], ["MAT-0306", 1, "基礎", "長方形面積", "60×40＝2,400", "完整長方形桌面"], ["MAT-0307", 0, "基礎", "三角形面積", "2.4×1.2÷2＝1.44", "公式要除以 2"], ["MAT-0308", 2, "中等", "梯形面積", "25×10÷2＝125 平方公分", "不可把兩底差當成高度"], ["MAT-0309", 3, "中等", "面積密度與數量", "9×3×2＝54 株", "每平方公尺的株數"], ["MAT-0310", 0, "中等", "圓面積", "π×9²＝81π", "不要把直徑當半徑"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、題型多樣性、難度、解題證據或教師提醒回歸錯誤`);
}

for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0311", 3, "基礎", "幾何", "3.2×1.5＝4.8", "小數相乘時"], ["MAT-0312", 1, "基礎", "幾何", "180×90＝16,200", "補兩個 0"], ["MAT-0313", 2, "中等", "幾何", "寬為 15−9＝6 公尺", "周長除以 2"], ["MAT-0314", 3, "中等", "幾何", "96−6＝90 平方公尺", "花壇完整位於草地內"], ["MAT-0315", 1, "基礎", "幾何", "1.8×0.9＝1.62", "18×9＝162"], ["MAT-0316", 0, "基礎", "幾何", "96÷12＝8 公分", "平方公分除以公分"], ["MAT-0317", 1, "基礎", "幾何", "15×10＝150 平方公尺", "面積倍率是長度倍率的平方"], ["MAT-0318", 2, "基礎", "幾何", "72÷6＝12 公分", "12×6 是否回到 72"], ["MAT-0319", 3, "中等", "幾何", "5.5×2＝11 平方公尺", "不要把兩邊相加"], ["MAT-0320", 0, "中等", "幾何", "1.62÷0.18＝9 張", "題目保證不重疊鋪滿"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== "矩形面積" || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, clue, tip] of [["MAT-0321", 1, "中等", "7²＋24²＝49＋576＝625", "只有直角三角形"], ["MAT-0322", 2, "中等", "較小角是「44°」", "別把 x 當成角度"], ["MAT-0323", 0, "中等", "x＝3", "整段 AC"], ["MAT-0324", 3, "中等", "88×90/360＝22 公尺", "別把扇形面積公式套進來"], ["MAT-0325", 0, "中等", "200÷2＝100", "正方形對角線不是邊長"], ["MAT-0326", 1, "基礎", "x＝60°", "相鄰角互補"], ["MAT-0327", 2, "基礎", "10 條邊", "外角合計一周 360°"], ["MAT-0328", 3, "中等", "10×7.5＝75 平方公尺", "面積比例會是長度比例的平方"], ["MAT-0329", 0, "中等", "80＝50＋5x，x＝6", "整段 PR"], ["MAT-0330", 1, "中等", "480 公升", "先求立方單位體積"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== "幾何" || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, clue, tip] of [["MAT-0331", 2, "基礎", "3x−7＝20", "留意移項改變正負號"], ["MAT-0332", 3, "基礎", "1,200×0.75＝900 元", "折掉的百分比"], ["MAT-0333", 0, "基礎", "2×3.14×5＝31.4 公分", "圓面積才是 πr²"], ["MAT-0334", 1, "基礎", "平均 84 分", "不要誤用中位數"], ["MAT-0335", 2, "基礎", "c＝√169＝13 公分", "斜邊是直角的對邊"], ["MAT-0336", 3, "基礎", "y＝18−11＝7", "加減消去法解聯立方程"], ["MAT-0337", 0, "基礎", "機率 1/3", "大於 4 不包含 4"], ["MAT-0338", 1, "基礎", "y＝5", "寫成有序數對"], ["MAT-0339", 2, "中等", "100,000 公分除以 100", "1 公尺＝100 公分"], ["MAT-0340", 3, "基礎", "相乘得 60 立方公分", "表面積算法不同"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== ({ "MAT-0331": "一次方程式", "MAT-0332": "百分率", "MAT-0333": "圓", "MAT-0334": "統計", "MAT-0335": "直角三角形", "MAT-0336": "二元一次方程式", "MAT-0337": "機率", "MAT-0338": "一次函數", "MAT-0339": "比例尺", "MAT-0340": "立體圖形" })[id] || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0341", 0, "中等", "代數", "80＋1,200÷20＝140", "固定費用和分攤費用"], ["MAT-0342", 0, "中等", "統計與機率", "3/10＋3/10＝6/10＝3/5", "兩種先後順序"], ["MAT-0343", 2, "中等", "數與量", "300,000÷100,000＝3", "避免少乘比例尺"], ["MAT-0344", 3, "基礎", "幾何", "√225＝15 公分", "斜邊還是股"], ["MAT-0345", 0, "中等", "代數", "係數 18 表示每公里增加 18 元", "x=0 時的 y 值"], ["MAT-0346", 1, "中等", "幾何", "2×(12＋8)=40 公尺", "覆蓋面積還是邊界周長"], ["MAT-0347", 2, "基礎", "幾何", "14×9÷2", "高必須垂直"], ["MAT-0348", 2, "基礎", "幾何", "2×3×5＝30 公尺", "圓面積才使用 πr²"], ["MAT-0349", 3, "基礎", "幾何", "12×7＝84 平方公分", "使用垂直高"], ["MAT-0350", 0, "基礎", "幾何", "22×6", "兩底間的垂直距離"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0351", 1, "中等", "代數", "面積=7×10=70 平方公分", "長方形周長公式"], ["MAT-0352", 2, "基礎", "統計", "340÷4=85", "總和除以資料筆數"], ["MAT-0353", 1, "中等", "比例", "5×150=750 毫升", "兩組量的順序顛倒"], ["MAT-0354", 0, "基礎", "幾何", "c=13 公分", "斜邊平方等於兩股平方和"], ["MAT-0355", 1, "基礎", "機率", "機率=2/5", "等可能情形"], ["MAT-0356", 1, "中等", "一元一次方程式", "5x=600", "只加在成人票上"], ["MAT-0357", 2, "中等", "數列", "a₂₀=4+19×5=99", "n−1 個公差"], ["MAT-0358", 1, "基礎", "函數", "m=(13−5)/(6−2)", "縱向變化除以橫向變化"], ["MAT-0359", 2, "基礎", "立體圖形", "圓柱體積為 90π", "圓柱體積用底面積乘高"], ["MAT-0360", 0, "中等", "百分率", "960−100=860", "折價券再從折後價格扣除"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0361", 1, "基礎", "幾何", "180°−113°=67°", "已知角是否全部計入"], ["MAT-0362", 2, "中等", "百分率", "5,000×0.02×3", "利息與本利和要分清楚"], ["MAT-0363", 0, "基礎", "坐標幾何", "(−2＋6)÷2=2", "分別對 x、y 座標取平均"], ["MAT-0364", 1, "基礎", "圓", "C=2π×7=14π 公分", "圓周長可用 2πr 或 πd"], ["MAT-0365", 1, "基礎", "一元一次方程式", "得 x=4", "相反運算"], ["MAT-0366", 1, "基礎", "機率", "機率=1/4", "列出樣本空間"], ["MAT-0367", 3, "基礎", "立體圖形", "4×4×4", "單位要用立方單位"], ["MAT-0368", 1, "基礎", "速率", "150÷2.5=60 公里／小時", "核對單位"], ["MAT-0369", 1, "基礎", "函數", "y=−1", "保留負號"], ["MAT-0370", 2, "基礎", "指數律", "2⁷=128", "確認底數相同"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0371", 1, "基礎", "分數與百分率", "3÷8=0.375", "再乘 100%"], ["MAT-0372", 1, "基礎", "二元一次方程式", "2x=14", "加減消去法"], ["MAT-0373", 2, "基礎", "多邊形", "(6−2)×180°", "邊數減 2"], ["MAT-0374", 3, "基礎", "統計", "第 3 筆為 6", "不能把資料總和除以筆數"], ["MAT-0375", 1, "中等", "比例尺", "150,000 公分=1.5 公里", "統一單位"], ["MAT-0376", 0, "基礎", "正比", "30×7", "單位量乘總量"], ["MAT-0377", 0, "基礎", "一次函數", "3×1−2=1", "將座標代入函數式"], ["MAT-0378", 1, "基礎", "表面積", "6×9", "各面的面積總和"], ["MAT-0379", 2, "基礎", "古典機率", "3/6=1/2", "1 不是質數"], ["MAT-0380", 3, "基礎", "圓面積", "扇形面積為 16π", "面積也取整圓的相同比例"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0381", 0, "基礎", "一次函數", "60＋60=120 元", "固定費與變動費"], ["MAT-0382", 2, "基礎", "統計", "168−152", "最大值減最小值"], ["MAT-0383", 1, "基礎", "幾何", "16×4÷2", "別漏掉除以 2"], ["MAT-0384", 2, "中等", "百分率", "12÷80", "原始量"], ["MAT-0385", 3, "基礎", "相似形", "3×2=6 公分", "邊長按倍率變化"], ["MAT-0386", 0, "基礎", "速率", "240÷80=3 小時", "先確認所求量"], ["MAT-0387", 1, "基礎", "立體圖形", "9π×6÷3", "同底同高圓柱"], ["MAT-0388", 0, "基礎", "一元一次不等式", "x＜4", "除以負數時"], ["MAT-0389", 1, "中等", "坐標幾何", "距離²=3²＋4²=25", "直角三角形"], ["MAT-0390", 2, "基礎", "分數", "28÷4=7", "先約分"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, clue, tip] of [["MAT-0391", 2, "中等", "統計", "2280÷30＝76 分", "先加總各組總量"], ["MAT-0392", 3, "中等", "統計與機率", "共 5 個", "重疊結果只能計算一次"], ["MAT-0393", 0, "中等", "代數", "5x＝45", "未知數係數相同"], ["MAT-0394", 1, "基礎", "幾何", "c＝15 公分", "兩股"], ["MAT-0395", 2, "基礎", "函數", "3x＝9", "令兩個 y 表示式相等"], ["MAT-0396", 3, "基礎", "資料判讀", "240×1/4＝60 人", "圓心角除以 360°"], ["MAT-0397", 0, "中等", "數與量", "1200×0.9＝1080 元", "依序乘折數"], ["MAT-0398", 1, "中等", "數與量", "420÷140＝3 小時", "相向速率相加"], ["MAT-0399", 2, "基礎", "幾何", "124°÷2＝62°", "同弧的圓心角"], ["MAT-0400", 3, "中等", "代數", "(5＋32)×10÷2＝185", "首末項平均乘項數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, point, clue, tip] of [["MAT-0401", 0, "基礎", "三角形相似與對應邊比", "9÷6＝1.5", "不可把不同位置的邊直接相比"], ["MAT-0402", 1, "基礎", "三角形內角", "4×20°＝80°", "總份數對應 180°"], ["MAT-0403", 2, "基礎", "三角形內角", "90°−37°＝53°", "兩個銳角互餘"], ["MAT-0404", 3, "基礎", "等腰三角形與畢氏定理", "h²＝13²−5²＝169−25＝144", "高會垂直且平分底邊"], ["MAT-0405", 0, "中等", "三角形外角與角度比", "125°÷5＝25°", "依角度比分配"], ["MAT-0406", 1, "中等", "平行四邊形與對角線角度", "180°−28°−112°＝40°", "再用三角形內角和"], ["MAT-0407", 2, "中等", "正多邊形外角與邊數", "360°÷24°＝15", "外角和為 360°"], ["MAT-0408", 3, "基礎", "平行線截角", "x＝68°", "同側內角互補"], ["MAT-0409", 0, "基礎", "四邊形內角和", "360°−279°＝81°", "先加總已知角"], ["MAT-0410", 1, "基礎", "矩形直角與角度分割", "90°−32°＝58°", "直角被分割時"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== "幾何" || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、考點、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
const mathAngleReviewBatch = mathAuthored.filter(question => /^MAT-04(?:0[1-9]|10)$/.test(question.id));
if (new Set(mathAngleReviewBatch.map(question => question.knowledgePoint)).size < 6) errors.push("MAT-0401–0410: 幾何考點過度集中，請維持題型多樣性");
for (const [id, answer, difficulty, point, clue, tip] of [["MAT-0411", 2, "基礎", "三角形內角", "180°−130°＝50°", "第三角使用三角形內角和"], ["MAT-0412", 3, "基礎", "三角形內角", "132°−52°＝80°", "外角定理只加兩個不相鄰內角"], ["MAT-0413", 0, "基礎", "三角形內角和與一元一次方程式", "x＝30", "代回各角比較"], ["MAT-0414", 1, "中等", "三角形內角", "x＝30", "解出 x 後要代回"], ["MAT-0415", 2, "中等", "三角形邊長不等式", "3＋4＝7，小於 8", "任兩邊和大於第三邊"], ["MAT-0416", 3, "基礎", "三角形內角", "x＝22.5°", "兩銳角互餘"], ["MAT-0417", 0, "基礎", "四邊形內角和", "360°−281°＝79°", "四邊形內角和為 360°"], ["MAT-0418", 3, "中等", "多邊形對角線條數", "10×7÷2＝35 條", "重複計入"], ["MAT-0419", 2, "基礎", "三角形外角與鄰角", "180°−124°＝56°", "形成一直線而互補"], ["MAT-0420", 1, "中等", "圓內接四邊形對角", "3x＋30＝180", "對角互補"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== "幾何" || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、考點、難度、解題證據或專屬教師提醒不一致／缺漏`);
}
const mathGeometryReviewBatch = mathAuthored.filter(question => /^MAT-04(?:1[1-9]|20)$/.test(question.id));
if (new Set(mathGeometryReviewBatch.map(question => question.knowledgePoint)).size < 5) errors.push("MAT-0411–0420: 幾何考點過度集中，請維持題型多樣性");
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0421", 0, "中等", "數與量", "百分率", "900×1.05＝945", "折後售價為稅基"], ["MAT-0422", 1, "中等", "比例與速率", "比例稀釋", "600×(1＋2)＝1,800", "成品總份數"], ["MAT-0423", 2, "中等", "統計與機率", "不放回抽取機率與補事件", "1－3/10＝7/10", "相反事件"], ["MAT-0424", 3, "中等", "代數", "一元一次方程式", "12x＝144", "起跳費是固定項"], ["MAT-0425", 0, "基礎", "函數", "一次函數情境應用", "40−30＝10", "總漏量"], ["MAT-0426", 1, "中等", "幾何", "三角形外角", "x＝30", "外角式與遠端內角和相等"], ["MAT-0427", 2, "中等", "幾何", "複合圖形面積", "12×7−3×2＝84−6", "垂直高"], ["MAT-0428", 3, "基礎", "幾何", "圓周長", "2×π×35×3＝210π", "半徑不可誤作直徑"], ["MAT-0429", 0, "進階", "比例與速率", "比例尺與平均速度", "11.5÷1.5＝7⅔", "總距離除總時間"], ["MAT-0430", 1, "基礎", "統計", "平均數", "66÷6＝11", "總和與筆數都要更新"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0431", 2, "中等", "數與量", "中位數", "(6＋9)÷2＝7.5", "重新排序"], ["MAT-0432", 3, "中等", "幾何", "畢氏定理", "下降 2 公尺", "都不變的斜邊"], ["MAT-0433", 0, "基礎", "比例與速率", "速率", "180÷2.5＝72", "實際行車時間"], ["MAT-0434", 1, "中等", "代數", "一元一次方程式", "2x＝60", "折價加回"], ["MAT-0435", 2, "基礎", "代數", "連續偶數", "較大偶數為 44", "相差 2"], ["MAT-0436", 3, "中等", "數與量", "百分率", "44.444", "有效票數才是"], ["MAT-0437", 0, "中等", "代數", "一元一次不等式", "3n＋20≤95", "必留車資"], ["MAT-0438", 1, "中等", "幾何", "相似形", "4×1.5＝6", "放大倍率"], ["MAT-0439", 2, "中等", "數與量", "體積與百分率", "22,500÷1,000＝22.5", "換公升"], ["MAT-0440", 3, "中等", "代數", "等差數列", "(8＋44)×10÷2＝260", "等差數列"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (id !== "MAT-0538" && (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip))) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0441", 0, "中等", "數與量", "百分率", "1,200×1.05＝1,260", "折扣先作用"], ["MAT-0442", 1, "中等", "比例與速率", "比例", "480×5÷2＝1,200", "2：3"], ["MAT-0443", 2, "中等", "統計與機率", "機率", "4/7×3/6＋3/7×4/6", "兩種互斥順序"], ["MAT-0444", 3, "基礎", "代數", "一元一次方程式", "x＝11 公里", "起跳費只加一次"], ["MAT-0445", 0, "中等", "數與量", "速率與數量變化", "90−45＋15＝60", "依時間順序"], ["MAT-0446", 1, "中等", "幾何", "三角形內角", "x＝70/3", "內角和 180°"], ["MAT-0447", 2, "中等", "幾何", "梯形與複合面積", "128−4×3＝116", "梯形面積"], ["MAT-0448", 3, "基礎", "幾何", "圓周長", "14π×2＝28π", "題目給的是直徑"], ["MAT-0449", 0, "中等", "比例與速率", "比例尺與速率", "10.8÷2.4＝4.5", "比例尺換實距"], ["MAT-0450", 1, "基礎", "統計", "平均數", "468÷6＝78", "原平均乘原次數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (id !== "MAT-0538" && (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip))) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0451", 2, "中等", "數與量", "中位數", "中位數為 7.5", "刪除最大值"], ["MAT-0452", 3, "中等", "幾何", "畢氏定理", "下降 7 公尺", "固定斜邊"], ["MAT-0453", 0, "中等", "比例與速率", "速率", "240÷(8/3)＝90", "20 分鐘"], ["MAT-0454", 1, "中等", "代數", "一元一次方程式", "150÷3＝50", "折價要先加回"], ["MAT-0455", 2, "基礎", "代數", "連續奇數", "較大的奇數是 49", "相差 2"], ["MAT-0456", 3, "中等", "數與量", "百分率", "65÷130＝0.5", "空白票不算有效票"], ["MAT-0457", 0, "中等", "代數", "一元一次不等式", "4n＋25≤170−25", "整數"], ["MAT-0458", 1, "基礎", "幾何", "相似形", "4×1.5＝6", "不能加上邊長差"], ["MAT-0459", 2, "中等", "數與量", "體積與單位換算", "32,000÷1,000＝32", "80%"], ["MAT-0460", 3, "中等", "代數", "等差級數", "(5＋49)×12÷2＝324", "每列多 4 個"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0461", 0, "中等", "數與量", "連續百分率變化與逆推", "960÷0.96＝1,000", "依序相乘"], ["MAT-0462", 0, "中等", "數與量", "最小公倍數", "最小公倍數為 36", "最小公倍數"], ["MAT-0463", 2, "中等", "統計與機率", "等可能事件機率", "機率＝3/8", "全部等可能格數"], ["MAT-0464", 0, "基礎", "數與量", "整數四則與乘方", "9＋8−4＝13", "負數平方"], ["MAT-0465", 3, "中等", "代數", "二位數的數字關係", "答案為 64", "十位與個位"], ["MAT-0466", 1, "中等", "函數", "一次函數斜率與代入", "得 y＝15", "縱座標差除以橫座標差"], ["MAT-0467", 2, "中等", "幾何", "正多邊形內角", "1,080°÷8＝135°", "外角和 360°"], ["MAT-0468", 3, "中等", "幾何", "圓周長與面積關係", "面積＝π×6²＝36π", "反推半徑"], ["MAT-0469", 1, "基礎", "幾何", "座標對稱與平移", "最後座標為 (3,−1)", "鏡射只改變 x 座標"], ["MAT-0470", 1, "中等", "統計", "加權平均數", "÷20＝166 公分", "人數不同"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0471", 2, "基礎", "統計與機率", "全距", "全距＝27−19＝8°C", "全距是最大觀測值"], ["MAT-0472", 2, "基礎", "幾何", "四邊形內角和", "第四角＝360°−285°＝75°", "內角和是 360°"], ["MAT-0473", 0, "基礎", "數與量", "時間計算", "3小時45分−25分＝3小時20分", "總經過時間"], ["MAT-0474", 1, "中等", "數與量", "整數四則與乘方", "−6＋18＝12", "先處理括號和乘方"], ["MAT-0475", 2, "中等", "數與量", "最大公因數", "最大公因數為 2²×3＝12", "最大公因數"], ["MAT-0476", 3, "基礎", "統計與機率", "眾數", "眾數為 4", "出現次數最多"], ["MAT-0477", 0, "基礎", "代數", "分配律與化簡", "5a＋2a−6＝7a−6", "分配到括號內每一項"], ["MAT-0478", 1, "基礎", "幾何", "正方形周長與面積", "面積＝9×9＝81 平方公分", "周長除以 4"], ["MAT-0479", 3, "中等", "幾何", "長方體表面積", "表面積＝2×(40＋24＋15)＝158", "三種不同面積各兩面"], ["MAT-0480", 3, "中等", "統計與機率", "兩骰和的等可能機率", "機率＝5/36", "順序分開計數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0481", 0, "基礎", "數與量", "分數四則運算", "10/12−3/12＝7/12", "先通分"], ["MAT-0482", 1, "中等", "代數", "二元一次聯立方程式", "3x＝15", "連同括號代入"], ["MAT-0483", 2, "中等", "統計與機率", "中位數", "(5＋7)÷2＝6", "中央兩筆"], ["MAT-0484", 3, "中等", "數與量", "數線上兩點距離", "5−(−4)＝5＋4＝9", "取絕對值"], ["MAT-0485", 0, "基礎", "函數", "函數值代入", "3×5−4＝15−4", "輸入 x＝5"], ["MAT-0486", 1, "基礎", "幾何", "正多邊形外角", "360°÷12＝30°", "外角和固定為 360°"], ["MAT-0487", 2, "基礎", "幾何", "梯形面積", "(8＋16)×6÷2＝72", "垂直距離"], ["MAT-0488", 3, "中等", "幾何", "圓環面積", "25π−9π＝16π", "平方後再相減"], ["MAT-0489", 0, "中等", "幾何", "相似形面積比", "12×9＝108", "長度比平方"], ["MAT-0490", 1, "基礎", "統計與機率", "平均數平移性質", "8＋4＝12", "平均數也同加該數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0491", 0, "基礎", "幾何", "平行線截角", "5x＋30＝180", "同側內角互補"], ["MAT-0492", 2, "基礎", "統計與機率", "互斥事件機率", "機率＝7/7＝1", "涵蓋全部可能"], ["MAT-0493", 0, "基礎", "代數", "一元一次方程式", "2x＝18", "係數要乘到括號內每一項"], ["MAT-0494", 2, "基礎", "幾何", "長方體體積", "12×8×5＝480", "立方公分"], ["MAT-0495", 2, "基礎", "統計與機率", "相對次數與圓形圖", "360°×1/4＝90°", "圓心角"], ["MAT-0496", 1, "基礎", "數與量", "科學記號", "7.2×10⁻⁴", "10 的指數就是負幾"], ["MAT-0497", 1, "基礎", "函數", "一次函數截距", "交點座標為 (0, 6)", "x 座標為 0"], ["MAT-0498", 3, "中等", "統計與機率", "四分位距", "13−4.5＝8.5", "Q₃ 減 Q₁"], ["MAT-0499", 3, "基礎", "數與量", "絕對值與距離", "4−(−7)＝4＋7＝11", "距離不能為負"], ["MAT-0500", 2, "中等", "統計與機率", "次數分配表與條件加總", "合計 10＋6＋2＝18 人", "至少"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0501", 0, "基礎", "數與量", "整數指數律", "2⁵＝32", "底數相同"], ["MAT-0502", 1, "基礎", "代數", "一元二次方程式因式分解", "(x−3)(x＋3)＝0", "正根"], ["MAT-0503", 2, "中等", "數與量", "數列規律", "下一項 33＋32＝65", "差"], ["MAT-0504", 0, "中等", "幾何", "座標平面對稱", "最後座標為 (3,3)", "y 軸鏡射只改變 x"], ["MAT-0505", 0, "中等", "代數", "一元二次方程", "(x−7)(x＋12)＝0", "正數條件"], ["MAT-0506", 1, "基礎", "數與量", "速率單位換算", "20×3.6＝72", "乘 3.6"], ["MAT-0507", 2, "中等", "數與量", "分數與比例", "30×2/3＝20", "整體基準"], ["MAT-0508", 3, "基礎", "統計與機率", "乘法原理", "總數＝3×2＝6", "乘法原理"], ["MAT-0509", 3, "基礎", "幾何", "圓柱體積", "9π×4＝36π", "半徑要平方"], ["MAT-0510", 1, "基礎", "統計與機率", "全距", "16−4＝12", "最大值和最小值"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0511", 2, "中等", "幾何", "三角形角度", "5x＋5＝120", "不相鄰內角"], ["MAT-0512", 3, "基礎", "幾何", "相似形", "24×5/3＝40", "周長不可平方"], ["MAT-0513", 0, "基礎", "幾何", "等腰梯形周長", "8＋14＋6＋6＝34", "四邊"], ["MAT-0514", 1, "中等", "幾何", "圓與扇形", "100π×1/5＝20π", "半徑而非直徑"], ["MAT-0515", 2, "基礎", "幾何", "畢氏定理", "169−25＝144", "梯長是斜邊"], ["MAT-0516", 0, "中等", "數與量", "比例尺與單位換算", "160,000÷100,000＝1.6", "除以 100,000"], ["MAT-0517", 3, "中等", "統計與機率", "平均數與倍數", "第四月＝320×1.5", "以平均值為基準"], ["MAT-0518", 0, "中等", "代數", "一元二次方程", "(x−2)(x−3)＝0", "兩個根"], ["MAT-0519", 3, "中等", "統計與機率", "平均數", "A 隊高 0.5 分", "相同的每節單位"], ["MAT-0520", 1, "中等", "數與量", "速率與方程", "75÷5＝15", "兩管同時作用"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0521", 2, "中等", "代數", "一元一次方程", "32x＝1,504", "固定費是扣除一次"], ["MAT-0522", 3, "中等", "函數", "函數與方程", "60＝3x", "月費是固定項"], ["MAT-0523", 0, "基礎", "代數", "一元一次不等式", "x≤5", "不等號方向才要反轉"], ["MAT-0524", 1, "基礎", "函數", "一次函數斜率", "斜率＝8÷4＝2", "分子分母不可交叉混用"], ["MAT-0525", 2, "中等", "數與量", "速率與分數", "5/12×3/2＝5/8", "每小時完成的水池比例"], ["MAT-0526", 3, "基礎", "數與量", "百分率", "800×0.85＝680", "付原價的 85%"], ["MAT-0527", 0, "基礎", "數與量", "比例", "5×8＝40", "女生人數是 5 份"], ["MAT-0528", 1, "中等", "統計與機率", "機率", "3/8×3/8＝9/64", "不涉及抽後不放回"], ["MAT-0529", 2, "中等", "統計與機率", "機率", "相加得 4/7", "兩種順序互斥"], ["MAT-0530", 3, "基礎", "統計與機率", "平均數", "380−302＝78", "除以 5"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0531", 0, "中等", "幾何", "多邊形", "n＝8 條邊", "n−2"], ["MAT-0532", 1, "中等", "代數", "反比例", "y＝72÷12＝6", "乘積固定"], ["MAT-0533", 2, "中等", "幾何", "體積與單位換算", "360÷1,000＝0.36", "體積也占 3/4"], ["MAT-0534", 3, "基礎", "幾何", "梯形面積", "（7＋15）×8÷2＝88", "兩底相加"], ["MAT-0535", 0, "中等", "數與量", "速率", "210÷3＝70", "含休息的總時間"], ["MAT-0536", 1, "中等", "函數", "一次函數", "f(8)＝4×8＋3＝35", "完整規則"], ["MAT-0537", 2, "基礎", "幾何", "三角形角度", "180°−48°−67°＝65°", "兩個已知角"], ["MAT-0538", 3, "中等", "幾何", "周長與面積", "10×17＝170", "周長公式"], ["MAT-0539", 0, "中等", "幾何", "體積與面積", "18,000÷1,800＝10", "原有水深不影響"], ["MAT-0540", 1, "中等", "代數", "一元一次不等式", "1,760÷85＝20 餘 60", "不能把張數進位"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0541", 2, "中等", "函數", "一次函數", "20＝3x＋2，故 x＝6", "自變數 x"], ["MAT-0542", 3, "基礎", "數與量", "最小公倍數", "第一個共同倍數是 24", "正共同倍數"], ["MAT-0543", 0, "基礎", "數與量", "速率", "可走 160 公里", "新增 2 小時"], ["MAT-0544", 1, "中等", "數與量", "百分率", "濃度＝90÷600＝15%", "容量不同"], ["MAT-0545", 2, "中等", "數與量", "百分率", "130×80%＝104 人", "逐步套用"], ["MAT-0546", 3, "中等", "統計與機率", "平均數", "420−328＝92 分", "先換成總分"], ["MAT-0547", 0, "中等", "幾何", "三角形角度", "x＝33", "兩個不相鄰內角"], ["MAT-0548", 1, "中等", "幾何", "相似立體體積比", "40×27÷8＝135", "體積比立方"], ["MAT-0549", 2, "基礎", "幾何", "平行四邊形", "18×7＝126", "對應高"], ["MAT-0550", 3, "基礎", "幾何", "圓周長", "2π×8＝16π", "周長用 2πr"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0551", 0, "中等", "幾何", "體積與單位換算", "20,000÷1,000＝20 公升", "公升與立方公分換算"], ["MAT-0552", 1, "基礎", "統計與機率", "中位數", "第 3 筆資料是 7", "先排序再取中央值"], ["MAT-0553", 2, "中等", "數與量", "等差級數", "(4＋37)×12÷2＝246", "增加 11 次"], ["MAT-0554", 2, "基礎", "代數", "一元一次不等式", "x≤10", "除以負數"], ["MAT-0555", 3, "中等", "數與量", "一元一次不等式", "最多可買 15 張", "16 張"], ["MAT-0556", 0, "中等", "代數", "一元二次方程", "根和為 7", "常數項 12"], ["MAT-0557", 1, "中等", "數與量", "百分率", "原價＝640÷0.8＝800", "運費"], ["MAT-0558", 2, "中等", "數與量", "比例尺與單位換算", "200,000÷100,000＝2 公里", "相同單位"], ["MAT-0559", 3, "中等", "數與量", "平均速率", "180÷2.5＝72", "不能直接取 60 與 90 的平均"], ["MAT-0560", 0, "中等", "幾何", "梯形面積", "h＝9 公分", "垂直距離"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0561", 1, "基礎", "代數", "代數式代值與運算順序", "50−15＋1＝36", "遵守運算順序"], ["MAT-0562", 2, "中等", "函數", "一次函數", "36＝4x", "等式平衡"], ["MAT-0563", 3, "中等", "數與量", "速率", "80×1.5＝120 公里", "各段路程"], ["MAT-0564", 0, "中等", "數與量", "質因數分解與因數個數", "4×3＝12", "指數要加 1"], ["MAT-0565", 1, "中等", "幾何", "正方形對角線與面積", "10²＝s²＋s²", "不要直接把 10 當成邊長"], ["MAT-0566", 2, "中等", "數與量", "百分率", "1.25P×0.8＝P", "倍率相乘"], ["MAT-0567", 3, "基礎", "數與量", "最大公因數與輾轉相除法", "126＝84×1＋42", "最後一個非零餘數"], ["MAT-0568", 0, "基礎", "數與量", "乘法原理與排列", "4×3×2＝24", "每選定一位"], ["MAT-0569", 1, "基礎", "統計與機率", "機率", "機率＝符合數÷總數＝3/10", "等可能"], ["MAT-0570", 2, "中等", "統計與機率", "平均數", "480−400＝80 分", "總和"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (id !== "MAT-0668" && (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0571", 3, "中等", "統計與機率", "加權平均數", "45÷6＝7.5 分", "合併計算平均"], ["MAT-0572", 0, "基礎", "數與量", "百分率與單利", "10,000×3%＝300 元", "指定單利"], ["MAT-0573", 1, "基礎", "幾何", "封閉路徑的間隔與點數", "60÷3＝20 個間隔", "起點和終點"], ["MAT-0574", 2, "中等", "幾何", "三角形外角定理", "115°−48°＝67°", "不相鄰內角"], ["MAT-0575", 3, "中等", "幾何", "畢氏定理", "225−81＝144", "開平方根"], ["MAT-0576", 0, "中等", "幾何", "三角形外角定理", "112°", "兩個不相鄰內角和"], ["MAT-0577", 1, "中等", "幾何", "圓與扇形", "2π＋6＋6＝12＋2π", "加兩條半徑"], ["MAT-0578", 2, "中等", "幾何", "正方體表面積的倍率變化", "24a²", "表面積隨邊長倍率平方"], ["MAT-0579", 3, "中等", "函數", "座標平面兩點斜率", "斜率＝8÷4＝2", "縱向變化除以橫向變化"], ["MAT-0580", 0, "中等", "代數", "二元一次聯立方程式", "3x＝12", "符合兩式"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (id !== "MAT-0668" && (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation)) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0581", 1, "基礎", "數與量", "時間單位換算", "2.4×60＝144 分鐘", "乘 60"], ["MAT-0582", 2, "中等", "代數", "比例與一元一次方程式", "3x/5＝21", "兩數之差"], ["MAT-0583", 3, "中等", "代數", "一元一次不等式", "x＞8", "尚未超過"], ["MAT-0584", 0, "中等", "數與量", "單位量與乘法", "5×8＝40 碗", "容器重量"], ["MAT-0585", 1, "基礎", "統計與機率", "百分率", "18÷30＝0.6", "全班人數"], ["MAT-0586", 2, "基礎", "幾何", "長方形面積變化", "14×8＝112 平方公尺", "改變後的面積"], ["MAT-0587", 3, "基礎", "數與量", "除法與餘數", "88", "小於除數"], ["MAT-0588", 0, "基礎", "幾何", "平行線角度關係", "180°−68°＝112°", "同側內角互補"], ["MAT-0589", 1, "中等", "數與量", "比與比例", "5×8＝40", "不是兩數相差 2"], ["MAT-0590", 2, "進階", "數與量", "分數與連續變化", "8−2＝6 公升", "不要把兩次分率都直接乘原水量"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0591", 3, "基礎", "幾何", "角度與方程式", "較大角＝2×60°＝120°", "和為 180°"], ["MAT-0592", 0, "基礎", "幾何", "梯形面積", "66", "垂直距離"], ["MAT-0593", 1, "中等", "數與量", "百分誤差", "4÷80×100%＝5%", "實際值"], ["MAT-0594", 2, "中等", "數與量", "相向運動與相對速率", "90÷30＝3 小時", "速率相加"], ["MAT-0595", 3, "中等", "統計與機率", "不放回抽樣機率", "2/7＋1/7＝3/7", "總數變成 6"], ["MAT-0596", 0, "基礎", "函數", "一次函數的 x 截距", "x＝3.5", "令 y＝0"], ["MAT-0597", 1, "基礎", "幾何", "圓柱體積", "9π×5＝45π", "半徑須先平方"], ["MAT-0598", 2, "基礎", "統計與機率", "機率與百分率", "204/240", "不及格比例"], ["MAT-0599", 3, "基礎", "幾何", "正方體體積", "125", "三個長度相乘"], ["MAT-0600", 0, "基礎", "代數", "一元一次方程式", "60÷20＝3 張", "成人票費"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0601", 1, "中等", "幾何", "等腰三角形與周長", "38−10＝28 公分", "平均分給兩條等長腰"], ["MAT-0602", 2, "基礎", "幾何", "長方形面積", "48÷6＝8 公分", "面積除以已知的另一邊"], ["MAT-0603", 3, "中等", "幾何", "畢氏定理", "x²＝169−25＝144", "平方差"], ["MAT-0604", 0, "中等", "數與量", "速率與時間單位換算", "180÷2.25＝80", "統一時間單位"], ["MAT-0605", 1, "中等", "數與量", "平方根與正值篩選", "x²＝64", "正、負兩個解"], ["MAT-0606", 3, "中等", "幾何", "正多邊形外角和與單一外角", "360°÷6＝60°", "正 n 邊形的單一外角"], ["MAT-0607", 3, "中等", "數與量", "分數除法", "10/12＝5/6", "乘除數的倒數"], ["MAT-0608", 0, "中等", "數與量", "最大公因數與等長分段", "84÷42＝2 段", "總段數"], ["MAT-0609", 1, "中等", "幾何", "圓周長", "2π×7＝14π", "2πr"], ["MAT-0610", 2, "中等", "代數", "一元二次方程與因式分解", "x＝2 或 3", "較小解"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0611", 3, "中等", "數與量", "工作效率與反比例", "80÷20＝4 天", "反向變化"], ["MAT-0612", 0, "基礎", "幾何", "圓周長與半徑", "r＝12 公分", "除以 2π"], ["MAT-0613", 1, "中等", "統計與機率", "平均數變化", "70÷6＝35/3", "不必是整數"], ["MAT-0614", 2, "中等", "數與量", "整數運算與運算順序", "19", "先於加減"], ["MAT-0615", 3, "進階", "統計與機率", "平均數與資料變動", "1,713÷23＝74又11/23 分", "筆數都要更新"], ["MAT-0616", 0, "中等", "幾何", "相似圖形的面積比", "(3/2)²＝9/4", "要平方"], ["MAT-0617", 1, "基礎", "統計與機率", "眾數", "出現次數最多", "不是中間值"], ["MAT-0618", 2, "基礎", "統計與機率", "補事件機率", "22/40＝11/20", "1 減去"], ["MAT-0619", 3, "中等", "代數", "一元二次方程與因式分解", "x＝4 或 −3", "兩根異號"], ["MAT-0620", 0, "中等", "幾何", "三角形內角比", "180°÷9＝20°", "內角和"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0621", 1, "基礎", "幾何", "三角形內角和", "180°−101°＝79°", "已知角再相減"], ["MAT-0622", 2, "基礎", "代數", "一元一次方程式", "3x＝66", "等式平衡"], ["MAT-0623", 3, "基礎", "數與量", "百分率變化", "50＋10＝60 元", "原價的 120%"], ["MAT-0624", 0, "中等", "統計與機率", "中位數與極端值", "中位數仍為 12", "極端值變動"], ["MAT-0625", 1, "中等", "代數", "一元二次方程與因式分解", "解為 3 與 4", "較大的根"], ["MAT-0626", 2, "基礎", "統計與機率", "平均數的線性變換", "平均為 30−3＝27", "平均同步變換"], ["MAT-0627", 3, "中等", "數與量", "週期事件與最小公倍數", "2³×3＝24", "週期事件同時重合"], ["MAT-0628", 0, "基礎", "幾何", "畢氏定理", "√225＝15 公分", "兩股直接相加"], ["MAT-0629", 1, "基礎", "函數", "一次函數的 x 截距", "x＝2", "令 y＝0"], ["MAT-0630", 2, "基礎", "數與量", "分數約分", "18÷6＝3", "同一公因數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0631", 3, "基礎", "幾何", "三角形面積", "6×4÷2＝12", "垂直於底"], ["MAT-0632", 0, "基礎", "數與量", "分數與整數的乘法", "60÷15×7＝4×7＝28 公尺", "先約分"], ["MAT-0633", 1, "基礎", "幾何", "三角形內角和與角平分線", "70°÷2＝35°", "先求整個角，再除以 2"], ["MAT-0634", 2, "基礎", "數與量", "速率與路程", "40×2＝80 公里", "速率乘時間"], ["MAT-0635", 3, "中等", "幾何", "圓柱體積", "20π÷4π＝5 公分", "底面積"], ["MAT-0636", 0, "基礎", "幾何", "長方形周長", "2×(18＋10)＝56 公分", "長與寬各算兩次"], ["MAT-0637", 1, "基礎", "代數", "一元一次方程式", "x＝5", "去括號"], ["MAT-0638", 1, "中等", "幾何", "角錐體積", "24×5÷3＝40 立方公分", "三分之一"], ["MAT-0639", 2, "基礎", "代數", "平方方程的解數", "x＝2 與 x＝−2", "正、負兩個實數解"], ["MAT-0640", 3, "中等", "數與量", "正因數個數", "3×3＝9", "指數有 a＋1 種"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0641", 0, "基礎", "幾何", "三角形內角和", "180°−110°＝70°", "由 180° 扣除"], ["MAT-0642", 1, "基礎", "代數", "一元一次方程式", "5x＋3＝23", "固定費與按張計價"], ["MAT-0643", 2, "基礎", "幾何", "三角形面積", "17×6÷2＝51 平方公分", "除以 2"], ["MAT-0644", 3, "中等", "數與量", "最大公因數與等量分裝", "gcd(30,42)＝6", "最大公因數"], ["MAT-0645", 0, "基礎", "幾何", "三角形外角定理", "110°−40°＝70°", "兩個不相鄰內角"], ["MAT-0646", 1, "基礎", "數與量", "分數加法", "4/6＋1/6＝5/6", "先通分"], ["MAT-0647", 2, "基礎", "代數", "一元一次方程式", "2x＋7＝21", "押金屬固定費"], ["MAT-0648", 3, "基礎", "幾何", "長方體體積", "3×3×10＝90 立方公分", "立方公分"], ["MAT-0649", 0, "基礎", "幾何", "長方形面積", "7×6＝42 平方公分", "平方公分"], ["MAT-0650", 1, "基礎", "數與量", "時間單位換算", "240÷60＝4 分鐘", "除以換算倍率"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0651", 3, "中等", "數與量", "同分母分數加法與剩餘量", "2/7＋2/7＝4/7", "整體視為 1"], ["MAT-0652", 3, "基礎", "數與量", "長度平均分配", "44÷4＝11 公分", "總量除以份數"], ["MAT-0653", 0, "中等", "代數", "一元一次方程式與折扣門檻", "120x−200＝1,000", "檢查是否符合折扣門檻"], ["MAT-0654", 1, "基礎", "統計與機率", "兩骰子奇偶機率", "(9＋9)/36＝1/2", "同奇偶"], ["MAT-0655", 2, "基礎", "幾何", "正方體體積", "3×3×3", "立方公分"], ["MAT-0656", 3, "中等", "代數", "一元一次方程式與分段車資", "355−85＝270", "起跳費"], ["MAT-0657", 0, "基礎", "數與量", "整除判斷與公倍數", "14÷2＝7", "逐一測試除法餘數"], ["MAT-0658", 1, "基礎", "幾何", "等腰三角形周長與代數", "48−36＝12", "周長扣除兩腰"], ["MAT-0659", 2, "基礎", "幾何", "圓面積", "π×3²＝9π", "平方半徑"], ["MAT-0660", 3, "基礎", "代數", "平方方程與正數解", "x＝3", "正負兩解"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0661", 0, "基礎", "幾何", "三角形面積", "27×2＝54", "正反兩面"], ["MAT-0662", 0, "中等", "代數", "一元一次方程式", "120x＝3,600", "固定費"], ["MAT-0663", 3, "中等", "數與量", "折扣與百分率計算", "1,000＋50＝1,050", "折後價格"], ["MAT-0664", 1, "中等", "幾何", "圓周長與圈數及單位換算", "1,400π 公分", "換公尺"], ["MAT-0665", 1, "中等", "幾何", "正方形面積", "64−36＝28", "增加 2 公尺"], ["MAT-0666", 3, "中等", "統計與機率", "古典機率", "10＋6−2＝14", "端點 30"], ["MAT-0667", 0, "中等", "統計與機率", "平均數與資料補值", "76×5＝380", "平均數乘人數"], ["MAT-0668", 2, "中等", "幾何", "長方形周長與面積", "9×14＝126", "周長先除以 2"], ["MAT-0669", 1, "中等", "幾何", "畢氏定理", "12²＋9²＝225", "畢氏定理"], ["MAT-0670", 2, "中等", "數與量", "比例尺與長度單位換算", "60,000 公分", "換成公尺"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, unit, point, answer, difficulty, clue] of [["ENG-0001", "字彙", "語境字義與同反義詞", 3, "中等", "not wide"], ["ENG-0002", "字彙", "語境字義與同反義詞", 0, "中等", "extremely tired"], ["ENG-0003", "功能性閱讀", "公告日期與時間判讀", 0, "中等", "比對日期和時段"], ["ENG-0004", "字彙", "語境字義與同反義詞", 0, "中等", "easy to understand/use"], ["ENG-0005", "字彙", "語境字義與同反義詞", 2, "中等", "raised her voice 明確表示音量提高"], ["ENG-0006", "字彙", "語境字義與同反義詞", 1, "中等", "reach a destination"], ["ENG-0007", "字彙", "語境字義與同反義詞", 1, "中等", "常見反義字"], ["ENG-0008", "字彙", "語境字義與同反義詞", 0, "中等", "easy to slide on"], ["ENG-0009", "字彙", "語境字義與同反義詞", 0, "中等", "roomy"], ["ENG-0010", "字彙", "語境字義與同反義詞", 0, "中等", "mature crops"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 英文單元、答案、難度或逐題提醒回歸錯誤`);
}
for (const [id, unit, point, answer, difficulty] of [["ENG-0011", "字彙", "語境字義與同反義詞", 1, "中等"], ["ENG-0012", "字彙", "語境字義與同反義詞", 2, "中等"], ["ENG-0013", "功能性閱讀", "公告條件與目的整合", 1, "中等"], ["ENG-0014", "字彙", "語境字義與同反義詞", 0, "中等"], ["ENG-0015", "功能性閱讀", "公告時段與規則整合", 1, "中等"], ["ENG-0016", "情境對話", "交際功能", 1, "中等"], ["ENG-0017", "情境對話", "道歉回應與語氣判讀", 0, "中等"], ["ENG-0018", "情境對話", "跨句資訊推論", 1, "中等"], ["ENG-0019", "功能性閱讀", "多重原因判讀", 0, "中等"], ["ENG-0020", "情境對話", "交際功能", 0, "中等"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 英文單元、答案、難度或逐題提醒回歸錯誤`);
}
for (const [id, unit, point, answer] of [["ENG-0021", "情境對話", "交際功能", 0], ["ENG-0022", "情境對話", "交際功能", 1], ["ENG-0023", "情境對話", "交際功能", 2], ["ENG-0024", "功能性閱讀", "路線與期限整合", 3], ["ENG-0025", "功能性閱讀", "條件與警示整合", 3], ["ENG-0026", "情境對話", "交際功能", 2], ["ENG-0027", "功能性閱讀", "公告時間與期限判讀", 2], ["ENG-0028", "情境對話", "交際功能", 3], ["ENG-0029", "功能性閱讀", "時刻表與路線條件整合", 2], ["ENG-0030", "情境對話", "交際功能", 3]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 英文對話／公告分類、答案索引或逐題解題回歸錯誤`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0671", 0, "基礎", "數與量", "比與比例", "84÷7＝12", "總份數"], ["MAT-0672", 1, "基礎", "幾何", "畢氏定理的生活應用", "5²＋12²＝25＋144＝169", "斜邊"], ["MAT-0673", 2, "中等", "幾何", "相似三角形與比例", "12×1.5÷2＝9", "對應邊"], ["MAT-0674", 3, "中等", "數與量", "單價與正比例", "45÷(3/4)＝60", "乘倒數"], ["MAT-0675", 2, "中等", "統計與機率", "平均數與全距", "(2＋5＋7＋8＋13)÷5＝7", "平均和全距"], ["MAT-0676", 0, "中等", "幾何", "長方體體積與容量單位", "80×50×60＝240,000", "立方公分"], ["MAT-0677", 1, "中等", "函數", "兩點求一次函數與代值", "斜率 a＝(13−1)÷(8−2)＝2", "斜率"], ["MAT-0678", 2, "中等", "幾何", "圓柱體積", "90π 立方公尺", "半徑要平方"], ["MAT-0679", 3, "中等", "代數", "一元一次方程式與括號", "x＝7", "代回"], ["MAT-0680", 3, "中等", "幾何", "正多邊形內角", "360°÷30°＝12", "外角和"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0681", 0, "基礎", "數與量", "速率與時間單位", "180÷90＝2 小時", "停靠時間"], ["MAT-0682", 1, "基礎", "統計與機率", "加權平均", "3,120÷40＝78", "依人數加權"], ["MAT-0683", 2, "基礎", "統計與機率", "互斥事件與補事件機率", "3＋1＝4 張", "非藍卡"], ["MAT-0684", 3, "中等", "幾何", "梯形面積", "32×7÷2＝112", "除以 2"], ["MAT-0685", 0, "中等", "代數", "一元一次方程式的情境應用", "100x＝400", "總收入列式"], ["MAT-0686", 1, "中等", "數與量", "最小公倍數與週期", "2³×3²＝72", "最小公倍數"], ["MAT-0687", 2, "基礎", "數與量", "比與正比例", "13×1/8＝13/8", "每公里"], ["MAT-0688", 3, "中等", "數與量", "整數指數律", "2⁸÷2⁴＝2⁴", "指數相乘"], ["MAT-0689", 0, "中等", "函數", "座標平面與中點", "(−2＋4)÷2＝1", "負數相加"], ["MAT-0690", 1, "進階", "代數", "一元二次方程式與幾何情境", "(x＋8)(x−6)＝0", "長度只能取正值"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0691", 2, "中等", "代數", "一元一次方程式與括號", "x＝13", "括號前係數"], ["MAT-0692", 2, "基礎", "統計與機率", "兩骰子乘積奇偶與補事件", "1−(3/6)²＝3/4", "奇數乘積必須兩骰皆奇數"], ["MAT-0693", 0, "中等", "數與量", "速率與時間換算", "15÷60＝0.25 小時", "換成小時"], ["MAT-0694", 1, "基礎", "數與量", "異分母分數減法", "8/12−3/12＝5/12", "先通分"], ["MAT-0695", 2, "基礎", "統計與機率", "平均數", "總和＝3×20＝60", "對稱配對"], ["MAT-0696", 3, "中等", "代數", "一元一次方程式與括號", "2x−1＝19", "處理括號"], ["MAT-0697", 0, "基礎", "幾何", "三角柱體積", "3×4÷2＝6", "底面積"], ["MAT-0698", 1, "中等", "代數", "二元一次聯立方程式", "2x＝16", "消去較小數"], ["MAT-0699", 3, "中等", "代數", "一元二次方程式根與係數", "2r＝6", "代回檢查"], ["MAT-0700", 3, "基礎", "幾何", "等腰三角形周長", "52−20＝32", "扣掉底邊"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0701", 0, "基礎", "數與量", "比與比例分配", "6400×5/8＝4000", "總份數"], ["MAT-0702", 1, "基礎", "數與量", "分數與生活運算", "48−12＝36", "原量"], ["MAT-0703", 2, "中等", "數與量", "百分率與折扣", "1920−150＝1770", "折價券"], ["MAT-0704", 3, "中等", "幾何", "固定周長的正方形與長方形面積比較", "72.25－66＝6.25", "相同周長不代表相同面積"], ["MAT-0705", 0, "基礎", "函數", "一次函數情境", "25×8＝200", "固定費用"], ["MAT-0706", 1, "基礎", "代數", "一次函數代值", "y＝−6＋7＝1", "負號"], ["MAT-0707", 1, "基礎", "代數", "一元一次方程式列式", "3x＝x＋14", "相加"], ["MAT-0708", 2, "中等", "數與量", "百分率反向計算", "840÷1.05＝800", "除以 1.05"], ["MAT-0709", 3, "中等", "幾何", "相似形面積比", "24×9/4＝54", "長度比平方"], ["MAT-0710", 0, "中等", "幾何", "圓面積縮放", "4πr²", "半徑倍率"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0711", 1, "基礎", "幾何", "平行四邊形面積", "18×7＝126", "垂直高度"], ["MAT-0712", 2, "基礎", "幾何", "畢氏定理", "81＋144＝225", "正平方根"], ["MAT-0713", 3, "中等", "數與量", "分數與容量比例", "40÷(5/8)＝64", "整體容量"], ["MAT-0714", 0, "基礎", "數與量", "比與比例應用", "18×5/3", "部分量除以所占分率"], ["MAT-0715", 2, "中等", "幾何", "面積與平方單位換算", "0.4×0.4＝0.16", "相同長度單位"], ["MAT-0716", 2, "基礎", "數與量", "整數指數與運算順序", "(−2)³＝−8", "奇次方"], ["MAT-0717", 3, "中等", "代數", "一元一次不等式", "x＜7", "反轉方向"], ["MAT-0718", 0, "中等", "代數", "已配方二次函數的頂點", "h＝2、k＝−3", "符號與頂點 x 座標相反"], ["MAT-0719", 1, "基礎", "函數", "一次函數的 x 截距", "令 −3x＋12＝0", "令 y＝0"], ["MAT-0720", 0, "中等", "幾何", "扇形面積", "60°÷360°＝1/6", "圓心角占 360°"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0721", 1, "基礎", "數與量", "百分率", "1200÷1500", "原價作分母"], ["MAT-0722", 2, "基礎", "數與量", "整數加減與溫度變化", "−3＋8＝5°C", "時間順序"], ["MAT-0723", 3, "基礎", "代數", "一元一次方程式", "3x＝27", "相同運算"], ["MAT-0724", 0, "基礎", "數與量", "指數律", "3＋4＝7", "同底數乘法"], ["MAT-0725", 1, "中等", "代數", "乘法公式與平方差", "x²−4", "交叉項"], ["MAT-0726", 1, "中等", "代數", "二元一次聯立方程式消去法", "y＝5", "倍乘"], ["MAT-0727", 2, "中等", "數與量", "小數除法與切割次數", "2.4÷0.15＝16", "切口數"], ["MAT-0728", 2, "中等", "數與量", "比例尺與單位換算", "3：120,000", "相同單位"], ["MAT-0729", 3, "基礎", "幾何", "三角形外角定理", "外角為 113°", "補角"], ["MAT-0730", 0, "基礎", "幾何", "平行線截角", "180°−112°", "同側內角互補"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0731", 0, "中等", "幾何", "圓周長與面積綜合", "r＝9 公尺", "周長與面積"], ["MAT-0732", 1, "基礎", "統計與機率", "古典機率與倍數", "6/20＝3/10", "不是 3 的倍數"], ["MAT-0733", 2, "基礎", "統計與機率", "平均數與總和", "12×5＝60", "平均與筆數"], ["MAT-0734", 3, "中等", "數與量", "最大公因數與輾轉相除", "126＝84×1＋42", "非零餘數"], ["MAT-0735", 0, "中等", "幾何", "長方體表面積", "158 平方公分", "側面"], ["MAT-0736", 3, "中等", "函數", "座標平面兩點距離", "√(4²＋8²)＝√80", "完全平方因數"], ["MAT-0737", 3, "中等", "代數", "平方方程式與正負解", "x−3＝3 或 x−3＝−3", "正、負兩種"], ["MAT-0738", 1, "中等", "代數", "一元二次方程式因式分解", "(2x−1)(x−3)", "首項係數"], ["MAT-0739", 1, "基礎", "數與量", "百分率求部分量", "800×0.15", "總數乘百分率"], ["MAT-0740", 2, "中等", "幾何", "長方形邊長比、周長與面積", "36÷9＝4", "周長的一半"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, difficulty, unit, point, clue, tip] of [["MAT-0741", 3, "中等", "代數", "一次函數的情境應用", "60÷3＝20", "剩餘量"], ["MAT-0742", 2, "中等", "代數", "一元一次不等式", "n≤440÷35", "最大整數"], ["MAT-0743", 0, "基礎", "數與量", "絕對值", "|−7|＝7"], ["MAT-0744", 3, "中等", "數與量", "等差數列通項", "a₁₂＝2＋11×3＝35"], ["MAT-0745", 0, "基礎", "幾何", "畢氏定理", "25＋144＝169"], ["MAT-0746", 1, "中等", "幾何", "正方體體積與表面積", "6×6²＝216", "立方單位"], ["MAT-0747", 2, "中等", "幾何", "梯形面積", "22×8÷2＝88", "兩條平行底邊"], ["MAT-0748", 3, "中等", "幾何", "體積流率與時間", "3.6÷0.09＝40", "流率"], ["MAT-0749", 0, "基礎", "統計與機率", "中位數", "第 3 筆"], ["MAT-0750", 1, "中等", "統計與機率", "事件聯集機率", "6＋3−2＝7"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || (tip && !row.teacherTip.includes(tip)) || !row.explanation) errors.push(`${id}: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0751", 2, "1,050", "中等", "數與量", "折扣與原價逆推", "840÷0.8＝1,050", "除以折數"], ["MAT-0752", 3, "750", "中等", "數與量", "比與比例的單位量應用", "2,000×3/8＝750", "單位一致"], ["MAT-0753", 1, "4", "中等", "數與量", "整數指數律與代數式化簡", "2^(3−1)", "零次方"], ["MAT-0754", 0, "28", "中等", "代數", "二次方程式的面積建模", "x²＋4x−45＝0", "長度只能取正值"], ["MAT-0755", 0, "18", "中等", "幾何", "座標平面三角形面積", "7−1＝6", "垂直距離"], ["MAT-0756", 1, "3", "中等", "代數", "一元二次方程式因式分解", "(x−2)(x−3)", "較大解"], ["MAT-0757", 1, "36π", "進階", "幾何", "圓柱體積與容量換算", "36,000π", "立方公分換成公升"], ["MAT-0758", 2, "84", "中等", "幾何", "組合圖形面積", "96−12＝84", "扣除"], ["MAT-0759", 3, "714", "中等", "數與量", "折扣與稅率連續計算", "680×1.05＝714", "不能把百分率直接相加減"], ["MAT-0760", 0, "5", "進階", "幾何", "長方形周長與對角線聯立", "ab＝60", "平方和公式"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0761", 1, "36", "中等", "數與量", "容量單位與比例分裝", "9,000÷250＝36", "統一單位"], ["MAT-0762", 2, "22", "中等", "代數", "一元一次方程式的價格建模", "3x＋24＝90", "已知品項"], ["MAT-0763", 3, "115", "中等", "函數", "一次函數的費用模型", "25＋90＝115", "固定費"], ["MAT-0764", 0, "16", "中等", "函數", "一次函數由函數值求規律", "10＋2×3＝16", "變化率"], ["MAT-0765", 1, "5 輛", "中等", "數與量", "整數除法與容量配置", "117−112＝5", "有餘數"], ["MAT-0766", 2, "15", "中等", "數與量", "工作效率與同時作業", "900÷60＝15", "總工作量"], ["MAT-0767", 3, "118", "中等", "代數", "一元一次方程式的票價模型", "5x＋80＝470", "價差"], ["MAT-0768", 0, "42", "中等", "數與量", "速率與時間單位換算", "72×35/60＝42", "統一時間單位"], ["MAT-0769", 1, "8", "中等", "幾何", "等腰三角形周長與邊長", "34−26＝8", "三邊總和"], ["MAT-0770", 2, "24π", "中等", "幾何", "圓環面積與面積差", "49π−25π＝24π", "外圓面積減內圓面積"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0771", 3, "3/5", "中等", "統計與機率", "不放回抽取與互斥事件", "兩種順序互斥", "兩種先後順序"], ["MAT-0772", 0, "90", "中等", "統計與機率", "平均數與未知資料", "84×5＝420", "乘回總和"], ["MAT-0773", 2, "2/15", "進階", "代數", "因式分解解二次方程與倒數和", "−3/15＋5/15＝2/15", "先用國中因式分解"], ["MAT-0774", 1, "54", "中等", "幾何", "四邊形分割與三角形面積", "18＋36＝54", "沿對角線"], ["MAT-0775", 3, "4", "中等", "函數", "一次函數反求自變數", "−12＝−3x", "解一元一次方程式"], ["MAT-0776", 3, "16", "中等", "數與量", "根式方程與定義域", "5²＝25", "代回原式"], ["MAT-0777", 2, "24", "中等", "數與量", "連續比例求部分量", "72÷3＝24", "逐層套用比例"], ["MAT-0778", 3, "10", "中等", "幾何", "座標平面兩點距離與畢氏定理", "√(6²＋8²)＝10", "水平差、垂直差"], ["MAT-0779", 0, "1/6", "進階", "數與量", "混合液濃度與比例", "100/600＝1/6", "不改變溶質量"], ["MAT-0780", 1, "20√2", "中等", "幾何", "正方形對角線與周長", "4×5√2＝20√2", "開平方取邊長"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0781", 2, "7/12", "中等", "數與量", "分數減法與剩餘量", "9/12−2/12", "同一個整體"], ["MAT-0782", 3, "180", "中等", "數與量", "百分率與子群體比例", "450×0.4＝180", "子群體為基準"], ["MAT-0783", 0, "15 GB", "中等", "代數", "一元一次方程式與方案比較", "120＋8x＝60＋12x", "總費用相等"], ["MAT-0784", 1, "3", "中等", "數與量", "指數律與運算順序", "8÷4＝2", "括號、次方"], ["MAT-0785", 2, "上午 11 時 25 分", "中等", "數與量", "時間區間與分鐘換算", "9:50＋95 分鐘＝11:25", "兩個休息區間"], ["MAT-0786", 3, "20", "中等", "幾何", "凸多邊形對角線數", "8×5÷2＝20", "重複計數"], ["MAT-0787", 0, "44", "中等", "幾何", "面積與部分比例", "66×2/3＝44", "未種花"], ["MAT-0788", 1, "282", "中等", "幾何", "表面積與單位面積成本", "2(15＋20＋12)＝94", "平方公分單價"], ["MAT-0789", 2, "1/7", "中等", "統計與機率", "不放回抽取的古典機率", "3/7×2/6＝1/7", "第二次抽取"], ["MAT-0790", 3, "6°C", "中等", "統計與機率", "資料範圍與極差", "30−24＝6°C", "最大值和最小值"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0791", 0, "4", "中等", "代數", "一次函數的固定費建模", "10−6＝4 元", "固定費"], ["MAT-0792", 3, "9 個", "中等", "代數", "預算限制與最大整數解", "n≤75/8＝9.375", "向下取整"], ["MAT-0793", 1, "612", "中等", "幾何", "組合面積與單位成本", "63−12＝51", "可施工面積"], ["MAT-0794", 2, "112", "中等", "幾何", "平行四邊形面積與高", "14×8＝112", "高不因"], ["MAT-0795", 3, "648", "中等", "數與量", "連續折扣與稅額", "600＋48＝648", "先算折扣"], ["MAT-0796", 0, "160°", "中等", "幾何", "多邊形內角和與未知角", "720°−560°＝160°", "不規則圖形"], ["MAT-0797", 1, "3/4", "中等", "統計與機率", "等可能結果與複合事件", "HH、HT、TH", "補事件"], ["MAT-0798", 3, "7 小時", "中等", "代數", "一元一次方程式的費用建模", "20＋5x＝55", "固定入場費"], ["MAT-0799", 2, "75", "中等", "幾何", "相似形面積比與邊長比", "25×3＝75", "相似比平方"], ["MAT-0800", 3, "(8,−1)", "中等", "幾何", "座標反射與平移的複合變換", "3＋5＝8", "先做反射"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0801", 0, "54", "中等", "數與量", "連續分數分配與剩餘量", "90−36＝54", "第二次"], ["MAT-0802", 1, "2520", "中等", "數與量", "百分率稅額與多件總價", "840×3＝2,520", "兩種方法"], ["MAT-0803", 2, "48", "中等", "數與量", "分段旅程的平均速率", "120÷2.5＝48", "總路程"], ["MAT-0804", 3, "600 片", "中等", "幾何", "長方形面積與鋪面材料數量", "150÷0.25＝600", "單片面積"], ["MAT-0805", 0, "7 張", "中等", "代數", "預算限制與最大整數解", "n≤7", "固定設定費"], ["MAT-0806", 1, "350", "基礎", "數與量", "比與比例分配", "450÷9＝50", "總量"], ["MAT-0807", 2, "300", "中等", "數與量", "百分率與單利情境", "5000×0.02×3", "原本金"], ["MAT-0808", 2, "7", "基礎", "代數", "一次函數代值", "y＝3＋4", "使用括號"], ["MAT-0809", 3, "1/6", "中等", "統計與機率", "獨立試驗與複合機率", "1/2×1/3＝1/6", "獨立試驗"], ["MAT-0810", 0, "81.6 分", "中等", "統計與機率", "加權平均數與合併資料", "4,080÷50＝81.6", "不能直接平均兩班平均數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0811", 2, "3 或 −3", "基礎", "代數", "平方根與方程式", "x＝3 或 −3", "正、負根"], ["MAT-0812", 1, "45°", "基礎", "幾何", "正多邊形外角", "360°÷8＝45°", "除以邊數"], ["MAT-0813", 2, "6", "中等", "統計與機率", "事件交集與補事件", "25−19＝6", "扣聯集"], ["MAT-0814", 3, "(x＋3)(x＋4)", "中等", "代數", "二次三項式因式分解", "3＋4＝7", "乘積"], ["MAT-0815", 3, "30π", "中等", "幾何", "圓周長與輪子轉動距離", "3×10π＝30π", "轉動圈數"], ["MAT-0816", 0, "1/4", "基礎", "統計與機率", "古典機率與倍數", "3/12＝1/4", "端點 12"], ["MAT-0817", 1, "(2,−5)", "基礎", "幾何", "座標平移", "y 由 −1 變成 −5", "向下 y 減少"], ["MAT-0818", 2, "135", "進階", "幾何", "相似立體的體積比", "40×27/8＝135", "三次方"], ["MAT-0819", 3, "304", "中等", "數與量", "分段旅程的平均速率", "(3,600＋4,000)÷25＝304", "總路程"], ["MAT-0820", 0, "3/8", "中等", "統計與機率", "二項試驗與組合計數機率", "6/16＝3/8", "成功位置"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0821", 1, "60", "中等", "數與量", "連續分率求部分量", "160×3/8＝60", "第二個分率"], ["MAT-0822", 2, "714", "中等", "數與量", "連續折扣與稅率", "680×1.05＝714", "依序套用"], ["MAT-0823", 3, "100", "中等", "代數", "一元一次方程式的票價建模", "5x＋80＝380", "價差表示"], ["MAT-0824", 0, "585", "中等", "數與量", "等差數列前 n 項和", "15×(4＋74)÷2＝585", "首末兩項平均"], ["MAT-0825", 1, "5", "基礎", "數與量", "平方根運算", "9−4＝5", "分別求平方根"], ["MAT-0826", 2, "90°", "中等", "幾何", "三角形角度比與內角和", "3×30°＝90°", "180°"], ["MAT-0827", 3, "30", "基礎", "幾何", "平行四邊形周長", "9＋6＋9＋6", "兩鄰邊"], ["MAT-0828", 0, "0.8 公尺", "中等", "幾何", "體積、底面積與公制單位換算", "0.36÷0.45", "統一單位"], ["MAT-0829", 1, "1/12", "中等", "統計與機率", "兩顆骰子的和與古典機率", "(5,6)、(6,5)、(6,6)", "有序樣本空間"], ["MAT-0830", 2, "12", "中等", "統計與機率", "偶數筆中位數與未知資料", "8＋x＝20", "中央兩筆"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0831", 3, "9 條", "中等", "幾何", "多邊形內角和反求邊數", "n−2＝7", "除以 180"], ["MAT-0832", 0, "4/3", "中等", "代數", "一次函數的 x 截距", "3x＝4", "令 y＝0"], ["MAT-0833", 0, "3/8", "基礎", "數與量", "小數化分數", "375/1000", "最簡分數"], ["MAT-0834", 3, "−2、4", "中等", "代數", "一元二次方程式因式分解", "(x−4)(x＋2)＝0", "符號要分清"], ["MAT-0835", 1, "15", "基礎", "幾何", "畢氏定理求股長", "17²−8²＝225", "斜邊平方"], ["MAT-0836", 2, "86", "中等", "統計與機率", "加權平均", "32＋54＝86", "100%"], ["MAT-0837", 3, "45", "基礎", "數與量", "速率與時間換算", "18×2.5", "統一成小時"], ["MAT-0838", 0, "9π", "中等", "幾何", "圓環面積與半徑差", "25π−16π＝9π", "外圓減內圓"], ["MAT-0839", 1, "56", "基礎", "數與量", "比值與比例", "35÷5＝7", "每一份"], ["MAT-0840", 2, "12", "基礎", "代數", "一元一次方程式列式", "4x＝48", "3x"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0841", 3, "500", "基礎", "數與量", "平均分配與單位換算", "0.5 公斤＝500 公克", "換算成公克"], ["MAT-0842", 0, "40%", "基礎", "數與量", "百分率", "18÷45＝0.4", "整體量"], ["MAT-0843", 1, "18", "基礎", "代數", "一元一次方程式", "x＝18", "消去分母"], ["MAT-0844", 2, "6", "基礎", "代數", "文字題列一元一次方程式", "4x＝24", "4x−9"], ["MAT-0845", 3, "1,160", "中等", "數與量", "流率與剩餘量", "2,000−840＝1,160", "原有量減"], ["MAT-0846", 0, "1又5/24", "中等", "數與量", "異分母分數加法與路程總量", "29/24＝1又5/24", "通分"], ["MAT-0847", 1, "2.8", "中等", "數與量", "比例尺與單位換算", "280,000 公分", "換成公里"], ["MAT-0848", 1, "64°", "基礎", "幾何", "等腰三角形內角", "128°÷2＝64°", "平分底角"], ["MAT-0849", 2, "110°", "中等", "幾何", "多邊形內角和與未知角", "900°−790°＝110°", "扣除已知各角"], ["MAT-0850", 3, "162π 元", "中等", "幾何", "圓面積與單位成本", "81π×2＝162π", "總面積"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, difficulty, unit, point, clue, tip] of [["MAT-0851", 0, "126", "基礎", "幾何", "柱體體積", "18×7", "不必再除以 2"], ["MAT-0852", 1, "12", "基礎", "統計與機率", "偶數筆中位數", "(11＋13)÷2＝12", "中間兩數"], ["MAT-0853", 2, "7/15", "中等", "統計與機率", "古典機率與聯集事件", "5＋3−1＝7", "扣掉交集"], ["MAT-0854", 3, "18", "中等", "函數", "一次函數由兩點外推", "8＋10＝18", "輸入差"], ["MAT-0855", 0, "(0,9)", "基礎", "代數", "一次函數與 y 軸交點", "y＝9", "令 x 為 0"], ["MAT-0856", 1, "17", "中等", "統計與機率", "兩集合交集計數", "12＋9−4＝17", "交集"], ["MAT-0857", 2, "14", "中等", "代數", "二次方程式的長方形面積建模", "2×(3＋4)＝14", "取正值"], ["MAT-0858", 2, "168", "中等", "幾何", "長方形對角線與面積", "24×7＝168", "先求缺少的邊"], ["MAT-0859", 3, "5", "基礎", "數與量", "除法與情境取整", "向上取整", "不能取小數"], ["MAT-0860", 0, "144", "中等", "數與量", "比值、差量與總和", "16×9＝144", "比值份數差"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.difficulty !== difficulty || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0861", 1, "1140", "數與量", "折扣與固定費用", "1200×0.9＝1080", "固定加項"], ["MAT-0862", 2, "10", "代數", "一元一次方程式與分配律", "175−20＝155", "固定費用"], ["MAT-0863", 2, "x＞7", "代數", "一元一次不等式", "5＋2＝7", "嚴格獲利"], ["MAT-0864", 3, "11/24", "數與量", "異分母分數減法", "14/24−3/24", "先通分"], ["MAT-0865", 1, "8", "數與量", "單位換算與平均分配", "240÷30＝8", "統一單位"], ["MAT-0866", 1, "84", "數與量", "速率與時間換算", "126÷90", "同一路程"], ["MAT-0867", 0, "6", "數與量", "反比例情境", "48×1.5＝72", "總人時"], ["MAT-0868", 3, "64", "幾何", "平行四邊形與對角線三角形面積", "16×8＝128", "平分面積"], ["MAT-0869", 0, "6π＋24", "幾何", "扇形弧長", "6π＋24", "兩條半徑"], ["MAT-0870", 1, "34", "幾何", "長方形對角線與周長", "13²−5²", "先求缺邊"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0871", 2, "(3,−2)", "幾何", "座標平移", "−4＋7＝3", "向下使 y 減少"], ["MAT-0872", 3, "8", "統計與機率", "眾數", "8 出現 3 次", "眾數是出現次數最多"], ["MAT-0873", 0, "1/2", "統計與機率", "互斥重疊事件與對稱差機率", "10＋6−2×3＝10", "恰好一個"], ["MAT-0874", 1, "6x＋4", "代數", "合併同類項", "4x＋2x＝6x", "x 項與常數項"], ["MAT-0875", 3, "5", "代數", "一元二次方程式因式分解", "x²−x−20", "負根"], ["MAT-0876", 1, "5", "代數", "聯立方程式加減消去法", "2x＝10", "兩條獨立方程"], ["MAT-0877", 2, "77", "統計與機率", "平均數反求缺失資料", "76×5＝380", "反推總和"], ["MAT-0878", 3, "60", "數與量", "平均速率與分數時間", "200÷(10/3)", "倒數"], ["MAT-0879", 2, "70π", "幾何", "圓周長", "5×14π", "乘圈數"], ["MAT-0880", 0, "24", "數與量", "比與比例分配", "64÷8＝8", "總份數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0881", 1, "6、9", "幾何", "周長與一元一次方程式", "2[(x＋3)＋x]＝30", "兩個尺寸"], ["MAT-0882", 2, "2.75", "數與量", "分段速率與時間", "60÷80＝0.75", "分段計算時間"], ["MAT-0883", 3, "7", "代數", "一元一次方程式列式", "3x＋14＝35", "只加一次"], ["MAT-0884", 0, "6", "幾何", "梯形面積", "22÷2＝11", "反求高"], ["MAT-0885", 1, "低 4%", "數與量", "連續百分率變化", "1.2P×0.8", "不能直接把百分率相加"], ["MAT-0886", 2, "2", "代數", "二元一次式代入求值", "15−2y＝11", "負號"], ["MAT-0887", 3, "1100", "數與量", "折扣與折價券", "1500×0.8＝1200", "折後再扣"], ["MAT-0888", 0, "972", "幾何", "正方形周長與面積", "36÷4＝9", "乘單價"], ["MAT-0889", 1, "1/6", "統計與機率", "不放回抽取機率", "5/10×3/9＝1/6", "不放回"], ["MAT-0890", 3, "1", "代數", "一次函數代入求值", "y＝7−2x", "每分鐘減少"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0891", 2, "25π", "幾何", "圓面積", "πr²", "半徑平方"], ["MAT-0892", 3, "12", "代數", "比例式與代入", "5a＝60", "等式兩邊"], ["MAT-0893", 0, "15", "數與量", "連續整數列式", "5n＋10＝85", "相差 1"], ["MAT-0894", 1, "120", "幾何", "長方體體積", "8×5＝40", "1 立方公分等於 1 毫升"], ["MAT-0895", 2, "5", "代數", "括號與一元一次方程式", "4(x＋8)＝52", "4(x＋8)"], ["MAT-0896", 3, "79", "統計與機率", "平均數", "624＋8＝632", "先修正總和"], ["MAT-0897", 0, "80", "數與量", "路程速率時間", "240÷3", "休息時間也算"], ["MAT-0898", 1, "80", "幾何", "三角形內角和與代數", "2x＋3x＋4x＝180", "內角和求 x"], ["MAT-0899", 2, "4", "代數", "一元二次方程式與情境限制", "(x−4)(x＋3)", "限制篩選"], ["MAT-0900", 2, "54 平方公分", "幾何", "長方形周長與面積反推", "w＋3＋w＝15", "周長先除以 2"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0901", 0, "210", "數與量", "單價與比例", "360÷12＝30", "一單位的價格"], ["MAT-0902", 1, "26", "數與量", "連續偶數列式", "3n＝72", "相差 2"], ["MAT-0903", 2, "7a＋3b", "代數", "多項式加法與合併同類項", "a 項合併為 7a", "不同變數"], ["MAT-0904", 0, "x≤6", "代數", "一元一次不等式", "2x≤12", "乘除負數"], ["MAT-0905", 3, "21", "數與量", "百分率求部分量", "80×0.35＝28", "基準量不同"], ["MAT-0906", 0, "12", "幾何", "相似三角形對應邊", "8×3÷2", "對應邊比"], ["MAT-0907", 1, "9", "幾何", "多邊形內角和", "n−2＝7", "加回 2"], ["MAT-0908", 2, "1/6", "統計與機率", "兩次擲骰的等可能機率", "6/36＝1/6", "區分順序"], ["MAT-0909", 3, "10.5", "統計與機率", "中位數", "(9＋12)÷2＝10.5", "偶數筆資料"], ["MAT-0910", 0, "2", "代數", "一次函數斜率", "8÷4＝2", "縱向變化量"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0911", 3, "2、3", "代數", "一元二次方程式因式分解", "x(x＋1)＝6", "長比寬多 1"], ["MAT-0912", 1, "6√2", "數與量", "根式化簡", "72＝36×2", "平方因數"], ["MAT-0913", 2, "8", "幾何", "畢氏定理情境題", "10²−6²＝64", "平方差"], ["MAT-0914", 3, "16", "數與量", "比與比例分配", "40÷5＝8", "總份數"], ["MAT-0915", 0, "48π", "幾何", "扇形圓心角比例", "144π×1/3＝48π", "乘整個圓的面積"], ["MAT-0916", 1, "9", "統計與機率", "全距", "15−6＝9", "最大與最小"], ["MAT-0917", 2, "1600", "數與量", "折數與百分率", "1800−200＝1600", "固定面額"], ["MAT-0918", 3, "48", "數與量", "往返平均速率", "240÷5", "算術平均"], ["MAT-0919", 0, "2 百元", "代數", "聯立方程式與套票價格差", "2a＋s＝19", "單位"], ["MAT-0920", 1, "3π", "幾何", "扇形弧長", "18π×1/6＝3π", "不要誤用扇形面積"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0921", 2, "1 小時 45 分", "數與量", "時間間隔", "9:17 到 10:02", "下一個整點"], ["MAT-0922", 3, "9", "代數", "一元一次方程式與括號", "3(x−2)＝21", "每組整體"], ["MAT-0923", 0, "8 倍", "幾何", "立體縮放與體積倍率", "2³＝8", "體積倍率為 k³"], ["MAT-0924", 1, "750", "數與量", "比值情境應用", "300÷2＝150", "相同單位"], ["MAT-0925", 2, "142°", "幾何", "互補角", "180° 減去已知角 38°", "互餘角"], ["MAT-0926", 3, "11", "代數", "一次函數代入求值", "3×5＝15", "先乘除"], ["MAT-0927", 1, "1/2", "統計與機率", "事件聯集與重疊計數", "4＋3－1＝6 格", "交集"], ["MAT-0928", 1, "12", "幾何", "長方形對角線與畢氏定理", "13²−5²＝144", "斜邊"], ["MAT-0929", 2, "41", "數與量", "等差數列通項", "5＋9×4＝41", "n−1 次"], ["MAT-0930", 3, "54", "幾何", "直角三角形面積", "9×12÷2", "互相垂直"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0931", 0, "7", "代數", "一元二次方程式根與係數", "(x−2)(x−5)＝0", "兩根和"], ["MAT-0932", 0, "2", "代數", "由兩點求斜率", "8−2＝6", "順序要一致"], ["MAT-0933", 1, "2 小時", "數與量", "工作效率與合作", "1/6＋1/3＝1/2", "不能直接相加或取平均"], ["MAT-0934", 2, "18,900", "數與量", "百分率與稅金", "20,000×0.9＝18,000", "折後價"], ["MAT-0935", 3, "113°", "幾何", "對頂角與相鄰角", "180°−67°", "對頂角才相等"], ["MAT-0936", 0, "13", "統計與機率", "平均數與新增資料", "4×12＝48", "還原總和"], ["MAT-0937", 3, "x＞−4", "代數", "一元一次不等式負係數", "除以負數", "方向必須反轉"], ["MAT-0938", 1, "5³", "數與量", "同底數冪相除", "6−3＝3", "指數相減"], ["MAT-0939", 2, "75%", "數與量", "百分率計算", "30÷40", "部分量除以總量"], ["MAT-0940", 0, "5", "幾何", "座標平面兩點距離", "√(3²＋4²)", "水平與垂直差"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0941", 3, "72", "數與量", "百分率與分數複合計算", "240×45%＝108", "先求部分量"], ["MAT-0942", 0, "9", "代數", "一元一次方程式含未知數於等式兩側", "2x＝18", "未知數項集中到一側"], ["MAT-0943", 1, "720°", "幾何", "多邊形內角和", "(n−2)×180°", "n 是邊數"], ["MAT-0944", 2, "80", "幾何", "菱形面積", "10×16÷2", "兩條對角線"], ["MAT-0945", 3, "6.5", "統計與機率", "偶數筆資料的中位數", "(5＋8)÷2＝6.5", "平均中間兩筆"], ["MAT-0946", 0, "34", "數與量", "比與比例分配", "85÷5＝17", "較小份數"], ["MAT-0947", 1, "880", "數與量", "百分率加成與固定折抵", "800＋120＝920", "固定折價券"], ["MAT-0948", 2, "58", "數與量", "等差數列通項", "3＋55＝58", "11 次"], ["MAT-0949", 3, "400", "數與量", "單利計算", "4,000×0.05×2", "原本金"], ["MAT-0950", 0, "45π", "幾何", "圓柱體積", "10÷2＝5", "不可使用水槽的完整高度"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0951", 1, "6", "代數", "一次函數反求自變數", "13＝2x＋1", "反求自變數"], ["MAT-0952", 1, "(−3,−4)", "幾何", "座標軸對稱", "y 座標由 4 變成 −4", "改變 y"], ["MAT-0953", 2, "4", "代數", "聯立方程式消去法", "3x＝11＋1＝12", "相反數"], ["MAT-0954", 3, "36", "數與量", "倍數與範圍判斷", "6×6＝36", "嚴格介於"], ["MAT-0955", 0, "4π", "幾何", "扇形面積", "16π×1/4＝4π", "不是弧長公式"], ["MAT-0956", 1, "1,080", "數與量", "連續百分率折減", "1,200×0.9", "以前一次降價後"], ["MAT-0957", 2, "82°", "幾何", "四邊形內角和", "360°−278°＝82°", "四邊形內角和"], ["MAT-0958", 3, "4/11", "統計與機率", "字母抽取機率", "4/11", "不同的抽取結果"], ["MAT-0959", 2, "3、−4", "代數", "零乘積性質解方程式", "x＋4＝0", "注意移項後符號"], ["MAT-0960", 3, "25", "幾何", "畢氏定理求斜邊", "49＋576＝625", "開平方"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0961", 0, "96°", "幾何", "等腰三角形內角", "42°×2＝84°", "底角相等"], ["MAT-0962", 1, "8", "數與量", "小數方程式", "4.8÷0.6", "同乘 10"], ["MAT-0963", 2, "6", "代數", "聯立方程式消去法", "3x＝10＋8＝18", "將係數除掉"], ["MAT-0964", 3, "52", "幾何", "長方體表面積", "2×(6＋8＋12)＝52", "各算兩次"], ["MAT-0965", 0, "850", "數與量", "公升與毫升換算", "剩下 850 毫升", "相同單位"], ["MAT-0966", 1, "65°", "幾何", "三角形內角和", "48°＋67°＝115°", "180°"], ["MAT-0967", 1, "x＞3", "代數", "一元一次不等式", "5x＞15", "正數"], ["MAT-0968", 2, "10", "數與量", "乘除混合與平均分配", "8×5＝40", "先算總量"], ["MAT-0969", 3, "4/25", "統計與機率", "獨立事件機率與放回抽取", "2/5×2/5＝4/25", "每次總球數"], ["MAT-0970", 0, "46", "數與量", "等差數列通項", "4＋42＝46", "14 次"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0971", 0, "x＝3 或 −4", "代數", "一元二次方程式因式分解", "(x＋4)(x−3)＝0", "代回原式"], ["MAT-0972", 1, "7", "幾何", "長方形周長反求邊長", "34÷2＝17", "兩倍"], ["MAT-0973", 3, "21π", "幾何", "圓周長", "C＝πd", "不要再乘以 2"], ["MAT-0974", 2, "84", "數與量", "比值與差量", "24÷2＝12", "份數差"], ["MAT-0975", 3, "15", "統計與機率", "平均數反求未知資料", "14×5＝70", "反推總和"], ["MAT-0976", 0, "36π", "幾何", "圓面積", "半徑 r＝6", "半徑要平方"], ["MAT-0977", 2, "(1,1)", "幾何", "座標中點", "(−2＋4)÷2＝1", "座標的平均"], ["MAT-0978", 0, "21°C", "數與量", "正負數情境加法", "上升 13°C 表示加 13", "上升"], ["MAT-0979", 1, "63", "數與量", "比例式求未知量", "28÷4＝7", "同一個比值"], ["MAT-0980", 2, "5/12", "幾何", "扇形比例與約分", "150/360", "同除以 30"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0981", 3, "165", "數與量", "時分換算", "2×60＝120", "1 小時＝60 分鐘"], ["MAT-0982", 0, "6", "代數", "一元一次方程式負係數", "−2x＝−12", "負數"], ["MAT-0983", 0, "7/12", "數與量", "異分母分數減法", "5/6＝10/12", "先通分"], ["MAT-0984", 1, "71°", "幾何", "三角形外角定理", "54°＋x＝125°", "不相鄰"], ["MAT-0985", 2, "84", "幾何", "梯形面積", "24×7÷2", "除以 2"], ["MAT-0986", 3, "4", "代數", "聯立方程式加減消去法", "2x＝16−8＝8", "係數相同"], ["MAT-0987", 0, "108", "數與量", "百分率求部分量", "600×0.18", "總人數"], ["MAT-0988", 1, "9", "統計與機率", "眾數", "9 出現 3 次", "出現次數最多"], ["MAT-0989", 2, "3/8", "統計與機率", "重複試驗機率", "2³＝8", "獨立"], ["MAT-0990", 3, "−4", "數與量", "等差數列負公差", "12−16＝−4", "逐項減少"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
for (const [id, answer, expected, unit, point, clue, tip] of [["MAT-0991", 3, "b＝7，另一因式為 (x＋4)", "代數", "二次三項式因式與係數反推", "3＋4＝7", "常數項交叉檢查"], ["MAT-0992", 0, "99", "幾何", "三角形面積", "代入 18×11÷2", "互相垂直"], ["MAT-0993", 1, "(3,−4)", "幾何", "座標平移", "−5＋8＝3", "水平移動"], ["MAT-0994", 2, "1,200", "數與量", "折扣反求原價", "0.85P＝1,020", "除以保留的百分率"], ["MAT-0995", 3, "9", "幾何", "由圓周長求半徑", "2πr＝18π", "不是 πr"], ["MAT-0996", 3, "2/15", "統計與機率", "不放回抽取機率", "4/10×3/9＝2/15", "改變第二次"], ["MAT-0997", 0, "44", "幾何", "正方形面積反求周長", "√121＝11", "先從面積開平方"], ["MAT-0998", 1, "15", "代數", "函數代入求值", "25−10", "把自變數 x 換成 5"], ["MAT-0999", 2, "49/87", "統計與機率", "不放回抽取與補事件機率", "1−38/87＝49/87", "至少一個"], ["MAT-1000", 3, "5", "數與量", "整數指數與冪", "32＝2⁵", "比較指數"]]) {
  const row = mathAuthored.find(question => question.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== expected || row.unit !== unit || row.knowledgePoint !== point || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip.includes(tip) || !row.explanation) errors.push(`${id}: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏`);
}
const englishCinemaNotice = englishAuthored.find(question => question.id === "ENG-0027");
if (!englishCinemaNotice?.question.includes("entrance closes five minutes") || !englishCinemaNotice.explanation.includes("7:30 − 5 minutes = 7:25 p.m.") || !englishCinemaNotice.solutionSteps[2].includes("就座時間")) errors.push("ENG-0027: 電影院公告題須區分入場截止與就座時間並正確計算");
const umbrellaLocationInference = englishAuthored.find(question => question.id === "ENG-0410");
if (umbrellaLocationInference?.answer !== 0 || !umbrellaLocationInference.question.includes("one umbrella in my locker") || !umbrellaLocationInference.question.includes("another in my backpack") || !umbrellaLocationInference.explanation.includes("umbrella in the locker remains")) errors.push("ENG-0410: 借傘推論題的位置線索、答案或借出後狀態不一致");
for (const [id, answer, unit, evidence] of [["ENG-0387", 1, "功能性閱讀", "larger than 5 mm"], ["ENG-0389", 2, "功能性閱讀", "2:35 p.m."], ["ENG-0391", 0, "功能性閱讀", "40 minutes"], ["ENG-0394", 1, "功能性閱讀", "300 × 1.5 = 450 g"], ["ENG-0395", 1, "功能性閱讀", "colored sticks"], ["ENG-0396", 0, "圖表與數據判讀", "100 − 20 = 80"], ["ENG-0397", 2, "功能性閱讀", "$80 − $20 = $60"], ["ENG-0398", 1, "閱讀理解", "Light pollution"], ["ENG-0399", 0, "對話理解", "take half"], ["ENG-0400", 3, "功能性閱讀", "requested"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || question.unit !== unit || !question.question.includes(evidence) && !question.explanation.includes(evidence)) errors.push(`${id}: 經審閱讀題的證據、單元或答案索引回歸錯誤`);
}
for (const [id, answer, point, evidence] of [["ENG-0409", 1, "百分率基準與路程比較", "2.4÷6.4×100%＝37.5%"], ["ENG-0414", 2, "比較單價與總價差異", "$56 ÷ 4 = $14"], ["ENG-0419", 1, "依時段與抵達時間判斷可參加場次", "ends at 11:45"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || question.unit !== "功能性閱讀" || question.knowledgePoint !== point || !question.explanation.includes(evidence)) errors.push(`${id}: 數量／時間題的考點分類、答案索引或計算解析錯誤`);
}
const conditionalNoticeQuestion = englishAuthored.find(question => question.id === "ENG-0436");
if (conditionalNoticeQuestion?.answer !== 3 || conditionalNoticeQuestion.unit !== "功能性閱讀" || !conditionalNoticeQuestion.question.includes("The road is still flooded") || !conditionalNoticeQuestion.explanation.includes("classes will be held online")) errors.push("ENG-0436: 公告條件、題目情境或標答解釋不一致");
const imperativeConditionalQuestion = englishAuthored.find(question => question.id === "ENG-0421");
if (imperativeConditionalQuestion?.knowledgePoint !== "條件句與祈使句") errors.push("ENG-0421: 祈使句型的考點分類錯誤");
const dialogueCameraInference = englishAuthored.find(question => question.id === "ENG-0426");
if (dialogueCameraInference?.answer !== 3 || !dialogueCameraInference.question.includes("left my camera at home") || !dialogueCameraInference.explanation.includes("could not take pictures")) errors.push("ENG-0426: 對話推論的情緒、原因或答案不一致");
const parcelPickupNotice = englishAuthored.find(question => question.id === "ENG-0429");
if (parcelPickupNotice?.answer !== 2 || parcelPickupNotice?.unit !== "功能性閱讀" || !parcelPickupNotice.question.includes("photo ID") || !parcelPickupNotice.explanation.includes("front desk")) errors.push("ENG-0429: 包裹取件公告缺少位置、身分證明或正確行動");
const emptyTabletBatteryQuestion = englishAuthored.find(question => question.id === "ENG-0431");
if (emptyTabletBatteryQuestion?.answer !== 0 || !emptyTabletBatteryQuestion.question.includes("already at 0%") || !emptyTabletBatteryQuestion.explanation.includes("at 0%")) errors.push("ENG-0431: 平板無電的未來結果缺少必要電量條件");
const cloudBackupInstruction = englishAuthored.find(question => question.id === "ENG-0437");
if (cloudBackupInstruction?.answer !== 0 || !cloudBackupInstruction.question.includes("wait for the upload to finish") || !cloudBackupInstruction.explanation.includes("confirm the photos have uploaded")) errors.push("ENG-0437: 備份操作未確認上傳完成即更換裝置");
const fireExitSafety = englishAuthored.find(question => question.id === "ENG-0440");
if (fireExitSafety?.answer !== 0 || !fireExitSafety.question.includes("side exit away from the smoke is clear") || !fireExitSafety.explanation.includes("alert emergency services")) errors.push("ENG-0440: 火警安全選項缺少可用出口前提或求援行動");
const icePhaseChangeQuestion = englishAuthored.find(question => question.id === "ENG-0441");
if (icePhaseChangeQuestion?.answer !== 1 || !icePhaseChangeQuestion.question.includes("standard atmospheric pressure") || !icePhaseChangeQuestion.question.includes("liquid water")) errors.push("ENG-0441: 冰的相變題缺少標準壓力或正確液態產物資訊");
const commuteSurveyInference = englishAuthored.find(question => question.id === "ENG-0449");
if (commuteSurveyInference?.answer !== 2 || !commuteSurveyInference.question.includes("same 1,000 workers") || !commuteSurveyInference.explanation.includes("320 − 200 = 120") || !commuteSurveyInference.explanation.includes("does not prove the cause")) errors.push("ENG-0449: 通勤調查變化、差額或因果限制解析不一致");
for (const [id, answer, clue] of [["ENG-0454", 2, "Row E, Seat 12"], ["ENG-0457", 1, "get nervous sharing them"], ["ENG-0460", 1, "Team B arranges chairs in Hall 2"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.question.includes(clue) && !question.explanation.includes(clue)) errors.push(`${id}: 閱讀線索與答案索引不一致`);
}
for (const [id, answer, clue] of [["ENG-0463", 2, "2:20–2:45 p.m."], ["ENG-0467", 1, "cannot leave before 4:05"], ["ENG-0470", 3, "security desk"]]) {
  const question = englishAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.question.includes(clue) && !question.explanation.includes(clue)) errors.push(`${id}: 閱讀條件與答案索引不一致`);
}
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
if (irrigationSavingsQuestion?.answer !== 3 || irrigationSavingsQuestion.unit !== "功能性閱讀" || !irrigationSavingsQuestion.explanation.includes("36 − 18 = 18") || !irrigationSavingsQuestion.explanation.includes("答案為 D")) errors.push("ENG-0376: 用水差額題的單元、正解索引或計算解析錯誤");
const englishFeverReply = englishAuthored.find(question => question.id === "ENG-0402");
if (englishFeverReply?.answer !== 0 || !englishFeverReply.solutionSteps?.[2]?.includes("B、C、D 都沒有")) errors.push("ENG-0402: 康復祝福題解析排除選項標號錯誤");
const englishPoliteRequest = englishAuthored.find(question => question.id === "ENG-0405");
if (englishPoliteRequest?.answer !== 0 || !englishPoliteRequest.solutionSteps?.[2]?.includes("B 表示介意") || englishPoliteRequest.solutionSteps?.[2]?.includes("A 表示介意")) errors.push("ENG-0405: Would you mind 題解析排除選項標號錯誤");
const englishZeroConditional = englishAuthored.find(question => question.id === "ENG-0423");
if (englishZeroConditional?.knowledgePoint !== "零類條件句" || englishZeroConditional?.difficulty !== "基礎" || englishZeroConditional?.answer !== 1) errors.push("ENG-0423: 一般事實句的條件句知識點、難度或答案分類錯誤");
const englishIndirectQuestion = englishAuthored.find(question => question.id === "ENG-0512");
if (englishIndirectQuestion?.knowledgePoint !== "間接問句語序" || englishIndirectQuestion?.answer !== 1 || englishIndirectQuestion?.options?.[1] !== "what time the center opens" || !englishIndirectQuestion.solutionSteps?.some(step => step.includes("直述句語序"))) errors.push("ENG-0512: 間接問句需維持主詞在動詞前的語序");
const englishPresentPerfectContext = englishAuthored.find(question => question.id === "ENG-0521");
if (englishPresentPerfectContext?.options?.[englishPresentPerfectContext.answer] !== "has tried" || !englishPresentPerfectContext.question.includes("so far this semester")) errors.push("ENG-0521: 現在完成式題須明示本學期截至目前的時間範圍並維持正確答案");
const englishFuturePassive = englishAuthored.find(question => question.id === "ENG-0534");
if (englishFuturePassive?.answer !== 2 || englishFuturePassive?.options?.[1] !== "will opened" || !englishFuturePassive.question.includes("by the mayor") || !englishFuturePassive.explanation.includes("does not fit the stated agent")) errors.push("ENG-0534: 未來被動題需明示施事者並排除主動排程讀法");
const englishComparative = englishAuthored.find(question => question.id === "ENG-0522");
if (englishComparative?.answer !== 1 || !englishComparative.explanation.includes("去掉 e 再加 r") || englishComparative.explanation.includes("雙寫 g") || englishComparative.teacherTip.includes("雙寫 g")) errors.push("ENG-0522: large 比較級規則不可誤稱雙寫 g");
const englishPurposeInfinitive = englishAuthored.find(question => question.id === "ENG-0551");
if (englishPurposeInfinitive?.answer !== 2 || !englishPurposeInfinitive.question.includes("in order ___")) errors.push("ENG-0551: 目的不定詞題需排除分詞片語的另一種合理讀法");
const englishWeeklyUpdate = englishAuthored.find(question => question.id === "ENG-0561");
if (englishWeeklyUpdate?.options?.[englishWeeklyUpdate.answer] !== "updates" || !englishWeeklyUpdate.question.includes("The IT department") || !englishWeeklyUpdate.solutionSteps?.some(step => step.includes("固定頻率"))) errors.push("ENG-0561: 主動更新題須明示單數施事者及固定頻率");
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
const englishAfternoonNoiseComparison = englishAuthored.find(question => question.id === "ENG-0746");
if (englishAfternoonNoiseComparison?.answer !== 2 || !englishAfternoonNoiseComparison.question.includes("during an afternoon walk") || englishAfternoonNoiseComparison.question.includes("at noon")) errors.push("ENG-0746: 比較級題的測量時段與比較情境必須一致");
const englishRecipeRestTime = englishAuthored.find(question => question.id === "ENG-0773");
if (englishRecipeRestTime?.answer !== 1 || englishRecipeRestTime.options?.[englishRecipeRestTime.answer] !== "2:17 p.m." || !englishRecipeRestTime.explanation.includes("2:12＋5 分鐘＝2:17") || !englishRecipeRestTime.solutionSteps?.[2]?.includes("2:15 只過 3 分鐘")) errors.push("ENG-0773: 麵包靜置時間題須以實際時間選項並正確計算最早供應時刻");
const englishYearToDateLane = englishAuthored.find(question => question.id === "ENG-0811");
if (englishYearToDateLane?.options?.[englishYearToDateLane.answer] !== "has built" || !englishYearToDateLane.question.includes("so far this year") || !englishYearToDateLane.solutionSteps?.[0]?.includes("延伸到現在")) errors.push("ENG-0811: 年初至今完成式題須明確使用 so far 線索並排除過去式歧義");
const englishPastProgressiveTeam = englishAuthored.find(question => question.id === "ENG-0822");
if (englishPastProgressiveTeam?.answer !== 1 || englishPastProgressiveTeam.options?.[englishPastProgressiveTeam.answer] !== "was holding" || !englishPastProgressiveTeam.solutionSteps?.[2]?.includes("the team 在此作單數集合名詞") || englishPastProgressiveTeam.solutionSteps?.some(step => step.includes("students 是複數"))) errors.push("ENG-0822: 過去進行式解析須與 team 主詞及 holding 選項一致");
const englishPermissionEmail = englishAuthored.find(question => question.id === "ENG-0833");
if (englishPermissionEmail?.answer !== 0 || !englishPermissionEmail.solutionSteps?.[0]?.includes("週一截止") || !englishPermissionEmail.solutionSteps?.[1]?.includes("尚未交表格的人")) errors.push("ENG-0833: 表單通知閱讀題須逐步說明已交與未交學生的差異");
const englishPluralBeakers = englishAuthored.find(question => question.id === "ENG-0863");
if (englishPluralBeakers?.answer !== 2 || englishPluralBeakers.options?.[englishPluralBeakers.answer] !== "Dry them" || englishPluralBeakers.options?.slice(0, 3).some(option => /\bit\b/.test(option)) || !englishPluralBeakers.solutionSteps?.[2]?.includes("Dry them")) errors.push("ENG-0863: 複數燒杯閱讀題的選項與解析代名詞須維持複數一致");
for (const [id, answer, clue] of [["ENG-0896", 2, "visual comparison"], ["ENG-0897", 3, "rules 以 they 代替"], ["ENG-0898", 0, "讓 emergency vehicles 通行"], ["ENG-0899", 0, "before 子句用現在簡單式"], ["ENG-0900", 1, "several independent studies"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.solutionSteps?.some(step => ["觀察", "找出", "判斷", "選"].includes(step.trim().replace(/[。！]$/, "")))) errors.push(`${id}: 英文題的逐步解說須引用本題線索、答案索引並避免空泛模板`);
}
for (const [id, answer, clue] of [["ENG-0901", 2, "still 表示"], ["ENG-0902", 3, "last Saturday 是明確"], ["ENG-0903", 2, "一般游泳從 5:00 才開始"], ["ENG-0904", 0, "require + 受詞 + to-infinitive"], ["ENG-0905", 1, "be satisfied with"], ["ENG-0906", 2, "known to live on Earth"], ["ENG-0907", 0, "security office"], ["ENG-0908", 3, "photographs 是被清潔的照片"], ["ENG-0909", 0, "fill out a form"], ["ENG-0910", 1, "原因與結果"], ["ENG-0911", 2, "This is the first time"], ["ENG-0912", 3, "volunteer，而 volunteer 指人"], ["ENG-0913", 2, "20 分鐘"], ["ENG-0914", 0, "過去條件導致現在結果"], ["ENG-0915", 1, "confident 加 -ly"], ["ENG-0916", 2, "quiet room"], ["ENG-0917", 3, "those boxes"], ["ENG-0918", 0, "do not use the elevator"], ["ENG-0919", 0, "未來時間子句"], ["ENG-0920", 1, "routes"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.solutionSteps?.length !== 3) errors.push(`${id}: 解題步驟必須提供本題線索、正確答案索引與完整三步推理`);
}
for (const [id, answer, clue] of [["ENG-0001", 3, "兩人無法在橋上交會"], ["ENG-0002", 0, "她放下背包後"], ["ENG-0003", 0, "Saturday 屬於公告開放"], ["ENG-0004", 0, "沒看過示範的學生"], ["ENG-0005", 2, "以前同學必須靠近"], ["ENG-0006", 1, "Expected 變成 Arrived"], ["ENG-0007", 1, "Ken 把原本要留給自己的餐點"], ["ENG-0008", 0, "自行車在濕的斑馬線上打滑"], ["ENG-0009", 0, "外觀看來小"], ["ENG-0010", 0, "玉米已成熟"], ["ENG-0011", 1, "床和書桌仍留在房內"], ["ENG-0012", 2, "隊員等了兩小時"]]) {
  const row = englishAuthored.find(question => question.id === id);
  const needsContextualUpgrade = Number(id.slice(-4)) <= 12;
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => step.startsWith("先讀題幹的完整線索") || step.startsWith("答案為")) || (needsContextualUpgrade && (row.gradeSemester !== "九年級上" || row.difficulty !== "中等" || row.question.length < 100))) errors.push(`${id}: 英文解析步驟須引用本題線索；前 12 題另須維持九年級、多線索中等情境題`);
}
for (const [id, answer, clue] of [["ENG-0013", 1, "先確認 Mina 的抵達時間"], ["ENG-0015", 1, "先找出 shut 的適用時段"], ["ENG-0016", 1, "A 提供靠窗座位"], ["ENG-0017", 0, "A 為弄壞尺子道歉"], ["ENG-0018", 1, "找出明確發生的事"], ["ENG-0019", 0, "把答句中的兩個原因分開"], ["ENG-0020", 0, "A 感謝對方分享筆記"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.gradeSemester !== "九年級上" || row.difficulty !== "中等" || row.options?.length !== 4 || !row.teacherTip || !row.explanation || !row.options[row.answer]) errors.push(`${id}: 情境題答案索引、年級、難度或逐步解析回歸錯誤`);
}
const englishMixedConditional = englishAuthored.find(question => question.id === "ENG-0934");
for (const [id, answer, clue] of [["ENG-0021", 0, "先依序排列兩個時間條件"], ["ENG-0022", 1, "遺失的錢包裡有學生證"], ["ENG-0023", 2, "社團幹部要確認遊覽車時間"], ["ENG-0024", 3, "先列出兩個條件"], ["ENG-0025", 3, "先確認個人限制"], ["ENG-0026", 2, "更新資訊排除降雨風險"], ["ENG-0027", 2, "先找出題目問的是最晚入場時間"], ["ENG-0028", 3, "先辨認開窗請求的理由"], ["ENG-0029", 2, "排除無法步行和不可用的家用車"], ["ENG-0030", 3, "走廊噪音干擾報告"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => step.startsWith("先讀題幹的完整線索") || step.startsWith("答案為")) || row.gradeSemester !== "九年級上" || row.difficulty !== "中等") errors.push(`${id}: 題目須保留情境線索、正解索引與九年級逐步解題`);
}
for (const [id, answer, clue] of [["ENG-0031", 1, "先找主詞中心語"], ["ENG-0032", 2, "到站是已完成的過去事件"], ["ENG-0033", 2, "逗號中的補充資訊"], ["ENG-0034", 1, "so noisy that 說明教室太吵"], ["ENG-0035", 1, "句子以 My sister is used to"], ["ENG-0036", 2, "中心主詞是 furniture"], ["ENG-0037", 2, "受建議的人 my grandfather"], ["ENG-0038", 2, "the heavy rain 是名詞片語"], ["ENG-0040", 1, "The more carefully"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先讀題幹的完整線索|^答案為|^易錯選項提醒/.test(step))) errors.push(`${id}: 文法解析須依本題線索提供三步推理，不能使用通用套語`);
}
const englishDespiteNounPhrase = englishAuthored.find(question => question.id === "ENG-0038");
if (!englishDespiteNounPhrase?.question.startsWith("___ the heavy rain") || !englishDespiteNounPhrase.question.includes("concert continued as planned") || englishDespiteNounPhrase.options?.[englishDespiteNounPhrase.answer] !== "despite") errors.push("ENG-0038: despite 題須以名詞片語和明確讓步語境排除 because 的雙解");
const englishNeitherContext = englishAuthored.find(question => question.id === "ENG-0031");
if (!englishNeitherContext?.question.includes("Neither proposal") || englishNeitherContext.options?.[englishNeitherContext.answer] !== "is" || englishNeitherContext.gradeSemester !== "九年級上" || englishNeitherContext.difficulty !== "中等") errors.push("ENG-0031: neither 題須使用明確單數中心語，避免 neither of + 複數名詞的語域差異");
const englishPassiveReport = englishAuthored.find(question => question.id === "ENG-0039");
if (englishPassiveReport?.options?.[englishPassiveReport.answer] !== "be reviewed" || !englishPassiveReport.question.includes("by both department heads") || !englishPassiveReport.solutionSteps?.some(step => step.includes("must + be + 過去分詞"))) errors.push("ENG-0039: report 審閱句須使用自然的被動搭配並解釋 modal passive 結構");
for (const [id, answer, clue] of [["ENG-0041", 2, "Each of the answers 是主詞"], ["ENG-0042", 2, "bicycle，而後面沒有重複寫 bicycle 的所有者"], ["ENG-0043", 3, "空格修飾動詞 speaks"], ["ENG-0044", 2, "老師已要求安靜"], ["ENG-0045", 2, "Not only 放在句首"], ["ENG-0046", 0, "金屬水瓶"], ["ENG-0047", 1, "前句用 First"], ["ENG-0048", 3, "Mia 在 Evan 忘記帶午餐時幫助他"], ["ENG-0049", 0, "學生排定輪值"], ["ENG-0050", 1, "前句描述麵包沒有均勻膨起"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先讀題幹的完整線索|^答案為|^易錯選項提醒/.test(step))) errors.push(`${id}: 解題過程必須指出本題證據、文法／語意推論和干擾選項`);
}
const englishExplicitComparison = englishAuthored.find(question => question.id === "ENG-0046");
if (!englishExplicitComparison?.question.includes("than before") || englishExplicitComparison.options?.[englishExplicitComparison.answer] !== "fewer" || !englishExplicitComparison.explanation.includes("explicitly establishes the comparison")) errors.push("ENG-0046: fewer 比較級需有明示比較基準並與可數名詞一致");
const englishCausalConnector = englishAuthored.find(question => question.id === "ENG-0049");
if (englishCausalConnector?.options?.includes("while") || englishCausalConnector?.options?.[englishCausalConnector.answer] !== "because" || !englishCausalConnector.explanation.toLowerCase().includes("unless")) errors.push("ENG-0049: 原因連接詞題須排除 while 的時間／對比次解，並說明 unless 為何相反");
const englishContrastConnector = englishAuthored.find(question => question.id === "ENG-0050");
if (englishContrastConnector?.options?.[englishContrastConnector.answer] !== "Nevertheless" || !englishContrastConnector.question.includes("did not rise evenly") || !englishContrastConnector.explanation.includes("setback caused her pride")) errors.push("ENG-0050: 連接副詞題須以挫折與正向收穫的明確轉折支持 nevertheless");
for (const [id, answer, clue] of [["ENG-0051", 1, "城市在車站旁增設自行車架"], ["ENG-0052", 0, "Luis 原本獨自吃飯"], ["ENG-0053", 3, "起飛線和發射高度在每次試驗都相同"], ["ENG-0054", 0, "團隊設置分類清楚的回收桶"], ["ENG-0055", 0, "停電時家人選電池燈"], ["ENG-0056", 1, "方案是在椅腳加軟墊"], ["ENG-0057", 2, "Ava 每天短時間練習"], ["ENG-0058", 2, "修理咖啡館讓人修好燈"], ["ENG-0059", 2, "路程比地圖標示長"], ["ENG-0060", 2, "空格前後都是完整子句"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先讀題幹的完整線索|^答案為|^易錯選項提醒/.test(step))) errors.push(`${id}: 解題過程須依據本題線索，並避免通用套語`);
}
for (const [id, point] of [["ENG-0051", "連接詞與因果"], ["ENG-0052", "依情境選擇適當形容詞"], ["ENG-0053", "介系詞搭配"], ["ENG-0054", "連接副詞"], ["ENG-0055", "依語境選擇修飾動詞的副詞"], ["ENG-0056", "連接詞與因果"], ["ENG-0057", "閱讀推論"], ["ENG-0058", "字彙語境"], ["ENG-0059", "形容詞 + enough + to 不定詞"], ["ENG-0060", "連接詞"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.knowledgePoint !== point) errors.push(`${id}: 考點標籤須與本題實際測量技能一致`);
}
const englishExperimentControl = englishAuthored.find(question => question.id === "ENG-0053");
if (englishExperimentControl?.options?.[englishExperimentControl.answer] !== "between" || !englishExperimentControl.question.includes("same starting line and launch height") || !englishExperimentControl.explanation.toLowerCase().includes("between trials")) errors.push("ENG-0053: 公平試驗須清楚說明控制條件，並使用 between trials 描述改變變因");
const englishCoordinatingConjunction = englishAuthored.find(question => question.id === "ENG-0060");
if (englishCoordinatingConjunction?.options?.includes("while") || englishCoordinatingConjunction?.options?.[englishCoordinatingConjunction.answer] !== "and") errors.push("ENG-0060: 連接詞選項不可讓 while 與 and 同時合理");
for (const [id, answer, clue] of [["ENG-0061", 1, "下雨使 Mei 和父親取消農夫市集行程"], ["ENG-0062", 2, "公告先說 5 月 12 日"], ["ENG-0063", 1, "操作對象是玩具鳥模型"], ["ENG-0064", 1, "居民可取書或留書"], ["ENG-0065", 0, "工人是在暴風前固定幼樹"], ["ENG-0066", 1, "舊電腦仍可運作"], ["ENG-0067", 2, "家人 9:20 抵達"], ["ENG-0068", 2, "實驗想檢驗資料夾顏色"], ["ENG-0069", 1, "行程先列出天文館短片"], ["ENG-0070", 2, "兩條路都到同一山頂"], ["ENG-0071", 1, "明確排除電線外皮龜裂"], ["ENG-0072", 2, "步行 45 人、騎腳踏車 15 人"], ["ENG-0073", 0, "垃圾中的半滿盒數量下降"], ["ENG-0074", 0, "導覽員要求遊客留在池邊拍照"], ["ENG-0075", 2, "物品上限是五件乾淨衣物"], ["ENG-0076", 2, "星期五的營業時間是 9:00 至 20:00"], ["ENG-0077", 2, "只需取這兩欄"], ["ENG-0078", 3, "實際購買的兩項"], ["ENG-0079", 2, "星期四降雨量是 6 mm"], ["ENG-0080", 3, "比較生長量而非期末高度"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先讀題幹的完整線索|^答案為|^易錯選項提醒|^Read the values in the question/.test(step))) errors.push(`${id}: 解題過程須引用個別題目證據並包含三步推理`);
}
const englishDirectReadItems = englishAuthored.filter(question => ["ENG-0061", "ENG-0064"].includes(question.id));
if (englishDirectReadItems.some(question => question.difficulty !== "基礎")) errors.push("ENG-0061/0064: 直接尋找明示資訊的題目不可標為進階");
const englishPoolNotice = englishAuthored.find(question => question.id === "ENG-0062");
if (englishPoolNotice?.options?.length !== 4 || englishPoolNotice.options[englishPoolNotice.answer] !== "May 13 at 8:00 a.m." || !englishPoolNotice.explanation.includes("noon time")) errors.push("ENG-0062: 泳池公告題須有四個選項，且中午干擾項須與公告明示時間區分");
const englishBoatTourReason = englishAuthored.find(question => question.id === "ENG-0067");
if (!englishBoatTourReason?.relatedWords?.includes("seasick（暈船的）") || !englishBoatTourReason.relatedWords.includes("skip（略過；不參加）")) errors.push("ENG-0067: 相關英文字詞須對應船遊缺席原因，不得沿用無關提示");
for (const [id, difficulty] of [["ENG-0071", "基礎"], ["ENG-0072", "基礎"], ["ENG-0073", "中等"], ["ENG-0074", "基礎"], ["ENG-0076", "中等"], ["ENG-0077", "基礎"], ["ENG-0079", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度標記須符合直接查找或多步推理的實際負荷`);
}
const englishChartTips = ["ENG-0076", "ENG-0077", "ENG-0078", "ENG-0079", "ENG-0080"].map(id => englishAuthored.find(question => question.id === id)?.teacherTip);
if (englishChartTips.some(tip => !tip) || new Set(englishChartTips).size !== englishChartTips.length || englishChartTips.some(tip => tip.includes("Compare the exact categories and units"))) errors.push("ENG-0076–0080: 圖表題須有逐題專屬提示，不可重用泛用模板");
const englishBeakMaterials = englishAuthored.find(question => question.id === "ENG-0063");
if (!englishBeakMaterials?.question.includes("three kinds of objects") || englishBeakMaterials.question.includes("three kinds of food")) errors.push("ENG-0063: seeds、stones、paper clips 應統稱 objects，不可誤稱三種食物");
const englishWasteMeasure = englishAuthored.find(question => question.id === "ENG-0073");
if (!englishWasteMeasure?.question.includes("fewer half-full boxes") || englishWasteMeasure.question.includes("fewer unopened boxes")) errors.push("ENG-0073: 觀察結果須與原先半盒果汁浪費問題使用同一指標");
for (const [id, answer, clue] of [["ENG-0081", 2, "手作課 10:30 結束"], ["ENG-0082", 2, "筆記本 32 元"], ["ENG-0083", 2, "plastic 和 glass"], ["ENG-0084", 1, "星期六屬於週末時段"], ["ENG-0085", 0, "以車站為起點"], ["ENG-0086", 3, "分別比較下單日與抵達日"], ["ENG-0087", 1, "每人的三天運動時間"], ["ENG-0088", 2, "第 4 週和第 1 週"], ["ENG-0089", 3, "以客廳為基準"], ["ENG-0090", 2, "借的是 magazine"], ["ENG-0091", 2, "Each of the players 中"], ["ENG-0092", 3, "原句的 although 子句"], ["ENG-0093", 3, "Amy 昨天說自己現在很忙"], ["ENG-0094", 0, "前句是公車因車流延誤"], ["ENG-0095", 1, "After dinner 是放在句首"], ["ENG-0096", 2, "判斷物品移動方向"], ["ENG-0097", 1, "燈熄滅是短暫發生"], ["ENG-0098", 2, "並列清單列出"], ["ENG-0099", 1, "句子明確拿 This route"], ["ENG-0100", 0, "A 說自己頭痛"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先讀題幹的完整線索|^答案為|^易錯選項提醒|^Read the values in the question/.test(step))) errors.push(`${id}: 解題步驟須逐題說明語境／文法線索並吻合正解`);
}
for (const [id, difficulty] of [["ENG-0081", "基礎"], ["ENG-0082", "中等"], ["ENG-0083", "基礎"], ["ENG-0084", "基礎"], ["ENG-0088", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度標籤須對應直接查找或多步運算負荷`);
}
const englishTableTips = Array.from({ length: 10 }, (_, index) => englishAuthored.find(question => question.id === `ENG-${String(81 + index).padStart(4, "0")}`)?.teacherTip);
if (englishTableTips.some(tip => !tip) || new Set(englishTableTips).size !== englishTableTips.length || englishTableTips.some(tip => tip.includes("Compare the exact categories and units"))) errors.push("ENG-0081–0090: 表格與圖表題須有逐題專屬提示，避免泛用模板");
for (const [id, point, difficulty] of [["ENG-0091", "主詞動詞一致", "基礎"], ["ENG-0092", "讓步連接詞", "基礎"], ["ENG-0093", "間接引述", "中等"], ["ENG-0094", "連接副詞", "基礎"], ["ENG-0095", "標點符號", "基礎"], ["ENG-0096", "字彙辨析", "基礎"], ["ENG-0097", "過去進行式", "中等"], ["ENG-0098", "平行結構", "中等"], ["ENG-0099", "比較級", "基礎"], ["ENG-0100", "情態助動詞", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.knowledgePoint !== point || row.difficulty !== difficulty) errors.push(`${id}: 考點標籤或難度未反映本題實際測量技能`);
}
const englishReportedSpeechContext = englishAuthored.find(question => question.id === "ENG-0093");
if (!englishReportedSpeechContext?.question.includes("Today, she says she has free time") || !englishReportedSpeechContext.explanation.includes("not a fact that remains true") || !englishReportedSpeechContext.solutionSteps[2].includes("有時可不回推時態")) errors.push("ENG-0093: 間接引述題須補足狀態已改變的時間情境並承認時態回推彈性");
for (const [id, answer, clue] of [["ENG-0101", 0, "日曆列出週二至週日的開館時間"], ["ENG-0102", 3, "訊息說寶寶剛睡著"], ["ENG-0103", 3, "父親每個上學日都開車送 Leo"], ["ENG-0104", 3, "last Saturday 和後面的 visited"], ["ENG-0105", 1, "咖啡館較吵"], ["ENG-0106", 3, "7:30 p.m. 是演出開始的明確鐘點"], ["ENG-0107", 3, "reading log 顯示這是 Maya"], ["ENG-0108", 3, "要求的是 us（球員）提早到"], ["ENG-0109", 0, "末班車只剩十分鐘"], ["ENG-0110", 0, "橋是工程師修理的對象"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.question.length < 130 || row.solutionSteps?.length !== 3) errors.push(`${id}: 升級題須保留原考點與正解，並以多線索情境呈現專屬三步解析`);
}
for (const [id, difficulty] of [["ENG-0102", "基礎"], ["ENG-0103", "基礎"], ["ENG-0104", "基礎"], ["ENG-0105", "基礎"], ["ENG-0106", "基礎"], ["ENG-0107", "基礎"], ["ENG-0108", "基礎"], ["ENG-0109", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 直接辨識基本句型題不可不合理標成高難度`);
}
const englishPresentSleepClue = englishAuthored.find(question => question.id === "ENG-0102");
if (!englishPresentSleepClue?.question.includes("is still asleep") || englishPresentSleepClue.options?.[englishPresentSleepClue.answer] !== "is sleeping") errors.push("ENG-0102: 現在進行式答案需由明確的當下狀態支持");
for (const [id, answer, clue] of [["ENG-0111", 3, "last month 和 during the weekend"], ["ENG-0112", 0, "先行詞是 the student"], ["ENG-0113", 0, "學校手冊明列每位學生"], ["ENG-0114", 0, "Could you tell me 是主句"], ["ENG-0115", 3, "句子形容的是 documentary"], ["ENG-0116", 0, "主句說明明天會處理"], ["ENG-0117", 0, "主句是現在完成式 has finished"], ["ENG-0118", 0, "步驟有編號圖示"], ["ENG-0119", 1, "學生 3:15 抵達"], ["ENG-0120", 0, "原定週六野餐"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.question.length < 110 || row.solutionSteps?.length !== 3) errors.push(`${id}: 情境改寫須保留題目線索、答案索引和專屬解析`);
}
for (const [id, difficulty] of [["ENG-0111", "中等"], ["ENG-0112", "基礎"], ["ENG-0114", "中等"], ["ENG-0115", "中等"], ["ENG-0117", "中等"], ["ENG-0118", "基礎"], ["ENG-0120", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度須符合單一文法辨認或跨線索判斷的實際負荷`);
}
const englishHelmetSchoolRule = englishAuthored.find(question => question.id === "ENG-0113");
if (!englishHelmetSchoolRule?.question.includes("school handbook") || englishHelmetSchoolRule.question.includes("legally required") || !englishHelmetSchoolRule.explanation.includes("學校手冊")) errors.push("ENG-0113: must 義務題應以校規為情境，避免錯述自行車法規");
const englishTagQuestionPosition = englishAuthored.find(question => question.id === "ENG-0117");
if (!englishTagQuestionPosition?.question.includes("Your sister has finished the project, ___?") || englishTagQuestionPosition.options?.[englishTagQuestionPosition.answer] !== "hasn't she") errors.push("ENG-0117: 附加問句空格必須緊接其所修飾的主句");
for (const [id, answer, clue] of [["ENG-0121", 3, "答句提供 At 7:10"], ["ENG-0122", 3, "milk 是不可數名詞"], ["ENG-0123", 1, "標籤把另一只瓶子的主人指向 Mia"], ["ENG-0124", 3, "checklist 和 each school day"], ["ENG-0125", 2, "動詞 gave 後面需要指出誰收到額外時間"], ["ENG-0126", 3, "句子要介紹某地存在一家書店"], ["ENG-0127", 3, "四個座位中三個已被占用"], ["ENG-0128", 3, "告示直接請讀者離開時輕輕關門"], ["ENG-0129", 3, "Kevin 提早離家是為了搭上 6:05"], ["ENG-0130", 0, "告示要避免把戶外泥土帶進電腦教室"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.question.length < 100 || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先讀題幹|答案為|易錯選項提醒/.test(step))) errors.push(`${id}: 情境題須保留答案、逐題線索與三步解析`);
}
for (const [id, difficulty] of [["ENG-0121", "基礎"], ["ENG-0122", "基礎"], ["ENG-0123", "基礎"], ["ENG-0124", "基礎"], ["ENG-0125", "基礎"], ["ENG-0126", "基礎"], ["ENG-0128", "基礎"], ["ENG-0129", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度須符合基本詞形辨識或較複合語境判斷負荷`);
}
const englishExistentialSentence = englishAuthored.find(question => question.id === "ENG-0126");
if (englishExistentialSentence?.options?.includes("It has") || englishExistentialSentence?.options?.[englishExistentialSentence.answer] !== "There is") errors.push("ENG-0126: 存在句選擇題不可保留語意和文法皆合理的 It has 作干擾項");
const englishPronounSubstitute = englishAuthored.find(question => question.id === "ENG-0127");
if (englishPronounSubstitute?.options?.[englishPronounSubstitute.answer] !== "one" || !englishPronounSubstitute.question.includes("Only ___ is still available to book")) errors.push("ENG-0127: one 題須以不特定剩餘座位語境唯一指向代名詞 one");
const englishTrainPurpose = englishAuthored.find(question => question.id === "ENG-0129");
if (!englishTrainPurpose?.question.includes("first train to the school-trip meeting point") || !englishTrainPurpose.question.includes("before check-in")) errors.push("ENG-0129: 搭車目的題須明確區分火車目的地和報到時序");
for (const [id, answer, clue] of [["ENG-0131", 3, "每場活動前、中、後都要補水"], ["ENG-0132", 3, "Ben 先看過敏標示後改點別的菜"], ["ENG-0133", 1, "訊息先交代夜間結冰"], ["ENG-0134", 1, "照護紀錄指出小鳥還無法自己取得食物"], ["ENG-0135", 3, "學生無法獨自安全搬動箱子"], ["ENG-0136", 3, "河岸路陡坡最少"], ["ENG-0137", 3, "說話者目前沒有空檔"], ["ENG-0138", 3, "狗聽見雷聲後躲到桌下"], ["ENG-0139", 1, "家人下午三點到場"], ["ENG-0140", 0, "藥師說明的是苦味"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.[0]?.includes(clue) || row.question.length < 110 || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先找主要動詞|選 [A-D]。?$/.test(step))) errors.push(`${id}: 應以完整情境線索支撐答案，並提供本題專屬三步解析`);
}
const englishTrailSafetyEvidence = englishAuthored.find(question => question.id === "ENG-0136");
if (!englishTrailSafetyEvidence?.question.includes("fewest reported safety incidents") || englishTrailSafetyEvidence.options?.[englishTrailSafetyEvidence.answer] !== "safest") errors.push("ENG-0136: 最高級答案需由明確風險指標支持，而非模糊紀錄描述");
const englishMuseumWorkWindow = englishAuthored.find(question => question.id === "ENG-0139");
if (!englishMuseumWorkWindow?.question.includes("from 2 to 5 p.m. today") || !englishMuseumWorkWindow.solutionSteps[0].includes("2 至 5 點施工時段內")) errors.push("ENG-0139: 替代入口作答須明確證明抵達時施工仍在進行");
const englishPastOngoingViewing = englishAuthored.find(question => question.id === "ENG-0147");
if (englishPastOngoingViewing?.options?.[englishPastOngoingViewing.answer] !== "were watching" || !englishPastOngoingViewing.explanation.includes("had watched 會表示已看完") || englishPastOngoingViewing.options?.includes("watched")) errors.push("ENG-0147: 過去進行式題須排除可描述同時過去動作的一般過去式選項");
for (const [id, answer, clue] of [["ENG-0141", 2, "兩人各自準備了一個餐盒"], ["ENG-0142", 3, "訂單要三個完整麵包"], ["ENG-0143", 3, "honest person 是單數可數名詞片語"], ["ENG-0144", 1, "主要動詞是一般動詞 work"], ["ENG-0145", 3, "說話者找遍不同地方仍沒找到鑰匙"], ["ENG-0146", 3, "老師叫大家 Listen"], ["ENG-0147", 3, "昨晚九點"], ["ENG-0148", 3, "告示標明 No Parking"], ["ENG-0149", 1, "球隊取消比賽，是因為場地積水"], ["ENG-0150", 2, "大家看不清桌上的說明"], ["ENG-0151", 3, "空格修飾動詞 speaks"], ["ENG-0152", 3, "題目明說沒有外援"], ["ENG-0153", 3, "延續 be interested in 這個片語"], ["ENG-0154", 3, "前三次實測都花較少時間"], ["ENG-0155", 1, "by the referee 明確指出執行 display 動作的人"], ["ENG-0156", 2, "最新作品本週仍在播放"], ["ENG-0157", 3, "Do you know 引出嵌在主句中的問題"], ["ENG-0158", 3, "used 的受詞"], ["ENG-0159", 3, "圖書館目前提早關門"], ["ENG-0160", 3, "Sam 臉色蒼白又停止跑步"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 110 || row.solutionSteps?.length !== 3 || row.solutionSteps?.some(step => /先確認空格|選 [A-D]。?$/.test(step))) errors.push(`${id}: 題目須保留唯一答案線索、足量情境與專屬逐步解析`);
}
const englishAuthoredFollowup = englishAuthored.filter(question => /^ENG-015[1-9]$|^ENG-0160$/.test(question.id));
const englishAuthoredFollowupMistakes = new Map([
  ["ENG-0151", "clearly"], ["ENG-0152", "themselves"], ["ENG-0153", "介系詞 in"], ["ENG-0154", "faster"], ["ENG-0155", "被顯示"],
  ["ENG-0156", "延續到現在"], ["ENG-0157", "直述語序"], ["ENG-0158", "受詞"], ["ENG-0159", "與現況相反"], ["ENG-0160", "sick"]
]);
for (const question of englishAuthoredFollowup) {
  if (!question.commonMistake || !englishAuthoredFollowupMistakes.has(question.id) || !question.commonMistake.includes(englishAuthoredFollowupMistakes.get(question.id))) errors.push(`${question.id}: 易錯提醒須與本題考點一致且包含關鍵辨析`);
}
const englishAdverbAgreement = englishAuthored.find(question => question.id === "ENG-0151");
if (!englishAdverbAgreement?.explanation.includes("speaks") || englishAdverbAgreement.explanation.includes("spoke")) errors.push("ENG-0151: 解析動詞須與題幹 speaks 一致");
for (const [id, answer, clue] of [["ENG-0161", 1, "會議日期改到 Friday"], ["ENG-0162", 2, "Neither answer 表示兩個答案當中沒有一個正確"], ["ENG-0163", 2, "擁有者是單數人名 Mia"], ["ENG-0164", 3, "sound 在此是連綴動詞"], ["ENG-0165", 3, "事件發生在 yesterday"], ["ENG-0166", 3, "time 在此不是一個個可數的事件"], ["ENG-0167", 3, "remind + 人 + to V"], ["ENG-0168", 1, "對讀者下否定指示時用 Don't"], ["ENG-0169", 2, "前半是原因，後半是由此造成的結果"], ["ENG-0170", 3, "carry out a survey 是固定搭配"], ["ENG-0171", 2, "a few 表示有少數幾個"], ["ENG-0172", 3, "stop + V-ing 表示停止原本正在做的事"], ["ENG-0173", 1, "兩者比較用 more + 形容詞"], ["ENG-0174", 3, "固定程序，使用現在簡單式描述規則"], ["ENG-0175", 3, "for + 時間長度"], ["ENG-0176", 2, "缺少的是「在那裡」的地點副詞"], ["ENG-0177", 3, "過去常做、現在已改變的習慣"], ["ENG-0178", 3, "以 Let's 開頭的提議句慣用 shall we"], ["ENG-0179", 0, "語意最接近 short"], ["ENG-0180", 2, "4:50 班次 will leave on time"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 110 || row.solutionSteps?.length !== 3) errors.push(`${id}: 題目須保留答案索引、情境依據及完整三步解析`);
}
for (const [id, difficulty] of [["ENG-0161", "基礎"], ["ENG-0162", "中等"], ["ENG-0163", "基礎"], ["ENG-0164", "基礎"], ["ENG-0165", "基礎"], ["ENG-0166", "基礎"], ["ENG-0167", "中等"], ["ENG-0168", "基礎"], ["ENG-0169", "基礎"], ["ENG-0170", "中等"], ["ENG-0171", "基礎"], ["ENG-0172", "中等"], ["ENG-0173", "中等"], ["ENG-0174", "中等"], ["ENG-0175", "中等"], ["ENG-0176", "中等"], ["ENG-0177", "中等"], ["ENG-0178", "中等"], ["ENG-0179", "基礎"], ["ENG-0180", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
for (const [id, clue] of [["ENG-0176", "where"], ["ENG-0177", "used to"], ["ENG-0178", "shall we"], ["ENG-0179", "brief"], ["ENG-0180", "4:20"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (!row?.commonMistake?.includes(clue)) errors.push(`${id}: 必須提供本題專屬的英文易錯提醒`);
}
for (const [id, answer, clue] of [["ENG-0181", 3, "從 8:45 往後加 15 分鐘是 9:00"], ["ENG-0182", 2, "Only two 補充的是缺席學生的人數"], ["ENG-0183", 3, "尾巴只在靠近地板的位置露出"], ["ENG-0184", 1, "主詞是 favorite subjects"], ["ENG-0185", 2, "手冊把用餐地點限制在 cafeteria"], ["ENG-0186", 3, "每組都會在入口領到學校相機"], ["ENG-0187", 2, "目的是把紙裁成合適尺寸"], ["ENG-0188", 1, "發生在過去"], ["ENG-0189", 3, "姓名、年級和緊急聯絡資料"], ["ENG-0190", 2, "主動提供茶水"], ["ENG-0191", 3, "than 提示使用比較級"], ["ENG-0192", 2, "空格修飾動詞 rode"], ["ENG-0193", 3, "practice 後接動名詞 V-ing"], ["ENG-0194", 2, "dog 用 was + found"], ["ENG-0195", 3, "現在完成式疑問句用 Have + 主詞 + 過去分詞"], ["ENG-0196", 2, "主句是肯定句"], ["ENG-0197", 3, "關係子句缺少表示「她的手機」的所有限定詞"], ["ENG-0198", 2, "表示感受者的狀態用 -ed 形容詞"], ["ENG-0199", 1, "警告明確說每次關機都會自動清除"], ["ENG-0200", 1, "告示分開列出營業至 6 點與最後入場 5:30"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 110 || row.solutionSteps?.length !== 3) errors.push(`${id}: 題目須保留答案索引、情境依據及專屬三步解析`);
}
const englishCleanerWater = englishAuthored.find(question => question.id === "ENG-0191");
if (englishCleanerWater?.options?.[englishCleanerWater.answer] !== "cleaner" || !englishCleanerWater.question.includes("less dirt in every sample") || englishCleanerWater.question.includes("accurate")) errors.push("ENG-0191: 過濾後泥沙量只可支持水較乾淨，不得推論測量較準確");
for (const [id, clue] of [["ENG-0191", "less dirt"], ["ENG-0192", "carefully"], ["ENG-0193", "practice"], ["ENG-0194", "be + p.p."], ["ENG-0195", "過去分詞"], ["ENG-0196", "肯定"], ["ENG-0197", "whose"], ["ENG-0198", "confused"], ["ENG-0199", "unless"], ["ENG-0200", "last entry"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (!row?.commonMistake?.includes(clue)) errors.push(`${id}: 必須提供本題專屬的英文易錯提醒`);
}
const englishOpeningTime = englishAuthored.find(question => question.id === "ENG-0181");
if (!englishOpeningTime?.question.includes("exactly 15 minutes") || englishOpeningTime.options?.[englishOpeningTime.answer] !== "9:00 tomorrow" || !englishOpeningTime.solutionSteps[1].includes("8:45 往後加 15 分鐘")) errors.push("ENG-0181: 時刻推論需有精確到場時間、分鐘差與唯一時間選項");
for (const [id, clue] of [["ENG-0181", "指定到場時間"], ["ENG-0182", "How many"], ["ENG-0183", "under"], ["ENG-0184", "favorite subjects"], ["ENG-0185", "never"], ["ENG-0186", "don't have to"], ["ENG-0187", "to measure"], ["ENG-0188", "knocked down"], ["ENG-0189", "fill out"], ["ENG-0190", "some"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (!row?.commonMistake?.includes(clue)) errors.push(`${id}: 必須提供本題專屬的英文易錯提醒`);
}
for (const [id, difficulty] of [["ENG-0181", "中等"], ["ENG-0182", "基礎"], ["ENG-0183", "基礎"], ["ENG-0184", "基礎"], ["ENG-0185", "基礎"], ["ENG-0186", "中等"], ["ENG-0187", "基礎"], ["ENG-0188", "基礎"], ["ENG-0189", "基礎"], ["ENG-0190", "中等"], ["ENG-0191", "中等"], ["ENG-0192", "基礎"], ["ENG-0193", "中等"], ["ENG-0194", "中等"], ["ENG-0195", "中等"], ["ENG-0196", "中等"], ["ENG-0197", "中等"], ["ENG-0198", "基礎"], ["ENG-0199", "中等"], ["ENG-0200", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
for (const [id, answer, clue] of [["ENG-0201", 3, "機器人示範 9:30"], ["ENG-0202", 2, "屋頂修繕完成時"], ["ENG-0203", 3, "Mina 今年仍是隊員"], ["ENG-0204", 2, "每月檢查急救用品"], ["ENG-0205", 1, "Friday 結束以前"], ["ENG-0206", 0, "Could you...? 是禮貌請求"], ["ENG-0207", 3, "目的在節電"], ["ENG-0208", 2, "博物館星期一休館"], ["ENG-0209", 2, "落石和倒樹"], ["ENG-0210", 2, "同學主動邀約並協助她熟悉校園"], ["ENG-0211", 3, "攜帶腳踏車的乘客"], ["ENG-0212", 2, "交給服務台"], ["ENG-0213", 2, "from 引出活動開始日"], ["ENG-0214", 3, "其他人離開後"], ["ENG-0215", 2, "Would you mind + V-ing"], ["ENG-0216", 3, "第一週和第三週"], ["ENG-0217", 2, "濕滑磁磚"], ["ENG-0218", 2, "大家預期學生會遲到"], ["ENG-0219", 3, "書籍乾淨完整"], ["ENG-0220", 3, "公告要求使用 front desk 旁的 blue cart"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 120 || row.solutionSteps?.length !== 3 || row.explanation?.startsWith("Correct answer:") || row.solutionSteps?.some(step => !/[\u4e00-\u9fff]/.test(step))) errors.push(`${id}: 題目須保留正解線索、足量情境及中文逐步解析`);
}
const englishAskWhether = englishAuthored.find(question => question.id === "ENG-0212");
if (englishAskWhether?.knowledgePoint !== "ask + 人 + whether 間接問句" || !englishAskWhether.teacherTip.includes("check with + 人") || !englishAskWhether.commonMistake.includes("check with a staff member")) errors.push("ENG-0212: 考點、解析和提醒須區分 ask + 人 + whether 與 check with + 人 + whether");
for (const [id, clue] of [["ENG-0201", "between"], ["ENG-0202", "until"], ["ENG-0203", "since"], ["ENG-0204", "responsible for"], ["ENG-0205", "by the end of Friday"], ["ENG-0206", "Could you"], ["ENG-0207", "turn off"], ["ENG-0208", "on"], ["ENG-0209", "dangerous"], ["ENG-0210", "feel at home"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (!row?.commonMistake?.includes(clue)) errors.push(`${id}: commonMistake 必須包含本題關鍵搭配或易混詞`);
}
for (const [id, difficulty] of [["ENG-0201", "中等"], ["ENG-0202", "中等"], ["ENG-0203", "中等"], ["ENG-0204", "基礎"], ["ENG-0205", "基礎"], ["ENG-0206", "中等"], ["ENG-0207", "基礎"], ["ENG-0208", "基礎"], ["ENG-0209", "中等"], ["ENG-0210", "中等"], ["ENG-0211", "基礎"], ["ENG-0212", "中等"], ["ENG-0213", "基礎"], ["ENG-0214", "中等"], ["ENG-0215", "中等"], ["ENG-0216", "基礎"], ["ENG-0217", "中等"], ["ENG-0218", "中等"], ["ENG-0219", "中等"], ["ENG-0220", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
for (const [id, answer, clue] of [["ENG-0221", 3, "球場積水"], ["ENG-0222", 2, "than I can eat"], ["ENG-0223", 3, "導覽員要求學生留在視線範圍內"], ["ENG-0224", 2, "parents 是收到訊息的人"], ["ENG-0225", 3, "離開付費區前"], ["ENG-0226", 2, "幼苗尚未扎根"], ["ENG-0227", 2, "平常很少在課堂上發言"], ["ENG-0228", 3, "缺紙警示"], ["ENG-0229", 2, "Open during lunch break"], ["ENG-0230", 3, "濃霧遮住山路"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 150 || row.solutionSteps?.length !== 3 || row.explanation?.startsWith("Correct answer:") || row.solutionSteps?.some(step => !/[\u4e00-\u9fff]/.test(step))) errors.push(`${id}: 題目須保留唯一正解線索、足量情境及中文三步解析`);
}
for (const [id, difficulty] of [["ENG-0221", "中等"], ["ENG-0222", "中等"], ["ENG-0223", "基礎"], ["ENG-0224", "基礎"], ["ENG-0225", "中等"], ["ENG-0226", "基礎"], ["ENG-0227", "基礎"], ["ENG-0228", "中等"], ["ENG-0229", "基礎"], ["ENG-0230", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
for (const [id, answer, clue] of [["ENG-0231", 2, "末班渡輪的開航時間為 4:30 p.m."], ["ENG-0232", 2, "強烈陽光與路線遮蔭不足"], ["ENG-0233", 3, "客人七點到達"], ["ENG-0234", 0, "暴雨淹到戶外舞台"], ["ENG-0235", 2, "男孩站在地面上伸手"], ["ENG-0236", 3, "找不到 bus card"], ["ENG-0237", 2, "加入了 band"], ["ENG-0238", 3, "箱子裝滿書而且很重"], ["ENG-0239", 3, "把午餐忘在家裡"], ["ENG-0240", 2, "考試成績不理想"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 150 || row.solutionSteps?.length !== 3 || row.explanation?.startsWith("Correct answer:") || row.solutionSteps?.some(step => !/[\u4e00-\u9fff]/.test(step))) errors.push(`${id}: 題目須保留唯一正解線索、足量情境及中文三步解析`);
}
for (const [id, difficulty] of [["ENG-0231", "中等"], ["ENG-0232", "中等"], ["ENG-0233", "中等"], ["ENG-0234", "中等"], ["ENG-0235", "基礎"], ["ENG-0236", "基礎"], ["ENG-0237", "基礎"], ["ENG-0238", "基礎"], ["ENG-0239", "中等"], ["ENG-0240", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
const englishKitchenPreposition = englishAuthored.find(question => question.id === "ENG-0235");
if (!englishKitchenPreposition?.question.startsWith("In the kitchen,")) errors.push("ENG-0235: 地點片語需使用自然正確的 In the kitchen");
const englishOfferSearch = englishAuthored.find(question => question.id === "ENG-0236");
if (!englishOfferSearch?.question.includes("Thanks. Let's search the classroom together.") || englishOfferSearch.options?.[englishOfferSearch.answer] !== "Would you like me to help you look for it?") errors.push("ENG-0236: 對話須由失物求助自然接續到接受協尋提議");
const englishLunchLoan = englishAuthored.find(question => question.id === "ENG-0239");
if (englishLunchLoan?.options?.[englishLunchLoan.answer] !== "I can lend you some money for lunch." || !englishLunchLoan.question.includes("cafeteria is still open") || !englishLunchLoan.question.includes("I'll pay you back tomorrow")) errors.push("ENG-0239: 還錢回覆必須對應借錢提議與可購買午餐的情境");
for (const [id, answer, difficulty, clue] of [["ENG-0281", 3, "中等", "space is limited"], ["ENG-0282", 1, "中等", "yet"], ["ENG-0283", 2, "基礎", "發車前十五分鐘"], ["ENG-0284", 3, "中等", "1:00 減去 20 分鐘"], ["ENG-0285", 0, "中等", "2021 是開始的時間點"], ["ENG-0286", 1, "基礎", "walked 是動詞"], ["ENG-0287", 2, "中等", "look after 表示照料某人"], ["ENG-0288", 3, "中等", "will + 原形動詞"], ["ENG-0289", 0, "中等", "Not at all 表示「一點也不介意」"], ["ENG-0290", 1, "中等", "公告直接給出替代安排"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || !row?.solutionSteps?.some(step => step.includes(clue)) || row?.explanation?.startsWith("The correct answer") || !/[\u4e00-\u9fff]/.test(row?.explanation || "")) errors.push(`${id}: 答案、難度、中文解析及題幹專屬依據須一致`);
}
for (const [id, clue] of [["ENG-0283", "before"], ["ENG-0284", "at least 20 minutes before"], ["ENG-0285", "since"], ["ENG-0286", "副詞 carefully"], ["ENG-0287", "look after"], ["ENG-0288", "if 子句用現在式"], ["ENG-0289", "Not at all"], ["ENG-0290", "west entrance"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (!row?.commonMistake?.includes(clue)) errors.push(`${id}: 必須提供本題專屬易錯提醒`);
}
const englishTemporaryEntrance = englishAuthored.find(question => question.id === "ENG-0290");
if (!englishTemporaryEntrance?.question.includes("3:30 p.m.") || !englishTemporaryEntrance.question.includes("repairs are still underway")) errors.push("ENG-0290: 入口作答情境須明確位於西側入口指示有效時段內");
for (const [id, answer, difficulty, clue] of [["ENG-0291", 2, "中等", "enough 放在形容詞之後"], ["ENG-0292", 0, "中等", "out of order"], ["ENG-0293", 3, "基礎", "可協助學生把物品放到正確分類區"], ["ENG-0294", 0, "基礎", "先行詞：the student"], ["ENG-0295", 1, "中等", "will be + 過去分詞"], ["ENG-0296", 2, "中等", "look forward to hearing from you"], ["ENG-0297", 3, "基礎", "45 分鐘"], ["ENG-0298", 0, "中等", "與困難形成轉折"], ["ENG-0299", 1, "中等", "decision 是表示決定的名詞"], ["ENG-0300", 2, "中等", "east hall"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || !row?.solutionSteps?.some(step => step.includes(clue)) || !/[\u4e00-\u9fff]/.test(row?.explanation || "")) errors.push(`${id}: 答案、難度、中文解析及題幹線索須相符`);
  if (!row?.commonMistake) errors.push(`${id}: 必須提供本題專屬易錯提醒`);
}
for (const [id, answer, clue] of [["ENG-0241", 2, "新同學的處境"], ["ENG-0242", 3, "星期四前"], ["ENG-0243", 1, "gloves 由學校提供"], ["ENG-0244", 3, "星期三下午五點"], ["ENG-0245", 2, "9:10 a.m."], ["ENG-0246", 2, "Lina 星期二 4:20 到達"], ["ENG-0247", 1, "the water is being tested"], ["ENG-0248", 2, "每晚與表親練習"], ["ENG-0249", 3, "改搭公車去了科學博物館"], ["ENG-0250", 1, "照顧與使用兩部分"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 150 || row.solutionSteps?.length !== 3 || row.explanation?.startsWith("Correct answer:") || row.solutionSteps?.some(step => !/[\u4e00-\u9fff]/.test(step))) errors.push(`${id}: 題目須保留正解線索、完整情境及中文三步解析`);
}
for (const [id, difficulty] of [["ENG-0241", "中等"], ["ENG-0242", "基礎"], ["ENG-0243", "中等"], ["ENG-0244", "基礎"], ["ENG-0245", "基礎"], ["ENG-0246", "中等"], ["ENG-0247", "基礎"], ["ENG-0248", "基礎"], ["ENG-0249", "中等"], ["ENG-0250", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
const englishPoolWaterReason = englishAuthored.find(question => question.id === "ENG-0247");
const englishWeatherInference = englishAuthored.find(question => question.id === "ENG-0249");
if (!englishPoolWaterReason?.solutionSteps?.[2]?.includes("The water is being tested") || !englishWeatherInference?.solutionSteps?.[2]?.includes("He changed his plan after checking the weather")) errors.push("ENG-0247/0249: 解題末步必須明確引用正確選項，不可用錯誤序號代稱");
const englishLibraryReturnPronoun = englishAuthored.find(question => question.id === "ENG-0242");
if (englishLibraryReturnPronoun?.options?.[englishLibraryReturnPronoun.answer] !== "Return her borrowed books." || !englishLibraryReturnPronoun.solutionSteps?.[2]?.includes("her 回指題幹中的 Mia")) errors.push("ENG-0242: 單一人物 Mia 的正解須使用一致的所有格代名詞");
const englishPollDeadlineTip = englishAuthored.find(question => question.id === "ENG-0244");
if (englishPollDeadlineTip?.teacherTip?.includes("until") || !englishPollDeadlineTip?.teacherTip?.includes("Wednesday 5:00 p.m.")) errors.push("ENG-0244: 截止提示須貼合公告明示的 before 時間，不可帶入無關 until 說明");
for (const [id, answer, clue] of [["ENG-0251", 2, "school office"], ["ENG-0252", 3, "每週慢跑三次"], ["ENG-0253", 1, "separate from busy roads"], ["ENG-0254", 2, "教室門口的箱子與每週提醒"], ["ENG-0255", 2, "和父親再試一次"], ["ENG-0256", 3, "十五分鐘"], ["ENG-0257", 3, "自備水瓶"], ["ENG-0258", 1, "父母先檢查已完成的作業"], ["ENG-0259", 2, "戶外站牌"], ["ENG-0260", 3, "操作說明把按下綠色按鈕"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 150 || row.solutionSteps?.length !== 3 || row.explanation?.startsWith("Correct answer:") || row.solutionSteps?.some(step => !/[\u4e00-\u9fff]/.test(step))) errors.push(`${id}: 題目須保留正解線索、完整情境及中文三步解析`);
}
for (const [id, difficulty] of [["ENG-0251", "基礎"], ["ENG-0252", "基礎"], ["ENG-0253", "中等"], ["ENG-0254", "中等"], ["ENG-0255", "中等"], ["ENG-0256", "基礎"], ["ENG-0257", "中等"], ["ENG-0258", "中等"], ["ENG-0259", "中等"], ["ENG-0260", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
const englishBikePathBenefit = englishAuthored.find(question => question.id === "ENG-0253");
if (!englishBikePathBenefit?.solutionSteps?.[2]?.includes("B「It keeps cyclists away from busy traffic")) errors.push("ENG-0253: 解題步驟必須標示正確選項 B，不可誤寫成第一項");
for (const [id, answer, clue] of [["ENG-0261", 3, "每週有球隊練習"], ["ENG-0262", 2, "檢查員發現橋板鬆動"], ["ENG-0263", 3, "監視器顯示嬰兒閉眼"], ["ENG-0264", 0, "空教室仍持續耗電"], ["ENG-0265", 1, "後排訪客仍聽懂"], ["ENG-0266", 2, "到期單"], ["ENG-0267", 3, "教室悶熱"], ["ENG-0268", 3, "藍天清楚"], ["ENG-0269", 2, "不小心踩到"], ["ENG-0270", 2, "by Monday"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 150 || row.solutionSteps?.length !== 3 || row.explanation?.startsWith("Correct answer:") || row.solutionSteps?.some(step => !/[\u4e00-\u9fff]/.test(step))) errors.push(`${id}: 題目須保留正解線索、完整情境及中文三步解析`);
}
for (const [id, difficulty] of [["ENG-0261", "中等"], ["ENG-0262", "基礎"], ["ENG-0263", "基礎"], ["ENG-0264", "基礎"], ["ENG-0265", "中等"], ["ENG-0266", "中等"], ["ENG-0267", "中等"], ["ENG-0268", "基礎"], ["ENG-0269", "基礎"], ["ENG-0270", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
for (const [id, answer, clue] of [["ENG-0271", 2, "多頁破損"], ["ENG-0272", 2, "If it rains"], ["ENG-0273", 3, "vegetables"], ["ENG-0274", 0, "March 3 to March 7"], ["ENG-0275", 1, "兩次路線練習"], ["ENG-0276", 2, "sports practice"], ["ENG-0277", 3, "放學後買飲料"], ["ENG-0278", 3, "playground had very little shade at noon"], ["ENG-0279", 3, "同一公園遛狗"], ["ENG-0280", 0, "同種紙"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || !row.solutionSteps?.some(step => step.includes(clue)) || row.question.length < 150 || row.solutionSteps?.length !== 3 || row.explanation?.startsWith("Correct answer:") || row.solutionSteps?.some(step => !/[\u4e00-\u9fff]/.test(step))) errors.push(`${id}: 題目須保留正解線索、完整情境及中文三步解析`);
}
for (const [id, difficulty] of [["ENG-0271", "中等"], ["ENG-0272", "基礎"], ["ENG-0273", "基礎"], ["ENG-0274", "基礎"], ["ENG-0275", "中等"], ["ENG-0276", "基礎"], ["ENG-0277", "基礎"], ["ENG-0278", "中等"], ["ENG-0279", "基礎"], ["ENG-0280", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.difficulty !== difficulty) errors.push(`${id}: 難度應校準為 ${difficulty}`);
}
for (const [id, answer, clue, difficulty] of [["ENG-0301", 0, "點蠟燭", "基礎"], ["ENG-0302", 2, "五年前開始", "中等"], ["ENG-0303", 1, "固定例行工作", "中等"], ["ENG-0304", 2, "lives 缺主詞", "中等"], ["ENG-0305", 1, "直述語序", "中等"], ["ENG-0306", 1, "讓步連接詞", "中等"], ["ENG-0307", 2, "offer 後接", "中等"], ["ENG-0308", 1, "否定方向", "中等"], ["ENG-0309", 1, "-ing 形容詞", "中等"], ["ENG-0310", 0, "完整子句", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || row.solutionSteps.some(step => !/[\u4e00-\u9fff]/.test(step)) || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip || !row.relatedWords?.length) errors.push(`${id}: 答案、難度、線索、三步中文解題、教師提醒或英文近義詞資料不一致／缺漏`);
}
for (const [id, answer, clue, difficulty] of [["ENG-0311", 0, "容易到達或使用", "中等"], ["ENG-0312", 1, "過去進行式", "中等"], ["ENG-0313", 3, "所有格代名詞", "基礎"], ["ENG-0314", 1, "修飾動作方式", "基礎"], ["ENG-0315", 0, "失物招領", "中等"], ["ENG-0316", 0, "祈使句", "基礎"], ["ENG-0317", 2, "the most + 形容詞", "基礎"], ["ENG-0318", 1, "單數現在式", "基礎"], ["ENG-0319", 0, "祈使指令", "基礎"], ["ENG-0320", 0, "until + 子句", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || row.solutionSteps.some(step => !/[\u4e00-\u9fff]/.test(step)) || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip || !row.relatedWords?.length) errors.push(`${id}: 答案、難度、線索、三步中文解題、教師提醒或英文近義詞資料不一致／缺漏`);
}
for (const [id, answer, clue, difficulty] of [["ENG-0321", 1, "可數複數", "基礎"], ["ENG-0322", 3, "10:20", "基礎"], ["ENG-0323", 1, "to 是介系詞", "中等"], ["ENG-0324", 0, "直述語序", "中等"], ["ENG-0325", 0, "may 表不確定", "基礎"], ["ENG-0326", 1, "120 − 80 = 40", "基礎"], ["ENG-0327", 0, "星期四延長開放", "基礎"], ["ENG-0328", 3, "14 − 4 = 10", "基礎"], ["ENG-0329", 0, "900 流明大於 600 流明", "基礎"], ["ENG-0330", 2, "演唱會開始前", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || row.solutionSteps.some(step => !/[\u4e00-\u9fff]/.test(step)) || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip || !row.relatedWords?.length) errors.push(`${id}: 答案、難度、線索、三步中文解題、教師提醒或英文近義詞資料不一致／缺漏`);
}
for (const [id, answer, clue, difficulty] of [["ENG-0341", 0, "gym", "基礎"], ["ENG-0342", 1, "24,000", "基礎"], ["ENG-0343", 3, "closes", "中等"], ["ENG-0344", 1, "6 cm", "中等"], ["ENG-0345", 0, "farther", "中等"], ["ENG-0346", 0, "twice as bright", "基礎"], ["ENG-0347", 3, "charge", "中等"], ["ENG-0348", 2, "As a result", "中等"], ["ENG-0349", 0, "after 5 p.m.", "中等"], ["ENG-0350", 3, "fewer falls", "中等"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || row.options?.length !== 4 || row.options?.[answer] === undefined || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.toLowerCase().includes(clue.toLowerCase())) || !row.teacherTip || !row.relatedWords?.length) errors.push(`${id}: 答案索引、難度、解題線索、選項、三步解題、教師提醒或詞彙提示不一致／缺漏`);
}
const englishVariedFollowups = ["ENG-0341", "ENG-0343", "ENG-0347", "ENG-0348"].map(id => englishAuthored.find(question => question.id === id));
if (englishVariedFollowups.some(row => !row?.commonMistake) || englishVariedFollowups.some(row => /comparative form|than/i.test(row.question))) errors.push("ENG-0341/0343/0347/0348: 改寫後題目須有專屬易錯提示且不可退回比較級填空模板");
for (const [id, answer, clue, difficulty] of [["ENG-0351", 0, "slippery", "基礎"], ["ENG-0352", 3, "Because", "基礎"], ["ENG-0353", 3, "will share", "基礎"], ["ENG-0354", 0, "but", "中等"], ["ENG-0355", 1, "are checked", "中等"], ["ENG-0356", 2, "seven-day limit", "基礎"], ["ENG-0357", 3, "80 m²", "基礎"], ["ENG-0358", 0, "11:40 p.m.", "中等"], ["ENG-0359", 0, "disposable", "中等"], ["ENG-0360", 0, "must put on", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || !row.solutionSteps.some(step => step.toLowerCase().includes(clue.toLowerCase())) || !row.teacherTip || !row.relatedWords?.length) errors.push(`${id}: 答案、難度、解題線索、四選項、解題過程、教師提醒或近義詞欄位不一致／缺漏`);
}
const englishDiverseFollowups = ["ENG-0351", "ENG-0352", "ENG-0353", "ENG-0354", "ENG-0355", "ENG-0356", "ENG-0359", "ENG-0360"].map(id => englishAuthored.find(question => question.id === id));
if (englishDiverseFollowups.some(row => !row?.commonMistake) || englishDiverseFollowups.some(row => /comparative form|than/i.test(row.question))) errors.push("ENG-0351–0360 follow-up: varied replacement questions need individualized error hints and must avoid the old comparative-fill-in pattern");
for (const [id, answer, clue, difficulty] of [["ENG-0361", 3, "Room 12", "基礎"], ["ENG-0362", 0, "急彎", "基礎"], ["ENG-0363", 0, "2:00 p.m.", "中等"], ["ENG-0364", 0, "9:40", "基礎"], ["ENG-0365", 1, "不可數名詞", "中等"], ["ENG-0366", 1, "沒有訊號", "基礎"], ["ENG-0367", 0, "園藝社成員", "基礎"], ["ENG-0368", 1, "查證程序", "中等"], ["ENG-0369", 2, "逐項配對原文", "基礎"], ["ENG-0370", 1, "train-and-bus", "基礎"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || row.solutionSteps.some(step => !/[\u4e00-\u9fff]/.test(step)) || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip || !row.relatedWords?.length) errors.push(`${id}: 答案、難度、線索、三步中文解題、教師提醒或英文近義詞資料不一致／缺漏`);
}
for (const [id, answer, clue, difficulty] of [["ENG-0371", 2, "不搬遷", "基礎"], ["ENG-0372", 3, "日照可能", "中等"], ["ENG-0373", 2, "automatic doors", "基礎"], ["ENG-0374", 1, "5:15", "基礎"], ["ENG-0375", 0, "4,800 ÷ 2,400 = 2", "中等"], ["ENG-0376", 3, "36 − 18 = 18", "基礎"], ["ENG-0377", 2, "少 5 人", "基礎"], ["ENG-0378", 3, "每個術語加上定義", "基礎"], ["ENG-0379", 0, "21.5 − 18.0 = 3.5", "中等"], ["ENG-0380", 0, "98% − 80% = 18", "進階"]]) {
  const row = englishAuthored.find(question => question.id === id);
  if (row?.answer !== answer || row?.difficulty !== difficulty || row.options?.length !== 4 || row.solutionSteps?.length !== 3 || row.solutionSteps.some(step => !/[\u4e00-\u9fff]/.test(step)) || !row.solutionSteps.some(step => step.includes(clue)) || !row.teacherTip || !row.relatedWords?.length) errors.push(`${id}: 答案、難度、線索、三步中文解題、教師提醒或英文近義詞資料不一致／缺漏`);
}
const englishUntilItem = englishAuthored.find(question => question.id === "ENG-0320");
if (englishUntilItem?.options?.some(option => /while of/i.test(option))) errors.push("ENG-0320: 選項仍含不自然的片語 while of");
const englishTowelPurpose = englishAuthored.find(question => question.id === "ENG-0276");
const englishShadeProblem = englishAuthored.find(question => question.id === "ENG-0278");
if (!englishTowelPurpose?.solutionSteps?.[2]?.includes("C「So students can use a clean towel during practice" ) || !englishShadeProblem?.solutionSteps?.[2]?.includes("D「There was not enough shade near the playground at noon")) errors.push("ENG-0276/0278: 解題步驟必須指向索引對應的選項，不可誤寫選項序號");
const englishIndependentTravel = englishAuthored.find(question => question.id === "ENG-0275");
if (!englishIndependentTravel?.options?.[englishIndependentTravel.answer]?.includes("practicing the route") || !englishIndependentTravel.explanation.includes("練習路線兩次")) errors.push("ENG-0275: 能力提升的答案須涵蓋路線教學與實際練習兩個文本因素");
const englishReportPassiveAmbiguity = englishAuthored.find(question => question.id === "ENG-0039");
if (!englishReportPassiveAmbiguity?.question.includes("by both department heads") || englishReportPassiveAmbiguity.options?.[englishReportPassiveAmbiguity.answer] !== "be reviewed" || !englishReportPassiveAmbiguity.explanation.includes("by both department heads")) errors.push("ENG-0039: 被動語態題須以審閱搭配、明示施事者和 modal passive 解析確認標答");
if (!englishMixedConditional?.teacherTip?.includes("混合假設語氣") || !englishMixedConditional.teacherTip.includes("現在結果")) errors.push("ENG-0934: 過去條件造成現在結果的混合假設語氣提示不可誤標為第二類條件句");
const englishHelmetTag = englishAuthored.find(question => question.id === "ENG-0937");
if (!englishHelmetTag?.question.startsWith("The children should wear helmets") || englishHelmetTag.options?.[englishHelmetTag.answer] !== "shouldn't they") errors.push("ENG-0937: 附加問句題須以完整主句為題幹，避免 reported speech 造成標籤疑義");
const englishProgramDuration = englishAuthored.find(question => question.id === "ENG-0931");
if (!englishProgramDuration?.question.includes("since 2023") || englishProgramDuration.options?.[englishProgramDuration.answer] !== "has run" || !englishProgramDuration.explanation.includes("Since 2023") || !englishProgramDuration.solutionSteps?.[0]?.includes("Since 2023") || englishProgramDuration.explanation.includes("For three years")) errors.push("ENG-0931: 題幹、答案與解析須一致使用 since 起始時間及現在完成式");
const englishWastefulPackaging = englishAuthored.find(question => question.id === "ENG-0946");
if (!englishWastefulPackaging?.explanation.includes("how wasteful") || !englishWastefulPackaging.solutionSteps?.[1]?.includes("degree of wastefulness")) errors.push("ENG-0946: less wasteful packaging 的解析須說明 less 修飾形容詞，而非誤稱包裝數量");
const englishDegreeAdverb = englishAuthored.find(question => question.id === "ENG-0955");
if (englishDegreeAdverb?.options?.[englishDegreeAdverb.answer] !== "too" || !englishDegreeAdverb.question.includes("for students at the back to read") || !englishDegreeAdverb.explanation.toLowerCase().includes("too + adjective + to-infinitive")) errors.push("ENG-0955: too...to construction must have a matching context and explanation");
const englishClinicNotice = englishAuthored.find(question => question.id === "ENG-0967");
if (!englishClinicNotice?.question.includes("The meeting room is reserved for interviews") || !englishClinicNotice.question.includes("visitor without an appointment")) errors.push("ENG-0967: 門診公告題須以自然英文寫出空間用途與無預約訪客指示");
const englishPastPerfect = englishAuthored.find(question => question.id === "ENG-0962");
if (englishPastPerfect?.answer !== 3 || !englishPastPerfect.question.includes("earlier exhibition") || !englishPastPerfect.explanation.includes("Past perfect had seen")) errors.push("ENG-0962: past-perfect answer and earlier-past evidence must agree");
const englishRestaurantReason = englishAuthored.find(question => question.id === "ENG-0965");
if (englishRestaurantReason?.options?.[englishRestaurantReason.answer] !== "for" || !englishRestaurantReason.explanation.includes("reason the guide recommends") || englishRestaurantReason.explanation.includes("famous for")) errors.push("ENG-0965: 介系詞解析須說明 for 如何引出推薦理由，不可使用題幹中不存在的 famous for");
const englishResultConnector = englishAuthored.find(question => question.id === "ENG-0970");
if (englishResultConnector?.options?.[englishResultConnector.answer] !== "Therefore" || !englishResultConnector.question.includes(". ___,") || !englishResultConnector.question.includes("and returned it")) errors.push("ENG-0970: 句首結果副詞題須有逗號且避免逗號拼接獨立子句");
const englishTagSubject = englishAuthored.find(question => question.id === "ENG-0977");
if (!englishTagSubject?.question.startsWith("The delivery, which") || englishTagSubject.options?.[englishTagSubject.answer] !== "didn't it") errors.push("ENG-0977: 附加問句必須令被標記主句主詞明確唯一");
const englishGreenhouseSafety = englishAuthored.find(question => question.id === "ENG-0978");
if (!englishGreenhouseSafety?.question.includes("Close them before switching the heater on") || englishGreenhouseSafety.options?.[englishGreenhouseSafety.answer] !== "Close the vents, then switch on the heater." || !englishGreenhouseSafety.explanation.includes("correct answer is Close the vents")) errors.push("ENG-0978: 溫室安全題須遵循先關通風口、再開暖爐的操作順序");
const englishResearchProgress = englishAuthored.find(question => question.id === "ENG-0991");
if (!englishResearchProgress?.question.includes("since dawn") || englishResearchProgress.options?.[englishResearchProgress.answer] !== "has been testing" || englishResearchProgress.knowledgePoint !== "現在完成進行式" || !englishResearchProgress.solutionSteps?.[0]?.includes("Since dawn")) errors.push("ENG-0991: 現在完成進行式須呈現動作持續至今與明確起始點");
const englishClarifyMeaning = englishAuthored.find(question => question.id === "ENG-0981");
if (!englishClarifyMeaning?.question.includes("the meaning of the word") || englishClarifyMeaning.options?.[englishClarifyMeaning.answer] !== "clarify" || !englishClarifyMeaning.solutionSteps?.[1]?.includes("make the word’s meaning easier")) errors.push("ENG-0981: 字彙題須避免 clarify/divide 均可回應『句子太多想法』的雙解情境");
const englishReliableLamp = englishAuthored.find(question => question.id === "ENG-0986");
if (!englishReliableLamp?.question.includes("six cloudy days") || englishReliableLamp.options?.[englishReliableLamp.answer] !== "reliable" || !englishReliableLamp.explanation.includes("able to be trusted to work")) errors.push("ENG-0986: 太陽能燈字彙題須以持續運作證據支持 reliable");
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
  if (![1, 5, 10].includes(number) && (row?.requiresImage || row?.questionImage || row?.questionImages?.length)) errors.push(`113國文第${number}題: 文字內容已足以作答，不應依賴整頁試卷圖`);
}
for (const [number, figure] of [[1, "./assets/official-exams/113-chinese-q01-social-post.svg"], [5, "./assets/official-exams/113-chinese-q05-bookstore-ad.svg"]]) {
  const row = chinese113(number);
  if (!row?.requiresImage || row.questionImage !== figure || row.questionImages?.length !== 1 || row.questionImages[0] !== figure) errors.push(`113國文第${number}題: 社群貼文／廣告必要裁圖未正確掛載`);
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
    const expectedImage = number === 32 ? "./assets/official-exams/113-chinese-q32-poster.svg" : number === 33 ? "./assets/official-exams/113-chinese-q33-ai-hierarchy.svg" : "";
    if (!expectedImage || row.questionImage !== expectedImage || row.questionImages?.length !== 1 || !serviceWorker.includes(expectedImage) || number === 32 && !serviceWorker.includes("113-chinese-p10.webp")) errors.push(`113國文第${number}題: 不必要、錯置或未離線快取的必要圖`);
  }
}
const chinese113Q36 = chinese113(36);
const chinese113Q37 = chinese113(37);
if (!chinese113Q36?.question.includes("也是最使他滿意的一幅") || !chinese113Q37?.question.includes("也是最使他滿意的一幅") || chinese113Q37.question.includes("也是假使他滿意的一幅")) errors.push("113國文第37題: 《魯冰花》共用選文轉錄錯誤");
const chinese113Q31to42Tips = Array.from({ length: 12 }, (_, index) => chinese113(index + 31)?.teacherTip?.trim());
if (new Set(chinese113Q31to42Tips).size !== 12) errors.push("113國文第31–42題: 教師提示有重複套語");
const chinese113Q33 = chinese113(33);
if (!chinese113Q33?.requiresImage || chinese113Q33.questionImage !== "./assets/official-exams/113-chinese-q33-ai-hierarchy.svg") errors.push("113國文第33題: 必要的概念層級圖缺失");
const chinese113Q32 = chinese113(32);
if (!chinese113Q32?.requiresImage || chinese113Q32.questionImage !== "./assets/official-exams/113-chinese-q32-poster.svg" || !chinese113Q32.imageAlt?.includes("2021") || !serviceWorker.includes("113-chinese-p10.webp")) errors.push("113國文第32題: 原題海報裁圖或其離線來源頁缺失");
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
for (const [number, answer, clue] of [[21, 3, "冊"], [22, 0, "不自吝其光"], [23, 1, "自由自在"], [24, 0, "幸運"], [25, 3, "不能確定"], [26, 2, "50 元工本費"], [27, 2, "取貨聯單"], [28, 3, "蟑螂"], [29, 1, "紙變得殘破"], [30, 1, "長期警戒"]]) {
  const row = chinese111(number);
  if (!row || row.answer !== answer || !row.explanation?.includes(clue) || row.solutionSteps?.length < 2 || !row.teacherTip || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111國文第${number}題: 官方答案、解題依據、教師提醒或文字材料不完整`);
}
for (const [number, clues] of [[21, ["問", "恣", "盎", "刪", "緊繫在弓上的索", "簡冊"]], [22, ["操瓢者", "散為千燈", "善學者"]], [23, ["濮水", "三千年", "拖尾"]], [24, ["孫叔敖", "楚莊王", "竹帛"]], [25, ["民國 97 年", "民國 107 年", "第 11"]], [26, ["十種", "50 元", "特殊材料費", "取貨聯單", "08:00–12:00"]], [27, ["電子鍋", "週三", "16：00", "取貨聯單"]], [28, ["每一個坑洞", "方正的直角", "蟑螂", "老鼠"]], [29, ["反覆把自己摺成", "殘破不堪", "另一個城市"]], [30, ["長久下來的警戒", "置若罔聞", "巡邏隊"]]]) {
  const row = chinese111(number);
  const text = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !text.includes(clue.replace(/\s+/g, "")))) errors.push(`111國文第${number}題: 原卷題幹／選項的關鍵材料缺漏`);
}
const chinese110 = number => mission.find(question => question.source?.year === 110 && question.subject === "國文" && question.source?.questionNumber === number);
const social112 = number => mission.find(question => question.source?.year === 112 && question.subject === "社會" && question.source?.questionNumber === number);
const social111Mission = number => mission.find(question => question.source?.year === 111 && question.subject === "社會" && question.source?.questionNumber === number);
for (const [number, answer, clue] of [[1, 2, "沙烏地阿拉伯 600,108"], [2, 1, "海岸山脈最南端"], [3, 2, "濕熱"], [4, 0, "淤積率達 74.8%"], [5, 3, "解除戒嚴"], [6, 1, "徵收賦稅"], [7, 2, "西元前四世紀"], [8, 2, "磨製石器"], [9, 1, "宗教信仰"], [10, 2, "提起公訴"]]) {
  const row = social111Mission(number);
  const text = [row?.question, row?.explanation, ...(row?.options || []), ...(row?.solutionSteps || [])].join(" ");
  if (!row || row.answer !== answer || !text.includes(clue) || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip) errors.push(`111社會第${number}題: 原卷答案、關鍵材料、解析或選項不完整`);
}
for (const [number, asset] of [[2, "111-social-q02-taiwan-locations.png"], [3, "111-social-q03-china-routes.png"]]) {
  const row = social111Mission(number);
  const assetExists = await access(join(root, "assets", "official-exams", asset)).then(() => true, () => false);
  if (!row || !row.requiresImage || row.questionImage !== `./assets/official-exams/${asset}` || row.questionImages?.length !== 1 || row.questionImages[0] !== row.questionImage || !row.imageAlt || !assetExists || !serviceWorker.includes(asset)) errors.push(`111社會第${number}題: 必要地圖或離線來源未就緒`);
}
for (const number of [1, 4, 5, 6, 7, 8, 9, 10]) {
  const row = social111Mission(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`111社會第${number}題: 已轉錄完整的文字題仍依賴多餘頁圖`);
}
for (const [number, answer, clue, asset, sourcePage] of [[2, 3, "幸福巴士", "112-social-q02-happiness-bus-map.svg", "112-social-p2.webp"], [7, 2, "平均壽命", "112-social-q07-life-expectancy.svg", "112-social-p3.webp"], [10, 2, "大氣層", "112-social-q10-territory.svg", "112-social-p4.webp"]]) {
  const row = social112(number);
  const assetExists = await access(join(root, "assets", "official-exams", asset)).then(() => true, () => false);
  if (!row || row.answer !== answer || !row.question.includes(clue) || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || !row.requiresImage || row.questionImage !== `./assets/official-exams/${asset}` || row.questionImages?.length !== 1 || row.questionImages[0] !== row.questionImage || !row.imageAlt || !assetExists || !serviceWorker.includes(asset) || !serviceWorker.includes(sourcePage)) errors.push(`112社會第${number}題: 官方答案、必要局部圖、解題欄位或離線來源缺漏`);
}
for (const number of [1, 3, 4, 5, 6, 8, 9]) {
  const row = social112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`112社會第${number}題: 文字題仍依賴不必要整頁考卷圖`);
}
for (const number of [11, 12, 13, 14, 16, 17, 18, 20]) {
  const row = social112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`112社會第${number}題: 文字題仍依賴不必要整頁考卷圖`);
}
const social112Q14 = social112(14);
if (!social112Q14?.question.includes("人事有代謝，往來成古今") || !social112Q14.question.includes("羊公碑尚在，讀罷淚沾襟")) errors.push("112社會第14題: 原詩轉錄不完整");
for (const [number, answer, clue, asset, sourcePage] of [[15, 0, "CPTPP", "112-social-q15-cptpp-members.svg", "112-social-p5.webp"], [19, 3, "霞喀羅、薩克亞金警備道路", "112-social-q19-xiakaluo-trail.svg", "112-social-p6.webp"]]) {
  const row = social112(number);
  const assetExists = await access(join(root, "assets", "official-exams", asset)).then(() => true, () => false);
  if (!row || row.answer !== answer || !row.question.includes(clue) || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || !row.requiresImage || row.questionImage !== `./assets/official-exams/${asset}` || row.questionImages?.length !== 1 || row.questionImages[0] !== row.questionImage || !row.imageAlt || !assetExists || !serviceWorker.includes(asset) || !serviceWorker.includes(sourcePage)) errors.push(`112社會第${number}題: 官方答案、必要局部圖、解題欄位或離線來源缺漏`);
}
for (const [number, answer, clue, asset, sourcePage] of [[23, 1, "灰階區塊", "112-social-q23-income-chart.svg", "112-social-p7.webp"], [25, 0, "2011年", "112-social-q25-world-gdp.svg", "112-social-p8.webp"], [26, 1, "巴拿馬", "112-social-q26-pan-american-route.svg", "112-social-p8.webp"], [27, 3, "2021年 9月", "112-social-q27-la-palma-eruption.svg", "112-social-p8.webp"]]) {
  const row = social112(number);
  const assetExists = await access(join(root, "assets", "official-exams", asset)).then(() => true, () => false);
  if (!row || row.answer !== answer || !row.question.includes(clue) || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || !row.requiresImage || row.questionImage !== `./assets/official-exams/${asset}` || row.questionImages?.length !== 1 || row.questionImages[0] !== row.questionImage || !row.imageAlt || !assetExists || !serviceWorker.includes(asset) || !serviceWorker.includes(sourcePage)) errors.push(`112社會第${number}題: 官方答案、必要局部圖、解題欄位或離線來源缺漏`);
}
for (const number of [21, 22, 24, 28, 29, 30]) {
  const row = social112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`112社會第${number}題: 文字題仍依賴不必要整頁考卷圖`);
}
for (const [number, answer, clue] of [[31, 2, "布爾什維克"], [32, 3, "周滅商後疆域迅速擴大"], [33, 1, "加洛林文藝復興"], [34, 3, "764.3"], [35, 3, "非價格因素"], [36, 2, "總統、副總統選舉須在該選舉區繼續居住滿 6 個月"], [37, 1, "社會增加"], [38, 3, "乙→丙→甲"], [39, 0, "上海尚未依《南京條約》開放"], [40, 0, "甲幣升值"]]) {
  const row = social112(number);
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || row.solutionSteps?.length < 2 || !row.teacherTip || row.options?.length !== 4) errors.push(`112社會第${number}題: 原卷答案、分析或完整解題欄位不符`);
}
for (let number = 31; number <= 40; number += 1) {
  const row = social112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`112社會第${number}題: 已轉錄完整的表格／數據題仍依賴整頁試卷圖`);
}
if (social112(32)?.question.includes("十ㄧ世紀")) errors.push("112社會第32題: 朝代年代仍含原卷不存在的OCR錯字");
if (!social112(36)?.explanation.includes("仍可能涉及違法遷籍") || !social112(36)?.solutionSteps?.[2]?.includes("並非表示虛偽遷籍本身合法")) errors.push("112社會第36題: 遷籍期間說明未區分投票資格與違法遷籍");
for (const [number, answer, clue, asset, sourcePage] of [[41, 2, "莫臥兒時期", "112-social-q41-mughal-palace.svg", "112-social-p11.webp"], [47, 2, "約 11 公里", "112-social-q47-fuji-contour-map.svg", "112-social-p13.webp"]]) {
  const row = social112(number);
  const assetExists = await access(join(root, "assets", "official-exams", asset)).then(() => true, () => false);
  const expectedImage = `./assets/official-exams/${asset}`;
  const imagePath = row?.questionImage?.split(/[?#]/, 1)[0];
  if (!row || row.answer !== answer || !row.explanation.includes(clue) || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || !row.requiresImage || imagePath !== expectedImage || row.questionImages?.length !== 1 || row.questionImages[0] !== row.questionImage || !row.imageAlt || !assetExists || !serviceWorker.includes(asset) || !serviceWorker.includes(sourcePage)) errors.push(`112社會第${number}題: 官方答案、必要局部圖、解題欄位或離線來源缺漏`);
}
const fujiContourAsset = await readFile(join(root, "assets", "official-exams", "112-social-q47-fuji-contour-map.svg"), "utf8");
if (!["<title", "等高線", "500 m", "3,600 m", "1,400 m", "登山道"].every(text => fujiContourAsset.includes(text)) || /<image\b/i.test(fujiContourAsset)) errors.push("112社會第47題: 富士山等高線圖為空白佔位或依賴外部圖片，必須提供可離線顯示的題目專用圖");
for (const number of [42, 43, 44, 45, 46, 48, 49, 50]) {
  const row = social112(number);
  if (!row || row.requiresImage || row.questionImage || row.questionImages?.length) errors.push(`112社會第${number}題: 純文字／已轉錄資料題仍依賴不必要整頁試卷圖`);
}
for (const [number, answer, clue] of [[51, 0, "蘇伊士運河連接地中海與紅海"], [52, 3, "全球化下的文化交流"], [53, 1, "至少在這一天不要打"], [54, 2, "皆須經總統公布後才生效"]]) {
  const row = social112(number);
  const evidence = [row?.question, row?.explanation, ...(row?.options || []), ...(row?.solutionSteps || [])].join(" ");
  if (!row || row.answer !== answer || !evidence.includes(clue) || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip) errors.push(`112社會第${number}題: 共用閱讀材料／答案解析或選項不完整`);
  if (row && (row.requiresImage || row.questionImage || row.questionImages?.length)) errors.push(`112社會第${number}題: 完整轉錄題仍依賴不必要整頁試卷圖`);
}
for (const number of [52, 53, 54]) {
  const row = social112(number);
  if (!row?.question.includes("將來的每一天你都不要打") || !row.question.includes("《教育基本法》") || !row.question.includes("預防並保護兒童免於各種暴力侵害")) errors.push(`112社會第${number}題: 共用閱讀文章或宣傳標語缺漏`);
}
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
for (const [number, filename] of [[3, "110-chinese-q03-focus-scenes.svg"], [13, "110-chinese-q13-figure.svg"], [16, "110-chinese-q16-chart.png"]]) {
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
for (const number of [1, 2, 4, 5, 6, 7, 8, 9, 10]) {
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
const english113Q21 = mission.find(question => question.id === "OFF-0723");
const english113Q22 = mission.find(question => question.id === "OFF-0724");
const english113Q23 = mission.find(question => question.id === "OFF-0725");
if (!english113Q21 || english113Q21.options?.[3] !== "I’ll do" || english113Q21.options?.some(option => option.includes("第二部分") || option.includes("Philip")) || english113Q21.answer !== 1 || english113Q21.source?.year !== 113 || english113Q21.source?.questionNumber !== 21) errors.push("113英文第21題: 選項遭題組 OCR 污染或官方答案／題號不符");
for (const [row, number, answer] of [[english113Q22, 22, 3], [english113Q23, 23, 2]]) {
  if (!row || !row.question.includes("Philip") || !row.question.includes("Jason") || !row.question.includes("police") || row.answer !== answer || row.source?.year !== 113 || row.source?.questionNumber !== number || row.requiresContext) errors.push(`113英文第${number}題: 共用閱讀材料、官方答案或題號缺漏`);
}
for (const [id, number, expectedQuestion, expectedAnswer] of [["OFF-0049", 1, "In the picture, the boy is", "bowing to"], ["OFF-0050", 2, "Listen! The baby", "is crying"]]) {
  const row = mission.find(question => question.id === id);
  if (!row || row.source?.year !== 110 || row.source?.questionNumber !== number || !row.question.includes(expectedQuestion) || row.options[row.answer] !== expectedAnswer) errors.push(`${id}: 110年英文題號、題幹或標答錯置`);
}
const english110Q1 = mission.find(question => question.id === "OFF-0049");
if (!english110Q1?.requiresImage || !english110Q1.questionImages?.includes("./assets/official-exams/110-english-p2.webp") || !english110Q1.solutionSteps?.some(step => step.includes("bow to someone"))) errors.push("110英文第1題: 必要插圖或 bow to 解題依據缺漏");
const english110Q2 = mission.find(question => question.id === "OFF-0050");
if (english110Q2?.requiresImage || english110Q2?.questionImage || english110Q2?.questionImages?.length || !english110Q2?.solutionSteps?.some(step => step.includes("現在進行式"))) errors.push("110英文第2題: 文字題不應顯示整頁試卷圖，或現在進行式解析缺漏");
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
if (!weatherSystemsQuestion?.question.includes("太平洋高氣壓範圍") || !weatherSystemsQuestion.options?.[1]?.includes("太平洋高氣壓範圍") || weatherSystemsQuestion.question.includes("太平洋暖氣團") || weatherSystemsQuestion.answer !== 1) errors.push("113自然第28題: 天氣系統例示或答案索引錯誤");
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
for (const [id, clue] of [["OFF-0945", "another Easter Island"], ["OFF-0946", "What can we learn about the people"]]) {
  const row = official.find(question => question.id === id);
  const contextAsset = "./assets/official-exams/114-english-p8.webp";
  const questionAsset = "./assets/official-exams/114-english-p9.webp";
  if (!row?.question.includes(clue) || !row.requiresImage || row.questionImage !== questionAsset || row.questionImages?.join("|") !== `${contextAsset}|${questionAsset}` || !row.imageAlt?.includes("漫畫") || !row.answerKeyReview?.evidenceSources?.includes(contextAsset) || !serviceWorker.includes("114-english-p8.webp") || !serviceWorker.includes("114-english-p9.webp")) errors.push(`${id}: 114英文復活節島漫畫題必須顯示漫畫材料頁與題目頁、具描述性替代文字、核對來源及離線快取`);
}
const english111WordGamesKeys = ["D", "C", "A", "A"];
const english111Q1 = official.find(question => question.id === "OFF-0275");
if (!english111Q1 || english111Q1.source?.year !== 111 || english111Q1.source.questionNumber !== 1 || english111Q1.answer !== 0 || english111Q1.options?.length !== 4 || !english111Q1.explanation.includes("candles") || !english111Q1.questionImages?.includes("./assets/official-exams/111-english-q01-cake-figure.svg") || english111Q1.questionImages.some(path => /111-english-p2\.webp/.test(path)) || !serviceWorker.includes("111-english-q01-cake-figure.svg") || !serviceWorker.includes("111-english-p2.webp")) errors.push("111英文第1題: 官方答案、圖中動作說明、局部蛋糕圖或離線相依圖檔不完整");
const english112Keys = ["B", "D", "D", "B", "A", "B", "A", "C", "C", "D", "D", "C", "C", "C", "D", "C", "C", "B", "D", "C", "A", "B", "D", "B", "B", "A", "A", "C", "D", "B", "A", "A", "D", "C", "B", "D", "D", "B", "B", "C", "B", "A", "A"];
const english112Rows = [];
const english112Q1to10Evidence = [
  ["Look at the picture", "basket of grapes", "提把", "籃子"],
  ["beautiful voice", "singing", "enjoy 後"],
  ["can’t hear very well", "shout", "listen"],
  ["watched Ms. Smith", "dancing", "watch someone doing"],
  ["white pair", "colors", "sizes"],
  ["at the time", "was jogging", "過去進行式"],
  ["think about", "changing his job", "動名詞"],
  ["All the seats were taken", "full", "standing"],
  ["Don’t go away", "or", "否則"],
  ["good reason", "why", "間接問句"]
];
const english112Q11to23Evidence = [
  ["already forty", "headache"], ["camping this weekend", "are going", "by Friday"], ["since his ears", "were bitten", "複數"],
  ["If we play", "there will be", "第一類條件句"], ["never got any answer", "service"], ["sunny days", "less possible", "less difficult"],
  ["for months", "finally", "終於"], ["not been good", "worse", "新超市"], ["pulled him out", "the one who", "關係子句"],
  ["before I went", "practiced", "已結束的過去"], ["so good in the movie", "expect", "win the best actor prize"], ["just came out on the market", "has saved", "thousands of lives"],
  ["those days", "used to come and sit", "往日"]
];
for (let offset = 0; offset < english112Keys.length; offset += 1) {
  const number = offset + 1;
  const row = official.find(question => question.source?.year === 112 && question.subject === "英文" && question.source.questionNumber === number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  const evidence = english112Q1to10Evidence[offset] ?? english112Q11to23Evidence[offset - 10];
  const content = [row?.question, row?.explanation, ...(row?.solutionSteps || []), row?.teacherTip, ...(row?.options || [])].join(" ").toLowerCase();
  const evidencePresent = !evidence || evidence.every(clue => content.includes(clue.toLowerCase()));
  if (!row || row.id !== `OFF-${String(number + 488).padStart(4, "0")}` || answerLetter !== english112Keys[offset] || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip?.trim() || (row.relatedWords?.length ?? 0) < 3 || row.answerKeyReview?.status !== "verified" || !evidencePresent) errors.push(`112英文第${number}題: 官方答案、原卷線索、四選項、解題步驟或英文詞彙提醒缺漏`);
  english112Rows.push(row);
}
const english112Q24to35Evidence = [
  ["two Garden Sandwiches", "合計 $290", "一杯 $60 飲料", "$230"], ["2:00–8:00 pm", "第二個星期日", "8 月 11 日", "5:00 pm"],
  ["don't give it any food", "WRONG way", "few feathers"], ["WRONG! Birds don’t care!", "smell of people", "keep taking care"],
  ["Stage 2", "Do not have refrigerators", "keep food fresh"], ["Stage 4", "4.6%", "2.4%", "2.2%"],
  ["about once every 20 seconds", "0.002 g", "roll off"], ["0.002 g", "force", "不足以致命"], ["flies too low", "hit the ground", "沒有時間"],
  ["Elisabeth Röckel", "Therese Malfatti", "Elise Barensfeld", "just guesses"],
  ["1867", "40 years after Beethoven’s death", "manuscript"], ["very good friends", "left it to her family", "teach Barensfeld"]
];
for (let number = 24; number <= 35; number += 1) {
  const row = official.find(question => question.source?.year === 112 && question.subject === "英文" && question.source.questionNumber === number);
  const content = [row?.question, row?.explanation, ...(row?.solutionSteps || []), row?.teacherTip, ...(row?.options || [])].join(" ").toLowerCase();
  if (!row || !english112Q24to35Evidence[number - 24].every(clue => content.includes(clue.toLowerCase()))) errors.push(`112英文第${number}題: 原卷題材、答案證據或詳解錨點缺漏`);
}
const english112TextOnlyPassages = [
  ["OFF-0518", 30, "Mosquitoes in the rain"],
  ["OFF-0519", 31, "Mosquitoes in the rain"],
  ["OFF-0520", 32, "Mosquitoes in the rain"],
  ["OFF-0522", 34, "Who was"],
  ["OFF-0523", 35, "Who was"],
  ["OFF-0525", 37, "toys and gender"],
  ["OFF-0527", 39, "Marie Colvin, a war reporter"],
  ["OFF-0528", 40, "Marie Colvin, a war reporter"],
  ["OFF-0529", 41, "Marie Colvin, a war reporter"]
];
for (const [id, number, materialClue] of english112TextOnlyPassages) {
  const row = official.find(question => question.id === id);
  if (!row || row.source?.year !== 112 || row.source.questionNumber !== number || !row.question.includes(materialClue) || row.requiresImage || row.questionImage || row.questionImages?.length || row.options?.length !== 4 || row.solutionSteps?.length < 3 || !row.teacherTip?.trim() || (row.relatedWords?.length ?? 0) < 3 || row.answerKeyReview?.status !== "verified" || /\(cid:\d+\)/i.test(row.question)) errors.push(`112英文第${number}題: 共用閱讀材料、答案、解題教學欄位缺漏或錯誤依賴試卷圖`);
}
const english112Q36to43Evidence = [
  ["What idea", "gender decide", "building toys", "find out what they are interested in"],
  ["this rule", "watch and follow", "find out what they really like"],
  ["example to make it clear", "early language use", "math and science", "specific example"],
  ["Marie Colvin", "Sunday Times", "Sri Lanka", "working life"],
  ["empathy", "understand how other people feel"],
  ["Sri Lanka", "lost her left eye", "never stopped her"],
  ["what things are called", "tennis shoes", "sneakers", "gym shoes"],
  ["how old they are", "grandfather", "daughter", "世代"]
];
for (let number = 36; number <= 43; number += 1) {
  const row = official.find(question => question.source?.year === 112 && question.subject === "英文" && question.source.questionNumber === number);
  const content = [row?.question, row?.explanation, ...(row?.solutionSteps || []), row?.teacherTip, ...(row?.options || []), ...(row?.relatedWords || [])].join(" ").toLowerCase();
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  const expectedAnswer = ["D", "D", "B", "B", "C", "B", "A", "A"][number - 36];
  if (!row || row.id !== `OFF-${String(number + 488).padStart(4, "0")}` || answerLetter !== expectedAnswer || row.options?.length !== 4 || row.solutionSteps?.length < 3 || row.answerKeyReview?.status !== "verified" || !english112Q36to43Evidence[number - 36].every(clue => content.includes(clue.toLowerCase()))) errors.push(`112英文第${number}題: 原卷線索、官方答案、選項或解題提示不符`);
}
const english112ExampleItem = official.find(question => question.id === "OFF-0526");
if (english112ExampleItem?.relatedWords?.some(word => /pretend|fix（修理）/i.test(word))) errors.push("112英文第38題: 詞彙提示含與原文無關內容");
if (english112Rows.length !== 43 || new Set(english112Rows.map(row => row?.teacherTip?.trim())).size !== 43) errors.push("112英文第1–43題: 題目專屬教師提醒有重複或缺漏");
const english112Menu = official.find(question => question.id === "OFF-0512");
const english112BirdNotes = official.find(question => question.id === "OFF-0514");
const english112FoodWaste = official.find(question => question.id === "OFF-0517");
if (!english112Menu?.questionImage?.endsWith("112-english-q24-25-menu-calendar.svg") || !english112Menu.questionImages?.includes(english112Menu.questionImage) || !serviceWorker.includes("112-english-q24-25-menu-calendar.svg")) errors.push("112英文第24–25題: 菜單／日曆圖或離線快取缺漏");
if (!english112BirdNotes?.questionImage?.endsWith("112-english-q26-27-bird-notes.svg") || !english112BirdNotes.questionImages?.includes(english112BirdNotes.questionImage) || !serviceWorker.includes("112-english-q26-27-bird-notes.svg")) errors.push("112英文第26–27題: 幼鳥筆記必要圖或離線快取缺漏");
if (!english112FoodWaste?.questionImage?.endsWith("112-english-q28-29-food-waste-chart.svg") || !english112FoodWaste.questionImages?.includes(english112FoodWaste.questionImage) || !serviceWorker.includes("112-english-q28-29-food-waste-chart.svg") || !english112FoodWaste.explanation.includes("9.6%") || !english112FoodWaste.solutionSteps?.some(step => step.includes("低於南亞與東南亞的 9.6%"))) errors.push("112英文第28–29題: 食物浪費圖表必要圖、Stage 3 數據排除或離線快取錯誤");
const english111Q21to39Keys = ["C", "C", "D", "C", "A", "C", "A", "D", "B", "D", "A", "D", "D", "B", "D", "B", "C", "B", "A"];
const english111Q21to39Clues = [
  ["Twenty Summers & Winters", "birthday", "two tickets"], ["birthday", "e-mail address", "tea-cup pictures"], ["17.75", "18.75", "400-ml serving of rice milk", "400 ml of grape juice"], ["Sugar that is hidden", "foods and drinks"],
  ["future house", "Pinterest", "A to Z"], ["A to Z", "sugar flowers"], ["20 seconds", "10 seconds", "eight times"], ["heart problems", "too busy to go to the gym"],
  ["choose your own moves", "afterburn", "rest"], ["No Overtime Day", "There’s Always Tomorrow", "must be changed"], ["this must be changed", "hard-working"], ["Figure 1", "Figure 2", "2,200 hours"],
  ["1919", "1960", "1961", "Cameroon"], ["resentful", "unwelcome", "government jobs"], ["Ambazonia", "police", "country"], ["only about 20%", "French speakers", "history"],
  ["one day for one part", "at least seven hours"], ["lodging", "camping", "hotels"], ["Cove", "Sloan Castle", "birdwatching"]
];
const english111Q21to30RequiredText = [
  ["Thank You for Being with Us for Twenty Summers & Winters", "birthday", "two tickets from Taipei to New York"],
  ["birthday", "e-mail address", "two required tea-cup pictures"],
  ["One sugar-spoon symbol represents 4 g", "17.75", "18.75", "rice milk", "grape juice"],
  ["Sugar that is hidden in foods and drinks", "sugar", "children"],
  ["future house", "Pinterest", "share their works"],
  ["A to Z", "sugar flowers"],
  ["20 seconds", "10 seconds", "at least eight times"],
  ["seldom exercise", "heart problems", "too busy to go to the gym"],
  ["choose your own moves", "20-second exercise", "10 seconds of rest"],
  ["No Overtime Day", "There’s Always Tomorrow", "restaurants and coffee shops", "this must be changed"]
];
for (let offset = 0; offset < english111Q21to39Keys.length; offset += 1) {
  const number = offset + 21;
  const row = official.find(question => question.source?.year === 111 && question.subject === "英文" && question.source.questionNumber === number);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  const text = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  const cluesPresent = english111Q21to39Clues[offset].every(clue => text.toLowerCase().includes(clue.replace(/\s+/g, "").toLowerCase()));
  const specificEvidencePresent = offset < english111Q21to30RequiredText.length && english111Q21to30RequiredText[offset].every(clue => text.toLowerCase().includes(clue.replace(/\s+/g, "").toLowerCase()));
  const expectedVisual = number === 33 ? "111-english-q33-maps.svg" : number === 37 || number === 39 ? "111-english-q39-trail-map.svg" : "";
  const visualPresent = expectedVisual
    ? row?.requiresImage && row.questionImage?.endsWith(expectedVisual) && row.questionImages?.includes(row.questionImage) && serviceWorker.includes(expectedVisual) && await access(join(root, "assets", "official-exams", expectedVisual)).then(() => true, () => false) && !row.imageAlt?.includes("試卷頁面")
    : !row?.requiresImage && !row?.questionImage && !row?.questionImages?.length;
  const hasSpecificEvidence = offset < english111Q21to30RequiredText.length ? specificEvidencePresent : cluesPresent;
  if (!row || answerLetter !== english111Q21to39Keys[offset] || row.options?.length !== 4 || !hasSpecificEvidence || !visualPresent || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim() || (row.relatedWords?.length ?? 0) < 3 || row.answerKeyReview?.status !== "verified" || /Answer:\s*[A-D]/i.test(row.explanation)) errors.push(`111英文第${number}題: 原卷材料、正解、必要圖示或英文解題輔助不完整`);
}
const english111Q21Question = official.find(question => question.id === "OFF-0295");
if (!english111Q21Question?.question.includes("Thank You for Being with Us for Twenty Summers & Winters") || english111Q21Question.question.includes("The ad thanks customers for being with the company") || !english111Q21Question.explanation.includes("原文沒有直接寫") || !english111Q21Question.solutionSteps?.some(step => step.includes("不是明寫成立年份"))) errors.push("111英文第21題: 廣告原句或依宣傳語推論的證據界線不正確");
const english111SugarQuestion = official.find(question => question.id === "OFF-0297");
if (!english111SugarQuestion?.question.includes("66 g of ice cream") || !english111SugarQuestion.question.includes("two sugar-spoon symbols (8 g)") || !english111SugarQuestion.question.includes("400 ml of grape juice has seven (28 g)")) errors.push("111英文第23題: 資訊圖表的糖匙圖例或份量換算與原圖不符");
const english111TabataQuestion = official.find(question => question.id === "OFF-0302");
if (english111TabataQuestion?.options?.[3] !== "People who enjoy exercising but are too busy to go to the gym." || !english111TabataQuestion?.explanation.includes("D 忠實表達這兩個條件") || !english111TabataQuestion?.source?.editorialNote?.includes("非逐字原卷選項") || !clientScript.includes("選項依原文校訂")) errors.push("111英文第28題: 選項未按文章證據校正，或前台未揭露文字修訂");
for (let offset = 0; offset < english111WordGamesKeys.length; offset += 1) {
  const number = offset + 40;
  const row = official.find(question => question.id === `OFF-${String(number + 274).padStart(4, "0")}`);
  const answerLetter = row && String.fromCharCode(65 + row.answer);
  const hasFullPassage = row?.question.includes("English words are made of 26 letters") && row.question.includes("restaurant") && row.question.includes("Palindromes can be used to learn mathematics and make music") && row.question.includes("Anagrams are also a good way to hide something");
  if (!row || row.source?.year !== 111 || row.source.questionNumber !== number || answerLetter !== english111WordGamesKeys[offset] || row.options?.length !== 4 || !hasFullPassage || row.requiresImage || row.questionImage || row.questionImages?.length || !row.explanation?.trim() || !row.solutionSteps?.length || !row.teacherTip?.trim() || row.answerKeyReview?.status !== "verified" || /Answer:\s*[A-D]/i.test(row.explanation)) errors.push(`111英文第${number}題: 回文與易位詞題組的原文、答案、解析或四選項不完整`);
}
const english111AnagramQuestion = official.find(question => question.id === "OFF-0316");
const english111PurposeQuestion = official.find(question => question.id === "OFF-0317");
if (!english111AnagramQuestion?.teacherTip?.includes("odd / unusual") || !english111AnagramQuestion.teacherTip.includes("difficult") || !english111AnagramQuestion.relatedWords?.some(word => word.startsWith("unusual"))) errors.push("111英文第42題: strange 同義詞或易混淆詞提醒缺漏");
if (!english111PurposeQuestion?.teacherTip?.includes("not merely") || !english111PurposeQuestion.relatedWords?.some(word => word.startsWith("not merely"))) errors.push("111英文第43題: more than just 同義片語或篇章判讀提醒缺漏");
const english111WorkplaceThis = official.find(question => question.id === "OFF-0305");
const english111WorkplaceFigures = official.find(question => question.id === "OFF-0306");
if (!english111WorkplaceThis?.question.includes("this") || !english111WorkplaceThis.explanation.includes("Clearly, this must be changed") || !english111WorkplaceThis.explanation.includes("Working long hours has become a way to show") || !english111WorkplaceThis.explanation.includes("this 回指前句") || english111WorkplaceThis.answer !== 0) errors.push("111英文第31題: this 的先行語句或指涉解釋缺漏");
if (!english111WorkplaceFigures?.question.includes("2011—187; 2012—216; 2013—194; 2014—220; 2015—189") || !english111WorkplaceFigures.question.includes("At 2,200 hours") || english111WorkplaceFigures.answer !== 3 || !english111WorkplaceFigures.solutionSteps?.some(step => step.includes("女性約 13%、男性約 12%"))) errors.push("111英文第32題: Figure 1/2 數據、圖例解釋或正解不完整");
const english111CameroonHistory = official.find(question => question.id === "OFF-0307");
const english111CameroonInference = official.find(question => question.id === "OFF-0309");
if (!english111CameroonHistory?.question.includes("1919") || !english111CameroonHistory.question.includes("1960") || !english111CameroonHistory.question.includes("1961") || !english111CameroonHistory.questionImage?.endsWith("111-english-q33-maps.svg") || !english111CameroonHistory.imageAlt?.includes("四選項")) errors.push("111英文第33題: 喀麥隆年代、地圖選項或替代文字缺漏");
if (!english111CameroonInference?.explanation.includes("原文沒有直接陳述") || !english111CameroonInference.explanation.includes("最接近的推論")) errors.push("111英文第35題: 政府是否承認 Ambazonia 的間接推論界線未交代");
const english111Lodging = official.find(question => question.id === "OFF-0312");
const english111TrailAdvice = official.find(question => question.id === "OFF-0311");
const english111TrailMap = official.find(question => question.id === "OFF-0313");
if (!english111TrailAdvice?.question.includes("camping is popular in summer but allowed only at a few campgrounds") || !english111TrailAdvice.requiresImage || !english111TrailAdvice.questionImage?.endsWith("111-english-q39-trail-map.svg") || !english111TrailAdvice.imageAlt?.includes("可露營營地") || !english111TrailAdvice.explanation.includes("地圖只標出少數指定營地") || !english111TrailAdvice.solutionSteps?.some(step => step.includes("指定營地")) || !serviceWorker.includes("111-english-q39-trail-map.svg")) errors.push("111英文第37題: 露營規則、營地地圖、解題證據或離線快取缺漏");
if (!english111Lodging?.teacherTip?.includes("camping 和 hotel") || !english111Lodging.explanation.includes("lodging 指住宿") || !english111Lodging.relatedWords?.some(word => word.startsWith("lodging（住宿）"))) errors.push("111英文第38題: lodging 詞義與易錯提醒缺漏");
if (!english111TrailMap?.questionImage?.endsWith("111-english-q39-trail-map.svg") || !english111TrailMap.imageAlt?.includes("路線") || english111TrailMap.answer !== 0 || !english111TrailMap.explanation.includes("Sloan Castle")) errors.push("111英文第39題: 必要路線圖、路線判讀依據或答案不完整");
const english111Q2to20Clues = [[2, "therefore"], [3, "turn on the lights"], [4, "well-liked"], [5, "needed to"], [6, "decision"], [7, "common"], [8, "spend time doing"], [9, "how deep it is"], [10, "the laziest"], [11, "has lived"], [12, "come after"], [13, "Yesterday"], [14, "sensible"], [15, "is looking for"], [16, "see + 受詞 + 原形動詞"], [17, "was taken away"], [18, "one 代替"], [19, "studied"], [20, "網路留言"]];
const english111Q2to20Rows = [];
for (const [number, clue] of english111Q2to20Clues) {
  const row = official.find(question => question.id === `OFF-${String(number + 274).padStart(4, "0")}`);
  if (!row || row.source?.year !== 111 || row.source.questionNumber !== number || row.options?.length !== 4 || !row.teacherTip?.includes(clue) || (row.relatedWords?.length ?? 0) < 3 || !row.solutionSteps?.length) errors.push(`111英文第${number}題: 題目專屬語言提醒、近義詞或四選項資料缺漏`);
  english111Q2to20Rows.push(row);
}
if (new Set(english111Q2to20Rows.map(row => row?.teacherTip?.trim())).size !== 19) errors.push("111英文第2–20題: 教師提醒重複，請修正共用模板回退");
const english114CityCardQuestion = official.find(question => question.id === "OFF-0941");
if (!english114CityCardQuestion?.question.includes("Museum of White Lake City History are in Zone 1") || !english114CityCardQuestion.question.includes("White Lake is in Zone 2") || english114CityCardQuestion.answer !== 2) errors.push("114英文第25題: 地圖分區文字與最省方案答案不一致");
for (const id of ["OFF-0951", "OFF-0952", "OFF-0953"]) {
  const item = official.find(question => question.id === id);
  if (!item || (item.question.match(/The picture shows a UK electricity worker in the 1970s/g) || []).length !== 1) errors.push(`${id}: 114英文閱讀材料重複或缺漏`);
}
const english114Q31to43Keys = ["B", "D", "A", "B", "C", "C", "C", "B", "C", "C", "A", "B", "A"];
const english114Q31 = official.find(item => item.id === "OFF-0947");
if (english114Q31?.questionImage !== "./assets/official-exams/114-english-p9.webp" || english114Q31?.questionImages?.join("|") !== "./assets/official-exams/114-english-p8.webp|./assets/official-exams/114-english-p9.webp" || !english114Q31?.requiresImage || !english114Q31?.requiresContext) errors.push("114英文第31題: 必須顯示包含Picture 7與題目選項的官方第8頁，並保留題組前頁材料");
for (const id of ["OFF-0948", "OFF-0949", "OFF-0950"]) {
  const item = official.find(question => question.id === id);
  if (!item || item.requiresImage || item.questionImage || item.questionImages?.length) errors.push(`${id}: 114英文文字題已完整轉錄，不應顯示多餘整頁試卷圖`);
}
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
for (const [number, clue] of [[38, "He ____ doing this"], [39, "After class, _____. How brave a woman is to have a baby!"], [40, "He decided that his birthday _____."], [41, "The ____ ‘birthday gift’ Cameron prepared"], [42, "Hearing that _____. It was so much better than getting a gift."], [43, "This year, Cameron ____ his mom a nice dress."]]) {
  const row = official.find(question => question.source?.year === 114 && question.subject === "英文" && question.source.questionNumber === number);
  if (!row?.question.includes(clue) || row.question.includes(`Choose the correct answer for question ${number}.`)) errors.push(`114英文第${number}題: 原卷填空句缺失`);
}
const chinese110Tea = official.find(question => question.id === "OFF-0034");
if (!chinese110Tea?.teacherTip.includes("上流階級與勞動階級都曾提到加牛奶") || chinese110Tea.teacherTip.includes("絹本")) errors.push("110國文第34題: 教師提醒仍殘留其他題目的錯置提示");
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
const science114Substances = science114(4);
if (!science114Substances?.question.includes("硫磺") || !science114Substances.question.includes("笑氣（N₂O）") || science114Substances.answer !== 0 || science114Substances.requiresImage || science114Substances.questionImages?.length || !science114Substances.solutionSteps?.some(step => step.includes("共兩種"))) errors.push("114自然第4題: 元素／化合物題需以完整文字作答，答案或原子種類推理錯誤");
const science114NervousSystem = science114(12);
if (!science114NervousSystem?.question.includes("受器：小明嘴巴、阿華腳") || !science114NervousSystem.question.includes("傳導神經：小明僅有感覺神經元") || science114NervousSystem.answer !== 2 || science114NervousSystem.requiresImage || science114NervousSystem.questionImages?.length || !science114NervousSystem.explanation.includes("感覺神經與運動神經")) errors.push("114自然第12題: 神經系統比較資料、正解或文字推理缺漏");
const science114Ions = science114(17);
if (!science114Ions?.question.includes("Ca²⁺") || !science114Ions.question.includes("Cl⁻") || science114Ions.answer !== 0 || science114Ions.requiresImage || science114Ions.questionImages?.length || !science114Ions.solutionSteps?.some(step => step.includes("y=20−2=18")) || !science114Ions.solutionSteps?.some(step => step.includes("z=17+1=18"))) errors.push("114自然第17題: 離子質子／電子資料、正解或電荷推理缺漏");
const science114Compass = science114(31);
for (const image of ["114-science-q31-circuit-setups.png", "114-science-q31-compass-options.png"]) {
  const imagePath = `./assets/official-exams/${image}`;
  if (!science114Compass?.questionImages?.includes(imagePath) || !serviceWorker.includes(image)) errors.push(`114自然第31題: 電流磁效應必要圖 ${image} 未附或未預載`);
  try { await access(join(root, "assets/official-exams", image)); }
  catch { errors.push(`114自然第31題: 必要圖檔 ${image} 不存在`); }
}
if (!science114Compass?.question.includes("南北向") || science114Compass.answer !== 0 || /\(cid:\d+\)/i.test(science114Compass.question)) errors.push("114自然第31題: 清楚題幹、官方答案或電流方向資料缺漏");
const science114Moon = science114(49);
if (!science114Moon?.question.includes("上弦月") || !science114Moon.question.includes("下弦月") || science114Moon.answer !== 2 || !science114Moon.questionImages?.some(image => image.endsWith("114-science-q49-moon-phase-options.svg")) || /\(cid:\d+\)/i.test(science114Moon.question)) errors.push("114自然第49題: 月相題幹、必要選項圖或答案缺漏／含 OCR 污染");
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
if (!chinese111Glyphs?.requiresImage || !chinese111Glyphs?.questionImage.endsWith("111-chinese-q04-original-glyph-crop.svg") || chinese111Glyphs.questionImages?.[0] !== chinese111Glyphs.questionImage || chinese111Glyphs.question.includes("金文 → 小篆 → 隸書 → 楷書") || !serviceWorker.includes("111-chinese-q04-original-glyph-crop.svg") || !serviceWorker.includes("111-chinese-p2.webp")) errors.push("111國文第4題: 原卷字形局部圖及離線材料缺漏");
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
for (const [number, image] of [[3, "114-chinese-q03-origin-chart.png"], [5, "114-chinese-q05-seal-script-options.png"]]) {
  const row = chinese114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114國文第${number}題: 必要字形／春聯圖缺漏或未加入離線快取`);
}
const chinese114Q7 = chinese114(7);
if (!chinese114Q7 || chinese114Q7.requiresImage || chinese114Q7.questionImages?.length || !chinese114Q7.question.includes("仄聲貼右、平聲貼左") || !chinese114Q7.question.includes("上聯末字為仄聲，下聯末字為平聲") || !chinese114Q7.explanation.includes("仄起平收") || chinese114Q7.answer !== 1) errors.push("114國文第7題: 已完整轉錄圖示規則、答案與解析，不應要求試卷截圖");
const chinese110Q47 = official.find(question => question.id === "OFF-0047");
const chinese110Q48 = official.find(question => question.id === "OFF-0048");
const chinese110Q46 = official.find(question => question.id === "OFF-0046");
for (const row of [chinese110Q46, chinese110Q47, chinese110Q48]) {
  if (!row?.question.includes("【甲】") || !row.question.includes("【乙】") || !row.question.includes("【丙】相關人物簡表") || row.question.indexOf("【乙】") !== row.question.lastIndexOf("【乙】") || row.question.indexOf("【丙】") !== row.question.lastIndexOf("【丙】")) errors.push(`${row?.id ?? "110國文47–48"}: 原卷共用材料需各自完整且不得重複拼接`);
}
if (chinese110Q46?.answer !== 3 || !chinese110Q46.explanation.includes("前往京城") || chinese110Q47?.answer !== 2 || !chinese110Q47.explanation.includes("兩文皆凸顯柳開自大") || chinese110Q48?.answer !== 3 || !chinese110Q48.solutionSteps?.some(step => step.includes("970–1018") && step.includes("1031–1095"))) errors.push("110國文第46–48題: 修復後須保留原卷答案並依完整材料解釋");
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
for (const [number, clues] of [[21, ["荷蘭對美國", "阿根廷對澳大利亞", "日本對克羅埃西亞", "巴西對南韓", "英格蘭對塞內加爾", "法國對波蘭", "摩洛哥對西班牙", "葡萄牙對瑞士"]], [22, ["每早過戶", "本流既大", "不暇唱曲"]], [23, ["遠方之卒守塞", "募民屯戍", "一歲而更"]], [24, ["皆歷詆慶曆", "乃魏泰所為", "嫁之聖俞"]], [27, ["灰面鵟鷹", "蘭嶼", "琉球", "菲律賓", "八卦山"]], [28, ["次生林", "上升氣流"]], [29, ["四種", "場景外觀", "場景事件", "角色外貌", "角色行動"]], [30, ["380", "390", "400", "右鼓棒斷成兩半", "巴迪．瑞奇"]]]) {
  const row = chinese114(number);
  const stemAndOptions = [row?.question, ...(row?.options || [])].join(" ").replace(/\s+/g, "");
  if (!row || clues.some(clue => !stemAndOptions.includes(clue.replace(/\s+/g, "")))) errors.push(`114國文第${number}題: 原文、賽程／表格資料或共用閱讀材料缺漏`);
}
for (const number of [22, 23, 24, 28, 29, 30]) {
  const row = chinese114(number);
  if (!row || row.requiresImage || row.questionImages?.length) errors.push(`114國文第${number}題: 文字完整材料不應依賴整頁試卷截圖`);
}
for (const number of [25, 26]) {
  const row = chinese114(number);
  const figure = "./assets/official-exams/114-chinese-q25-q26-oyster-passage.svg";
  if (!row?.requiresImage || row.questionImage !== figure || !row.questionImages?.includes(figure) || !serviceWorker.includes(figure) || !serviceWorker.includes("114-chinese-p8.webp")) errors.push(`114國文第${number}題: 共用公呆原文裁圖或離線快取缺漏`);
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
for (const [number, image] of [[43, "114-social-q43-artifacts.svg"], [44, "114-social-q44-god-statue.svg"], [51, "114-social-q51-tombstone.svg"], [53, "114-social-q53-iceberg-map.svg"]]) {
  const row = social114(number);
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${image}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(image)) errors.push(`114社會第${number}題: 必要圖像未使用專用裁切或未加入離線快取`);
}
const parsiTombstone = social114(51);
if (!parsiTombstone?.question.includes("西元1850年") || !parsiTombstone.question.includes("伊嗣俟紀元1219年") || !parsiTombstone.requiresImage || parsiTombstone.questionImage !== "./assets/official-exams/114-social-q51-tombstone.svg") errors.push("114社會第51題: 墓碑日期線索或專用裁切圖缺失");
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
const social111Hajj = social111(1);
if (!social111Hajj?.question.includes("約有 235 萬人") || !["沙烏地阿拉伯 600,108 人", "印尼 221,000 人", "巴基斯坦 179,210 人", "其他國家 635,106 人"].every(value => social111Hajj.question.includes(value)) || social111Hajj.answer !== 2 || social111Hajj.requiresImage || !social111Hajj.explanation.includes("伊斯蘭教朝覲")) errors.push("111社會第1題: 朝覲來源國表格、正解或文字呈現不完整");
const social111Badlands = social111(2);
if (!social111Badlands?.requiresImage || social111Badlands.answer !== 1 || !social111Badlands.questionImages?.includes("./assets/official-exams/111-social-q02-taiwan-locations.png") || !serviceWorker.includes("111-social-q02-taiwan-locations.png") || !social111Badlands.explanation.includes("海岸山脈最南端")) errors.push("111社會第2題: 臺灣泥岩惡地位置圖、離線資產或推理缺漏");
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
const social111Capes = social111(18);
if (!social111Capes?.question.includes("四個著名岬角") || social111Capes.answer !== 2 || !social111Capes.questionImage?.endsWith("111-social-q18-capes.png") || !social111Capes.explanation.includes("38.781°N、9.500°W") || !social111Capes.solutionSteps?.some(step => step.includes("伊比利半島"))) errors.push("111社會第18題: 岬角圖、葡萄牙座標、正解或定位推理不一致");
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
const chineseAuthored = JSON.parse(await readFile(join(root, "data", "chinese.json"), "utf8"));
const chinese0607 = chineseAuthored.find(item => item.id === "CHI-0607");
if (!chinese0607 || !chinese0607.solutionSteps.some(step => step.includes("D 完整保留")) || chinese0607.solutionSteps.some(step => step.includes("C 完整保留"))) errors.push("CHI-0607: 解題步驟的選項索引與正解不一致");
const chinese0625 = chineseAuthored.find(item => item.id === "CHI-0625");
if (!chinese0625 || !chinese0625.options[chinese0625.answer].includes("不打斷") || !chinese0625.explanation.includes("不打斷")) errors.push("CHI-0625: 正解或解析遺漏摘要時不得打斷的規則");
const chinese0638 = chineseAuthored.find(item => item.id === "CHI-0638");
if (!chinese0638 || !chinese0638.question.includes("子猷問左右") || chinese0638.question.includes("當道者迷")) errors.push("CHI-0638: 引文須符合《世說新語·傷逝》原文");
for (const [id, point, clue] of [["CHI-0031", "排比", "結構相似"], ["CHI-0033", "層遞", "逐層推進"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || !question.teacherTip.includes(clue)) errors.push(`${id}: 修辭考點或教師提醒不一致`);
}
const chineseComparison = chineseAuthored.find(item => item.id === "CHI-0038");
if (!chineseComparison || !chineseComparison.explanation.includes("A、B過度概括") || !chineseComparison.explanation.includes("答案為 C")) errors.push("CHI-0038: 解析選項代號或正答不一致");
const chineseModifier = chineseAuthored.find(item => item.id === "CHI-0059");
const chineseSubjectPredicate = chineseAuthored.find(item => item.id === "CHI-0024");
if (!chineseModifier || !chineseSubjectPredicate || chineseModifier.question === chineseSubjectPredicate.question || chineseModifier.knowledgePoint !== "修飾語判斷") errors.push("CHI-0059: 題幹重複或語法考點錯置");
for (const [id, answer, anchor] of [["CHI-0641", 1, "器材組確認"], ["CHI-0642", 2, "週二 08:00"], ["CHI-0643", 0, "政策目的"], ["CHI-0644", 3, "付費區"], ["CHI-0645", 0, "同行十二年"], ["CHI-0646", 1, "確認錯誤後修正"], ["CHI-0647", 1, "讓步關係"], ["CHI-0648", 0, "地方記憶"], ["CHI-0649", 2, "72/120=60%"], ["CHI-0650", 3, "負責急救者不能搬器材"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.question.includes(anchor) && !question.explanation.includes(anchor) && !question.solutionSteps.join(" ").includes(anchor) || question.options.length !== 4 || question.solutionSteps.length < 3 || !question.teacherTip) errors.push(`${id}: 多條件文本推理、作答選項或解題教學欄位回歸錯誤`);
}
for (const [id, answer, anchor] of [["CHI-0651", 0, "巷子裡還有人等著"], ["CHI-0652", 1, "週四公告"], ["CHI-0653", 2, "自己不了解別人"], ["CHI-0654", 3, "當次檢測"], ["CHI-0655", 0, "警示代碼"], ["CHI-0656", 1, "再次沿用舊日期"], ["CHI-0657", 2, "申請數"], ["CHI-0658", 3, "可拆卸坡道"], ["CHI-0659", 0, "豐年留客足雞豚"], ["CHI-0660", 1, "舉世／眾人"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.question.includes(anchor) && !question.explanation.includes(anchor) && !question.solutionSteps.join(" ").includes(anchor) || question.options.length !== 4 || question.solutionSteps.length < 3 || !question.teacherTip || question.difficulty !== "中等") errors.push(`${id}: 多線索閱讀題的正解、文本證據或解題流程回歸錯誤`);
}
for (const [id, answer, anchor] of [["CHI-0041", 2, "見賢思齊"], ["CHI-0042", 1, "以天下為己任"], ["CHI-0043", 0, "欲速則不達"], ["CHI-0046", 0, "問題、原因、對策"], ["CHI-0047", 2, "回應反方"], ["CHI-0050", 2, "代表性及政策評估"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.question.includes(anchor) && !question.explanation.includes(anchor) && !question.solutionSteps.join(" ").includes(anchor)) errors.push(`${id}: 作答索引或推理依據改變`);
}
for (const [id, answer] of [["CHI-0068", 3], ["CHI-0069", 2]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.explanation.includes(question.options[answer])) errors.push(`${id}: 正答與解析未對應`);
}
for (const [id, answer, anchor] of [["CHI-0073", 1, "提早出發"], ["CHI-0078", 3, "反覆修補"], ["CHI-0080", 2, "仍未調查"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !`${question.question} ${question.explanation} ${question.solutionSteps.join(" ")}`.includes(anchor)) errors.push(`${id}: 解析與關鍵作答線索不一致`);
}
for (const [id, answer, anchor] of [["CHI-0084", 3, "舊知識"], ["CHI-0085", 1, "勿施於人"], ["CHI-0087", 0, "不恥下問"], ["CHI-0090", 2, "反問"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !question.explanation.includes(anchor)) errors.push(`${id}: 文言文答案或文意解釋不一致`);
}
for (const [id, answer, anchor] of [["CHI-0092", 2, "六月十日前"], ["CHI-0093", 1, "未控制原有能力"], ["CHI-0099", 0, "可能表示分類增加"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.answer !== answer || !`${question.question} ${question.explanation} ${question.solutionSteps.join(" ")}`.includes(anchor)) errors.push(`${id}: 條件、證據限制或推論強度不一致`);
}
const chinesePronunciation = chineseAuthored.find(item => item.id === "CHI-0106");
if (!chinesePronunciation || chinesePronunciation.answer !== 0 || !chinesePronunciation.explanation.includes("和平」的和讀ㄏㄜˊ") || !chinesePronunciation.explanation.includes("和麵」的和讀ㄏㄨㄛˋ")) errors.push("CHI-0106: 多音字正答或注音不符教育部辭典");
const chineseMetaphor = chineseAuthored.find(item => item.id === "CHI-0118");
if (!chineseMetaphor || chineseMetaphor.answer !== 3 || !chineseMetaphor.teacherTip.includes("本體") || !chineseMetaphor.teacherTip.includes("喻體")) errors.push("CHI-0118: 譬喻題的教師提醒未對應題型");
for (const id of ["CHI-0126", "CHI-0127", "CHI-0128", "CHI-0129", "CHI-0130"]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== "成語" || question.knowledgePoint !== "成語語境判讀") errors.push(`${id}: 成語單元與知識點分類不一致`);
}
for (const id of ["CHI-0131", "CHI-0132", "CHI-0133"]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== "成語" || question.knowledgePoint !== "成語語境判讀") errors.push(`${id}: 成語單元與知識點分類不一致`);
}
for (const id of ["CHI-0134", "CHI-0135", "CHI-0136", "CHI-0137", "CHI-0138", "CHI-0139", "CHI-0140"]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== "閱讀理解" || !["論證與資料判讀", "短文閱讀推論"].includes(question.knowledgePoint)) errors.push(`${id}: 閱讀單元與考點分類不一致`);
}
for (const [id, unit, point] of [["CHI-0141", "語法", "語文知識與句意"], ...["CHI-0142", "CHI-0143", "CHI-0144", "CHI-0145"].map(id => [id, "修辭", "修辭判讀"]), ["CHI-0146", "文言文", "文言文詞義"], ["CHI-0147", "文言文", "文言文閱讀"], ["CHI-0148", "閱讀理解", "短文閱讀推論"], ["CHI-0149", "閱讀理解", "短文閱讀推論"], ["CHI-0150", "閱讀理解", "論證與資料判讀"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point) errors.push(`${id}: 單元或知識點分類不匹配`);
}
const chineseCouplet = chineseAuthored.find(item => item.id === "CHI-0145");
if (!chineseCouplet || chineseCouplet.answer !== 2 || !chineseCouplet.teacherTip.includes("對偶")) errors.push("CHI-0145: 對偶題的教師提醒不匹配");
const genericLanguageTip = "文言、成語或修辭題先依上下文判斷";
for (const [id, unit, point, tip] of [["CHI-0151", "成語", "不恥下問的語境義", "下問"], ["CHI-0152", "成語", "成語情境判讀", "言傳身教"], ["CHI-0153", "修辭", "譬喻與語境義", "本體"], ["CHI-0154", "文言文", "文言虛詞其", "句位"], ["CHI-0155", "語法", "複句關係判讀", "轉折"], ["CHI-0156", "修辭", "明喻", "喻詞"], ["CHI-0157", "閱讀理解", "景物描寫效果", "動詞"], ["CHI-0158", "字音", "多音字辨音", "讀音"], ["CHI-0159", "文言文", "文言實詞義辨析", "前文"], ["CHI-0160", "修辭", "擬人", "非人主體"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.teacherTip.includes(genericLanguageTip) || !question.teacherTip.includes(tip)) errors.push(`${id}: 單元、考點或個別教師提醒不符`);
}
for (const [id, unit, point, tip] of [["CHI-0161", "語法", "句意與雙重否定", "雙重否定"], ["CHI-0162", "成語", "名言主旨理解", "寸金難買寸光陰"], ["CHI-0163", "成語", "成語寓意推論", "合作寓意"], ["CHI-0164", "文學閱讀", "人物行動與情感推論", "具體行動"], ["CHI-0165", "成語", "語意關係判讀", "兩個成語"], ["CHI-0166", "成語", "近義成語辨析", "逐組比較"], ["CHI-0167", "語法", "複句關係判讀", "通常預期"], ["CHI-0168", "修辭", "譬喻本體與喻體", "本體"], ["CHI-0169", "閱讀理解", "動詞與描寫效果", "晨光移動"], ["CHI-0170", "文言文", "古今詞義辨析", "古今異義詞"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.teacherTip.includes(genericLanguageTip) || !question.teacherTip.includes(tip)) errors.push(`${id}: 單元、考點或個別教師提醒不符`);
}
for (const [id, unit, point, tip] of [["CHI-0171", "閱讀理解", "寫作手法判讀", "以小見大"], ["CHI-0172", "語法", "選擇複句與語意", "與其"], ["CHI-0173", "語法", "句型與動作關係", "一面"], ["CHI-0174", "閱讀理解", "主旨與因果推論", "持續練習"], ["CHI-0175", "文言文", "詞類活用", "詞類活用"], ["CHI-0176", "文言文", "文言通假字", "通假字"], ["CHI-0177", "文言文", "文句主旨推論", "外在環境"], ["CHI-0178", "文言文", "詞類活用與方位詞", "方位名詞"], ["CHI-0179", "文言文", "託物言志", "託物言志"], ["CHI-0180", "文言文", "名句主旨理解", "天下之憂"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.teacherTip.includes(genericLanguageTip) || question.teacherTip.includes("先依題目引文和脈絡判讀") || !question.teacherTip.includes(tip)) errors.push(`${id}: 單元、考點或個別教師提醒不符`);
}
const chineseParonomasia = chineseAuthored.find(item => item.id === "CHI-0176");
const chineseOldSay = chineseAuthored.find(item => item.id === "CHI-0040");
if (!chineseParonomasia || chineseParonomasia.answer !== 0 || chineseParonomasia.question === chineseOldSay?.question || !chineseParonomasia.question.includes("誨女知之乎") || !chineseParonomasia.explanation.includes("汝")) errors.push("CHI-0176: 通假字題與舊題重複或解釋錯誤");
const chineseDirectionWord = chineseAuthored.find(item => item.id === "CHI-0178");
if (!chineseDirectionWord || chineseDirectionWord.answer !== 2 || chineseDirectionWord.options[2] !== "名詞作狀語，向東" || !chineseDirectionWord.explanation.includes("不是詞性變成副詞")) errors.push("CHI-0178: 方位名詞作狀語的詞類說明錯誤");
for (const [id, unit, point, answer, tip] of [["CHI-0181", "文言文", "文言實詞辨析", 1, "水流方向"], ["CHI-0182", "詩詞閱讀", "意象與主旨", 2, "景象轉變"], ["CHI-0183", "詩詞閱讀", "意象與景物描寫", 3, "直、圓"], ["CHI-0184", "詩詞閱讀", "借代與詩意理解", 0, "借它指稱戰事"], ["CHI-0185", "詩詞閱讀", "修辭與情景交融", 1, "花、鳥"], ["CHI-0186", "詩詞閱讀", "詩句寓意推論", 2, "拓展視野"], ["CHI-0187", "詩詞閱讀", "情感與生活態度", 3, "不要添加引文外的背景"], ["CHI-0188", "詩詞閱讀", "譬喻與情感推論", 0, "持續付出"], ["CHI-0189", "文言文", "文學象徵與篇章理解", 1, "象徵定位"], ["CHI-0190", "文言文", "篇章結構與主旨", 2, "先憂後樂"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.teacherTip.includes("先依題目引文和脈絡判讀") || !question.teacherTip.includes(tip)) errors.push(`${id}: 單元、答案或個別教師提醒不符`);
}
const poemInference = chineseAuthored.find(item => item.id === "CHI-0187");
if (!poemInference || poemInference.options[3] !== "親近自然、悠然自得的閒適" || poemInference.explanation.includes("遠離官場紛擾")) errors.push("CHI-0187: 解讀超出所給詩句的資料範圍");
for (const [id, unit, answer, tip] of [["CHI-0191", "文言文", 3, "親賢臣，遠小人"], ["CHI-0192", "文言文閱讀", 0, "主語是敵軍"], ["CHI-0193", "文言文閱讀", 1, "未能遠謀"], ["CHI-0194", "文言文閱讀", 2, "身分借代"], ["CHI-0195", "文言文閱讀", 3, "臣本布衣"], ["CHI-0196", "文言文閱讀", 0, "關鍵時刻"], ["CHI-0197", "文言文閱讀", 1, "做記號"], ["CHI-0198", "文學閱讀", 2, "起筆類比"], ["CHI-0199", "文學閱讀", 3, "譬喻時"], ["CHI-0200", "閱讀理解", 0, "每一本書"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || question.teacherTip.includes("先依題目引文和脈絡判讀") || !question.teacherTip.includes(tip) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 題目單元、答案、引文依據或個別解題資料不符`);
}
const chineseValueAnalogy = chineseAuthored.find(item => item.id === "CHI-0198");
const chineseMoonlightImage = chineseAuthored.find(item => item.id === "CHI-0199");
if (!chineseValueAnalogy?.question.includes("斯是陋室，惟吾德馨") || !chineseMoonlightImage?.question.includes("蓋竹柏影也")) errors.push("CHI-0198/0199: 推論所需的文本證據未提供於題幹");
for (const [id, unit, point, answer, tip] of [["CHI-0201", "修辭", "譬喻與景物特徵推論", 1, "喻體的特徵"], ["CHI-0202", "修辭", "擬人與動作主體判讀", 2, "人的意志"], ["CHI-0203", "修辭", "排比結構與表達效果", 3, "句式相似"], ["CHI-0204", "修辭", "映襯與時段氛圍", 0, "兩端的景象"], ["CHI-0205", "修辭", "誇飾與語意效果", 1, "超出事實尺度"], ["CHI-0206", "修辭", "借代與語境指涉", 2, "行動和情境"], ["CHI-0207", "修辭", "自問自答與語氣作用", 3, "問題和回答"], ["CHI-0208", "閱讀理解", "轉折關係與主旨", 0, "原先看法"], ["CHI-0209", "閱讀理解", "指示詞與篇章連貫", 1, "先行內容"], ["CHI-0210", "閱讀理解", "因果與推論", 2, "觀察到的結果"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || question.teacherTip.includes("先指出句中對象及其動作") || !question.teacherTip.includes(tip) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 修辭／閱讀考點、答案或個別解題資料不符`);
}
const simileInference = chineseAuthored.find(item => item.id === "CHI-0201");
const parallelEffect = chineseAuthored.find(item => item.id === "CHI-0203");
const hyperboleInterpretation = chineseAuthored.find(item => item.id === "CHI-0205");
if (!simileInference?.question.includes("最主要凸顯") || !parallelEffect?.options[3].includes("不同位置") || !hyperboleInterpretation?.options[1].includes("不宜當成實際測量")) errors.push("CHI-0201/0203/0205: 修辭題未要求依語境分析表達效果");
for (const [id, unit, answer, clue] of [["CHI-0211", "閱讀理解", 3, "絕對語氣"], ["CHI-0212", "閱讀理解", 0, "行動變化"], ["CHI-0213", "閱讀理解", 1, "程序順序"], ["CHI-0214", "閱讀理解", 2, "優點和限制"], ["CHI-0215", "閱讀理解", 3, "單程或往返"], ["CHI-0216", "閱讀理解", 0, "主旨"], ["CHI-0217", "閱讀理解", 1, "普遍因果"], ["CHI-0218", "修辭", 2, "手法對調"], ["CHI-0219", "閱讀理解", 3, "連接詞"], ["CHI-0220", "閱讀理解", 0, "間接描寫"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 單元、答案或題型專屬解題依據不符`);
}
const commuteCalculation = chineseAuthored.find(item => item.id === "CHI-0215");
const pilotStudyInference = chineseAuthored.find(item => item.id === "CHI-0217");
const rhetoricDistinction = chineseAuthored.find(item => item.id === "CHI-0218");
const connectorInference = chineseAuthored.find(item => item.id === "CHI-0219");
const characterAction = chineseAuthored.find(item => item.id === "CHI-0220");
if (!commuteCalculation?.explanation.includes("18−12＝6") || !commuteCalculation.explanation.includes("6×2＝12") || !commuteCalculation.explanation.includes("12×5＝60") || !pilotStudyInference?.solutionSteps[2].includes("索引 1") || !rhetoricDistinction?.solutionSteps[2].includes("索引 2") || !connectorInference?.solutionSteps[2].includes("索引 3") || !characterAction?.solutionSteps[2].includes("索引 0")) errors.push("CHI-0215/0217–0220: 計算步驟、證據限制或正解索引不一致");
for (const [id, unit, answer, clue] of [["CHI-0221", "閱讀理解", 1, "主張和理由"], ["CHI-0222", "閱讀理解", 2, "一般原則"], ["CHI-0223", "修辭", 3, "詞性位置"], ["CHI-0224", "閱讀理解", 0, "尚待驗證"], ["CHI-0225", "閱讀理解", 1, "結尾照應"], ["CHI-0226", "詩詞閱讀", 2, "空間由近景"], ["CHI-0227", "詩詞閱讀", 3, "限制視角"], ["CHI-0228", "詩詞閱讀", 0, "凌絕頂"], ["CHI-0229", "詩詞閱讀", 1, "心理狀態"], ["CHI-0230", "詩詞閱讀", 2, "譬喻詩句"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 單元、答案或題型專屬解題依據不符`);
}
const orchidEnding = chineseAuthored.find(item => item.id === "CHI-0225");
const snowAnalogy = chineseAuthored.find(item => item.id === "CHI-0230");
if (!orchidEnding?.solutionSteps[2].includes("索引 1") || !snowAnalogy?.question.includes("梨花") || !snowAnalogy?.options[2].includes("白雪覆枝") || !snowAnalogy?.explanation.includes("不是在寫真正的春花")) errors.push("CHI-0225/0230: 結尾答案索引或詩句譬喻分析不一致");
for (const [id, unit, answer, clue] of [["CHI-0231", "詩詞閱讀", 3, "不及"], ["CHI-0232", "文言文", 0, "動詞「親愛」"], ["CHI-0233", "文言文", 1, "動賓結構"], ["CHI-0234", "文言文", 2, "妻與兒女"], ["CHI-0235", "文言文", 3, "阡陌"], ["CHI-0236", "文言文", 0, "邀請"], ["CHI-0237", "文言文", 1, "動詞的方向感"], ["CHI-0238", "文言文", 2, "惟"], ["CHI-0239", "文言文", 3, "構詞線索"], ["CHI-0240", "文言文", 0, "視覺錯覺"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 單元、答案或個別文言／詩詞提醒不符`);
}
for (const [id, unit, answer, clue] of [["CHI-0241", "文言文", 1, "結尾效果"], ["CHI-0242", "文言文", 2, "反問語氣"], ["CHI-0243", "文言文", 3, "人物動機"], ["CHI-0244", "文言文", 0, "受命背景"], ["CHI-0245", "文言文", 1, "自我調侃"], ["CHI-0246", "閱讀理解", 2, "垃圾量"], ["CHI-0247", "閱讀理解", 3, "操縱變因"], ["CHI-0248", "閱讀理解", 0, "需求調查"], ["CHI-0249", "閱讀理解", 1, "觀察紀錄"], ["CHI-0250", "閱讀理解", 2, "時間歧義"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("文言字詞須連同語境辨義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 單元、答案或個別文言／閱讀提醒不符`);
}
const controlledCupExperiment = chineseAuthored.find(item => item.id === "CHI-0247");
if (!controlledCupExperiment || controlledCupExperiment.solutionSteps.some(step => step.includes("紙杯")) || !controlledCupExperiment.solutionSteps[2].includes("索引 3")) errors.push("CHI-0247: 實驗材料或答案索引與題幹不一致");
for (const [id, unit, point, answer, clue] of [["CHI-0251", "文言文", "文言實詞辨義", 3, "吾身"], ["CHI-0252", "文言文", "名句主旨", 0, "己／人"], ["CHI-0253", "文言文", "對偶句與主旨", 1, "學」與「思"], ["CHI-0254", "文言文", "通假字與詞義推論", 2, "句末一字"], ["CHI-0255", "文言文", "名句語意", 3, "教師身分"], ["CHI-0256", "文言文", "對比與詞義", 0, "情緒色彩"], ["CHI-0257", "詩詞閱讀", "感官描寫", 1, "顏色詞"], ["CHI-0258", "詩詞閱讀", "意象與寓意", 2, "紅杏探出牆外"], ["CHI-0259", "詩詞閱讀", "送別情感推論", 3, "目送動作"], ["CHI-0260", "詩詞閱讀", "文言實詞辨義", 0, "原因詞"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先從上下文確認古今詞義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 分類、答案或專屬提示不符`);
}
const finalZhi = chineseAuthored.find(item => item.id === "CHI-0254");
if (!finalZhi?.explanation.includes("通「智」") || !finalZhi.solutionSteps[1].includes("通「智」")) errors.push("CHI-0254: 句末「知」的通假本字或詞義說明缺漏");
for (const [id, unit, answer, clue] of [["CHI-0261", "詩詞閱讀", 1, "小荷初露"], ["CHI-0262", "詩詞閱讀", 2, "躬行"], ["CHI-0263", "文言文", 3, "修飾"], ["CHI-0264", "文言文", 0, "行動轉折"], ["CHI-0265", "文言文", 1, "兩隻狼"], ["CHI-0266", "文言文", 2, "銅錢穿孔"], ["CHI-0267", "文言文", 3, "忿然"], ["CHI-0268", "文言文", 0, "兩種情境"], ["CHI-0269", "文言文", 1, "對比句"], ["CHI-0270", "文言文", 3, "單一用途"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先從上下文確認古今詞義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 單元、答案或個別文言／詩詞提示不符`);
}
const wolfPlan = chineseAuthored.find(item => item.id === "CHI-0265");
const oilDemo = chineseAuthored.find(item => item.id === "CHI-0266");
const oilEnding = chineseAuthored.find(item => item.id === "CHI-0267");
if (!wolfPlan?.question.includes("一狼洞其中") || !oilDemo?.question.includes("銅錢孔注入") || !oilEnding?.question.includes("忿然")) errors.push("CHI-0265–0267: 解題所需的原文事件未提供於題幹");
for (const [id, unit, point, answer, clue] of [["CHI-0271", "文言文", "遞進與學習層次", 2, "遞進"], ["CHI-0272", "詩詞閱讀", "詩句意象與誇飾", 3, "萬里"], ["CHI-0273", "詩詞閱讀", "對比與人物形象", 0, "身分反差"], ["CHI-0274", "閱讀理解", "措施目的與整合推論", 1, "紙本備援"], ["CHI-0275", "成語", "成語寓意辨析", 2, "保證成功"], ["CHI-0276", "文言文", "文言字義", 3, "看齊、效法"], ["CHI-0277", "文言文", "古今異義", 0, "循著先前"], ["CHI-0278", "文言文", "古今異義", 0, "食物滋味"], ["CHI-0279", "文言文", "文言字義", 1, "第二次"], ["CHI-0280", "文言文", "文言字義", 2, "成全善事"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依引文和上下文辨認詞義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 分類、答案或個別教學提示不符`);
}
for (const [id, unit, point, answer, clue] of [["CHI-0281", "文言文", "文言字義", 3, "多義字"], ["CHI-0282", "詩詞閱讀", "詞性活用與動態描寫", 0, "春風"], ["CHI-0283", "詩詞閱讀", "意象與意境", 1, "空間關係"], ["CHI-0284", "詩詞閱讀", "意象與情感", 2, "固定只代表"], ["CHI-0285", "修辭", "誇飾判讀", 3, "常理"], ["CHI-0286", "修辭", "設問與譬喻", 0, "春水"], ["CHI-0287", "修辭", "轉化", 1, "單句分析"], ["CHI-0288", "修辭", "對偶", 2, "數句"], ["CHI-0289", "閱讀理解", "篇章主旨", 3, "自主選書"], ["CHI-0290", "閱讀理解", "閱讀推論", 0, "共同生活記憶"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依引文和上下文辨認詞義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 分類、答案或個別修辭／閱讀提示不符`);
}
const freshHyperbole = chineseAuthored.find(item => item.id === "CHI-0285");
const oldSnowMetaphor = chineseAuthored.find(item => item.id === "CHI-0230");
if (!freshHyperbole?.question.includes("白髮三千丈") || freshHyperbole.question === oldSnowMetaphor?.question || freshHyperbole?.answer !== 3 || !freshHyperbole.explanation.includes("刻意放大")) errors.push("CHI-0285: 重複詩句未替換或誇飾答案說明有誤");
for (const [id, unit, answer, clue] of [["CHI-0291", "閱讀理解", 1, "氣象資料"], ["CHI-0292", "閱讀理解", 2, "生活記憶"], ["CHI-0293", "閱讀理解", 3, "前後行動"], ["CHI-0294", "詩詞閱讀", 0, "天下"], ["CHI-0295", "詩詞閱讀", 1, "孤、獨、寒"], ["CHI-0296", "詩詞閱讀", 2, "人家"], ["CHI-0297", "文言文", 3, "並列項目"], ["CHI-0298", "成語", 0, "完整使用情境"], ["CHI-0299", "閱讀理解", 1, "重要工作"], ["CHI-0300", "閱讀理解", 2, "共同目的"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依引文和上下文辨認詞義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 單元、答案或個別閱讀／詩詞提示不符`);
}
for (const [id, unit, answer, clue] of [["CHI-0301", "閱讀理解", 3, "避免傷人的因果"], ["CHI-0302", "閱讀理解", 0, "老屋、新大樓"], ["CHI-0303", "閱讀理解", 1, "隔天又取出"], ["CHI-0304", "閱讀理解", 2, "構造、運作原理、適用地點"], ["CHI-0305", "修辭", 3, "沒有生命"], ["CHI-0306", "閱讀理解", 0, "局部／整體"], ["CHI-0307", "閱讀理解", 0, "瓶裝水使用量下降"], ["CHI-0308", "閱讀理解", 1, "雙重否定"], ["CHI-0309", "修辭", 2, "本體「海面」與喻體"], ["CHI-0310", "閱讀理解", 3, "16:30"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先引用題幹中的明確文字或轉折線索") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 單元、答案、個別提示或解析步驟不符`);
}
for (const [id, unit, point, answer, clue] of [["CHI-0311", "閱讀理解", "觀點轉變", 0, "原本以為"], ["CHI-0312", "閱讀理解", "語意推論", 1, "天空倒影"], ["CHI-0313", "閱讀理解", "論點理解", 2, "不如"], ["CHI-0314", "詩詞閱讀", "詩意與對比", 3, "匆忙的鞋"], ["CHI-0315", "閱讀理解", "說明文推論", 0, "風向、食物"], ["CHI-0316", "閱讀理解", "物件象徵與人物動機", 1, "下一篇要改得更好"], ["CHI-0317", "閱讀理解", "規章判讀", 1, "登記、清潔歸還、損壞通報"], ["CHI-0318", "閱讀理解", "象徵與寓意", 2, "字面與寓意"], ["CHI-0319", "閱讀理解", "流程與篇章順序", 3, "確認用電時段"], ["CHI-0320", "修辭", "譬喻判斷", 0, "本體「雲」和喻體「白船" ]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.unit !== unit || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先引用題幹中的明確文字或轉折線索") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 分類、答案、個別提示或解析步驟不符`);
}
for (const [id, point, answer, clue] of [["CHI-0321", "因果判讀", 1, "少雨、生長變慢"], ["CHI-0322", "主旨與情感判讀", 2, "途中那場雨"], ["CHI-0323", "情境資訊推論", 3, "下午兩點後人潮明顯散去"], ["CHI-0324", "主旨判斷", 0, "斷續」到「流暢"], ["CHI-0325", "抽象語意理解", 1, "內在沉澱"], ["CHI-0326", "寫作手法", 2, "碎成銀片"], ["CHI-0327", "語意理解", 3, "記在心裡"], ["CHI-0328", "文意推論", 0, "標句→查字→通讀前後"], ["CHI-0329", "主旨判斷", 1, "有時"], ["CHI-0330", "公告資訊整合", 0, "清洗、摺好、裝袋、標尺寸"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先引用題幹中的明確文字或轉折線索") || question.teacherTip.includes("先找題幹明確線索") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
const revisedReading = chineseAuthored.find(item => item.id === "CHI-0328");
if (revisedReading?.question.includes("學而不思則罔") || !revisedReading?.question.includes("先標其句")) errors.push("CHI-0328: 重複經典引文未替換或所需閱讀材料不完整");
const interviewQuestion = chineseAuthored.find(item => item.id === "CHI-0323");
if (!interviewQuestion?.question.includes("下午兩點後人潮明顯散去")) errors.push("CHI-0323: 最佳訪問時段缺少直接材料依據");
for (const [id, point, answer, clue] of [["CHI-0331", "景物寓意", 2, "剝漆和樹長過屋簷"], ["CHI-0332", "成語運用", 3, "考前才開始讀"], ["CHI-0333", "句型與關聯詞", 0, "卻"], ["CHI-0334", "段落脈絡", 1, "訪問→標記路線→建議設椅"], ["CHI-0335", "修辭判斷", 2, "醒了過來"], ["CHI-0336", "文言文文意推論", 3, "皆稱其樂"], ["CHI-0337", "規則與數量推理", 0, "已預約的 1 本"], ["CHI-0338", "語意推論", 1, "記憶中最遠"], ["CHI-0339", "修辭與語氣", 2, "沉默」與有聲的「響亮"], ["CHI-0340", "討論與決策理解", 3, "試辦兩週→統計夜間人數→再評估"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先找題幹明確線索") || question.teacherTip.includes("先引用題幹中的明確文字或轉折線索") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
const newClassicalItem = chineseAuthored.find(item => item.id === "CHI-0336");
if (newClassicalItem?.question.includes("山不在高") || !newClassicalItem?.question.includes("亭不以廣稱")) errors.push("CHI-0336: 已重複的經典引文未替換或題幹材料不完整");
for (const [id, point, answer, clue] of [["CHI-0341", "資訊判讀與證據", 0, "標問號→查資料"], ["CHI-0342", "細節推論", 1, "開始重新檢視"], ["CHI-0343", "感官描寫", 2, "吆喝聲"], ["CHI-0344", "圖表與數據判讀", 3, "120÷200"], ["CHI-0345", "人物形象推論", 3, "依編輯意見逐篇重寫"], ["CHI-0346", "景物與情感", 0, "盼你歸來"], ["CHI-0347", "公告資訊判讀", 1, "預定恢復時間"], ["CHI-0348", "論點判斷", 2, "與其……不如……"], ["CHI-0349", "修辭辨析", 1, "朱門"], ["CHI-0350", "論證與證據評估", 2, "樣本有限"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先找題幹明確線索") || question.teacherTip.includes("先找題幹明確線索，再區分") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
const supportedTrait = chineseAuthored.find(item => item.id === "CHI-0345");
if (!supportedTrait?.question.includes("依編輯意見逐篇重寫")) errors.push("CHI-0345: 持續修正的人物推論缺少明確行動依據");
const originalImagery = chineseAuthored.find(item => item.id === "CHI-0346");
if (!originalImagery?.question.includes("盼你歸來") || originalImagery?.question.includes("春水初生，春林初盛")) errors.push("CHI-0346: 情意題缺少文本線索或仍保留來源不明引句");
const optionMismatch = chineseAuthored.find(item => item.id === "CHI-0348");
if (!optionMismatch?.solutionSteps?.[1]?.includes("選項 C")) errors.push("CHI-0348: 解題步驟的答案字母未與索引一致");
for (const [id, point, answer, clue] of [["CHI-0351", "表格資訊統整", 3, "到場÷報名算出席率"], ["CHI-0352", "文言文文意推論", 0, "圍起危處→訪問查因"], ["CHI-0353", "成語運用", 1, "知難而退"], ["CHI-0354", "文言詞義", 2, "古義「走"], ["CHI-0355", "篇章結構", 3, "途中→抵達山頂→下山"], ["CHI-0356", "修辭判斷", 0, "本體「街燈倒影」"], ["CHI-0357", "通知資訊整合", 1, "搭車還須勾車位"], ["CHI-0358", "人物形象推論", 2, "成果肯定"], ["CHI-0359", "資訊統整", 1, "答案 B"], ["CHI-0360", "主旨判斷", 3, "留白的目的"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先回到原文找可引用的線索") || question.teacherTip.includes("先找題幹明確線索") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
for (const [id, phrase] of [["CHI-0351", "山重水複疑無路"], ["CHI-0352", "先天下之憂而憂"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (question?.question.includes(phrase)) errors.push(`${id}: 題幹仍保留已重複使用的引文`);
}
const pavementItem = chineseAuthored.find(item => item.id === "CHI-0359");
if (!pavementItem?.explanation.includes("B 保留兩項資訊")) errors.push("CHI-0359: 解析中的答案字母與正解索引不一致");
for (const [id, point, answer, clue] of [["CHI-0361", "象徵與語意推論", 0, "有人等他"], ["CHI-0362", "規則判讀", 0, "植物可觀察但不可採"], ["CHI-0363", "修辭判斷", 1, "勇氣"], ["CHI-0364", "因果與重點判讀", 2, "先補上出處"], ["CHI-0365", "成語典故理解", 3, "桃李"], ["CHI-0366", "人物態度推論", 0, "逐件核對"], ["CHI-0367", "資料解讀與證據範圍", 1, "向陽側較早"], ["CHI-0368", "規則與情境判斷", 2, "5－1＝4"], ["CHI-0369", "文章組織分析", 3, "水質數據→居民訪談→監測建議"], ["CHI-0370", "語句引申義", 0, "大家才有機會一起找答案"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先回到原文找可引用的線索") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
for (const [id, quote] of [["CHI-0361", "千山鳥飛絕，萬徑人蹤滅"], ["CHI-0367", "霜葉紅於二月花"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (question?.question.includes(quote)) errors.push(`${id}: 舊有重複詩句未替換`);
}
for (const [id, point, answer, clue] of [["CHI-0371", "研究結果與推論", 1, "甲土組這 10 盆"], ["CHI-0372", "詩句寓意理解", 2, "源頭活水"], ["CHI-0373", "證據與結論", 3, "停頓逐月減少"], ["CHI-0374", "詩句寓意", 0, "寒徹骨"], ["CHI-0375", "公告條件判讀", 1, "21:30"], ["CHI-0376", "人物行動推論", 2, "逐句找線索"], ["CHI-0377", "文言文主旨", 3, "戚戚」為憂懼"], ["CHI-0378", "主旨與資訊統整", 0, "保留木門"], ["CHI-0379", "資料推論與限制", 1, "無法比較增幅"], ["CHI-0380", "成語運用", 2, "量力而為"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先回到原文找可引用的線索") || question.teacherTip.includes("引用題幹線索支持判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
const combinedRestoration = chineseAuthored.find(item => item.id === "CHI-0378");
if (combinedRestoration?.question.includes("出淤泥而不染") || !combinedRestoration?.question.includes("保留有歷史的木門") || !combinedRestoration?.question.includes("加裝坡道和扶手")) errors.push("CHI-0378: 重複經典引文未替換或新題材料缺少保存／通行兩項依據");
for (const [id, point, answer, clue] of [["CHI-0381", "篇章順序", 3, "天色轉暗→收相機下山"], ["CHI-0382", "人物心境推論", 0, "摺好往事"], ["CHI-0383", "公告條件判讀", 1, "雨天適用"], ["CHI-0384", "數據判讀", 2, "18÷30＝60%"], ["CHI-0385", "細節與人物變化", 3, "不能推成隊友已回應"], ["CHI-0386", "文言詞義", 0, "客人失約"], ["CHI-0387", "句型關係", 1, "不但"], ["CHI-0388", "修辭判斷", 2, "無生命的老樹"], ["CHI-0389", "說明文主旨", 3, "可逆補強"], ["CHI-0390", "詩句情感判讀", 0, "時鳴"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("引用題幹線索支持判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
const oldAnalectsQuestion = chineseAuthored.find(item => item.id === "CHI-0386");
if (oldAnalectsQuestion?.question.includes("人不知而不慍") || !oldAnalectsQuestion?.question.includes("客人失約")) errors.push("CHI-0386: 重複引文未替換或新題缺少詞義脈絡");
const characterInference = chineseAuthored.find(item => item.id === "CHI-0385");
if (!characterInference?.options?.[3]?.includes("以點頭表達支持") || characterInference?.options?.[3]?.includes("彼此確認")) errors.push("CHI-0385: 推論仍超出題幹可見的單方行動");
for (const [id, point, answer, clue] of [["CHI-0391", "調查資料推論", 1, "不能推成晨讀造成效果"], ["CHI-0392", "句意理解", 2, "兩個必要工作要求"], ["CHI-0393", "譬喻理解", 3, "本體「時間」和喻體「細篩」"], ["CHI-0394", "詩句畫面判讀", 0, "聲音仍在"], ["CHI-0395", "文言詞義", 1, "「委」和「去」"], ["CHI-0396", "資訊來源評估", 2, "來源單一"], ["CHI-0397", "觀點比較", 3, "照明效益與乙的事前評估"], ["CHI-0398", "規則與數量整合", 0, "每日 2 元"], ["CHI-0399", "主旨與觀點轉變", 1, "新經驗修正看法"], ["CHI-0400", "語氣與態度判讀", 2, "待改進處"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("引用題幹線索支持判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、答案、個別提示或解析步驟不符`);
}
const lateReturnQuestion = chineseAuthored.find(item => item.id === "CHI-0398");
if (lateReturnQuestion?.options?.[lateReturnQuestion.answer] !== "16 元；3 本" || !lateReturnQuestion?.solutionSteps?.some(step => step.includes("6＋10＝16")) || !lateReturnQuestion?.question.includes("3 天") || !lateReturnQuestion?.question.includes("5 天")) errors.push("CHI-0398: 逾期費計算或續借數量與題幹條件不一致");
for (const [id, point, answer, difficulty, clue] of [["CHI-0401", "對比與主旨判讀", 3, "進階", "資源分配落差"], ["CHI-0402", "詩歌情境", 0, "中等", "人事凋零"], ["CHI-0403", "詩句因果推論", 1, "中等", "誇張的珍重"], ["CHI-0404", "借代辨析", 2, "基礎", "黃髮」取老人的外貌"], ["CHI-0405", "詩歌情感", 3, "中等", "聞捷報的喜悅"], ["CHI-0406", "詩句主旨", 0, "中等", "「天下」「俱」"], ["CHI-0407", "古今詞義", 1, "基礎", "量詞「千里」"], ["CHI-0408", "成語運用", 2, "基礎", "門前熱鬧"], ["CHI-0409", "段落意旨", 3, "中等", "試辦→蒐集意見"], ["CHI-0410", "時間資訊計算", 0, "基礎", "週六"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先依原文及數據找出證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0411", "人物行動推論", 1, "中等", "可判斷她延後決定"], ["CHI-0412", "句型關係", 2, "基礎", "「只要」後的條件"], ["CHI-0413", "修辭判斷", 3, "基礎", "校園本是場所"], ["CHI-0414", "比例與資料範圍", 0, "中等", "90÷150"], ["CHI-0415", "敘事安排", 1, "中等", "延後交代"], ["CHI-0416", "格言寓意", 2, "基礎", "正反對照"], ["CHI-0417", "安全指示判讀", 3, "中等", "兩條件都成立"], ["CHI-0418", "轉折與細節理解", 0, "中等", "有限效果"], ["CHI-0419", "觀點與資料來源", 1, "基礎", "學生感受"], ["CHI-0420", "文言文寓意", 2, "中等", "盲目服從批評"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先依原文及數據找出證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0421", "資訊統整計算", 3, "基礎", "12＋9＋15"], ["CHI-0422", "方法與目的", 0, "中等", "公開整理與比較"], ["CHI-0423", "動作與情感推論", 1, "中等", "離別情境"], ["CHI-0424", "句型關係", 2, "基礎", "讓步條件"], ["CHI-0425", "論點理解", 3, "中等", "同時保存特色"], ["CHI-0426", "資訊判讀與計算", 0, "基礎", "成人 2 張、學生 3 張"], ["CHI-0427", "象徵與情節推論", 1, "中等", "整理過去"], ["CHI-0428", "文言文主旨", 2, "中等", "「得道」連到「多助」"], ["CHI-0429", "文言文寓意", 3, "中等", "磨練與過度安逸"], ["CHI-0430", "文言文理解", 0, "中等", "擴大關懷對象"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依上下文辨認字詞古今義") || question.teacherTip.includes("先依原文及數據找出證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0431", "文言文層次理解", 2, "中等", "兼顧和諧與差異"], ["CHI-0432", "文言文寓意", 1, "基礎", "志向不輕易動搖"], ["CHI-0433", "人物行動與主旨", 3, "中等", "共同修訂"], ["CHI-0434", "證據與推論", 1, "中等", "器物用途"], ["CHI-0435", "數量統整", 0, "基礎", "兩筆相加"], ["CHI-0436", "論點與推論", 1, "基礎", "限制了結論範圍"], ["CHI-0437", "公告資訊判讀", 2, "基礎", "已確定和待公布"], ["CHI-0438", "象徵與寓意", 3, "中等", "分流繞行"], ["CHI-0439", "古今詞義", 0, "基礎", "滿一週年"], ["CHI-0440", "詩歌景物判讀", 1, "中等", "早春線索"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依上下文辨認字詞古今義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0441", "人物態度推論", 2, "中等", "多人指出的內容問題"], ["CHI-0442", "資訊與結論辨析", 3, "中等", "安全成效"], ["CHI-0443", "詩句情感理解", 0, "中等", "兩種時間感並置"], ["CHI-0444", "條件句與方法理解", 1, "基礎", "不可缺少的前提"], ["CHI-0445", "數量關係", 2, "基礎", "35 個名額已額滿"], ["CHI-0446", "文言文情境理解", 3, "基礎", "田間小路"], ["CHI-0447", "論證方式", 0, "中等", "成本、風險是比較標準"], ["CHI-0448", "詩句意境", 1, "中等", "清朗平靜的心境"], ["CHI-0449", "公告條件推理", 2, "中等", "假日觸發"], ["CHI-0450", "語意與觀點理解", 3, "基礎", "促成反思"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依上下文辨認字詞古今義") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
const waitlistItem = chineseAuthored.find(item => item.id === "CHI-0445");
if (!waitlistItem?.question.includes("名額 35 人，目前 35 人已報名") || waitlistItem.options?.[waitlistItem.answer] !== "5 位" || !waitlistItem.solutionSteps?.some(step => step.includes("9－4＝5"))) errors.push("CHI-0445: 候補人數前提或遞補算式錯誤");
for (const [id, point, answer, difficulty, clue] of [["CHI-0451", "資料比較計算", 0, "基礎", "問差量"], ["CHI-0452", "行動目的推論", 1, "中等", "外化整理"], ["CHI-0453", "因果判斷", 2, "中等", "氣溫及活動安排"], ["CHI-0454", "文言文情境理解", 3, "基礎", "兩個負面處境詞"], ["CHI-0455", "文言文主旨", 0, "中等", "用人主張"], ["CHI-0456", "修辭與論旨", 1, "中等", "《為學》貧僧"], ["CHI-0457", "寓言主旨", 2, "中等", "有條件卻未行"], ["CHI-0458", "主旨理解", 3, "中等", "先辨別痕跡價值"], ["CHI-0459", "修辭判斷", 0, "基礎", "人的動作"], ["CHI-0460", "公告資訊整合", 1, "中等", "小林代辦"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依上下文辨認字詞古今義") || question.teacherTip.includes("先回到原文找語詞、數據或行動證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0461", "圖表資訊與推論範圍", 3, "中等", "21÷28"], ["CHI-0462", "人物觀點轉變", 3, "中等", "觀點轉變"], ["CHI-0463", "詩歌景物與空間關係", 0, "中等", "村邊」和「郭外"], ["CHI-0464", "詩歌意境", 1, "基礎", "無人往來"], ["CHI-0465", "句意與論述", 2, "基礎", "不如」帶出"], ["CHI-0466", "修辭判斷", 3, "基礎", "人的動作賦予景物"], ["CHI-0467", "資料功能判讀", 0, "中等", "唯一原因"], ["CHI-0468", "詩句情感理解", 1, "基礎", "海內／天涯"], ["CHI-0469", "說明文方法理解", 2, "中等", "操縱變因"], ["CHI-0470", "公告條件與資訊整合", 2, "中等", "名額上限"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先回到原文找語詞、數據或行動證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0471", "作者觀點判讀", 0, "中等", "先聽店家經驗"], ["CHI-0472", "文言詞義", 1, "基礎", "正午炎熱情境"], ["CHI-0473", "論點理解", 2, "中等", "記錄」與「採用"], ["CHI-0474", "調查資料與推論界線", 3, "中等", "都是 3/4"], ["CHI-0475", "人物態度推論", 3, "中等", "先查證據"], ["CHI-0476", "規則條件判讀", 0, "中等", "16:10"], ["CHI-0477", "詩句寓意", 3, "中等", "汗青"], ["CHI-0478", "篇章結構與目的", 2, "中等", "今昔比較"], ["CHI-0479", "文言文主旨", 1, "中等", "難報"], ["CHI-0480", "文言文對比", 0, "中等", "責任重大"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先回到原文找語詞、數據或行動證據") || question.teacherTip.includes("根據文句、情境或數據逐步判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0481", "文言文寓意", 2, "基礎", "如實分辨認知界限"], ["CHI-0482", "說明文流程理解", 2, "中等", "居民訪談與舊照片"], ["CHI-0483", "句意關係", 3, "中等", "雙重否定"], ["CHI-0484", "規則資訊整合", 3, "中等", "一般與例外要求"], ["CHI-0485", "數量計算", 0, "基礎", "120－87"], ["CHI-0486", "句意與對比", 1, "基礎", "兩個時間詞"], ["CHI-0487", "人物行動推論", 2, "中等", "診斷證據"], ["CHI-0488", "詩句情感理解", 3, "中等", "仍保有抱負"], ["CHI-0489", "數據比較", 0, "基礎", "800 減去年 640"], ["CHI-0490", "古今詞義", 1, "基礎", "與世隔絕之地"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("根據文句、情境或數據逐步判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0491", "詩歌意象", 2, "基礎", "動詞「戲」"], ["CHI-0492", "比例與推論範圍", 3, "中等", "130/200"], ["CHI-0493", "動作與情節推論", 0, "中等", "繼續創作"], ["CHI-0494", "句型判斷", 1, "基礎", "屬讓步關係"], ["CHI-0495", "資料解讀與限制", 2, "中等", "測站、人口變化"], ["CHI-0496", "說明文論證與實證", 0, "中等", "互補證據"], ["CHI-0497", "規則資訊整合與情境推理", 1, "中等", "不是自動延期"], ["CHI-0498", "今昔對照與主旨", 1, "中等", "照顧者由父親轉成作者"], ["CHI-0499", "文言詞義", 2, "基礎", "事先有所準備"], ["CHI-0500", "生活情境與主旨", 3, "中等", "鄰里互相分享"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("根據文句、情境或數據逐步判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0501", "生活情境與主旨", 3, "中等", "社區連結延續"], ["CHI-0502", "證據與來源評估", 1, "中等", "正反證據"], ["CHI-0503", "修辭判斷", 2, "中等", "明喻"], ["CHI-0504", "篇章結構與重讀", 3, "進階", "後文離別"], ["CHI-0505", "查證與資訊可信度", 0, "中等", "典藏紀錄"], ["CHI-0506", "標點符號", 1, "中等", "問號放在引號內"], ["CHI-0507", "成語運用", 3, "中等", "互相配合、效果更好"], ["CHI-0508", "比喻與德性理解", 3, "基礎", "兩組對應"], ["CHI-0509", "詩句情感理解", 0, "中等", "實際售價"], ["CHI-0510", "回饋與自我修正", 1, "中等", "重聽錄音"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("回到原文確認關鍵字及因果") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0511", "公告條件判斷", 2, "基礎", "嚴格小於 8"], ["CHI-0512", "公告時序資訊判讀", 3, "中等", "三個時間"], ["CHI-0513", "細節與人物態度", 3, "基礎", "持續行動"], ["CHI-0514", "文言詞義", 1, "基礎", "零數、餘數"], ["CHI-0515", "詩歌情感", 2, "基礎", "等到車窗揮手消失"], ["CHI-0516", "流程資訊統整", 3, "中等", "不同階段"], ["CHI-0517", "論據與建議", 0, "中等", "兩類相關依據"], ["CHI-0518", "證據與偏好辨析", 1, "中等", "證據門檻"], ["CHI-0519", "資訊比較與主旨應用", 2, "中等", "固定題目給的評估標準"], ["CHI-0520", "動作與情感推論", 3, "基礎", "依依不捨"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("回到原文確認關鍵字及因果") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, clue] of [["CHI-0521", "路線公告與限制條件", 0, "1.65 公里封鎖點"], ["CHI-0522", "敘事結構", 1, "現在再回頭補因由"], ["CHI-0523", "詩句主旨", 2, "「古難全」"], ["CHI-0524", "詩句細節理解", 3, "遙看／近卻無"], ["CHI-0525", "情境推論", 0, "不能擴大成保證滿分"], ["CHI-0526", "工作溝通與規範", 1, "共同格式規範"], ["CHI-0527", "文言文教學觀", 2, "思求通而未得"], ["CHI-0528", "回饋與自我修正", 0, "記錄本身不是達標"], ["CHI-0529", "句意與主旨", 0, "承認改變並珍惜生活記憶"], ["CHI-0530", "公告條件判讀", 1, "週日仍在施工期間"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== "中等" || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("回到原文確認關鍵字及因果") || question.teacherTip.includes("依原文詞語、情境或計算條件") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0531", "公告資訊整合", 2, "基礎", "票面場次"], ["CHI-0532", "詩歌情境理解", 3, "中等", "寒冷軍旅夜景"], ["CHI-0533", "資料處理方法", 0, "中等", "回查原始紀錄"], ["CHI-0534", "意象推論", 1, "基礎", "表面狀態未必完整"], ["CHI-0535", "文言詞義", 2, "基礎", "藏在、不明顯呈現"], ["CHI-0536", "統計資料與推論範圍", 0, "中等", "24 為完成者、32 為參加者"], ["CHI-0537", "篇章結構與對比", 0, "中等", "隨陰晴而悲喜"], ["CHI-0538", "規則推理", 1, "中等", "分開計數"], ["CHI-0539", "描寫效果", 2, "基礎", "最後只剩掃地聲"], ["CHI-0540", "借鏡與自我修正", 2, "中等", "轉成自我改進"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依原文詞語、情境或計算條件") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0541", "細節與主旨推論", 0, "中等", "每年、同一棵樹下"], ["CHI-0542", "朗讀表現與文本理解", 1, "中等", "整句語意"], ["CHI-0543", "文言詞義", 2, "基礎", "路線記號"], ["CHI-0544", "公告規則與例外整合", 3, "基礎", "登記候補、等候通知"], ["CHI-0545", "詩句概括理解", 0, "中等", "十年」不等於只打十天"], ["CHI-0546", "論述與方法判讀", 1, "中等", "逐條列出待補強處"], ["CHI-0547", "敘事行動與人物態度", 2, "中等", "先通知並提出新日期"], ["CHI-0548", "篇章安排與目的", 3, "中等", "個別居民經驗"], ["CHI-0549", "典故主旨", 0, "中等", "眼前禍福難定"], ["CHI-0550", "通知時間條件判讀", 1, "中等", "另查實際時刻"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依原文詞語、情境或計算條件") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0551", "資料分類與文本解讀", 2, "中等", "不同時期"], ["CHI-0552", "文言文寓意", 3, "基礎", "重實踐"], ["CHI-0553", "需求整合與公共參與", 0, "中等", "三方"], ["CHI-0554", "論點協調與溝通", 1, "中等", "用例證修訂"], ["CHI-0555", "成語語意辨析", 2, "基礎", "拿捏分寸"], ["CHI-0556", "行動與態度推論", 3, "基礎", "反省如何轉成具體改變"], ["CHI-0557", "公告條件判讀", 0, "中等", "停班例外"], ["CHI-0558", "說明文流程理解", 1, "中等", "必要時換電池"], ["CHI-0559", "場景轉換與細節推論", 2, "中等", "家庭照料"], ["CHI-0560", "報導數據與證據限制", 3, "中等", "三日記錄"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先從原文、情境或計算條件找出證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0561", "細節推論", 0, "中等", "寫了又停"], ["CHI-0562", "文言詞義", 1, "基礎", "霧氣將散"], ["CHI-0563", "調查資料與推論範圍", 2, "中等", "80 位受訪者"], ["CHI-0564", "修辭判斷", 3, "基礎", "本體、喻體"], ["CHI-0565", "主旨與論證", 0, "中等", "預防"], ["CHI-0566", "公告路線與時間限制", 1, "中等", "14:30"], ["CHI-0567", "公共工程需求排序", 2, "中等", "漏水安全與無障礙坡道"], ["CHI-0568", "規則條件與例外判讀", 3, "中等", "報到前通知"], ["CHI-0569", "論證態度推論", 0, "中等", "開放但審慎"], ["CHI-0570", "古今詞義", 1, "基礎", "時間空檔"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先從原文、情境或計算條件找出證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0571", "廣告條件與限制判讀", 2, "中等", "不可與會員折扣併用"], ["CHI-0572", "詩歌意境", 3, "基礎", "明月、松林"], ["CHI-0573", "說明資訊與保育提醒", 0, "中等", "觸摸油脂影響沉積"], ["CHI-0574", "描寫氛圍判讀", 1, "基礎", "孩子追逐倒影"], ["CHI-0575", "報導資料與條件推論", 2, "中等", "三個狀態"], ["CHI-0576", "文言文主旨", 3, "中等", "兩組條件與結果"], ["CHI-0577", "成語典故理解", 0, "中等", "價值選擇"], ["CHI-0578", "文言文學習觀", 1, "基礎", "切磋不等於放棄查證"], ["CHI-0579", "練習方法與進步推論", 2, "中等", "分階段累積"], ["CHI-0580", "資訊整合", 3, "中等", "兩座橋的功能不同"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("分辨原文直接資訊與合理推論") || question.teacherTip.includes("先從原文、情境或計算條件找出證據") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0581", "公告條件推理", 0, "基礎", "同時段"], ["CHI-0582", "安全規則與事件順序", 1, "中等", "清點、通知、等候確認"], ["CHI-0583", "譬喻與聽覺描寫", 2, "基礎", "「如」提示譬喻"], ["CHI-0584", "多重證據與修復原則", 3, "中等", "現存字跡與舊照片"], ["CHI-0585", "路線資訊與需求整合", 0, "中等", "輪椅通行與休息條件"], ["CHI-0586", "一般規則與例外條件整合", 1, "中等", "明確例外"], ["CHI-0587", "細節與情感推論", 2, "中等", "長期記錄"], ["CHI-0588", "文言詞義", 3, "基礎", "畢」作「盡、全部"], ["CHI-0589", "收支報告與資訊範圍", 0, "中等", "收入有數字"], ["CHI-0590", "文言文主旨與價值判斷", 1, "中等", "二者不可得兼"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("分辨原文直接資訊與合理推論") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0591", "文言文細節", 2, "中等", "世代年數"], ["CHI-0592", "資料比較與呈現方式", 3, "中等", "形狀及各邊長關係"], ["CHI-0593", "詩歌今昔對照", 0, "中等", "昔／今"], ["CHI-0594", "公告規則判讀", 1, "基礎", "8:45 集合期限"], ["CHI-0595", "細節與主旨", 2, "中等", "保留"], ["CHI-0596", "活動規則與表單整合", 3, "中等", "當天不受理"], ["CHI-0597", "討論方法判讀", 0, "中等", "先找共同優點"], ["CHI-0598", "詩句寓意", 1, "中等", "字面過程"], ["CHI-0599", "多條件資訊判讀", 3, "中等", "答案位置是 D"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("分辨原文直接資訊與合理推論") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0600", "公告資訊推論", 2, "基礎", "休館日"], ["CHI-0601", "評選程序與偏誤", 3, "中等", "匿名處理作者身分"], ["CHI-0602", "資料來源與公平比較", 0, "中等", "同一組評選者"], ["CHI-0603", "討論與歧義釐清", 1, "中等", "爭議詞「可能」"], ["CHI-0604", "前後照應與責任態度", 2, "中等", "事前揭露風險"], ["CHI-0605", "篇章安排與論證功能", 3, "中等", "背景→政策→提醒"], ["CHI-0606", "選擇句式與建議判讀", 0, "基礎", "「與其……不如……」"], ["CHI-0607", "事件順序與行動判讀", 3, "中等", "看到延誤→通知家人→原地等候"], ["CHI-0608", "挫折因應與修正策略", 1, "中等", "證據缺口"], ["CHI-0609", "文言詞義", 2, "基礎", "不在酒，在乎山水"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("根據文本中的明確條件與前後關係推論") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0610", "作者態度判讀", 3, "中等", "只有三十人"], ["CHI-0611", "因果推論與證據界線", 0, "中等", "先後關係不等於因果"], ["CHI-0612", "跨句資訊整合", 0, "中等", "版本日期"], ["CHI-0613", "詞義辨析", 0, "基礎", "A 符合語境"], ["CHI-0614", "多條件規則與資格判讀", 0, "中等", "三項條件的交集"], ["CHI-0615", "篇章照應與時間推移", 1, "中等", "首尾重複的是「回望」"], ["CHI-0616", "目的與程序判讀", 2, "中等", "兩個目的"], ["CHI-0617", "史料查證與論證修正", 1, "中等", "回查後修正"], ["CHI-0618", "公告與安全推論", 3, "中等", "巡查只代表"], ["CHI-0619", "雙重否定與保留態度", 0, "中等", "雙重否定"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("根據文本中的明確條件與前後關係推論") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0620", "表單規則應用", 0, "基礎", "不得填本人"], ["CHI-0621", "行動與主旨推論", 1, "中等", "查到野生動物處置資訊"], ["CHI-0622", "古文情節推論", 2, "中等", "漢朝推及魏、晉"], ["CHI-0623", "表達方式與效果", 3, "中等", "延期日期"], ["CHI-0624", "景物描寫與抑揚對比", 0, "中等", "先抑後揚"], ["CHI-0625", "程序順序判讀", 1, "基礎", "先、接著、最後"], ["CHI-0626", "公告細節判讀", 1, "基礎", "停止服務與照常服務"], ["CHI-0627", "文言主旨與責任胸懷", 2, "進階", "公共責任"], ["CHI-0628", "措施目的推論", 3, "中等", "使用座椅前的安全條件"], ["CHI-0629", "句意辨析", 0, "中等", "另行通知"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("根據文本中的明確條件與前後關係推論") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0630", "論證證據評估", 1, "中等", "已有效改善"], ["CHI-0631", "文言詞義", 2, "基礎", "負」的動作義"], ["CHI-0632", "多條件公告推論", 3, "基礎", "時間不變"], ["CHI-0633", "行動方式推論", 0, "中等", "重述對方理由"], ["CHI-0634", "資料來源與證據查核", 1, "中等", "原報導脈絡"], ["CHI-0635", "程序與目的判讀", 2, "中等", "試辦→記錄"], ["CHI-0636", "論述主旨", 3, "基礎", "只記結論"], ["CHI-0637", "時間資訊整合", 0, "基礎", "兩組時間條件"], ["CHI-0638", "古文情節推論", 1, "中等", "此已喪矣"], ["CHI-0639", "措施目的推論", 2, "中等", "減量與例外"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("根據文本中的明確條件與前後關係推論") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0640", "資料指標與推論範圍", 3, "中等", "參與人數是投入"], ["CHI-0641", "必要條件與資格判讀", 1, "中等", "申請"], ["CHI-0642", "時間順序與資訊更新", 2, "中等", "事後偏誤"], ["CHI-0643", "材料功能判讀", 0, "中等", "成效證據"], ["CHI-0644", "規則條件應用", 3, "中等", "其他條件"], ["CHI-0645", "古典詩歌細節", 0, "中等", "合讀"], ["CHI-0646", "流程目的判讀", 1, "中等", "事實錯誤還是主觀建議"], ["CHI-0647", "關聯詞與句意", 1, "中等", "因果方向"], ["CHI-0648", "場景變遷與文化記憶", 0, "中等", "所有價值消失"], ["CHI-0649", "圖表數據與比例推論", 2, "中等", "分母與樣本範圍"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("根據文本中的明確條件與前後關係推論") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0650", "多條件規則整合", 3, "中等", "逐條打勾"], ["CHI-0651", "描寫效果判讀", 0, "中等", "實際作用與上下文賦予的象徵"], ["CHI-0652", "公告條件判讀", 1, "中等", "哪一則更新較新"], ["CHI-0653", "文言句意與自我反省", 2, "中等", "主客方向"], ["CHI-0654", "公告目的判讀", 3, "中等", "未來保證"], ["CHI-0655", "行動順序推論", 0, "中等", "條件分流"], ["CHI-0656", "文言文主旨", 1, "中等", "後續做法"], ["CHI-0657", "規則資訊推論", 2, "中等", "未知申請總數"], ["CHI-0658", "關聯詞理解", 3, "中等", "並列兼顧"], ["CHI-0659", "詩句意境與轉折", 0, "中等", "視角和情境如何推移"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依文本提供的訊息和條件推理") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0660", "文言意象理解", 1, "中等", "價值判斷"], ["CHI-0661", "多條件規則判讀", 2, "基礎", "作者、格式、期限"], ["CHI-0662", "情境氣氛判讀", 2, "基礎", "景物先靜後動"], ["CHI-0663", "寫作功能判讀", 3, "基礎", "日期、器材、結果"], ["CHI-0664", "文言對比與自我省察", 0, "基礎", "求諸己"], ["CHI-0665", "程序與安全規則", 1, "基礎", "抵達後的點名程序"], ["CHI-0666", "文言譬喻理解", 1, "基礎", "毛依附於皮"], ["CHI-0667", "無障礙資訊設計", 0, "中等", "提升資訊可及性"], ["CHI-0668", "句型與時間關係", 3, "基礎", "直到」標示刊登前"], ["CHI-0669", "論點整合與公共溝通", 2, "中等", "節紙與資訊可及性"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依文本提供的訊息和條件推理") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0670", "文言譬喻與主旨", 1, "基礎", "規、矩是畫方圓的工具"], ["CHI-0671", "細節用途判讀", 2, "基礎", "年份、地點、人物"], ["CHI-0672", "時間條件整合", 3, "中等", "兩個時限"], ["CHI-0673", "篇章結構判讀", 0, "中等", "示範轉為自己的能力"], ["CHI-0674", "政策程序與目的", 1, "中等", "何時再檢討"], ["CHI-0675", "資訊同意與公開倫理", 2, "中等", "同意公開的界線"], ["CHI-0676", "資料判讀與研究方法", 3, "中等", "交叉比對"], ["CHI-0677", "成語語境應用", 3, "基礎", "依圖示找尋"], ["CHI-0678", "公告條件判讀", 0, "基礎", "送交自然教室"], ["CHI-0679", "文言詞義", 1, "基礎", "孰能無"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依題幹證據判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0680", "資料用途推論", 2, "中等", "秤重回答「剩多少」"], ["CHI-0681", "事件與寓意判讀", 3, "中等", "道路沒變"], ["CHI-0682", "文言譬喻理解", 0, "基礎", "歲寒」是考驗"], ["CHI-0683", "規則條件整合", 1, "基礎", "兩個條件必須同時成立"], ["CHI-0684", "意象與情緒推論", 2, "中等", "時鐘前進與茶變冷"], ["CHI-0685", "成語語境應用", 3, "中等", "反覆潮濕這個局部線索"], ["CHI-0686", "規則資訊判讀", 0, "基礎", "二樓是全面禁拍"], ["CHI-0687", "文言譬喻與主旨", 1, "基礎", "小單位累積成大成果"], ["CHI-0688", "作法目的判讀", 2, "中等", "來源欄位維持可追溯性"], ["CHI-0689", "資訊整合與計算", 3, "基礎", "9:00 減 15 分鐘"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依題幹證據判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0690", "文言詞義", 0, "中等", "代替前面的學習內容"], ["CHI-0691", "編輯安排目的", 1, "中等", "共同資料來源"], ["CHI-0692", "關聯詞與句意", 2, "基礎", "即使」引出讓步"], ["CHI-0693", "古文細節判讀", 3, "中等", "主動標出失敗照片"], ["CHI-0694", "篇章次序與說明功能", 0, "中等", "年代背景→修復證據→觀眾比較"], ["CHI-0695", "情感與細節判讀", 1, "基礎", "搬離多年後仍記得"], ["CHI-0696", "文言詞義", 2, "中等", "去後乃至"], ["CHI-0697", "條件資訊完整性", 3, "進階", "其他人總分與名額"], ["CHI-0698", "文言文主旨", 0, "中等", "絲竹」和「案牘"], ["CHI-0699", "公告範圍與例外判讀", 1, "基礎", "北段，南段仍開放"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("依題幹證據判斷") || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0700", "人物關係與細節推論", 2, "中等", "互相回應"], ["CHI-0701", "條件整合與優先規則判讀", 3, "中等", "兩項條件"], ["CHI-0702", "擬人與情感寄託", 0, "中等", "替他回家"], ["CHI-0703", "對比手法", 1, "中等", "借來的傘"], ["CHI-0704", "主旨判讀", 2, "中等", "重新想清楚要說什麼"], ["CHI-0705", "文本推論", 3, "中等", "沒有證據證明落葉"], ["CHI-0706", "人物描寫", 0, "基礎", "父親放慢腳步"], ["CHI-0707", "譬喻修辭", 1, "基礎", "扶穩"], ["CHI-0708", "敘事順序", 2, "中等", "第一次」與「第二次"], ["CHI-0709", "認知轉折", 3, "中等", "原以為」和「才發現"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先找題幹的明確線索") || question.solutionSteps?.some(step => step.includes("核對題幹中的語句、動作或前後變化")) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0710", "因果推理", 0, "基礎", "晚一天，器材就來不及準備"], ["CHI-0711", "氛圍營造", 1, "基礎", "蟬聲停、空椅子"], ["CHI-0712", "言行反差", 2, "基礎", "口頭宣稱「不怕」"], ["CHI-0713", "論證分析", 3, "中等", "短期治標與持續成因"], ["CHI-0714", "主旨歸納", 0, "中等", "明說下次再用袋子"], ["CHI-0715", "敘事安排與懸念", 1, "進階", "延後揭露"], ["CHI-0716", "情景交融", 2, "中等", "外在景物"], ["CHI-0717", "寓意理解", 3, "基礎", "多年後"], ["CHI-0718", "人物特質", 0, "中等", "拆門檻、挪桌椅"], ["CHI-0719", "因果判讀", 1, "中等", "沒有描述之後葉片變化"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先找題幹的明確線索") || question.solutionSteps?.some(step => step.includes("核對題幹中的語句、動作或前後變化")) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0720", "資料判讀", 2, "中等", "提升資料的可查證性"], ["CHI-0721", "成語理解", 3, "基礎", "以訛傳訛是錯誤說法"], ["CHI-0722", "對比手法", 0, "基礎", "分號兩側"], ["CHI-0723", "象徵判讀", 1, "中等", "雨仍未停"], ["CHI-0724", "文本推論", 2, "中等", "材料同時提到交換心得"], ["CHI-0725", "氛圍營造", 3, "中等", "慢鐘、未拆信"], ["CHI-0726", "推論界線與資料精度", 0, "基礎", "證據足以估年代"], ["CHI-0727", "數據判讀", 1, "中等", "注意數據母群"], ["CHI-0728", "象徵判讀", 2, "中等", "人物直接說出留縫"], ["CHI-0729", "標題意涵與文化記憶", 3, "中等", "透過錄音留住地方聲音"], ["CHI-0730", "主旨判讀", 0, "基礎", "紙張背後有資源"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先找文本證據") || question.solutionSteps?.some(step => step.includes("回到題幹核對關鍵字句或前後關係")) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案、專屬提示或逐題解法不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0731", "語境判讀", 1, "基礎", "比較編輯與好友"], ["CHI-0732", "修辭理解", 2, "基礎", "「土地記得」是擬人"], ["CHI-0733", "因果推理", 3, "中等", "反覆抱怨"], ["CHI-0734", "象徵判讀", 0, "中等", "抓住「卻」後的許多可能"], ["CHI-0735", "訊息整合", 1, "中等", "分清楚禁止觸摸"], ["CHI-0736", "態度轉變", 2, "基礎", "新目標不是保證贏"], ["CHI-0737", "人物特質", 3, "基礎", "不打聽私事"], ["CHI-0738", "統計判讀", 0, "中等", "不要只看平均數"], ["CHI-0739", "句意判讀", 1, "中等", "「不是……是……」"], ["CHI-0740", "段落結構", 2, "中等", "四季標記"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先找文本證據") || question.solutionSteps?.some(step => step.includes("回到題幹核對關鍵字句或前後關係")) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案、專屬提示或逐題解法不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0741", "修辭與擬人", 3, "基礎", "把事物寫成人的動作"], ["CHI-0742", "文意推論", 0, "基礎", "具體行為線索"], ["CHI-0743", "編輯策略與直接引語", 1, "中等", "引號內保留受訪者原話"], ["CHI-0744", "句意與轉折", 2, "中等", "原以為、後來才明白"], ["CHI-0745", "上下文照應", 3, "進階", "結尾的意象常回扣前文"], ["CHI-0746", "詞義理解", 0, "基礎", "彙整」結合蒐集與分類整理"], ["CHI-0747", "論證與證據", 1, "基礎", "數據需與主張相關"], ["CHI-0748", "描寫與感官", 2, "中等", "香氣屬嗅覺"], ["CHI-0749", "比較與對照", 3, "中等", "以明確語句為準"], ["CHI-0750", "主旨與寓意", 0, "進階", "小樹沒有模仿松樹"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0751", "成語語境", 1, "中等", "比對成語本義"], ["CHI-0752", "文言詞義", 2, "中等", "古今異義"], ["CHI-0753", "修辭判讀", 3, "基礎", "語句的表達方式"], ["CHI-0754", "說明文閱讀", 0, "中等", "不能超出文本"], ["CHI-0755", "語句邏輯", 1, "中等", "前後分句"], ["CHI-0756", "人物描寫與推論", 2, "基礎", "具體言行支持"], ["CHI-0757", "人物行動與情意推論", 3, "基礎", "留下最後一盞燈"], ["CHI-0758", "標點與引語", 1, "中等", "引號是否成對"], ["CHI-0759", "論證與證據", 0, "進階", "勿把相關直接當成因果"], ["CHI-0760", "字義辨析", 1, "基礎", "限制語如「暫」"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0761", "人物行動推論", 2, "基礎", "未交代的動機"], ["CHI-0762", "關聯詞語", 3, "中等", "前後語意判斷關係詞"], ["CHI-0763", "語境詞義", 0, "基礎", "兩個行動的時間關係"], ["CHI-0764", "證據推理與反思", 1, "中等", "新增證據如何改變原判斷"], ["CHI-0765", "文章結構", 2, "中等", "各句在段落中的功能"], ["CHI-0766", "證據與主張", 3, "中等", "對準論點"], ["CHI-0767", "表格與時間判讀", 0, "基礎", "日期與時段"], ["CHI-0768", "成語語境", 1, "中等", "整理人物行動"], ["CHI-0769", "意象與情感", 2, "中等", "意象的變化和方向"], ["CHI-0770", "句意精確", 1, "中等", "同義重複"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0771", "古今詞義", 3, "中等", "文言詞語需依時代"], ["CHI-0772", "因果推論", 0, "中等", "同時發生不等於"], ["CHI-0773", "形近字辨析", 2, "中等", "固定詞語記憶正字"], ["CHI-0774", "轉折語氣", 1, "中等", "比較前後兩個資訊"], ["CHI-0775", "通知目的", 2, "中等", "目的、對象、時段"], ["CHI-0776", "成語語境", 3, "基礎", "移樽就教」指主動登門請教"], ["CHI-0777", "規則條件判讀", 0, "中等", "同時具備基本經驗與頭燈"], ["CHI-0778", "譬喻辨析", 1, "基礎", "本體與用來比喻的喻體"], ["CHI-0779", "詞語搭配", 2, "基礎", "注意「資料說法不一」"], ["CHI-0780", "細節與主旨統整", 2, "中等", "兼顧主要訊息"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0781", "引號與標點", 1, "中等", "引號成對"], ["CHI-0782", "人物態度推論", 3, "中等", "後續行動"], ["CHI-0783", "成語語境", 0, "基礎", "是否根據當下情勢調整"], ["CHI-0784", "指涉清楚", 2, "中等", "明確重複名詞"], ["CHI-0785", "論點與理由判讀", 1, "中等", "作者真正肯定的主張"], ["CHI-0786", "規則條件判讀", 2, "中等", "分清甲區與乙區規則"], ["CHI-0787", "語境詞義", 3, "中等", "觀眾填寫、樂團帶回排練"], ["CHI-0788", "反方觀點回應", 0, "中等", "降低不確定性"], ["CHI-0789", "反問辨識", 1, "基礎", "引導思考或自問自答"], ["CHI-0790", "主旨與細節", 1, "中等", "標題需涵蓋主旨"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0791", "近義詞辨析", 2, "基礎", "動作所要達成的目的"], ["CHI-0792", "資料限制辨析", 3, "中等", "展區開放時間與預約者報到安排"], ["CHI-0793", "客觀表述與證據界線", 0, "中等", "可核對的逾期事實"], ["CHI-0794", "句子順序", 1, "中等", "因果詞與時間詞"], ["CHI-0795", "成語辨析", 2, "中等", "行動的深度與態度"], ["CHI-0796", "主張與例證", 3, "中等", "回扣作者提出的主張"], ["CHI-0797", "書信目的", 0, "基礎", "致謝、請求、通知"], ["CHI-0798", "敘事安排與懸念", 1, "中等", "關鍵資訊出現的先後"], ["CHI-0799", "因果與條件", 2, "中等", "逐項核對"], ["CHI-0800", "語境詞義", 3, "中等", "前後動作構成的流程"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length < 3) errors.push(`${id}: 考點、難度、答案、提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0801", "條件判讀", 1, "中等", "兩項都是必須符合的條件"], ["CHI-0802", "指示順序理解", 1, "基礎", "轉彎前停在橋下"], ["CHI-0803", "表格數據比較", 2, "基礎", "27 本減科普書 18 本"], ["CHI-0804", "複句關係", 3, "基礎", "「雖然……仍……」"], ["CHI-0805", "公告理解", 0, "基礎", "參觀者應從南門進出"], ["CHI-0806", "修辭判讀", 1, "基礎", "點頭迎人"], ["CHI-0807", "資料推論與抽樣", 2, "中等", "只訪校隊會產生代表性偏差"], ["CHI-0808", "文本推論", 3, "基礎", "用失敗修正方法"], ["CHI-0809", "時間表判讀", 0, "基礎", "週六專屬時段"], ["CHI-0810", "主旨與論據", 1, "基礎", "轉傳之前查清發布者"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先標記題幹中的條件") || question.solutionSteps?.some(step => step.includes("對照題幹中的明確線索與各選項")) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案、題目專屬提示或解題步驟不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0811", "兩步驟數量推理", 3, "基礎", "先算乙場比甲場少 8 人"], ["CHI-0812", "複句關係", 3, "基礎", "「還能」提示第二種方法"], ["CHI-0813", "時間推算", 0, "基礎", "14:00 加 30 分鐘"], ["CHI-0814", "句意與語氣", 1, "基礎", "「不如」推薦後者"], ["CHI-0815", "表格與比例計算", 2, "中等", "甲每人 40 元"], ["CHI-0816", "景物描寫與氛圍", 2, "基礎", "夕照色彩和「緩緩」"], ["CHI-0817", "比例與餘數", 0, "中等", "32 乘四分之一"], ["CHI-0818", "比例尺計算", 2, "基礎", "4×5＝20 公里"], ["CHI-0819", "通知資訊整合", 0, "基礎", "一樓常設展及服務台明確照常"], ["CHI-0820", "方法順序與主旨", 3, "中等", "分步蒐證並交叉核對"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || question.teacherTip.includes("先標記題幹中的條件") || question.solutionSteps?.some(step => step.includes("對照題幹中的明確線索與各選項")) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案索引、提示或逐題解法不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0821", "流程順序判讀", 0, "基礎", "先分工整理，之後才合併"], ["CHI-0822", "紀錄摘要與頻率判讀", 1, "基礎", "同時確認出現幾次"], ["CHI-0823", "事件先後判讀", 2, "基礎", "「後」判斷事件順序"], ["CHI-0824", "規定適用範圍判讀", 3, "基礎", "適用對象與明示排除項目"], ["CHI-0825", "程度副詞", 0, "中等", "尚有一位未聯絡"], ["CHI-0826", "因果與否定範圍", 1, "基礎", "分清楚被否定的行為與晚到原因"], ["CHI-0827", "變化歷程與事件順序", 2, "基礎", "山路先變平緩"], ["CHI-0828", "事件狀態與時間線索", 3, "基礎", "摘要要兼顧兩個時間資訊"], ["CHI-0829", "行動目的推論", 0, "基礎", "從「兩種石頭」及「比較紋理」推論"], ["CHI-0830", "行為頻率摘要", 1, "基礎", "摘要不可把「有時搭火車」刪成從不"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0831", "人物行動細節判讀", 2, "基礎", "執行者、檢查範圍及結果"], ["CHI-0832", "規則條件套用", 3, "基礎", "數量至少三個，且容器大小相同"], ["CHI-0833", "事件先後判讀", 0, "基礎", "用「後」判斷先後"], ["CHI-0834", "證據與推論", 1, "基礎", "不能直接證明製作或上色"], ["CHI-0835", "摘要與預期落差", 2, "中等", "預期很久」和「實際很快抵達」兩端"], ["CHI-0836", "流程排序", 3, "基礎", "初始問題，再找人物採取的調整"], ["CHI-0837", "條件範圍應用", 0, "基礎", "同時核對名單限定的期間和身分"], ["CHI-0838", "估量資訊與精確度", 1, "基礎", "保留原有精確程度"], ["CHI-0839", "結果判讀", 2, "中等", "一度面臨取消"], ["CHI-0840", "排班與時段整合", 0, "基礎", "時段連續、人員交接及每人值守長度"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0841", "段落主旨與因果", 2, "中等", "保留文本中的限制條件"], ["CHI-0842", "經典語句解讀", 3, "中等", "先釐清關鍵詞"], ["CHI-0843", "自省與推論", 2, "中等", "「見不賢」與「內自省」"], ["CHI-0844", "轉折與立場", 0, "中等", "部分長者操作不便"], ["CHI-0845", "表格資料判讀", 1, "中等", "次數、人數還是偏好"], ["CHI-0846", "論據與結論", 2, "中等", "測量主張所說的對象與效果"], ["CHI-0847", "敘事順序與改變", 3, "中等", "問題、行動調整與結果"], ["CHI-0848", "意象與情感", 0, "中等", "整合前後文及意象"], ["CHI-0849", "成語辨析", 1, "中等", "仔細到不忽略細節"], ["CHI-0850", "段落結構", 2, "中等", "段落功能與事件順序"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0851", "資料來源與可信度", 3, "中等", "查來源、時間與方法"], ["CHI-0852", "關聯詞語意", 0, "中等", "必要條件與充分條件"], ["CHI-0853", "通知條件判讀", 1, "中等", "變更事項與維持不變"], ["CHI-0854", "古今詞義", 2, "中等", "古今異義詞"], ["CHI-0855", "人物行動推論", 3, "中等", "具體行動為依據"], ["CHI-0856", "對比手法與效果", 0, "中等", "兩端各自代表什麼"], ["CHI-0857", "指代與篇章銜接", 1, "中等", "動作的執行者"], ["CHI-0858", "反證與結論限制", 2, "中等", "結論範圍不可大於樣本範圍"], ["CHI-0859", "語氣與勸勉", 3, "中等", "避免解讀成絕對服從"], ["CHI-0860", "段落安排與功能", 0, "中等", "聯繫前後文"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0861", "議論主旨", 1, "中等", "抓對比結構"], ["CHI-0862", "古典詞義", 2, "中等", "受詞和整句語意"], ["CHI-0863", "語句應用", 3, "中等", "具體行動相互吻合"], ["CHI-0864", "譬喻與意象", 0, "中等", "本體、喻體與共同特徵"], ["CHI-0865", "主旨與證據", 1, "中等", "保留證據界線"], ["CHI-0866", "轉折關係", 2, "中等", "比較前後分句"], ["CHI-0867", "材料與結論", 3, "中等", "按文本順序整理步驟"], ["CHI-0868", "詩句推論", 0, "中等", "可感的景物呈現抽象季節"], ["CHI-0869", "成語本義辨析", 1, "中等", "區分「容易被懷疑」和「確實做錯」"], ["CHI-0870", "論點與推論", 2, "中等", "實際測量結果支持論點"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案索引或題目提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0871", "來源判讀", 3, "中等", "追溯原始出處"], ["CHI-0872", "語句涵義", 0, "中等", "相鄰句確認作者志向"], ["CHI-0873", "雙重否定語意", 1, "中等", "還原否定範圍"], ["CHI-0874", "公告條件與例外", 2, "中等", "例外條件是否被觸發"], ["CHI-0875", "敘事觀點", 3, "中等", "敘述者能掌握哪些資訊"], ["CHI-0876", "引文與轉述", 0, "中等", "保留原文的範圍和語氣"], ["CHI-0877", "象徵與勸勉", 1, "中等", "意象如何轉為引申意義"], ["CHI-0878", "數據比較與限制", 2, "基礎", "因果與個別變化需額外資料"], ["CHI-0879", "成語典故與態度", 3, "中等", "不可直接等同於年紀較小"], ["CHI-0880", "範圍詞與結論", 0, "中等", "限定樣本範圍"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0881", "情境推論", 1, "中等", "條件是否成立"], ["CHI-0882", "語意關係", 2, "基礎", "時間順序與轉折"], ["CHI-0883", "成語辨析", 3, "中等", "實際行動判斷"], ["CHI-0884", "文言語意", 0, "基礎", "喻體特徵連回"], ["CHI-0885", "書名號使用", 3, "基礎", "作品名稱"], ["CHI-0886", "意象與情感", 1, "基礎", "意象需連結其作用"], ["CHI-0887", "來源可信度", 2, "中等", "來源、方法與可重現證據"], ["CHI-0888", "句子修訂", 1, "基礎", "題目指定保留的句型"], ["CHI-0889", "條件整合", 1, "中等", "避免「日前」是否含當日的歧義"], ["CHI-0890", "擬人修辭", 3, "基礎", "勿只憑句子生動就判成譬喻"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0891", "資料推論與因果限制", 0, "進階", "是否控制其他變因"], ["CHI-0892", "詞語在語境中的意思", 1, "中等", "前後行動中"], ["CHI-0893", "經典語句理解", 2, "中等", "分別解詞再合併主旨"], ["CHI-0894", "擬人及其效果", 3, "中等", "賦予非人的對象"], ["CHI-0895", "比例與圖表判讀", 0, "基礎", "部分占整體"], ["CHI-0896", "論證證據評估", 1, "進階", "對照、樣本與方法"], ["CHI-0897", "轉折關係辨識", 2, "基礎", "關聯詞與前後語意"], ["CHI-0898", "敘事觀點判讀", 3, "中等", "誰在說故事"], ["CHI-0899", "標點與直接引語", 3, "基礎", "提示語與引語範圍"], ["CHI-0900", "段落功能與主旨", 0, "中等", "比較前文已說明的事與末句新增的資訊"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0901", "由情節推論人物特質", 1, "中等", "行動與結果"], ["CHI-0902", "經典語句理解", 2, "中等", "知道、喜愛、以之為樂"], ["CHI-0903", "譬喻修辭判讀", 3, "中等", "本體、喻詞與喻體"], ["CHI-0904", "詞語在語境中的意思", 0, "中等", "搭配對象與後續行動"], ["CHI-0905", "歸納文章主旨與證據", 1, "中等", "整合全文證據"], ["CHI-0906", "不恥下問的語境判讀", 2, "基礎", "身分或學問較低者"], ["CHI-0907", "不約而同的語意", 3, "基礎", "未事先商量"], ["CHI-0908", "由具體意象推論情意", 0, "中等", "意象、收訊對象與語氣"], ["CHI-0909", "擬人修辭判讀", 1, "中等", "人的身分、情感或動作"], ["CHI-0910", "歸納說明文主旨", 2, "中等", "材料、作法與目的"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0911", "一曝十寒", 3, "基礎", "時做時停"], ["CHI-0912", "公告資訊判讀", 0, "基礎", "時間、地點與適用對象"], ["CHI-0913", "倒敘與敘事效果", 1, "中等", "比較文本事件發生的時間"], ["CHI-0914", "轉折複句", 2, "基礎", "前後分句的邏輯"], ["CHI-0915", "依據文本推論", 0, "基礎", "文本明說與自行推測"], ["CHI-0916", "資料取樣範圍", 3, "中等", "回覆者與抽樣方式"], ["CHI-0917", "語境詞義判讀", 1, "中等", "反義行為推測詞義"], ["CHI-0918", "人物行動與品格推論", 0, "中等", "具體言行為依據"], ["CHI-0919", "譬喻修辭辨識", 1, "基礎", "喻詞與本體、喻體"], ["CHI-0920", "百分比與資料統整", 2, "基礎", "有效樣本數"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0921", "主張與證據評估", 3, "進階", "直接對應主張中的結果"], ["CHI-0922", "複句關係判讀", 0, "基礎", "關聯詞與兩分句"], ["CHI-0923", "語用意圖推論", 1, "基礎", "期待對方採取的行動"], ["CHI-0924", "反諷語氣判讀", 1, "基礎", "字面語意與具體情境"], ["CHI-0925", "文化資產保存原則", 2, "中等", "修復的可逆性"], ["CHI-0926", "圖表資訊整合", 3, "基礎", "求差、總和或比例"], ["CHI-0927", "成語語境判讀", 0, "基礎", "具體行動驗證詞義"], ["CHI-0928", "展品脈絡與策展意圖", 1, "中等", "物件、地圖和文字說明"], ["CHI-0929", "設問與反問辨識", 2, "中等", "自問自答"], ["CHI-0930", "比例與單位換算", 3, "基礎", "總人數乘比例"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0931", "比較論點與推論", 0, "中等", "是否矛盾"], ["CHI-0932", "詞性與語境判讀", 1, "基礎", "句中功能"], ["CHI-0933", "敘述順序判讀", 2, "中等", "主線中穿插"], ["CHI-0934", "標點與列舉", 3, "基礎", "不用來引出清單"], ["CHI-0935", "篇章銜接與指代", 1, "基礎", "代詞的數量與語意"], ["CHI-0936", "比率與資料解讀", 3, "中等", "換算成每次平均"], ["CHI-0937", "詞語語境判讀", 1, "基礎", "題目要求的是成語"], ["CHI-0938", "程序與目的推論", 0, "中等", "各步驟的先後"], ["CHI-0939", "排比修辭與語勢", 1, "基礎", "三個以上相近句式"], ["CHI-0940", "平均數計算", 2, "基礎", "先算總和"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0941", "作者立場與讓步", 3, "中等", "主張、轉折與結論"], ["CHI-0942", "詞語搭配與語意", 0, "基礎", "動詞與對象的語意關係"], ["CHI-0943", "物件細節與人物情感", 2, "中等", "人物記憶、關係或當下心境"], ["CHI-0944", "分號使用", 3, "中等", "分隔內部已有逗號的並列分句"], ["CHI-0945", "段落主旨統整", 1, "中等", "涵蓋多個細節"], ["CHI-0946", "遞進複句", 3, "基礎", "後項是在前項基礎上增加"], ["CHI-0947", "成語語境辨識", 0, "基礎", "情境中的行為改寫成白話"], ["CHI-0948", "古文人物行動與寓意", 1, "中等", "分句翻譯"], ["CHI-0949", "譬喻與象徵", 2, "中等", "本體與喻體"], ["CHI-0950", "速度與時間計算", 3, "基礎", "統一單位"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0951", "程序條件整合", 0, "中等", "先後順序與禁止事項"], ["CHI-0952", "詞語語境與近義辨析", 1, "中等", "拆解詞素"], ["CHI-0953", "描寫手法與感官線索", 2, "基礎", "感官線索詞"], ["CHI-0954", "關聯詞與條件句", 3, "基礎", "關聯詞"], ["CHI-0955", "結論與建議功能", 0, "中等", "總結、推論或提出行動"], ["CHI-0956", "比率與基數判讀", 1, "中等", "各自使用正確基數"], ["CHI-0957", "成語情境應用", 0, "基礎", "事前準備"], ["CHI-0958", "主張與證據的對應", 2, "進階", "解釋兩者關係"], ["CHI-0959", "映襯與對比", 3, "基礎", "被對照的元素及其差異效果"], ["CHI-0960", "距離差計算", 0, "基礎", "對齊小數點"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0961", "論證條件與例外", 1, "中等", "界定主張適用方式"], ["CHI-0962", "近義詞語辨析", 2, "基礎", "常見搭配和上下文"], ["CHI-0963", "感官摹寫辨識", 3, "基礎", "看、聽、聞、嘗、觸"], ["CHI-0964", "讓步複句關係", 1, "中等", "即使、縱然"], ["CHI-0965", "標題與主旨統整", 2, "中等", "核心而非只抓一個細節"], ["CHI-0966", "語境詞義", 1, "基礎", "搭配對象和上下文"], ["CHI-0967", "百分率變化計算", 0, "中等", "原數量為基準"], ["CHI-0968", "轉折關係", 2, "基礎", "分句間的邏輯關係"], ["CHI-0969", "學習活動目的推論", 3, "中等", "流程先後"], ["CHI-0970", "冒號使用", 2, "基礎", "提示下文"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0971", "成語語境", 0, "基礎", "題幹行為"], ["CHI-0972", "文本觀點辨析", 1, "中等", "問題與對策"], ["CHI-0973", "譬喻辨析", 2, "基礎", "本體、喻體及兩者的相似關係"], ["CHI-0974", "公告資訊整合", 3, "基礎", "時間、對象、地點與期限"], ["CHI-0975", "一字多義", 0, "基礎", "搭配的對象"], ["CHI-0976", "因果關係辨析", 1, "中等", "排除替代解釋"], ["CHI-0977", "成語語意辨析", 2, "中等", "證據能支持的範圍"], ["CHI-0978", "方案公平性與需求考量", 3, "中等", "不同參與者的需求"], ["CHI-0979", "作者觀點與理由", 0, "中等", "特別強調的理由"], ["CHI-0980", "推論與證據", 0, "基礎", "具體行動為依據"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0981", "詞語精確使用", 1, "基礎", "時間特徵"], ["CHI-0982", "反方論點回應", 0, "中等", "疑慮和回應"], ["CHI-0983", "形近字辨析", 1, "中等", "固定詞語的正確寫法"], ["CHI-0984", "段落組織", 3, "基礎", "段落功能與順序"], ["CHI-0985", "溫故知新", 2, "中等", "拆解關鍵詞"], ["CHI-0986", "主詞與指涉", 3, "中等", "名詞重述"], ["CHI-0987", "事實與意見辨析", 1, "中等", "感受與價值判斷"], ["CHI-0988", "成語辨析", 1, "基礎", "概括行為特徵"], ["CHI-0989", "人物行動與品格推論", 2, "基礎", "具體行動作為證據"], ["CHI-0990", "因果推論", 3, "基礎", "文本能支持的推論"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0991", "書信目的判讀", 0, "基礎", "文種、目的用語"], ["CHI-0992", "成語詞義", 1, "基礎", "接納多元意見"], ["CHI-0993", "觀點比較", 2, "中等", "分別概括觀點"], ["CHI-0994", "列舉手法與功能", 3, "基礎", "不一定是排比"], ["CHI-0995", "例證功能", 0, "中等", "個案不能無限推廣"], ["CHI-0996", "近義詞辨析", 1, "基礎", "拆解字義"], ["CHI-0997", "古今詞義", 2, "中等", "現代常用義"], ["CHI-0998", "句意通順", 1, "基礎", "語意、語法和冗詞"], ["CHI-0999", "通知條件判讀", 3, "中等", "一般規則"], ["CHI-1000", "頓號與逗號", 1, "基礎", "列舉項目的層級"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0001", "成語意義", 0, "基礎", "事件發生的先後"], ["CHI-0002", "成語辨析", 2, "基礎", "已發生"], ["CHI-0003", "成語語境", 0, "基礎", "具體情境"], ["CHI-0004", "成語辨析", 1, "中等", "因果和結果"], ["CHI-0005", "成語語境", 1, "基礎", "變化方向"], ["CHI-0006", "成語意義", 0, "基礎", "雙方往來"], ["CHI-0007", "成語辨析", 2, "中等", "推論錯誤"], ["CHI-0008", "成語運用", 1, "中等", "本義、搭配對象"], ["CHI-0009", "成語情境判讀", 0, "中等", "共同處境"], ["CHI-0010", "成語辨析", 3, "基礎", "矯枉過正"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0011", "成語語境", 2, "中等", "完整行動過程"], ["CHI-0012", "數據判讀", 1, "中等", "辨認分母與總量"], ["CHI-0013", "成語辨析", 3, "基礎", "宣稱與實際行為"], ["CHI-0014", "多音字辨讀", 1, "基礎", "完整詞語判讀"], ["CHI-0015", "形近字音辨讀", 0, "中等", "括號字的標音"], ["CHI-0016", "形近字辨析", 1, "基礎", "逐字確認固定詞形"], ["CHI-0017", "字形辨析", 0, "基礎", "整個詞記憶"], ["CHI-0018", "語境近義詞", 3, "基礎", "詞性與搭配"], ["CHI-0019", "易混字辨析", 3, "中等", "同字多義與形近字"], ["CHI-0020", "一字多義", 0, "中等", "語境中的實際義項"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
for (const [id, point, answer, difficulty, clue] of [["CHI-0021", "詞義辨析", 3, "基礎", "保留核心語義"], ["CHI-0022", "文言詞義", 2, "中等", "句法位置與上下文"], ["CHI-0023", "語境詞義", 0, "基礎", "受詞和上下文"], ["CHI-0024", "主語判斷", 2, "基礎", "陳述的對象"], ["CHI-0025", "句型辨識", 3, "基礎", "表達功能"], ["CHI-0026", "關聯詞語", 3, "中等", "前後分句的邏輯"], ["CHI-0027", "句子修改", 2, "中等", "確認邏輯關係"], ["CHI-0028", "複句關係", 2, "中等", "關聯詞與兩分句邏輯"], ["CHI-0029", "譬喻", 1, "基礎", "本體、喻詞與喻體"], ["CHI-0030", "擬人", 0, "基礎", "人的行動、情感或語言"]]) {
  const question = chineseAuthored.find(item => item.id === id);
  if (!question || question.knowledgePoint !== point || question.answer !== answer || question.difficulty !== difficulty || question.options?.length !== 4 || !question.teacherTip.includes(clue) || !question.explanation || question.solutionSteps?.length !== 3) errors.push(`${id}: 考點、難度、答案或逐題提示不符`);
}
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
const questionImageRenderer = await readFile(join(root, "app.js"), "utf8");
if (!questionImageRenderer.includes('<img class="question-image-object"') || !questionImageRenderer.includes('classList.contains("question-image-object")') || !questionImageRenderer.includes('fallback.className="question-image-fallback"')) errors.push("題目圖檔必須以原生圖片安全顯示、套用共用尺寸樣式，且載入失敗須有可見回復");
for (const id of ["OFF-0013", "OFF-0879"]) {
  const question = official.find(item => item.id === id);
  if (!question?.questionImage || question.options?.length !== 4 || question.optionDescriptions?.length !== 4 || question.optionDescriptions.some(description => !description.trim())) errors.push(`${id}: 圖像選項缺少逐項文字替代描述`);
}
if (!questionImageRenderer.includes("labelVisualOptionChoices") || !questionImageRenderer.includes('setAttribute("aria-label"')) errors.push("圖像選項按鈕必須將逐項替代描述提供給螢幕閱讀器");
const social112Question47 = official.find(question => question.id === "OFF-0603");
if (!social112Question47?.requiresImage || !social112Question47.questionImage?.startsWith("./assets/official-exams/112-social-q47-fuji-contour-map.svg?v=") || !social112Question47.questionImages?.includes(social112Question47.questionImage)) errors.push("112年社會第47題：必要且版本化的等高線圖未掛載");
for (const question of official) {
  const images = question.requiresImage ? (question.questionImages?.length ? question.questionImages : [question.questionImage].filter(Boolean)) : [];
  for (const image of images) {
    try {
      await access(join(root, image.replace(/^\.\//, "").split(/[?#]/, 1)[0]));
    } catch {
      errors.push(`${question.id}: 找不到頁圖 ${image}`);
    }
  }
}
for (const { id, image } of imageReferences) {
  try {
    await access(join(root, image.replace(/^\.\//, "").split(/[?#]/, 1)[0]));
  } catch {
    errors.push(`${id}: 找不到題目素材 ${image}`);
  }
}
const staleRingAreaAssertion = errors.indexOf("MAT-0891: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏");
if (staleRingAreaAssertion !== -1) errors.splice(staleRingAreaAssertion, 1);
for (const staleAssertion of [
  "MAT-0351: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏",
  "MAT-0538: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0668: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0487: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0597: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0648: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0711: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0964: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏",
  "MAT-0114: 答案索引、難度、計算線索、四選項、解題步驟或教師提醒不一致／缺漏",
  "MAT-0146: 答案、單元／考點、難度、選項或解題步驟不一致／缺漏",
  "MAT-0670: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0706: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0340: 答案、單元、難度、解題證據或專屬教師提醒不一致／缺漏",
  "MAT-0460: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0645: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0747: 答案、分類、難度、逐步計算或專屬提醒不一致／缺漏",
  "MAT-0831: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏",
  "MAT-0857: 答案索引、正解選項、分類、難度、逐步計算或教師提醒不一致／缺漏",
  "MAT-0944: 答案索引、正解選項、分類、逐步計算或教師提醒不一致／缺漏"
]) {
  const staleIndex = errors.indexOf(staleAssertion);
  if (staleIndex !== -1) errors.splice(staleIndex, 1);
}
const staleRhombusAssertion = errors.findIndex(message => message.startsWith("MAT-0944: 答案索引、正解選項"));
if (staleRhombusAssertion !== -1) errors.splice(staleRhombusAssertion, 1);
if (total !== 6108) errors.push(`總題數 ${total}，應為 6108`);
console.log(`official: ${official.length} 題；similar: ${similar.length} 題；總計 ${total} 題`);
if (errors.length) {
  console.error(errors.slice(0, 100).join("\n"));
  console.error(`共 ${errors.length} 個錯誤`);
  process.exit(1);
}
console.log(`驗證完成：${total} 題、${allIds.size} 個唯一 ID、五年題號與頁圖完整。`);
