import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0103": {
    question: "已知 a = −5/223、b = 6/263、c = −7/293，判斷下列各式之值何者最大？",
    options: ["|a + b + c|", "|a + b − c|", "|a − b + c|", "|a − b − c|"],
    answer: 2,
    explanation: "答案 C「|a−b+c|」。因 a<0、b>0、c<0，C 式內 a−b+c 三項都為負，絕對值等於 |a|+b+|c|，即三個數的絕對值總和。其他選項的式內同時有正項和負項，會相互抵銷，絕對值嚴格小於 |a|+b+|c|；不必把三個分數通分即可比較。",
    solutionSteps: ["由分數可判斷 a、c 為負數，b 為正數。", "C 式 a−b+c 中，a、−b、c 全為負，因此 |a−b+c|=|a|+b+|c|。", "A、B、D 的式內都包含正負異號項，絕對值會因抵銷而小於三項絕對值之和，所以 C 最大。"],
    requiresImage: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(4)) - 89;
  if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== expectedNumber) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  if (!fix.requiresImage) {
    delete question.questionImage;
    delete question.questionImages;
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored 110 math Q14–15 notation and worked reasoning.");
