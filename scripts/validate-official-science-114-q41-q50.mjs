import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const keys = [3, 1, 3, 2, 3, 3, 1, 3, 2, 1];
const figures = new Map([
  [41, "114-science-q41-fuel-energy-chart.png"],
  [45, "114-science-q45-bleeding-spots.svg"],
  [49, "114-science-q49-moon-phase-options.svg"],
  [50, "114-science-q50-moon-path.svg"]
]);
for (let index = 0; index < keys.length; index += 1) {
  const number = index + 41;
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
  const figure = figures.get(number);
  assert.equal(Boolean(item.requiresImage), Boolean(figure), `${id} image requirement`);
  if (figure) {
    assert.ok(item.questionImages?.some(image => image.endsWith(figure)), `${id} figure binding`);
    await access(join(root, "assets", "official-exams", figure));
    assert.ok(serviceWorker.includes(`./assets/official-exams/${figure}`), `${id} offline cache`);
  } else assert.ok(!item.questionImages?.length && !item.questionImage, `${id} self-contained question`);
}
const evidence = new Map([
  [41, ["單位質量", "單位體積", "液化氫"]],
  [42, ["0.021 kWh", "0.021×3"]],
  [46, ["血小板"]],
  [47, ["150×10=1500", "10 cm"]],
  [48, ["F=0.5M+50 gw", "50 gw"]]
]);
for (const [number, clues] of evidence) {
  const item = questions.find(question => question.source?.year === 114 && question.source?.questionNumber === number && question.subject === "自然");
  const text = `${item.question} ${item.explanation} ${item.solutionSteps.join(" ")} ${item.teacherTip}`;
  for (const clue of clues) assert.ok(text.includes(clue), `Q${number} evidence ${clue}`);
}
console.log("Official Natural Sciences 114 Q41–50 identities, answer keys, source calculations, explanations, and focused offline figures passed.");
