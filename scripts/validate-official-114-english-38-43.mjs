import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const finalPassage = "Now the dress is finished and hanging behind Cameron's bedroom door. He believes the gift will tell his mother how much he loves her.";
const ids = Array.from({ length: 6 }, (_, index) => `OFF-${String(954 + index).padStart(4, "0")}`);
const items = ids.map(id => questions.find(question => question.id === id));

if (items.some(question => !question || question.subject !== "英文" || question.source?.year !== 114 || !question.requiresContext || !question.question.includes(finalPassage))) {
  throw new Error("OFF-0954–0959: the full official shared reading passage must be present in all six questions");
}

const last = items.at(-1);
if (last.answer !== 0 || !last.explanation.includes("洋裝已完成") || !last.solutionSteps.some(step => step.includes("完成洋裝不代表已送出")) || /hanging behind|掛在房門/.test(last.question.split("\n\nQuestion 43:")[1] || "")) {
  throw new Error("OFF-0959: answer A must be reasoned from the complete passage without adding unsupported evidence");
}

console.log("Official English Q38–43 full passage and Q43 evidence-based reasoning passed.");
