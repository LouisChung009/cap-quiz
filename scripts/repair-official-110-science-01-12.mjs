import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const diagrams = new Map([
  ["OFF-0179", ["110-science-q01-table.png", "110年自然科第1題：上皿天平使用注意事項與對應原因表格"]],
  ["OFF-0181", ["110-science-q03-map.png", "110年自然科第3題：臺灣地圖標示震央、新竹與嘉義地震警報資料及震波抵達時間"]],
  ["OFF-0185", ["110-science-q07-table.png", "110年自然科第7題：甲乙丙三杯牛奶的銀幣、保存溫度、靜置時間與細菌檢測結果表"]],
  ["OFF-0186", ["110-science-q08-cartoon.png", "110年自然科第8題：兩名學生比較同頻率音叉共振的實驗示意圖，音叉頻率為360 Hz"]],
  ["OFF-0189", ["110-science-q11-figure.png", "110年自然科第11題：枝條置於量筒的蒸散實驗裝置，以及甲乙丙丁水分散失量長條圖"]],
  ["OFF-0190", ["110-science-q12-chart.png", "110年自然科第12題：乾燥空氣組成圓餅圖，甲78%、乙21%、其他1%"]]
]);
const reviewed = rows.filter(item => item.subject === "自然" && item.source?.year === 110 && item.source.questionNumber >= 1 && item.source.questionNumber <= 12);

if (reviewed.length !== 12) throw new Error(`Expected 12 reviewed questions, found ${reviewed.length}`);

for (const item of reviewed) {
  const diagram = diagrams.get(item.id);
  item.requiresImage = Boolean(diagram);
  item.requiresContext = false;
  item.optionsInImage = false;
  if (diagram) {
    item.questionImage = `./assets/official-exams/${diagram[0]}`;
    item.questionImages = [item.questionImage];
    item.imageAlt = diagram[1];
  } else {
    item.questionImage = "";
    item.questionImages = [];
    item.imageAlt = "";
  }
}

const resonance = rows.find(item => item.id === "OFF-0186");
resonance.question = "圖(二)中，妮妮認為只有振動頻率相同的音叉才會共振，小櫻則認為不同頻率的音叉也可能共振。妮妮要增加下列哪一項實驗，最能檢驗小櫻的說法？";
resonance.answerKeyReview = {
  status: "已依110年自然科官方題本第8題核對題幹與圖示",
  note: "原題幹混入重複圖號與OCR碎片；已依兩位學生對話整理成完整問題。圖中兩支音叉均為360 Hz，答案仍為B：只更換其中一支為500 Hz以測試不同頻率是否共振。",
  evidenceSources: ["./assets/official-exams/110-science-p3.webp"]
};
rows.find(item => item.id === "OFF-0190").question = "圖(五)為地球地表附近乾燥空氣的組成比例圓餅圖；一般情況下，主要成分為甲、乙兩種氣體。根據圖中比例，下列敘述何者正確？";

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Reviewed 110 Natural Science questions 1–12; retained ${diagrams.size} required figures and removed full-page images from text-only items.`);
