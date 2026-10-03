import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const corrections = {
  32: {
    question: "反應 2H₂S＋SO₂→2H₂O＋3S。反應前質量：H₂S 70 g、SO₂ 64 g、H₂O 0 g、S 2 g。下列哪一組最可能是反應後各物質的質量（依序為 H₂S、SO₂、H₂O、S）？",
    options: ["A｜64 g、70 g、2 g、0 g", "B｜2 g、0 g、36 g、98 g", "C｜20 g、48 g、0 g、68 g", "D｜0 g、32 g、54 g、48 g"],
    explanation: "答案 B。依反應式 2H₂S＋SO₂→2H₂O＋3S，SO₂ 為限量反應物：64 g SO₂ 完全反應會消耗 68 g H₂S，生成 36 g H₂O 與 96 g S。原本有 70 g H₂S，因此剩下 2 g；原有 2 g 硫也保留，故硫共 98 g。",
    solutionSteps: ["先依反應式判斷質量比例：68 g H₂S 與 64 g SO₂反應。", "SO₂有64 g，全部反應會消耗68 g H₂S，生成36 g水與96 g硫。", "H₂S剩2 g；硫加上原有2 g共98 g，因此選B。"],
    teacherTip: "化學反應前後各元素守恆；題目若有初始生成物，計算反應後質量時也要加回未反應部分。",
  },
  34: {
    question: "甲、乙兩種生物的特徵如下：細胞核—甲有、乙無；細胞膜—兩者皆有；葉綠素—甲無、乙有；菌絲—甲有、乙無。依此判斷甲、乙所屬的分類界，依序為何？",
    explanation: "答案 D「真菌界、原核生物界」。甲有細胞核與菌絲、沒有葉綠素，符合真菌特徵；乙沒有細胞核，具有細胞膜與葉綠素但沒有菌絲，符合原核生物（如藍綠菌）的特徵。",
    solutionSteps: ["甲有細胞核、菌絲且沒有葉綠素，判定為真菌。", "乙沒有細胞核，因此屬原核生物；有葉綠素不會讓它變成植物。", "甲、乙依序為真菌界、原核生物界，選D。"],
    teacherTip: "先用有無細胞核區分原核與真核；生物有葉綠素不代表一定屬於植物界。",
  },
  36: {
    question: "甲、乙、丙三杯濃度相同的澱粉液，加入不同條件處理過的等量澱粉酶，反應相同時間後檢測：甲的碘液反應為藍黑色、本氏液陰性；乙的碘液反應無藍黑色、本氏液陽性；丙的碘液反應藍黑色、本氏液陽性。碘液藍黑色表示仍有澱粉，本氏液陽性表示有還原糖。哪杯中的澱粉酶已完全失去作用？",
    explanation: "答案 A「僅甲」。甲仍有澱粉且沒有檢出還原糖，代表澱粉未被分解，澱粉酶未發揮作用。乙已無澱粉且有還原糖；丙同時有澱粉與還原糖，至少已有部分澱粉被分解，因此不能判為酵素完全失活。",
    solutionSteps: ["碘液陽性表示澱粉仍在；本氏液陽性表示生成還原糖。", "甲為澱粉仍在、還原糖未檢出，表示沒有可觀察到澱粉分解。", "只有甲符合酵素完全失去作用的結果，選A。"],
    teacherTip: "酵素是否失活要同時判讀反應物與生成物，不能只看其中一種檢測。",
  },
  37: {
    question: "由太陽向外，五顆行星依序為水星、金星、地球、火星、木星。假設五顆行星與太陽位於同一平面，下列哪種排列可能發生？",
    explanation: "答案 B。由內而外的軌道順序為水星、金星、地球、火星、木星。太陽、地球、火星可排成一直線，且地球與火星可以分居太陽兩側；其餘選項都違反所列天體的軌道先後關係。",
    solutionSteps: ["先依軌道距離列出順序：太陽—水星—金星—地球—火星—木星。", "地球與火星可分居太陽兩側，因此太陽、地球、火星可共線。", "符合此可能排列的是B；其他選項把內外軌道順序顛倒。"],
    teacherTip: "判斷行星共線時先列軌道由內到外的固定順序，再逐一檢查前後位置。",
  },
  38: {
    question: "某類電扇風速檢測規範隨年代修訂：民國81年未規定樣品位置；105年規定扇葉中心離地至少1.5 m，扇葉轉動平面與前方牆面距離至少1.2 m；106年仍規定扇葉中心離地至少1.5 m，並要求轉動平面與左右牆面等距、扇葉前緣與背牆距離至少1.2 m。這些改變的目的最可能是什麼？",
  },
  40: {
    question: "燒瓶中裝水並加熱至沸騰，停止加熱後塞住瓶口並倒置，使瓶內空氣留在上方。將一袋冰塊放在瓶底（倒置後位於瓶的上方）冷卻瓶內氣體後，瓶中的水又開始由下而上冒泡。這個過程中冰塊降溫造成現象的原因何者最合理？",
  },
};
const figures = new Map([
  [31, ["./assets/official-exams/114-science-q31-circuit-setups.png", "./assets/official-exams/114-science-q31-compass-options.png"]],
  [33, ["./assets/official-exams/114-science-q33-fault-maps.png"]],
  [35, ["./assets/official-exams/114-science-q35-division.png"]],
  [39, ["./assets/official-exams/114-science-q39-velocity-time-graph.png"]],
]);
for (let number = 31; number <= 40; number += 1) {
  const row = rows.find(item => item.subject === "自然" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114自然第${number}題`);
  if (corrections[number]) Object.assign(row, corrections[number]);
  const images = figures.get(number) ?? [];
  row.questionImage = images[0] ?? null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `114年會考自然第${number}題專用圖表` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Science Q31–40 missing materials and full-page scans.");
