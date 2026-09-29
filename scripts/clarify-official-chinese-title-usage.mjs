import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find(item => item.id === "OFF-0011");
if (!question || question.source?.year !== 110 || question.source?.questionNumber !== 11 || question.answer !== 1) throw new Error("OFF-0011 source or official key mismatch");

question.explanation = "官方參考答案為 B「「小女」的于歸之宴，請您務必賞光」。「小女」是父母對外謙稱自己的女兒，「于歸」指女子出嫁，婚宴邀請的語境吻合。教育部《親朋稱呼表》列弟弟的常用自稱為「舍弟」，故本題依官方稱謂表答案選 B；但須補充，《重編國語辭典修訂本》也收錄「家弟」作對人稱自己的弟弟，因此 C 有辭典所載用法，不能說成完全不存在。A 的「貴校」是敬稱對方學校，與「蓬蓽」自謙語搭配不當；D 的「舍姐」不合本題採用的常用稱謂形式。";
question.solutionSteps = [
  "B 的「小女」是父母對外謙稱自己的女兒；「于歸」指女子出嫁，因此「小女的于歸之宴」在邀請賓客的語境恰當。",
  "A 把敬稱對方的「貴校」與自謙主人居所的「蓬蓽」混用；D 的「舍姐」也不符合本題依循的常用稱謂表。",
  "本題官方答案為 B。教育部常用稱謂表列「舍弟」，但修訂辭典亦收「家弟」之用法；遇到 C 應理解詞典記載差異，不把它誤說成絕對不存在。",
];
question.teacherTip = "稱謂題先辨明謙稱自己或敬稱對方，再對照常用形式；若辭典另收變體，解說應區分官方考試用法與詞典記載。";
question.answerKeyReview = {
  status: "官方答案已核對；已在解析註明辭典用法差異",
  note: "110年官方答案為 B；教育部《親朋稱呼表》列「舍弟」為弟弟常用自稱形式，而《重編國語辭典修訂本》另收「家弟」義為對人稱自己的弟弟。依官方答案計分，同時向學生揭露詞典用法差異。",
  evidenceSources: [
    "https://dict.revised.moe.edu.tw/appendix.jsp?ID=12&la=1",
    "https://dict.revised.moe.edu.tw/dictView.jsp?ID=89329&la=0&powerMode=0",
  ],
};

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Clarified the official answer and dictionary usage note for OFF-0011.");
