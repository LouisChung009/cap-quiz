import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const image = n => `./assets/official-exams/114-social-p${n}.webp`;
const review = (n, p, note) => ({ status: `已依114年官方社會科第${n}題核對`, note, evidenceSources: [image(p)] });
const plain = { requiresImage: false, requiresContext: false, questionImage: "", questionImages: [] };
const fix = (number, value) => {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  Object.assign(row, value, { relatedWords: ["依題幹／史料判讀", "辨析歷史脈絡"], answerKeyReview: review(number, number <= 23 ? 6 : 7, value.explanation) });
};
const stepwise = (answer, option, explanation, steps, teacherTip) => ({
  answer, explanation: `答案 ${String.fromCharCode(65 + answer)}「${option}」。${explanation}`,
  solutionSteps: steps, teacherTip,
});

fix(21, {
  ...plain,
  ...stepwise(0, "郡縣制度", "郡縣制度以中央任命官員管理地方，取代世襲諸侯，發展中央集權；秦統一後全面推行，後世沿用。",
    ["抓住線索：地方官由統治者任命，且不是世襲。", "任命官員治理郡、縣可讓中央直接控制地方；秦統一後全面推行。", "所以是 A 郡縣制度；封建制度以世襲諸侯分封，科舉是選官考試，九品官人法是另一種選官制度。"],
    "郡縣制與封建制常考對比：前者中央任命、後者地方世襲；不要把選官考試制度混為一談。"),
});
fix(22, {
  question: "圖(十)是某報紙報導的部分內容，請依報導圖文判斷標題中的「？」最適合填入何者？",
  options: ["辛亥革命", "北伐統一", "八年抗戰", "抗美援朝"], answer: 2,
  requiresImage: true, requiresContext: false, questionImage: image(6), questionImages: [image(6)],
  ...stepwise(2, "八年抗戰", "報紙文字談到日本軍隊戰敗、臺灣光復相關的戰後局勢，對應八年抗戰結束，不是抗美援朝。",
    ["先讀圖中文字所指的日本戰敗、戰事結束與臺灣光復脈絡。", "日本於第二次世界大戰戰敗，結束自1937年起的對日抗戰。", "因此標題應為八年抗戰，選 C；辛亥革命、北伐和抗美援朝分屬不同年代與事件。"],
    "史料題先從報紙中的人名、事件和語句定位年代，再與選項的歷史事件比對。"),
});
fix(23, {
  question: "1989年8月，奧地利與匈牙利邊境短暫開放，數百人趁機逃離共產集團、計畫經濟控制的家鄉，前往「自由的歐洲」。這些民眾最可能來自圖(十一)中的甲、乙、丙、丁何地？",
  answer: 0, requiresImage: true, requiresContext: false, questionImage: image(6), questionImages: [image(6)],
  ...stepwise(0, "甲", "逃離者最可能來自東德。1989年東德人民經匈牙利、奧地利逃往西歐，圖中甲位於德國。",
    ["題幹描述逃離共產集團且實施計畫經濟的國家，並在奧匈邊境開放時出逃。", "冷戰時期的東德屬共產集團；1989年東德人利用匈牙利邊境開放西逃。", "對照圖中德國位置，標記為甲，故選 A；乙在南歐、丙在西歐、丁在北歐。"],
    "冷戰地圖題把制度線索（共產集團）與路線線索（匈牙利、奧地利）一起定位。"),
});
fix(24, {
  ...plain,
  question: "某國中學生自治組織選舉前調查各年級願意採用不同投票方式的比例：七年級實體48%、網路93%；八年級實體49%、網路95%；九年級實體42%、網路90%。實體投票是設置投票箱，以紙本選票圈選。何者最適當？",
  options: ["實體投票比網路投票更能形成民意", "使用科技可能有洩漏個人資料的風險", "實體投票比網路投票更符合無記名原則", "使用科技能提升學生參與公共事務的程度"], answer: 3,
  ...stepwise(3, "使用科技能提升學生參與公共事務的程度", "三個年級願意網路投票的比例都遠高於實體投票，顯示便利科技可能提高參與意願。",
    ["逐年比較網路與實體投票：七年級93%對48%，八年級95%對49%，九年級90%對42%。", "每個年級對網路投票的意願都高出許多。", "資料支持網路科技有助提升參與意願，選 D；此調查不能證明資安風險或哪一種更符合無記名原則。"],
    "從調查資料只能推論意願比例的差異，不能把未調查的資安或制度公平性當成結論。"),
});
fix(25, {
  ...plain,
  explanation: "答案 D「平衡勞資雙方之間權力不對等的關係」。出勤紀錄先推定為雇主同意的加班，並由雇主負責提出反證，可降低勞工舉證困難。",
  solutionSteps: ["題幹中雇主掌握出勤及薪資資料，勞工若要證明加班容易遇到資訊與權力差距。", "法律以出勤紀錄作為加班推定，並把反證責任交由較能取得資料的雇主。", "這種程序設計是在平衡勞資權力及舉證能力，選 D；不是性別歧視、最低生活保障或童工保護。"],
  teacherTip: "法律程序保障常針對雙方實際能力不對等；舉證責任配置是公平程序的重要工具。",
});

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q21–25 against source pages.");
