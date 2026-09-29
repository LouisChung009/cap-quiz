import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const fixes = {
  "OFF-0143": {
    question: "金芳工廠評估三種營運策略的收支情況。表中銷貨收入與生產成本單位為萬元／月：增產甲產品，收入 120、成本 90；增產乙產品，收入 105、成本為 ☆；維持現狀，收入 80、成本 40。若僅考量利潤，工廠最佳選擇是「維持現狀」，且此選擇的機會成本是「增產乙產品」，則 ☆ 最可能是多少？",
    options: ["80", "70", "60", "50"],
    answer: 1,
    explanation: "維持現狀的利潤為 80−40=40 萬元；增產甲產品的利潤為 120−90=30 萬元。最佳選擇是維持現狀，且機會成本是增產乙產品，表示增產乙的利潤高於另一未選方案甲（30 萬元），但低於維持現狀（40 萬元）。因此 30<105−☆<40，得 65<☆<75；選項中只有 70 符合。",
    solutionSteps: [
      "各策略利潤＝銷貨收入−生產成本。維持現狀利潤是 80−40=40 萬元；增產甲產品利潤是 120−90=30 萬元。",
      "題目指出維持現狀是最佳選擇，且機會成本是增產乙產品，所以乙產品利潤需低於 40 萬元、又高於甲產品的 30 萬元。",
      "令 ☆ 為乙產品生產成本，則 30<105−☆<40，整理得 65<☆<75。四個選項只有 70 萬元落在此範圍，故選 B。"
    ],
    teacherTip: "機會成本是放棄方案中價值最高者；先算每個方案的淨利潤，再用大小關係建立不等式。"
  },
  "OFF-0159": {
    question: "某機關希望縮短民眾停車時間、提高車位流動率，使更多洽公民眾能使用車位，因此設計費率：停車 20 分鐘內離場收 0 元；第一個小時收 40 元；第二個小時起每小時收 100 元。該機關設定停車費率所運用的經濟學概念，與下列何者最相似？",
    options: ["慶祝擴大營業，全店半價促銷", "物價持續上漲，貨幣價值降低", "提高銷貨收入，增加公司利潤", "香蕉價格下跌，種植農民變少"],
    answer: 0,
    explanation: "機關以不同停車時段的費率改變民眾的選擇：短停免收費、久停提高費用，藉價格誘因縮短停車時間、提升車位周轉率。全店半價也利用價格誘因影響消費者行為，因此最相似的是 A。B 是通貨膨脹，C 是營收與利潤關係，D 是價格變動影響供給量，均非以價格設計引導行為。",
    solutionSteps: [
      "題目政策的目的不是單純增加收入，而是利用停車費差異鼓勵短停、減少久停。",
      "價格改變會影響使用者的選擇，屬於以價格誘因引導行為。全店半價促銷同樣以價格調整影響消費者決策。",
      "物價上漲是通貨膨脹；銷貨收入增加不必然是誘因政策；香蕉價格下跌使供給者減少則是供給反應。因此選 A。"
    ],
    teacherTip: "判斷經濟情境時先找政策目的：價格是單純反映市場變化，還是被設計來改變人們的選擇？"
  },
  "OFF-0160": {
    question: "表列燕玲日常生活中的四種情況：甲，鄰居庭院的花枯死了，燕玲對聞不到花香感到可惜；乙，對面住家半夜大聲播放音樂，害燕玲睡不著；丙，隔壁住戶的狼犬警戒心很強，讓燕玲也住得安心；丁，樓下熱炒店被檢舉後油煙味減少，燕玲覺得很高興。哪兩種情況隱含「外部成本」？",
    options: ["甲、乙", "丙、丁", "甲、丙", "乙、丁"],
    answer: 3,
    explanation: "外部成本是某人的行為使未參與交易的他人受損。乙的深夜噪音妨礙燕玲睡眠；丁的油煙曾影響燕玲，油煙減少後她感到高興，表示原本存在由店家活動造成的外部成本。因此答案是乙、丁（D）。甲、丙描述的是鄰居活動帶來的負面或正面外部效益，不是外部成本。",
    solutionSteps: [
      "外部成本指行為者未自行承擔、卻由旁人承受的損害；外部效益則是旁人獲得好處。",
      "乙的深夜音樂使燕玲無法入睡，是噪音造成的外部成本。丁的油煙減少讓燕玲高興，反映原先油煙對她造成外部成本。",
      "甲是花香帶來的外部效益消失；丙是狼犬帶來的安全外部效益，所以符合外部成本的是乙、丁，選 D。"
    ],
    teacherTip: "用「行為者以外的人」是否受損來辨認外部成本；若題目描述改善後鄰居更高興，通常表示原有負面外部性下降。"
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const number = Number(id.slice(4)) - 115;
  if (!question || question.subject !== "社會" || question.source?.year !== 110 || question.source?.questionNumber !== number) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix, { requiresImage: false, requiresContext: false });
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Cleaned OCR-contaminated tables/options and restored specific solutions for 110 social Q28, Q44–45.");
