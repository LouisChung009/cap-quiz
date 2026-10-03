import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const crops = new Map([
  ["OFF-MATH-111-Q01-MC", ["111-math-q1-figure.png", "111年數學第1題數線A、B、C、D位置圖"]],
  ["OFF-0321", ["111-math-q04-figure.png", "111年數學第4題長方體展開圖"]],
  ["OFF-0330", ["111-math-q13-figure.png", "111年數學第13題圓、弦AB及點C位置圖"]],
  ["OFF-0332", ["111-math-q15-figure.png", "111年數學第15題三角形及角度標記圖"]],
  ["OFF-0333", ["111-math-q16-figure.png", "111年數學第16題緩降機安裝與繩索路徑示意圖"]],
  ["OFF-0334", ["111-math-q17-figure.png", "111年數學第17題三角形與平行截線圖"]],
  ["OFF-0336", ["111-math-q19-figure.png", "111年數學第19題重心、內切圓及切線圖"]],
  ["OFF-0337", ["111-math-q20-figure.png", "111年數學第20題正三角形沿DE摺疊前後圖"]],
  ["OFF-0338", ["111-math-q21-figure.png", "111年數學第21題直徑AB及圓周上四點位置圖"]],
  ["OFF-0340", ["111-math-q23-figure.png", "111年數學第23題三角形內D、E、F位置及線段長度圖"]]
]);

for (const row of rows.filter((item) => item.subject === "數學" && item.source?.year === 111 && item.source.section === "選擇題")) {
  const crop = crops.get(row.id);
  if (crop) {
    row.questionImage = `./assets/official-exams/${crop[0]}`;
    row.questionImages = [row.questionImage];
    row.imageAlt = crop[1];
    row.requiresImage = true;
    continue;
  }
  row.questionImage = "";
  row.questionImages = [];
  row.imageAlt = "";
  row.requiresImage = false;
  row.requiresContext = false;
}

const q24 = rows.find((item) => item.id === "OFF-0341");
q24.question = "日光燈發光效率＝光通量÷功率。PA系列資料（型號：直徑／長度／功率／光通量）：PA-20：25.4毫米／580毫米／20瓦／1440流明；PA-30：25.4毫米／895毫米／30瓦／2340流明；PA-40：25.4毫米／1198毫米／40瓦／3360流明。PB系列：PB-14：15.8毫米／549毫米／14瓦／1200流明；PB-28：15.8毫米／1149毫米／28瓦／2600流明。甲認為PA-20的發光效率比PB-14高；乙認為PA系列中功率較大的燈管發光效率較高。關於甲、乙的看法，下列何者正確？";
q24.questionImage = "";
q24.questionImages = [];
q24.imageAlt = "";
q24.requiresImage = false;
q24.requiresContext = false;

const q25 = rows.find((item) => item.id === "OFF-0342");
q25.question = "比較兩種日光燈安裝方案：基本方案為90支PA-40（每支40瓦），施工費45,000元；省電方案為120支PB-28（每支28瓦），施工費60,000元。耗電量（度）＝支數×每支功率（瓦）×使用時間（小時）÷1000，電費每度5元。假設兩方案每天使用時間相同且只計燈管耗電，使用時間至少超過多少小時，省電方案節省的電費才會高於施工費差額？";
q25.questionImage = "";
q25.questionImages = [];
q25.imageAlt = "";
q25.requiresImage = false;
q25.requiresContext = false;

const q16 = rows.find((item) => item.id === "OFF-0333");
q16.explanation = "答案 A（21.7 公尺）。八樓到一樓共有7個樓層高度，先算垂直高度21公尺；依圖示安裝方式，扣除一樓距地面0.5公尺，再加上八樓落地架高度1.6公尺並扣除落地架距牆0.4公尺。總繩長＝3×7－0.5＋(1.6－0.4)＝21.7公尺。";
q16.solutionSteps = ["八樓到一樓的樓層高度差為8−1＝7層，每層3公尺，所以垂直距離是7×3＝21公尺。", "照圖示計算安裝端修正：落地架高出樓層1.6公尺，但距牆0.4公尺；繩索末端離地0.5公尺，因此列式21＋1.6−0.4−0.5。", "計算得21＋1.2−0.5＝21.7公尺，對應選項A。"];
q16.teacherTip = "讀多段尺寸圖時，先算樓層總高，再逐一判斷哪些端點距離要加、哪些已包含而要扣除。";

const q20 = rows.find((item) => item.id === "OFF-0337");
q20.explanation = "答案 C（9）。摺後圖中 A、D、F、B 共線，故正三角形邊長 AB＝AD＋DF＋FB＝10＋14＋8＝32。由正三角形得 AC＝32。又∠DAF＝∠GBF＝60°，且∠AFD＝∠BFG（對頂角），所以△ADF∼△BGF；AF/BF＝DF/GF，16/8＝14/GF，得 GF＝7。AG＝AF＋FG＝23，因此 CG＝AC−AG＝32−23＝9。";
q20.solutionSteps = ["由摺後圖上的共線順序，AB＝AD＋DF＋FB＝10＋14＋8＝32；ABC 為正三角形，因此 AC＝32。", "△ADF 與 △BGF 有一組60°角，且交點處的角為對頂角，所以兩三角形相似。由 AF/BF＝DF/GF，得16/8＝14/GF，故 GF＝7。", "AG＝AF＋FG＝16＋7＝23，於是 CG＝AC−AG＝32−23＝9，答案C。"];
q20.teacherTip = "摺疊會保留長度；確認摺後哪些點共線，再用相似三角形建立對應邊比例。";

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Completed 111 Math item-material pass (${crops.size} required figure crops; shared tables embedded as text).`);
