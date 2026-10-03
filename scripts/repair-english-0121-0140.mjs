import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["七年級上", "疑問詞", "___ does the school bus leave? — At 7:10 every morning.", ["How often", "What time", "How far", "How many"], 1, "回答是 7:10，提供鐘點，應問 What time。", ["先看答句 At 7:10。", "這是時間點，不是頻率或距離。", "選 What time。"], "What time 問幾點；How often 問頻率。", ["leave", "every morning", "schedule"]],
  ["七年級上", "可數與不可數名詞", "There isn't ___ milk left, so we need to buy some.", ["many", "a few", "much", "several"], 2, "milk 為不可數名詞，否定句詢問剩餘量常用 much。", ["判斷 milk 不可數。", "否定句搭配 much 表數量。", "選 much。"], "many/a few/several 修飾可數複數；much 修飾不可數名詞。", ["milk", "much", "a little"]],
  ["七年級上", "所有格代名詞", "This blue water bottle is not mine; it is ___.", ["her", "hers", "she", "herself"], 1, "空格獨立作表語，需用所有格代名詞 hers，代表 her water bottle。", ["空格後沒有名詞。", "因此不能用形容詞性所有格 her。", "hers 可獨立代替物品，選 B。"], "her + 名詞；hers 單獨使用，避免重複名詞。", ["mine", "hers", "belong to"]],
  ["七年級上", "現在簡單式", "Mr. Lin usually ___ the classroom windows before the first class.", ["open", "opens", "is opening", "opened"], 1, "usually 表示習慣；主詞 Mr. Lin 為第三人稱單數，現在簡單式動詞加 -s。", ["由 usually 判定是日常習慣。", "主詞 Mr. Lin 為第三人稱單數。", "open 加 s，選 opens。"], "第三人稱單數現在式加 -s/-es；不要把頻率副詞當進行式線索。", ["usually", "open", "classroom"]],
  ["七年級下", "代名詞受格", "The teacher gave ___ extra time to finish the quiz.", ["we", "our", "us", "ours"], 2, "gave 是及物動詞，空格作為接受額外時間的人，需用受格 us。", ["找出動詞 gave。", "空格是動作的接受者，作受詞。", "we 的受格是 us，選 C。"], "主格 we 作主詞；受格 us 作動詞或介系詞的受詞。", ["give", "gave", "extra"]],
  ["七年級下", "There be", "___ a small bookstore next to the train station.", ["There are", "There is", "They are", "It has"], 1, "a small bookstore 是單數名詞，表示某處有某物用 There is。", ["主詞是單數 bookstore。", "存在句型使用 There be。", "單數搭配 is，選 There is。"], "There be 後的 be 動詞依後方主詞單複數變化。", ["bookstore", "next to", "station"]],
  ["七年級下", "不定代名詞", "There are four seats, but only ___ is available now.", ["one", "ones", "it", "them"], 0, "one 代替前文提到的單數名詞 seat，避免重複；only 後指一個座位。", ["被代替的名詞是 seat。", "指其中一個單數個體，用 one。", "選 one。"], "one 代替單數可數名詞；ones 代替複數，it 指特定已知物。", ["seat", "available", "one"]],
  ["七年級下", "祈使句", "___ the door quietly; the baby is asleep.", ["Close", "Closes", "Closing", "To close"], 0, "句子直接要求對方關門，祈使句以原形動詞開頭。", ["分句是在提出指示。", "祈使句省略主詞 you，動詞用原形。", "選 Close。"], "祈使句用原形動詞；否定祈使句用 Don't + 原形動詞。", ["quietly", "asleep", "close"]],
  ["八年級上", "不定詞表目的", "Kevin left home early ___ the first train.", ["catch", "catching", "to catch", "caught"], 2, "提早離家是為了搭上第一班車，目的用 to + 原形動詞。", ["理解前後行動：提早離家、搭第一班車。", "後者說明前者目的。", "選 to catch。"], "to V 可表目的；避免與 enjoy + V-ing 混用。", ["leave", "early", "catch"]],
  ["八年級上", "動詞片語", "Please ___ your shoes before entering the computer room.", ["take off", "put on", "pick up", "turn down"], 0, "進入電腦教室前需脫鞋，take off 表脫下。", ["根據 entering 前的規定判斷動作。", "不是穿上、撿起或調低音量。", "take off = remove clothing/shoes，選 A。"], "take off 可指脫下衣物；put on 才是穿上。", ["take off", "put on", "enter"]],
  ["八年級上", "動名詞作主詞", "___ enough water is important on a hot day.", ["Drink", "Drinking", "Drank", "To drinking"], 1, "空格片語作句子主詞，動詞 drink 改為動名詞 Drinking。", ["先找主要動詞 is。", "is 前方需要主詞。", "動作作主詞用 V-ing，選 Drinking。"], "動名詞可作主詞；句首大寫不代表祈使句。", ["drink", "drinking water", "important"]],
  ["八年級上", "感官動詞", "The soup smells ___, but it contains peanuts, so Ben cannot eat it.", ["delicious", "deliciously", "delight", "delighted"], 0, "smell 是連綴動詞，後接形容詞描述 soup 聞起來如何，用 delicious。", ["主詞 soup 是被描述的對象。", "連綴動詞後接形容詞，不用副詞。", "選 delicious。"], "look/smell/sound/taste + 形容詞；deliciously 是副詞。", ["smell", "delicious", "contain"]],
  ["八年級下", "連接副詞", "The road was icy; ___, the school bus traveled slowly.", ["however", "therefore", "instead", "otherwise"], 1, "道路結冰是校車慢行的原因，前因後果用 therefore（因此）。", ["找出兩分句的因果方向。", "icy road 導致 slow travel。", "therefore 表結果，選 B。"], "therefore 表因此；however 表轉折，容易因標點相似誤選。", ["icy", "therefore", "slowly"]],
  ["八年級下", "反身代名詞", "The young bird could not feed ___, so the rescue team helped it.", ["it", "its", "itself", "it is"], 2, "主詞與動作承受者同為 the young bird，需用反身代名詞 itself。", ["主詞是單數動物 the young bird。", "feed 的受詞回指主詞本身。", "選 itself。"], "反身代名詞表示主受詞同一對象；its 是所有格。", ["itself", "feed", "rescue"]],
  ["八年級下", "too...to", "The box is too heavy ___ by one student.", ["carry", "to carry", "carrying", "carried"], 1, "too + 形容詞 + to V 表太……而不能……，故為 too heavy to carry。", ["找固定句型 too + heavy。", "其後接不定詞 to V。", "選 to carry。"], "too...to 常帶否定結果；不要把 too 當 very。", ["too heavy to", "carry", "weight"]],
  ["八年級下", "最高級", "Of the three routes, the riverside path is the ___ one in the morning.", ["safe", "safer", "safest", "more safely"], 2, "Of the three 表示三者比較，需用最高級 safest。", ["確認比較範圍是三條路。", "三者中最安全使用最高級。", "safe 加 -est，選 safest。"], "兩者用比較級；三者以上通常用最高級。", ["route", "riverside", "safest"]],
  ["九年級上", "假設語氣", "If I ___ more free time, I would join the school orchestra.", ["have", "had", "will have", "am having"], 1, "主句 would join 表示與現在事實相反或不太可能的假設，if 子句用過去式 had。", ["觀察主句 would + 原形動詞。", "這是第二類條件句，if 子句用過去式。", "選 had。"], "If + 過去式，主句 would/could + 原形；此處 had 不表示過去時間。", ["free time", "orchestra", "would"]],
  ["九年級上", "分詞構句與因果", "___ by the loud thunder, the dog hid under the table.", ["Frightening", "Frightened", "Frighten", "To frighten"], 1, "狗是被雷聲嚇到的感受者，用過去分詞 Frightened 描述。", ["判斷狗是嚇人的來源還是感受者。", "狗受到雷聲驚嚇，屬被動感受。", "選 Frightened。"], "人或動物感到某情緒用 -ed；引起情緒的事物常用 -ing。", ["frightened", "frightening", "thunder"]],
  ["九年級上", "閱讀推論", "A sign reads: “Please use the west entrance while the main door is being painted.” Which entrance should visitors use?", ["The main entrance", "The west entrance", "The staff entrance", "Any locked door"], 1, "告示要求 main door 粉刷期間改用 west entrance，因此訪客應走西側入口。", ["定位 while 子句中的時間條件。", "主入口施工時，告示指定替代入口。", "選 The west entrance。"], "閱讀指示要連同 while/when 等時間條件一起理解，勿忽略替代安排。", ["entrance", "main door", "paint"]],
  ["九年級上", "字彙與易混淆詞", "The medicine may ___ a little bitter, but drink the full dose as directed.", ["taste", "sound", "feel", "look"], 0, "bitter 是味覺形容詞，描述藥的味道用 taste。", ["辨認 bitter 描述味道。", "主詞 medicine 是被品嘗的東西。", "感官動詞 taste，選 A。"], "taste bitter 是嚐起來苦；sound bitter 不合感官語意。", ["bitter", "dose", "as directed"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(121 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${121 + index}`);
  const [gradeSemester, knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester, unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 18 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0121–0140 with varied grammar, vocabulary, and reading skills.");
