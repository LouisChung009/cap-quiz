import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const byId = id => {
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} exists`);
  assert.equal(item.source?.year, 113);
  assert.equal(item.options.length, 4);
  assert.ok(item.solutionSteps.length >= 3);
  assert.ok(item.question.length > 250);
  return item.question;
};
for (const id of ["OFF-0685", "OFF-0686"]) {
  const passage = byId(id);
  for (const clue of ["張惠菁", "大象咖啡館", "國家圖書館", "完成學業", "尖銳的姿態"]) assert.ok(passage.includes(clue), `${id} is missing passage clue ${clue}`);
}
for (const clue of ["范寬", "郭熙", "李唐", "絹本", "42天", "2012年"]) assert.ok(byId("OFF-0691").includes(clue), `OFF-0691 is missing exhibit detail ${clue}`);
for (const id of ["OFF-0698", "OFF-0699"]) {
  const passage = byId(id);
  for (const clue of ["甲文：", "乙文：", "東萊集", "左宗棠全集", "掩卷自思", "古人道理始出"]) assert.ok(passage.includes(clue), `${id} is missing paired-text clue ${clue}`);
}
console.log("113 Chinese Q25–26, Q31, and Q38–39 all contain their source passages and complete choice/explanation fields.");
