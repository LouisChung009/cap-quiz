import { readFile } from "node:fs/promises";
import { randomInt } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const lessonSize = 10;
const roundsPerSubject = 2000;
const allIds = new Set();
let total = 0;

function shuffle(list) {
  const result = [...list];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = randomInt(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function buildDiverseLesson(questions) {
  const groups = new Map();
  shuffle(questions).forEach(item => {
    const key = `${item.unit}|${item.knowledgePoint}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return shuffle([...groups.values()]).slice(0, lessonSize).map(group => group[0]);
}

for (const file of files) {
  const questions = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  if (questions.length !== 1000) throw new Error(`${file} 不是 1000 題`);
  const stems = new Set(questions.map(item => item.question.replace(/\s+/g, "").toLowerCase()));
  if (stems.size !== questions.length) throw new Error(`${file} 有重複題幹`);
  const observed = new Set();
  let previousSignature = "";
  for (let round = 0; round < roundsPerSubject; round++) {
    const lesson = buildDiverseLesson(questions);
    const ids = lesson.map(item => item.id);
    const lessonStems = lesson.map(item => item.question.replace(/\s+/g, "").toLowerCase());
    if (new Set(ids).size !== lessonSize) throw new Error(`${file} 第 ${round + 1} 回合 ID 重複`);
    if (new Set(lessonStems).size !== lessonSize) throw new Error(`${file} 第 ${round + 1} 回合題幹重複`);
    const points = lesson.map(item => `${item.unit}|${item.knowledgePoint}`);
    if (new Set(points).size !== lessonSize) throw new Error(`${file} 第 ${round + 1} 回合考點重複`);
    const signature = ids.join(",");
    if (signature === previousSignature) throw new Error(`${file} 連續兩回合抽題順序完全相同`);
    previousSignature = signature;
    ids.forEach(id => observed.add(id));
  }
  if (observed.size !== questions.length) throw new Error(`${file} 大量抽樣僅涵蓋 ${observed.size}/1000 題`);
  questions.forEach(item => {
    if (allIds.has(item.id)) throw new Error(`跨科 ID 重複：${item.id}`);
    allIds.add(item.id);
  });
  total += questions.length;
  console.log(`${file}: ${roundsPerSubject} 回合 × 10 題，回合內 0 重複，抽樣涵蓋 ${observed.size}/1000 題`);
}
if (total !== 5000 || allIds.size !== 5000) throw new Error(`總題數驗證失敗：${total} 題、${allIds.size} 個唯一 ID`);
console.log(`隨機抽題驗證完成：共 ${files.length * roundsPerSubject} 回合、${files.length * roundsPerSubject * lessonSize} 次抽題；5000 題、5000 個唯一 ID。`);
