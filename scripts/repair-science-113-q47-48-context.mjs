import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const context = "【題組材料】統計臺灣 2017～2021 年各年度住宅用電量（度）及「冷氣時」；冷氣時是各地平均氣溫超過 28℃ 的時數累積。一般認為冷氣時愈多，住宅用電量愈高；2020 年起受 COVID-19 疫情影響，民眾居家時間變長，住宅用電明顯成長。圖表數據：2017 年住宅用電 47,612 度、冷氣時 2,283 小時；2018 年 46,879 度、2,038 小時；2019 年 47,189 度、2,030 小時；2020 年 50,207 度、2,247 小時；2021 年 52,729 度、2,235 小時。";
const fixes = {
  "OFF-0871": {
    question: `${context}\n\n文中提及「一般認為冷氣時會影響住宅用電多寡，冷氣時增加會使住宅用電增加，減少則使住宅用電減少」，下列哪一項數據最符合上述引號中的說法？`,
    explanation: "2017 至 2018 年冷氣時由 2,283 小時減至 2,038 小時，住宅用電也由 47,612 度減至 46,879 度，兩者同時下降，符合「冷氣時減少、住宅用電也減少」的說法，因此選 A。2020 至 2021 年住宅用電增加但冷氣時減少，不能支持此說法；兩項指標最低或最高的年份也不相同。",
    solutionSteps: [
      "題目要找同一段期間內兩項數據同方向變化的例子，而不是只比較哪一年最高或最低。",
      "2017→2018 年冷氣時 2,283→2,038 小時，住宅用電 47,612→46,879 度，兩者都減少。",
      "因此 2017～2018 年最符合冷氣時與住宅用電同向變化的說法，選 A。2020→2021 年冷氣時略降、住宅用電上升，並不符合。"
    ],
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0872": {
    question: `${context}\n\n文中「冷氣時」選擇以超過 28℃ 的時數計算，其原因可能與下列何者最相關？`,
    explanation: "冷氣時以氣溫超過 28℃ 的時數代表可能需要開冷氣的熱時段；超過此溫度時，多數民眾較可能開啟冷氣，因此選 C。28℃不是臺灣平均氣溫，也不是冷氣機在此氣溫下最耗電或設定此溫度最省電的意思。",
    solutionSteps: [
      "先分清楚「氣溫超過 28℃ 的時數」是室外氣溫的統計指標，不是冷氣機的設定溫度。",
      "炎熱時段較可能使民眾開冷氣，因此以超過 28℃ 的時數估計冷氣使用相關時段，最符合選項 C。",
      "題目沒有指出 28℃ 是臺灣平均氣溫、冷氣機最耗電點或最佳設定值，故 A、B、D 都不是此指標的理由。"
    ],
    requiresImage: false,
    requiresContext: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const number = Number(id.slice(4)) - 824;
  if (!question || question.subject !== "自然" || question.source?.year !== 113 || question.source?.questionNumber !== number) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Embedded 113 science Q47–48 graph data and question-specific solutions.");
