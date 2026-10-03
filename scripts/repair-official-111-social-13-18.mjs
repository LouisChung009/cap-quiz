import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0355", answer: 1, explanation: "依表(二)應逐人確認出生地、出生時父母國籍及現況。具有我國國籍者須符合國籍法相關條件；題表中李大賢出生於臺中且父母為美國籍，最可能未曾具有我國國籍，答案 B。", steps: ["先按表格逐列對照出生地與父母國籍，避免把不同同窗資料串在一起。", "李大賢一列的資料為臺中出生、父母為美國籍；題目問最可能未曾具有我國國籍者。", "依表列條件選李大賢，答案 B；仍以題目提供資料作推論，不額外假設未列出的身分變更。"], tip: "表格題先沿同一列閱讀各欄，不要讓OCR或欄位換行造成跨列錯讀。" },
  { id: "OFF-0356", answer: 2, explanation: "平飼、放牧需要較多空間與管理投入，生產成本通常高於傳統格子籠；在消費者可選擇且價格較高的情況下，友善飼養蛋品市占率可能仍較低，答案 C。", steps: ["題幹指出友善飼養提供室內放養或戶外活動空間。", "空間、照護及管理需求增加，通常提高生產成本。", "成本反映在較高售價，可能限制消費者購買比例，答案 C。"], tip: "題目問市占偏低的可能原因，從供給成本和價格選項判斷，不要把福利標示誤當品質差。" },
  { id: "OFF-0357", answer: 3, explanation: "圖(八)中美國東南部標示丁，屬夏季高溫且濕潤的氣候區，臺灣的氣候特徵與此區較相近，答案 D。甲為西北較乾冷區、乙為西南乾燥區、丙為東北較冷區。", steps: ["先用圖中其他國家作氣候參照：葡萄牙位於較乾燥西南區，俄羅斯在寒冷北部，伊朗在乾燥內陸。", "臺灣夏季高溫多雨，不能對應美國西南乾燥區或北部寒冷區。", "圖中東南部濕熱區標為丁，答案 D。"], tip: "氣候類比應比較溫度與降水特徵，不只比較地理緯度。" },
  { id: "OFF-0358", answer: 2, explanation: "圖(九)顯示婆羅洲原始森林面積逐年縮減。森林減少會使依賴森林的野生動物可利用棲地同步縮小；相較之下，都市聚落及熱帶作物種植面積較可能擴大，答案 C。", steps: ["比較 1950、1985、2005 三幅圖，原始森林範圍持續縮小。", "森林是許多野生動物的棲地，森林減少會使可用棲地受壓縮。", "因此最相似的變化趨勢是野生動物棲地範圍縮小，答案 C。"], tip: "把圖上的方向性變化與選項逐一比較：森林減少，棲地通常也減少。" },
  { id: "OFF-0359", answer: 1, explanation: "題幹列出機具栽種、無人機巡視及網路平臺安排噴藥與採收，這些技術主要減少人工巡查、操作和協調需求，降低勞力成本占總成本的比例，答案 B。", steps: ["整理措施：機具栽種、無人機巡視、平臺管理作業時程。", "這些工具主要替代或提高人工工作的效率，而非直接把茶園變成休閒農場。", "最直接的成本效果是降低勞力成本占比，答案 B。"], tip: "依措施的直接作用選答案；智慧農業不必然代表品質或出口量必定提高。" },
  { id: "OFF-0360", answer: 2, options: ["甲", "乙", "丙", "丁"], explanation: "圖(十)標示四個岬角座標；丙為 38.781°N、9.500°W，位於葡萄牙西岸，屬歐亞大陸西部海岸，答案 C。", steps: ["先讀出丙的座標：北緯 38.781 度、西經 9.500 度。", "西經約 9.5 度、北緯約 39 度的位置在伊比利半島西側的葡萄牙沿岸。", "因此位於歐亞大陸西部海岸的是丙，答案 C。"], tip: "座標題先用經緯度判斷大洲與海岸方向，再核對圖中標記。" },
];
const visualRepairs = {
  "OFF-0357": { requiresImage: true, imageAlt: "美國各地與世界相似氣候區的分布圖", questionImage: "./assets/official-exams/111-social-q15-us-climate-map.png", questionImages: ["./assets/official-exams/111-social-q15-us-climate-map.png"] },
  "OFF-0358": { requiresImage: true, imageAlt: "婆羅洲 1950、1985、2005 年原始森林範圍圖", questionImage: "./assets/official-exams/111-social-q16-borneo-forest.png", questionImages: ["./assets/official-exams/111-social-q16-borneo-forest.png"] },
  "OFF-0360": { requiresImage: true, imageAlt: "四個岬角位置、照片與經緯度資料", questionImage: "./assets/official-exams/111-social-q18-capes.png", questionImages: ["./assets/official-exams/111-social-q18-capes.png"] },
};
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, ...(item.options ? { options: item.options } : {}), solutionSteps: item.steps, teacherTip: item.tip }, visualRepairs[item.id] || {});
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 13–18.");
