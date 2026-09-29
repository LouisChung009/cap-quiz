import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const corrections = {
  "OFF-0051": {
    explanation: "Jill 因為公園為音樂節關閉而不能慢跑，句中的 because now she can’t jog there 表達失望，因此應選 unhappy（不開心的）。excited 是興奮、proud 是驕傲、scared 是害怕，都沒有符合她因活動受阻而失望的語意。",
    solutionSteps: [
      "先讀 because 後面的原因：公園關閉，Jill 現在不能去慢跑。",
      "不能做原本想做的事，情緒最合理是 unhappy（不開心的），所以選 D。",
      "excited、proud、scared 分別表示興奮、驕傲、害怕，題幹沒有支持這些情緒。",
    ],
    teacherTip: "情緒字彙題要用 because 後面的原因推論，不要只看人物或活動名稱。",
  },
  "OFF-0052": {
    explanation: "Steven 喜歡看人們享用他準備的食物，因此他想成為 cook（廚師）。food he prepares 是直接線索；doctor、driver、farmer 都不能直接說明他準備食物給人享用的工作。",
    solutionSteps: [
      "圈出 food he prepares（他準備的食物）以及 people enjoy（人們享用）兩個線索。",
      "能準備食物並以他人享用為樂，最符合 cook（廚師），選 A。",
      "doctor 治療病人、driver 開車、farmer 從事農業；題幹沒有提供這些職業的線索。",
    ],
    teacherTip: "職業題先找工作內容或服務對象，再對照職業名稱。",
  },
  "OFF-0053": {
    explanation: "since he came to work in Taiwan a year ago 指從過去某時起直到現在，需用現在完成式；Paul 至今沒有見到父母，故用 hasn’t seen。現在完成式結構為 has／have + 過去分詞，see 的過去分詞是 seen。",
    solutionSteps: [
      "找時間線索 since he came ... a year ago：動作從一年前持續到現在。",
      "主詞 He 為第三人稱單數，現在完成式用 has；否定式為 hasn’t + 過去分詞。",
      "see 的過去分詞是 seen，因此 hasn’t seen 正確；saw 是過去式，不能接在 has 後。",
    ],
    teacherTip: "since + 過去時間點常搭配現在完成式；記得使用過去分詞而非過去式。",
  },
};

for (const [id, correction] of Object.entries(corrections)) {
  const question = questions.find(item => item.id === id);
  if (!question || question.subject !== "英文") throw new Error(`找不到英文題 ${id}`);
  const answer = question.options[question.answer];
  if (!correction.explanation.includes(answer) || correction.solutionSteps.length < 3) {
    throw new Error(`${id}: 校正解析未對應正解`);
  }
  Object.assign(question, correction);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log(`Updated ${Object.keys(corrections).length} official English explanations.`);
