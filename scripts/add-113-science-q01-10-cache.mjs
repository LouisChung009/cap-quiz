import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../sw.js", import.meta.url);
let sw = await readFile(path, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.14"')) throw new Error("Unexpected service-worker cache version");
const figures = [
  "113-science-q03-weekly-temperature-chart.png",
  "113-science-q06-exposed-wire-repair.png",
  "113-science-q08-earth-sun-options.png",
  "113-science-q09-cell-osmosis.png",
  "113-science-q10-ocean-floor-age-options.png"
];
if (figures.some(file => sw.includes(`./assets/official-exams/${file}`))) throw new Error("A figure is already cached");
const anchor = '"./assets/official-exams/112-science-q50-liquefaction-profiles.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the cache anchor");
const entries = figures.map(file => `"./assets/official-exams/${file}"`).join(",");
sw = sw.replace('const CACHE="cap-quiz-v7.3.14"', 'const CACHE="cap-quiz-v7.3.15"').replace(anchor, `${anchor},${entries}`);
await writeFile(path, sw);
console.log(`Added ${figures.length} 113 Science figures to offline cache v7.3.15.`);
