import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [1, "受光部分，因為形成了澱粉"], [2, "小塊密度為 2.7 g/cm³，會沉在水中"],
  [3, "另一燈泡仍亮，電池兩端電壓仍為 6 V"], [0, "東方地平線附近，約日落時升起"],
  [1, "老鷹"], [2, "葉片散出的水蒸氣在袋內凝結成水珠"], [3, "1 A；8 V"],
  [0, "3"], [1, "冷鋒，冷空氣推進使暖空氣抬升"], [1, "50%"],
  [1, "用磁鐵吸引鐵粉"], [2, "肺動脈"], [2, "乙音叉發出的聲音音調較高"],
  [3, "5 牛頓"], [0, "地軸傾斜使北半球此時朝向太陽"], [1, "1,000 千焦"],
  [2, "160 cm³"], [3, "使細胞較容易攝取葡萄糖，並促進肝臟將部分葡萄糖轉成肝糖儲存"],
  [0, "2 m"], [1, "大型褶皺山脈"],
];
const units = new Map([["SCI-0204", "地球科學"], ["SCI-0209", "地球科學"], ["SCI-0220", "地球科學"]]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(201 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  const [answer, answerText] = expected[offset];
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== answerText) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing prompt or worked explanation`);
  if (units.has(id) && row.unit !== units.get(id)) failures.push(`${id}: incorrect subject unit (${row.unit})`);
}
const seriesQuestion = rows.find(row => row.id === "SCI-0207");
if (!seriesQuestion?.question.includes("串聯") || !seriesQuestion.explanation.includes("總電阻") || !seriesQuestion.solutionSteps?.some(step => step.includes("電壓降"))) {
  failures.push("SCI-0207: series-circuit multi-step reasoning is missing");
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0201–0220 answer keys, explanations, and subject units passed.");
