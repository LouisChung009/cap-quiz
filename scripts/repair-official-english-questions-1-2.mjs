import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const byId = new Map(questions.map(question => [question.id, question]));
const first = byId.get("OFF-0049");
const second = byId.get("OFF-0050");
if (!first || !second || first.subject !== "英文" || second.subject !== "英文") throw new Error("找不到待修正的官方英文題");

Object.assign(first, {
  knowledgePoint: "110年英文第1題",
  question: "In the picture, the boy is ____ the old man.",
  questionImage: "./assets/official-exams/110-english-p2.webp",
  imageAlt: "110年國中教育會考英文科第1題插圖：男孩向長者鞠躬",
  options: ["smiling at", "dancing with", "cheering for", "bowing to"],
  answer: 3,
  explanation: "男孩彎腰向長者行禮，句子要描述他正在做的動作，因此選 D「bowing to」（向……鞠躬）。smiling at 是對人微笑，cheering for 是替人加油；圖片沒有呈現這兩種動作。",
  solutionSteps: [
    "看圖辨認動作：男孩上身前傾、面向站立的長者，呈現行禮姿勢。",
    "bow to someone 表示向某人鞠躬，故 D「bowing to」與圖片相符。",
    "smile at 是微笑，dance with 是共舞，cheer for 是加油；圖中都沒有這些動作。",
  ],
  teacherTip: "看圖字彙題先描述人物姿勢與互動，再選能精確表達動作的片語。",
  requiresImage: true,
  requiresContext: false,
  questionImages: ["./assets/official-exams/110-english-p2.webp"],
});

Object.assign(second, {
  knowledgePoint: "110年英文第2題",
  question: "Listen! The baby ____ in the bedroom. Why don’t you go in and take a look?",
  questionImage: "./assets/official-exams/110-english-p2.webp",
  imageAlt: "110年國中教育會考英文科第2題題面",
  options: ["cried", "cries", "is crying", "will cry"],
  answer: 2,
  explanation: "Listen! 表示說話者正在注意當下發生的事；「go in and take a look」也暗示嬰兒此刻正在房間裡哭，因此選 C「is crying」，用現在進行式描述正在發生的動作。cried 是過去式，cries 表習慣，will cry 指未來，皆不合此時語境。",
  solutionSteps: [
    "Listen! 是現在的提示語，表示說話者聽見或注意到眼前正在發生的聲音。",
    "句子接著請對方進房查看，嬰兒是在此刻哭；現在進行式 is crying 最合適。",
    "cried 指過去，cries 指習慣或一般事實，will cry 指未來，均與當下情境不合。",
  ],
  teacherTip: "Listen! 常用來引出正在發生的聲音或事件，留意現在進行式的時間線索。",
  requiresImage: false,
  requiresContext: false,
  questionImages: ["./assets/official-exams/110-english-p2.webp"],
});

if (first.source?.questionNumber !== 1 || second.source?.questionNumber !== 2) throw new Error("官方題號 metadata 不符");
for (const question of [first, second]) {
  if (question.options.length !== 4 || new Set(question.options).size !== 4 || question.options[question.answer] === "A") throw new Error(`${question.id}: 選項或答案未修正`);
  if (!`${question.explanation} ${question.solutionSteps.join(" ")}`.includes(question.options[question.answer])) throw new Error(`${question.id}: 解析未對應正解`);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired official English question content and page mappings for 110 Q1–Q2.");
