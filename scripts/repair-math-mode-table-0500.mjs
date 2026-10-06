import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "math.json");
const bank = JSON.parse(await readFile(path, "utf8"));
const item = bank.find((row) => row.id === "MAT-0500");
if (!item) throw new Error("MAT-0500 not found");
item.unit = "統計與機率";
item.knowledgePoint = "次數分配表與眾數";
item.difficulty = "中等";
item.question = "社團記錄 30 位同學每週運動天數：運動 1 天有 4 人、2 天有 8 人、3 天有 10 人、4 天有 6 人、5 天有 2 人。若從運動至少 3 天的同學中抽出一組代表，這組代表人數要等於資料的眾數次數，應有幾人？";
item.options = ["10", "16", "18", "20"];
item.answer = 2;
item.explanation = "眾數是出現次數最多的資料值，不是最高的資料值。運動 3 天有 10 人，是最多的一類，因此眾數次數是 10。題目接著要求抽取運動至少 3 天者，共有運動 3、4、5 天三類，合計 10＋6＋2＝18 人，所以代表組應有 18 人。正確答案為「18」。";
item.solutionSteps = [
  "比較次數表各類的人數：4、8、10、6、2；最大次數是 10，因此眾數是每週運動 3 天，眾數次數為 10 人。",
  "「至少 3 天」包含 3 天、4 天與 5 天，不能只取眾數那一類。",
  "合計 10＋6＋2＝18 人，因此答案為 18。",
];
item.teacherTip = "眾數要看次數最多的資料值；題目若再限制範圍（至少、至多），須重新加總符合條件的類別。";
await writeFile(path, `${JSON.stringify(bank, null, 2)}\n`, "utf8");
console.log("Reworked MAT-0500 into a grouped-frequency table and conditional total problem.");
