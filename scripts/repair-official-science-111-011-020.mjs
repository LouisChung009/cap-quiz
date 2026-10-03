import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const batch = rows.filter(row => row.subject === "自然" && row.source?.year === 111 && row.source.questionNumber >= 11 && row.source.questionNumber <= 20);
if (batch.length !== 10) throw new Error(`Expected 10 questions, got ${batch.length}`);
const byId = Object.fromEntries(batch.map(row => [row.id, row]));
const update = (id, values) => {
  if (!byId[id]) throw new Error(`Missing ${id}`);
  Object.assign(byId[id], values);
};
const figure = (id, file, alt) => update(id, {
  questionImage: `./assets/official-exams/${file}`,
  questionImages: [`./assets/official-exams/${file}`],
  imageAlt: alt,
  requiresImage: true,
  requiresContext: false
});
const noFigure = id => update(id, {
  questionImage: "",
  questionImages: [],
  imageAlt: "",
  requiresImage: false,
  requiresContext: false
});

update("OFF-0407", {
  question: "【表二：血型—基因型】A 型為 IᴬIᴬ 或 Iᴬi；B 型為 IᴮIᴮ 或 Iᴮi；AB 型為 IᴬIᴮ；O 型為 ii。【表三：父親／母親血型】甲 A／A、乙 A／B、丙 O／AB、丁 O／O。在不考慮突變的情況下，哪一組不可能生下 O 型子女？",
  solutionSteps: ["O 型子女基因型必須是 ii，因此父母各須傳下一個 i 等位基因。", "檢查四組：甲的 A×A、乙的 A×B 都有可能是帶 i 的異型合子；丁 O×O 一定可生 O 型。", "丙為 O（ii）×AB（IᴬIᴮ）；AB 親本沒有 i 可傳，子女不可能為 ii，故選丙 C。"]
});
noFigure("OFF-0407");

update("OFF-0408", {
  question: "【四組實驗資料】實驗 1：斜面夾角20°、長100 cm、石塊重2 kgw；實驗 2：20°、50 cm、2 kgw；實驗 3：40°、100 cm、4 kgw；實驗 4：40°、50 cm、4 kgw。小蘭讓石塊沿斜面滑下並撞擊模型房屋，想探討不同因素對破壞程度的影響。哪項敘述正確？",
  solutionSteps: ["公平比較一個變因時，其他條件需相同。實驗1與2的夾角同為20°、石塊同為2 kgw，只有斜面長度不同。", "因此 A 所說實驗1、2控制石塊重量不變正確。實驗3、4長度分別為100與50 cm，故B錯。", "比較夾角應使用夾角不同但長度、重量相同的組別；比較斜面長度也須控制夾角及重量。題列配對2與4、1與3均同時改變多項條件，不能單獨判定因果。"]
});
noFigure("OFF-0408");

noFigure("OFF-0409");
noFigure("OFF-0410");
figure("OFF-0411", "111-science-q15-aquifer.png", "地層剖面中含水岩層、河流及甲乙丙丁交界位置");
figure("OFF-0412", "111-science-q16-magnetic-grid.png", "載流直導線、電流方向及方格上的 P、Q 位置");
figure("OFF-0413", "111-science-q17-microscopes.png", "複式顯微鏡與解剖顯微鏡的外觀比較");
update("OFF-0414", {
  question: "以榕樹為例，能進行光合作用的細胞數目（甲）與能進行呼吸作用的細胞數目（乙）相比，何者正確，原因為何？"
});
noFigure("OFF-0414");
noFigure("OFF-0415");
figure("OFF-0416", "111-science-q20-climate-chart.png", "近30年臺北與恆春各月平均氣溫折線及平均降雨量柱狀圖");

for (const row of batch) {
  if (!row.explanation || !row.solutionSteps?.length || row.options?.length !== 4) throw new Error(`Incomplete ${row.id}`);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source data and image/context metadata for 111 Natural Science Q11–20.");
