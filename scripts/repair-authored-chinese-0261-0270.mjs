import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0261": { unit: "詩詞閱讀", teacherTip: "從季節意象推斷時結合植物生長階段和昆蟲活動；「小荷初露」及蜻蜓停立共同支持時節判斷。" },
  "CHI-0262": { unit: "詩詞閱讀", teacherTip: "對讀「紙上得來」與「躬行」兩端，分辨書本知識和親身實踐在深入理解中的互補。" },
  "CHI-0263": { unit: "文言文", teacherTip: "辨認名詞作狀語時檢查它是否修飾後面的動作；「犬坐」是像狗一樣坐，不是另有犬隻。" },
  "CHI-0264": { unit: "文言文", teacherTip: "概括人物寓意時依行動轉折找出關鍵策略：屠戶由受威脅轉為觀察狼、等待空隙再反擊。" },
  "CHI-0265": {
    unit: "文言文",
    question: "《狼》寫「一狼徑去，其一犬坐於前」，後又寫「轉視積薪後，一狼洞其中」。前後情節如何相連？",
    teacherTip: "追蹤《狼》中兩隻狼的位置和行動順序；一隻離開會轉移屠戶注意，另一隻則趁隙繞到柴草堆後。",
  },
  "CHI-0266": {
    unit: "文言文",
    question: "《賣油翁》中陳堯咨射箭十中八九；賣油翁以油從銅錢孔注入、錢面不沾油作示範，並說「無他，但手熟爾」。這主要指出什麼？",
    teacherTip: "解讀《賣油翁》的議論要把「但手熟」和銅錢穿孔的示範連起來；賣油翁以自身熟練技藝回應射箭名家的驕傲。",
  },
  "CHI-0267": {
    unit: "文言文",
    question: "《賣油翁》中陳堯咨見賣油翁示範倒油後，先「忿然」責問；篇末寫「康肅笑而遣之」。這個「笑」最可能包含什麼心理變化？",
    teacherTip: "推論《賣油翁》人物心理時比較前文「忿然」與結尾「笑而遣之」；前後語氣變化可支持態度轉緩，但不必延伸成未明說的細節。",
  },
  "CHI-0268": { unit: "文言文", teacherTip: "分讀「見賢」和「見不賢」兩種情境：前者取法他人長處，後者回頭檢查自己的不足，正反都能成為借鏡。" },
  "CHI-0269": { unit: "文言文", teacherTip: "讀對比句時先確認兩端各自可被奪與不可被奪，再抓「志」作為句子要凸顯的價值。" },
  "CHI-0270": { unit: "文言文", teacherTip: "解釋「器」先取器具用途固定的本義，再看「君子不器」如何引申為人的才識不應受限於單一用途。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
