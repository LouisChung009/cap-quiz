import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const prompts = new Map([
  [38, "He ____ doing this in his first year of junior high school."],
  [39, "After class, _____. How brave a woman is to have a baby! Thank God I'll never have to do that!"],
  [40, "He decided that his birthday _____. During those nine months inside his mom, he just ate and slept while his mom was doing all the hard work."],
  [41, "The ____ ‘birthday gift’ Cameron prepared was a bag of cookies he baked."],
  [42, "The cookies tasted so bad, but his mom said they were the best thing she ever got. Hearing that _____. It was so much better than getting a gift."],
  [43, "This year, Cameron ____ his mom a nice dress."]
]);

for (const [number, prompt] of prompts) {
  const row = questions.find(question => question.id === `OFF-${String(916 + number).padStart(4, "0")}`);
  if (!row || row.source?.year !== 114 || row.source.questionNumber !== number || row.options?.length !== 4) throw new Error(`114 English Q${number} source-key guard failed`);
  row.question = row.question.replace(`Choose the correct answer for question ${number}.`, `Question ${number}: ${prompt}`);
}

const teaQuestion = questions.find(question => question.id === "OFF-0034");
if (!teaQuestion || teaQuestion.subject !== "國文" || teaQuestion.source?.year !== 110) throw new Error("110 Chinese Q34 guard failed");
teaQuestion.teacherTip = "推論題要找材料反覆呈現的共同線索：文中上流階級與勞動階級都曾提到加牛奶；不要把英國人的飲茶習慣推及美國，也不要超出材料斷定茶具限制。";

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored original fill-in sentence prompts for 114 English Q38–43 and corrected the unrelated 110 Chinese Q34 tip.");
