import fs from "node:fs";

const file = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const repairs = new Map([
  ["OFF-0607", { answer: 0, explanation: "答案 A。文中描述 1869 年蘇伊士運河開通後，歐洲船隻改走地中海—紅海的新航線前往亞洲，不必繞行非洲好望角，因此大幅縮短往印度洋周邊的航程。", solutionSteps: ["原航線由歐洲繞過非洲南端好望角，路程漫長。", "蘇伊士運河連接地中海與紅海，提供通往印度洋的新捷徑。", "新航線縮短歐洲至印度洋周邊的航程，答案 A；它不是為避開北大西洋浮冰或南美航線而開闢。"], teacherTip: "航運史地圖題追蹤起點、終點和新通道；蘇伊士運河主要縮短歐亞間經印度洋的航程。" }],
  ["OFF-0608", { answer: 3, explanation: "答案 D。美國「不打小孩日」活動由美國反體罰團體發起，理念後來傳到國際社會及臺灣，臺灣也舉辦相關活動並推動兒少保護修法，呈現跨國理念流動與在地回應，屬全球化下的文化交流。", solutionSteps: ["先看活動起源：1998 年由美國反體罰團體發起。", "之後國際組織及臺灣陸續響應，活動理念跨越國界並影響臺灣公共討論與政策。", "此過程是全球化下的文化交流，答案 D；不是單純科技衝擊或傳統風俗延續。"], teacherTip: "全球化不只有商品流通，也包括理念、價值與社會運動跨國傳播。" }],
  ["OFF-0609", { answer: 1, explanation: "答案 B。標語「邀請你試著看不要打小孩至少在這一天不要打」以兒童感受引導家長反思體罰，目的是改變家長價值觀，逐步帶動社會對兒童管教方式的改變；不是訴訟或上街請願。", solutionSteps: ["讀圖中文字：標語直接呼籲家長嘗試一天不打孩子，訴求對象是家長。", "透過親身體驗與反思改變家長對體罰的觀念，再擴大為社會態度改變。", "因此最適切的是藉改變家長價值觀帶動社會變遷，答案 B。"], teacherTip: "宣傳標語題要從文案對象與行動訴求判斷目的；呼籲反思不等於訴訟、請願或法治課程。" }],
  ["OFF-0610", { answer: 2, explanation: "答案 C。文末提及《兒童及少年福利與權益保障法》及《教育基本法》兩項法律。法律的制定或修正須依立法程序通過，並經總統公布後生效；行政機關不能自行修訂法律。", solutionSteps: ["先辨認題目所指兩項規範都是法律，而非行政命令或施行細則。", "法律須由立法院完成制定／修正程序，再由總統公布，始能生效。", "因此「皆須經總統公布後才生效」正確，答案 C；行政機關無權自行修法。"], teacherTip: "公民法規題要區分法律與行政命令；法律需經立法程序及總統公布，主管機關不能自行改法。" }],
]);

for (const [id, repair] of repairs) {
  const item = questions.find(question => question.id === id);
  if (!item) throw new Error(`Missing ${id}`);
  if (item.source?.year !== 112 || item.subject !== "社會") throw new Error(`Unexpected official source for ${id}`);
  Object.assign(item, repair);
}

fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Repaired ${repairs.size} official 112 social studies explanations.`);
