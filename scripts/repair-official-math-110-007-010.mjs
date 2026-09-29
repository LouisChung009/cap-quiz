import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0096": {
    question: "已知纜車從起點行駛到終點需花費 8 分鐘，圖（三）表示行駛過程中纜車的海拔高度與行駛時間的關係。根據圖（三）判斷，下列敘述何者正確？",
    options: [
      "終點的海拔高度比起點高 300 公尺，行駛時間的前 4 分鐘都在上升",
      "終點的海拔高度比起點高 300 公尺，行駛時間的末 4 分鐘都在上升",
      "終點的海拔高度比起點高 350 公尺，行駛時間的前 4 分鐘都在上升",
      "終點的海拔高度比起點高 350 公尺，行駛時間的末 4 分鐘都在上升"
    ],
    answer: 1,
    explanation: "答案 B。圖上起點海拔約 50 公尺，終點約 350 公尺，高度增加 350−50=300 公尺。前 4 分鐘並非一路上升，因為第 2 至第 4 分鐘高度下降；末 4 分鐘則從第 4 分鐘到第 8 分鐘持續上升。",
    solutionSteps: ["讀圖取端點：0 分鐘約 50 公尺，8 分鐘約 350 公尺，因此終點比起點高 300 公尺。", "檢查前 4 分鐘：圖線在第 2 到第 4 分鐘往下，不是全程上升。", "檢查末 4 分鐘：第 4 到第 8 分鐘圖線持續往上，故只有 B 的高度差與上升區間都正確。"],
    requiresImage: true
  },
  "OFF-0097": {
    question: "利用乘法公式判斷，下列等式何者成立？",
    options: [
      "248² + 248 × 52 + 52² = 300²",
      "248² − 248 × 48 − 48² = 200²",
      "248² + 2 × 248 × 52 + 52² = 300²",
      "248² − 2 × 248 × 48 − 48² = 200²"
    ],
    answer: 2,
    explanation: "答案 C。因 248+52=300，利用平方公式 (a+b)²=a²+2ab+b²，可得 248²+2×248×52+52²=300²。A 少了中間項的係數 2；B、D 也不符合 (a−b)²=a²−2ab+b²（D 的 b² 項符號錯，B 的中間項係數也不對）。",
    solutionSteps: ["先辨認 248+52=300，右側 300² 對應完全平方和公式。", "展開 (248+52)²，得到 248²+2×248×52+52²，與 C 完全一致。", "A 中間項少一個 248×52；差平方應是 a²−2ab+b²，B、D 的係數或末項正負號不合，因此選 C。"],
    requiresImage: false
  },
  "OFF-0098": {
    question: "圖（四）為甲城市 6 月到 9 月外國旅客人數的折線圖。根據圖（四）判斷，哪一個月到甲城市的外國旅客中，旅客人數最少的國家是美國？",
    options: ["6 月", "7 月", "8 月", "9 月"],
    answer: 2,
    explanation: "答案 C「8 月」。圖例以圓點代表美國。逐月比較三國人數，只有 8 月美國旅客約 2 千人，少於日本約 3 千人和英國約 2.4 千人，因此該月旅客人數最少的國家是美國。",
    solutionSteps: ["先由圖例確認圓點代表美國，再按月份比較三種符號的高度。", "6 月最低是英國；7 月最低是日本；8 月圓點低於日本三角形與英國方形；9 月最低是英國。", "因此只有 8 月美國旅客人數最少，選 C。"],
    requiresImage: true
  },
  "OFF-0099": {
    question: "將一半徑為 6 的圓形紙片，沿著兩條半徑剪開形成兩個扇形。若其中一個扇形的弧長為 5π，則另一個扇形的圓心角度數是多少？",
    options: ["30°", "60°", "105°", "210°"],
    answer: 3,
    explanation: "答案 D「210°」。半徑 6 的圓周長為 2π×6=12π。已知一個扇形弧長 5π，另一段弧長為 12π−5π=7π；另一扇形的圓心角占全圓周長的 7/12，因此角度為 360°×7/12=210°。",
    solutionSteps: ["先求整個圓的周長：2πr=2π×6=12π。", "兩個扇形的弧長合為一整圈，另一個扇形弧長是 12π−5π=7π。", "圓心角與弧長成正比，另一角為 360°×(7π/12π)=210°，選 D。"],
    requiresImage: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(-2)) - 89;
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
console.log("Repaired 110 math Q7–10 chart reading, identities, options, and worked solutions.");
