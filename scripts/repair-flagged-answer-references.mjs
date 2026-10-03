import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const specs = [
  {
    file: "science.json",
    id: "SCI-0009",
    answer: 0,
    explanation: "受精後胚珠發育為種子，子房通常發育成果實，故答案為 A「胚珠成為種子，子房成為果實」。胚珠與子房的發育結果若顛倒便不正確。",
    solutionSteps: ["花粉管將精細胞送至胚珠，題目問受精後兩構造的發育結果。", "受精後胚珠發育為種子，子房通常發育成果實。", "因此選 A「胚珠成為種子，子房成為果實」；選項 C 將兩者顛倒。"]
  },
  {
    file: "chinese.json",
    id: "CHI-0008",
    explanation: "先分析條件再逐步作答，表示安排有條理，符合「有條不紊」，答案為 C。A 的「人聲鼎沸」與安靜矛盾；B 的「井然有序」與拖延不合；D 把等待偶然收穫的「守株待兔」誤用於開電扇。"
  },
  {
    file: "chinese.json",
    id: "CHI-0015",
    explanation: "答案為 D：「徜徉」的「徜」讀ㄔㄤˊ。A「粗獷」的「獷」讀ㄍㄨㄤˇ；B「惆悵」的「悵」讀ㄔㄤˋ；C「險峻」的「峻」讀ㄐㄩㄣˋ，不讀ㄐㄩㄣˇ，因此只有 D 正確。"
  },
  {
    file: "chinese.json",
    id: "CHI-0016",
    explanation: "答案為 B：「崎嶇」的「嶇」字形正確。A 應寫「草率」，C 應寫「慷慨」，D 應寫「豐富」；其餘括號字均有誤，因此只有 B 正確。"
  },
  {
    file: "science.json",
    id: "SCI-0151",
    explanation: "鐵釘生鏽時，鐵與氧、水等作用形成新的含鐵氧化物。產生新物質是判斷化學變化的重要依據，因此答案為 B「產生新物質，屬化學變化」；鏽層不再是純鐵。"
  },
  {
    file: "science.json",
    id: "SCI-0154",
    explanation: "澄清石灰水遇二氧化碳會生成碳酸鈣沉澱而變混濁，因此答案為 A「氣體中含有二氧化碳，反應生成新物質」。這支持氣體混合物中含二氧化碳，但不能單獨證明氣體是純二氧化碳。"
  },
  {
    file: "science.json",
    id: "SCI-0272",
    explanation: "鎂燃燒時與空氣中的氧結合生成氧化鎂。若只比較產物氧化鎂與原鎂帶，產物包含氧的質量，因此質量較大，答案為 C。若將全部反應物一併秤量，密閉系統總質量仍守恆。"
  }
];

const byFile = new Map();
for (const spec of specs) {
  const rows = byFile.get(spec.file) ?? JSON.parse(await readFile(join(root, "data", spec.file), "utf8"));
  const row = rows.find(item => item.id === spec.id);
  if (!row) throw new Error(`Missing ${spec.id}`);
  if (spec.answer !== undefined) row.answer = spec.answer;
  row.explanation = spec.explanation;
  if (spec.solutionSteps) row.solutionSteps = spec.solutionSteps;
  const letter = String.fromCharCode(65 + row.answer);
  if (!row.explanation.includes(row.options[row.answer]) && !row.explanation.includes(`答案為 ${letter}`) && !row.explanation.includes(`答案為${letter}`)) {
    throw new Error(`Explanation does not identify keyed answer for ${spec.id}`);
  }
  byFile.set(spec.file, rows);
}

for (const [name, rows] of byFile) await writeFile(join(root, "data", name), `${JSON.stringify(rows, null, 2)}\n`);
