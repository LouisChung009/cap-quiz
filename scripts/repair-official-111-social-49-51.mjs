import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0391", answer: 2, explanation: "文章指出咖啡文化隨不同時期的日本殖民影響、外來品牌進入及飲食習慣改變而發展，顯示飲用咖啡的習慣受到文化交流影響，答案 C。文章沒有提供咖啡與茶的貿易總額比較，也未證明咖啡豆出超或國小販售會受刑罰。", steps: ["從文章找台灣咖啡文化的歷史線索：日治時期引入飲用習慣，後續又受外來品牌及生活文化影響。", "這些內容說明咖啡消費習慣隨文化交流而變化。", "因此選 C；貿易總額、出超及刑罰效果都不是文章提供的證據。"], tip: "閱讀題只選材料能支持的結論，不要把未提供的統計或法律效果自行補入。" },
  { id: "OFF-0392", answer: 3, explanation: "文章指出南韓政府修法，禁止校園販售含咖啡因飲品，目的是降低學生過量攝取咖啡因的風險。這是透過制度變革，直接改變校園可販售的商品種類，答案 D。", steps: ["找出南韓政府採取的工具：修訂法律。", "法律規定校園禁止販售特定含咖啡因飲品，改變可出售商品清單。", "因此屬制度變革影響校內商品販售種類，答案 D。"], tip: "分辨政策工具與政策結果：修法是制度工具，禁售品項是販售種類改變。" },
  { id: "OFF-0393", answer: 2, explanation: "南韓修法限制校園販售咖啡因飲品，是以法律保護學童健康、減少接觸可能有害身心的商品。台灣禁止國小學童出入有害身心發展場所，同樣以法規保護兒少，目的最相近，答案 C。", steps: ["先抓南韓修法目的：避免學生因含咖啡因飲品而影響健康。", "比較台灣選項，國小學童不得出入有害身心發展場所，也是在法律上限制兒少接觸有害環境。", "兩者皆以法規保護兒少身心健康，答案 C；其他選項著重契約能力、職場平等或家暴救濟。"], tip: "比較政策相似性時看保護對象、政策工具和目的三者是否一致。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
for (const id of ["OFF-0391", "OFF-0392", "OFF-0393"]) {
  const row = rows.find(question => question.id === id);
  if (!row || row.source?.year !== 111) throw new Error(`Text-only identity mismatch for ${id}`);
  delete row.questionImage;
  delete row.imageAlt;
  row.questionImages = [];
  row.requiresImage = false;
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 49–51.");
