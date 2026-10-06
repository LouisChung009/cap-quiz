import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "social.json"), "utf8"));
const checks = new Map([
  ["SOC-0464", { answer: 0, phrase: "360,000÷2,000＝180", clue: "反求面積" }],
  ["SOC-0568", { answer: 3, phrase: "90,000÷150＝600", clue: "增加量" }],
  ["SOC-0585", { answer: 0, phrase: "3,000 人／平方公里", clue: "人口較多" }],
  ["SOC-0935", { answer: 2, phrase: "審議預算", clue: "預算審議" }],
  ["SOC-0586", { answer: 1, phrase: "36÷240＝15%", clue: "高齡人口除以總人口" }],
  ["SOC-0026", { answer: 2, phrase: "居民提出意見與替代方案", clue: "公聽會" }],
  ["SOC-0031", { answer: 2, phrase: "公民運用公開資訊監督公共事務", clue: "促進知情" }]
]);
const issues = [];
for (const [id, expected] of checks) {
  const row = rows.find(item => item.id === id);
  if (!row || row.options?.length !== 4 || row.answer !== expected.answer || !row.explanation.includes(expected.phrase) || !row.teacherTip.includes(expected.clue) || row.solutionSteps?.length !== 3) {
    issues.push(`${id}: incomplete reverse/increment/comparison reasoning or instructional fields`);
  }
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("Seven Social Studies items have distinct, verified density, population-structure, civic-participation, and public-information reasoning.");
