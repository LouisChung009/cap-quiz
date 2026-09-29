import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find(item => item.id === "OFF-0180");
if (!question) throw new Error("OFF-0180 not found");

question.question = "小茹統計某漁港每日的潮汐水位高度資料，她發現此漁港最高的滿潮水位高於平均海平面高度 2 公尺，而最低的乾潮水位低於平均海平面高度 2 公尺。根據小茹的統計資料，此漁港的潮差高度不可能為下列何者？";
question.options = ["2 公尺", "3 公尺", "4 公尺", "5 公尺"];
question.answer = 3;
question.explanation = "正答 D「5 公尺」。以平均海平面為基準，滿潮最高為 +2 公尺、乾潮最低為 −2 公尺，因此潮差最多為 2−(−2)=4 公尺；5 公尺超過可能的最大潮差。A、B、C 均不超過 4 公尺，題目問不可能，故選 D。";
question.solutionSteps = [
  "以平均海平面作為 0 公尺，最高滿潮為 +2 公尺，最低乾潮為 −2 公尺。",
  "潮差是最高水位減最低水位，最大值為 2−(−2)=4 公尺。",
  "2、3、4 公尺皆不超過最大潮差；5 公尺不可能，選 D（index 3）。",
];
question.teacherTip = "遇到相對於平均值的高低差，先標正負，再用最高值減最低值；注意題目問『不可能』。";
question.requiresImage = false;
question.questionImage = "assets/official-exams/110-science-p2.webp";
question.questionImages = ["assets/official-exams/110-science-p2.webp"];
question.imageAlt = "110 年自然科第 2 題潮汐水位題，選項為 2、3、4、5 公尺";
question.answerKeyReview = {
  status: "verified",
  note: "依 110 年自然科官方試卷 p2 題幹及選項，最大潮差為 4 公尺，5 公尺不可能；官方答案 D，index 3。原資料列誤放第 7 題牛奶實驗內容，已完整更正。",
};

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Corrected OFF-0180 to official 110 Natural Science question 2.");
