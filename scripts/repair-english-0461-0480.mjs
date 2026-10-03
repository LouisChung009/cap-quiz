import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["零類條件句", "If you freeze water, it ___ into ice.", ["turns", "turned", "will turn", "would turn"], 0, "這是一般自然事實，零類條件句兩部分都用現在式，主詞 it 搭 turns。", ["確認句子描述普遍現象。", "條件與結果都用現在簡單式。", "選 turns。"], "一般規律用零類條件句；第三人稱單數動詞加 -s。", ["freeze", "turn into", "ice"]],
  ["第一類條件句", "If the art supplies arrive today, the students ___ their posters this afternoon.", ["finish", "finished", "will finish", "would finish"], 2, "材料今天送到是未來可能條件，學生下午完成海報是結果，用 will finish。", ["if 子句 arrive 用現在式。", "this afternoon 指可能的未來。", "主句用 will finish。"], "第一類條件句 if 子句不用 will；will 放主句。", ["supply", "poster", "this afternoon"]],
  ["第二類條件句", "If I ___ the school newspaper editor, I would interview the exchange students.", ["am", "were", "will be", "have been"], 1, "would interview 表假設結果，if 子句用假設式 were。", ["找主句 would interview。", "這是假設自己擔任編輯。", "選 were。"], "正式假設語氣 be 動詞常用 were，包括 I/he/she。", ["editor", "interview", "exchange student"]],
  ["unless 條件句", "Unless you keep the receipt, the store ___ an exchange.", ["won't allow", "didn't allow", "wouldn't allowed", "not allow"], 0, "Unless 表除非；若沒有收據，商店將不允許換貨，使用 won't allow。", ["把 unless 改寫為 if you do not keep。", "結果指向未來規則。", "won't 後用原形 allow。"], "won't + 原形動詞；unless 子句本身不用 will。", ["receipt", "exchange", "allow"]],
  ["時間子句", "After the rain ___, volunteers will clean the playground.", ["will stop", "stops", "stopped", "stopping"], 1, "after 引導未來時間子句，使用現在式 stops；主句 will clean。", ["定位 after 子句。", "未來時間子句不使用 will。", "主詞 rain 單數，選 stops。"], "after/when/before + 現在式表示未來時間。", ["volunteer", "playground", "clean"]],
  ["第一類條件句", "If you save the document before closing the app, you ___ your changes.", ["don't lose", "didn't lose", "won't lose", "wouldn't lost"], 2, "儲存檔案是未來可能條件，結果是不會失去修改，使用 won't lose。", ["條件是在關閉前先儲存。", "主句描述未來結果。", "will not 後接原形 lose，選 C。"], "第一類條件句常用 will/won't + 原形表示結果。", ["document", "close", "change"]],
  ["第二類條件句", "If the bus route ___ more often, fewer parents would drive their children to school.", ["runs", "ran", "will run", "has run"], 1, "would drive 是假設結果，if 子句使用過去式 ran。", ["觀察主句 would drive。", "假設公車班次比現在頻繁。", "run 過去式 ran，選 B。"], "第二類條件句用過去式表假設，主句 would/could + 原形。", ["route", "frequently", "fewer"]],
  ["條件句與情態助動詞", "If you have a fever, you ___ stay home and contact a doctor.", ["should", "would have", "had", "are"], 0, "若發燒，待在家並聯絡醫師是建議，使用 should stay。", ["條件是發燒。", "主句給健康建議。", "should 後接原形 stay。"], "條件句主句可使用 should 提供建議。", ["fever", "stay home", "contact"]],
  ["零類條件句", "If a plant gets no light, its leaves usually ___.", ["turn yellow", "turned yellow", "will turned yellow", "would turning yellow"], 0, "描述一般生物現象，使用現在式；複數 leaves 搭原形 turn。", ["usually 顯示一般現象。", "零類條件句結果用現在簡單式。", "選 turn yellow。"], "一般事實不用 will；複數主詞動詞不加 -s。", ["plant", "leaf", "light"]],
  ["第一類條件句", "If the package is delivered before 5 p.m., I ___ it to the repair shop today.", ["take", "took", "will take", "would take"], 2, "包裹今天送達是未來可能條件，主句描述今天會採取的行動，使用 will take。", ["if 子句 is delivered 用現在式。", "today 指未來可能結果。", "選 will take。"], "被動條件子句用現在式，主句用 will 表未來計畫。", ["package", "deliver", "repair shop"]],
  ["第二類條件句", "If our team ___ a map, we could find the trail more easily.", ["has", "had", "will have", "is having"], 1, "could find 表假設結果，if 子句用過去式 had。", ["辨認主句 could find。", "假設目前沒有地圖。", "選 had。"], "第二類條件句主句可用 could 表假設能力或可能性。", ["trail", "map", "easily"]],
  ["unless 條件句", "The plants will dry out unless someone ___ them this weekend.", ["waters", "will water", "watered", "watering"], 0, "unless 表若不澆水，植物會乾枯；條件子句談未來仍用現在式 waters。", ["理解 unless = if no one waters。", "unless 子句用現在式。", "someone 為單數，選 waters。"], "someone 視為單數；unless 子句談未來不用 will。", ["dry out", "water", "plant"]],
  ["時間子句", "As soon as the final bell ___, the students will leave the classroom.", ["will ring", "rings", "rang", "ringing"], 1, "as soon as 引導未來時間子句用現在式 rings，主句 will leave。", ["定位 as soon as 子句。", "未來時間子句用現在式。", "bell 單數搭 rings。"], "as soon as + 現在式可描述即將發生的時間點。", ["final bell", "leave", "classroom"]],
  ["第一類條件句", "If you turn left at the next street, you ___ the post office on your right.", ["find", "found", "will find", "would find"], 2, "指引未來路線時，if 子句用現在式，結果可用 will find。", ["條件是下一個路口左轉。", "後句預測會看到的地點。", "選 will find。"], "路線指引的條件子句可用現在式，主句使用 will 表結果。", ["turn left", "street", "post office"]],
  ["第二類條件句", "If I ___ a telescope, I could observe the moon's craters more clearly.", ["own", "owned", "will own", "am owning"], 1, "could observe 表假設能力，if 子句用過去式 owned。", ["主句含 could observe。", "假設目前沒有望遠鏡。", "選 owned。"], "第二類條件句的過去式表示假設，不代表曾經擁有。", ["telescope", "observe", "crater"]],
  ["條件句與祈使句", "If you notice a broken stair, ___ the building manager immediately.", ["tell", "told", "will tell", "telling"], 0, "if 子句提出發現危險的條件，主句給予指示，祈使句用原形 tell。", ["條件是發現樓梯損壞。", "主句要求立即通報。", "祈使句用 tell，選 A。"], "If + 現在式可接原形祈使句表指示。", ["notice", "broken", "manager"]],
  ["零類條件句", "If people exercise regularly, their hearts ___ stronger.", ["become", "became", "will became", "would becoming"], 0, "這是一般健康原則，使用零類條件句現在式，主詞 hearts 複數搭 become。", ["regularly 表習慣與一般情況。", "一般原則用現在式。", "複數主詞搭 become，選 A。"], "零類條件句結果用現在簡單式；become 不需加 s。", ["exercise", "regularly", "heart"]],
  ["第一類條件句", "If the library is quiet, our group ___ there to prepare for the debate.", ["meets", "met", "will meet", "would meet"], 2, "圖書館若安靜是未來可能條件，讀書小組會在那裡碰面，使用 will meet。", ["if 子句 is quiet 用現在式。", "主句描述可能的未來安排。", "選 will meet。"], "第一類條件句的主句可表示計畫或可能結果。", ["quiet", "prepare", "debate"]],
  ["第二類條件句", "If the school canteen ___ healthier meals, more students would eat there.", ["offers", "offered", "will offer", "has offered"], 1, "would eat 是假設結果，if 子句用過去式 offered。", ["觀察主句 would eat。", "假設目前餐廳沒有提供更多健康餐。", "選 offered。"], "第二類條件句用過去式搭配 would + 原形。", ["canteen", "healthy", "offer"]],
  ["unless 條件句", "Unless you label the samples, you ___ which one contains salt.", ["won't remember", "didn't remember", "wouldn't remembered", "not remember"], 0, "Unless 表若不標記，就無法辨認；主句談未來結果用 won't remember。", ["還原 unless 為 if you do not label。", "辨認結果是之後無法辨別。", "won't 後接原形 remember。"], "unless 子句用現在式，主句可用 won't 表未來結果。", ["label", "sample", "contain"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(461 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${461 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "九年級上", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0461–0480 with distinct conditional grammar contexts.");
