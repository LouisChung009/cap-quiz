import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const checks = new Map([
  ["MAT-0831", [3, "正多邊形外角與邊數", "360÷40＝9", "內角和公式"]],
  ["MAT-0460", [3, "等差數列通項", "5＋44＝49", "前 n 列總數"]],
  ["MAT-0340", [3, "長方體體積", "60÷20＝3", "長度單位"]],
  ["MAT-0747", [2, "菱形面積", "10×24÷2＝120", "梯形的兩底和"]],
  ["MAT-0645", [0, "三角形內外角互補", "180°−120°＝60°", "相鄰內角與外角互補"]],
  ["MAT-0648", [3, "立體圖形縮放與體積倍率", "2×2×2＝8", "三個方向"]],
  ["MAT-0857", [2, "二次方程式與畢氏定理的面積建模", "√(3²＋4²)＝5", "用畢氏定理"]],
  ["MAT-0944", [2, "菱形對角線與面積反求", "d＝160÷10＝16", "面積公式倒過來"]]
]);
const issues = [];
for (const [id, [answer, point, evidence, tip]] of checks) {
  const row = rows.find(item => item.id === id);
  const worked = `${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")}`;
  if (!row || row.answer !== answer || row.knowledgePoint !== point || row.options?.length !== 4 || new Set(row.options).size !== 4 || row.solutionSteps?.length !== 3 || !worked.includes(evidence) || !row.teacherTip.includes(tip)) issues.push(`${id}: key, corrected concept, or worked evidence mismatch`);
}
const rhombus = rows.find(row => row.id === "MAT-0747");
if (rhombus?.options?.[rhombus.answer] !== "120 平方公分" || !rhombus.question.includes("菱形")) issues.push("MAT-0747: rhombus prompt and correct option must agree on 120 cm²");
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("Eight math geometry/sequence items pass targeted key, concept, and explanation regression checks.");
