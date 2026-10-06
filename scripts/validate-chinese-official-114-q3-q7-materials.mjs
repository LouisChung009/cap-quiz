import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const item = (id, number, answer) => {
  const question = questions.find(entry => entry.id === id);
  assert.ok(question, `${id} exists`);
  assert.equal(question.source?.year, 114);
  assert.equal(question.source?.questionNumber, number);
  assert.equal(question.answer, answer);
  assert.equal(question.options.length, 4);
  assert.ok(question.solutionSteps.length >= 3);
  return question;
};

const glyphs = item("OFF-0877", 3, 1);
assert.equal(glyphs.requiresImage, true);
assert.equal(glyphs.questionImage, "./assets/official-exams/114-chinese-q03-origin-chart.png");
await access(join(root, glyphs.questionImage.slice(2)));
const poem = item("OFF-0878", 4, 1);
for (const phrase of ["林婉瑜", "我的快樂除以我的悲傷", "得到的商", "卻只是1"]) assert.ok(poem.question.includes(phrase));
assert.equal(poem.requiresImage, false);
const data = item("OFF-0880", 6, 0);
for (const figure of ["30%", "25%", "33%", "法國", "阿根廷", "賽普勒斯", "新加坡", "聯合國2020年報告"]) assert.ok(data.question.includes(figure));
assert.equal(data.requiresImage, false);
const couplets = item("OFF-0881", 7, 1);
for (const cue of ["【甲圖】", "仄聲貼右", "平聲貼左", "【乙圖】", "上聯末字為仄聲", "下聯末字為平聲"]) assert.ok(couplets.question.includes(cue));
assert.equal(couplets.requiresImage, false);
assert.doesNotMatch(couplets.question, /\(cid:\d+\)/i);
console.log("114 Chinese Q3–Q7 figures, textual equivalents, options, keys, and worked steps passed source-material checks.");
