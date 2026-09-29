import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = { 國文: "chinese", 英文: "english", 數學: "math", 自然: "science", 社會: "social" };
const updated = [];
for (const [subject, file] of Object.entries(files)) {
  const sourcePath = join(root, "reports", `${subject}-base-explanations-reviewed.json`);
  const fallbackPath = join(root, "reports", `${subject}-base-explanations.json`);
  let explanations;
  try {
    explanations = JSON.parse(await readFile(sourcePath, "utf8"));
  } catch {
    try {
      explanations = JSON.parse(await readFile(fallbackPath, "utf8"));
    } catch {
      const current = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
      explanations = current.map(item => ({ id: item.id, explanation: item.explanation, solutionSteps: item.solutionSteps, teacherTip: item.teacherTip }));
    }
  }
  const replacementPath = join(root, "reports", `${subject}-replacement-0601-0700.json`);
  if (subject === "英文") {
    try {
      const replacements = JSON.parse(await readFile(replacementPath, "utf8"));
      const byId = new Map(explanations.map(item => [item.id, item]));
      for (const item of replacements) byId.set(item.id, item);
      explanations = [...byId.values()];
    } catch {}
  }
  const basePath = join(root, "data", `${file}.json`);
  const base = JSON.parse(await readFile(basePath, "utf8"));
  if (subject === "英文") {
    const replacementById = new Map(explanations.map(item => [item.id, item]));
    const replacementRows = base.map(question => {
      const replacement = replacementById.get(question.id);
      return replacement ? { ...question, ...replacement, review: question.review } : question;
    });
    const replacementRange = replacementRows.filter(question => /^ENG-(?:06(?:0[1-9]|[1-9]\d)|0700)$/.test(question.id));
    if (replacementRange.length !== 100 || replacementRange.some(question => /In report\s+\d+/i.test(question.question))) {
      throw new Error("英文 ENG-0601–0700: 替換題數或題幹不合預期");
    }
    await writeFile(basePath, `${JSON.stringify(replacementRows, null, 2)}\n`, "utf8");
    updated.push({ subject, count: replacementRows.length, replaced: replacementRange.length });
    continue;
  }
  const byId = new Map(explanations.map(item => [item.id, item]));
  if (byId.size !== 1000 || base.length !== 1000) throw new Error(`${subject}: 解析或題目數不是 1000`);
  const result = base.map(question => {
    const explanation = byId.get(question.id);
    if (!explanation) throw new Error(`${subject}: 缺少 ${question.id} 的解析`);
    if (/UNRESOLVED|人工覆核|report\s+\d+/i.test(`${explanation.explanation} ${(explanation.solutionSteps || []).join(" ")} ${explanation.teacherTip}`)) throw new Error(`${question.id}: 仍有未解材料引用`);
    if (question.answer < 0 || question.answer > 3 || !question.options[question.answer]) throw new Error(`${question.id}: 正解選項無效`);
    if (!Array.isArray(explanation.solutionSteps) || explanation.solutionSteps.length < 3 || explanation.solutionSteps.some(step => !String(step).trim())) throw new Error(`${question.id}: 解題步驟不足`);
    byId.delete(question.id);
    return { ...question, explanation: explanation.explanation, solutionSteps: explanation.solutionSteps, teacherTip: explanation.teacherTip };
  });
  if (byId.size) throw new Error(`${subject}: 解析含未知 ID ${[...byId.keys()].slice(0, 5).join(", ")}`);
  await writeFile(basePath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  updated.push({ subject, count: result.length });
}
console.log(JSON.stringify(updated, null, 2));
