import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../sw.js", import.meta.url);
let sw = await readFile(path, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.13"')) throw new Error("Unexpected service-worker cache version");
const figures = [
  "112-science-q41-separation-flow.png",
  "112-science-q42-parallel-circuits.png",
  "112-science-q44-carbon-chart.png",
  "112-science-q46-wind-power-curve.png",
  "112-science-q50-liquefaction-profiles.png"
];
if (figures.some(file => sw.includes(`./assets/official-exams/${file}`))) throw new Error("A figure is already cached");
const anchor = '"./assets/official-exams/112-science-q37-magnetic-force-diagram.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the cache anchor");
const entries = figures.map(file => `"./assets/official-exams/${file}"`).join(",");
sw = sw.replace('const CACHE="cap-quiz-v7.3.13"', 'const CACHE="cap-quiz-v7.3.14"').replace(anchor, `${anchor},${entries}`);
await writeFile(path, sw);
console.log(`Added ${figures.length} 112 Science figures to offline cache v7.3.14.`);
