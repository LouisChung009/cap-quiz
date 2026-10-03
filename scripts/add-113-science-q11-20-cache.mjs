import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../sw.js", import.meta.url);
let sw = await readFile(path, "utf8");
if (!sw.includes('const CACHE="cap-quiz-v7.3.15"')) throw new Error("Unexpected service-worker cache version");
const figure = "113-science-q15-isobar-map.png";
if (sw.includes(figure)) throw new Error("Figure is already cached");
const anchor = '"./assets/official-exams/113-science-q10-ocean-floor-age-options.png"';
if (!sw.includes(anchor)) throw new Error("Could not find the cache anchor");
sw = sw.replace('const CACHE="cap-quiz-v7.3.15"', 'const CACHE="cap-quiz-v7.3.16"').replace(anchor, `${anchor},"./assets/official-exams/${figure}"`);
await writeFile(path, sw);
console.log("Added the 113 Science question 15 map to offline cache v7.3.16.");
