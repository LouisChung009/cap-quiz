import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find(({ id }) => id === "OFF-0163");
if (!question || question.subject !== "社會" || question.source?.year !== 110 || question.source?.questionNumber !== 48) {
  throw new Error("Unexpected or missing 110 social Q48 (OFF-0163)");
}

question.question = "【開票資料】○○市第二選區第 59 號投開票所：候選人得票數為王大銘 203 票、趙小虹 1,046 票、康自強 344 票；政黨得票數為甲黨 1,039 票、乙黨 89 票、丙黨 326 票、丁黨 159 票。依上述開票結果判斷，此項選舉所選出的公職人員應具有下列何項職權？";
question.options = ["依法公布法律、命令", "編列中央政府的預算", "質詢地方政府的行政官員", "提出總統、副總統彈劾案"];
question.answer = 3;
question.explanation = "同時有選區候選人票與政黨票，顯示這是立法委員選舉，選出的公職人員為立法委員。立法院有提出總統、副總統彈劾案的職權，因此選 D。公布法律、命令是總統職權；編列中央政府預算由行政院提出；質詢地方政府官員則屬地方議會職權。";
question.solutionSteps = [
  "開票資料同時列出選區候選人得票及政黨得票，對應立法委員選舉的區域與政黨票制度。",
  "立法委員屬立法院，立法院可依法提出總統、副總統彈劾案，故 D 正確。",
  "公布法律、命令是總統職權；編列中央政府預算由行政院提出；質詢地方政府行政官員是地方議會監督地方行政機關的職權。"
];
question.teacherTip = "從選舉制度辨認公職，再把職權分配給總統、行政院、立法院或地方議會，不要只看題目出現的地名。";
question.requiresImage = false;
question.requiresContext = false;

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Transcribed 110 social Q48 election results and restored clean choices and solution.");
