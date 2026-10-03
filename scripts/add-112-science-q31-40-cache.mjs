import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../sw.js", import.meta.url);
let sw = await readFile(path, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.12"')) throw new Error("Unexpected service-worker cache version");
const figures = [
  "112-science-q31-tail-vessels.png",
  "112-science-q32-saliva-volume-graph.png",
  "112-science-q32-mouth-ph-graphs.png",
  "112-science-q35-strawberry-flower.png",
  "112-science-q36-sun-shadow-map.png",
  "112-science-q37-magnetic-force-diagram.png"
];
if (figures.some(file => sw.includes(`./assets/official-exams/${file}`))) throw new Error("A figure is already cached");
const anchor = '"./assets/official-exams/112-science-q29-time-altitude-options.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the cache anchor");
const entries = figures.map(file => `"./assets/official-exams/${file}"`).join(",");
sw = sw.replace('const CACHE="cap-quiz-v7.3.12"', 'const CACHE="cap-quiz-v7.3.13"').replace(anchor, `${anchor},${entries}`);
await writeFile(path, sw);
console.log(`Added ${figures.length} 112 Science figures to offline cache v7.3.13.`);
