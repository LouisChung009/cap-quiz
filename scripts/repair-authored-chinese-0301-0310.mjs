import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0301": { teacherTip: "公告先否定「整齊」再以「而是」說明移除枯枝的目的；抓住避免傷人的因果，別把手段誤當目的。" },
  "CHI-0302": { teacherTip: "把「老屋、新大樓」和「兩個年代」對照閱讀；這是街景新舊並存的感受，不是道路速度或改建情況。" },
  "CHI-0303": { teacherTip: "由「隔天又取出」和「逐句標出」推論人物態度：看他如何處理失敗，不要替人物補上文中沒有的性格。" },
  "CHI-0304": { teacherTip: "按文中順序標出構造、運作原理、適用地點，再判斷說明是從概念原理推進到實際應用。" },
  "CHI-0305": { unit: "修辭", teacherTip: "先確認主體「老鐘」沒有生命，再看「回答」等人的行為是否被賦予它；辨認擬人要抓人類特徵。" },
  "CHI-0306": { teacherTip: "比較「一盞燈」與「整座城市的方向」的局部／整體對照，並依「只在意、看不見」判斷象徵的批評意味。" },
  "CHI-0307": { teacherTip: "答案必須同時保留兩項報告資訊：瓶裝水使用量下降，以及仍需定期檢測水質；不可把「下降」說成「消失」。" },
  "CHI-0308": { teacherTip: "把「不是不肯幫忙」讀作澄清否定，再把「只是」後面的先了解需求讀作原因；留意雙重否定語氣。" },
  "CHI-0309": { unit: "修辭", teacherTip: "找出「像」連接的本體「海面」與喻體「遲到多年的回信」；譬喻以相似聯想表達久候後的感受。" },
  "CHI-0310": { teacherTip: "先取下午場結束時間 16:30，再按「結束前 30 分鐘」倒推；不要把最晚入場時間和閉館時間混淆。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
