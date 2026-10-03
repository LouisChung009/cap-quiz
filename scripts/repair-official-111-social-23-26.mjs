import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0365", answer: 3, explanation: "甲國要求記者通過領袖思想考試才核發記者證，直接把記者資格與政治思想效忠綁定；圖表另顯示核發數量劇烈變動，新聞自由排名長期接近全球倒數。這反映政府藉思想管控影響媒體及閱聽人取得的新聞，答案 D。", steps: ["讀圖：記者證核發數量在 2015–2019 年很低，2020 年大幅上升。", "讀表：新聞自由排名仍處全球倒數，排名改善有限。", "結合思想考試與效忠要求，可判斷政府藉管控記者思想影響新聞內容，答案 D。"], tip: "排名數字越接近倒數代表自由程度越低；要同時閱讀制度要求和趨勢資料。" },
  { id: "OFF-0366", answer: 1, explanation: "表(四)顯示第13屆具投票資格但不具參選資格；第14屆至第15屆變成兩種資格皆不具備。監護宣告會限制公民行使投票與參選等選舉權，因此最可能是遭法院監護宣告，答案 B。", steps: ["比較第14屆和第15屆：投票資格由具備變為不具備，參選資格原本就不具備。", "搬到其他縣市不會因此失去總統選舉投票權；政黨除名也不會使一般選舉權消失。", "監護宣告可使投票與參選資格均受限制，答案 B。"], tip: "讀資格表時逐欄比較變化，並區分一般選舉權與政黨提名資格。" },
  { id: "OFF-0367", answer: 2, explanation: "大法官主要職權包括憲法解釋及審查法律、命令是否違憲。死刑是否違反基本人權屬憲法與基本權議題，最適合詢問大法官被提名人，答案 C。", steps: ["先辨認職位：題目問大法官被提名人。", "大法官審理憲法及基本權爭議。", "死刑是否違反基本人權屬憲法審查問題，答案 C；預算監督、選才制度及官員彈劾效率各有其他機關職掌。"], tip: "把提問主題對應機關職權：憲法與基本權由憲法法庭處理。" },
  { id: "OFF-0368", answer: 1, explanation: "圖(十三)的鐵路由法國跨越瑞士阿爾卑斯山區至義大利，沿途由低地進入高山再下降至另一側。剖面圖應呈現明顯上升至高點後下降，與選項 B 相符，答案 B。", steps: ["從路線圖辨認行經法國、瑞士與義大利，路線跨越阿爾卑斯山脈。", "鐵路海拔會由低地上升進入山區，再下降至另一側低地。", "剖面呈上升、達高點後下降的選項為 B，答案 B。"], tip: "把平面路線轉成地形剖面時，依序追蹤起點、山脈高點與終點。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
const visuals = [
  { id: "OFF-0368", file: "111-social-q26-alpine-profile.png", alt: "第26題阿爾卑斯鐵路路線圖與四種海拔剖面選項" },
  { id: "OFF-0369", file: "111-social-q27-port-map.png", alt: "第27題中國東北、俄羅斯遠東與甲港位置圖" },
  { id: "OFF-0370", file: "111-social-q28-population-map.png", alt: "第28題標示甲乙丙丁的世界人口分布圖" },
  { id: "OFF-0373", file: "111-social-q31-trade-stages.png", alt: "第31題日本琉球、馬尼拉與南洋的中國貿易圓圈圖" }
];
for (const id of ["OFF-0363", "OFF-0364", "OFF-0365", "OFF-0366", "OFF-0367", "OFF-0371", "OFF-0372", "OFF-0374"]) {
  const row = rows.find(question => question.id === id);
  if (!row || row.source?.year !== 111) throw new Error(`Text-only identity mismatch for ${id}`);
  delete row.questionImage;
  delete row.imageAlt;
  row.questionImages = [];
  row.requiresImage = false;
}
for (const figure of visuals) {
  const row = rows.find(question => question.id === figure.id);
  if (!row || row.source?.year !== 111) throw new Error(`Visual identity mismatch for ${figure.id}`);
  row.questionImage = `./assets/official-exams/${figure.file}`;
  row.questionImages = [row.questionImage];
  row.imageAlt = figure.alt;
  row.requiresImage = true;
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 23–26.");
