import { readFile, writeFile } from "node:fs/promises";

const swPath = new URL("../sw.js", import.meta.url);
const figures = [
  "112-science-q03-sports-drink.png",
  "112-science-q05-tide-chart.png",
  "112-science-q06-heating-apparatus.png"
];
let sw = await readFile(swPath, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.9"') || sw.includes('const CACHE="cap-quiz-v7.3.10"')) throw new Error("Unexpected service-worker cache version");
if (figures.some(file => sw.includes(`./assets/official-exams/${file}`))) throw new Error("A figure is already in the service-worker cache; inspect before retrying");
const anchor = '"./assets/official-exams/111-science-q47-wiring-options.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the 111 Science cache anchor");
const entries = figures.map(file => `"./assets/official-exams/${file}"`).join(",");
sw = sw.replace('const CACHE="cap-quiz-v7.3.9"', 'const CACHE="cap-quiz-v7.3.10"').replace(anchor, `${anchor},${entries}`);
await writeFile(swPath, sw);
console.log(`Added ${figures.length} 112 Science figures to offline cache v7.3.10.`);
