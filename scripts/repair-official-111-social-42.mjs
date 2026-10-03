import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const row = rows.find(question => question.id === "OFF-0384");
if (!row || row.answer !== 3 || row.source?.year !== 111 || row.source?.questionNumber !== 42) throw new Error("OFF-0384 identity or answer mismatch");
row.explanation = "圖(二十二)中甲對乙、丙皆有出口，且甲的進出口數量在同一期間都大幅增加。甲貨幣相對乙貶值，使甲乙雙邊商品價格競爭力提高；但甲貨幣相對丙升值，表示丙貨幣相對甲貶值，丙對甲的商品也較有價格競爭力，因此兩方向數量可同時增加，答案 D。";
row.solutionSteps = [
  "先從箭頭辨認甲與乙、丙都有商品出口往來，且題目指出甲的進、出口量都增加。",
  "甲相對乙貶值可使甲商品對乙較便宜；甲相對丙升值則意味丙貨幣相對甲貶值，丙商品對甲較便宜。",
  "雙邊價格競爭力分別提升，較能解釋甲進出口同時增加，答案 D。"
];
row.teacherTip = "匯率要分別看雙邊貨幣關係；進口量和出口量同增時，可能是對不同貿易夥伴呈現不同升貶值。";
row.questionImage = "./assets/official-exams/111-social-q42-trade-diagram.png";
row.questionImages = [row.questionImage];
row.imageAlt = "第42題甲乙丙三國商品出口方向圖";
row.requiresImage = true;
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanation for 111 social question 42.");
