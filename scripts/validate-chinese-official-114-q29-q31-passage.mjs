import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const rows = [
  ["OFF-0903", 29, 2],
  ["OFF-0904", 30, 3],
  ["OFF-0905", 31, 2]
].map(([id, number, answer]) => {
  const item = questions.find(question => question.id === id);
  assert.ok(item);
  assert.equal(item.source?.year, 114);
  assert.equal(item.source?.questionNumber, number);
  assert.equal(item.answer, answer);
  assert.equal(item.options.length, 4);
  assert.ok(item.solutionSteps.length >= 3);
  assert.ok(item.question.includes("希區考克") && item.question.includes("視覺化寫作"));
  assert.ok(item.question.includes("安德魯的練習室") && item.question.includes("巴迪．瑞奇俯在鼓上"));
  assert.equal(item.requiresImage, false);
  return item;
});
for (const clue of ["劇本、劇本、劇本", "場景外觀", "場景事件", "角色外貌", "角色行動", "400", "雙手起泡", "右鼓棒斷成兩半"]) assert.ok(rows[0].question.includes(clue), `shared source passage is missing ${clue}`);
for (const clue of ["【畫線處：安德魯的練習室】", "【畫線處：", "【畫線處：喀啦】", "【畫線處：巴迪．瑞奇俯在鼓上】"]) assert.ok(rows[2].question.includes(clue));
assert.doesNotMatch(rows[0].question, /視覺化描寫讓觀眾進入真實世界、維持注意力/);
console.log("114 Chinese Q29–Q31 complete shared reading and original underlined ranges passed.");
