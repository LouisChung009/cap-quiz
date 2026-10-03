import fs from "node:fs";

const file = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const repairs = new Map([
  ["OFF-0397", { answer: 0, explanation: "答案 A。百帕（hPa）是氣壓單位，1 hPa 等於 100 Pa；氣象圖常用它表示大氣壓力。溫度用 °C、風速用 m/s 或 km/h 表示，降雨機率則以百分比表示，所以其餘三項都不是百帕的物理量。" }],
  ["OFF-0398", { answer: 2, explanation: "答案 C。蓮霧下落時高度降低，重力位能減少；同時速率增加，動能增加。忽略空氣阻力時，減少的重力位能主要轉為動能；實際下落仍會有少量能量因空氣阻力轉為熱。題幹問造成速率增加的能量來源，因此是重力位能。" }],
  ["OFF-0399", { answer: 3, explanation: "答案 D。氧化是物質與氧等氧化劑反應的化學變化。氮氣在一般保存條件下化學活性低，不易和畫冊材料反應，可置換容器內較活潑的氧氣、降低氧化機會。題目考的是化學性質，不是密度、比熱或沸點。" }],
]);

for (const [id, repair] of repairs) {
  const item = questions.find(question => question.id === id);
  if (!item) throw new Error(`Missing ${id}`);
  if (item.source?.year !== 111 || item.subject !== "自然" || item.answer !== repair.answer) {
    throw new Error(`Unexpected official source or answer index for ${id}`);
  }
  item.explanation = repair.explanation;
}

fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Repaired ${repairs.size} official 111 science explanations.`);
