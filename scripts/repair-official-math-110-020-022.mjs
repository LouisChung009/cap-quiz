import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0109": {
    question: "捷立租車行有甲、乙兩個營業據點，顧客租車後須於當日營業結束前在任一據點還車。某日結束清點時，在甲歸還的自行車比從甲出租的多 4 輛。當日從甲出租且在甲歸還的有 15 輛；從乙出租且在乙歸還的有 13 輛。比較當日從甲、乙出租的自行車總數，何者正確？",
    options: ["甲比乙多 2 輛", "甲比乙少 2 輛", "甲比乙多 6 輛", "甲比乙少 6 輛"],
    answer: 1,
    explanation: "答案 B「甲比乙少 2 輛」。設乙租甲還為 x 輛、甲租乙還為 y 輛。甲據點歸還總數為 15+x，甲出租總數為 15+y；題目說前者比後者多 4，因此 x−y=4。甲出租總數是 15+y，乙出租總數是 13+x；兩者相減為 (15+y)−(13+x)=2+(y−x)=−2，所以甲比乙少 2 輛。",
    solutionSteps: [
      "設乙租甲還 x 輛，甲租乙還 y 輛。甲據點收到 15+x 輛，從甲出租 15+y 輛。",
      "由「在甲歸還比從甲出租多 4 輛」，得 15+x=(15+y)+4，因此 x−y=4。",
      "甲出租總數減乙出租總數=(15+y)−(13+x)=2+(y−x)=2−4=−2，所以甲少 2 輛，選 B。"
    ],
    teacherTip: "先把「從哪裡出租」與「在哪裡歸還」分開設未知數，避免把流入數量誤當成出租總數。",
    requiresImage: false
  },
  "OFF-0110": {
    question: "如圖（九），四邊形 ABCD 中，∠1、∠2、∠3 分別為 ∠A、∠B、∠C 的外角。判斷下列大小關係何者正確？",
    options: ["∠1+∠3=∠ABC+∠D", "∠1+∠3<∠ABC+∠D", "∠1+∠2+∠3=360°", "∠1+∠2+∠3>360°"],
    answer: 0,
    explanation: "答案 A「∠1+∠3=∠ABC+∠D」。四邊形內角和為 360°，所以 A、B、C 三內角和為 360°−∠D。三個外角和為 540°−(∠A+∠B+∠C)=180°+∠D。又 ∠2=180°−∠ABC，因此 ∠1+∠3=(180°+∠D)−∠2=∠ABC+∠D。",
    solutionSteps: [
      "設四邊形 D 角為 ∠D。四邊形內角和 360°，故 ∠A+∠ABC+∠C=360°−∠D。",
      "外角 ∠1=180°−∠A、∠2=180°−∠ABC、∠3=180°−∠C，因此 ∠1+∠2+∠3=180°+∠D。",
      "由 ∠2=180°−∠ABC，得 ∠1+∠3=180°+∠D−∠2=∠ABC+∠D，選 A。"
    ],
    teacherTip: "外角與相鄰內角互補；先用四邊形內角和，再代換外角，避免直接套用完整多邊形外角和。",
    requiresImage: true
  },
  "OFF-0111": {
    question: "若 a、b 為正整數，且 ab=2⁵×3²×5，則下列何者不可能為 a、b 的最大公因數？",
    options: ["1", "6", "8", "12"],
    answer: 2,
    explanation: "答案 C「8」。若最大公因數含有 2³=8，則 a、b 都至少含有因數 8，乘積 ab 必含 2⁶；但題目給的 ab 中 2 的指數只有 5，矛盾。更一般地，最大公因數 g 的平方必整除 ab，因此 g 只能含 2²、3¹，不能含 5，故 g 必為 12 的因數；8 不可能。",
    solutionSteps: [
      "設 g=gcd(a,b)。因 g 同時整除 a、b，所以 g² 必整除 ab=2⁵×3²×5。",
      "可整除 ab 的平方，其質因數指數不能超過 ab 的指數；因此 g 中 2 的指數至多 2，3 的指數至多 1，且不能含 5。",
      "故 g 必為 2²×3=12 的因數。1、6、12 皆可能；8 含 2³，不是 12 的因數，故不可能，選 C。"
    ],
    teacherTip: "若 g 是兩數的最大公因數，g² 一定整除兩數乘積；比較質因數指數即可判斷。",
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
console.log("Repaired 110 math Q20–22 materials, choices, and worked explanations.");
