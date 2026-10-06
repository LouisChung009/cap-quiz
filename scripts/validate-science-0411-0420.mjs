import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const failures = [];
for (let number = 411; number <= 420; number++) {
  const id = `SCI-${String(number).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.options?.length !== 4 || new Set(item.options).size !== 4 || item.solutionSteps?.length < 3) {
    failures.push(`${id}: incomplete stem, options, or worked solution`);
    continue;
  }
  if (!item.options[item.answer] || !item.explanation || !item.teacherTip) failures.push(`${id}: incomplete correct answer or teaching explanation`);
}
const expectations = [
  ["SCI-0411", 2, "6 m/s", "休息 20 s"],
  ["SCI-0412", 3, "韌皮部運送的有機養分難以向下到達根部", "木質部"],
  ["SCI-0413", 0, "地球自轉", "亮區、暗區"],
  ["SCI-0414", 1, "甲點較大", "30 cm"],
  ["SCI-0415", 2, "褶皺較多的一段吸收較快，因接觸面積較大", "其他條件相同"],
];
for (const [id, answer, option, evidence] of expectations) {
  const item = rows.find(row => row.id === id);
  if (item?.answer !== answer || item.options?.[answer] !== option || !item.question.includes(evidence)) failures.push(`${id}: scenario evidence, answer index, and option do not agree`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0411–0420 scenario evidence, answer indices, and worked teaching content passed.");
