import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/science.json", import.meta.url);
let content = await readFile(path, "utf8");
const questions = JSON.parse(content);
const fixes = new Map([
  ["SCI-0206", { knowledgePoint: "蒸散作用" }],
  ["SCI-0380", { question: "某條血管的血液由肺部流出，進入心臟左心房，且此時含氧量較高。這條血管是哪一條？" }],
  ["SCI-0451", { question: "車輛在 0 至 2 秒速度由 1 m/s 均勻增加至 5 m/s；2 至 4 秒維持 5 m/s。依這段速度—時間資料計算，4 秒內行進距離為多少？" }],
  ["SCI-0618", { question: "某地附近有一組以 4 hPa 為間隔的封閉等壓線，由外向內標示 1008、1004、1000 hPa。哪項推論符合這組數值？" }],
  ["SCI-0640", { question: "三組實驗各取 100 mg 澱粉，加入相同體積的同一批唾液，並維持相同 pH，分別在 20°C、37°C、70°C 反應 10 分鐘。測得剩餘澱粉量：20°C 為 80 mg、37°C 為 20 mg、70°C 為 95 mg。哪項解釋最合理？" }],
  ["SCI-0946", { question: "某草原中每年可供食物網利用的能量約為：草 10,000 kJ、兔 900 kJ、狐狸 80 kJ。若取食關係為「草→兔→狐狸」，哪一項同時符合箭頭意義與能量資料？" }],
  ["SCI-0966", { question: "比較同一反應有無催化劑時，反應物與生成物的能量位置不變，但加入催化劑後反應途徑的能量峰頂降低。下列推論何者正確？" }],
  ["SCI-0977", { question: "某物體在一段時間內位置每 2 秒增加 6 m。若以距離變化作縱軸、時間作橫軸，這段資料的斜率代表什麼？" }]
]);

for (const [id, changes] of fixes) {
  const question = questions.find((item) => item.id === id);
  if (!question) throw new Error(`Missing question ${id}`);
  Object.assign(question, changes);
}

for (const [id] of fixes) {
  const idIndex = content.indexOf(`"id": "${id}"`);
  if (idIndex < 0) throw new Error(`Unable to locate serialized question ${id}`);
  const objectStart = content.lastIndexOf("{", idIndex);
  let depth = 0;
  let inString = false;
  let escaped = false;
  let objectEnd = -1;
  for (let index = objectStart; index < content.length; index += 1) {
    const character = content[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        objectEnd = index + 1;
        break;
      }
    }
  }
  if (objectEnd < 0) throw new Error(`Unable to locate end of question ${id}`);
  const question = questions.find((item) => item.id === id);
  const lines = JSON.stringify(question, null, 2).split("\n");
  const replacement = [lines[0], ...lines.slice(1).map((line) => `  ${line}`)].join("\n");
  content = `${content.slice(0, objectStart)}${replacement}${content.slice(objectEnd)}`;
}

await writeFile(path, content);
console.log(`Repaired ${fixes.size} verified science-question issues.`);
