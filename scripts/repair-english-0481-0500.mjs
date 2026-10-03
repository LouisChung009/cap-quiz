import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["零類條件句", "If you press this button, the screen ___ brighter.", ["becomes", "became", "will became", "would become"], 0, "這是設備操作的一般結果，使用現在簡單式；screen 單數搭 becomes。", ["判斷操作說明的一般結果。", "零類條件句使用現在式。", "選 becomes。"], "一般規則使用現在式，第三人稱單數加 -s。", ["press", "button", "brighter"]],
  ["第一類條件句", "If the weather stays clear, the astronomy club ___ the stars tonight.", ["observes", "observed", "will observe", "would observe"], 2, "今晚觀星是未來可能安排，if 子句 stays 用現在式，主句用 will observe。", ["找出 tonight 的未來線索。", "if 子句使用現在式。", "主句用 will observe。"], "第一類條件句：If + 現在式，主句 will + 原形。", ["weather", "astronomy", "observe"]],
  ["第二類條件句", "If the gym ___ closer to my house, I would walk there after school.", ["is", "were", "will be", "has been"], 1, "would walk 表假設結果，if 子句用假設式 were。", ["辨認主句 would walk。", "假設健身房目前的位置不同。", "be 動詞用 were，選 B。"], "假設語氣常用 If + were，即使主詞是單數也可用 were。", ["gym", "closer", "after school"]],
  ["unless 條件句", "Unless the classroom is ventilated, the air ___ stuffy during the experiment.", ["becomes", "became", "will become", "would became"], 2, "若教室沒有通風，實驗期間空氣將變悶熱，主句用 will become。", ["理解 unless = if it is not ventilated。", "條件子句使用現在式。", "未來結果用 will become。"], "unless 子句不用 will；主句依未來結果使用 will。", ["ventilate", "stuffy", "experiment"]],
  ["時間子句", "When the online registration ___, the website will send a confirmation email.", ["will finish", "finishes", "finished", "finishing"], 1, "when 引導未來時間子句時使用現在式 finishes；主句 will send。", ["定位 when 子句。", "未來時間子句不用 will。", "registration 單數搭 finishes。"], "when + 現在式可談未來；主句再使用 will。", ["registration", "confirmation", "email"]],
  ["第一類條件句", "If you follow the recipe carefully, the bread ___ soft and moist.", ["stays", "stayed", "will stay", "would stay"], 2, "照食譜操作後的結果是未來可能性，主句用 will stay。", ["條件是仔細照食譜。", "主句預測烘焙結果。", "選 will stay。"], "主句使用 will + 原形表可能的未來結果。", ["recipe", "carefully", "moist"]],
  ["第二類條件句", "If Daniel ___ a little taller, he could reach the top shelf.", ["is", "was", "were", "will be"], 2, "could reach 表假設能力，正式假設語氣用 were。", ["觀察主句 could reach。", "身高情況是假設。", "選 were。"], "第二類條件句可用 If + were 表示與現況不同的假設。", ["reach", "shelf", "taller"]],
  ["第一類條件句", "If the bus doesn't arrive in five minutes, we ___ a taxi.", ["take", "took", "will take", "would take"], 2, "五分鐘內公車未到是未來可能條件，搭計程車是結果，使用 will take。", ["if 子句 doesn't arrive 用現在式。", "主句描述接下來的決定。", "選 will take。"], "第一類條件句主句用 will 表未來結果。", ["arrive", "in five minutes", "taxi"]],
  ["條件句與建議", "If the instructions seem unclear, you ___ ask the lab assistant before starting.", ["should", "would have", "had", "are"], 0, "若指示不清楚，開始前詢問助理是合理建議，使用 should ask。", ["條件是指示不清楚。", "主句給予建議。", "should 後用原形 ask。"], "should + 原形動詞表示建議。", ["instruction", "unclear", "assistant"]],
  ["零類條件句", "If you add salt to ice, its melting point ___.", ["decreases", "decreased", "will decreased", "would decreasing"], 0, "這描述溶液的普遍科學性質，零類條件句用現在式；point 單數搭 decreases。", ["判斷是一般科學原理。", "條件與結果都用現在簡單式。", "選 decreases。"], "科學事實常用零類條件句。", ["salt", "melting point", "decrease"]],
  ["unless 條件句", "You will miss the opening speech unless you ___ before 9:00.", ["arrive", "will arrive", "arrived", "arriving"], 0, "unless 表若不提早抵達就會錯過演講，條件子句用現在式 arrive。", ["把 unless 改寫為 if you do not arrive。", "這是未來條件子句。", "選 arrive。"], "unless 子句談未來仍用現在式，不用 will。", ["miss", "opening speech", "before"]],
  ["第二類條件句", "If we ___ the answer key, we could check our work at home.", ["have", "had", "will have", "are having"], 1, "could check 表假設結果，if 子句用過去式 had。", ["找出主句 could check。", "假設目前沒有答案卷。", "選 had。"], "第二類條件句 if 子句用過去式，主句用 could/would + 原形。", ["answer key", "check", "work"]],
  ["時間子句", "As soon as the doctor ___ the test results, she will call the patient.", ["will receive", "receives", "received", "receiving"], 1, "as soon as 引導未來時間子句用現在式 receives；主句 will call。", ["辨認 as soon as 子句。", "未來時間子句使用現在式。", "doctor 單數搭 receives。"], "as soon as + 現在式表未來時間。", ["test result", "patient", "receive"]],
  ["第一類條件句", "If the store has your size, it ___ the shoes to your home tomorrow.", ["delivers", "delivered", "will deliver", "would deliver"], 2, "明天寄送是未來可能結果，if 子句 has 用現在式，主句用 will deliver。", ["找出 tomorrow。", "條件子句不用 will。", "主句選 will deliver。"], "第一類條件句描述真實可能的未來情況。", ["size", "deliver", "home"]],
  ["第二類條件句", "If the classroom ___ more windows, it would receive more natural light.", ["has", "had", "will have", "is having"], 1, "would receive 是假設結果，if 子句用過去式 had。", ["觀察主句 would receive。", "假設教室窗戶比現況多。", "選 had。"], "would + 原形常提示第二類條件句。", ["window", "natural light", "receive"]],
  ["第一類條件句", "If you keep the plants in direct sunlight, their soil ___ faster.", ["dries", "dried", "will dry", "would dry"], 2, "把植物放在直射陽光下是未來可能條件，結果預測用 will dry。", ["辨認條件與可能結果。", "if 子句用現在式 keep。", "主句使用 will dry。"], "第一類條件句結果也可用 will + 原形。", ["direct sunlight", "soil", "dry"]],
  ["條件句與祈使句", "If you finish using the microscope, ___ the cover over it.", ["place", "placed", "will place", "placing"], 0, "if 子句提出完成觀察的條件，主句是操作指示，祈使句用原形 place。", ["條件是用完顯微鏡。", "後句要求蓋上防塵罩。", "祈使句用 place。"], "If + 現在式可搭原形祈使句。", ["microscope", "cover", "place"]],
  ["零類條件句", "If the Earth's shadow covers the moon, a lunar eclipse ___.", ["occurs", "occurred", "will occurred", "would occurring"], 0, "這是月食形成的一般天文現象，使用現在簡單式；eclipse 單數搭 occurs。", ["判斷句子敘述天文規律。", "零類條件句結果用現在式。", "選 occurs。"], "一般科學事實用現在式，不必加 will。", ["Earth's shadow", "moon", "eclipse"]],
  ["unless 條件句", "Unless the road is repaired soon, delivery trucks ___ to reach the village.", ["won't be able", "weren't able", "wouldn't able", "not able"], 0, "Unless 表若道路不盡快修好，卡車將無法抵達；未來結果用 won't be able to。", ["把 unless 理解為 if the road is not repaired。", "結果指未來能力受限。", "選 won't be able，後接 to reach。"], "be able to 表能力；未來否定為 will not be able to。", ["repair", "delivery truck", "village"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(481 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${481 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "九年級上", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0481–0500 with distinct conditional grammar contexts.");
