import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const files = ["sw.js", "app.js", "index.html"];
const figures = [
  "110-science-q33-electrolysis.png",
  "110-science-q36-foodweb.png",
  "110-science-q37-pressure.png",
  "110-science-q38-weather-map.png",
  "110-science-q42-enzyme-graphs.png",
  "110-science-q43-speed-graphs.png",
  "110-science-q52-evolution-tree.png",
  "110-science-q53-strata-options.png"
];

const swPath = new URL("sw.js", root);
let sw = await readFile(swPath, "utf8");
if (sw.includes('const CACHE="cap-quiz-v7.3.4"')) throw new Error("Cache already bumped");
sw = sw.replace('const CACHE="cap-quiz-v7.3.3"', 'const CACHE="cap-quiz-v7.3.4"');
const anchor = '"./assets/official-exams/110-math-q1-figure.png"';
if (!sw.includes(anchor)) throw new Error("Precache insertion anchor missing");
const entries = figures.map(file => `"./assets/official-exams/${file}"`).filter(asset => !sw.includes(asset));
if (entries.length !== figures.length) throw new Error("Some new figure paths already exist; inspect precache manually");
sw = sw.replace(anchor, `${entries.join(",")},${anchor}`);
await writeFile(swPath, sw);

for (const name of ["app.js", "index.html"]) {
  const file = new URL(name, root);
  const content = await readFile(file, "utf8");
  if (!content.includes("7.3.3")) throw new Error(`${name} is missing the expected old version`);
  await writeFile(file, content.replaceAll("7.3.3", "7.3.4"));
}
console.log(`Added ${figures.length} 110 Science figures to offline cache v7.3.4.`);
