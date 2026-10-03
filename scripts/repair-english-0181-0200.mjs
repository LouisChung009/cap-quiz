import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["七年級上", "時間副詞", "The science fair begins ___, so please be in the hall by 8:45.", ["yesterday", "at 9:00 tomorrow", "last week", "two days ago"], 1, "by 8:45 暗示活動將開始，選項中只有 at 9:00 tomorrow 符合未來時程。", ["先用 by 8:45 判讀尚未開始。", "排除已過去的時間。", "選 at 9:00 tomorrow。"], "by + 時間表示不晚於該時刻；核對選項時注意時態線索。", ["fair", "begin", "by"]],
  ["七年級上", "疑問詞", "___ students are absent today? — Only two.", ["How much", "How many", "How long", "How often"], 1, "回答 two 是人數；students 是可數複數，用 How many 詢問數量。", ["看答句 Only two。", "問題詢問學生人數。", "可數複數前用 How many。"], "How many 問數量；How often 問頻率，勿只看到疑問詞 how。", ["absent", "only", "How many"]],
  ["七年級上", "介系詞", "The cat is hiding ___ the sofa, so we can see only its tail.", ["under", "between", "through", "above"], 0, "只看得到尾巴且貓在沙發下方，under 表示在……下面。", ["由只看見尾巴推知身體被遮住。", "貓躲在沙發下。", "選 under。"], "under 是在下方；above 是上方，between 需兩個對象。", ["hide", "under", "tail"]],
  ["七年級上", "主詞與 be 動詞", "My favorite subjects ___ science and art because I enjoy experiments and drawing.", ["is", "are", "am", "be"], 1, "主詞 subjects 為複數，be 動詞用 are。", ["找出句子主詞 subjects。", "subjects 是複數。", "複數搭配 are，選 B。"], "be 動詞依主詞變化：I am、單數 is、複數 are。", ["subject", "experiment", "drawing"]],
  ["七年級下", "頻率副詞位置", "We ___ eat in the classroom; food is allowed only in the cafeteria.", ["usually", "never", "often", "sometimes"], 1, "規定食物只可在餐廳食用，表示我們從不在教室吃東西，用 never。", ["找出規定 only in the cafeteria。", "教室不允許食物。", "表示從不的 never 最符合。"], "never 表從不；頻率副詞通常放一般動詞前。", ["cafeteria", "allow", "never"]],
  ["七年級下", "情態助動詞", "You ___ bring a camera; the school will provide one for each group.", ["must", "don't have to", "mustn't", "shouldn't"], 1, "學校會提供相機，表示學生不必自備，don't have to 是不必。", ["讀出學校提供相機的資訊。", "不是禁止帶相機，而是無須自備。", "選 don't have to。"], "don't have to = 不必；mustn't = 禁止，意思不同。", ["provide", "camera", "don't have to"]],
  ["七年級下", "不定詞目的", "Lily used a ruler ___ the table before cutting the paper.", ["measure", "measuring", "to measure", "measured"], 2, "使用尺的目的在測量桌面，使用 to + 原形動詞表目的。", ["辨認 used a ruler 的目的。", "目的句型用 to V。", "選 to measure。"], "to V 表目的，不要和 used to（過去習慣）混淆。", ["ruler", "measure", "cut"]],
  ["七年級下", "過去式", "The storm ___ several trees, but no one was hurt.", ["knocks down", "knocked down", "is knocking down", "has knock down"], 1, "暴風已造成結果且後句用 was hurt，事件發生在過去；選 knocked down。", ["句子敘述已發生的暴風災情。", "過去式規則動詞 knock 加 ed。", "片語為 knocked down，選 B。"], "knock down 是撞倒；敘述已結束的過去事件用過去式。", ["storm", "knock down", "hurt"]],
  ["八年級上", "動詞片語", "Please ___ the online form before you click the submit button.", ["fill out", "take off", "look up", "get along"], 0, "按提交前要填寫線上表格，fill out 表填寫表格。", ["判斷 submit button 前要完成什麼。", "表格搭配 fill out。", "選 fill out。"], "fill out a form；look up 是查詢，take off 是脫下或起飛。", ["fill out", "form", "submit"]],
  ["八年級上", "some/any", "Would you like ___ tea while you wait?", ["some", "any", "many", "few"], 0, "Would you like...? 是提出邀請或提供，通常用 some。", ["辨認句型是在提供茶。", "提供或邀請時常用 some。", "選 some。"], "一般疑問句多用 any，但邀請與期待肯定回答時可用 some。", ["would you like", "tea", "wait"]],
  ["八年級上", "比較級", "The second experiment produced ___ results than the first one.", ["accurate", "more accurate", "most accurate", "accurately"], 1, "than 表示比較兩次實驗；多音節形容詞 accurate 用 more 構成比較級。", ["比較 second 與 first 兩組結果。", "accurate 為多音節形容詞。", "選 more accurate。"], "比較級用 more + 多音節形容詞；accurately 是副詞。", ["experiment", "accurate", "result"]],
  ["八年級上", "副詞", "The cyclist rode ___ through the crowded market and avoided every shopper.", ["careful", "carefully", "carefulness", "more careful"], 1, "空格修飾 rode，描述騎車方式，用副詞 carefully。", ["找出被修飾的動詞 rode。", "描述動作方式用副詞。", "careful + ly，選 carefully。"], "carefully 修飾動詞；careful 修飾名詞或作補語。", ["cyclist", "carefully", "avoid"]],
  ["八年級上", "動名詞", "My little brother practices ___ the guitar for twenty minutes every day.", ["play", "to play", "playing", "played"], 2, "practice 後接動名詞，故用 playing。", ["主要動詞是 practices。", "practice 後的另一動作用 V-ing。", "選 playing。"], "practice doing something；不要和 want to do 的句型混淆。", ["practice", "guitar", "every day"]],
  ["八年級下", "被動語態", "The lost dog ___ by a family near the river yesterday.", ["finds", "found", "was found", "is finding"], 2, "狗是被找到的對象，且 yesterday 指過去，使用 was found。", ["主詞 dog 承受 find 動作。", "yesterday 表過去。", "過去被動為 was + p.p.，選 was found。"], "find–found–found；被動式 be + 過去分詞。", ["lost", "find", "near"]],
  ["八年級下", "現在完成式", "Have you ever ___ a robot that can sort recyclable waste?", ["see", "saw", "seen", "seeing"], 2, "Have + 主詞 + ever 後使用過去分詞，see 的 p.p. 為 seen。", ["看到 Have you ever，判斷現在完成式。", "現在完成式 have + p.p.。", "see–saw–seen，選 seen。"], "現在完成式疑問句：Have/Has + 主詞 + p.p.。", ["ever", "recyclable", "sort"]],
  ["八年級下", "附加問句", "The lights are off, ___?", ["are they", "aren't they", "do they", "don't they"], 1, "主句為 be 動詞 are 的肯定句，附加問句用否定 aren't；主詞 lights 用代名詞 they。", ["找主句 be 動詞 are。", "主句肯定，附加問句否定。", "lights 改為 they，選 aren't they。"], "附加問句沿用助動詞並反轉肯否；名詞複數用 they。", ["light", "off", "tag question"]],
  ["八年級下", "關係代名詞", "The woman ___ phone was found at the station has already called us.", ["who", "whose", "which", "where"], 1, "空格後接名詞 phone，表示手機屬於 the woman，使用所有格關係代名詞 whose。", ["找出先行詞 the woman。", "空格修飾 phone，表所有關係。", "選 whose。"], "whose + 名詞可指人的所有物；who 本身不表示所有格。", ["whose", "phone", "station"]],
  ["九年級上", "分詞形容詞", "The instructions were confusing, so several students felt ___.", ["confusing", "confused", "confuse", "confuses"], 1, "students 是感到困惑的人，用 confused；instructions 才是令人困惑的事物。", ["判斷被描述的是學生。", "人的感受用 -ed 形容詞。", "選 confused。"], "confused 描述感受者；confusing 描述造成感受的事物。", ["confuse", "confused", "instruction"]],
  ["九年級上", "條件句", "Unless you save your work, you ___ lose the changes when the computer shuts down.", ["might", "will", "would have", "had"], 1, "unless 表除非，與 if...not 相近；句子描述可能的未來結果，主句用 will。", ["把 unless 子句理解為「如果不儲存」。", "結果是電腦關機時會失去修改。", "第一類條件句主句用 will，選 B。"], "unless = if...not；if/unless 子句談未來時通常用現在式。", ["unless", "save", "change"]],
  ["九年級上", "閱讀推論", "A notice says, “The pool is open until 6 p.m. on weekdays. Last entry is 5:30 p.m.” When is the latest time a visitor may enter on a weekday?", ["5:00 p.m.", "5:30 p.m.", "6:00 p.m.", "After 6:00 p.m."], 1, "告示區分閉館時間 6 點與最後入場時間 5:30；最晚入場是 5:30 p.m.。", ["先找問題問 latest entry。", "告示明列 Last entry is 5:30。", "選 5:30 p.m.，勿誤選閉館時間。"], "閱讀時間表時區分最後入場與停止營業時間。", ["weekday", "last entry", "until"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(181 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${181 + index}`);
  const [gradeSemester, knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester, unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 18 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0181–0200 as distinct CAP-level practice items.");
