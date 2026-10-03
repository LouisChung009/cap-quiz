import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../sw.js", import.meta.url);
let sw = await readFile(path, "utf8");
const figures = [
  "113-science-q31-classroom-map.png",
  "113-science-q35-intensity-map.png",
  "113-science-q36-lens-ray-options.png",
  "113-science-q40-copper-plating-options.png"
];
const cache = sw.match(/const CACHE="(cap-quiz-v\d+\.\d+\.\d+)"/);
if (!cache) throw new Error("Could not determine the service-worker cache version");
const missing = figures.filter(file => !sw.includes(`./assets/official-exams/${file}`));
if (!missing.length) {
  console.log(`All ${figures.length} figures are already cached in ${cache[1]}.`);
  process.exit(0);
}
const anchor = '"./assets/official-exams/113-science-q15-isobar-map.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the cache anchor");
const entries = missing.map(file => `"./assets/official-exams/${file}"`).join(",");
const version = cache[1].match(/^(cap-quiz-v\d+\.\d+\.)(\d+)$/);
const nextCache = `${version[1]}${Number(version[2]) + 1}`;
sw = sw.replace(`const CACHE="${cache[1]}"`, `const CACHE="${nextCache}"`).replace(anchor, `${anchor},${entries}`);
await writeFile(path, sw);
console.log(`Added ${missing.length} 113 Science figures to offline cache ${nextCache}.`);
