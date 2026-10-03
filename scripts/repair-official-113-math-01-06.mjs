import fs from "node:fs";

const file = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const repairs = new Map([
  ["OFF-0746", {
    type: "非選擇題", options: [], answer: null,
    responseParts: [
      { label: "（1）", prompt: "水果和蛋白質的攝取份量關係", answerDisplay: "水果＝蛋白質", acceptableAnswers: ["水果＝蛋白質", "水果=蛋白質", "蛋白質＝水果", "蛋白質=水果", "相等", "一樣多", "相同"] },
      { label: "（2）", prompt: "a、b是否可能同時為正整數？", answerDisplay: "不可能", acceptableAnswers: ["不可能", "不可以", "不能", "否"] },
    ],
    explanation: "（1）答案：水果與蛋白質份量相等。令水果 F、蔬菜 V、穀類 G、蛋白質 P。標語給 V=G 且 V+F 佔總量一半，所以 V+F=G+P；代入 V=G 得 F=P，因此水果＝蛋白質。（2）不可能。矩形餐盤總面積 16×10=160，蔬菜與水果合計占一半為 80；兩者同高 10 公分，因此水果與蔬菜總寬為 8 公分。若水果寬為 a，蔬菜寬為 8−a，且蔬菜比水果多，得 8−a>a，故 0<a<4。蛋白質區塊寬 8、公高 b，水果面積 10a；由 F=P 得 10a=8b，即 5a=4b。因 a、b 為正整數，4 必須整除 a；但 0<a<4，無正整數 a 可符合，故 a、b 不可能同時為正整數。",
    solutionSteps: [
      "（1）設水果、蔬菜、穀類、蛋白質份量分別為 F、V、G、P。由標語得 V=G，且 V+F=(V+G+F+P)/2，所以 V+F=G+P；消去 V=G 後得到 F=P。",
      "（2）餐盤面積 16×10=160，蔬菜與水果合計占一半，面積為 80。兩區高都是 10 公分，故總寬為 8 公分；若水果寬 a，蔬菜寬為 8−a。",
      "蔬菜比水果多表示 8−a>a，故 0<a<4。又水果面積 10a 等於蛋白質面積 8b，得 5a=4b；整數 a 必為 4 的倍數，與 0<a<4 矛盾，所以不可能同為正整數。",
    ],
    teacherTip: "面積比例題先把口語條件翻成等式；「蔬果占一半」先轉成面積等量，再套用蔬菜＝穀類，避免把份量關係誤當成邊長關係。",
  }],
  ["OFF-0747", {
    type: "非選擇題", options: [], answer: null,
    responseParts: [
      { label: "（1）", prompt: "GF的長度（公分）", answerDisplay: "30公分", acceptableAnswers: ["30公分", "30 公分", "30"] },
      { label: "（2）", prompt: "比較CD與AB的長度（請回答CD較大或AB較大）", answerDisplay: "CD較大", acceptableAnswers: ["CD較大", "CD大於AB", "CD>AB", "CD比AB長", "CD較長"] },
    ],
    explanation: "（1）接縫 EF 是外圓半徑與內圓半徑之差，長 80−20=60 公分；G 為 EF 中點，所以 GF=30公分。（2）延長圖中半徑方向與 EF，依四分之一圓對稱可得兩直角三角形全等；每個外側半徑為 80 公分，且由 G 至接縫端點的另一股為 80−30=50 公分。因此 GD=GC=√(80²+50²)=√8900。CD=2√8900，平方為 35600；AB 為大圓直徑 160，AB²=25600。因 35600>25600，CD>AB，故答案是CD較大。",
    solutionSteps: [
      "（1）EF 長度為外半徑減內半徑：80−20=60 公分。G 是 EF 中點，因此 GF=60÷2=30 公分。",
      "（2）依圖延長兩側半徑與接縫，可形成全等的直角三角形；斜邊 GD=GC，兩股為 80 公分與 80−30=50 公分，所以 GD=√(80²+50²)=√8900。",
      "CD=GD+GC=2√8900，故 CD²=35600；AB 是外圓直徑，AB=160，AB²=25600。因 35600>25600 且長度皆為正，CD>AB。",
    ],
    teacherTip: "先從同心圓求接縫長度，再利用中點與直角三角形；比較根式長度時平方兩邊即可，無須先近似小數。",
  }],
  ["OFF-0749", {
    answer: 3,
    explanation: "答案 D。四個點的 x 座標最小為 −4、最大為 5，因此 y 軸左側至少留 4 格、右側留 5 格；y 座標最小為 −5、最大為 4，因此 x 軸下方至少留 5 格、上方留 4 格。只有 D 的原點位置同時滿足四個方向所需格數。",
    solutionSteps: ["檢查 x 座標範圍：−4 到 5，原點左方須至少 4 格、右方至少 5 格。", "檢查 y 座標範圍：−5 到 4，原點下方須至少 5 格、上方至少 4 格。", "逐一比對方格紙上 x、y 軸及原點位置，只有 D 同時預留所需格數，因此答案 D。"],
    teacherTip: "座標點能否畫進有限方格，分別找 x、y 的最大值與最小值，確認原點四周的格數，不要只看單一點。",
  }],
  ["OFF-0751", {
    answer: 3,
    explanation: "答案 D（3/28）。前 30 次共抽出 4 顆紅球且紅球不放回，箱內剩下紅球 10−4=6 顆；白球每次都放回，仍有 50 顆。第 31 次總球數為 50+6=56，抽到紅球的機率為 6/56=3/28。",
    solutionSteps: ["紅球抽出後不放回，前 30 次已抽出 4 顆，所以剩下 10−4=6 顆紅球。", "白球每次抽出後放回，因此仍有 50 顆；箱內總數為 50+6=56 顆。", "第 31 次抽到紅球的機率為 6/56，約分得 3/28，答案 D。"],
    teacherTip: "有放回與不放回要分開追蹤；前 30 次的抽球結果只改變紅球數，白球數維持不變。",
  }],
]);

for (const [id, repair] of repairs) {
  const item = questions.find(question => question.id === id);
  if (!item) throw new Error(`Missing ${id}`);
  if (item.source?.year !== 113 || item.subject !== "數學") throw new Error(`Unexpected official source for ${id}`);
  Object.assign(item, repair);
}

fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Repaired five official 113 math items; converted two to constructed response.`);
