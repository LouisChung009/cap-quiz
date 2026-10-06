import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const byId = id => {
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} exists`);
  assert.equal(item.options.length, 4, `${id} has four options`);
  assert.ok(item.solutionSteps.length >= 3, `${id} has worked steps`);
  return item;
};

assert.match(byId("OFF-0885").question, /【畫線句：時間如果不是個偉大的作者，起碼是個傑出的編輯。】/);
assert.match(byId("OFF-0907").question, /【畫線句：到了「夠」的時候，沒有人能不說夠。】/);
const sentenceCompletion = byId("OFF-0019");
assert.match(sentenceCompletion.question, /「＿＿＿＿＿＿。所以，/);
assert.match(sentenceCompletion.question, /快樂往往是立即的/);
assert.ok(sentenceCompletion.options.some(option => option.includes("等待報酬的時間越短")));
console.log("OFF-0019 sentence-completion context and OFF-0885/OFF-0907 underlined ranges verified.");
