import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "chinese.json"), "utf8"));
const byId = new Map(questions.map((question) => [question.id, question]));
const q134 = byId.get("CHI-0134");
const q135 = byId.get("CHI-0135");
const q152 = byId.get("CHI-0152");

if (!q134?.question.includes("24 人中有 6 人仍淋濕") || q134.answer !== 3 || !q134.explanation.includes("直接反駁")) throw new Error("CHI-0134: observed counterexample or key reasoning missing");
if (!q135?.question.includes("放學後留校自習") || q135.answer !== 0 || !q135.solutionSteps.some(step => step.includes("①顯示"))) throw new Error("CHI-0135: evidence needed to answer the research question is missing");
if (q152?.options?.[0] !== "親力親為" || q152.answer !== 1 || !q152.explanation.includes("不必然包含教學")) throw new Error("CHI-0152: distinguishing distractor or explanation missing");

for (const id of ["CHI-0134", "CHI-0135", "CHI-0152"]) {
  const question = byId.get(id);
  if (!question || question.options?.length !== 4 || !question.explanation || !question.solutionSteps?.length || !question.teacherTip) throw new Error(`${id}: complete four-choice teaching fields required`);
}

console.log("Chinese audit repairs CHI-0134, CHI-0135, and CHI-0152 passed.");
