import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["九年級上", "第一類條件句", "If the printer runs out of paper, ___ the front desk for more.", ["ask", "asked", "will ask", "asking"], 0, "if 子句使用現在式描述可能條件，主句為祈使句 ask，表示遇到狀況時採取的行動。", ["條件是印表機沒紙。", "指示在此情況下去櫃台詢問。", "祈使句用原形 ask。"], "If + 現在式可搭配祈使句提出指示；不必硬套 will。", ["run out of", "paper", "front desk"]],
  ["九年級上", "第一類條件句", "If the temperature drops below zero tonight, the lake ___ over by morning.", ["freezes", "will freeze", "would freeze", "froze"], 1, "今晚氣溫降到零度以下是未來可能條件，結果預測用 will freeze。", ["找出 tonight 表未來。", "條件句用現在式 drops。", "可能結果用 will + 原形，選 will freeze。"], "第一類條件句：If + 現在式，主句 will + 原形。", ["temperature", "below zero", "freeze"]],
  ["九年級上", "第一類條件句", "If you mix blue paint with yellow paint, you ___ green.", ["got", "get", "will got", "getting"], 1, "這描述可重複成立的事實，條件與結果都用現在簡單式，選 get。", ["判斷混色結果是一般規律。", "一般事實的 if 子句與主句都用現在式。", "主詞 you 搭 get，選 B。"], "零類條件句常用 If + 現在式，主句 + 現在式。", ["mix", "paint", "green"]],
  ["九年級上", "第一類條件句", "If the museum is fully booked, we ___ the online exhibition instead.", ["visit", "visited", "will visit", "would visit"], 2, "若博物館額滿是未來可能情況，改看線上展覽是結果，主句用 will visit。", ["條件子句 is fully booked 用現在式。", "主句表可能的未來決定。", "選 will visit。"], "if 子句談未來時不用 will；will 放在主句表示結果。", ["fully booked", "exhibition", "instead"]],
  ["九年級上", "第二類條件句", "If our classroom ___ a bigger screen, everyone could read the map more easily.", ["has", "had", "will have", "would have"], 1, "主句 could read 暗示假設情況；第二類條件句 if 子句用過去式 had。", ["觀察主句 could read。", "這是假設目前教室設備不同。", "if 子句用 had，選 B。"], "第二類條件句 If + 過去式，主句 would/could + 原形。", ["classroom", "screen", "easily"]],
  ["九年級上", "第二類條件句", "If I ___ the answer, I would explain it to the class.", ["know", "knew", "will know", "have known"], 1, "would explain 表假設結果，if 子句使用過去式 knew。", ["主句有 would explain。", "表示說話者目前不知道答案的假設。", "know 過去式 knew，選 B。"], "第二類條件句用過去式表距離現實的假設，不代表過去時間。", ["answer", "explain", "class"]],
  ["九年級上", "unless 條件句", "Unless the permission form is signed, students ___ on the field trip.", ["cannot go", "could went", "will not going", "didn't go"], 0, "Unless 表除非；表格未簽署這個條件若不成立，學生就不能參加，使用 cannot go。", ["把 unless 理解為 if...not。", "未簽名是不能參加的原因。", "情態助動詞 cannot 後接原形 go。"], "unless = if...not；can/cannot 後接原形動詞。", ["permission", "sign", "field trip"]],
  ["九年級上", "條件句與時間子句", "When the bell ___, please return the lab equipment to the cabinet.", ["will ring", "rings", "rang", "ringing"], 1, "when 引導未來時間子句時，通常用現在式 rings；主句用祈使句。", ["辨認 when 子句描述未來時間。", "時間子句不用 will 表未來。", "bell 是單數，選 rings。"], "when/as soon as + 現在式表未來；主句可用 will 或祈使句。", ["bell", "return", "equipment"]],
  ["九年級上", "第一類條件句", "If the delivery arrives before noon, my sister ___ the package at home.", ["receives", "received", "will receive", "would receive"], 2, "包裹中午前到是未來可能條件，主句用 will receive。", ["if 子句 arrives 是現在式。", "條件指向未來可能事件。", "主句用 will + 原形，選 C。"], "第一類條件句主句用 will/can/may + 原形。", ["delivery", "package", "before noon"]],
  ["九年級上", "第二類條件句", "If the community center ___ closer, more older residents would attend its classes.", ["is", "were", "will be", "has been"], 1, "would attend 表示假設結果，if 子句用過去式；正式假設語氣 be 常用 were。", ["觀察主句 would attend。", "假設中心目前更近。", "be 動詞假設式用 were，選 B。"], "If I were... 是常見假設用法；不表示過去真的曾經如此。", ["community center", "resident", "attend"]],
  ["九年級上", "條件句否定", "If the battery is not charged tonight, the tablet ___ during tomorrow's class.", ["doesn't work", "didn't work", "won't work", "wouldn't worked"], 2, "若今晚未充電，明天上課時可能無法使用；第一類條件句主句用 won't work。", ["條件指今晚，結果指明天。", "這是未來可能結果。", "will not 後接原形 work，選 won't work。"], "will not = won't；助動詞後用原形動詞。", ["battery", "charge", "tablet"]],
  ["九年級上", "條件句與助動詞", "If you feel dizzy during practice, you ___ stop and tell the coach.", ["should", "would have", "had", "are"], 0, "對練習中感到頭暈提出安全建議，使用 should stop。", ["if 子句說明可能發生的情況。", "主句給予建議，而非假設結果。", "should 後接原形 stop，選 A。"], "條件句主句不只用 will，也可用 should、can 或祈使句表建議/指示。", ["dizzy", "practice", "coach"]],
  ["九年級上", "第二類條件句", "If the town had more bike lanes, fewer people ___ cars for short trips.", ["use", "will use", "would use", "used"], 2, "had more bike lanes 是假設，主句描述可能結果，用 would use。", ["if 子句 had 表非現況假設。", "主句使用 would + 原形動詞。", "選 would use。"], "第二類條件句不要在主句漏掉 would/could。", ["bike lane", "fewer", "short trip"]],
  ["九年級上", "時間子句", "As soon as the science video ___, the teacher will ask three questions.", ["will end", "ends", "ended", "ending"], 1, "as soon as 引導未來時間子句時用現在式 ends；主句才用 will ask。", ["辨認 as soon as 子句。", "未來時間子句使用現在式。", "主詞 video 單數，選 ends。"], "as soon as/when/before/after 表未來時，子句通常不用 will。", ["as soon as", "end", "question"]],
  ["九年級上", "條件句與事實推論", "If the water reaches 100°C at sea level, it ___.", ["boils", "boiled", "will boiled", "would boiling"], 0, "這是一般科學事實，使用零類條件句，兩子句都用現在簡單式。", ["確認描述一般物理規律。", "零類條件句條件與結果都用現在式。", "主詞 it 用 boils，選 A。"], "一般事實使用 If + 現在式，主句 + 現在式。", ["reach", "sea level", "boil"]],
  ["九年級上", "第一類條件句", "If the road remains flooded, the school ___ classes online tomorrow.", ["holds", "held", "will hold", "would hold"], 2, "道路持續淹水是未來可能條件，學校明天改線上上課為預測結果，用 will hold。", ["if 子句 remains 用現在式。", "tomorrow 指未來結果。", "選 will hold。"], "條件子句不用 will；主句用 will 表可能的未來安排。", ["remain", "flooded", "online"]],
  ["九年級上", "條件句否定", "If you don't back up the photos, you ___ them if the phone breaks.", ["may lose", "may lost", "will losing", "would lost"], 0, "正確答案是 may lose（A）。不備份且手機損壞可能導致照片遺失，may + 原形 lose 表可能性。", ["找出條件是不備份且手機故障。", "結果不確定，使用 may 表可能。", "may 後用原形 lose，選 A。"], "情態助動詞 may 後接原形；不要加過去式或 -ing。", ["back up", "photo", "break"]],
  ["九年級上", "第二類條件句", "If our school ___ a rooftop garden, science classes could study plants there.", ["builds", "built", "will build", "has built"], 1, "could study 表假設結果，if 子句使用過去式 built。", ["辨認主句 could study。", "屋頂花園是假設尚未存在的設施。", "build 過去式 built，選 B。"], "第二類條件句用過去式表示假設，主句用 could/would + 原形。", ["rooftop", "garden", "plant"]],
  ["九年級上", "unless 條件句", "You won't understand the safety rules unless you ___ the whole notice.", ["read", "will read", "reading", "would read"], 0, "unless 引導條件子句，表示若不讀完整公告就無法理解；未來條件子句用現在式 read。", ["把 unless 子句還原為 if you do not read。", "條件子句談未來仍用現在式。", "選 read。"], "unless 子句不用 will；read 的原形與過去式拼法相同，依句意判斷。", ["unless", "safety rule", "notice"]],
  ["九年級上", "條件句與祈使句", "If you see smoke near the stairs, ___ the building and call for help.", ["leave", "left", "will leave", "leaving"], 0, "if 子句提出緊急條件，主句提供指示，祈使句用原形 leave。", ["辨認 if 後是遇到煙霧的條件。", "主句是安全指示。", "祈使句使用原形 leave，選 A。"], "If + 現在式可搭祈使句提出指示；助動詞 will 不適合命令句。", ["smoke", "stair", "call for help"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(421 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${421 + index}`);
  const [gradeSemester, knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester, unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0421–0440 with varied conditional structures and contexts.");
