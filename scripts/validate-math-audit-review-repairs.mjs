import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const failures = [];
const item = id => rows.find(row => row.id === id);

const trapezoid = item("MAT-0534");
if (trapezoid?.knowledgePoint !== "梯形面積" || trapezoid.answer !== 3 || trapezoid.options?.[3] !== "88" || !trapezoid.explanation.includes("（7＋15）×8÷2＝88") || trapezoid.solutionSteps?.length !== 3) failures.push("MAT-0534: 梯形題須以正確公式、數值與索引作答");

const frequency = item("MAT-0500");
if (frequency?.knowledgePoint !== "次數分配表與條件加總" || !frequency.question.includes("每週運動至少 3 天的同學共有幾人") || frequency.answer !== 2 || frequency.options?.[2] !== "18" || !frequency.explanation.includes("10＋6＋2＝18 人")) failures.push("MAT-0500: 題目、條件範圍與合計答案須一致");

const mode = item("MAT-0988");
if (mode?.answer !== 1 || mode.options?.[1] !== "9" || mode.options?.[3] !== "4 和 9 都是眾數") failures.push("MAT-0988: 眾數須唯一且干擾選項須呈現可辨識迷思");

const reciprocalRoots = item("MAT-0773");
if (reciprocalRoots?.knowledgePoint !== "因式分解解二次方程與倒數和" || reciprocalRoots.answer !== 2 || reciprocalRoots.options?.[2] !== "2/15" || !reciprocalRoots.explanation.includes("(x＋5)(x−3)") || !reciprocalRoots.explanation.includes("−3/15＋5/15＝2/15")) failures.push("MAT-0773: 根須由因式分解求得，並正確計算倒數和");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Mathematics review repairs MAT-0500, MAT-0534, MAT-0773, and MAT-0988 passed.");
