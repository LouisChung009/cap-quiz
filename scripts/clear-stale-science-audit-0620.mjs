import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const question = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8")).find(item => item.id === "OFF-0620");
if (!question || question.source?.year !== 112 || question.source?.questionNumber !== 10 || question.answer !== 1 || question.requiresImage || question.questionImages?.length || !question.explanation.includes("原有岩層") || !question.solutionSteps?.some(step => step.includes("海蝕"))) throw new Error("OFF-0620: current source, answer, explanation, or image state is invalid");
const path = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(path, "utf8"));
const updated = audit.filter(item => item.id !== "OFF-0620");
if (updated.length !== audit.length) await writeFile(path, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
console.log(`Reconciled ${audit.length - updated.length} stale generic explanation finding(s) for OFF-0620.`);
