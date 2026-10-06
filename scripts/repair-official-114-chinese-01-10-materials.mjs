import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const figures = new Map([
  [3, ["./assets/official-exams/114-chinese-q03-origin-chart.png"]],
  [5, ["./assets/official-exams/114-chinese-q05-seal-script-options.png"]],
  [7, []],
]);
for (let number = 1; number <= 10; number += 1) {
  const row = rows.find(item => item.subject === "國文" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114國文第${number}題`);
  const images = figures.get(number) ?? [];
  row.questionImage = images[0] ?? null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `114年會考國文第${number}題必要字形或示意圖` : "";
}
const question7 = rows.find(item => item.subject === "國文" && item.source?.year === 114 && item.source.questionNumber === 7);
if (!question7) throw new Error("找不到114國文第7題");
question7.question = "【甲圖】對聯張貼位置：仄聲貼右、平聲貼左。\n【乙圖】對聯聲律示意：上聯末字為仄聲，下聯末字為平聲。\n根據甲、乙二圖，下列敘述何者最恰當？";
question7.explanation = "答案 B。甲圖直接標示「仄聲貼右、平聲貼左」；乙圖呈現上聯末字仄聲、下聯末字平聲，兩圖共同說明對聯的「仄起平收」原則。A 把聲律配置誤說成區分漢語全部聲調；C 的張貼順序不是兩圖共同資訊；D 混淆張貼位置與觀看方向。";
question7.solutionSteps = ["甲圖提供左右張貼位置，乙圖提供上下聯末字的平仄線索，先分開讀取兩圖資訊。", "乙圖說明上聯末字用仄聲、下聯末字用平聲，這就是「仄起平收」。", "甲圖另說仄聲貼右、平聲貼左；題目問兩圖共同表達的原則，因此選 B，而非聲調分類或張貼順序。"];
question7.teacherTip = "對聯末字平仄（上聯仄、下聯平）與張貼左右位置是相關但不同的判斷；先看題目問聲律還是位置。";
question7.answerKeyReview = { status: "已依114年官方國文題本第2頁核對文字與原圖", note: "答案 B；題目所需兩圖共同規則已轉錄於題幹，避免前台再顯示整頁PDF截圖。", evidenceSources: ["assets/official-exams/114-chinese-p2.webp", "assets/official-exams/114-chinese-q07-couplet-diagrams.png"] };
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Chinese Q1–10 image dependencies.");
