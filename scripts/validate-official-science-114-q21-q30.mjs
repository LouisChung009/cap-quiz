import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const keys = [3, 2, 1, 0, 1, 3, 3, 1, 3, 0];
const figures = new Map([
  [21, "114-science-q21-polymer-charts.png"],
  [23, "114-science-q23-isobar-options.png"],
  [24, "114-science-q24-bird-table.png"],
  [25, "114-science-q25-battery-table.png"],
  [27, "114-science-q27-antique-microscope.png"]
]);
for (let index = 0; index < keys.length; index += 1) {
  const number = index + 21;
  const id = `OFF-${String(number + 1038).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} exists`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 114, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source number`);
  assert.equal(item.answer, keys[index], `${id} official answer`);
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} key provenance`);
  assert.ok(item.explanation?.length > 45 && item.solutionSteps?.length >= 3 && item.teacherTip?.trim(), `${id} worked teaching content`);
  const figure = figures.get(number);
  assert.equal(Boolean(item.requiresImage), Boolean(figure), `${id} image dependency`);
  if (figure) {
    assert.ok(item.questionImages?.some(image => image.endsWith(figure)), `${id} focused figure binding`);
    await access(join(root, "assets", "official-exams", figure));
    assert.ok(serviceWorker.includes(`./assets/official-exams/${figure}`), `${id} offline cache`);
  } else assert.ok(!item.questionImages?.length && !item.questionImage, `${id} self-contained question`);
}
const q21 = questions.find(question => question.id === "OFF-1059");
assert.ok(q21.question.includes("70°C") && q21.question.includes("PET") && q21.question.includes("POM") && q21.question.includes("PP"), "Q21 source graph variables and temperature are present");
const q22 = questions.find(question => question.id === "OFF-1060");
assert.ok(q22.question.includes("韌皮部") && q22.question.includes("木質部"), "Q22 vascular-bundle evidence is transcribed");
const q26 = questions.find(question => question.id === "OFF-1064");
assert.ok(q26.solutionSteps.some(step => step.includes("Q=mcΔT")), "Q26 specific-heat reasoning is present");
const q29 = questions.find(question => question.id === "OFF-1067");
assert.ok(q29.solutionSteps.some(step => step.includes("密度")), "Q29 density evidence is present");
const q30 = questions.find(question => question.id === "OFF-1068");
assert.ok(q30.solutionSteps.some(step => step.includes("Aa")), "Q30 recessive inheritance reasoning is present");
console.log("Official Natural Sciences 114 Q21–30 identities, answer keys, source evidence, worked steps, and required offline figures passed.");
