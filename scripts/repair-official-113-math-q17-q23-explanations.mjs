import { readFile, writeFile } from "node:fs/promises";

const path = "data/mission-questions.json";
const rows = JSON.parse(await readFile(path, "utf8"));
const q17 = rows.find(item => item.id === "OFF-0762");
const q23 = rows.find(item => item.id === "OFF-0768");
if (!q17 || !q23) throw new Error("Required 113 Math questions not found");
if (!q17.explanation.includes("正弦定理") || !q23.explanation.includes("△ECB")) throw new Error("Unexpected existing explanations; refusing to overwrite");

q17.explanation = "答案是 A。三角形內角和得 ∠A＝180°−55°−65°＝60°。三角形中大角對大邊：∠C＝65° 大於 ∠A＝60°，所以對邊 AB＞BC；∠B＝55° 小於 ∠A＝60°，所以對邊 AC＜BC。兩圓半徑都是 BC，因此 A 在圓 B 外、圓 C 內。";
q17.solutionSteps = [
  "先用三角形內角和求 ∠A＝180°−55°−65°＝60°。",
  "利用大角對大邊：∠C＝65°＞∠A＝60°，所以 AB＞BC；∠B＝55°＜∠A＝60°，所以 AC＜BC。",
  "圓 B、圓 C 的半徑都是 BC；AB＞BC 表示 A 在圓 B 外，AC＜BC 表示 A 在圓 C 內，選 A。"
];

q23.explanation = "答案是 B（1：3）。由 DE∥AB、AD∥BE，四邊形 ABED 是平行四邊形，所以 AB＝DE＝4。等腰梯形給 AB＝DC，摺疊又保長，故 DC′＝DC＝4；同時 EC′＝EC＝2。摺後的 △BC′E 與 △C′DE 依圖中的對應角相等而相似，對應邊滿足 BC′：C′E＝C′E：DE＝2：4，因此 BC′＝1。因 C′ 在 AB 上，AC′＝AB−BC′＝4−1＝3，故 BC′：AC′＝1：3。";
q23.solutionSteps = [
  "ABED 是平行四邊形，故 AB＝DE＝4；等腰梯形有 DC＝AB＝4，摺疊保長得 DC′＝4、EC′＝EC＝2。",
  "按摺後圖形的點位，△BC′E 與 △C′DE 由兩組對應角相等（等腰梯形底角相等；摺疊保角且 DE∥AB）可判定相似。對應邊為 BC′↔C′E、C′E↔DE。",
  "所以 BC′/C′E＝C′E/DE＝2/4，BC′＝1。又 C′ 在 AB 上，AC′＝4−1＝3，因此 BC′：AC′＝1：3，選 B。"
];

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Replaced out-of-curriculum 113 Math Q17 reasoning and corrected Q23 triangle labels.");
