import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const rows = questions.filter(row => row.subject === "自然" && row.source?.year === 111 && row.source.questionNumber >= 1 && row.source.questionNumber <= 10);
if (rows.length !== 10) throw new Error(`Expected 10 rows, found ${rows.length}`);
const byNumber = new Map(rows.map(row => [row.source.questionNumber, row]));
for (const row of rows) {
  if (!row.explanation || !row.solutionSteps?.length || row.options?.length !== 4) throw new Error(`Incomplete Q${row.source.questionNumber}`);
  row.questionImage = "";
  row.questionImages = [];
  row.requiresImage = false;
  row.requiresContext = false;
  row.imageAlt = "";
}

const q6 = byNumber.get(6);
q6.question = "【資料】聖誕節（12月25日）兩地比較：紐西蘭約南緯41°，氣候炎熱，常見水上活動、野餐和烤肉；英國約北緯51°，氣候寒冷，常見滑雪、堆雪人與裝飾聖誕樹。住在英國的大介到紐西蘭過聖誕節，依資料推論，當時紐西蘭的白晝與夜晚長度如何？";
q6.solutionSteps = ["先定位兩地半球：紐西蘭在南半球、英國在北半球。", "12月接近南半球夏至、北半球冬至，南半球日照時間較長。", "因此紐西蘭白晝比英國長，選 B。季節相反也可由資料中的炎熱／寒冷看出。"];
q6.explanation = "答案 B。資料顯示聖誕節時紐西蘭炎熱、英國寒冷，說明兩地季節相反。12月接近南半球夏至與北半球冬至，夏季白晝較長、冬季白晝較短，因此紐西蘭白晝比英國長。";
q6.options = ["紐西蘭的夜晚長度比英國長", "紐西蘭的白晝長度比英國長", "紐西蘭的白晝與夜晚長度大約相同", "紐西蘭的白晝與夜晚長度都和英國大約相同"];

const q7 = byNumber.get(7);
q7.question = "【情境】小真認為密封洋芋片袋在山上膨脹是因為氣溫較低。小文要反駁「低氣溫是膨脹原因」的說法，下列哪項最不適合作為反例？";
q7.explanation = "答案 B。判斷反例是否有力，要看是否只改變或控制氣溫，並盡量維持其他條件相同。B 改用硬質玻璃瓶可樂，容器材質、密封方式與可變形程度都和洋芋片袋不同；玻璃瓶沒有膨脹，不能單獨排除氣溫的影響。A、C、D 都是在相近或固定氣溫下觀察洋芋片袋，可直接檢驗氣溫是否足以解釋膨脹。";
q7.solutionSteps = ["先確認待檢驗的因果說法：低氣溫造成密封洋芋片袋膨脹。", "有效反例應觀察同類洋芋片袋，並控制氣溫或在相同氣溫下比較；A、C、D 都針對袋子本身的狀態與氣溫。", "B 換成硬質玻璃瓶，材質、包裝結構及可變形性都不同，控制變因不足，故最不適合作反駁，選 B。"];
q7.teacherTip = "設計反例時要控制其他變因；更換容器材質或結構，不能當作只改變氣溫的公平比較。";

const q8 = byNumber.get(8);
q8.question = "將月球、太陽、氫原子、口腔皮膜細胞依體積由小到大標在數線上的甲、乙、丙、丁四處；位置越靠左代表體積越小，越靠右代表體積越大。各位置依序應填入何者？";
q8.explanation = "答案 B。體積由小到大為氫原子、口腔皮膜細胞、月球、太陽，因此甲、乙、丙、丁依序是氫原子、口腔皮膜細胞、月球、太陽。";
q8.solutionSteps = ["先比較微觀物體：氫原子比口腔皮膜細胞小。", "再比較天體：月球遠小於太陽。", "合併由小到大的順序為氫原子、細胞、月球、太陽，選 B。"];

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`);
console.log("Repaired 111 Natural Science Q1–10 text completeness and image dependencies.");
