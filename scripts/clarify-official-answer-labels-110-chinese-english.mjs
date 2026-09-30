import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "mission-questions.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const labels = new Map([
  ["OFF-0035", "答案是 C。"],
  ["OFF-0036", "答案是 B。"],
  ["OFF-0063", "Answer: B."],
  ["OFF-0064", "Answer: D."],
  ["OFF-0066", "Answer: C."],
  ["OFF-0067", "Answer: A."],
  ["OFF-0069", "Answer: C."],
  ["OFF-0070", "Answer: A."],
  ["OFF-0071", "Answer: D."],
  ["OFF-0072", "Answer: C."]
]);
for (const [id, label] of labels) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing ${id}`);
  row.explanation = row.explanation.replace(/^(?:答案選\s*[A-D]|標答\s*[A-D]|答案為\s*[A-D]|答案是\s*[A-D]|Answer:\s*[A-D])(?:[。.]\s*)?/, "");
  row.explanation = `${label} ${row.explanation}`.trim();
}
const woollie = rows.find(item => item.id === "OFF-0067");
woollie.explanation = "Answer: A. The diary says Woollie was four when he ran away, and Mr. Armstrong took six years to find him. After he was found, Mr. Armstrong sheared him on TV; Daddy says this happened on Katie's birth day. Woollie was therefore at least ten years old when Katie was born, so he is older than Katie. B confuses selling fleece to raise money for sick children with taking Woollie to visit them; C is unsupported because the diary does not say he was ill when he ran away; D reverses the detail—the heavy fleece made him look unlike a sheep, not its absence.";
woollie.solutionSteps = [
  "The diary states Woollie was four when he ran away and that finding him took six years.",
  "The TV shearing happened after he was found, on the day Katie was born, so Woollie was already at least ten then.",
  "Thus Woollie is older than Katie (A); the other choices misread the visit, illness, or fleece details."
];
woollie.teacherTip = "For chronology questions, build an event sequence and use only age/time relationships stated or directly implied in the passage.";
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Clarified answer labels for ${labels.size} official questions.`);
