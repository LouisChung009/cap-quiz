import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const question = questions.find(item => item.id === "OFF-0664");
assert.ok(question);
assert.equal(question.source?.year, 113);
assert.equal(question.source?.questionNumber, 4);
assert.equal(question.requiresImage, false);
assert.equal(question.options.length, 4);
for (const letter of ["A", "B", "C", "D"]) assert.match(question.question, new RegExp(`【${letter}】問卷題目：.+?阿寶的立場：.+?阿寶的選擇：`, "s"));
assert.equal(question.answer, 1);
assert.ok(question.solutionSteps.length >= 3);
console.log("113 Chinese Q4: all four survey rows preserve the original three-column meaning in readable text.");
