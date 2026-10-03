import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["七年級上", "字彙與語境", "The museum is ___ on Mondays, so we should visit it on Tuesday.", ["closed", "crowded", "wide", "expensive"], 0, "句意說週一不能參觀、改週二前往，因此 museum 週一是 closed（關閉的）。crowded 是擁擠，無法解釋改日期。", ["讀後半句：他們改在星期二參觀。", "推知星期一博物館不開放。", "closed 表示關閉，選 A。"], "closed（關閉的）與 open（開放的）相反；不要把 crowded（擁擠的）混為一談。", ["closed", "open", "museum"]],
  ["七年級上", "現在進行式", "Be quiet! The baby ___ in the next room.", ["sleeps", "is sleeping", "slept", "has slept"], 1, "Be quiet! 表示說話當下要安靜，baby 此刻正在睡覺，用現在進行式 is sleeping。", ["找時間線索 Be quiet!，指現在。", "動作正在發生，使用 be + V-ing。", "主詞 the baby 為單數，選 is sleeping。"], "現在進行式為 am/is/are + V-ing；第三人稱單數用 is。", ["asleep", "sleepy", "sleep"]],
  ["七年級上", "頻率副詞", "Leo ___ walks to school because his father drives him every day.", ["always", "never", "usually", "often"], 1, "父親每天開車載 Leo 上學，表示 Leo 從不步行，因此用 never。", ["關鍵是 father drives him every day。", "這代表 Leo 沒有步行上學。", "never 表示從不，選 B。"], "頻率副詞要依句中事實判斷；never 不可和肯定頻率混淆。", ["never", "seldom", "sometimes"]],
  ["七年級下", "過去式", "We ___ the science museum last Saturday, but it was closed.", ["visit", "visited", "will visit", "are visiting"], 1, "last Saturday 是明確過去時間；visit 的規則過去式為 visited。", ["圈出 last Saturday，確認事件已發生。", "一般動詞過去式加 -ed。", "選 visited。"], "規則動詞加 -ed；不要因後句使用 was 就把前句寫成現在式。", ["visit", "visited", "visitor"]],
  ["七年級下", "比較級", "The library is ___ than the café, so it is a better place to study.", ["quiet", "quieter", "quietest", "more quietly"], 1, "than 表示兩者比較；quiet 為單音節形容詞，通常加 -er 成為 quieter。", ["看到 than，判斷使用比較級。", "比較的是兩個地點的安靜程度。", "quiet 的比較級是 quieter，選 B。"], "比較級常見形式為形容詞 + -er；最高級才用 -est。", ["quiet", "quieter", "quietly"]],
  ["七年級下", "介系詞", "The school concert starts ___ 7:30 p.m. Please arrive early.", ["at", "on", "in", "for"], 0, "7:30 p.m. 是明確時刻，時間介系詞使用 at。", ["辨認空格後是時刻，不是日期或月份。", "明確時刻前用 at。", "選 at。"], "at + 時刻；on + 日期或星期；in + 月份、年份或較長時段。", ["at", "on time", "arrive"]],
  ["八年級上", "動名詞", "Maya enjoys ___ short stories before bed.", ["read", "to reading", "reading", "reads"], 2, "enjoy 後接動名詞，read 要改為 reading。", ["先確認主要動詞是 enjoys。", "enjoy 後的動詞使用 V-ing。", "選 reading。"], "enjoy doing something；不要套用 want to do 的不定詞規則。", ["enjoy", "reading", "story"]],
  ["八年級上", "不定詞", "The coach asked us ___ early for practice tomorrow.", ["arrive", "arriving", "to arrive", "arrived"], 2, "ask + 人 + to V 表示要求某人做某事，故用 to arrive。", ["句型主詞是 the coach，受詞是 us。", "ask + 人 + to V。", "選 to arrive。"], "ask/tell/want + 人 + to V；不要漏掉 to。", ["ask", "arrive", "practice"]],
  ["八年級上", "連接詞", "Nina took a taxi ___ she was afraid of missing the last train.", ["because", "although", "unless", "while"], 0, "害怕錯過末班車是搭計程車的原因，使用 because 引導原因子句。", ["先找兩分句的關係：搭車與擔心錯過末班車。", "後者解釋前者的原因。", "because 表示因為，選 A。"], "because 表原因；although 表讓步，unless 表除非。", ["because", "reason", "miss"]],
  ["八年級上", "被動語態", "The old bridge ___ after the typhoon damaged it last year.", ["repairs", "repaired", "was repaired", "is repairing"], 2, "bridge 是被修理的對象，需用被動語態；last year 指過去，使用 was repaired。", ["主詞 bridge 不會自己修理。", "被動語態為 be + 過去分詞。", "過去式單數為 was repaired。"], "被動語態看主詞是否承受動作，再配合時間決定 be 動詞時態。", ["repair", "repaired", "bridge"]],
  ["八年級上", "現在完成式", "I ___ this book twice, so I can lend it to you now.", ["read", "have read", "am reading", "will read"], 1, "twice 表示到現在為止完成兩次閱讀，且結果與現在相關，使用現在完成式 have read。", ["辨認次數 twice。", "經驗從過去延續到現在。", "主詞 I 搭配 have，選 have read。"], "現在完成式 have/has + p.p.；read 的三態拼字相同但發音不同。", ["read", "twice", "lend"]],
  ["八年級下", "關係代名詞", "The student ___ won the speech contest thanked her teacher.", ["which", "who", "where", "when"], 1, "先行詞 the student 指人，關係子句中缺主詞，使用 who。", ["找出被修飾的先行詞 the student。", "人作先行詞且子句缺主詞。", "選 who。"], "who 指人；which 指物；where 指地點；when 指時間。", ["student", "who", "contest"]],
  ["八年級下", "情態助動詞", "You ___ wear a helmet when riding a bike; it is required by law.", ["might", "must", "would", "could"], 1, "法律規定騎車必須戴安全帽，表義務用 must。", ["線索是 required by law。", "這不是可能性或過去能力，而是義務。", "選 must。"], "must 表強烈義務；might 表可能，could 常表能力或較委婉請求。", ["must", "required", "helmet"]],
  ["八年級下", "間接問句", "Could you tell me ___ the nearest bus stop is?", ["where", "where is", "what is", "is where"], 0, "tell me 後接間接問句，語序用疑問詞 + 主詞 + 動詞，因此為 where the nearest bus stop is。", ["主句是 Could you tell me。", "後面是間接問句，不倒裝。", "選 where。"], "間接問句使用直述句語序；不要寫成 where is the stop。", ["where", "nearest", "bus stop"]],
  ["九年級上", "分詞形容詞", "The documentary was so ___ that several students watched it again.", ["interest", "interested", "interesting", "interests"], 2, "documentary 是引起興趣的事物，用 -ing 形容詞 interesting；-ed 通常描述人的感受。", ["判斷被描述的是 documentary，不是觀眾。", "事物令人感興趣，用 -ing。", "選 interesting。"], "interesting 描述事物；interested 描述感到興趣的人。", ["interesting", "interested", "documentary"]],
  ["九年級上", "條件句", "If you ___ the form today, the office will process it tomorrow.", ["submit", "submitted", "will submit", "submitting"], 0, "第一類條件句談可能發生的未來，if 子句用現在簡單式，主句可用 will。", ["主句有 will process，表示未來可能結果。", "if 子句不直接用 will 表未來。", "選 submit。"], "If + 現在簡單式，主句 + will/can + 原形動詞。", ["if", "submit", "process"]],
  ["九年級上", "附加問句", "Your sister has finished the project, ___?", ["has she", "hasn't she", "doesn't she", "isn't she"], 1, "主句為現在完成式肯定句 has finished，附加問句用相同助動詞 has，並改為否定 hasn't she。", ["找主句助動詞 has。", "主句肯定，附加問句用否定。", "主詞 your sister 改代名詞 she，選 hasn't she。"], "附加問句沿用主句助動詞，並依主句肯否轉換。", ["finish", "project", "tag question"]],
  ["九年級上", "字彙與同義詞", "The instructions are clear, so every student can ___ what to do.", ["understand", "borrow", "invite", "happen"], 0, "clear 的語境表示說明清楚，因此學生能 understand（理解）該做什麼。", ["從 clear 判斷說明容易理解。", "句意需要表示理解的動詞。", "選 understand。"], "understand ≈ know what something means；borrow 是借入，易因都是常見動詞而誤選。", ["clear", "understand", "instruction"]],
  ["九年級上", "閱讀理解", "A notice says, “The gym is closed from 2 to 4 p.m. for cleaning. The basketball class will meet in Room 203.” Where should students go for class?", ["The gym", "Room 203", "The library", "The school gate"], 1, "公告明確說體育館 2 至 4 點關閉，籃球課改在 203 教室，因此學生應前往 Room 203。", ["定位問題問上課地點。", "公告第二句提供替代教室。", "選 Room 203；gym 在該時段關閉。"], "閱讀公告先找時間、地點和例外安排；不要只抓到 gym 這個主題字。", ["notice", "closed", "meet"]],
  ["九年級上", "字彙與語境", "After checking the weather forecast, we decided to ___ the picnic until Sunday.", ["put off", "look after", "find out", "take part in"], 0, "until Sunday 表示把野餐延到星期日，片語 put off 是延期。", ["分析 until Sunday 的時間語意。", "需要「延期」的動作。", "put off = postpone，選 A。"], "put off ≈ postpone；look after 是照顧，注意片語整體意思。", ["put off", "postpone", "forecast"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(101 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${101 + index}`);
  const [gradeSemester, knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester, unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 18 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0101–0120 as 20 distinct CAP-level grammar, vocabulary, and reading items.");
