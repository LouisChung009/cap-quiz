import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0381", answer: 2, explanation: "題目要支持「尚未達到性別平等」。圖(C)顯示家暴受害者中女性人數比例遠高於男性，呈現性別受到暴力侵害的差異，最能直接支持仍有性別不平等，答案 C。", steps: ["先確認要找的是支持性別不平等的證據。", "比較四圖中男女比例，圖(C)家暴受害者女性明顯多於男性。", "此差異直接反映性別暴力風險不均，最支持論點，答案 C。"], tip: "統計圖作為論據要選與主張直接相關、差距清楚的資料。" },
  { id: "OFF-0382", answer: 3, explanation: "圖(二十)指出非洲區域內貿易占比低，貿易對象集中於歐盟、中國及美國等洲外國家。簽署非洲自由貿易協定、降低非洲國家間關稅，可促進區域內交易，改善此現象，答案 D。", steps: ["從材料讀出兩個問題：非洲內部貿易比例低，且貿易集中於洲外。", "降低非洲國家彼此交易的關稅，可減少區域內貿易障礙。", "非洲自由貿易協定最直接回應問題，答案 D；增加洲外運輸未必提高非洲內部貿易。"], tip: "政策需針對圖表指出的問題；區域內貿易偏低，優先看區域整合措施。" },
  { id: "OFF-0383", answer: 1, explanation: "圖例顯示英國與美國同屬對日本作戰的敵對國。美國在 1941 年 12 月珍珠港事件後正式對日參戰，與日本和英國交戰方的共同關係，正是判定地圖為太平洋戰爭爆發後的重要依據，答案 B。", steps: ["先讀圖例，確認英國與美國被標示為相同的對日敵對關係。", "1941 年底太平洋戰爭爆發後，美國加入對日作戰，與英國同為日本的敵國。", "因此英國和美國使用相同圖例是關鍵判斷依據，答案 B。"], tip: "歷史地圖要把圖例與題目限定年代的事件相互核對。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
for (const figure of [
  { id: "OFF-0383", file: "111-social-q41-world-map.png", alt: "第41題二戰期間日本所繪世界地圖及對日關係圖例" },
  { id: "OFF-0381", file: "111-social-q39-gender-charts.png", alt: "第39題甲乙丙丁四組男女統計長條圖選項" },
  { id: "OFF-0382", file: "111-social-q40-africa-trade-article.png", alt: "第40題非洲花卉供需與區域貿易報導資料" }
]) {
  const row = rows.find(question => question.id === figure.id);
  if (!row || row.source?.year !== 111) throw new Error(`Visual identity mismatch for ${figure.id}`);
  row.questionImage = `./assets/official-exams/${figure.file}`;
  row.questionImages = [row.questionImage];
  row.imageAlt = figure.alt;
  row.requiresImage = true;
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 39–41.");
