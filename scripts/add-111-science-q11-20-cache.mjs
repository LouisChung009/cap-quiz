import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const figures = [
  "111-science-q15-aquifer.png",
  "111-science-q16-magnetic-grid.png",
  "111-science-q17-microscopes.png",
  "111-science-q20-climate-chart.png"
];
const swPath = new URL("sw.js", root);
let sw = await readFile(swPath, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.4"') || sw.includes('const CACHE="cap-quiz-v7.3.5"')) throw new Error("Unexpected cache version");
const anchor = '"./assets/official-exams/110-math-q1-figure.png"';
const assets = figures.map(file => `"./assets/official-exams/${file}"`);
if (assets.some(asset => sw.includes(asset))) throw new Error("A cache entry already exists; inspect before retrying");
sw = sw.replace('const CACHE="cap-quiz-v7.3.4"', 'const CACHE="cap-quiz-v7.3.5"').replace(anchor, `${assets.join(",")},${anchor}`);
await writeFile(swPath, sw);
for (const name of ["app.js", "index.html"]) {
  const path = new URL(name, root);
  const content = await readFile(path, "utf8");
  if (!content.includes("7.3.4")) throw new Error(`${name} does not reference v7.3.4`);
  await writeFile(path, content.replaceAll("7.3.4", "7.3.5"));
}
console.log(`Added ${figures.length} 111 Science figures to offline cache v7.3.5.`);
