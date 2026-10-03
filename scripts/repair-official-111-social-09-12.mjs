import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0351", answer: 1, explanation: "廟方以神明指示作為選址及擴建理由，涉及宗教信仰；但題幹同時指出違法占用國土、開罰及移送法辦，顯示信仰自由行使仍須受土地與環境相關法律規範。衝突核心是法律規範與宗教信仰，答案 B。", steps: ["辨認廟方主張的依據：宗教信仰及神明指示。", "再看政府措施：因違法占地、濫墾而開罰並移送法辦。", "爭點是法律規範與宗教信仰如何平衡，答案 B；並非私人財產權爭議。"], tip: "宗教自由受保障，但不代表宗教活動可免除一般法律責任。" },
  { id: "OFF-0352", answer: 2, explanation: "題幹指出該公職人員啟動偵辦、循線破獲賭場，並依法對業者與賭徒提起公訴。偵查犯罪並代表國家提起公訴是檢察官的職權，答案 C。", steps: ["找出職務動作：啟動偵辦、循線蒐證。", "關鍵線索是「提起公訴」，屬檢察官職權。", "因此陳情對象為檢察官，答案 C；法官負責審判，律師提供法律協助，警察負責犯罪偵查但不提起公訴。"], tip: "分清司法角色：警察偵查、檢察官偵查並起訴、法官審判、律師代理或辯護。" },
  { id: "OFF-0353", answer: 1, explanation: "圖(六)把原價每個 200 元與特價 140 元並列，另有七折及買十個再優惠的價格訊息，主要以降價促銷吸引消費者，屬價格競爭，答案 B。", steps: ["讀廣告中的價格：原價 200 元，促銷價 140 元。", "七折及大量購買優惠都直接降低消費者支付價格。", "公司採取價格競爭，答案 B；廣告雖刊登於報紙，重點不是延長營業時間或品牌形象。"], tip: "判讀行銷策略時看廣告訴求的核心；刊登廣告本身不等於建立品牌形象。" },
  { id: "OFF-0354", answer: 0, explanation: "圖(七)比較不同出生世代婦女在育齡期間累積的子女數，較晚出生世代的曲線較低，表示生育數下降。若要減緩少子化並維持人口結構，提供幼兒教育補助可降低家庭育兒負擔，答案 A。", steps: ["比較曲線標示的出生世代：越晚出生的世代，累積生育數越低。", "資料趨勢指向生育率下降，人口結構可能持續老化。", "幼兒教育補助可支持育兒家庭，較能回應生育負擔，答案 A；高齡照護不能直接改變生育趨勢。"], tip: "政策選擇需對應圖表顯示的問題；高齡化與少子化相關但政策作用不同。" },
];
const visualRepairs = {
  "OFF-0354": { requiresImage: true, imageAlt: "各出生世代女性育齡期間累積生育數曲線圖", questionImage: "./assets/official-exams/111-social-q12-fertility-chart.png", questionImages: ["./assets/official-exams/111-social-q12-fertility-chart.png"] },
};
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip }, visualRepairs[item.id] || {});
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 9–12.");
