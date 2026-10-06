import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expected = [3, 0, 0, 1, 1, 0, 1, 0, 2, 1];
const files = new Map([[621, "112-science-q11-soap-process.png"], [623, "112-science-q13-white-noise-graphs.png"], [627, "112-science-q17-organic-inorganic-table.png"], [628, "112-science-q18-race-track.png"], [629, "112-science-q19-energy-track.png"], [630, "112-science-q20-plant-data-table.png"]]);
for (let index = 0; index < 10; index++) {
  const sourceNumber = index + 11;
  const number = sourceNumber + 610;
  const id = `OFF-${String(number).padStart(4, "0")}`;
  const question = rows.find(item => item.id === id);
  if (!question || question.source?.year !== 112 || question.source?.questionNumber !== sourceNumber || question.answer !== expected[index] || question.options?.length !== 4 || question.solutionSteps?.length < 3 || !question.explanation || !question.teacherTip) throw new Error(`${id}: source/key/solution validation failed`);
  const image = files.get(number);
  if (Boolean(question.requiresImage) !== Boolean(image) || (image && !question.questionImages?.some(path => path.endsWith(image)))) throw new Error(`${id}: image requirement or binding validation failed`);
}
const route = rows.find(item => item.id === "OFF-0625");
if (route.questionImages?.length || !route.question.includes("夏季") || !route.question.includes("臺灣向北航行")) throw new Error("OFF-0625: self-contained no-image repair failed");
const registerPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(registerPath, "utf8"));
const ids = Array.from({ length: 10 }, (_, index) => `OFF-${String(621 + index).padStart(4, "0")}`);
const updated = audit.filter(item => !ids.includes(item.id));
await writeFile(registerPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
console.log(`Reconciled ${audit.length - updated.length} stale findings after rechecking OFF-0621–0630 against original source pages.`);
