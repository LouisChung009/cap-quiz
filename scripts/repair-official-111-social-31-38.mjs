import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0373", answer: 3, explanation: "圖(十六)的第Ⅱ階段約在 17 世紀中後期至 1683 年前後，對外貿易量下降。此時鄭氏勢力據守臺灣並與清廷對抗，清廷曾採海禁、遷界等措施限制沿海貿易，最能解釋此階段變化，答案 D。", steps: ["先從時間軸讀出第Ⅱ階段約落在明清易代至鄭氏政權時期。", "鄭氏據臺與清廷對抗，清廷限制沿海往來，會影響中國東南沿海貿易。", "因此第Ⅱ階段變化與鄭氏勢力和清廷對抗有關，答案 D。"], tip: "圖表題先判斷階段年代，再用相符的政治事件解釋貿易變化。" },
  { id: "OFF-0374", answer: 0, explanation: "謝先生違反法院核發的保護令，並因此被判拘役四十天；拘役是刑罰，表示其須為違法行為負刑事責任，答案 A。", steps: ["題幹明示謝先生違反保護令。", "法院判處拘役四十天，拘役屬刑事處罰。", "因此謝先生須負刑事責任，答案 A；保護令由法院核發，並非警察局核發。"], tip: "家暴保護令由法院核發；違反保護令可能涉及刑事責任。" },
  { id: "OFF-0375", answer: 0, explanation: "圖(十七)中甲是權宜問題，用來處理會議進行時突發且妨礙議事的狀況。喧鬧使阿偉聽不清發言，屬於需要立即排除的會議障礙，而不是對議事程序錯誤提出的秩序問題，因此應在甲階段提出，答案 A。", steps: ["先從題幹抓出問題：會場吵鬧，妨礙阿偉聽取正在進行的發言。", "權宜問題用於處理妨礙會議進行的突發狀況；秩序問題則針對議事程序錯誤。", "因此應提出權宜問題，流程圖標示為甲，答案 A。"], tip: "分辨權宜問題與秩序問題：前者排除突發障礙，後者糾正議事程序錯誤。" },
  { id: "OFF-0376", answer: 3, explanation: "立法院可邀請行政院院長及各部會首長到立法院進行施政報告，並接受質詢，因此議事直播最可能看到部會首長施政報告，答案 D。", steps: ["辨認畫面場域為立法院議事程序。", "行政院及部會首長可依憲政程序赴立法院報告施政並接受質詢。", "因此選 D；行政院會議在行政院召開，總統、副總統彈劾案由憲法法庭審理。"], tip: "區分立法院監督行政院與行政院自行召開院會的權責。" },
  { id: "OFF-0377", answer: 3, explanation: "調解委員會協助雙方在正式訴訟前協商；依法成立的調解具有法定效力，可減少進入法院訴訟的案件。積欠債務可向調解委員會聲請調解，符合紓解訟源，答案 D。", steps: ["題幹要求找訴訟前、公正且具法定效力的爭議處理方式。", "民事債務糾紛可由調解委員會協助雙方協商。", "依法成立的調解可避免部分案件進入訴訟，答案 D。"], tip: "調解不同於單方面不追究或私下口頭和解；需依法進行並符合法定效力要件。" },
  { id: "OFF-0378", answer: 3, explanation: "題目問的是哪間店對各人而言具有較高機會成本，而非他們應選哪間店。大華重視距離，離家較遠的乙店代表較高交通代價；小年重視價格，售價較高的甲店代表較高支出代價，因此答案 D。", steps: ["讀圖比較大華住家到兩店：乙店較遠，所以對重視就近的大華而言，乙店的機會成本較高。", "題幹已說明甲店價格高於乙店；對重視便宜的小年而言，甲店的支出代價較高。", "合併兩人的偏好與代價，為大華選乙店、小年選甲店，答案 D。"], tip: "先看每個人的偏好，再找哪個選項最違反該偏好；不要把較低機會成本誤當成題目所問。" },
  { id: "OFF-0379", answer: 2, explanation: "文章批評清末政府假借立憲、新政之名卻集權、搜刮及侵害人民權益，顯示作者對漸進改革失望，認為革命可能是救國途徑，答案 C。", steps: ["抓取文章批評：中央集權、搜刮民財、出賣路礦權及壓制反對者。", "這些內容指出改革未改善政治、民生，反而傷害人民。", "作者因改革失望而轉向革命救國主張，答案 C。"], tip: "先歸納史料立場，再區分自強技術改革、制度改革與革命主張。" },
  { id: "OFF-0380", answer: 2, explanation: "題目指出該國位於南半球、歐洲人自十八世紀移入，原住民語言大量消失；圖中硬幣也以原住民語言與殖民歷史為主題，最符合澳洲，答案 C。", steps: ["用南半球和歐洲人十八世紀移入作地理、歷史線索。", "再結合硬幣紀念原住民語言保存的內容。", "符合澳洲原住民族語言與殖民移入歷史，答案 C。"], tip: "地點題可用半球位置、殖民年代及原住民族文化線索交叉判斷。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
for (const id of ["OFF-0376", "OFF-0377", "OFF-0379"]) {
  const row = rows.find(question => question.id === id);
  if (!row || row.source?.year !== 111) throw new Error(`Text-only identity mismatch for ${id}`);
  delete row.questionImage;
  delete row.imageAlt;
  row.questionImages = [];
  row.requiresImage = false;
}
for (const figure of [
  { id: "OFF-0375", file: "111-social-q33-meeting-flow.png", alt: "第33題班會流程圖，標出權宜問題、提案討論、秩序問題與臨時動議" },
  { id: "OFF-0378", file: "111-social-q36-shopping-map.png", alt: "第36題兩戶住家與甲乙商店的道路位置圖" },
  { id: "OFF-0380", file: "111-social-q38-language-coin.png", alt: "第38題澳洲原住民語言紀念硬幣" }
]) {
  const row = rows.find(question => question.id === figure.id);
  if (!row || row.source?.year !== 111) throw new Error(`Visual identity mismatch for ${figure.id}`);
  row.questionImage = `./assets/official-exams/${figure.file}`;
  row.questionImages = [row.questionImage];
  row.imageAlt = figure.alt;
  row.requiresImage = true;
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 31–38.");
