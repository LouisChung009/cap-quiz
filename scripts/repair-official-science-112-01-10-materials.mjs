import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const batch = rows.filter(row => row.subject === "自然" && row.source?.year === 112 && row.source.questionNumber >= 1 && row.source.questionNumber <= 10);
if (batch.length !== 10) throw new Error(`Expected 10 questions, got ${batch.length}`);
const byId = Object.fromEntries(batch.map(row => [row.id, row]));
const update = (id, values) => {
  if (!byId[id]) throw new Error(`Missing ${id}`);
  Object.assign(byId[id], values);
};
const figure = (id, file, alt) => update(id, {
  questionImage: `./assets/official-exams/${file}`,
  questionImages: [`./assets/official-exams/${file}`],
  imageAlt: alt,
  requiresImage: true,
  requiresContext: false
});
const noFigure = id => update(id, {
  questionImage: "",
  questionImages: [],
  imageAlt: "",
  requiresImage: false,
  requiresContext: false
});

for (const id of ["OFF-0611", "OFF-0612", "OFF-0614", "OFF-0618", "OFF-0619", "OFF-0620"]) noFigure(id);

update("OFF-0617", {
  question: "氫氣燃燒不會產生二氧化碳，是能源轉型的目標之一。依製造方法不同，可將氫氣分為褐氫、灰氫、藍氫與綠氫；在減碳要求下，希望製得的氫氣盡量是綠氫。表中資料如下：褐氫：使用煤炭製氫，產生較多二氧化碳；灰氫：使用天然氣製氫，製程產生二氧化碳，為目前主流方法；藍氫：使用天然氣製氫，並以碳捕捉技術捕捉部分二氧化碳；綠氫：以再生能源電力製氫，製程不產生二氧化碳。根據以上資訊，何者最合理？"
});
noFigure("OFF-0617");

figure("OFF-0613", "112-science-q03-sports-drink.png", "自製運動飲料圖中 X 項補充流失鈉、鉀離子的成分");
figure("OFF-0615", "112-science-q05-tide-chart.png", "8 月 11 日至 8 月 14 日港口潮位隨日期變化的圖表");
figure("OFF-0616", "112-science-q06-heating-apparatus.png", "加熱燒杯中的水並以溫度計測溫的實驗裝置圖");

for (const row of batch) {
  if (!row.explanation || !row.solutionSteps?.length || row.options?.length !== 4) throw new Error(`Incomplete ${row.id}`);
  if (row.requiresImage && !row.questionImages?.length) throw new Error(`Missing required figure for ${row.id}`);
  if (!row.requiresImage && (row.questionImages?.length || row.questionImage)) throw new Error(`Unneeded page image remains in ${row.id}`);
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source materials and image references for 112 Natural Science Q1–10.");
