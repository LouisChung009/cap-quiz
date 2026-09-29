import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/science.json", import.meta.url);
const raw = (await readFile(path, "utf8")).replace(/\\n\s*$/, "");
const questions = JSON.parse(raw);

for (const question of questions) {
  if (question.id === "SCI-0001" && question.question.startsWith("把一株有綠葉的盆栽先置於暗處一夜")) {
    question.question = question.question.replace("照光數小時後以碘液檢測。", "照光數小時後，先將葉片以熱水處理，再以酒精隔水加熱去除葉綠素，沖洗後滴加碘液檢測。" );
  }
  const firstId = Number(question.id.slice(-4));
  if (firstId >= 1 && firstId <= 100) {
    question.solutionSteps = question.solutionSteps.map(step =>
      step.replace(/；水平合力為零且垂直力平衡\s*$/, "。"),
    );
  }
  if (firstId >= 901 && firstId <= 1000) {
    const itemNumber = firstId - 900;
    question.question = `觀察第 ${itemNumber} 個具有細胞核的一般真核細胞時，大部分 DNA 位於哪個構造？`;
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired 100 science explanation endings and 100 nucleus-context stems.");
