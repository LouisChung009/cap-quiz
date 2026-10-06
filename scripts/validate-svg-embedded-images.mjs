import { access, readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const imageDirectory = join(root, "assets", "official-exams");
const svgFiles = (await readdir(imageDirectory)).filter(file => file.toLowerCase().endsWith(".svg"));
const errors = [];
let referenceCount = 0;

for (const file of svgFiles) {
  const svgPath = join(imageDirectory, file);
  const svg = await readFile(svgPath, "utf8");
  const references = [...svg.matchAll(/<image\b[^>]*?\b(?:href|xlink:href)\s*=\s*(["'])(.*?)\1[^>]*>/gs)];
  for (const reference of references) {
    const source = reference[2].trim();
    if (!source || /^(?:data:|https?:|#)/i.test(source)) continue;
    referenceCount += 1;
    try {
      const sourcePath = resolve(dirname(svgPath), decodeURIComponent(source.split(/[?#]/, 1)[0]));
      if (!sourcePath.startsWith(`${imageDirectory}${sep}`)) throw new Error("image source escapes the official-exams folder");
      await access(sourcePath);
    } catch (error) {
      errors.push(`${file}: missing or unsafe embedded image ${source} (${error.message})`);
    }
  }
}

console.log(`SVG embedded-image scan: ${svgFiles.length} SVG files, ${referenceCount} local image references`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("All local SVG image references resolve.");
