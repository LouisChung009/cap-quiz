import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["零類條件句", "If you heat ice above 0°C, it ___.", ["melted", "melts", "will melted", "would melt"], 1, "這是一般自然現象，零類條件句的條件與結果都用現在簡單式，選 melts。", ["判斷句子描述普遍事實。", "零類條件句兩部分用現在式。", "主詞 it 搭 melts。"], "一般事實用 If + 現在式，主句 + 現在式。", ["heat", "ice", "melt"]],
  ["第一類條件句", "If the school bus is late, call the office and ___ your teacher.", ["inform", "informed", "will inform", "informing"], 0, "if 子句提出可能情況，主句為祈使指示，動詞用原形 inform。", ["辨認 if 子句說明條件。", "後句要求採取行動。", "祈使句用原形 inform。"], "If + 現在式可接祈使句；表示指示時不必用 will。", ["late", "office", "inform"]],
  ["第二類條件句", "If I ___ a longer break, I would visit the history museum.", ["have", "had", "will have", "am having"], 1, "would visit 表示假設結果，if 子句用過去式 had。", ["找主句 would visit。", "這是假設目前有較長假期。", "have 的過去式 had，選 B。"], "第二類條件句過去式表示假設，不是過去事件。", ["break", "visit", "museum"]],
  ["第一類條件句", "Unless the weather improves, the outdoor concert ___ canceled.", ["is", "will be", "would be", "was"], 1, "Unless 表除非；若天氣沒有好轉，戶外音樂會將被取消，用未來被動 will be canceled。", ["理解 unless 為 if...not。", "結果指向未來且 concert 承受取消。", "用 will be + p.p.，選 B。"], "被動語態 be + p.p.；未來式使用 will be。", ["unless", "improve", "cancel"]],
  ["時間子句", "Before the soup ___, add the fresh herbs.", ["will boil", "boils", "boiled", "boiling"], 1, "before 引導未來時間子句時用現在式 boils；主句是祈使句。", ["找出 before 子句。", "時間子句即使談未來也用現在式。", "主詞 soup 單數，選 boils。"], "before/after/when + 現在式可表示未來時間。", ["soup", "herb", "boil"]],
  ["第二類條件句", "If the library were open on Sundays, I ___ there to study.", ["go", "will go", "would go", "went"], 2, "were open 是假設情況，主句用 would + 原形 go。", ["辨認 if 子句 were。", "這不是現況而是假設。", "選 would go。"], "If + 過去式，主句 would/could + 原形。", ["library", "Sunday", "study"]],
  ["第一類條件句", "If you finish the report tonight, you ___ it to the team tomorrow.", ["send", "sent", "will send", "would send"], 2, "今晚完成是未來可能條件，明天寄送是結果，主句用 will send。", ["if 子句 finish 用現在式。", "tomorrow 指未來結果。", "選 will send。"], "第一類條件句的 if 子句不使用 will，will 放主句。", ["finish", "report", "team"]],
  ["unless 條件句", "You cannot enter the lab unless you ___ safety goggles.", ["wear", "will wear", "wore", "wearing"], 0, "unless 表必要條件；未來規定的條件子句用現在式 wear。", ["把 unless 改寫成 if you do not wear。", "條件是戴護目鏡。", "子句使用現在式 wear。"], "unless 子句談未來仍用現在式；cannot 後接原形。", ["enter", "lab", "goggles"]],
  ["第二類條件句", "If our town ___ a train station, fewer people would drive to work.", ["has", "had", "will have", "is having"], 1, "would drive 表假設結果，if 子句用過去式 had。", ["觀察主句 would drive。", "假設小鎮目前沒有車站。", "選 had。"], "假設現況與事實不同時，用 If + 過去式。", ["town", "station", "fewer"]],
  ["條件句與建議", "If your eyes feel tired, you ___ take a short break from the screen.", ["should", "would have", "had", "are"], 0, "句子針對眼睛疲勞提出建議，使用 should take。", ["if 子句列出可能狀況。", "主句提供健康建議。", "should 後接原形 take。"], "條件主句可用 should 表建議；助動詞後動詞用原形。", ["tired", "break", "screen"]],
  ["第一類條件句", "If the river rises above the warning line, officials ___ the riverside path.", ["close", "closed", "will close", "would close"], 2, "水位可能超過警戒線，管理單位將採取未來措施，主句用 will close。", ["if 子句 rises 是現在式。", "主句描述可能的未來行動。", "選 will close。"], "第一類條件句可表示真實可能的未來情況。", ["river", "warning line", "official"]],
  ["零類條件句", "If metal gets hot, it usually ___.", ["expand", "expands", "will expand", "expanded"], 1, "usually 表一般規律，零類條件句用現在式；it 為單數，選 expands。", ["找 usually 判斷普遍現象。", "條件句和結果都用現在簡單式。", "it 搭配 expands。"], "一般事實用現在式；第三人稱單數加 -s。", ["metal", "usually", "expand"]],
  ["條件句否定", "If the password is incorrect, the website ___ you log in.", ["doesn't let", "won't let", "wouldn't let", "didn't let"], 1, "密碼錯誤時網站將拒絕登入，是未來可能結果，主句用 won't let。", ["if 子句 is incorrect 用現在式。", "結果是接下來無法登入。", "主句用 won't + 原形，選 B。"], "will/won't 後接原形動詞；let 的原形與過去式同形。", ["password", "incorrect", "log in"]],
  ["第二類條件句", "If Mia ___ more confident, she would speak up at meetings.", ["is", "was", "were", "will be"], 2, "would speak 是假設結果；正式假設語氣中 be 動詞常用 were。", ["判斷主句 would speak。", "假設 Mia 目前更有自信。", "選 were。"], "If I/he/she were... 常用於假設語氣。", ["confident", "speak up", "meeting"]],
  ["時間子句", "Once the guests ___, we will serve dinner.", ["will arrive", "arrive", "arrived", "arriving"], 1, "once 引導未來時間子句時使用現在式 arrive，主句 will serve。", ["辨認 once 子句。", "未來時間子句不用 will。", "guests 是複數，選 arrive。"], "once/as soon as/when + 現在式表未來時間。", ["guest", "serve", "dinner"]],
  ["第一類條件句", "If you keep the receipt, you ___ a refund if the product is faulty.", ["can request", "could requested", "will requesting", "would requested"], 0, "保留收據可提出退款申請，can request 表可能具備的權利或能力。", ["條件是保留收據。", "主句說明可採取的行動。", "can 後接原形 request。"], "條件句主句可用 can 表可能性或許可，不限於 will。", ["receipt", "refund", "faulty"]],
  ["第二類條件句", "If the school had a larger library, it ___ more study groups.", ["hosts", "will host", "would host", "hosted"], 2, "had a larger library 表假設，主句使用 would host。", ["辨認 if 子句 had。", "描述非現況假設的結果。", "選 would host。"], "第二類條件句主句使用 would/could + 原形。", ["library", "host", "study group"]],
  ["unless 條件句", "Unless the package arrives by Friday, we ___ the trip without the equipment.", ["take", "took", "will take", "would take"], 2, "Unless 表若不；若包裹未在週五前送達，將在沒有器材的情況下出發，主句用 will take。", ["把 unless 理解為 if it does not arrive。", "主句描述未來決定。", "選 will take。"], "unless 子句不用 will；主句可用 will 表未來結果。", ["package", "arrive", "equipment"]],
  ["條件句與祈使句", "If the smoke alarm sounds, ___ the nearest exit immediately.", ["use", "used", "will use", "using"], 0, "if 子句提出警報響起的條件，主句是安全指示，祈使句用原形 use。", ["辨認緊急狀況條件。", "後句要求立即採取行動。", "祈使句用原形 use。"], "If + 現在式可接祈使句表指示。", ["alarm", "exit", "immediately"]],
  ["第一類條件句", "If the team ___ early, it can set up the equipment before the audience arrives.", ["arrive", "arrives", "will arrive", "arrived"], 1, "條件子句描述未來可能情況，但用現在式；team 視為單數，動詞用 arrives。", ["if 子句談團隊提早抵達。", "第一類條件句 if 子句用現在式。", "team 單數搭 arrives，選 B。"], "If + 現在式，主句可用 can + 原形。", ["set up", "equipment", "audience"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(441 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${441 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "九年級上", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0441–0460 with varied conditional structures and contexts.");
