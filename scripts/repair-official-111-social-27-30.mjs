import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0369", answer: 3, explanation: "圖(十四)的甲港位於俄羅斯遠東的日本海沿岸，與中國吉林省合作可使吉林貨物不必繞經大連。其港口亦有助中國東北貨物經俄羅斯遠東航線連接北極海方向，答案 D。", steps: ["先從圖定位甲港在俄羅斯遠東海岸，鄰近中國東北。", "港口可讓吉林貨物直接出海，避免繞行大連；向北連接俄羅斯沿岸航線可通往北極海方向。", "因此另一項優勢是提供通往北極海的航運捷徑，答案 D；大西洋與鴨綠江流域均不符地理位置。"], tip: "港口題要沿地圖檢查海岸、鄰國及可連接海域，不可只看合作國名。" },
  { id: "OFF-0370", answer: 3, explanation: "圖(十五)以深灰、黑色區域各代表全球約 5% 人口，淺灰區域要找人口總量相近的範圍。丁位於南亞人口稠密地帶，面積較小但人口集中，與題目要求的約 5% 人口量相近，答案 D。", steps: ["先讀圖例：深灰與黑色各代表約 5% 的全球人口。", "在淺灰區域比較候選範圍，人口密集的南亞可在較小區域聚集大量人口。", "圖中丁位於南亞人口密集區，最適合標示相近人口量，答案 D。"], tip: "人口數量不能只按面積比較；人口密度高的區域面積小也可能容納大量人口。" },
  { id: "OFF-0371", answer: 3, explanation: "臺北最暖月為 7 月，1981–2010 年 7 月平均最高氣溫是 34.3°C。依熱浪定義須高於此值 5°C，因此門檻為 34.3＋5＝39.3°C，且需連續 5 日達標，答案 D。", steps: ["從表(五)找最暖月的平均最高氣溫：7 月為 34.3°C。", "依定義加 5°C：34.3＋5＝39.3°C。", "連續 5 日每日最高氣溫皆高於 39.3°C 才符合，答案 D。"], tip: "注意題目用語是「高於」而非等於，並同時檢查連續日數。" },
  { id: "OFF-0372", answer: 1, explanation: "報導提到慶祝中華民國成立、國民黨黨旗與國旗並列，且有抵制日貨、勿忘國恥等口號，反映南京國民政府統治天津時期。最符合 1928–1937 年十年建設時期，答案 B。", steps: ["用政治象徵定位：慶祝中華民國成立且國民黨黨旗飄揚。", "再用抵制日貨、勿忘國恥等口號確認是日本侵華加深前後的民國時期。", "符合南京國民政府 1928–1937 年十年建設期間，答案 B；清末尚未成立中華民國，後兩期也不符國民黨旗幟情境。"], tip: "年代判讀把政治制度、旗幟、口號與事件背景交叉比對。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 27–30.");
