import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const batch = rows.filter(row => row.subject === "自然" && row.source?.year === 111 && row.source.questionNumber >= 31 && row.source.questionNumber <= 40);
if (batch.length !== 10) throw new Error(`Expected 10 questions, got ${batch.length}`);
const byId = Object.fromEntries(batch.map(row => [row.id, row]));
const update = (id, values) => {
  if (!byId[id]) throw new Error(`Missing ${id}`);
  Object.assign(byId[id], values);
};
const figure = (id, file, alt) => update(id, {
  questionImage: `./assets/official-exams/${file}`,
  questionImages: [`./assets/official-exams/${file}`],
  imageAlt: alt,
  requiresImage: true,
  requiresContext: false
});
const noFigure = id => update(id, {
  questionImage: "",
  questionImages: [],
  imageAlt: "",
  requiresImage: false,
  requiresContext: false,
  optionsInImage: false
});

update("OFF-0427", {
  question: "帶電離子含有 X、Y、Z 三種不同粒子（質子、電子、中子），三種粒子數分別為 N_X、N_Y、N_Z。已知 X 粒子質量最小。下列哪個敘述正確？",
  options: ["若為陽離子，且 N_Y＞N_X＝N_Z，則 Z 為質子", "若為陽離子，且 N_X＝N_Y＞N_Z，則 Z 為電子", "若為陰離子，且 N_X＝N_Y＞N_Z，則 Z 為質子", "若為陰離子，且 N_X＞N_Y＝N_Z，則 Z 為電子"],
  solutionSteps: ["質子、電子、中子中，電子質量最小，因此 X 必為電子。", "檢查選項 C：若 Z 是質子、Y 是中子，且電子數 N_X＝中子數 N_Y 大於質子數 N_Z，則電子比質子多，離子帶負電。", "這與 C 所說的陰離子一致，故選 C；判電荷只比較質子數與電子數，中子不帶電。"]
});
noFigure("OFF-0427");
update("OFF-0428", {
  solutionSteps: ["碘液遇到澱粉會呈藍黑色；呈黃褐色表示沒有檢測到澱粉。", "甲呈藍黑色，仍含澱粉；乙呈黃褐色，澱粉已被分解。兩管的差異是其中一管加入蜂蜜、另一管加水。", "蜂蜜所含澱粉酶分解了乙管澱粉，所以乙加入蜂蜜，且檢測不到澱粉，選 C。"]
});
noFigure("OFF-0428");

update("OFF-0429", {
  question: "槓桿一的支點 O₁ 在中央，在支點兩側各距20 cm處垂直施力 F₁，兩力方向如圖，使槓桿產生合力矩 L₁。槓桿二的支點 O₂ 在一端，在距支點40 cm處垂直施力 F₂，且 F₁＝F₂＝F。兩槓桿力矩大小 L₁、L₂ 的關係為何？",
  options: ["L₁＝L₂", "L₁＝2L₂", "2L₁＝L₂", "L₁＝0，且 L₁＜L₂"],
  solutionSteps: ["力矩大小＝力×支點到力作用線的垂直距離。槓桿一兩力各為 F、力臂各20 cm，方向使轉動效果相同。", "所以 L₁＝F×20＋F×20＝40F。槓桿二的力矩 L₂＝F×40＝40F。", "兩者相等，選 A。不能因兩個力方向相反就直接相消；要判斷它們相對支點造成的轉動方向。"]
});
figure("OFF-0429", "111-science-q33-torque.png", "兩個槓桿支點、垂直作用力與20及40公分力臂圖");

update("OFF-0430", {
  question: "【資料】水平桌邊固定一條繩，將繩拉水平後以固定頻率上下振動，形成繩波。繩上 P 點相對桌面水平線的高度如下：時間（10⁻² s）為 0、0.5、1.0、1.5、2.0、2.5、3.0、3.5、4.0、4.5；高度（cm）依序為 5.0、2.5、−2.5、−5.0、−2.5、2.5、5.0、2.5、−2.5、−5.0。依據資料，繩波週期最可能為何？",
  solutionSteps: ["週期是同一質點回到相同位移且振動狀態（運動方向）相同所需時間。", "P 點在 t=0 高度5.0 cm；在 t=3.0（表中時間單位為10⁻² s）再次到達5.0 cm，且完整經過一次上、下振動。", "因此週期為3.0×10⁻² s，選 D。表中的時間數字須乘上欄首的10⁻² s。"]
});
noFigure("OFF-0430");

update("OFF-0431", {
  question: "比較血液流出器官甲前後兩項濃度變化：尿素濃度上升，氧氣濃度下降。甲器官最可能是哪一個？",
  solutionSteps: ["流出器官後尿素變多，表示器官內有含氮廢物生成並進入血液。", "肝臟分解胺基酸時會將有毒的含氮廢物轉變為尿素；肝細胞代謝也會消耗血液中的氧。", "因此尿素上升且氧氣下降最符合肝臟，選 B。腎臟會移除尿素，肺臟則會使血氧上升。"]
});
noFigure("OFF-0431");

update("OFF-0432", {
  solutionSteps: ["書櫃未動時加速度為零；依牛頓第二定律，合力為零，但這不代表推力必須隨質量按 F=ma 增大。", "靜摩擦力會配合外推力調整，直到最大靜摩擦力；最大值約為 μₛN，書櫃越重，正向力 N 越大，最大靜摩擦力通常也越大。", "因此小志以最大靜摩擦力解釋較難推合理；阿忠把 F=ma 直接說成質量大就必須施更大推力不成立，選 D。"]
});
noFigure("OFF-0432");
update("OFF-0433", {
  solutionSteps: ["8點至10點、再至12點，海浪上岸位置逐次變低，表示潮位持續下降、正在退潮。", "12點至14點上岸位置變高，表示潮位已轉為上升、正在漲潮。", "下降轉上升的最低點（乾潮）必在12點至14點之間，選 B。題目提供的是趨勢，所以只能判斷時間範圍。"]
});
noFigure("OFF-0433");

update("OFF-0434", {
  solutionSteps: ["天平量得 M 是銅殼本身的質量；球完全浸沒時排開的水體積 V 等於整個空心球外部所占體積。", "球內是真空，空腔也包含在排水體積 V 中，但沒有銅的質量，因此 V 大於銅材料本身的體積。", "用銅殼質量除以較大的外部體積，所得平均密度 D 小於純銅密度8.96 g/cm³，選 A。"]
});
noFigure("OFF-0434");
update("OFF-0434", {
  question: "一個內部為真空的密閉空心金屬球，殼體為純銅。將球完全浸入水中，以排水法測得排水體積 V，再用天平量得質量 M，計算平均密度 D=M/V。若測量與計算皆無誤，為何 D 與純銅密度8.96 g/cm³不同？"
});

update("OFF-0435", {
  question: "表（九）列出人體四種細胞：甲卵細胞、乙受精卵、丙口腔皮膜細胞、丁成熟紅血球。哪些細胞不具有成對的性染色體？",
  solutionSteps: ["卵細胞是單套生殖細胞，只帶一條性染色體，沒有成對的性染色體。", "受精卵及口腔皮膜細胞具有細胞核，通常有成對的性染色體。", "成熟紅血球已無細胞核，也不含染色體；故甲、丁皆不具有成對性染色體，選 B。"]
});
noFigure("OFF-0435");
figure("OFF-0436", "111-science-q40-strata.png", "地層剖面中甲乙丙岩層、火成岩脈與截切關係");
update("OFF-0436", {
  solutionSteps: ["地層未倒轉時，下層先於上層形成；所以丙較乙古老，甲則覆蓋在乙之上、較乙年輕。", "火成岩脈切穿丙與乙，表示岩脈侵入晚於乙層沉積；但岩脈沒有切穿上方甲層，甲沉積又晚於岩脈。", "乙的年代介於距今15,000至10,000年，岩脈晚於乙，故形成時間必晚於乙開始沉積、距今不到15,000年，選 D。無法僅由此判斷它是否早於10,000年。"]
});

for (const row of batch) {
  if (!row.explanation || !row.solutionSteps?.length || row.options?.length !== 4) throw new Error(`Incomplete ${row.id}`);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source data and image/context metadata for 111 Natural Science Q31–40.");
