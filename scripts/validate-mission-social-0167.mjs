import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const item = questions.find(question => question.id === "OFF-0167");

if (
  !item ||
  item.answer !== 0 ||
  item.options?.length !== 4 ||
  !item.explanation.includes("希臘文仍長期廣泛用於埃及行政") ||
  !item.explanation.includes("表述不夠精確") ||
  !item.teacherTip.includes("不能當作語言全面替換") ||
  item.solutionSteps?.length !== 3
) {
  throw new Error("OFF-0167 must preserve its keyed answer while disclosing the Roman-Egypt language-history simplification.");
}

console.log("OFF-0167 explanation discloses the simplified language chronology and preserves the original keyed choice.");
