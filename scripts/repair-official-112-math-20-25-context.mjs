import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const patches = new Map([
  ["OFF-0550", { image: "./assets/official-exams/112-math-q19-figure.png", imageAlt: "112年數學第19題摺紙前後的圓形與弦位置圖" }],
  ["OFF-0551", {
    question: "如圖，△ABC 中，D 點在 BC 上，且 BD 的中垂線與 AB 相交於 E 點，CD 的中垂線與 AC 相交於 F 點。已知 △ABC 的三個內角皆不相等，根據圖中標示的角，判斷下列敘述何者正確？",
    image: "./assets/official-exams/112-math-q20-figure.png",
    imageAlt: "112年數學第20題三角形及角度標示圖"
  }],
  ["OFF-0552", {
    explanation: "答案是 D（72步）。阿良交會後走70步到西橋頭，正好是小維交會前走84步的同一段距離，因此阿良每步是小維步距的84/70＝6/5。交會點到東橋頭是阿良走60步的距離，換成小維步數為60×6/5＝72。",
    solutionSteps: ["阿良從交會點走70步到西橋頭；這段距離等於小維從西橋頭走84步到交會點的距離。", "設小維一步長為1，則阿良一步長＝84÷70＝6/5。", "交會點到東橋頭為阿良60步，等於小維步數60×(6/5)＝72步，答案D。"],
    teacherTip: "兩人步長不同時，先用同一段實際距離求步長比，再把步數換算；不要直接比較84步與60步。",
    removeImage: true
  }],
  ["OFF-0553", { image: "./assets/official-exams/112-math-q22-figure.png", imageAlt: "112年數學第22題正方形與三角形相交圖" }],
  ["OFF-0554", { image: "./assets/official-exams/112-math-q23-figure.png", imageAlt: "112年數學第23題矩形內對角線與移動點P圖" }],
  ["OFF-0555", {
    question: "某機構於2020年繪製法國、義大利、美國、韓國65歲以上人口占總人口比率折線圖，2020年後為推估值。人口老化定義為：65歲以上占比達7%為高齡化社會、達14%為高齡社會、達20%為超高齡社會。依圖比較，各國從進入高齡社會（14%）到進入超高齡社會（20%），哪一國所花時間最短？",
    imageAlt: "112年數學第24題四國65歲以上人口比例折線圖；2020年後為推估值",
    requiresContext: true
  }],
  ["OFF-0556", {
    question: "人口老化定義：65歲以上人口占總人口達14%為「高齡社會」，達20%為「超高齡社會」。已知我國2019年進入高齡社會，預測2025年進入超高齡社會。假設我國2019年與2025年總人口皆為2300萬人，且2019年65歲以上人口占比恰為高齡社會最低標準，依上述預測，我國65歲以上人口數2025年至少比2019年增加多少萬人？",
    removeImage: true
  }]
]);

for (const [id, patch] of patches) {
  const row = rows.find((item) => item.id === id);
  if (!row) throw new Error(`Missing question ${id}`);
  if (patch.question) row.question = patch.question;
  if (patch.explanation) row.explanation = patch.explanation;
  if (patch.solutionSteps) row.solutionSteps = patch.solutionSteps;
  if (patch.teacherTip) row.teacherTip = patch.teacherTip;
  if (patch.imageAlt) row.imageAlt = patch.imageAlt;
  if (patch.image) {
    row.questionImage = patch.image;
    row.imageAlt = patch.imageAlt;
    row.questionImages = [patch.image];
    row.requiresImage = true;
  }
  if (patch.requiresContext !== undefined) row.requiresContext = patch.requiresContext;
  if (patch.removeImage) {
    row.questionImage = "";
    row.imageAlt = "";
    row.questionImages = [];
    row.requiresImage = false;
    row.requiresContext = false;
  }
}

const question24 = rows.find((item) => item.id === "OFF-0555");
const chartImage = "./assets/official-exams/112-math-q24-chart.png";
question24.questionImage = chartImage;
question24.imageAlt = "112年數學第24題四國65歲以上人口比例折線圖";
question24.questionImages = [chartImage];
question24.requiresImage = true;

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Updated ${patches.size} 112 math questions with complete question context.`);
