import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0112": {
    question: "如圖（十），菱形 ABCD 中，E 在 BC 上，F 在 CD 上，G、H 在 AD 上，且 AE∥HC∥GF。若 AH=8、HG=5、GD=4，則下列線段何者最長？",
    options: ["CF", "FD", "BE", "EC"],
    answer: 0,
    explanation: "答案 A「CF」。菱形各邊相等，AD=BC=CD=AB=AH+HG+GD=17。因 AHCE 的對邊分別平行，AHCE 為平行四邊形，所以 EC=AH=8，BE=BC−EC=9。又 △DGF∼△DHC（DG、DH 同在 AD，DF、DC 同在 CD，且 GF∥HC），比例 DG/DH=DF/DC=4/9；DH=HG+GD=9，DC=17，因此 DF=68/9，CF=17−68/9=85/9。比較 CF=85/9>BE=9>EC=8>FD=68/9，故 CF 最長。",
    solutionSteps: [
      "AD=AH+HG+GD=8+5+4=17；菱形四邊相等，所以 BC=CD=17。AH∥EC 且 AE∥HC，四邊形 AHCE 是平行四邊形，故 EC=AH=8，BE=17−8=9。",
      "DH=HG+GD=5+4=9。因 GF∥HC，△DGF∼△DHC，故 DF/DC=DG/DH=4/9；DC=17，所以 DF=68/9，CF=17−68/9=85/9。",
      "比較 CF=85/9、BE=9、EC=8、FD=68/9；因 85/9>9，且其餘更短，故 CF 最長，選 A。"
    ],
    teacherTip: "遇到多組平行線，先找出平行四邊形，再用相似三角形比例求線段；最後把所有選項放在同一單位比較。",
    requiresImage: true
  },
  "OFF-0113": {
    question: "小文原本計畫於 10:00 同時使用甲、乙兩臺影印機。某日 10:00 時乙正在被使用，因此小文先用甲印；10:05 才開始使用乙。10:15 時，乙累計印出的張數與甲相同；10:45 時，甲、乙累計共印 2100 張。若每臺影印機的印量與使用時間成正比，依原計畫兩臺同時於 10:00 開始，總印量會在幾點達到 2100 張？",
    options: ["10:40", "10:41", "10:42", "10:43"],
    answer: 2,
    explanation: "答案 C「10:42」。設甲、乙每分鐘分別印 m、n 張。到 10:15，甲印 15 分鐘、乙印 10 分鐘且張數相同，所以 15m=10n，n=1.5m。到 10:45，甲印 45 分鐘、乙印 40 分鐘，總張數 45m+40n=2100；代入 n=1.5m 得 105m=2100，m=20、n=30。若兩臺都從 10:00 開始，每分鐘共印 50 張，2100÷50=42 分鐘，因此 10:42。",
    solutionSteps: [
      "設甲、乙每分鐘印 m、n 張。10:15 時甲印 15 分鐘、乙印 10 分鐘且總張數相同，故 15m=10n，n=1.5m。",
      "10:45 時甲印 45 分鐘、乙印 40 分鐘：45m+40n=2100。代入 n=1.5m，得 105m=2100，故 m=20、n=30 張/分鐘。",
      "原計畫兩臺同時工作，每分鐘共印 20+30=50 張；2100÷50=42 分鐘，從 10:00 起為 10:42，選 C。"
    ],
    teacherTip: "先把各影印機的累計張數寫成「速率×時間」，注意兩臺實際開始時間不同，再套回原計畫。",
    requiresImage: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(4)) - 89;
  if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== expectedNumber) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  if (!fix.requiresImage) {
    delete question.questionImage;
    delete question.questionImages;
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired 110 math Q23–24 text, choices, and worked explanations.");
