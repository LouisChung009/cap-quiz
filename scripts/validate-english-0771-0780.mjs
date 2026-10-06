import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0771", 3, "have been inspecting", "still checking", "延續到現在"],
  ["ENG-0772", 0, "where", "the team plans its next tournament", "結構完整"],
  ["ENG-0773", 1, "2:17 p.m.", "2:12", "加 5 分鐘"],
  ["ENG-0774", 1, "had", "cannot join", "第二類條件句"],
  ["ENG-0775", 2, "clearly", "spoke", "副詞"],
  ["ENG-0776", 3, "plant", "little shade", "增加樹蔭"],
  ["ENG-0777", 0, "hasn't she", "has already submitted", "助動詞 has"],
  ["ENG-0778", 0, "A first version of the work", "draft due Tuesday", "尚非完成稿"],
  ["ENG-0779", 0, "until", "next Wednesday", "延後到的日期"],
  ["ENG-0780", 1, "conflicting", "did not match", "互相矛盾"],
];
const failures = [];
for (const [id, answer, option, stemClue, solutionClue] of expected) {
  const row = rows.find(item => item.id === id);
  if (!row || row.answer !== answer || row.options?.[answer] !== option || row.options?.length !== 4) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question.includes(stemClue) || !row.explanation || !row.solutionSteps?.some(step => step.includes(solutionClue)) || row.solutionSteps.length < 3 || !row.teacherTip || row.relatedWords?.length < 2) {
    failures.push(`${id}: missing evidence or teaching explanation`);
  }
}
const tagQuestion = rows.find(row => row.id === "ENG-0775");
if (!tagQuestion?.teacherTip.includes("spoke")) failures.push("ENG-0775: teacher tip tense does not match the past-tense stem");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0771–0780 answer keys, evidence, and teaching explanations passed.");
