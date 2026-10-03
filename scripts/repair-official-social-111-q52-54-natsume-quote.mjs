import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const oldText = "當我看到自己出了一個全黑的物體時真是吃驚";
const newText = "當我看到自己吐出一個全黑的物體時真是吃驚";
const source = await readFile(path, "utf8");
const occurrences = source.split(oldText).length - 1;

if (occurrences !== 3) throw new Error(`Expected 3 OCR errors in 111 Social Q52–54, found ${occurrences}`);

await writeFile(path, source.replaceAll(oldText, newText));
console.log("Repaired the shared Natsume Soseki quotation in 111 Social Q52–54.");
