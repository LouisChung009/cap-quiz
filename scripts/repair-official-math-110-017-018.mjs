import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0106": {
    question: "如圖（七），梯形 ABCD 中，AD∥BC；圓 O 通過 A、B、C 三點，且 AD 與圓 O 相切於 A 點。若 ∠B=58°，則弧 BC 的度數為何？",
    options: ["116°", "120°", "122°", "128°"],
    answer: 3,
    explanation: "答案 D「128°」。因 AD 是圓在 A 點的切線，半徑 OA⊥AD；又 AD∥BC，所以 OA⊥BC。設 E=AO∩BC；圓心到弦 BC 的垂線平分弦，因此 E 是 BC 中點。於是 AE 是 BC 的垂直平分線，AB=AC，且 AE 平分 ∠BAC。直角 △ABE 中，∠AEB=90°、∠ABE=∠B=58°，所以 ∠BAE=32°、∠BAC=64°。弧 BC 的度數是其圓周角 ∠BAC 的 2 倍，因此弧 BC=128°。",
    solutionSteps: [
      "切線與切點半徑垂直，OA⊥AD；由 AD∥BC 得 OA⊥BC。設 E=AO∩BC，圓心到弦 BC 的垂線平分弦，所以 E 是 BC 中點；AE 因而是 BC 的垂直平分線，並平分等腰 △ABC 的頂角。",
      "設 AO 與 BC 交於 E，則 ∠AEB=90°。在直角 △ABE 中，∠BAE=90°−58°=32°；由 AE 平分頂角，∠BAC=2×32°=64°。",
      "弧 BC 的度數等於所對圓周角的 2 倍，所以弧 BC=2×64°=128°，選 D。"
    ],
    requiresImage: true
  },
  "OFF-0107": {
    question: "若坐標平面上二次函數 y=a(x+b)²+c 的圖形，經過平移後可與 y=(x+3)² 的圖形完全疊合，則 a、b、c 的值可能為下列哪一組？",
    options: ["a=1，b=0，c=−2", "a=2，b=6，c=0", "a=−1，b=−3，c=0", "a=−2，b=3，c=−2"],
    answer: 0,
    explanation: "答案 A「a=1，b=0，c=−2」。圖形平移只改變頂點位置，不會改變開口方向或寬窄，因此二次項係數 a 必須相同。目標函數 y=(x+3)² 的 a=1，只有 A 符合；此時原圖 y=x²−2 的頂點為 (0,−2)，向左平移 3 單位、向上平移 2 單位即可得到 y=(x+3)²。",
    solutionSteps: [
      "將 y=a(x+b)²+c 看成頂點式；平移拋物線只移動頂點，保留二次項係數 a。",
      "目標 y=(x+3)² 的二次項係數為 1，所以原式也必須有 a=1，排除 B、C、D。",
      "A 的函數是 y=x²−2，頂點 (0,−2) 平移到 (−3,0) 後就是 y=(x+3)²，因此 A 確實可能。"
    ],
    requiresImage: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(4)) - 89;
  if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== expectedNumber) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  if (!fix.requiresImage) {
    delete question.questionImage;
    delete question.questionImages;
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired 110 math Q17–18 notation and worked explanations.");
