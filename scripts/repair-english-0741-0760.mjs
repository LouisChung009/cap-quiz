import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["字彙語境", "The hikers checked the map before choosing a trail. What does trail mean here?", ["A path for walking", "A kind of meal", "A weather report", "A train station"], 0, "正確答案是 A path for walking。hikers 在選擇路線前查看地圖，因此 trail 指步道。", ["由 hikers 與 map 判斷戶外情境。", "找出 choosing 所指的選擇對象。", "trail 在此是步道。"], "trail 可指小徑，也可作動詞表示追蹤，要看語境。", ["hiker", "trail", "path"]],
  ["過去進行式", "At eight last night, Mia ___ for her science test when the lights went out.", ["studies", "was studying", "has studied", "will study"], 1, "正確答案是 was studying。At eight last night 指過去特定時刻，停電時正在進行的動作用過去進行式。", ["圈出過去特定時刻。", "辨認 when 子句中的突發事件。", "主詞 Mia 用 was studying。"], "過去進行式常搭配 when 描述背景中被打斷的動作。", ["specific time", "go out", "past progressive"]],
  ["閱讀理解", "A sign reads, “Pool closed for cleaning from 9:00 to 11:30 a.m. Please use the gym during this time.” Where should visitors exercise before 11:30?", ["In the pool", "In the gym", "At the library", "Outside the building"], 1, "正確答案是 In the gym。告示說泳池清潔期間請改用 gym。", ["定位 closed 的時間。", "找出 Please use 指示的替代場所。", "選 In the gym。"], "閱讀告示需區分暫停服務處與替代安排。", ["closed", "cleaning", "during"]],
  ["不定詞與動名詞", "Kevin decided ___ his old bicycle to a younger student.", ["donating", "donate", "to donate", "donated"], 2, "正確答案是 to donate。decide 後接 to + 原形動詞。", ["辨認主要動詞 decided。", "回想 decide 的補語搭配。", "選 to donate。"], "decide to V；避免受其他動詞常接 V-ing 的印象干擾。", ["decide", "donate", "younger"]],
  ["介系詞片語", "The art room is ___ the second floor, next to the music room.", ["at", "on", "in", "by"], 1, "正確答案是 on。表示位於某一樓層通常用 on the second floor。", ["判斷空格表樓層位置。", "英文樓層搭配 on。", "選 on。"], "樓層用 on；房間內部空間通常用 in。", ["floor", "next to", "location"]],
  ["比較級", "Of the two routes, the riverside path is ___ than the road beside the highway.", ["quiet", "quietest", "quieter", "more quietly"], 2, "正確答案是 quieter。Of the two 與 than 表示兩者比較，quiet 加 -er。", ["找出 Of the two。", "than 後接比較級。", "quiet 的比較級是 quieter。"], "短形容詞多加 -er；副詞不能修飾此處的 be 動詞補語。", ["route", "riverside", "highway"]],
  ["閱讀推論", "A note says, “I left the science model on your desk because the classroom was locked. Please take it home today.” What should the reader do?", ["Leave the model at school", "Take the model home", "Lock the classroom", "Build another model"], 1, "正確答案是 Take the model home。便條直接請收件人今天把模型帶回家。", ["找出 Please take it home。", "it 回指 science model。", "選 Take the model home。"], "代名詞 it 要回指前文名詞，並留意指示的期限 today。", ["model", "locked", "take home"]],
  ["被動語態", "The school garden ___ by volunteers every Saturday.", ["waters", "is watered", "watered", "is watering"], 1, "正確答案是 is watered。garden 是接受澆水的對象，every Saturday 表習慣，使用現在簡單式被動。", ["確認主詞 garden 不會自己澆水。", "every Saturday 表固定習慣。", "選 is watered。"], "現在被動為 am/is/are + 過去分詞。", ["volunteer", "garden", "passive voice"]],
  ["字彙辨析", "Please ___ the form before you hand it to the office; incomplete forms cannot be accepted.", ["fill out", "look after", "turn down", "take off"], 0, "正確答案是 fill out。表格須先填寫完整才能繳交。", ["根據 form 判斷需要的動作。", "排除照顧、拒絕與脫下。", "選 fill out。"], "fill out a form 是填寫表格；注意片語動詞的受詞位置。", ["form", "incomplete", "accept"]],
  ["連接詞", "The museum was crowded, ___ we decided to visit the garden first.", ["but", "so", "although", "unless"], 1, "正確答案是 so。人潮多是先去花園的原因，後句是結果。", ["找出兩句的因果關係。", "前因後果使用 so。", "選 so。"], "so 引結果；although 引讓步，不能只按句子長短判斷。", ["crowded", "decide", "result"]],
  ["現在完成式", "I ___ this documentary twice, so I can explain its main idea.", ["watch", "watched", "have watched", "am watching"], 2, "正確答案是 have watched。twice 表累積經驗，且結果與現在相關。", ["辨認次數 twice。", "經驗延續到現在。", "主詞 I 搭 have watched。"], "現在完成式可表截至目前的經驗；若有明確過去時間則多用過去式。", ["documentary", "twice", "main idea"]],
  ["關係代名詞", "The website ___ provides free practice tests was created by local teachers.", ["who", "where", "that", "whose"], 2, "正確答案是 that。先行詞 website 是物，關係子句缺主詞，可用 that。", ["找出先行詞 website。", "關係子句 provides 缺主詞。", "物作先行詞可用 that。"], "that 可指人或物；where 表地點副詞，不能代替此處的主詞。", ["website", "provide", "relative pronoun"]],
  ["閱讀理解", "A bus schedule lists: “Route 6: leaves 2:15 p.m.; arrives at the station 2:50 p.m.” How long is the trip to the station?", ["25 minutes", "30 minutes", "35 minutes", "45 minutes"], 2, "正確答案是 35 minutes。2:15 到 2:50 相差 35 分鐘。", ["確認出發與抵達時間。", "從 2:15 計算至 2:50。", "得到 35 分鐘。"], "時間差可先算到整點再加剩餘分鐘，避免直接相減出錯。", ["schedule", "leave", "arrive"]],
  ["代名詞", "Lena and I finished the poster by ___, without help from the teacher.", ["ourselves", "themselves", "herself", "myself"], 0, "正確答案是 ourselves。主詞 Lena and I 對應第一人稱複數反身代名詞。", ["找出主詞包含 I。", "兩人一起完成，使用複數。", "選 ourselves。"], "反身代名詞須與主詞的人稱、數一致。", ["poster", "without", "reflexive pronoun"]],
  ["情態助動詞", "You ___ bring a printed ticket; showing the QR code on your phone is enough.", ["must", "mustn't", "don't have to", "shouldn't"], 2, "正確答案是 don't have to。手機 QR code 已足夠，表示不必帶紙本票，不是禁止帶。", ["讀出 QR code is enough。", "判斷是沒有必要，不是禁止。", "選 don't have to。"], "don't have to 表不必；mustn't 表禁止，語意不同。", ["printed", "enough", "mustn't"]],
  ["字彙語境", "The new rule will ___ all students, including those who take the late bus.", ["affect", "effect", "offer", "avoid"], 0, "正確答案是 affect。空格需要動詞，意為影響所有學生。", ["辨認 will 後接原形動詞。", "依受詞 students 判斷語意。", "選 affect。"], "affect 通常作動詞「影響」；effect 多作名詞「效果」。", ["rule", "affect", "effect"]],
  ["分詞形容詞", "The students were ___ by the surprising result of the experiment.", ["amazing", "amazed", "amaze", "amazement"], 1, "正確答案是 amazed。students 是感到驚訝的人，用 -ed 分詞形容詞。", ["主詞是感受者。", "描述人的感受用 -ed。", "選 amazed。"], "-ed 多描述感受者；-ing 多描述引起感受的事物。", ["surprising", "result", "experiment"]],
  ["閱讀推論", "A café receipt says, “Your order is ready at counter B. Please keep this receipt until you receive your drink.” Where should the customer go?", ["Counter B", "The kitchen", "The parking lot", "Counter A"], 0, "正確答案是 Counter B。收據指示飲料已在 B 櫃檯準備好。", ["定位 order is ready。", "找出明確櫃檯字母。", "選 Counter B。"], "情境閱讀以明確的地點指示作答，不需自行推測其他位置。", ["receipt", "counter", "receive"]],
  ["時間子句", "We will start the game after everyone ___ their name tag.", ["gets", "will get", "got", "getting"], 0, "正確答案是 gets。after 引導未來時間子句時，子句用現在式。", ["找出 after 子句。", "主句 will start 表未來。", "時間子句用 gets。"], "when/after/before/until 引導未來時間時，通常不用 will。", ["start", "everyone", "time clause"]],
  ["字彙與語境", "The scientist repeated the test to make sure the result was ___, not caused by chance.", ["reliable", "crowded", "ordinary", "silent"], 0, "正確答案是 reliable。重複測試是為確認結果可靠，而非偶然造成。", ["抓住 repeated the test。", "對照 not caused by chance。", "選 reliable。"], "reliable 表可靠；可由題幹中的重複驗證行為推斷。", ["repeat", "result", "chance"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(741 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${741 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "九年級上", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 2 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0741–0760 with distinct exam skills and contexts.");
