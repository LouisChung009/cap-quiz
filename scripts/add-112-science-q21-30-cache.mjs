import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../sw.js", import.meta.url);
let sw = await readFile(path, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.11"')) throw new Error("Unexpected service-worker cache version");
const figures = [
  "112-science-q21-planet-plot.png",
  "112-science-q22-temperature-graph.png",
  "112-science-q23-velocity-time-graph.png",
  "112-science-q25-gas-composition-options.png",
  "112-science-q28-weather-map.png",
  "112-science-q29-time-altitude-options.png"
];
if (figures.some(file => sw.includes(`./assets/official-exams/${file}`))) throw new Error("A figure is already cached");
const anchor = '"./assets/official-exams/112-science-q20-plant-data-table.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the cache anchor");
const entries = figures.map(file => `"./assets/official-exams/${file}"`).join(",");
sw = sw.replace('const CACHE="cap-quiz-v7.3.11"', 'const CACHE="cap-quiz-v7.3.12"').replace(anchor, `${anchor},${entries}`);
await writeFile(path, sw);
console.log(`Added ${figures.length} 112 Science figures to offline cache v7.3.12.`);
