import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/chinese.json", import.meta.url);
let content = await readFile(path, "utf8");
const questions = JSON.parse(content);
const fixes = new Map([
  ["CHI-0134", {
    question: "某校連續兩週記錄雨天帶傘情形：帶傘的 24 人中有 6 人仍淋濕；未帶傘的 76 人中有 35 人淋濕。有人據此斷言「只要帶傘，雨天就絕不會淋濕」。最能指出這項推論問題的是什麼？",
    options: ["觀察資料完全沒有記錄淋雨情形", "只要使用數據，就不能進行任何推論", "結論範圍比資料涵蓋範圍更窄", "把淋濕比例較低誇大成絕不淋濕，且與觀察到的帶傘者淋濕例子矛盾"],
    answer: 3,
    explanation: "答案是 D。帶傘者中仍有 6 人淋濕，已直接反駁「只要帶傘就絕不淋濕」；資料只能說明這次觀察中的淋濕比例，不能推出毫無例外的保證。",
    solutionSteps: ["先看資料是否支持絕對語氣：帶傘的 24 人中仍有 6 人淋濕。", "這些觀察例子直接否定「帶傘就絕不淋濕」；比例差異也不能直接證明單一因果。", "因此問題在把有限觀察誇大成必然結論，選 D。"],
    teacherTip: "看到「一定、只要……就、絕不」等絕對語氣時，檢查資料中是否存在反例，並區分觀察關聯與因果。"
  }],
  ["CHI-0135", {
    question: "某校想評估圖書館延長開放至晚上九時是否可行。小組整理了三項資料：①放學後留校自習的學生比例；②圖書館現有座位的使用紀錄；③學生最希望增購的書籍種類。哪一組資料最能直接回答是否延長開放？",
    options: ["①和②", "①和③", "②和③", "只看③"],
    answer: 0,
    explanation: "答案是 A。是否延長開放要看放學後的實際需求，以及現有空間是否已被充分使用。學生希望增購哪些書籍與開放時間的需求較不直接相關。",
    solutionSteps: ["先界定研究問題：評估延長開放時間是否有需求、是否值得。", "①顯示放學後留校自習需求，②顯示現有座位是否被使用，兩者都直接相關。", "③談的是書籍種類，不足以判斷開放時間，因此選 A。"],
    teacherTip: "挑選資料先對準研究問題；資料再多，若與問題無關也不能支持結論。"
  }],
  ["CHI-0152", {
    options: ["親力親為", "言傳身教", "紙上談兵", "坐而論道"],
    explanation: "隊長先口頭說明安全流程，又親自示範並陪同練習，符合「言傳身教」兼用言語與行動教導。A「親力親為」只強調親自處理，不必然包含教學；C「紙上談兵」指空談理論、不切實際；D「坐而論道」偏重坐談議論。",
    solutionSteps: ["找出隊長的兩種教學行動：口頭說明流程、親自示範操作。", "新志工在講解與實際示範中學會技能；「親力親為」只強調親自做，不足以概括教學方式。", "兼用言語和行動教導，符合「言傳身教」，答案 B。"],
    teacherTip: "「親力親為」強調親自處理；「言傳身教」則明確包含言語講解與行動示範。"
  }]
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
console.log(`Repaired ${fixes.size} verified Chinese-question issues.`);
