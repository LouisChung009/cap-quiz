import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const byId = (id) => {
  const row = rows.find((item) => item.id === id);
  if (!row) throw new Error(`Missing ${id}`);
  return row;
};

const chinese = byId("OFF-0701");
chinese.solutionSteps = [
  "先分辨說話者：江母指控令尹治理失當、縱容盜賊；楚王則先表示若令尹確實偷竊，也會依法處理。",
  "江母引用孫叔敖治理時「道不拾遺」的例子，並指出自己的兒子曾因王宮失竊被黜，說明上位者也應承擔治理責任。",
  "題目問楚王與令尹的敘述，最符合楚王明言法律不因身分而改變的是 D；不可把江母的話誤當成令尹或楚王的主張。"
];
chinese.teacherTip = "文言文對話題先標記每句話的說話者，再判斷主張與回應，避免把轉述者的批評歸給被批評者。";

const chartQuestion = byId("OFF-0016");
chartQuestion.questionImage = "./assets/official-exams/110-chinese-q16-chart.png";
chartQuestion.questionImages = [chartQuestion.questionImage];
chartQuestion.imageAlt = "110年國文第16題國中小新住民子女與非新住民子女人數統計圖";
chartQuestion.requiresImage = true;

const topoQuestion = byId("OFF-0120");
topoQuestion.questionImage = "./assets/official-exams/110-social-q05-map.png";
topoQuestion.questionImages = [topoQuestion.questionImage];
topoQuestion.imageAlt = "110年社會第5題山頂附近等高線圖，標示甲乙兩條登山路線";
topoQuestion.requiresImage = true;

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Corrected the speaker attribution and replaced two full-page scans with focused figures.");
