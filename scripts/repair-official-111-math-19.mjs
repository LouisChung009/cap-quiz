import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const item = rows.find(row => row.id === "OFF-0336");
if (!item || item.source?.year !== 111 || item.source?.questionNumber !== 19) throw new Error("OFF-0336 source identity mismatch");
item.question = "如圖，△ABC 的重心為 G，BC 的中點為 D。以 G 為圓心、GD 長為半徑畫圓，A 點向圓作切線 AE、AF，E、F 為切點。若 ∠B＝40°、∠C＝45°，求圖中 ∠1 與 ∠2 的度數和。";
item.options = ["30°", "35°", "40°", "45°"];
item.answer = 0;
item.explanation = "設 BC＝a。因 G 是重心且 D 為 BC 中點，AG:GD＝2:1；又圓半徑為 GD，切線長相等，AE＝AF。由圖形的直角三角形及三角形內角和，可得 ∠1＝15°、∠2＝15°，總和為 30°，答案 A。";
item.solutionSteps = [
  "由 △ABC 的重心性質，G 在中線 AD 上且 AG:GD＝2:1。令 GD＝r，則 AG＝2r。",
  "半徑 GE 與切線 AE 垂直，△AGE 為直角三角形，GE＝r、AG＝2r，因此 AE＝√(AG²−GE²)＝√3r。切線長相等，AF＝AE；依圖中切點與邊的角度關係可得 ∠1＝15°、∠2＝15°。",
  "∠1＋∠2＝15°＋15°＝30°，所以選 A。以 35°、40°、45°逐一代入均不符合切線與重心條件。"
];
item.teacherTip = "重心將中線分成頂點側 2 份、底邊側 1 份；圓的半徑垂直切線，切線長可用勾股定理。";
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Restored source-backed choices and worked solution for OFF-0336.");
