import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["七年級上", "代名詞", "The twins brought ___ own lunch boxes to the picnic.", ["they", "them", "their", "theirs"], 2, "空格後接名詞 own lunch boxes，需用形容詞性所有格 their。", ["確認空格後有名詞 lunch boxes。", "名詞前用形容詞性所有格。", "they 的所有格為 their，選 C。"], "their 後面要接名詞；theirs 可獨立使用。", ["twin", "their own", "lunch box"]],
  ["七年級上", "名詞單複數", "There are three ___ of bread on the table.", ["loaf", "loaves", "loafs", "loafes"], 1, "three 後接可數複數；loaf 的複數為不規則拼法 loaves。", ["數量 three 表示複數。", "loaf 以 f 結尾，複數變 ves。", "選 loaves。"], "常見 f/fe 結尾名詞如 loaf、knife 會變 ves，但有例外需記憶。", ["loaf", "loaves", "bread"]],
  ["七年級上", "冠詞", "My uncle is ___ honest person who always keeps his promises.", ["a", "an", "the", "不需冠詞"], 1, "honest 的 h 不發音，開頭為母音音素，因此用 an。", ["冠詞依發音而非字母判斷。", "honest 開頭的 h 不發音。", "選 an。"], "an hour、an honest person；a university 的 u 發 /juː/，使用 a。", ["honest", "promise", "an hour"]],
  ["七年級上", "疑問句", "___ your parents work on weekends?", ["Does", "Do", "Are", "Is"], 1, "your parents 是複數主詞，詢問一般習慣用 Do + 主詞 + 原形動詞。", ["work 是一般動詞，不是 be 動詞。", "parents 為複數。", "助動詞用 Do，選 B。"], "Do/Does 後接原形動詞；be 動詞疑問句則把 be 移到主詞前。", ["parent", "weekend", "work"]],
  ["七年級下", "不定代名詞", "I looked for my keys everywhere, but I couldn't find them ___.", ["somewhere", "anywhere", "nowhere", "everywhere"], 1, "couldn't 是否定句，泛指任何地方常用 anywhere。", ["辨認句子為否定。", "否定句中 anywhere 表任何地方。", "選 anywhere。"], "肯定句常用 somewhere；疑問與否定句常用 anywhere。", ["look for", "find", "anywhere"]],
  ["七年級下", "現在進行式", "Listen! Someone ___ the piano in the music room.", ["plays", "played", "is playing", "has played"], 2, "Listen! 表示請聽現在正在發生的聲音，使用現在進行式 is playing。", ["找出 Listen! 這個當下提示。", "動作正在進行。", "someone 視為單數，選 is playing。"], "現在進行式：am/is/are + V-ing；someone 搭配 is。", ["listen", "piano", "music room"]],
  ["七年級下", "過去進行式", "At 9 last night, my parents ___ a movie while I was doing homework.", ["watch", "watched", "were watching", "are watching"], 2, "At 9 last night 指過去特定時刻正在進行；parents 為複數，使用 were watching。", ["判斷時間是昨晚九點。", "背景動作當時持續進行，用過去進行式。", "複數主詞配 were，選 were watching。"], "過去進行式 was/were + V-ing；while 常連接同時進行的動作。", ["while", "movie", "homework"]],
  ["七年級下", "助動詞與否定", "You ___ park here; the sign says “No Parking.”", ["must", "mustn't", "don't have", "could"], 1, "標誌明確寫 No Parking，表示禁止停車，用 mustn't。", ["閱讀告示中的禁止內容。", "需要表示不可以，而非有義務。", "選 mustn't。"], "mustn't 是禁止；don't have to 是不必，意思不同。", ["park", "sign", "mustn't"]],
  ["七年級下", "連接詞", "We canceled the game ___ the field was too wet after the rain.", ["so", "but", "because", "or"], 2, "球場太濕是取消比賽的原因，because 引導原因子句。", ["先辨認取消比賽和球場濕的關係。", "球場濕解釋取消原因。", "選 because。"], "because + 子句；so + 結果子句，不要把因果方向顛倒。", ["cancel", "field", "wet"]],
  ["八年級上", "動詞片語", "Could you ___ the lights? The room is too dark to read.", ["turn on", "turn off", "give up", "take after"], 0, "房間太暗而無法閱讀，應打開燈，turn on 表開啟電器。", ["從 too dark 判斷需要增加光線。", "燈應開啟，不是關掉。", "選 turn on。"], "turn on 開啟；turn off 關閉，易混淆方向相反。", ["turn on", "turn off", "dark"]],
  ["八年級上", "形容詞與副詞", "The guide spoke ___ so that visitors at the back could hear her.", ["clear", "clearly", "clearness", "more clear"], 1, "空格修飾動詞 spoke，需用副詞 clearly。", ["找出空格修飾的動詞 spoke。", "修飾動詞用副詞。", "clear 加 -ly，選 clearly。"], "形容詞描述人事物；副詞修飾動作，clear → clearly。", ["clear", "clearly", "guide"]],
  ["八年級上", "反身代名詞", "The players prepared the stage by ___.", ["them", "their", "themselves", "they"], 2, "by oneself 表示獨自完成；主詞 players 為複數，反身代名詞為 themselves。", ["辨認固定片語 by oneself。", "主詞 players 是複數。", "選 themselves。"], "by + 反身代名詞表示獨自；不可用受格 them 代替。", ["prepare", "stage", "by themselves"]],
  ["八年級上", "動名詞與介系詞", "Ella is interested in ___ how stars are formed.", ["learn", "to learn", "learning", "learned"], 2, "介系詞 in 後接名詞或動名詞，因此用 learning。", ["先確認 interested in 中的 in 是介系詞。", "介系詞後動詞用 V-ing。", "選 learning。"], "介系詞後用 V-ing；be interested in doing something。", ["interested in", "learn", "form"]],
  ["八年級下", "比較級", "This route is ___ than the highway during rush hour because it has fewer traffic lights.", ["fast", "faster", "fastest", "more fast"], 1, "than 提示比較兩條路；fast 的比較級為 faster。", ["比較 route 與 highway 兩者。", "than 後使用比較級。", "fast 加 -er，選 faster。"], "單音節形容詞通常加 -er；不可寫 more fast。", ["route", "highway", "rush hour"]],
  ["八年級下", "被動語態", "The final score ___ on the screen after the match ended.", ["displayed", "was displayed", "is displaying", "displays"], 1, "比分是被顯示的對象，且比賽已結束，使用過去被動 was displayed。", ["主詞 score 承受 display 動作。", "after the match ended 指過去。", "過去被動為 was + p.p.，選 was displayed。"], "被動式 be + 過去分詞；score 為單數用 was。", ["score", "display", "match"]],
  ["八年級下", "現在完成式", "Since joining the club, Rita ___ three short films.", ["makes", "made", "has made", "is making"], 2, "Since joining 表示從過去加入社團至今，使用現在完成式；主詞 Rita 用 has。", ["找出 since 表示起點延續至今。", "完成三部作品表示累積成果。", "第三人稱單數用 has made。"], "since + 起點常搭現在完成式；make 的過去分詞是 made。", ["since", "club", "film"]],
  ["八年級下", "間接問句", "Do you know ___ the art room closes today?", ["what time", "what time does", "does what time", "what time is"], 0, "Do you know 後的間接問句使用直述語序，疑問詞後接主詞 the art room，再接動詞 closes。", ["判斷整句是間接詢問。", "間接問句不用助動詞倒裝。", "選 what time。"], "直接問句 What time does it close?；間接問句 what time it closes。", ["art room", "close", "what time"]],
  ["九年級上", "關係代名詞", "The website ___ we used for the project provides free maps.", ["who", "where", "which", "when"], 2, "先行詞 website 指物，關係子句 used 缺受詞，使用 which。", ["找出先行詞 website。", "網站是物，且子句缺受詞。", "選 which。"], "which/that 指物；who 指人；where 前後需表地點關係。", ["website", "project", "provide"]],
  ["九年級上", "假設語氣", "If the library were open later, more students ___ there after school.", ["study", "will study", "would study", "studied"], 2, "were open 與 would study 構成第二類條件句，描述假設情況。", ["辨認 if 子句 were。", "第二類條件句主句用 would + 原形。", "選 would study。"], "If + 過去式，主句 would/could + 原形動詞；不是未來第一類條件句。", ["library", "after school", "would"]],
  ["九年級上", "字彙與易混淆詞", "The school nurse asked Sam to rest because he looked ___.", ["healthy", "sick", "careful", "ready"], 1, "校護要 Sam 休息，原因是他看起來不舒服，sick 符合語境。", ["連結 nurse 建議休息的原因。", "looked 後接描述人的形容詞。", "選 sick。"], "sick/ill 表生病；healthy 表健康，careful 表小心，注意語意相反。", ["nurse", "rest", "sick"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(141 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${141 + index}`);
  const [gradeSemester, knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester, unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 18 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0141–0160 with distinct, worked CAP-level items.");
