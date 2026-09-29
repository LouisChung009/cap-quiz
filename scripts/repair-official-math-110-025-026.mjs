import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0114": {
    question: "如圖（十一），銳角三角形 ABC 中，D 在 BC 上，且 ∠B=∠BAD=∠CAD。欲在 AD 上找一點 P，使 ∠APC=∠ADB。甲：作 AC 的中垂線交 AD 於 P。乙：以 C 為圓心、CD 為半徑畫弧，與 AD 交於異於 D 的點 P。下列敘述何者正確？",
    options: ["兩人皆正確", "兩人皆錯誤", "甲正確，乙錯誤", "甲錯誤，乙正確"],
    answer: 0,
    explanation: "答案 A「兩人皆正確」。令 x=∠B=∠BAD=∠CAD。△ABD 中兩角皆為 x，所以 ∠ADB=180°−2x。甲作法使 PA=PC，且 ∠PAC=x，因此 △APC 的底角 A、C 都是 x，∠APC=180°−2x=∠ADB。乙作法有 CP=CD；△ACD 中 ∠CAD=x、∠ACD=∠C=180°−3x，故 ∠ADC=2x。銳角條件給 30°<x<45°，所以沿 DA 方向與圓交於 D 後的另一點 P 距 D 為 DP=2CD cos2x；由正弦定理 AD/CD=sin3x/sinx=1+2cos2x，故 DP<AD，P 確在線段 AD 上。於是 ∠PDC=2x，等腰 △PCD 的底角 ∠DPC=2x；A、P、D 共線且 P 在兩者之間，故 ∠APC=180°−2x=∠ADB。兩作法均正確。",
    solutionSteps: [
      "設 x=∠B=∠BAD=∠CAD。於 △ABD，∠ADB=180°−x−x=180°−2x。",
      "甲：垂直平分線給 PA=PC，故 △APC 的底角相等；∠PAC=x，所以 ∠ACP=x，∠APC=180°−2x=∠ADB。",
      "乙：CP=CD。△ACD 中 ∠ADC=2x。因三角形 ABC 銳角，30°<x<45°；圓與射線 DA 的第二交點距 D 為 DP=2CD cos2x，而正弦定理給 AD/CD=sin3x/sinx=1+2cos2x，所以 DP<AD，P 在線段 AD 上。於是等腰 △PCD 的底角 ∠DPC=∠PDC=2x，∠APC=180°−2x=∠ADB。兩人皆正確，選 A。"
    ],
    teacherTip: "作圖題要把作圖保證的邊長相等轉成等腰三角形，再分清 P 在線段哪一側，判斷角是相等或互補。",
    requiresImage: true
  },
  "OFF-0115": {
    question: "如圖（十二），I 為 △ABC 的內心；一直線通過 I，並分別交 AB、AC 於 D、E。若 AD=DE=5、AE=6，則 I 到 BC 的距離為何？",
    options: ["24/11", "30/11", "2", "3"],
    answer: 0,
    explanation: "答案 A「24/11」。因 I 是內心，AI 平分 ∠DAE；由角平分線定理，DI:IE=AD:AE=5:6。又 DE=5，所以 DI=25/11。△ADE 中 AD=DE=5、AE=6，餘弦定理得 cos∠ADE=(25+25−36)/(2×5×5)=7/25，故 sin∠ADE=24/25。I 到 AB 的距離為 DI·sin∠ADE=(25/11)(24/25)=24/11。內心到三邊距離相等，因此 I 到 BC 的距離也是 24/11。",
    solutionSteps: [
      "I 在 DE 上且 AI 是 ∠DAE 的角平分線；由角平分線定理，DI/IE=AD/AE=5/6。配合 DI+IE=DE=5，得 DI=25/11。",
      "在 △ADE 中，AD=DE=5、AE=6。由餘弦定理，cos∠ADE=(5²+5²−6²)/(2·5·5)=7/25，因此 sin∠ADE=24/25。",
      "I 到 AB 的垂直距離為 DI sin∠ADE=(25/11)(24/25)=24/11。I 是內心，到 AB 與 BC 的距離相等，所以所求為 24/11，選 A。"
    ],
    teacherTip: "內心到三邊等距；可以先在含兩邊的三角形中用角平分線定理求 I 的位置，再用垂直距離求內切圓半徑。",
    requiresImage: true
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(4)) - 89;
  if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== expectedNumber) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired 110 math Q25–26 text, choices, and worked explanations.");
