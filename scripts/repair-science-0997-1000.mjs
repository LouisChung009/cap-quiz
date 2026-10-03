import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/science.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["八年級下", "生物", "孟德爾分離律", "中等", "豌豆植株的基因型為 Tt，形成生殖細胞時，等位基因 T 與 t 如何分配？", ["每個生殖細胞都同時得到 T 和 t", "一半生殖細胞得到 T，另一半得到 t", "所有生殖細胞都只得到 T", "只有受精後才會出現 T 或 t"], 1, "形成配子時，成對的等位基因分離；每個配子只帶其中一個等位基因。因此 Tt 個體在理想條件下約有一半配子帶 T、一半帶 t。答案 B。", ["找出親本的等位基因組合為 Tt。", "配子形成時 T 與 t 分離，每個配子只取得其中一個。", "兩種配子比例約各半，答案 B。"], "分離的是同一基因座上的等位基因；配子不是同時帶有一對等位基因。"],
  ["九年級上", "生物", "DNA 半保留複製", "中等", "一個 DNA 分子完成一次半保留複製後，形成的兩個子代 DNA 分子各有何特徵？", ["各含一條原有股與一條新合成股", "各含兩條原有股，沒有新股", "一個全由原有股組成，另一個全由新股組成", "兩個子代都只含一條 DNA 股"], 0, "半保留複製時，親代 DNA 的兩條股分開，各自作為模板合成互補新股。複製後的每個 DNA 分子都保留一條親代股並含一條新股。答案 A。", ["辨認 DNA 先由兩條股分開。", "每條舊股分別作模板合成互補的新股。", "兩個子代各含一舊一新兩條股，答案 A。"], "半保留描述每個子代 DNA 的組成，不是指只有一半的 DNA 完成複製。"],
  ["九年級上", "生物", "性聯遺傳與 X 染色體", "進階", "某隱性性聯性狀的等位基因位於 X 染色體。父親的 X 染色體帶有此等位基因，兒子通常會從父親繼承哪條性染色體？", ["帶該等位基因的 X，因此兒子必定由父親得到此性狀", "父親的 Y，因此不會由父親取得該 X 上的等位基因", "父親的兩條性染色體都會同時傳給兒子", "父親的 X 與 Y 會在受精時融合成一條"], 1, "兒子通常由父親取得 Y 染色體、由母親取得 X 染色體。父親 X 染色體上的等位基因不會直接傳給兒子；父親的 X 通常傳給女兒。答案 B。", ["確認題目問父親傳給兒子的性染色體。", "一般情況下父親將 Y 傳給兒子，將 X 傳給女兒。", "兒子不會由父親直接取得該 X 聯等位基因，答案 B。"], "此判斷限於一般 XX/XY 遺傳模式；性聯不等於性狀只出現在單一性別。"],
  ["九年級上", "生物", "基因突變與蛋白質", "中等", "某基因的一個 DNA 鹼基被替換，但替換後的密碼子仍指定相同胺基酸。對此變化最合理的描述為何？", ["一定使蛋白質少一個胺基酸", "DNA 序列改變，但該位置的胺基酸可能不變", "整條染色體必定消失", "細胞立刻停止所有蛋白質合成"], 1, "鹼基替換會改變 DNA 序列，但遺傳密碼具有簡併性，不同密碼子可能指定同一胺基酸。若替換後仍指定相同胺基酸，該位置的蛋白質序列可不變。答案 B。", ["確認變化是單一鹼基替換。", "依題意，替換後密碼子仍指定原來的胺基酸。", "因此 DNA 序列改變，但此位置胺基酸可能不變，答案 B。"], "基因突變不一定改變蛋白質功能；需看變異位置及其對胺基酸序列或調控的影響。"]
];

if (rows.length !== 1000) throw new Error(`Expected 1000 items, got ${rows.length}`);
if (items.length !== 4) throw new Error(`Expected 4 repair items, got ${items.length}`);
for (let index = 0; index < items.length; index++) {
  const [gradeSemester, unit, knowledgePoint, difficulty, question, options, answer, explanation, solutionSteps, teacherTip] = items[index];
  const id = `SCI-${String(997 + index).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing ${id}`);
  if (options.length !== 4 || new Set(options).size !== 4 || solutionSteps.length !== 3 || answer < 0 || answer > 3) throw new Error(`Invalid content ${id}`);
  Object.assign(row, { gradeSemester, unit, knowledgePoint, difficulty, type: "素養題", question, options, answer, explanation, solutionSteps, teacherTip });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
