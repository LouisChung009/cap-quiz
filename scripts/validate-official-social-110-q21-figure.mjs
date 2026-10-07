import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const question = rows.find(row => row.id === "OFF-0136");
if (!question || question.source?.year !== 110 || question.source?.questionNumber !== 21 || question.subject !== "社會") {
  throw new Error("OFF-0136 must remain bound to 110 Social Studies Q21");
}
const svgPath = join(root, "assets", "official-exams", "110-social-q21-tang-mission-route.svg");
const svg = await readFile(svgPath, "utf8");
if (!question.requiresImage || !question.questionImages?.includes("./assets/official-exams/110-social-q21-tang-mission-route.svg")) {
  throw new Error("OFF-0136 must keep its required focused figure");
}
if (!/<svg\b[^>]*\bviewBox="0 0 282 200"/.test(svg)) throw new Error("OFF-0136 figure has an unexpected viewBox");
if (/<image\b|(?:href|src)\s*=\s*["'](?:\.|https?:)/i.test(svg)) throw new Error("OFF-0136 figure must not rely on external image resources");
for (const term of ["日本", "長安城", "遣唐使路線"]) {
  if (!svg.includes(term)) throw new Error(`OFF-0136 figure is missing its key map label: ${term}`);
}
console.log("OFF-0136 focused route map is self-contained, labelled, and required by the question data.");
