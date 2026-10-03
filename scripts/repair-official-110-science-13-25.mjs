import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = new Map([
  ["OFF-0194", ["110-science-q16-car.png", "110年自然科第16題：汽車俯視連續示意圖，標出駕駛與歹徒在車內的位置變化"]],
  ["OFF-0195", ["110-science-q17-map.png", "110年自然科第17題：臺灣附近颱風等壓線圖，中心約1002百帕、外圍約1010百帕"]],
  ["OFF-0197", ["110-science-q19-chart.png", "110年自然科第19題：甲乙丙丁四時期深色蛾與淺色蛾比例堆疊長條圖"]]
]);
const reviewed = rows.filter(item => item.subject === "自然" && item.source?.year === 110 && item.source.questionNumber >= 13 && item.source.questionNumber <= 25);
if (reviewed.length !== 13) throw new Error(`Expected 13 reviewed questions, found ${reviewed.length}`);

for (const item of reviewed) {
  const figure = figures.get(item.id);
  item.requiresImage = Boolean(figure);
  item.requiresContext = false;
  item.optionsInImage = false;
  if (figure) {
    item.questionImage = `./assets/official-exams/${figure[0]}`;
    item.questionImages = [item.questionImage];
    item.imageAlt = figure[1];
  } else {
    item.questionImage = "";
    item.questionImages = [];
    item.imageAlt = "";
  }
}

const byId = new Map(rows.map(item => [item.id, item]));
byId.get("OFF-0191").question = "小新研究日常食物油條時提到，部分業者使用碳酸氫銨（NH₄HCO₃）作為膨鬆劑；高溫油炸時，碳酸氫銨會分解產生三種氣體，使麵糰膨脹。這三種氣體中，不可能含有哪一種？";
byId.get("OFF-0193").question = "胃酸過多的患者即使空腹也會大量分泌鹽酸（HCl），引起胃灼熱或胃痛。此時胃液的 pH 值約為（　）；服用含碳酸氫鈉的胃藥中和胃酸後，pH 值會暫時（　），症狀因而緩解。依序填入哪一組最合理？";
byId.get("OFF-0194").question = "圖(六)為歹徒挾持駕駛時的車內俯視示意圖。一開始汽車筆直前進，歹徒坐在駕駛右後方；歹徒身體先移向左前方想攻擊駕駛。駕駛操控汽車後，歹徒因慣性回到原本右後方角落。下列哪一種操控方式最可能造成圖示情形？";
byId.get("OFF-0196").question = "相同材質的甲、乙兩物體皆為固態，以相同且穩定的熱源均勻加熱。甲質量100 g、升溫20°C、加熱120秒；乙質量300 g、升溫10°C、加熱X秒。兩者均未達熔點，且熱源提供的熱量全被物體吸收。X為多少？";
byId.get("OFF-0196").options = ["60 秒", "120 秒", "180 秒", "360 秒"];
byId.get("OFF-0198").question = "表(四)列出各流星雨預測數量最多日期及其農曆日期：牧夫座6月27日（農曆5月16日）、御夫座9月1日（農曆7月23日）、天龍座10月9日（農曆9月2日）、雙子座12月14日（農曆11月9日）。若希望天然月光干擾最小，應選擇觀測哪一場流星雨？";
byId.get("OFF-0201").question = "柴油引擎廢氣含有氮氧化物（NO、NO₂）。加入氨氣可使氮氧化物反應，降低空氣污染；已知最快反應為 NO + NO₂ + 2NH₃ → 2N₂ + 3H₂O。若廢氣中 NO 約為 NO₂ 的9倍，欲消耗大部分氮氧化物，觸媒轉化器應如何調整反應前的比例？";
byId.get("OFF-0201").options = [
  "將 NO₂ 氧化成 NO，以提高 NO 的比例",
  "將 NO₂ 還原成 NO，以提高 NO 的比例",
  "將 NO 氧化成 NO₂，以提高 NO₂ 的比例",
  "將 NO 還原成 NO₂，以提高 NO₂ 的比例"
];
byId.get("OFF-0202").question = "表(六)列出兩款省電燈泡：甲的額定電壓為110 V、功率23 W；乙的額定電壓為220 V、功率23 W。兩燈泡各正常使用100小時，耗電量分別為 X甲 度與 X乙 度。下列關係式何者正確？";
byId.get("OFF-0202").options = ["X甲 = X乙", "X甲 = 2X乙", "X甲 = 4X乙", "2X甲 = X乙"];

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Reviewed 110 Natural Science questions 13–25; restored missing context and retained ${figures.size} essential diagrams.`);
