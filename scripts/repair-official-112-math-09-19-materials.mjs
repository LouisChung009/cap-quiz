import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const fixes = {
  "OFF-0535": { removeImage: true },
  "OFF-0536": { removeImage: true },
  "OFF-0537": { removeImage: true },
  "OFF-0538": { image: "./assets/official-exams/112-math-q07-figure.png", imageAlt: "112年數學第7題直線L、M與點P的位置圖" },
  "OFF-0539": { removeImage: true },
  "OFF-0540": {
    question: "有多少個正整數是18的倍數，同時也是216的因數？",
    options: ["2", "6", "10", "12"], answer: 1, removeImage: true
  },
  "OFF-0541": {
    question: "利用公式解可得一元二次方程式 3x²−11x−1＝0 的兩解為 a、b，且 a＞b，求 a 值為何？",
    options: ["(−11＋√109)/6", "(−11＋√133)/6", "(11＋√109)/6", "(11＋√133)/6"], answer: 3, removeImage: true
  },
  "OFF-0542": {
    question: "業者以紅、黃、綠標示每杯咖啡的咖啡因含量：紅色代表超過200毫克；黃色代表超過100毫克但不超過200毫克；綠色代表不超過100毫克。某店中杯美式咖啡為360毫升、標示黃色；大杯為480毫升、標示紅色。已知每毫升咖啡因含量相同。我國建議成人每日攝取量不超過300毫克，歐盟建議不超過400毫克。判斷一位成人一日喝2杯該店中杯美式咖啡，是否符合我國或歐盟的建議。",
    removeImage: true
  },
  "OFF-0543": {
    question: "盒玩購買者只知道系列、不知道盒內款式；每款等機率出現。動物系列共有 A 至 F 六款，小友喜歡 A、C 款；汽車系列共有 A 至 E 五款，小友喜歡 B 款。若他買一盒動物系列與一盒汽車系列，求兩盒都抽到喜歡款式的機率。",
    options: ["1/15", "1/10", "2/11", "3/11"], answer: 0, removeImage: true
  },
  "OFF-0544": { image: "./assets/official-exams/112-math-q13-figure.png", imageAlt: "112年數學第13題直角三角柱立體圖" },
  "OFF-0545": {
    question: "坐標平面上有兩個二次函數圖形，頂點 P、Q 皆在 x 軸上，另有一水平線與兩圖形相交於 A、B、C、D，且由左至右依序排列。左側拋物線與水平線交於 A、C，右側拋物線交於 B、D。若 AB＝10、BC＝5、CD＝6，求 PQ 的長度。",
    options: ["7", "8", "9", "10"], answer: 1, removeImage: true
  },
  "OFF-0546": {
    options: ["11", "15", "30", "33"], answer: 3, removeImage: true
  },
  "OFF-0547": { removeImage: true },
  "OFF-0548": {
    options: ["4", "5", "√10", "√20"], answer: 3,
    image: "./assets/official-exams/112-math-q17-figure.png", imageAlt: "112年數學第17題每格邊長為1的方格圖，標出A、O位置"
  },
  "OFF-0549": {
    question: "樂樂停車場24小時營業，收費分時段計算：08:00–20:00每小時20元，該時段最多收100元；20:00–隔日08:00每小時5元，該時段最多收30元。若進、離場時間跨越兩時段，分別計費。阿虹某日10:00進場，停車 x 小時後離場，x 為整數；離場時間在當日20:00至24:00之間。求停車費。",
    removeImage: true
  },
  "OFF-0550": { image: "./assets/official-exams/112-math-q19-figure.png", imageAlt: "112年數學第19題摺紙前後的圓形與弦位置圖" }
};

for (const [id, fix] of Object.entries(fixes)) {
  const item = rows.find(row => row.id === id);
  if (!item || item.subject !== "數學" || item.source?.year !== 112) throw new Error(`Missing or unexpected source item ${id}`);
  if (["OFF-0540", "OFF-0541", "OFF-0543", "OFF-0545", "OFF-0546", "OFF-0548"].includes(id) && item.options.join("") !== "ABCD") throw new Error(`${id}: expected placeholder options; refusing unexpected overwrite`);
  if (fix.question) item.question = fix.question;
  if (fix.options) item.options = fix.options;
  if (Number.isInteger(fix.answer)) item.answer = fix.answer;
  if (fix.removeImage) {
    item.requiresImage = false;
    item.questionImage = "";
    item.questionImages = [];
    item.imageAlt = "";
  }
  if (fix.image) {
    item.requiresImage = true;
    item.questionImage = fix.image;
    item.questionImages = [fix.image];
    item.imageAlt = fix.imageAlt;
  }
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log("Repaired 112 Math Q4–19: restored answer choices and missing table context; removed page screenshots where the prompt is self-contained and retained only required figure crops.");
