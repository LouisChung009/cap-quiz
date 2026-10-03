import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0388", answer: 0, explanation: "圖(二十四)中的「墘」字地名大量分布於臺灣西部平原及西南部，與閩南族群聚居區相符；「墘」也是閩南語地名常見用字，故推論屬閩南族系地名最合理，答案 A。", steps: ["先從地圖辨認地名點位主要集中在臺灣西部，尤其西南部。", "對照族群分布，該區是閩南族群聚居的重要區域。", "「墘」為閩南語地名用字，答案 A；分布不符合西班牙語音譯或主要客家區的推論。"], tip: "地名來源要將詞語語系和空間分布一起判讀，避免只憑字形推測。" },
  { id: "OFF-0389", answer: 0, explanation: "圖(二十五)的土地利用圖中，小瑜家鄉周邊以田地為主，並有河流水塘等水利條件，適合發展水稻耕作，答案 A。", steps: ["先辨認圖例：田地與茶園、樟林、鹽地等土地利用類別不同。", "小瑜家鄉所在區域主要呈現田地，且附近有河流及水塘供水。", "因此日治時期最可能以水稻耕作為主，答案 A。"], tip: "歷史地圖題先對照圖例及當時土地利用，不要用今日產業直接套回過去。" },
  { id: "OFF-0390", answer: 1, explanation: "圖(二十五)顯示小瑜家鄉附近以田地為主；圖(二十六)的 1921 年河流與水塘位置，對照現今地圖後，家鄉位於水塘邊而非海岸、岩壁或黑礁旁。依題幹地名命名原則，「潭」指水塘，「墘」指旁邊，因此最可能是潭墘，答案 B。", steps: ["先由土地利用圖和河流水塘圖層定位小瑜家鄉：附近有水塘，並非海岸地形。", "題幹說地名依當時地理環境命名；「墘」表示旁邊，「潭」可指水塘。", "水塘旁的地名最符合潭墘，答案 B。"], tip: "把歷史河道、水塘圖層與現今地圖疊合後，再依地名語義判斷。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
for (const figure of [
  { id: "OFF-0388", files: ["111-social-q46-diqian-taiwan-map.png"], alt: "第46題臺灣各地墘字地名分布圖" },
  { id: "OFF-0389", files: ["111-social-q47-japanese-landuse-map.png"], alt: "第47題1921年土地利用與地形圖，標示樟林、旱地、竹林、田地與茶園" },
  { id: "OFF-0390", files: ["111-social-q47-japanese-landuse-map.png", "111-social-q48-water-map.png"], alt: "第48題1921年土地利用圖及河流、水塘套疊圖" }
]) {
  const row = rows.find(question => question.id === figure.id);
  if (!row || row.source?.year !== 111) throw new Error(`Visual identity mismatch for ${figure.id}`);
  row.questionImage = `./assets/official-exams/${figure.files[0]}`;
  row.questionImages = figure.files.map(file => `./assets/official-exams/${file}`);
  row.imageAlt = figure.alt;
  row.requiresImage = true;
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 46–48.");
