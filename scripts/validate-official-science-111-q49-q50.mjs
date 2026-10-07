import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const entries = [
  { id: "OFF-0445", number: 49, answer: 2, figure: "111-science-q49-moon-cards.png", clues: ["滿月約在農曆十五日前後", "小豪得 1 分"] },
  { id: "OFF-0446", number: 50, answer: 3, figure: null, clues: ["視網膜", "運動神經元", "小豪比阿明晚數秒"] }
];
for (const entry of entries) {
  const item = questions.find(question => question.id === entry.id);
  assert.ok(item, `${entry.id} exists`);
  assert.equal(item.subject, "自然", `${entry.id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${entry.id} source type`);
  assert.equal(item.source?.year, 111, `${entry.id} year`);
  assert.equal(item.source?.questionNumber, entry.number, `${entry.id} source question`);
  assert.equal(item.answer, entry.answer, `${entry.id} official answer`);
  assert.equal(item.options?.length, 4, `${entry.id} four options`);
  assert.equal(item.answerKeyReview?.status, "verified", `${entry.id} answer provenance`);
  assert.ok(item.explanation?.length > 100 && item.solutionSteps?.length >= 3 && item.teacherTip?.trim(), `${entry.id} worked teaching content`);
  assert.equal(Boolean(item.requiresImage), Boolean(entry.figure), `${entry.id} image requirement`);
  if (entry.figure) {
    assert.ok(item.questionImages?.some(image => image.endsWith(entry.figure)), `${entry.id} image binding`);
    await access(join(root, "assets", "official-exams", entry.figure));
    assert.ok(serviceWorker.includes(`./assets/official-exams/${entry.figure}`), `${entry.id} offline cache`);
  } else assert.ok(!item.questionImages?.length && !item.questionImage, `${entry.id} no unneeded scan`);
  const evidence = `${item.question} ${item.explanation} ${item.solutionSteps.join(" ")} ${item.teacherTip}`;
  for (const clue of entry.clues) assert.ok(evidence.includes(clue), `${entry.id} reasoning evidence ${clue}`);
}
console.log("Official Natural Sciences 111 Q49–50 source keys, moon-phase reasoning, neural response steps, and required offline figure passed.");
