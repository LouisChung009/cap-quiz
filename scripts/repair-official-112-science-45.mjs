import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const row = rows.find(item => item.id === "OFF-0655");
if (!row) throw new Error("找不到 OFF-0655");
row.question = "根據本文第一段的資訊，下列有關 Cₚ 的敘述，何者最合理？";
row.options = [
  "風力發電機葉片轉動的速率愈快，Cₚ 值會愈大",
  "風力發電機葉片轉動的速率愈快，Cₚ 值會愈小",
  "風力發電機葉片由風力獲得能量的比例愈高，Cₚ 值會愈大",
  "風力發電機葉片由風力獲得能量的比例愈高，Cₚ 值會愈小",
];
row.answer = 2;
row.explanation = "答案 C。題文將功率係數 Cₚ 定義為葉片從風中取得的功率除以通過發電機前風力原有的功率，因此它代表風能的取得比例。取得比例愈高，Cₚ 就愈大；葉片轉速並不是係數定義中的變數。";
row.solutionSteps = ["辨認題文定義中的分子與分母：葉片取得的風功率 ÷ 原有風功率。", "這個比值直接代表發電機取得風能的比例，而不是葉片轉速。", "比例增加時功率係數隨之增大，故選 C。"];
row.teacherTip = "先把物理量定義改寫成比值的意義，再判斷選項；不要把設備轉速和能量比例混為一談。";
row.answerKeyReview = { status: "已依112年官方自然科題本第45題核對並清除OCR殘字", note: "標答為 C，題幹與選項中的尾端 OCR 字元 p 已移除；符號改為 Cₚ。", evidenceSources: ["./assets/official-exams/112-science-p13.webp", "./assets/official-exams/112-science-p14.webp"] };
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired OFF-0655: removed OCR artifacts and verified answer C.");
