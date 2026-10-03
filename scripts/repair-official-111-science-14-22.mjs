import fs from "node:fs";

const file = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const repairs = new Map([
  ["OFF-0410", { answer: 0, explanation: "答案 A。針孔成像依靠光沿直線傳播，光線通過小孔時方向不因小孔而改變。放大鏡使光線折射，後照鏡使光線反射，三稜鏡也會折射並使不同顏色的光偏折程度不同；三者都改變光的傳播方向。" }],
  ["OFF-0411", { answer: 2, explanation: "答案 C（丙）。地下水面是未飽和帶與飽和帶的交界：地下水面以上孔隙未完全被水填滿，以下岩層孔隙則充滿地下水。圖中灰色飽水岩層的上界標示為丙，因此選丙；甲、乙、丁分別不是飽水層上界。" }],
  ["OFF-0412", { answer: 1, explanation: "答案 B。P、Q 到直導線的垂直距離相同，因此磁場強度相同（長直載流導線的磁場強度與距離成反比）。但 P、Q 分別在導線上下兩側，依右手定則，磁場方向一側入紙面、另一側出紙面，方向相反。" }],
  ["OFF-0413", { answer: 2, explanation: "答案 C。觀察萼片細胞及葉綠體等細胞內細微構造，需要倍率較高、能看見細胞細節的複式顯微鏡；觀察整朵花的雄蕊數目，需有較大視野並呈立體影像，使用解剖顯微鏡較適合。" }],
  ["OFF-0414", { answer: 2, explanation: "答案 C。植物的活細胞普遍可進行呼吸作用，但只有含葉綠體並具備適當條件的細胞才能進行光合作用，例如根部細胞通常沒有葉綠體。因此能光合作用的細胞數目（甲）少於能呼吸作用的細胞數目（乙）；差異來自部分細胞沒有葉綠體，而非沒有粒線體。" }],
  ["OFF-0415", { answer: 1, explanation: "答案 B。地表吸收太陽能後會放出紅外線輻射；溫室氣體吸收部分地表紅外線並再放射，使能量留在大氣系統，造成溫室效應。無色、無味或常溫下為氣體都不是此效應的關鍵，對神經的作用也與吸收地表輻射無關。" }],
  ["OFF-0416", { answer: 0, explanation: "答案 A 最不合理。圖中呈現各月份的平均氣溫與降雨量，沒有日間和夜間的溫度資料，不能由月平均氣溫推論恆春的晝夜溫差約 7°C。其餘敘述可由圖表的月降雨柱狀與氣溫折線比較：臺北各月雨量均高於約 50 mm，恆春雨量較集中於 5 至 10 月，臺北月均溫的年變化也較大。" }],
  ["OFF-0417", { answer: 3, explanation: "答案 D。氧化鈣遇水反應生成氫氧化鈣並放出熱：CaO + H₂O → Ca(OH)₂ + 熱。題目問自熱罐隔層所生成的物質，因此是氫氧化鈣，不是碳酸鈉、硫酸鈣或氫氧化鈉。" }],
  ["OFF-0418", { answer: 1, explanation: "答案 B。乙酸乙酯屬於酯類，許多水果中可天然含有酯類香味物質，題幹因此指出其安全性疑慮較低。酯類不只由碳和氫構成；乙酸乙酯的沸點並非高於二氯甲烷；皂化反應產物是羧酸鹽與醇，不是酯。" }],
]);

for (const [id, repair] of repairs) {
  const item = questions.find(question => question.id === id);
  if (!item) throw new Error(`Missing ${id}`);
  if (item.source?.year !== 111 || item.subject !== "自然" || item.answer !== repair.answer) {
    throw new Error(`Unexpected official source or answer index for ${id}`);
  }
  item.explanation = repair.explanation;
}

fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Repaired ${repairs.size} official 111 science explanations.`);
