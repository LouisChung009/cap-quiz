import { readFile, writeFile } from "node:fs/promises";

for (const path of ["app.js", "sw.js"]) {
  const source = await readFile(path, "utf8");
  const count = source.split("mission-questions.json?v=3").length - 1;
  if (count === 0) throw new Error(`No mission bank cache references found in ${path}`);
  await writeFile(path, source.replaceAll("mission-questions.json?v=3", "mission-questions.json?v=4"));
}
console.log("Bumped mission question-bank URL to v=4 in the app and service worker.");
