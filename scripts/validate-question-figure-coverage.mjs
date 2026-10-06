import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const explicitFigureReference = /(?:如圖|如下圖|下圖|上圖|圖中|圖示|右圖|左圖|附圖|見圖|參考圖|圖\s*[（(][一二三四五六七八九十\d]+[）)]|圖\s*[（(]\s*\d)/;
const app = await readFile(join(root, "app.js"), "utf8");
const registryMatch = app.match(/Object\.assign\(QUESTION_FIGURE_FALLBACKS,(\{[^\n]+\})\);/);
if (!registryMatch) throw new Error("Question figure fallback registry is missing or invalid");
if (!/function renderQuestionImage\([^\n]+<img class=\\?"question-image-object\\?"/.test(app)) {
  throw new Error("Question figures must render as native, consistently styled images");
}
const figures = JSON.parse(registryMatch[1]);
const banks = ["chinese", "english", "math", "science", "social"].map(async subject => ({
  subject,
  questions: JSON.parse(await readFile(join(root, "data", `${subject}.json`), "utf8"))
}));
const official = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const allQuestions = [...(await Promise.all(banks)).flatMap(bank => bank.questions), ...official];
const knownBlankFigureReport = official.find(question => question.id === "OFF-0603");
if (!knownBlankFigureReport?.requiresImage || !knownBlankFigureReport.questionImage?.startsWith("./assets/official-exams/112-social-q47-fuji-contour-map.svg?v=")) {
  throw new Error("112 Social Q47 must keep its required, explicit contour-map asset");
}
const errors = [];
const seen = new Set();
let visualQuestions = 0;
let figureReferences = 0;

async function validateFigure(questionId, image) {
  const imageUrl = image.split(/[?#]/, 1)[0];
  const imagePath = join(root, imageUrl.replace(/^\.\//, ""));
  let bytes;
  try {
    const metadata = await stat(imagePath);
    if (!metadata.isFile() || metadata.size === 0) throw new Error("not a non-empty file");
    bytes = await readFile(imagePath);
  } catch {
    errors.push(`${questionId}: missing or empty figure asset ${image}`);
    return;
  }

  if (/\.svg$/i.test(imageUrl)) {
    const svg = bytes.toString("utf8");
    if (!/<svg\b[^>]*\bviewBox\s*=/.test(svg)) errors.push(`${questionId}: SVG has no viewBox ${image}`);
    if (!/<(?:path|rect|circle|ellipse|line|polyline|polygon|text|image|use)\b/i.test(svg)) {
      errors.push(`${questionId}: SVG has no drawable content ${image}`);
    }
  } else if (/\.png$/i.test(imageUrl)) {
    if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      errors.push(`${questionId}: invalid PNG signature ${image}`);
    }
  } else if (/\.webp$/i.test(imageUrl)) {
    if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
      errors.push(`${questionId}: invalid WebP signature ${image}`);
    }
  } else {
    errors.push(`${questionId}: unsupported figure format ${image}`);
  }
}

for (const question of allQuestions) {
  const mentionsFigure = explicitFigureReference.test(question.question || "");
  if (mentionsFigure) {
    visualQuestions += 1;
    if (seen.has(question.id)) errors.push(`${question.id}: duplicate question id in visual scan`);
    seen.add(question.id);
  }
  const configured = figures[question.id];
  const images = question.questionImages?.length ? question.questionImages : [question.questionImage].filter(Boolean);
  const paths = images.length ? images : configured?.length ? [configured[0]] : [];
  if ((mentionsFigure || question.requiresImage) && !paths.length) {
    errors.push(`${question.id}: question references a figure but has no rendered image`);
    continue;
  }
  if (mentionsFigure && !question.requiresImage && !configured?.length) errors.push(`${question.id}: image is not enabled for rendering`);
  if ((mentionsFigure || question.requiresImage) && !(question.imageAlt || configured?.[1])) {
    errors.push(`${question.id}: figure has no accessible description`);
  }
  for (const image of paths) {
    figureReferences += 1;
    await validateFigure(question.id, image);
  }
}

const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
for (const [id, [image]] of Object.entries(figures)) {
  if (!seen.has(id)) continue;
  if (!serviceWorker.includes(`"${image}"`)) errors.push(`${id}: figure is not in the offline cache manifest`);
}

console.log(`Question figure coverage: ${visualQuestions} text references, ${figureReferences} validated figure assets, ${Object.keys(figures).length} rendered fallback figures.`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("All explicit figure references have a local, accessible, offline-cached figure.");
