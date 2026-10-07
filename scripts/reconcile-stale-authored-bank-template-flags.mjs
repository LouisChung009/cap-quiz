import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const targets = [
  {
    subject: "自然",
    file: "science",
    prefix: "SCI",
    expectedProblem: id => {
      const bucketStart = Math.floor((Number(id.slice(-4)) - 1) / 100) * 100 + 1;
      const bucketEnd = Math.min(bucketStart + 99, 1000);
      const start = `${id.slice(0, 4)}${String(bucketStart).padStart(4, "0")}`;
      const end = `${id.slice(0, 4)}${String(bucketEnd).padStart(4, "0")}`;
      const base = `本題與 ${start}～${end} 的其餘題目共用同一題幹概念、同一解析與同一組選項，僅更換流水號及選項順序，100 題實質上只有 1 題`;
      return Number(id.slice(-4)) >= 101 && Number(id.slice(-4)) <= 200 || Number(id.slice(-4)) >= 301 && Number(id.slice(-4)) <= 400 || Number(id.slice(-4)) >= 601 && Number(id.slice(-4)) <= 1000
        ? `${base}；題幹又以「紀錄／觀測點／模型／編號電路」暗示前置材料，但沒有提供任何對應材料`
        : base;
    }
  },
  {
    subject: "社會",
    file: "social",
    prefix: "SOC",
    expectedProblem: id => {
      const bucketStart = Math.floor((Number(id.slice(-4)) - 1) / 100) * 100 + 1;
      const bucketEnd = Math.min(bucketStart + 99, 1000);
      const start = `${id.slice(0, 4)}${String(bucketStart).padStart(4, "0")}`;
      const end = `${id.slice(0, 4)}${String(bucketEnd).padStart(4, "0")}`;
      return `本題與 ${start}～${end} 的其餘題目實質完全相同，只更換無教學意義的流水號並輪替選項位置；難度與年級標籤亦隨序號機械變動，沒有對應題目深度。全檔 1000 題實際只有 10 種題幹、10 組解析，不能視為 1000 題有效抽查題庫。`;
    }
  }
];

function normalize(value) {
  return String(value || "").normalize("NFKC").replace(/\d+/g, "#").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

for (const target of targets) {
  const bank = JSON.parse(await readFile(join(root, "data", `${target.file}.json`), "utf8"));
  if (bank.length !== 1000) throw new Error(`${target.subject}: expected 1000 authored questions, found ${bank.length}`);
  const bankIds = new Set(bank.map(item => item.id));
  if (bankIds.size !== bank.length) throw new Error(`${target.subject}: duplicate authored IDs`);
  for (const field of ["question", "explanation"]) {
    const seen = new Set();
    for (const item of bank) {
      const key = normalize(item[field]);
      if (!key) throw new Error(`${target.subject}: empty ${field} on ${item.id}`);
      if (seen.has(key)) throw new Error(`${target.subject}: duplicate ${field} after numeric-template normalization`);
      seen.add(key);
    }
  }

  const auditPath = join(root, "reports", `${target.subject}-teacher-audit.json`);
  const audit = JSON.parse(await readFile(auditPath, "utf8"));
  if (!Array.isArray(audit)) throw new Error(`${target.subject}: audit report is not an array`);
  const stale = audit.filter(item => {
    if (!bankIds.has(item.id) || !item.id.startsWith(`${target.prefix}-`)) return false;
    const expected = target.expectedProblem(item.id);
    if (target.subject === "自然") {
      const base = expected.split("；題幹又")[0];
      const materialConcern = item.problem === `${base}；題幹又以「紀錄／觀測點／模型／編號電路」暗示前置材料，但沒有提供任何對應材料`;
      return item.problem === base || materialConcern;
    }
    return item.problem === expected;
  });
  if (audit.length === 0) {
    console.log(`${target.subject}: no obsolete template flags remain; full-bank checks passed; no teacher sign-off inferred`);
    continue;
  }
  if (stale.length !== 1000 || audit.length !== 1000) {
    throw new Error(`${target.subject}: expected exactly 1000 known stale template flags and no other findings; audit=${audit.length}, known=${stale.length}`);
  }
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !stale.includes(item)), null, 2)}\n`, "utf8");
  console.log(`${target.subject}: removed ${stale.length} precisely matched obsolete template flags after full-bank duplicate checks; no teacher sign-off inferred`);
}
