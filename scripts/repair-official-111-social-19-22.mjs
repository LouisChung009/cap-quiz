import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0361", answer: 2, explanation: "題目要分辨可由資料確認的事件，與後人對事件的評價。丙具體記錄承乾太子不說漢語、在宮中搭建突厥帳篷、穿可汗服飾及用佩刀切熟牛肉等言行，可由史料檢核；甲的「熱衷」、乙的「傑出」與丁的「奇特」都帶有概括或評價，答案 C。", steps: ["先依題幹定義，找可由史料確認的具體事件，而不是後人對人物的評價。", "丙列出承乾太子的語言、帳篷、服飾與飲食行為，內容可逐項查證。", "甲、乙、丁含「熱衷、傑出、奇特」等概括或評價，因此選丙，答案 C。"], tip: "判斷歷史事實與解釋時，檢查句子是在記錄具體行為，還是在替人物下評語。" },
  { id: "OFF-0362", answer: 0, explanation: "圖(十一)的社會新聞用語及報導情境可對應日治時期臺灣報紙與當時社會制度，年代早於清帝國統治結束後的其他三個選項，因此最早可能發生於日本統治時期，答案 A。", steps: ["先從報紙兩則新聞的用語、機構名稱及社會背景辨認時代。", "圖中文字指向日本統治下的臺灣社會，而非清代或戰後政府時期。", "四個選項中最早且符合線索的是日本統治時期，答案 A。"], tip: "年代判讀先找制度與機構線索；題目問「最早可能」時也要比較選項先後。" },
  { id: "OFF-0363", answer: 1, explanation: "題幹指出葡萄牙天主教徒赴日本傳教及貿易時傳入天婦羅，這與歐洲人尋找通往亞洲航路、展開海外探險及海上貿易的時代背景相符，答案 B。", steps: ["抓住傳入者與交流方式：葡萄牙傳教士及商人抵達日本。", "葡萄牙赴亞洲的海路往來，發生在歐洲海外探險、建立新航線的時期。", "因此背景是西方各國展開海外探險並建立東方航線，答案 B。"], tip: "從商品或飲食的跨國傳播者、路線與宗教交流判斷全球史脈絡。" },
  { id: "OFF-0364", answer: 3, explanation: "列寧等人返俄後推翻臨時政府，俄國其後退出第一次世界大戰。德國是交戰國，秘密安排列車讓革命者返國，期待俄國政局動盪並退出戰爭，以減輕東線壓力，答案 D。", steps: ["從人物與事件辨認：列寧返俄並領導 1917 年革命。", "題幹問德國的戰時盤算；俄國若退出戰爭，德國可減少東線作戰壓力。", "因此目的是促使俄國退出第一次世界大戰，答案 D；冷戰及德蘇互不侵犯條約都屬更晚時期。"], tip: "以列寧返俄與革命年代定位一戰，排除二戰前後或冷戰時期選項。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 19–22.");
