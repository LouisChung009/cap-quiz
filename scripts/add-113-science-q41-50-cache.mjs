import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../sw.js", import.meta.url);
let sw = await readFile(path, "utf8");
const figure = "113-science-q49-co2-cycle-graph.png";
const cache = sw.match(/const CACHE="(cap-quiz-v\d+\.\d+\.\d+)"/);
if (!cache) throw new Error("Could not determine the service-worker cache version");
if (sw.includes(`./assets/official-exams/${figure}`)) {
  console.log(`${figure} is already in ${cache[1]}.`);
  process.exit(0);
}
const anchor = '"./assets/official-exams/113-science-q40-copper-plating-options.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the cache anchor");
const version = cache[1].match(/^(cap-quiz-v\d+\.\d+\.)(\d+)$/);
const nextCache = `${version[1]}${Number(version[2]) + 1}`;
sw = sw.replace(`const CACHE="${cache[1]}"`, `const CACHE="${nextCache}"`)
  .replaceAll(`v${cache[1].replace("cap-quiz-v", "")}`, `v${nextCache.replace("cap-quiz-v", "")}`)
  .replace(anchor, `${anchor},"./assets/official-exams/${figure}"`);
await writeFile(path, sw);
console.log(`Added ${figure} to offline cache ${nextCache}.`);
