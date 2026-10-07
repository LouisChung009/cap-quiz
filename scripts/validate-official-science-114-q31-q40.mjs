import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const keys = [0, 1, 3, 3, 0, 0, 1, 2, 2, 0];
const figures = new Map([
  [31, ["114-science-q31-circuit-setups.png", "114-science-q31-compass-options.png"]],
  [33, ["114-science-q33-fault-maps.png"]],
  [35, ["114-science-q35-division.png"]],
  [39, ["114-science-q39-velocity-time-graph.png"]]
]);
const explanations = new Map([
  [32, ["64 g", "68 g", "36 g", "98 g"]],
  [33, ["與震央同側的乙處"]],
  [35, ["種子萌芽長成幼苗也靠有絲分裂生長"]],
  [37, ["地球與火星可以分居太陽兩側"]],
  [39, ["F₂與F₇相等且大於F₅"]],
  [40, ["降溫並凝結"]]
]);
for (let index = 0; index < keys.length; index += 1) {
  const number = index + 31;
  const id = `OFF-${String(number + 1038).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} exists`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 114, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source number`);
  assert.equal(item.answer, keys[index], `${id} official key`);
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} answer provenance`);
  assert.ok(item.explanation?.length > 45 && item.solutionSteps?.length >= 3 && item.teacherTip?.trim(), `${id} worked teaching content`);
  const required = figures.get(number) || [];
  assert.equal(Boolean(item.requiresImage), required.length > 0, `${id} image requirement`);
  for (const filename of required) {
    assert.ok(item.questionImages?.some(image => image.endsWith(filename)), `${id} focused figure binding: ${filename}`);
    await access(join(root, "assets", "official-exams", filename));
    assert.ok(serviceWorker.includes(`./assets/official-exams/${filename}`), `${id} offline cache: ${filename}`);
  }
  if (!required.length) assert.ok(!item.questionImages?.length && !item.questionImage, `${id} self-contained stem`);
  for (const clue of explanations.get(number) || []) assert.ok(`${item.question} ${item.explanation} ${item.solutionSteps.join(" ")}`.includes(clue), `${id} source reasoning ${clue}`);
}
console.log("Official Natural Sciences 114 Q31–40 identities, answer keys, source calculations, reasoning, and required offline figures passed.");
