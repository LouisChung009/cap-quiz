import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const files = ["sw.js", "app.js", "index.html"];
const replacements = new Map([
  ["sw.js", ["cap-quiz-v7.3.2", "cap-quiz-v7.3.3"]],
  ["app.js", ["./sw.js?v=7.3.2", "./sw.js?v=7.3.3"]],
  ["index.html", ["./bootstrap.js?v=7.3.2", "./bootstrap.js?v=7.3.3"]]
]);
const assets = [
  "./assets/official-exams/110-science-q01-table.png",
  "./assets/official-exams/110-science-q03-map.png",
  "./assets/official-exams/110-science-q07-table.png",
  "./assets/official-exams/110-science-q08-cartoon.png",
  "./assets/official-exams/110-science-q11-figure.png",
  "./assets/official-exams/110-science-q12-chart.png",
  "./assets/official-exams/110-science-q16-car.png",
  "./assets/official-exams/110-science-q17-map.png",
  "./assets/official-exams/110-science-q19-chart.png"
];

for (const file of files) {
  const path = new URL(file, root);
  let source = await readFile(path, "utf8");
  const [from, to] = replacements.get(file);
  if (source.includes(from)) source = source.replace(from, to);
  else if (file === "sw.js" && assets.every(asset => source.includes(asset))) continue;
  else if (!source.includes(to)) throw new Error(`Expected cache version ${from} or ${to} in ${file}`);
  if (file === "sw.js") {
    const anchor = '"./assets/official-exams/110-math-q1-figure.png"';
    const missingAssets = assets.filter(asset => !source.includes(asset));
    if (source.includes(anchor) && missingAssets.length) source = source.replace(anchor, `${missingAssets.map(asset => `"${asset}"`).join(",")},${anchor}`);
    else if (!assets.every(asset => source.includes(asset))) throw new Error("Could not find service-worker asset insertion point");
  }
  await writeFile(path, source);
}

console.log("Bumped the PWA cache and added nine 110 Science question figures.");
