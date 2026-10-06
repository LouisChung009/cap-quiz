import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const poem = `【閱讀材料】〈盆栽〉
做為盆栽，他已覺頗為滿意
在方圓有限的盆裡，他擁有
自己的領域，擁有陽光、水
以及空氣，且較諸同儕幸運
為無慮於戶外的風吹雨傷害`;

const fixes = {
  "OFF-0003": {
    options: ["雪地上的雪人", "欄杆後的盆栽", "沙漠中的綠色仙人掌", "花色相同的馬賽克磁磚"],
    explanation: "使用說明列出三種不易對焦的情況：主體和背景顏色相近、對焦點同時覆蓋遠近主體、畫面有重複圖案。C 的綠色仙人掌和沙漠背景色差明顯，且沒有欄杆造成的前後景重疊或規律圖案，因此最容易成功對焦。A 雪人和雪地近色；B 欄杆與盆栽形成前後景；D 馬賽克磁磚有重複圖案。答案是 C「沙漠中的綠色仙人掌」。",
    solutionSteps: ["把說明書中的失敗條件整理成近色、遠近重疊、重複圖案三項。", "逐一檢查選項：A 符合近色，B 有前後景，D 有重複圖案。", "C 的仙人掌與沙漠有明顯色差，且避開另外兩種干擾，因此選 C。"],
    requiresImage: true,
    requiresContext: false,
    questionImage: "./assets/official-exams/110-chinese-q03-focus-scenes.svg",
    imageAlt: "原卷四幅景物依序為雪地上的雪人、欄杆後的盆栽、沙漠中的綠色仙人掌、花色相同的馬賽克磁磚。",
    questionImages: ["./assets/official-exams/110-chinese-q03-focus-scenes.svg"]
  },
  "OFF-0006": {
    question: `${poem}\n\n詩中「盆栽」對生活的態度，與下列何者最接近？`,
    explanation: "詩中的盆栽說自己已對盆栽生活感到滿意，在有限的盆裡擁有自己的領域、陽光、水和空氣，也不必承受戶外風吹雨打。這呈現安於現有環境、知足自得的態度，因此選 A「安守現實，自得其樂」。B、C 所說的追求卓越或突破藩籬，和盆栽自述的滿足相反；D 的犧牲守節也沒有詩句依據。",
    solutionSteps: ["先抓住詩中盆栽對自己處境的評價：「已覺頗為滿意」。", "「有限的盆裡」雖有界限，但盆栽列出自己擁有的領域、陽光、水、空氣，並覺得不受風吹雨打是幸運。", "這些線索共同指向安於現實、知足自得，故選 A；詩中沒有追求突破或犧牲守節的意思。"],
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0008": {
    options: ["問者蓄意為難，明知故問", "見者實未曾見麟，信口開河", "問者終不得其解，寧可自尋答案", "見者最後以具體事物為喻，輔助說明"],
    explanation: "問者指出「麟如麟也」沒有提供新資訊；見者於是改說麟有麇身、牛尾、鹿蹄、馬背，借熟悉動物的具體特徵說明麟的形貌，問者因此豁然理解，故選 D。A 的蓄意為難、B 的未曾見麟均非文中所述；C 與「豁然而解」相反。",
    requiresImage: false,
    requiresContext: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  if (!question || question.source?.year !== 110) throw new Error(`Unexpected or missing source item ${id}`);
  Object.assign(question, fix);
}

for (const id of Object.keys(fixes)) {
  const question = questions.find((item) => item.id === id);
  if (question.options.length !== 4 || new Set(question.options).size !== 4) throw new Error(`Invalid choices for ${id}`);
  if (question.answer < 0 || question.answer > 3) throw new Error(`Invalid answer index for ${id}`);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired OCR choices for OFF-0003/OFF-0008 and embedded the poem in OFF-0006.");
