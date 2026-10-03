import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = {
  "OFF-0651": ["112-science-q41-separation-flow.png"],
  "OFF-0652": ["112-science-q42-parallel-circuits.png"],
  "OFF-0654": ["112-science-q44-carbon-chart.png"],
  "OFF-0656": ["112-science-q46-wind-power-curve.png"],
  "OFF-0660": ["112-science-q50-liquefaction-profiles.png"]
};

for (let questionNumber = 41; questionNumber <= 50; questionNumber += 1) {
  const id = `OFF-${String(610 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 112 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  const images = (figures[id] || []).map(file => `./assets/official-exams/${file}`);
  row.questionImage = images[0] || null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `112年會考自然第${questionNumber}題必要圖表` : "";
}

for (const id of ["OFF-0651", "OFF-0653", "OFF-0654", "OFF-0655", "OFF-0657", "OFF-0658", "OFF-0659", "OFF-0660"]) {
  const row = rows.find(item => item.id === id);
  row.question = row.question.split("\n\n")[0];
}

const q41 = rows.find(item => item.id === "OFF-0651");
q41.question += "\n\n表(六)：甲、乙可溶於水，沸點分別為 1465°C、238°C；丙不溶於水，沸點 340°C。";

const q43 = rows.find(item => item.id === "OFF-0653");
q43.question += "\n\n營養比較（每 200 mL；X 為燕麥奶、Y 為牛奶）：蛋白質 1.3/3 g、脂肪 2.6/3.0 g、糖 8.1/4.5 g、膳食纖維 2/0 g、鈣 120/100 mg。";

const q44 = rows.find(item => item.id === "OFF-0654");
q44.question = q44.question.replace("根據本文，", "根據下列碳排放資料，");
q44.question += "\n\n資料比較牛奶、米漿、豆漿、燕麥奶及杏仁奶每 200 mL 的碳排放；圖中橫軸為公斤二氧化碳當量，縱列依序為上述五種飲品。";

const q45 = rows.find(item => item.id === "OFF-0655");
q45.question = q45.question.replace("根據本文第一段的資訊", "依功率係數的定義");
q45.question += "\n\n功率係數 Cₚ 定義為風力發電機葉片從風力取得的功率，除以通過發電機前風力原有的功率。";

const q47 = rows.find(item => item.id === "OFF-0657");
q47.question = q47.question.replace("根據本文", "根據下列實驗資料");
q47.question += "\n\n實驗資料：同品種小白菜以相同方式種植並採收，再分成五組處理。甲不洗滌 44.74%；乙清水浸泡 34.21%；丙清水加食鹽水浸泡 42.11%；丁清水加蔬果洗潔劑浸泡 18.42%；戊清水直接沖洗 2.52%。數值為農藥抑制率，越高代表農藥殘留越多。";
q47.options = [
  "比較乙、丙的結果，可知觀點①不恰當",
  "比較乙、丁的結果，可知觀點①不恰當",
  "比較甲、戊的結果，可知觀點②不恰當",
  "比較乙、戊的結果，可知觀點②不恰當"
];

const q48 = rows.find(item => item.id === "OFF-0658");
q48.question = q48.question.replace("根據本文", "根據下列實驗資料");
q48.question += "\n\n實驗以同品種、相同方式種植的小白菜比較洗滌方法，再分別採用不洗、清水浸泡、清水加食鹽水浸泡、清水加蔬果洗潔劑浸泡或清水直接沖洗。結果以農藥抑制率記錄，抑制率越高代表殘留越多；為公平比較，前處理應使各組的起始條件可比。";

const liquefactionContext = "\n\n土壤液化是地震時可能伴隨的災害：飽和砂土受強烈搖晃時，砂粒與水重新排列，地表建物可能下陷或傾斜。模型綜合地層組成、地下水位及模擬地震參數，估計低、中、高液化潛勢；潛勢越高，地震時發生液化的可能性越大。";
const q49 = rows.find(item => item.id === "OFF-0659");
q49.question = q49.question.replace("根據本文", "依據下列土壤液化模型說明");
const q50 = rows.find(item => item.id === "OFF-0660");
q50.question = q50.question.replace("根據本文", "依據下列土壤液化模型說明");
for (const id of ["OFF-0659", "OFF-0660"]) rows.find(item => item.id === id).question += liquefactionContext;

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 112 Science questions 41–50 shared contexts and figures.");
