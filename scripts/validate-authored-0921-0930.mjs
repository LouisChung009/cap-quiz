import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const [math, social] = await Promise.all(["math", "social"].map(async subject =>
  JSON.parse(await readFile(join(root, "data", `${subject}.json`), "utf8"))));
const expected = {
  math: [["MAT-0921", 2, "1 小時 45 分"], ["MAT-0922", 3, "9"], ["MAT-0923", 0, "64"], ["MAT-0924", 1, "750"], ["MAT-0925", 2, "142°"], ["MAT-0926", 3, "11"], ["MAT-0927", 0, "3/28"], ["MAT-0928", 1, "12"], ["MAT-0929", 2, "41"], ["MAT-0930", 3, "54"]],
  social: [["SOC-0921", 1, "下降，同一筆名目收入可購買的商品與服務變少"], ["SOC-0922", 2, "負外部性"], ["SOC-0923", 3, "資料顯示兩者同時出現，但尚不能證明晨讀造成借書量增加"], ["SOC-0924", 2, "高齡人口占總人口的比率增加"], ["SOC-0925", 2, "甲地年溫差較大"], ["SOC-0926", 1, "集水區"], ["SOC-0927", 0, "市中心人工鋪面蓄熱後於夜間釋放，且郊區植被蒸散有助降溫"], ["SOC-0928", 3, "由 9,000 人增至 9,600 人，增加約 600 人"], ["SOC-0929", 0, "對照日記、稅冊與航海圖的年代、用途及可互證細節"], ["SOC-0930", 1, "港口曾參與跨區域交流"]],
};
const failures = [];
for (const [subject, rows] of Object.entries({ math, social })) {
  for (const [id, answer, text] of expected[subject]) {
    const item = rows.find(row => row.id === id);
    if (!item) { failures.push(`${id}: missing`); continue; }
    if (item.options?.length !== 4 || item.answer !== answer || item.options[answer] !== text) failures.push(`${id}: answer/options mismatch`);
    if (!item.question || !item.explanation || item.solutionSteps?.length < 3 || !item.teacherTip) failures.push(`${id}: incomplete stem or teaching explanation`);
    if (item.requiresContext && !(item.contextText || item.questionImages?.length || item.questionImage)) failures.push(`${id}: missing required material`);
  }
}
const social923 = social.find(row => row.id === "SOC-0923");
if (social923.options[2] === social923.options[3]) failures.push("SOC-0923: distractor collapsed into keyed option");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("MAT-0921–0930 and SOC-0921–0930 answer keys, explanations, materials, and repaired ambiguity passed.");
