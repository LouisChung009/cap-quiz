import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const ids = ["OFF-0073", "OFF-0079", "OFF-0080", "OFF-0159", "OFF-0192", "OFF-0193", "OFF-0200", "OFF-0201", "OFF-0202"];
for (const id of ids) {
  const row = rows.find(item => item.id === id);
  if (!row || !row.options?.[row.answer]) throw new Error(`Missing keyed item: ${id}`);
  const letter = String.fromCharCode(65 + row.answer);
  const option = row.options[row.answer];
  const citation = row.subject === "英文"
    ? `The correct answer is ${letter}: ${option}.`
    : `正確答案為 ${letter}「${option}」。`;
  if (!row.explanation.includes(citation)) row.explanation = `${row.explanation.trim()} ${citation}`;
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Added explicit keyed-option references to ${ids.length} reviewed official questions.`);
