import { readFile, writeFile } from "node:fs/promises";

const swPath = new URL("../sw.js", import.meta.url);
const figures = [
  "111-science-q42-fermentation-options.png",
  "111-science-q45-vascular-crosssection.png",
  "111-science-q46-student-table.png",
  "111-science-q47-reference-circuit.png",
  "111-science-q47-wiring-options.png"
];
let sw = await readFile(swPath, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.8"') || sw.includes('const CACHE="cap-quiz-v7.3.9"')) throw new Error("Unexpected service-worker cache version");
if (figures.some(file => sw.includes(`./assets/official-exams/${file}`))) throw new Error("A figure is already in the service-worker cache; inspect before retrying");
const anchor = '"./assets/official-exams/111-science-q40-strata.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the Q40 cache anchor");
const entries = figures.map(file => `"./assets/official-exams/${file}"`).join(",");
sw = sw.replace('const CACHE="cap-quiz-v7.3.8"', 'const CACHE="cap-quiz-v7.3.9"').replace(anchor, `${anchor},${entries}`);
await writeFile(swPath, sw);
console.log(`Added ${figures.length} 111 Science figures to offline cache v7.3.9.`);
