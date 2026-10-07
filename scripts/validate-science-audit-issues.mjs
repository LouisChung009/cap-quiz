import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const byId = new Map(questions.map((question) => [question.id, question]));
const checks = [
  ["SCI-0206", (question) => question.knowledgePoint === "蒸散作用"],
  ["SCI-0380", (question) => !question.question.includes("示意圖") && question.question.includes("肺部流出")],
  ["SCI-0451", (question) => !question.question.includes("圖線") && question.question.includes("1 m/s") && question.question.includes("5 m/s")],
  ["SCI-0618", (question) => !question.question.includes("天氣圖") && ["1008", "1004", "1000"].every(value => question.question.includes(value))],
  ["SCI-0640", (question) => question.question.includes("100 mg 澱粉") && question.question.includes("同一批唾液") && question.question.includes("相同體積")],
  ["SCI-0946", (question) => !question.question.includes("若圖") && question.question.includes("草→兔→狐狸")],
  ["SCI-0966", (question) => !question.question.includes("能量圖") && question.question.includes("能量峰頂降低")],
  ["SCI-0977", (question) => !question.question.includes("在距離—時間圖上") && question.question.includes("每 2 秒增加 6 m")]
];

for (const [id, check] of checks) {
  const question = byId.get(id);
  if (!question || !check(question) || question.options?.length !== 4 || !question.explanation || !question.solutionSteps?.length) {
    throw new Error(`${id}: verified self-contained wording, four choices, or solution content is missing`);
  }
}

console.log("Science audit repairs SCI-0206, SCI-0380, SCI-0451, SCI-0618, SCI-0640, SCI-0946, SCI-0966, and SCI-0977 passed.");
