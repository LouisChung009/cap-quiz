import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "chinese.json"), "utf8"));
const failures = [];
const item = id => rows.find(row => row.id === id);
const initialHundred = rows.filter(row => /^CHI-(?:00(?:0[1-9]|[1-9][0-9])|0100)$/.test(row.id));
if (initialHundred.length !== 100 || new Set(initialHundred.map(row => row.question.replace(/\s+/g, " ").trim())).size !== initialHundred.length || new Set(initialHundred.map(row => JSON.stringify(row.options))).size !== initialHundred.length) failures.push("CHI-0001–0100: current stems and option sets must not collapse to one repeated prompt");
for (let start = 101; start <= 1000; start += 100) {
  const end = start + 99;
  const range = rows.filter(row => {
    const number = Number(row.id.slice(-4));
    return number >= start && number <= end;
  });
  const uniqueStems = new Set(range.map(row => row.question.replace(/\s+/g, " ").trim()));
  const uniqueItems = new Set(range.map(row => `${row.question}|${[...row.options].sort().join("|")}`));
  if (range.length !== 100 || uniqueStems.size !== 100 || uniqueItems.size !== 100) failures.push(`CHI-${String(start).padStart(4, "0")}–${String(end).padStart(4, "0")}: expected 100 distinct question stems and item contents`);
}

const checks = [
  ["CHI-0005", 1, "日漸多元"],
  ["CHI-0758", 1, "老師提醒：「先讀題幹，再核對選項。」"],
  ["CHI-0759", 0, "試辦期間有安靜空間需求的學生，其作業完成比例及專注自評變化"],
  ["CHI-0175", 3, "使江岸轉為翠綠"],
  ["CHI-0770", 1, "我們依序檢查每份資料。"],
  ["CHI-0879", 3, "不懂時向身分或學問不如自己的人請教"],
  ["CHI-0885", 3, "我讀了《背影》這篇文章。"],
  ["CHI-0934", 3, "行前請準備以下用品：雨衣、飲水、藥品以及識別證。"],
  ["CHI-0970", 2, "她提醒大家：明天記得帶水壺。"],
];
for (const [id, answer, option] of checks) {
  const row = item(id);
  if (!row || row.answer !== answer || row.options?.[answer] !== option || new Set(row.options).size !== 4 || row.solutionSteps?.length < 3) failures.push(`${id}: answer, options, or worked explanation mismatch`);
}

if (item("CHI-0102")?.unit !== "閱讀理解" || item("CHI-0102")?.knowledgePoint !== "語句含意與語境推論") failures.push("CHI-0102: non-idiom proverb needs an accurate classification");
if (item("CHI-0201")?.answer !== 1 || item("CHI-0201")?.options?.[1] !== "表面光亮，能映照景物" || item("CHI-0201")?.explanation?.includes("地面平整")) failures.push("CHI-0201: explanation and keyed feature must not infer unsupported surface flatness");
if (item("CHI-0114")?.answer !== 3 || item("CHI-0114")?.options?.[3] !== "承接，連接前後相續的動作" || !item("CHI-0114")?.explanation?.includes("本題問句間關係")) failures.push("CHI-0114: distinguish the contextual relation from multiple possible glosses of 而");
if (item("CHI-0122")?.answer !== 2 || !item("CHI-0122")?.options?.[2]?.includes("必定增加") || !item("CHI-0122")?.explanation?.includes("相同班級與統計口徑")) failures.push("CHI-0122: make the average comparison and its shared-population assumption explicit");
if (!item("CHI-0758")?.question?.includes("標示老師完整原話") || !item("CHI-0758")?.options?.[2]?.includes("「提醒」") || !item("CHI-0758")?.options?.[3]?.endsWith("選項」。")) failures.push("CHI-0758: direct quotation scope and end punctuation must yield a unique answer");
if (!item("CHI-0885")?.options?.[2]?.includes("這支《鉛筆》") || !item("CHI-0885")?.explanation?.includes("語境明確不是作品名稱")) failures.push("CHI-0885: ordinary pencil context must rule out a possible work title");
if (!item("CHI-0192")?.explanation.includes("此時我軍士氣仍盛")) failures.push("CHI-0192: explanation must distinguish enemy and allied morale");
if (!item("CHI-0444")?.question.includes("只有把每次實驗的條件記下來")) failures.push("CHI-0444: necessary-condition sentence is ungrammatical");
if (item("CHI-0969")?.unit !== "閱讀與語文應用") failures.push("CHI-0969: non-classical reading item has a wrong unit label");
if (!item("CHI-0005")?.solutionSteps?.[1]?.includes("沒有提供變化速度")) failures.push("CHI-0005: explanation must not overstate the pace of change");
if (!item("CHI-0759")?.explanation?.includes("不能單憑此資料證明開館造成改善")) failures.push("CHI-0759: distinguish direct supporting evidence from causal proof");
if (!item("CHI-0934")?.options?.[1]?.includes("以下用品；") || !item("CHI-0934")?.solutionSteps?.[2]?.includes("應改用冒號")) failures.push("CHI-0934: ensure the competing list-introduction punctuation is unambiguously incorrect");
if (item("CHI-0899")?.answer !== 3 || !item("CHI-0899")?.options?.[0]?.includes("老師說；") || !item("CHI-0899")?.options?.[1]?.endsWith("，」") || !item("CHI-0899")?.explanation?.includes("只有 D 同時符合")) failures.push("CHI-0899: direct-quotation punctuation must have one clearly correct option");
if (!item("CHI-0914")?.question?.includes("大家仍留在教室") || !item("CHI-0914")?.explanation?.includes("大家仍留在教室")) failures.push("CHI-0914: stem and explanation must contain the same contrast cue");
if (item("CHI-1000")?.answer !== 1 || !item("CHI-1000")?.question?.includes("末項前的連接詞前不加標點") || !item("CHI-1000")?.solutionSteps?.[2]?.includes("只有 B 符合該規則")) failures.push("CHI-1000: state an explicit list-punctuation rule that yields a unique answer");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Chinese review-driven item repairs passed.");
