import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const stems = {
  "OFF-0917": "Look at the picture. A ____ is flying over the houses.",
  "OFF-0918": "When I was a teenager, I was very ____. But now, it’s easier for me to talk to people.",
  "OFF-0919": "Lena doesn’t want to go ____ with John because she is afraid of water.",
  "OFF-0920": "Cindy enjoys ____ her dad read stories to her before bed.",
  "OFF-0921": "Dad is busy cooking in the kitchen. Dinner will be ____ in ten minutes.",
  "OFF-0922": "There are so many new ____ in the office. It’ll take me some time to remember who is who.",
  "OFF-0923": "I feel like a ____. I was looking for my keys for hours but they have been in my pocket the whole time.",
  "OFF-0924": "Mr. and Mrs. Wu have three daughters. Two are in high school, and ____ is in elementary school.",
  "OFF-0925": "It is hard for trees to ____ along this beach because of the strong winds from the sea.",
  "OFF-0926": "Christmas ____ and I want to visit my aunt abroad. Do you have any plans yet?",
  "OFF-0927": "Jo won’t be happy if you’re late for his party tonight, so ____ sure that you arrive on time.",
  "OFF-0928": "You may have a long drive because of the terrible ____. There are usually a lot of cars and buses during this time.",
  "OFF-0929": "In the future, there will ____ be greater basketball players than Stephen Curry, but now we believe he is the best!",
  "OFF-0930": "I guess the rainwater has come in from the kitchen. See? ____ of the windows are closed except the one in the kitchen.",
  "OFF-0931": "____ machines have been used to pick fruits for a long time, they were not used on strawberry farms until several years ago.",
  "OFF-0932": "There are online videos that teach you exercises you can do at home. They’ll ____ you a trip to the gym, and some money too.",
  "OFF-0933": "Jane’s parents are always happy to see their grandchildren, but mine ____ less so when I visit them with my kids.",
  "OFF-0934": "Before she ____ about it, you should tell Daphne you broke her favorite cup.",
  "OFF-0935": "It was very windy this morning. Some of the shirts on the balcony were blown away ____ in the pond."
};

for (const [id, stem] of Object.entries(stems)) {
  const question = questions.find((item) => item.id === id);
  const number = Number(id.slice(4)) - 916;
  if (!question || question.subject !== "英文" || question.source?.year !== 114 || question.source?.questionNumber !== number) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  if (!question.options[question.answer] || !stem.includes("____")) throw new Error(`Missing answer or blank in ${id}`);
  question.question = stem;
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored original blanks in 114 English Q1–19.");
