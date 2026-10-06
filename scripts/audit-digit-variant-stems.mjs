import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const subjects = ["chinese", "english", "math", "science", "social"];
const reportPath = process.argv[2];
const report = [
  "# 去數字化後相同題幹稽核",
  "",
  "此報表用來找出題目只替換數字、其餘文字相同的候選群組；命中不等於缺陷，需依考點、解題策略與情境判斷。",
  "",
];
let totalGroups = 0;
let totalRows = 0;
const summary = [];

for (const subject of subjects) {
  const rows = JSON.parse(await readFile(join(root, "data", `${subject}.json`), "utf8"));
  const groups = new Map();
  for (const row of rows) {
    const normalized = String(row.question || "")
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[0-9０-９一二三四五六七八九十百千兩]+(?:[.,．][0-9０-９]+)?/g, "#")
      .trim();
    groups.set(normalized, [...(groups.get(normalized) || []), row]);
  }
  const repeated = [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length || a[1][0].id.localeCompare(b[1][0].id));
  totalGroups += repeated.length;
  totalRows += repeated.reduce((count, [, items]) => count + items.length, 0);
  summary.push({ subject, groups: repeated.length, rows: repeated.reduce((count, [, items]) => count + items.length, 0) });
  report.push(`## ${subject}：${repeated.length} 組，涉及 ${repeated.reduce((count, [, items]) => count + items.length, 0)} 題`, "");
  for (const [, items] of repeated) {
    report.push(`### ${items.map(item => item.id).join("、")}`);
    for (const item of items) {
      report.push(`- ${item.id}｜${item.unit}｜${item.knowledgePoint}｜${item.difficulty}｜${item.question}`);
    }
    report.push("");
  }
}

report.splice(4, 0, `掃描範圍：五科 5,000 題；候選群組 ${totalGroups} 組，涉及 ${totalRows} 題。`, "");
if (reportPath) {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${report.join("\n")}\n`, "utf8");
}
const expected = process.env.EXPECTED_DIGIT_VARIANT_COUNTS;
if (expected) {
  const expectedCounts = JSON.parse(expected);
  const mismatches = summary.filter(item => expectedCounts[item.subject] !== item.groups);
  if (mismatches.length || Object.keys(expectedCounts).length !== subjects.length) {
    console.error(`數字變式題幹候選群組數量異動：${JSON.stringify(summary)}`);
    process.exit(1);
  }
}
console.log(`掃描完成：候選群組 ${totalGroups} 組、${totalRows} 題${reportPath ? `；報表 ${reportPath}` : ""}`);
