import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const stems = {
  "OFF-0051": "Jill is ____ that the city park is closed for the music festival because now she can’t jog there.",
  "OFF-0052": "Steven wants to be a ____, because he loves to watch people enjoy the food he prepares.",
  "OFF-0053": "Paul misses his parents a lot. He ____ them since he came to work in Taiwan a year ago.",
  "OFF-0054": "Our teacher Ms. Wu seldom laughs, but when she ____, everyone in the same building can hear her.",
  "OFF-0055": "My sister is coming to my home today. She ____ with me for a week.",
  "OFF-0056": "Edward had worked as a computer engineer for ten years. This ____ helped him a lot when he started his own computer shop.",
  "OFF-0057": "If you’re interested in our business plan, ____ this number and ask for Ms. Lee. She’ll answer your questions.",
  "OFF-0058": "Jimmy would not get up for breakfast, ____ his dad had already tried to pull him from his bed several times.",
  "OFF-0059": "Duncan spent all his money trying to ____ the bookstore his mom left him. Sadly, the business never got better, and he had to close it in the end.",
  "OFF-0060": "Fiona loves listening to her children sing songs ____ at school.",
  "OFF-0061": "Beverly eats lots of snacks ____ meals. That’s why she is often too full to eat anything at mealtimes.",
  "OFF-0062": "Nora: Can I check your drawer for some tools we can use? Matt: Sure. Take a look. See if you can find ____ in there."
};

for (const [id, stem] of Object.entries(stems)) {
  const question = questions.find((item) => item.id === id);
  const number = Number(id.slice(4)) - 48;
  if (!question || question.subject !== "英文" || question.source?.year !== 110 || question.source?.questionNumber !== number) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  question.question = stem;
  const answer = question.options[question.answer];
  if (!answer || !stem.includes("____")) throw new Error(`Missing answer or blank in ${id}`);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored original blanks in 110 English Q3–14.");
