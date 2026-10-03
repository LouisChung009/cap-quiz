import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "science.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const row = rows.find(item => item.id === "SCI-0850");
if (!row) throw new Error("Missing SCI-0850");
Object.assign(row, {
  gradeSemester: "八年級上",
  unit: "生物",
  knowledgePoint: "花的構造與有性生殖",
  difficulty: "中等",
  question: "花粉管進入胚珠後，精細胞與卵細胞結合形成受精卵。這個過程稱為什麼？",
  options: ["授粉", "受精", "萌發", "蒸散"],
  answer: 1,
  explanation: "精細胞與卵細胞結合形成受精卵，稱為受精，答案 B。授粉是花粉由花藥移到柱頭，發生在受精之前；萌發是種子或孢子開始生長，蒸散則是水分由植物體散失。",
  solutionSteps: [
    "先找出題目描述的關鍵事件：精細胞與卵細胞結合。",
    "配子結合形成受精卵，這個過程稱為受精。",
    "因此選 B；花粉由花藥移到柱頭才叫授粉，兩者是先後不同的階段。"
  ],
  teacherTip: "記住順序：花粉先到柱頭完成授粉，之後精細胞與卵細胞結合才是受精。"
});
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Replaced the duplicate SCI-0850 stem with a distinct fertilization question.");
