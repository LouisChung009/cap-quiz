import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const batch = rows.filter(row => row.source?.year === 110 && row.subject === "自然" && row.source.questionNumber >= 26 && row.source.questionNumber <= 54);
if (batch.length !== 29) throw new Error(`Expected 29 rows, found ${batch.length}`);

const figures = {
  "OFF-0211": ["110-science-q33-electrolysis.png", "三組電解裝置的紅黑導線、碳棒與銅棒標示", false],
  "OFF-0214": ["110-science-q36-foodweb.png", "甲至庚生物的食物網與能量箭頭", false],
  "OFF-0215": ["110-science-q37-pressure.png", "兩組玻璃管、水槽與 P、Q、R、S 液面位置", false],
  "OFF-0216": ["110-science-q38-weather-map.png", "臺灣附近鋒面天氣圖與甲乙區域", false],
  "OFF-0220": ["110-science-q42-enzyme-graphs.png", "酵素在口腔、胃、小腸的四個活性長條圖選項", true],
  "OFF-0221": ["110-science-q43-speed-graphs.png", "鉛直運動的四個速度時間圖選項", true],
  "OFF-0230": ["110-science-q52-evolution-tree.png", "恐龍與現存鳥類的演化樹及時間軸", false],
  "OFF-0231": ["110-science-q53-strata-options.png", "甲類、暴龍、劍龍化石的四個地層剖面選項", true]
};

for (const row of batch) {
  const figure = figures[row.id];
  row.questionImage = figure ? `./assets/official-exams/${figure[0]}` : "";
  row.questionImages = figure ? [row.questionImage] : [];
  row.requiresImage = Boolean(figure);
  row.requiresContext = false;
  row.imageAlt = figure?.[1] ?? "";
  if (figure) row.optionsInImage = figure[2];
  else row.optionsInImage = false;
}

const byId = Object.fromEntries(batch.map(row => [row.id, row]));
byId["OFF-0217"].question = "小球在水平面作等速率圓周運動，俯視為逆時針，每秒 2 圈。t=0 秒時小球位於手的正東方；t=3 秒時，瞬時速度方向為何？";
for (const id of Object.keys(figures)) if (!byId[id]) throw new Error(`Missing required figure item ${id}`);
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Normalized image/context metadata for 110 Natural Science Q26–54 (${Object.keys(figures).length} focused figures).`);
