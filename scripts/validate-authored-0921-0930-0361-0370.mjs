import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const english = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const science = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expectations = {
  english: [
    ["ENG-0921", 0, "protect"], ["ENG-0922", 2, "visited"], ["ENG-0923", 1, "Wednesday at 10 a.m."],
    ["ENG-0924", 1, "to keep"], ["ENG-0925", 0, "from"], ["ENG-0926", 3, "clearer"],
    ["ENG-0927", 0, "Add the milk to the shopping list"], ["ENG-0928", 0, "is updated"],
    ["ENG-0929", 1, "clear away"], ["ENG-0930", 2, "yet"],
  ],
  science: [
    ["SCI-0361", 3, "環境容納量"], ["SCI-0362", 0, "甲，60 W；乙，50 W"], ["SCI-0363", 1, "約為原來兩倍"],
    ["SCI-0364", 2, "小球具有慣性，傾向維持原有運動狀態"], ["SCI-0365", 3, "抗藥個體較能存活並繁殖，比例因而增加"],
    ["SCI-0366", 0, "1.4 kWh"], ["SCI-0367", 1, "記憶細胞保留對抗原的辨識能力"],
    ["SCI-0368", 2, "大陸吹向海洋"], ["SCI-0369", 2, "放出熱量，使周圍升溫"], ["SCI-0370", 3, "DNA 與蛋白質"],
  ],
};
const requiredFiles = ["question", "explanation", "teacherTip"];
const scienceRevisions = new Map([
  ["SCI-0364", ["低摩擦小車", "小球仍向前滾動", "慣性"]],
  ["SCI-0366", ["每天使用 5 小時", "連續使用 7 天", "1.4 kWh"]],
  ["SCI-0367", ["首次接種後抗體緩慢上升", "追加接種後", "更早且更大量增加"]],
  ["SCI-0368", ["1024 百帕", "1012 百帕", "大陸吹向海洋"]],
]);
const failures = [];
for (const [label, rows] of [["English", english], ["Science", science]]) {
  for (const [id, answer, expectedOption] of expectations[label.toLowerCase()]) {
    const item = rows.find(row => row.id === id);
    if (!item) {
      failures.push(`${id}: missing`);
      continue;
    }
    if (item.options?.length !== 4 || item.answer !== answer || item.options[answer] !== expectedOption) failures.push(`${id}: answer/options mismatch`);
    if (requiredFiles.some(field => !item[field]) || item.solutionSteps?.length < 3) failures.push(`${id}: missing content or worked solution`);
    if (item.requiresContext && !(item.contextText || item.questionImages?.length || item.questionImage)) failures.push(`${id}: missing required reading material`);
    if (label === "Science" && scienceRevisions.has(id)) {
      const evidence = `${item.question} ${item.explanation} ${item.solutionSteps.join(" ")}`;
      if (scienceRevisions.get(id).some(clue => !evidence.includes(clue))) failures.push(`${id}: revised applied context/evidence is missing`);
    }
    if (id === "SCI-0364" && item.options.some(option => !option.includes("小球") || /乘客|身體/.test(option))) failures.push(`${id}: options must stay within the ball-and-cart context`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("ENG-0921–0930 and SCI-0361–0370 answer keys, four options, context, and worked explanations passed.");
