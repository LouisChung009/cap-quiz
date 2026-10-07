import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, "data", "science.json");
const questions = JSON.parse(await readFile(dataPath, "utf8"));
const affected = questions.filter(question => question.solutionSteps?.[0]?.startsWith("讀取題目條件："));

for (const question of affected) {
  const [stemEcho, reasoning, answerAndDistractor] = question.solutionSteps;
  const parts = answerAndDistractor.split(/[；。]/).map(part => part.trim()).filter(Boolean);
  if (!stemEcho.startsWith("讀取題目條件：") || !reasoning || parts.length < 2) {
    throw new Error(`${question.id}: unexpected explanation shape; refusing to modify`);
  }
  question.solutionSteps = [reasoning, `${parts[0]}。`, `${parts.slice(1).join("；")}。`];
}

const scienceClassification = questions.find(question => question.id === "SCI-0018");
if (!scienceClassification) throw new Error("SCI-0018: expected science classification question was not found");
scienceClassification.solutionSteps = [
  "判斷細胞分類時，先看是否有細胞核：有核是真核，無核的細胞可能是原核；病毒則不屬於細胞。",
  "甲、乙有細胞核，符合真核生物；丙沒有細胞核，可能是原核生物。",
  "因此選 A「甲、乙屬真核生物；丙可能是原核生物」。丁是病毒，沒有細胞構造，不能歸為細菌或具有細胞核的生物。"
];

if (affected.length !== 0 && affected.length !== 75) throw new Error(`Expected 0 or 75 affected science explanations, found ${affected.length}`);
await writeFile(dataPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log(`Rebuilt ${affected.length} science explanations without duplicated question-stem steps.`);
