import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const figures = new Map([
  [21, "./assets/official-exams/114-science-q21-polymer-charts.png"],
  [23, "./assets/official-exams/114-science-q23-isobar-options.png"],
  [24, "./assets/official-exams/114-science-q24-bird-table.png"],
  [25, "./assets/official-exams/114-science-q25-battery-table.png"],
  [27, "./assets/official-exams/114-science-q27-antique-microscope.png"],
]);
const corrections = {
  21: {
    question: "研究者將 PET、POM、PP 三種熱塑性聚合物容器浸入高濃度乙醇，分別在 50°C 與 70°C 下測量質量變化率（圖十一）。質量變化率越大表示容器耗損越多。僅依據圖中資料，下列說明何者最合理？",
  },
  22: {
    question: "某植物莖的維管束中，甲是外側韌皮部，乙是內側木質部。若要用儀器探測蒸散作用速率，應探測哪一部位及其理由最合理？",
  },
  27: {
    question: "博物館展示一臺 19 世紀的骨董複式顯微鏡（圖十三），甲為物鏡、乙為調節輪、丙為載物臺、丁為反光鏡。比較它與現代複式顯微鏡：現代物鏡仍為物鏡、調節輪仍調節焦距、載物臺仍放置標本；現代光圈調節進光量，而骨董顯微鏡的反光鏡用來改變光線方向。哪一組構造功能差異最大？",
    options: ["甲：物鏡", "乙：調節輪", "丙：載物臺", "丁：光圈"],
  },
  28: {
    question: "棕色碘液被還原後會變無色。研究者分別將維生素 C 溶液、水與綠茶茶水加入碘液，三支試管均振盪後觀察：甲（維生素 C）和丙（綠茶）試管中的棕色消失；乙（加水對照組）仍呈棕色。僅依據本實驗結果，下列推論何者最合理？",
  },
  29: {
    question: "甲、乙、丙三支相同試管各裝有互不相溶的 X、Y 液體。靜置時 X 都在下層，Y 在上層，故 X 的密度大於 Y。三管液體體積如下：甲為 X 5 mL、Y 5 mL；乙為 X 3 mL、Y 7 mL；丙為 X 7 mL、Y 3 mL。若各試管加液後總質量分別為 m甲、m乙、m丙，何者正確？",
    options: ["m甲＝m乙＝m丙", "m甲＞m丙＞m乙", "m乙＞m甲＞m丙", "m丙＞m甲＞m乙"],
    explanation: "答案 D「m丙＞m甲＞m乙」。相同試管的質量相同，總質量比較只需比較液體。令 X、Y 密度分別為 ρX、ρY，且 ρX＞ρY。甲有 5ρX＋5ρY，乙有 3ρX＋7ρY，丙有 7ρX＋3ρY；三者總體積同為 10 mL，X 越多總質量越大，因此丙＞甲＞乙。",
    solutionSteps: ["由分層可判斷下層 X 密度較大，所以 ρX＞ρY。", "三管液體總體積相同；甲、乙、丙的 X 依序為 5、3、7 mL。", "以較多的高密度 X 判斷液體質量：丙最大、甲其次、乙最小，選 D。"],
    teacherTip: "混合液體比較質量時先利用分層判密度，再確認各液體總體積是否相同。",
  },
  30: {
    question: "孔雀魚的黑眼睛、紅眼睛由一對遺傳因子控制，A 為顯性、a 為隱性。兩隻黑眼親魚甲、乙交配，生出黑眼與紅眼子代；再從黑眼子代中任選兩隻標為丙、丁。未發生突變，甲、乙、丙、丁中哪兩隻的基因型一定相同？",
    explanation: "答案 A「甲、乙」。紅眼為隱性表現，基因型必為 aa；子代得到一個 a 來自每一位親代，因此兩隻黑眼親代都必須帶有 a。親代仍表現黑眼，故兩者皆為 Aa。黑眼子代丙、丁可能是 AA 或 Aa，不能確定與彼此或親代相同。",
    solutionSteps: ["黑眼親代生出紅眼子代，證明紅眼基因型為 aa，且每位親代都提供 a。", "親代本身是黑眼，需至少有一個顯性 A；所以甲、乙都只能是 Aa。", "黑眼子代可能是 AA 或 Aa，因此只有甲、乙基因型一定相同，選 A。"],
  },
};
for (let number = 21; number <= 30; number += 1) {
  const row = rows.find(item => item.subject === "自然" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114自然第${number}題`);
  const correction = corrections[number];
  if (correction) Object.assign(row, correction);
  const figure = figures.get(number);
  row.questionImage = figure ?? null;
  row.questionImages = figure ? [figure] : [];
  row.requiresImage = Boolean(figure);
  row.requiresContext = false;
  row.imageAlt = figure ? `114年會考自然第${number}題專用圖表` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Science Q21–30 materials and figure dependencies.");
