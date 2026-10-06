import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const expected = new Map([
  ["MAT-0342", [0, "恰好一紅一藍", "3/10＋3/10＝6/10＝3/5", "兩種先後順序"]],
  ["MAT-0423", [2, "至少抽到一顆藍球", "1－3/10＝7/10", "相反事件"]],
  ["MAT-0927", [1, "3 的倍數或 4 的倍數", "4＋3－1＝6 格", "交集"]]
]);
const failures = [];

for (const [id, [answer, stem, evidence, tip]] of expected) {
  const item = rows.find(row => row.id === id);
  if (!item || item.answer !== answer || item.options?.length !== 4 || new Set(item.options).size !== 4 ||
      !item.question.includes(stem) || !item.explanation.includes(evidence) || !item.solutionSteps?.some(step => step.includes(evidence)) ||
      !item.teacherTip.includes(tip)) failures.push(`${id}: probability-event reasoning or evidence is incomplete`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Three probability questions have distinct event structures and verified answer reasoning.");
