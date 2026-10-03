import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const figures = ["111-science-q33-torque.png", "111-science-q40-strata.png"];
const swPath = new URL("sw.js", root);
let sw = await readFile(swPath, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.6"') || sw.includes('const CACHE="cap-quiz-v7.3.7"')) throw new Error("Unexpected cache version");
const anchor = '"./assets/official-exams/110-math-q1-figure.png"';
const assets = figures.map(file => `"./assets/official-exams/${file}"`);
if (assets.some(asset => sw.includes(asset))) throw new Error("A cache entry already exists; inspect before retrying");
sw = sw.replace('const CACHE="cap-quiz-v7.3.6"', 'const CACHE="cap-quiz-v7.3.7"').replace(anchor, `${assets.join(",")},${anchor}`);
await writeFile(swPath, sw);
for (const name of ["app.js", "index.html"]) {
  const path = new URL(name, root);
  const content = await readFile(path, "utf8");
  if (!content.includes("7.3.6")) throw new Error(`${name} does not reference v7.3.6`);
  await writeFile(path, content.replaceAll("7.3.6", "7.3.7"));
}
console.log("Added 111 Science Q33 and Q40 figures to offline cache v7.3.7.");
