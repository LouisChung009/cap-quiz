import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find((item) => item.id === "OFF-0108");

if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== 19) {
  throw new Error("Unexpected or missing 110 math Q19 source item OFF-0108");
}

Object.assign(question, {
  question: "如圖（八），△ABC 中，D、E、F 分別在 AB、BC、AC 上。四邊形 BEFD 以 DE 為對稱軸，四邊形 CFDE 以 FE 為對稱軸。若 ∠C=40°，則 ∠DFE 為何？",
  options: ["65°", "70°", "75°", "80°"],
  answer: 3,
  explanation: "答案 D「80°」。設 ∠DFE=x。以 FE 為對稱軸，C 與 D 對稱，因此 ∠FDE=∠C=40°，且 ∠CFE=∠DFE=x。以 DE 為對稱軸，B 與 F 對稱，因此 ∠BDE=∠FDE=40°，且 ∠B=∠DFE=x。四邊形 BCFD 的內角依序為 x、40°、2x、80°，總和 360°，所以 3x+120°=360°，x=80°。",
  solutionSteps: [
    "令 x=∠DFE。四邊形 CFDE 以 FE 為對稱軸，因此反射會交換 C、D，固定 F、E；對稱角相等，得 ∠FDE=∠C=40°，且 ∠CFE=∠DFE=x。",
    "四邊形 BEFD 以 DE 為對稱軸，反射交換 B、F，固定 D、E；因此 ∠BDE=∠FDE=40°，且 ∠B=∠DFE=x。",
    "四邊形 BCFD 在 B、C、F、D 的內角依序為 x、40°、2x、80°。利用內角和 360°：x+40°+2x+80°=360°，解得 x=80°，選 D。"
  ],
  teacherTip: "線對稱會讓對應角相等；先把兩個對稱關係轉成角度，再使用多邊形內角和。",
  requiresImage: true,
  requiresContext: false
});

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired 110 math Q19 choices and worked symmetry-angle solution.");
