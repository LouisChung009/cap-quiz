import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const batch = rows.filter(row => row.subject === "自然" && row.source?.year === 111 && row.source.questionNumber >= 21 && row.source.questionNumber <= 30);
if (batch.length !== 10) throw new Error(`Expected 10 questions, got ${batch.length}`);
const byId = Object.fromEntries(batch.map(row => [row.id, row]));
const update = (id, values) => {
  if (!byId[id]) throw new Error(`Missing ${id}`);
  Object.assign(byId[id], values);
};
const figure = (id, files, alt, optionsInImage = false) => {
  const list = Array.isArray(files) ? files : [files];
  update(id, {
    questionImage: `./assets/official-exams/${list[0]}`,
    questionImages: list.map(file => `./assets/official-exams/${file}`),
    imageAlt: alt,
    requiresImage: true,
    requiresContext: false,
    optionsInImage
  });
};
const noFigure = id => update(id, {
  questionImage: "",
  questionImages: [],
  imageAlt: "",
  requiresImage: false,
  requiresContext: false,
  optionsInImage: false
});

update("OFF-0417", {
  question: "自熱罐飲料的底部隔層含氧化鈣（CaO）和水，兩者混合會放熱，使飲料升至約60°C並持續加熱。已知 CaO 與水反應後，隔層中生成的物質應為何？",
  explanation: "答案 D 氫氧化鈣。氧化鈣是鹼性氧化物，與水反應生成氫氧化鈣並放熱：CaO + H₂O → Ca(OH)₂。其餘選項分別為碳酸鈉、硫酸鈣與氫氧化鈉，均不是這兩種反應物的生成物。",
  solutionSteps: ["寫出反應物：氧化鈣 CaO 和水 H₂O。", "鹼性氧化物與水反應形成相應的氫氧化物，配平為 CaO + H₂O → Ca(OH)₂。", "生成物是氫氧化鈣，選 D；反應放出的熱是能量變化，不是另一種物質。"]
});
noFigure("OFF-0417");
noFigure("OFF-0418");
update("OFF-0418", {
  solutionSteps: ["乙酸乙酯屬酯類；生活中常見的酯可存在於水果，並帶來香味，這符合題幹所述選用理由。", "酯分子含有碳、氫、氧，不是只由碳和氫組成，因此 A 錯。", "皂化會使油脂生成脂肪酸鹽（肥皂）和甘油；乙酸乙酯本身則是可揮發的酯類，故選 B。"]
});

update("OFF-0419", {
  question: "【食物鏈】植物 → 鼠 → 蛇 → 鷹；【能量塔】由下而上依序為甲、乙、丙、丁，因此乙代表鼠、丙代表蛇。若蛇類族群的總能量約為10,000能量單位，乙階層的總能量最接近何者？",
  solutionSteps: ["由食物鏈判斷營養階層：植物是生產者，鼠吃植物，蛇吃鼠；所以鼠的能量塔層級比蛇低一層。", "能量傳遞到下一營養階層平均約只有一成，低一層鼠所含能量約是蛇的十倍。", "10,000 × 10 = 100,000 能量單位，選 D。能量塔面積只標示階層，不可當成精確比例尺。"]
});
noFigure("OFF-0419");
figure("OFF-0420", "111-science-q24-weather-map.png", "臺灣、呂宋島與天氣系統甲乙的地面等壓線圖");
update("OFF-0420", {
  solutionSteps: ["先在圖上定位呂宋島北部與系統乙中心，再看等壓線的彎曲方向，判斷當地位於低壓環流的哪一側。", "北半球近地面低壓周圍風向呈反時針並向中心輻合；依圖中等壓線位置，呂宋島北部吹北風或東北風。", "因此選 B。低壓／颱風不會造成中心附近必然晴朗炎熱，A、C、D 都不能由圖示條件推出。"]
});

update("OFF-0421", {
  question: "四輛車甲、乙、丙、丁在筆直道路上運動，其速度—時間圖如圖所示；t=0 s 時四車位於同一位置。t>0 s 時哪兩車的距離會愈來愈遠？",
  solutionSteps: ["在速度—時間圖中，兩條速度線的垂直差值代表同一時刻的相對速度；相對速度持續不為零，兩車間距就會累積改變。", "圖中乙車保持靜止（v=0），丁車速度朝負方向且速度大小增加，乙、丁的相對速度大小持續增加。", "因此兩車從同一位置出發後距離愈來愈遠，選 D。距離是否固定要比速度是否相同，而不是只看起點相同。"]
});
figure("OFF-0421", "111-science-q25-velocity-graphs.png", "甲乙丙丁四車的速度時間圖及各車標記");

update("OFF-0422", {
  question: "【心室血液含氧量】甲心室：19.8 ml O₂／100 ml 血液；乙心室：15.2 ml O₂／100 ml 血液。依據含氧量，哪一條血管最可能與乙心室相連？",
  solutionSteps: ["比較兩心室含氧量：甲為19.8、乙為15.2 ml/100 ml，乙的血液含氧量較低。", "右心室接收全身回流的缺氧血，並經肺動脈送往肺臟；左心室則把含氧較高的血液送入主動脈。", "因此乙最可能是右心室，連接肺動脈，選 D。肺靜脈連回左心房，大靜脈連回右心房，均不是心室出口。"]
});
noFigure("OFF-0422");

figure("OFF-0423", ["111-science-q27-energy-mix-charts.png", "111-science-q27-carbon-table.png"], "甲乙兩國2015與2030發電比例圓餅圖；各發電方式每度電碳排量表");
update("OFF-0423", {
  solutionSteps: ["用圖讀取發電比例，並以表中排碳係數作加權平均：平均排碳＝各能源比例×其每度排碳量後相加。燃煤約790 g、燃氣約380 g，核能與再生能源接近0。", "甲國燃煤約由43%降至25%、燃氣由33%降至26%，低碳能源比例上升；加權排碳由約465.1降至296.3 g/度，下降。", "乙國燃煤由47%降至32%、燃氣由30%升至45%；每15個百分點由燃煤轉燃氣，約減少0.15×(790−380)=61.5 g/度。因此兩國都下降，選 B。"]
});

update("OFF-0424", {
  question: "將20°C純水分成甲、乙兩杯，質量分別為 M甲、M乙，質量比 M甲：M乙＝3：2。兩杯分別以相同熱源加熱，記錄加熱時間與水的上升溫度；假設熱量全被水吸收且不蒸發。四個關係圖中哪一個最符合？",
  solutionSteps: ["相同熱源的功率 P 相同，水的比熱 c 相同；由 Q=mcΔT=Pt 得升溫斜率 ΔT/t=P/(mc)。", "甲的質量是乙的3/2倍，因此甲的升溫斜率是乙的2/3；兩杯都由相同初溫開始，線段應從原點出發。", "選出甲線較平、乙線較陡且斜率比為2:3的圖，為 B。質量較大者升溫較慢。"]
});
figure("OFF-0424", "111-science-q28-heating-graphs.png", "甲乙兩杯水溫升對加熱時間的四個圖形選項", true);

update("OFF-0425", {
  question: "養殖池白蝦可能因高溫與暴雨導致溶氧量及 pH 劇烈變化。建議用水車增加溶氧，並視 pH 情形投放熟石灰 Ca(OH)₂ 調整水質。溶氧量指溶解於水中的氧氣量。依此處理，溶氧量與 pH 的變化方向為何？",
  options: ["溶氧量增加，pH 增加", "溶氧量增加，pH 減少", "溶氧量減少，pH 增加", "溶氧量減少，pH 減少"],
  solutionSteps: ["水車攪動水體並增加水與空氣接觸，促使氧氣溶入水中，所以溶氧量增加。", "熟石灰 Ca(OH)₂ 提供 OH⁻，可中和酸性，使偏低的 pH 往上調整。", "兩項處理方向分別是溶氧增加、pH 增加，選 A；實際投放量仍應依監測值控制。"]
});
noFigure("OFF-0425");

update("OFF-0426", {
  question: "左圖為鑰匙鍍銅的電解裝置，右圖為鋅銅電池。圖中的粗黑箭頭與灰色箭頭，一個表示電子流動方向，另一個表示傳統電流方向。利用鑰匙鍍銅的電極極性與電池外電路方向，判斷鋅銅電池乙電極進行何種反應？",
  solutionSteps: ["鑰匙鍍上銅代表鑰匙是陰極；電解時陰極接電源負極，因此可由鍍銅裝置校準電子流與傳統電流方向。", "鋅銅電池中鋅較活潑，在鋅電極氧化 Zn → Zn²⁺ + 2e⁻；電子沿外電路流向銅電極。", "乙是銅電極，Cu²⁺ 在乙得到電子並還原析出：Cu²⁺ + 2e⁻ → Cu，選 A。傳統電流方向與電子流方向相反。"]
});
figure("OFF-0426", "111-science-q30-electrochemistry.png", "鑰匙鍍銅校準電源極性及鋅銅電池甲乙電極圖");

for (const row of batch) {
  if (!row.explanation || !row.solutionSteps?.length || row.options?.length !== 4) throw new Error(`Incomplete ${row.id}`);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source data and image/context metadata for 111 Natural Science Q21–30.");
