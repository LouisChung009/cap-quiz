import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const teacher = "https://website.hle.com.tw/mgz/file/jna/114%E5%B9%B4%E6%9C%83%E8%80%83_%E8%A7%A3%E6%9E%90%E5%8D%B7%28%E8%87%AA%E7%84%B6%29-%E7%BF%B0%E6%9E%97.pdf";
const pageFor = number => number <= 4 ? 4 : number <= 8 ? 5 : 6;
const review = (number, note) => ({ status: `已依114年官方自然科第${number}題及翰林教師解析核對`, note, evidenceSources: [`./assets/official-exams/114-science-p${pageFor(number)}.webp`, teacher] });
const patches = {
  11: { question: "某電玩公司為防止兒童誤吞遊戲主機的遊戲卡，在卡片上塗布極苦的苯甲地那銨。當溶液中每 1000 g 含有 30 mg 苯甲地那銨時，濃度是多少？", answer: 2, explanation: "答案 C「30 ppm」。ppm 是百萬分濃度。每 1000 g 溶液含 30 mg 溶質，將 1000 g 換成 1,000,000 mg，質量比為 30/1,000,000，即 30 ppm。", solutionSteps: ["ppm 表示每百萬份溶液中的溶質份數。", "分子、分母換成相同質量單位：30 mg ÷ 1,000,000 mg。", "比例為 30/1,000,000，換算成 ppm 為 30 ppm，選 C。"], teacherTip: "質量濃度比換算前先統一單位；1000 g 等於 1,000,000 mg。", note: "30mg/1000g換算為30ppm，教師解析答案C。" },
  12: { question: "看到喜愛的明星時，小明站在原地大聲尖叫，阿華則追著明星跑。表格列出兩人行為的資料：受器：小明嘴巴、阿華腳；動器：小明僅有喉部肌肉參與、阿華僅有肌肉參與；控制中樞：兩人皆為大腦；傳導神經：小明僅有感覺神經元、阿華僅有運動神經元。以上哪一項目的敘述正確？", answer: 2, explanation: "答案 C「控制的中樞」。兩人都用眼睛看見明星，所以受器不是嘴巴或腳；尖叫和跑步都要肌肉參與。傳導神經的說法也不完整，兩種有意識的行為都需要感覺神經與運動神經傳遞訊息。兩人皆由大腦控制，因此只有控制中樞一項正確。", solutionSteps: ["先判斷受器：兩人都是看見明星，受器應為眼睛，不是嘴巴或腳。", "再判斷神經傳導：訊息需經感覺神經傳入中樞，再由運動神經傳出，不能只涉及其中一種。", "兩人的行為均由大腦控制；只有控制中樞這一列正確，選 C。"], teacherTip: "神經傳導需完整串起受器、感覺神經、中樞、運動神經與動器；不要把受器與執行動作的器官混淆。", note: "原卷表格錯誤敘述已逐項轉寫至題幹，控制中樞為兩人皆是大腦，答案C。" },
  13: { answer: 3, explanation: "答案 D「不適用於高雄，因為冬天時位處季風背風面的高雄氣候偏乾」。臺北、基隆、宜蘭冬季受東北季風影響，其中迎風側較潮濕；高雄位於中央山脈背風側，冬季較乾，因此臺北陽臺避開東北向的理由不能直接套用到高雄。", solutionSteps: ["臺北冬季受東北季風吹拂，迎風處降雨且風可能把雨吹進朝東北的陽臺。", "判斷其他地區時要看東北季風迎風／背風：基隆、宜蘭偏迎風潮濕；高雄在背風側，冬季較乾。", "只有 D 對高雄迎背風與乾濕的敘述正確，選 D。"], teacherTip: "臺灣冬季雨量比較需同時看季風方向、地形迎風面與背風面。", note: "翰林解析認定高雄位季風背風面、冬季偏乾，答案D。" },
  14: { answer: 2, explanation: "答案 C「最多有兩顆白球」。在紅光下呈紅色的球，可能是紅色或白色；兩顆紅色球因此最多都可能是白球。第三顆在紅光下呈黑色，白光下不可能是白色，故三顆中白球最多兩顆。", solutionSteps: ["紅光下呈紅色，代表物體反射紅光；可能是紅色球，也可能是能反射各色光的白球。", "前兩顆最多都可為白球。紅光下呈黑色的第三顆不反射紅光，因此不可能是白球。", "所以白球數最多為兩顆，選 C；不能保證至少有紅球或黑球。"], teacherTip: "不透明物體在有色光下的顏色，是它能反射的入射色光；白色反射各色光，黑色幾乎都吸收。", note: "翰林解析答案C；修正題庫錯置為C索引以外的答案索引。" },
  15: { answer: 1, explanation: "答案 B「板塊會移動而使陸地與海底地形改變」。板塊交界不等同於大陸海岸線；聚合邊界可形成陸地山脈，張裂邊界可形成海底山脈或中洋脊，因此不是所有交界都有相同地形。板塊在軟流圈上移動，會持續改變地表與海底地形。", solutionSteps: ["圖中可見非洲、北美洲、南美洲、歐亞、太平洋及南極等板塊；板塊邊界不必與海岸線重合，排除 A。", "聚合、張裂、錯動邊界造成不同地形，並非每一交界都形成陸地山脈或中洋脊，排除 C、D。", "板塊持續移動，陸地與海底地形會隨之演變，選 B。"], teacherTip: "板塊交界型態不同，形成的地形也不同；勿將所有交界都當成中洋脊。", note: "翰林教師解析答案B；改用單題板塊圖，不再顯示整頁試卷。" },
  16: { answer: 2, explanation: "答案 C「石灰岩形成的時間，可能在 7 百萬年前」最不合理。剖面圖由下而上依序為石灰岩、火山灰形成的岩層（約 8 百萬年前）、頁岩、砂岩；岩脈約 6 百萬年前形成並切穿既有岩層。石灰岩在火山灰層之下，應早於 8 百萬年前，不可能約 7 百萬年前。", solutionSteps: ["地層未倒轉，依沉積先後由下而上較老到較新：石灰岩早於火山灰岩層，後者約 8 百萬年前。", "頁岩、砂岩覆於火山灰岩層之上，且被約 6 百萬年前岩脈切入，因此在 8 至 6 百萬年間形成，A、D合理。", "石灰岩必早於約 8 百萬年前，故說它約 7 百萬年前形成不合理，選 C。"], teacherTip: "相對地質年代先用地層上下關係，再用侵入岩脈切穿關係加上時間界線。", note: "依原卷地層剖面及教師解析，石灰岩早於8百萬年，答案C；改用單題剖面圖。" },
  17: { question: "已知 Ca、Cl 的原子序分別為 20、17。下表中，Ca²⁺ 與 Cl⁻ 的質子數分別以 w、x 表示，電子數分別以 y、z 表示：Ca²⁺：質子數 w、電子數 y；Cl⁻：質子數 x、電子數 z。比較 w、x、y、z，何者正確？", answer: 0, explanation: "答案 A「w＞z」。原子序等於質子數，因此 Ca²⁺ 有 20 個質子、Cl⁻ 有 17 個質子；Ca²⁺ 少兩個電子，為 18 個；Cl⁻ 多一個電子，也是 18 個。故 w=20、x=17、y=18、z=18，只有 w＞z 正確。", solutionSteps: ["Ca 原子序 20、Cl 原子序 17，分別就是兩者質子數：w=20、x=17。", "Ca²⁺ 失去兩個電子，電子數 y=20−2=18；Cl⁻ 得到一個電子，z=17+1=18。", "比較 w、x、y、z：20＞18，因此 w＞z，選 A。"], teacherTip: "陽離子電子數＝質子數減電荷量；陰離子電子數＝質子數加電荷量。", note: "原卷比較表已轉寫至題幹，質子數w=20、x=17，電子數y=z=18，答案A。" },
  18: { answer: 2, explanation: "答案 C「外力 F 小於 400 gw 時，F 越小，靜摩擦力也越小」。圖的橫軸為外力 F（gw）、縱軸為摩擦力 f（gw）：F 從 0 增至 400 gw 時，f 等於 F；木塊開始滑動後，f 降至並維持 300 gw。最大靜摩擦力為 400 gw，動摩擦力為 300 gw。故 A、B、D錯，只有 C正確。", solutionSteps: ["讀圖斜線段：木塊未動時，靜摩擦力大小等於外力，外力越小靜摩擦力也越小。", "斜線最高點為 400 gw，是最大靜摩擦力；達到前木塊仍可靜止。", "滑動後圖線為 300 gw 水平線，表示動摩擦力為定值。因此只有 C 正確。"], teacherTip: "靜摩擦力會配合外力改變直到最大值；物體滑動後的動摩擦力本題視為固定。", note: "教師解析明示最大靜摩擦力400gw、動摩擦力定值300gw，答案C；改用單題曲線圖。" },
  19: { answer: 2, explanation: "答案 C「可與鈣離子反應產生難溶於水的碳酸鹽」。二氧化碳溶於水形成碳酸，碳酸根／碳酸氫根相關反應可與鈣離子形成難溶的碳酸鈣沉澱，將碳固定在岩層中。不是靠二氧化碳密度，也不是形成易溶的碳酸鈉。", solutionSteps: ["題幹描述含二氧化碳的水注入含鈣、鎂離子的岩層，最後形成固體碳酸鹽。", "CO₂ 溶於水形成碳酸，與鈣離子反應可形成難溶的 CaCO₃。", "難溶碳酸鹽留在岩層而固定碳，選 C；鈉鹽通常易溶，不符合固化情境。"], teacherTip: "遇到沉澱固碳題，先辨識離子反應產物的溶解度；碳酸鈣難溶於水。", note: "翰林解析指出CO₂形成碳酸並與Ca²⁺生成難溶CaCO₃，答案C。" },
  20: { answer: 1, explanation: "答案 B「進食後，甲比乙更早導致胰島素分泌量增加」。圖表縱軸為平均血糖（mg/dL），橫軸為餐後時間（分鐘）；甲的血糖較早、較大幅上升，血糖升高會刺激胰臟分泌胰島素，促進細胞利用或儲存葡萄糖，使血糖逐漸下降。升糖素通常在血糖偏低時增加，不是此處血糖上升時的主要反應。", solutionSteps: ["先比較曲線：甲在進食後較早且較明顯地升高，乙上升較慢。", "血糖上升會促使胰臟增加胰島素分泌，以降低血糖；升糖素則主要在血糖過低時協助升糖。", "因此甲較早引發胰島素增加，選 B。"], teacherTip: "胰島素降低血糖、升糖素提高血糖；依曲線變化判斷荷爾蒙反應方向。", note: "依血糖曲線和教師解析，甲較早促使胰島素分泌，答案B；改用單題圖表。" },
};
for (const [numberText, patch] of Object.entries(patches)) {
  const number = Number(numberText);
  const row = rows.find(item => item.subject === "自然" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114自然第${number}題`);
  const { note, ...content } = patch;
  Object.assign(row, content, { answerKeyReview: review(number, note) });
}
const figures = new Map([
  [15, "./assets/official-exams/114-science-q15-plate-map.png"],
  [16, "./assets/official-exams/114-science-q16-strata.png"],
  [18, "./assets/official-exams/114-science-q18-friction-graph.png"],
  [20, "./assets/official-exams/114-science-q20-glucose-chart.png"],
]);
for (let number = 11; number <= 20; number += 1) {
  const row = rows.find(item => item.subject === "自然" && item.source?.year === 114 && item.source.questionNumber === number);
  const figure = figures.get(number);
  row.questionImage = figure ?? null;
  row.questionImages = figure ? [figure] : [];
  row.requiresImage = Boolean(figure);
  row.requiresContext = false;
  row.imageAlt = figure ? `114年會考自然第${number}題專用圖表` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Reviewed official 114 Science Q11–20 against original pages and teacher key; corrected Q12 answer index.");
