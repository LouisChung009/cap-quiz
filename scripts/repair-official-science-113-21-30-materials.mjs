import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
for (let questionNumber = 21; questionNumber <= 30; questionNumber += 1) {
  const id = `OFF-${String(824 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 113 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  row.questionImage = null;
  row.questionImages = [];
  row.requiresImage = false;
  row.requiresContext = false;
  row.imageAlt = "";
}

const q28 = rows.find(item => item.id === "OFF-0852");
q28.question = "美環將兩種不同的天氣系統分為甲、乙，並舉例說明，但例子有錯誤，應如何更正才合理？甲類地面附近空氣由周圍流入中心，例為颱風與太平洋高壓範圍；乙類地面附近空氣由中心向周圍流出，例為蒙古大陸冷氣團。";
q28.options = [
  "颱風移至乙類，另外兩者不變",
  "太平洋高壓範圍移至乙類，另外兩者不變",
  "颱風移至乙類，蒙古大陸冷氣團移至甲類",
  "颱風與太平洋高壓範圍移至乙類，蒙古大陸冷氣團移至甲類"
];

const q25 = rows.find(item => item.id === "OFF-0849");
q25.question = "甲為由岩漿侵入地殼或流出地表後冷卻凝固形成的岩石；乙為未經地殼變動、岩層近水平且較早形成者位於下方的岩石。甲的碎屑物質經長時間的丙作用後會形成乙。關於甲、乙、丙的敘述，何者最合理？";

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 113 Science questions 21–30 source wording and image requirements.");
