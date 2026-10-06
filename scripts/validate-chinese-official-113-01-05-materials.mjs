import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
for (const [id, number, asset] of [
  ["OFF-0661", 1, "./assets/official-exams/113-chinese-q01-social-post.svg"],
  ["OFF-0665", 5, "./assets/official-exams/113-chinese-q05-bookstore-ad.svg"]
]) {
  const question = questions.find(item => item.id === id);
  assert.ok(question, `${id} exists`);
  assert.equal(question.source?.year, 113);
  assert.equal(question.source?.questionNumber, number);
  assert.equal(question.options.length, 4);
  assert.equal(question.requiresImage, true);
  assert.deepEqual(question.questionImages, [asset]);
  assert.equal(question.questionImage, asset);
  assert.ok(question.imageAlt?.length > 20);
  assert.ok(!question.question.includes("50 元") && !question.question.includes("活動項目"), `${id} must not replace the source visual with a leading summary`);
  assert.ok((await stat(join(root, asset.slice(2)))).size > 0);
  const svg = await readFile(join(root, asset.slice(2)), "utf8");
  assert.match(svg, /<image\b/);
  assert.match(svg, /113-chinese-p[23]\.webp/);
}
console.log("113 Chinese Q1 and Q5 have accessible, focused original-ad figures wired as required materials.");
