import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const figure = "./assets/official-exams/114-chinese-q25-q26-oyster-passage.svg";
for (const [id, number, key, cue] of [["OFF-0899", 25, 1, "答案 B"], ["OFF-0900", 26, 0, "答案 A"]]) {
  const question = questions.find(item => item.id === id);
  assert.ok(question);
  assert.equal(question.source?.year, 114);
  assert.equal(question.source?.questionNumber, number);
  assert.equal(question.answer, key);
  assert.equal(question.requiresImage, true);
  assert.equal(question.requiresContext, true);
  assert.equal(question.questionImage, figure);
  assert.deepEqual(question.questionImages, [figure]);
  assert.equal(question.options.length, 4);
  assert.ok(question.solutionSteps.length >= 3);
  assert.ok(question.explanation.includes(cue));
}
assert.match(serviceWorker, /114-chinese-q25-q26-oyster-passage\.svg/);
assert.match(serviceWorker, /114-chinese-p8\.webp/);
assert.match(serviceWorker, /mission-questions\.json\?v=66/);
await access(join(root, "assets/official-exams/114-chinese-p8.webp"));
const svg = await readFile(join(root, figure.slice(2)), "utf8");
assert.match(svg, /viewBox="94 164 682 614"/);
assert.match(svg, /114-chinese-p8\.webp/);
console.log("114 Chinese Q25–26 source passage crop, offline assets, answer keys, and worked explanations passed.");
