import { readFile, writeFile } from "node:fs/promises";

const path = "data/mission-questions.json";
const rows = JSON.parse(await readFile(path, "utf8"));
const question = rows.find(item => item.id === "OFF-0743");
if (!question) throw new Error("OFF-0743 not found");
if (!question.question.includes("New York began social distancing earlier than the other three cities.")) throw new Error("Unexpected original content; refusing to overwrite");

question.question = "【閱讀材料】A HISTORY LESSON ON THE PANDEMIC (2020.10.29)\n\nSince the Covid-19 pandemic started, people have begun “social distancing”—keeping a safe space between you and anyone you don’t live with. Though it has been a very popular topic this year, social distancing is not a new idea. In fact, it was widely used in the U.S. in the flu pandemic in 1918. But how well did it work? The Americans’ experience can tell us whether it really saved lives.\n\n【圖表】比較 Portland、New York、Denver、Pittsburgh 四座城市在 1918 年流感期間每週每十萬人的死亡人數，以及各城市實施社交距離的期間。\n\nAccording to the chart, which city began social distancing earlier than the other three?";
question.imageAlt = "四城對照圖，灰色區段代表社交距離期間、黑線代表每週每十萬人的死亡人數；橫軸為週數，縱軸為每週死亡人數。";
question.requiresImage = true;
question.requiresContext = false;
question.questionImages = [];
question.questionImage = "assets/official-exams/113-english-q41-chart.png";
question.explanation = "答案是 B「New York」。圖中灰色區塊表示社交距離實施期間；比較四城橫軸上的起點，New York 的灰色區塊最早開始，因此選 B。圖表也以死亡曲線呈現各城的每週死亡變化，但判斷「最早開始」應看灰色區塊的起點，不要誤看成死亡曲線最低或最後 24 週總死亡數最少。";
question.solutionSteps = [
  "先讀圖例：灰色區塊代表社交距離實施時間，黑線代表每週每十萬人的死亡數。",
  "沿著橫軸由左向右比較四城灰色區塊的左端起點；New York 的起點最靠左，代表開始時間最早。",
  "因此選 B「New York」。不要把死亡數較低或實施期間較長，誤當成開始得較早。"
];
question.source.url = "https://cap.rcpet.edu.tw/exam/113/113P_English.pdf";
question.source.paperUrl = "https://cap.rcpet.edu.tw/exam/113/113P_English.pdf";

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Restored official 113 English Q41 chart and source-faithful prompt.");
