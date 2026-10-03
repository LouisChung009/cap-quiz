import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0343", question: "某宗教的全球大型集會於 2017 年約有 235 萬人參與。來源國表列沙烏地阿拉伯、印尼、巴基斯坦、伊朗、土耳其、奈及利亞、埃及等國。此活動最可能是哪一種？", options: ["佛教浴佛節", "印度教大壺節", "伊斯蘭教朝覲", "天主教聖誕彌撒"], answer: 2, explanation: "表中來源國包含沙烏地阿拉伯、印尼、巴基斯坦、伊朗、土耳其、奈及利亞及埃及，皆有大量穆斯林人口；配合每年數百萬人前往的全球宗教集會，最符合伊斯蘭教朝覲，答案 C。", steps: ["先辨識表格列出的是參與者來源國及人數，沙烏地阿拉伯最多。", "多個主要來源國位於伊斯蘭文化圈，與前往麥加的朝覲活動相符。", "因此活動是伊斯蘭教朝覲，答案 C；其他宗教節慶不能同時解釋這組國別分布。"], tip: "用多個來源國的共同宗教文化線索判讀，不要只因單一國家下結論。" },
  { id: "OFF-0344", question: "臺灣一處具有特殊泥岩惡地景觀的地點，位於板塊交界附近及海岸山脈最南端，泥岩夾雜外來岩塊。依圖(一)的位置標示，該地質公園最可能位於何處？", options: ["甲", "乙", "丙", "丁"], answer: 1, explanation: "題幹的關鍵是「海岸山脈最南端」及板塊交界附近，指向臺灣東南部、臺東南端一帶；圖(一)該位置標為乙，答案 B。", steps: ["把海岸山脈定位在臺灣東側，並找其最南端。", "再與題幹指出的板塊交界附近及泥岩惡地特徵相互核對。", "圖中臺灣東南側標記為乙，所以選 B；甲在東北、丙在最南端以外的南側，丁在西南側。"], tip: "地點題先把文字地形線索轉成方位，再對照地圖標記。" },
  { id: "OFF-0345", question: "中國夏季氣候由「濕熱」逐漸變為「乾熱」的路線，最可能是圖(二)中的哪一條？", options: ["甲", "乙", "丙", "丁"], answer: 2, explanation: "中國夏季季風由東南沿海向內陸帶來水氣，沿途水氣逐漸減少，因此氣候可由東南側的濕熱轉為內陸較乾熱。對照圖(二)，最能代表這種季風影響方向的是丙，答案 C。", steps: ["先確認題目限定夏季：季風由海洋帶來水氣，東南沿海較濕熱。", "沿季風深入內陸，水氣供應逐漸減少，氣候轉為較乾熱。", "比對圖(二)各路線，丙呈現由東南沿海往內陸的變化，答案 C。"], tip: "判讀季風路線要看起點、方向和距海變化，不要只用東西方位概括。" },
  { id: "OFF-0346", question: "截至 2019 年底，臺灣主要水庫中有多座淤積率超過 30%，泥砂淤積會降低蓄水功能。下列哪項策略最能改善此現象？", options: ["強化集水區崩塌裸露地的植被復育", "擴大在河川下游種植防風林的面積", "減少都市不透水鋪面，增加雨水入滲", "增加地面水源供應，以取代地下水源"], answer: 0, explanation: "水庫淤積的泥砂主要由集水區坡地沖蝕、崩塌後隨河流帶入。復育裸露地植被可穩定土壤、減少泥砂來源，因此最直接有效，答案 A。", steps: ["先找淤積物來源：集水區侵蝕及崩塌產生的泥砂。", "植被根系有助固定土壤，減少坡面沖蝕及泥砂進入河道。", "所以優先復育集水區裸露地，答案 A；都市入滲措施改善逕流，卻非直接控制上游泥砂來源。"], tip: "環境治理要針對問題源頭；下游或都市措施不一定能減少水庫集水區泥砂。" },
  { id: "OFF-0347", question: "圖(三)為 1980 年代臺灣雜誌封面，畫面強調新聞自由與「百分之百自由」的訴求。此政治訴求最可能與何者有關？", options: ["中共當局代表選票及總統直選", "政府應妥善處理二二八事件", "政府推行國語運動使母語式微", "解除戒嚴並解除對新聞媒體的限制"], answer: 3, explanation: "1980 年代臺灣仍處戒嚴與媒體管制背景，雜誌封面直接以新聞自由、解除新聞限制為訴求，最符合解除戒嚴及放寬新聞管制，答案 D。", steps: ["從封面文字抓住核心訴求：新聞自由、解除報禁。", "將 1980 年代置於臺灣政治逐步解嚴、開放媒體的脈絡。", "解除戒嚴並放寬新聞限制最符合題意，答案 D；其他選項分別指選舉、二二八及語言政策。"], tip: "年代與訴求要一起判讀；新聞自由與解除報禁是解嚴前後的重要政治議題。" },
  { id: "OFF-0348", question: "圖(四)是中國歷史上的官方文件，記載戶主及家中不同年齡成員。依文件登錄人口與年齡資料的內容，政府製作此文件最可能有何目的？", options: ["配合科舉選拔人才", "掌握人力以徵集賦稅和勞役", "保障貴族世襲權力", "依儒家思想實施仁政"], answer: 1, explanation: "文件逐戶記錄戶主、家屬及年齡，能掌握人口與勞動力，作為徵收賦稅、徵發徭役的行政依據；內容不是科舉考試或貴族世襲名冊，答案 B。", steps: ["觀察文件登錄單位是家庭，並列出各成員及年齡。", "人口與年齡資料可協助政府掌握戶籍、可徵稅與服役人力。", "因此主要目的為徵集賦稅及勞役，答案 B。"], tip: "讀古代文書要先辨認登錄對象與欄位，再推論行政用途。" },
  { id: "OFF-0349", question: "柯因奈語（Koine）約形成於西元前四世紀，隨某帝國統一愛琴海地區希臘城邦並向埃及、西亞征服擴散。這個帝國最可能是哪一個？", options: ["波斯帝國", "蒙兀兒帝國", "亞歷山大帝國", "阿茲提克帝國"], answer: 2, explanation: "西元前四世紀亞歷山大征服並統一希臘城邦，建立跨越埃及與西亞的帝國；希臘語隨政治與文化擴張成為廣泛使用的通用語，答案 C。", steps: ["用年代定位：西元前四世紀。", "再看活動範圍：愛琴海、埃及及西亞，與亞歷山大東征版圖吻合。", "因此是亞歷山大帝國，答案 C；其他帝國的時代或地區不合。"], tip: "帝國題以年代、核心區及擴張方向三條線索交叉確認。" },
  { id: "OFF-0350", question: "圖(五)為臺灣考古遺址同一文化層出土的四種石器：甲為架高陶罐以便生火炊煮的石支腳；乙為多種錘打功能的凹石；丙為磨製石器；丁為網墜。何者最適合作為判斷該文化層所屬時代的證據？", options: ["甲", "乙", "丙", "丁"], answer: 2, explanation: "石器的製作技術可反映文化層的技術發展；圖中丙為磨製石器，能用來辨認新石器時代常見的磨製技術，答案 C。網墜、凹石或炊煮支架較難單獨作為時代判定依據。", steps: ["先比較四種器物的功能與製作特徵。", "丙呈現磨製石器特徵，磨製技術是判斷新石器時代的重要考古線索。", "因此丙最適合作為時代證據，答案 C。"], tip: "考古時代判斷要看具代表性的技術與脈絡，單一器物功能可能跨時代延續。" },
];

const visualRepairs = {
  "OFF-0344": { requiresImage: true, imageAlt: "臺灣泥岩惡地地質公園位置圖", questionImage: "./assets/official-exams/111-social-q02-taiwan-locations.png", questionImages: ["./assets/official-exams/111-social-q02-taiwan-locations.png"] },
  "OFF-0345": { requiresImage: true, imageAlt: "中國濕熱與乾熱氣候變化的路線示意圖", questionImage: "./assets/official-exams/111-social-q03-china-routes.png", questionImages: ["./assets/official-exams/111-social-q03-china-routes.png"] },
  "OFF-0349": { requiresImage: false, imageAlt: "", questionImage: "", questionImages: [] },
};

for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.options.length !== 4 || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { question: item.question, options: item.options, optionsInImage: false, explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip }, visualRepairs[item.id] || {});
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for 111 social questions 1–8.");
