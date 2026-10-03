import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = new Map([
  ["OFF-MATH-110-Q01-MC", ["110-math-q1-figure.png", "110年數學第1題坐標平面四點位置圖"]],
  ["OFF-0093", ["110-math-q04-figure.png", "110年數學第4題矩形與三角形位置圖"]],
  ["OFF-0096", ["110-math-q07-chart.png", "110年數學第7題纜車海拔與行駛時間折線圖"]],
  ["OFF-0098", ["110-math-q09-chart.png", "110年數學第9題6至9月三國旅客人數折線圖"]],
  ["OFF-0104", ["110-math-q15-figure.png", "110年數學第15題全等三角形及共線點圖"]],
  ["OFF-0106", ["110-math-q17-figure.png", "110年數學第17題梯形、圓及切線圖"]],
  ["OFF-0108", ["110-math-q19-figure.png", "110年數學第19題對稱四邊形與角度圖"]],
  ["OFF-0110", ["110-math-q21-figure.png", "110年數學第21題四邊形外角標記圖"]],
  ["OFF-0112", ["110-math-q23-figure.png", "110年數學第23題菱形及平行線段位置圖"]],
  ["OFF-0114", ["110-math-q25-figure.png", "110年數學第25題銳角三角形及點D位置圖"]],
  ["OFF-0115", ["110-math-q26-figure.png", "110年數學第26題三角形內心與截線圖"]]
]);

const items = rows.filter((item) => item.subject === "數學" && item.source?.year === 110 && item.source.section === "選擇題");
for (const row of items) {
  const figure = figures.get(row.id);
  if (!figure) {
    row.questionImage = "";
    row.questionImages = [];
    row.imageAlt = "";
    row.requiresImage = false;
    row.requiresContext = false;
    continue;
  }
  row.questionImage = `./assets/official-exams/${figure[0]}`;
  row.questionImages = [row.questionImage];
  row.imageAlt = figure[1];
  row.requiresImage = true;
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Updated images/context for ${items.length} 110 Math multiple-choice items.`);
