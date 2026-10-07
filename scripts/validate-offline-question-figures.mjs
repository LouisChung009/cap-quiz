import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const subjects = ["chinese", "english", "math", "science", "social"];
const banks = await Promise.all(subjects.map(async subject => JSON.parse(await readFile(join(root, "data", `${subject}.json`), "utf8"))));
const official = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const app = await readFile(join(root, "app.js"), "utf8");
const fallbackMatch = app.match(/Object\.assign\(QUESTION_FIGURE_FALLBACKS,(\{[^\n]+\})\);/);
if (!fallbackMatch) throw new Error("Question figure fallback registry is missing");
const fallback = JSON.parse(fallbackMatch[1]);
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const index = await readFile(join(root, "index.html"), "utf8");
const appVersion = app.match(/const APP_VERSION="([^"]+)",QUESTION_DATA_VERSION="([^"]+)",SUBJECT_DATA_VERSION="([^"]+)"/);
if (!appVersion) throw new Error("Application/data versions are missing");
const [, appVersionValue, missionDataVersion, subjectDataVersion] = appVersion;
if (!serviceWorker.includes(`const CACHE="cap-quiz-v${appVersionValue}"`)) throw new Error("Service-worker cache version does not match the app");
for (const asset of ["styles.css", "bootstrap.js", "app.js"]) if (!serviceWorker.includes(`./${asset}?v=${appVersionValue}`)) throw new Error(`${asset} cache version does not match the app`);
for (const subject of subjects) if (!serviceWorker.includes(`./data/${subject}.json?v=${subjectDataVersion}`)) throw new Error(`${subject} bank cache version does not match the app`);
if (!serviceWorker.includes(`./data/mission-questions.json?v=${missionDataVersion}`)) throw new Error("Mission bank cache version does not match the app");
for (const [index, asset] of [[8, "mission-questions.json"], [9, "chinese.json"], [10, "english.json"], [11, "math.json"], [12, "science.json"], [13, "social.json"]]) {
  const version = asset === "mission-questions.json" ? missionDataVersion : subjectDataVersion;
  if (!serviceWorker.includes(`ASSETS[${index}]="./data/${asset}?v=${version}"`)) throw new Error(`${asset} final cache override does not match the app`);
}
if (!index.includes(`./styles.css?v=${appVersionValue}`) || !index.includes(`./bootstrap.js?v=${appVersionValue}`)) throw new Error("HTML asset versions do not match the app");
const errors = new Set();
const checked = new Set();

function assetPath(value) {
  return value.split(/[?#]/, 1)[0].replace(/^\.\//, "");
}

async function verifyCachedAsset(value, questionId) {
  const cleanPath = assetPath(value);
  if (!cleanPath.startsWith("assets/")) return;
  const cacheUrl = `./${cleanPath}`;
  const key = `${questionId} -> ${cacheUrl}`;
  if (checked.has(key)) return;
  checked.add(key);
  try {
    const metadata = await stat(join(root, cleanPath));
    if (!metadata.isFile() || metadata.size === 0) throw new Error("empty asset");
  } catch {
    errors.add(`${questionId}: missing image asset ${cacheUrl}`);
  }
  if (!serviceWorker.includes(`"${cacheUrl}"`)) errors.add(`${questionId}: image asset is not in the offline cache ${cacheUrl}`);
  if (!cleanPath.toLowerCase().endsWith(".svg")) return;
  try {
    const svg = await readFile(join(root, cleanPath), "utf8");
    const folder = dirname(cleanPath).replaceAll("\\", "/");
    for (const match of svg.matchAll(/<image\b[^>]*?\b(?:href|xlink:href)\s*=\s*(["'])(.*?)\1[^>]*>/gs)) {
      const source = match[2].trim();
      if (!source || /^(?:data:|https?:|#)/i.test(source)) continue;
      const child = join(folder, decodeURIComponent(source.split(/[?#]/, 1)[0])).replaceAll("\\", "/");
      await verifyCachedAsset(`./${child}`, questionId);
    }
  } catch {
    errors.add(`${questionId}: cannot inspect SVG references in ${cacheUrl}`);
  }
}

for (const question of [...banks.flat(), ...official]) {
  const images = question.questionImages?.length ? question.questionImages : [question.questionImage].filter(Boolean);
  for (const image of images) await verifyCachedAsset(image, question.id);
  const fallbackImage = fallback[question.id]?.[0];
  if (fallbackImage) await verifyCachedAsset(fallbackImage, question.id);
}

console.log(`Offline figure audit: ${checked.size} question/asset references checked.`);
if (errors.size) {
  console.error([...errors].join("\n"));
  process.exit(1);
}
console.log("Every referenced figure and nested local image is present and in the offline cache.");
