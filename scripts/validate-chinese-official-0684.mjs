import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const question = questions.find(item => item.id === "OFF-0684");
assert.ok(question, "OFF-0684 exists");
assert.match(question.question, /使女工繅之，以為美錦，國君服而朝之。身者，繭也/);
assert.match(question.question, /字詞註釋：繅，音ㄙㄠ，煮繭抽絲。$/);
assert.doesNotMatch(question.question, /1\s*身者||莫\s+敢/);
assert.equal(question.options.length, 4);
assert.ok(question.options.every(option => !/[]|繅：音ㄙㄠ/.test(option)));
console.log("OFF-0684: original-page transcription and clean choices verified.");
