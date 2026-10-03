import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0385", answer: 0, explanation: "漫畫呈現大手領導多國對抗侵略者，圖中文字可辨認「大東亞戰爭」及各國共同抵抗侵略的情境，屬第二次世界大戰時期。當時成立並以集體安全為宗旨的國際組織是聯合國，答案 A。", steps: ["先從漫畫文字和背景辨認為第二次世界大戰期間的反侵略情境。", "題目問領導各國對抗侵略者的國際組織。", "符合二戰後成立、以維護國際和平安全為宗旨的是聯合國，答案 A；國際聯盟成立於一戰後，其他組織性質不同。"], tip: "注意漫畫事件年代；國際聯盟與聯合國成立於不同戰後時期。" },
  { id: "OFF-0386", answer: 1, explanation: "材料指出 1855 年外國商船已到臺灣安平外海，與裕鐸協商後由臺灣道安排洋商登岸交易；同時清廷尚未正式對外開港。因此當時尚未開港，但洋商已實際來臺貿易，答案 B。", steps: ["材料時間為 1855 年，且記載洋商船已抵安平外海。", "裕鐸與官員安排交易，顯示洋商實際在臺貿易；但正式開港時間尚未到。", "因此是尚未正式開港、洋商已來臺交易，答案 B。"], tip: "區分正式開港制度與實際上已有外商活動，兩者時間可能不同。" },
  { id: "OFF-0387", answer: 1, explanation: "材料中外商指出府城商人組成的「郊」透過地方人脈與利益網絡維護自身生意，影響洋商在安平附近起卸貨物。故禁令最可能與府城商人藉「郊」維護既有利益有關，答案 B。", steps: ["先讀材料對「郊」的說明：由府城商人組成的商業團體。", "外商指出郊商透過地方關係限制外商在安平附近卸貨。", "這反映地方商人以郊維護自身利益，答案 B；並非單純港口淤積或合作開放。"], tip: "史料題應依材料中的行動者與利益關係判斷，不要只用港口地理猜測。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
for (const id of ["OFF-0386", "OFF-0387"]) {
  const row = rows.find(question => question.id === id);
  if (!row || row.source?.year !== 111) throw new Error(`Text-only identity mismatch for ${id}`);
  delete row.questionImage;
  delete row.imageAlt;
  row.questionImages = [];
  row.requiresImage = false;
}
const row = rows.find(question => question.id === "OFF-0385");
if (!row || row.source?.year !== 111) throw new Error("OFF-0385 visual identity mismatch");
row.questionImage = "./assets/official-exams/111-social-q43-propaganda-cartoon.png";
row.questionImages = [row.questionImage];
row.imageAlt = "第43題二戰時期反侵略政治宣傳漫畫";
row.requiresImage = true;
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 43–45.");
