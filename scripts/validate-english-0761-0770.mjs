import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0761", 1, "recorded", "entered it into a list", "record names"],
  ["ENG-0762", 2, "had put", "By the time", "had + 過去分詞"],
  ["ENG-0763", 3, "Add a parent’s signature", "signature box is blank", "補上簽名"],
  ["ENG-0764", 0, "repeat", "had the players", "不帶 to 的原形動詞"],
  ["ENG-0765", 1, "from", "departs", "depart from"],
  ["ENG-0766", 2, "Having read", "read the instruction booklet twice", "先完成的動作"],
  ["ENG-0767", 3, "Possible flooding", "move valuables upstairs", "heavy rain"],
  ["ENG-0768", 0, "must be returned", "All borrowed laptops", "被動形式為 be + 過去分詞"],
  ["ENG-0769", 1, "straightforward", "first-time users", "容易理解"],
  ["ENG-0770", 2, "Unless", "moved indoors", "若未改善"],
];
const failures = [];
for (const [id, answer, option, stemClue, solutionClue] of expected) {
  const row = rows.find(item => item.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== option || row.options?.length !== 4) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question.includes(stemClue) || !row.explanation || !row.solutionSteps?.some(step => step.includes(solutionClue)) || row.solutionSteps.length < 3 || !row.teacherTip || row.relatedWords?.length < 2) {
    failures.push(`${id}: missing evidence or teaching explanation`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0761–0770 answer keys, evidence, and teaching explanations passed.");
