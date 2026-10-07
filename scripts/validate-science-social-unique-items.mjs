import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const checks = [
  { file: "science", start: 1, end: 100 },
  { file: "social", start: 1, end: 1000 }
];

for (const { file, start, end } of checks) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  const selected = rows.filter(row => {
    const number = Number(row.id?.match(/-(\d+)$/)?.[1]);
    return number >= start && number <= end;
  });
  if (selected.length !== end - start + 1) throw new Error(`${file}: expected ${end - start + 1} items, found ${selected.length}`);

  for (const field of ["question", "explanation"]) {
    const groups = new Map();
    for (const row of selected) {
      const normalized = String(row[field] || "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
      groups.set(normalized, [...(groups.get(normalized) || []), row.id]);
    }
    const repeated = [...groups.values()].filter(ids => ids.length > 1);
    if (repeated.length) throw new Error(`${file}: duplicate ${field}: ${repeated.slice(0, 5).map(ids => ids.join("/" )).join(", ")}`);
  }
  console.log(`${file}: ${selected.length} items have unique stems and explanations`);
}
