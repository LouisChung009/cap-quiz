import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const figures = [
  "111-science-q24-weather-map.png",
  "111-science-q25-velocity-graphs.png",
  "111-science-q27-energy-mix-charts.png",
  "111-science-q27-carbon-table.png",
  "111-science-q28-heating-graphs.png",
  "111-science-q30-electrochemistry.png"
];
const swPath = new URL("sw.js", root);
let sw = await readFile(swPath, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.5"') || sw.includes('const CACHE="cap-quiz-v7.3.6"')) throw new Error("Unexpected cache version");
const anchor = '"./assets/official-exams/110-math-q1-figure.png"';
const assets = figures.map(file => `"./assets/official-exams/${file}"`);
if (assets.some(asset => sw.includes(asset))) throw new Error("A cache entry already exists; inspect before retrying");
sw = sw.replace('const CACHE="cap-quiz-v7.3.5"', 'const CACHE="cap-quiz-v7.3.6"').replace(anchor, `${assets.join(",")},${anchor}`);
await writeFile(swPath, sw);
for (const name of ["app.js", "index.html"]) {
  const path = new URL(name, root);
  const content = await readFile(path, "utf8");
  if (!content.includes("7.3.5")) throw new Error(`${name} does not reference v7.3.5`);
  await writeFile(path, content.replaceAll("7.3.5", "7.3.6"));
}
console.log(`Added ${figures.length} 111 Science figures to offline cache v7.3.6.`);
