import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(dataPath, "utf8"));
const rows = questions.filter(question => question.subject === "國文" && question.source?.year === 110 && question.source.questionNumber >= 42 && question.source.questionNumber <= 48);
const rowFor = number => rows.find(question => question.source.questionNumber === number);

const proposal = rowFor(42).question.split("\n\n")[0];

const water = `【閱讀材料】改寫自歐陽脩〈大明水記〉
陸羽《茶經》論水云：「山水上，石泉又上，江水次而井水下。」又說：「江水取去人遠者，井取汲多者。」其說止於此，未嘗品第天下之水味。張又新《煎茶水記》云劉伯芻謂水有七等，以揚子江為第一，惠山石泉為第二，虎丘井第三，淮水居末。又載羽為李季卿論水次第有二十種，江水居山水上，井水居江水上。二說皆與《茶經》不合。
水味有美惡而已，欲求天下之水一一而次第之者，謬說也。羽之論水，惡渟浸而喜泉源，故井取多汲者。江雖長，然眾水雜聚，故次山水。惟此說近物理云。詞語提示：「渟浸」指水停止不動。`;

const pairedTexts = `【甲】
柳開少好任氣，大言凌物。應舉時，以文章投於主考簾前，凡千軸，載以獨輪車。引試日，自擁車入，欲以此駭眾取名。其時張景能文有名，唯袖一書簾前獻之。主考大稱賞，擢景優等。時人為之語曰：「柳開千軸，不如張景一書。」
——改寫自沈括《夢溪筆談》

【乙】
張景，字晦之，江陵公安人。幼能長言，嗜學尤力。貧不治產，往從柳開。開以文自名，而薦寵士類，一見歡甚，悉出家書予之，由是屬辭益有法度。開每曰：「今朝中之士，誰踰晦之者！」即厚餽，使如京師。後中進士。
——改寫自宋祁〈故大理評事張公墓誌銘〉

【丙】相關人物簡表（生卒年／中舉年份）
柳開：948–1001／973；張景：970–1018／1000；宋祁：998–1061／1024；沈括：1031–1095／1063。

詞語提示：1. 凌物：傲視他人。2. 引試：面試。3. 張公：指張景。4. 墓誌銘：記錄死者生平事蹟的石刻文字。`;

function replacePassage(number, passage) {
  const row = rowFor(number);
  if (!row) throw new Error(`Missing question ${number}`);
  const splitAt = row.question.indexOf("\n\n");
  if (splitAt < 0) throw new Error(`Missing prompt separator for question ${number}`);
  row.question = `${passage}\n\n${row.question.slice(splitAt + 2)}`;
}

for (const number of [43]) replacePassage(number, proposal);
for (const number of [44, 45]) replacePassage(number, water);
for (const number of [46, 47, 48]) replacePassage(number, pairedTexts);
for (const number of [43, 44, 45, 46, 47, 48]) {
  const row = rowFor(number);
  delete row.questionImage;
  delete row.imageAlt;
  delete row.questionImages;
  row.requiresImage = false;
}

await writeFile(dataPath, `${JSON.stringify(questions, null, 2)}\n`);
console.log("Restored complete common reading materials for 110 Chinese questions 43–48 and removed page scans.");
