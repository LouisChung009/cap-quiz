import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const contextPattern = /根據(?:本文|上文|文章|選文|材料|短文|報導|資料|上述)|依據(?:本文|上文|文章|選文|材料|短文|報導|資料)|本文(?:中|主旨|作者|提到|認為|敘述|寫作)|文中(?:提到|指出|敘述|作者)|這篇(?:文章|短文)|由本文|閱讀(?:本文|上文|下文|文章|選文|材料)|according to (?:the|this) (?:text|article|reading|passage)|in the (?:text|article|reading|passage)|the writer|the author/i;
const visualPattern = /下圖|附圖|如圖|右圖|左圖|圖中|圖示|圖表|地圖|流程圖|關係圖|統計圖|示意圖|照片|影像|圖片|哪張圖|何種圖|位置圖|剖面圖|坐標圖|座標圖|實驗裝置|圖\s*[（(]|表\s*[（(]|依圖|據圖|由圖|判讀圖|圖形|圖像|according to .*?(?:chart|graph|map|diagram|picture|figure)|shown below|following (?:chart|graph|map|diagram|picture|figure)|which picture|what does the graph/i;
let contextCount = 0;
let visualCount = 0;
let imageOptionsCount = 0;
for (const item of rows) {
  if (item.sourceType !== "官方歷屆真題") continue;
  const hasOcrArtifacts = /\(cid:\d+\)/i.test(`${item.question} ${item.options?.join(" ") || ""}`);
  item.question = String(item.question || "").replaceAll("\\n", "\n").replace(/\s*\d+\s*試題結束.*$/u, "").replace(/\s*請翻頁繼續作答.*$/u, "").replace(/\(cid:\d+\)/gi, "").trim();
  item.options = (item.options || []).map(option => String(option || "").replace(/\s*\d+\s*試題結束.*$/u, "").replace(/\s*請翻頁繼續作答.*$/u, "").replace(/\(cid:\d+\)/gi, "").trim());
  const context = Boolean(item.requiresContext || contextPattern.test(item.question));
  if (context) {
    item.requiresContext = true;
    item.requiresImage = true;
    contextCount += 1;
  }
  const fallbackOptions = item.options.length !== 4 || item.options.some(option => !option || /\(cid:|試題結束|請翻頁/i.test(option)) || new Set(item.options).size !== 4;
  if (fallbackOptions) {
    item.options = ["A", "B", "C", "D"];
    item.optionsInImage = true;
    item.requiresImage = true;
    imageOptionsCount += 1;
  }
  const visual = Boolean(context || item.optionsInImage || fallbackOptions || hasOcrArtifacts || visualPattern.test(`${item.question} ${item.options.join(" ")}`));
  if (visual) {
    item.requiresImage = true;
    visualCount += 1;
  }
  const images = item.questionImages?.length ? item.questionImages : [item.questionImage].filter(Boolean);
  item.questionImages = images.filter(image => existsSync(join(root, image.replace(/^\.\//, ""))));
  if (!item.questionImages.length) throw new Error(`${item.id}: 題目所需試卷頁不存在`);
  if (context && item.questionImages.length < 1) throw new Error(`${item.id}: 引用共用材料但缺少題面`);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ official: rows.filter(item => item.sourceType === "官方歷屆真題").length, contextCount, visualCount, imageOptionsCount }, null, 2));
