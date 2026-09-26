import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const letters = ["A", "B", "C", "D"];

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function splitQuestion(item) {
  let raw = item.question.replaceAll("\\n", "\n")
    .replace(/^【[^】]+】\s*/, "")
    .replace(/^\s*\d{1,2}\s*[.．]\s*/, "")
    .replace(/\s+\d+\s*$/, "")
    .trim();
  const marker = /[(（]([A-D])\s*[)）]/g;
  const matches = [...raw.matchAll(marker)];
  for (let start = 0; start <= matches.length - 4; start += 1) {
    const group = matches.slice(start, start + 4);
    if (group.map(match => match[1]).join("") !== "ABCD") continue;
    const options = group.map((match, index) => clean(raw.slice(match.index + match[0].length, group[index + 1]?.index ?? raw.length)));
    if (options.every(Boolean)) return { question: clean(raw.slice(0, group[0].index)), options };
  }
  return { question: clean(raw), options: item.options };
}

function needsImage(question, options) {
  const text = `${question} ${options.join(" ")}`;
  return /下圖|附圖|如圖|右圖|左圖|圖中|圖示|圖表|地圖|流程圖|關係圖|統計圖|示意圖|照片|影像|位置圖|剖面圖|坐標圖|座標圖|實驗裝置|shown below|following (?:chart|graph|map|diagram|picture|figure)/i.test(text);
}

function subjectSteps(item, answerText, wrongOptions) {
  const focus = clean(item.question).slice(0, 90);
  const wrongSummary = wrongOptions.map(({ letter, text }) => `${letter}「${text}」`).join("；");
  const sharedLast = `最後核對四個選項：${wrongSummary}都無法完整符合題目條件，因此選 ${letters[item.answer]}。`;
  if (item.subject === "國文") return [
    `先確認題目要求，再回到文本找證據。本題核心是「${focus}」。`,
    `正確選項 ${letters[item.answer]}「${answerText}」能直接對應文句、語意或寫作目的，不需要加入題目沒有提供的推測。`,
    sharedLast,
  ];
  if (item.subject === "英文") return [
    `先讀題幹並定位主詞、動詞、時態與連接詞；本題關鍵語境是「${focus}」。`,
    `把 ${letters[item.answer]}「${answerText}」代回原句，文法結構與上下文意思都能連貫。`,
    sharedLast,
  ];
  if (item.subject === "數學") return [
    `整理題目已知量與所求量：「${focus}」。先判斷應使用的運算、公式或幾何關係。`,
    `依條件計算或逐項代入，得到與 ${letters[item.answer]}「${answerText}」相符的結果。`,
    `${sharedLast} 作答後再將結果代回原條件，檢查正負號、單位及範圍。`,
  ];
  if (item.subject === "自然") return [
    `辨認題目涉及的科學概念、實驗變因或圖表資訊：「${focus}」。`,
    `依定律與題目證據判斷，${letters[item.answer]}「${answerText}」符合因果關係及觀察結果。`,
    `${sharedLast} 特別避免把同時發生誤判為因果關係。`,
  ];
  return [
    `先從材料找出時間、地點、人物、制度或區域線索：「${focus}」。`,
    `將線索對應到課本概念後，${letters[item.answer]}「${answerText}」與材料所呈現的歷史、地理或公民脈絡一致。`,
    `${sharedLast} 不要只憑印象選擇，要以題目材料作為判斷依據。`,
  ];
}

let parsed = 0;
let images = 0;
for (const item of questions) {
  if (item.sourceType !== "官方歷屆真題") continue;
  const result = splitQuestion(item);
  item.question = result.question;
  if (result.options.length === 4 && result.options.join("") !== "ABCD") {
    item.options = result.options;
    parsed += 1;
  }
  const parsedOptions = item.options.join("") !== "ABCD";
  const missingSharedPassage = /^\\?n?\s*\d{1,2}[.．]?\s*$/.test(item.question);
  item.requiresImage = Boolean(item.requiresImage || !parsedOptions || missingSharedPassage || needsImage(item.question, item.options));
  if (!item.question || missingSharedPassage) item.question = `請閱讀圖中的題組文章，完成第 ${item.source.questionNumber} 題。`;
  if (item.requiresImage) images += 1;
  const answerText = clean(item.options[item.answer]) || letters[item.answer];
  const wrongOptions = item.options
    .map((text, index) => ({ letter: letters[index], text: clean(text) }))
    .filter((_, index) => index !== item.answer);
  item.explanation = `答案為 ${letters[item.answer]}「${answerText}」。這個選項最完整符合題幹所給的條件與證據。`;
  item.solutionSteps = subjectSteps(item, answerText, wrongOptions);
  if (item.subject === "英文") {
    item.relatedWords = ["context clue（上下文線索）", "eliminate（排除不合選項）", "paraphrase（換句話說）"];
    item.teacherTip = "先把選項代回完整句子，再同時檢查文法與語意；只符合其中一項仍不能選。";
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ official: questions.filter(item => item.sourceType === "官方歷屆真題").length, parsed, images }, null, 2));
