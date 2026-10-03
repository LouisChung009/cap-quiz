import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["過去簡單式", "The school band ___ first prize at the music festival last weekend.", ["wins", "won", "has won", "is winning"], 1, "last weekend 指明確過去時間，win 的過去式為 won。", ["圈出 last weekend。", "動作已在過去完成。", "win–won–won，選 won。"], "明確過去時間通常搭過去簡單式。", ["band", "prize", "festival"]],
  ["情態助動詞", "Visitors ___ feed the animals because some of them have special diets.", ["mustn't", "don't have to", "might", "would"], 0, "因動物有特殊飲食，告示禁止餵食，mustn't 表禁止。", ["找出原因 special diets。", "句意是不可餵食，不是沒有必要。", "選 mustn't。"], "mustn't = 不可以；don't have to = 不必，意思不同。", ["visitor", "feed", "diet"]],
  ["動名詞", "My aunt avoids ___ during rush hour because the roads are crowded.", ["drive", "to drive", "driving", "drove"], 2, "avoid 後接動名詞 driving。", ["確認主要動詞 avoids。", "avoid + V-ing。", "選 driving。"], "avoid doing something；不可接 to V。", ["avoid", "rush hour", "crowded"]],
  ["現在完成式", "The athlete ___ in five international competitions so far.", ["competes", "competed", "has competed", "is competing"], 2, "so far 表示截至目前的經驗，使用現在完成式 has competed。", ["辨認 so far。", "時間延續至現在。", "主詞 athlete 單數用 has competed。"], "so far/up to now 常搭現在完成式。", ["athlete", "competition", "international"]],
  ["比較級", "The second recipe uses ___ sugar than the original one.", ["less", "fewer", "few", "little"], 0, "sugar 是不可數名詞，表示較少用 less。", ["判斷 sugar 為不可數名詞。", "不可數名詞比較數量用 less。", "選 less。"], "less + 不可數名詞；fewer + 可數複數。", ["recipe", "sugar", "original"]],
  ["關係代名詞", "The volunteer ___ helped us carry the boxes is a student from Class 903.", ["which", "who", "where", "whose"], 1, "先行詞 volunteer 指人，且關係子句缺主詞，使用 who。", ["找先行詞 volunteer。", "指人且子句缺主詞。", "選 who。"], "who 指人；which 指物；whose 表所有。", ["volunteer", "carry", "box"]],
  ["被動語態", "The meeting room ___ for the debate team every Tuesday.", ["uses", "is used", "used", "is using"], 1, "meeting room 是被使用的場所；every Tuesday 表固定安排，使用現在被動 is used。", ["主詞 meeting room 承受 use。", "every Tuesday 表習慣。", "單數現在被動選 is used。"], "現在被動：am/is/are + p.p.。", ["meeting room", "debate team", "Tuesday"]],
  ["副詞", "The guide explained the safety rules ___ before the hiking trip.", ["patient", "patiently", "patience", "more patient"], 1, "空格修飾動詞 explained，說明方式用副詞 patiently。", ["找出被修飾的動詞 explained。", "動作方式用副詞。", "選 patiently。"], "patient 是形容詞，patiently 是副詞。", ["explain", "safety rule", "hiking"]],
  ["閱讀理解", "A sign says, “The north gate closes at 6 p.m. Visitors leaving later should use the main gate.” Which gate should visitors use after 6 p.m.?", ["The north gate", "The main gate", "The east gate", "Any gate"], 1, "正確答案是 The main gate。告示說北門 6 點關閉，較晚離開的訪客應使用主入口。", ["定位 after 6 p.m. 的規定。", "north gate 關閉。", "改走 The main gate。"], "公告閱讀區分關閉入口與替代路線。", ["gate", "close", "visitor"]],
  ["連接詞", "___ the bus was crowded, we found seats near the back.", ["Because", "Although", "Unless", "So"], 1, "公車擁擠與仍找到座位形成讓步關係，although 表雖然。", ["判斷兩分句不是因果。", "擁擠與找到座位形成反預期。", "選 Although。"], "although 引導讓步子句；so 表結果。", ["crowded", "seat", "although"]],
  ["不定詞", "The students stayed after class ___ the science display for visitors.", ["prepare", "preparing", "to prepare", "prepared"], 2, "留下來的目的是準備科學展示，使用 to prepare 表目的。", ["先讀主要動作 stayed after class。", "後半說明留下的目的。", "目的用 to + 原形，選 C。"], "to V 表目的；介系詞 after 若接動詞才用 V-ing。", ["stay", "display", "visitor"]],
  ["字彙與同義詞", "The instructions were brief, but they included every important step.", ["short", "incorrect", "secret", "difficult"], 0, "brief 表簡短，與 short 意思最接近。", ["注意 but 後說包含所有步驟。", "brief 描述篇幅短。", "選 short。"], "brief ≈ short/concise；不等於 incomplete。", ["brief", "include", "step"]],
  ["間接問句", "Could you tell me ___ the nearest pharmacy is?", ["where", "where is", "what is", "is where"], 0, "tell me 後接間接問句，使用疑問詞 + 主詞 + 動詞語序：where the pharmacy is。", ["整句是間接詢問。", "間接問句不用倒裝。", "選 where。"], "直接問句 Where is it?；間接問句 where it is。", ["pharmacy", "nearest", "tell"]],
  ["現在進行式", "Be quiet; the baby ___ in the stroller.", ["sleeps", "slept", "is sleeping", "has slept"], 2, "Be quiet 表示現在要安靜，baby 此刻正在睡覺，用 is sleeping。", ["找出 Be quiet 的當下線索。", "動作正在發生。", "單數主詞用 is sleeping。"], "現在進行式 am/is/are + V-ing。", ["stroller", "quiet", "sleep"]],
  ["被動語態", "The new pedestrian bridge ___ next spring if the budget is approved.", ["completes", "will complete", "will be completed", "has completed"], 2, "bridge 是被完成的工程，next spring 指未來，使用 will be completed。", ["主詞 bridge 承受 complete。", "next spring 表未來。", "未來被動 will be + p.p.，選 C。"], "工程或設施作主詞通常依語意判斷是否承受動作。", ["pedestrian", "bridge", "budget"]],
  ["分詞形容詞", "The audience felt ___ after listening to the inspiring speech.", ["inspiring", "inspired", "inspire", "inspires"], 1, "audience 是受到演講鼓舞的感受者，用 inspired。", ["被描述的是 audience。", "人的感受用 -ed。", "選 inspired。"], "inspired 描述感受者；inspiring 描述令人受鼓舞的事物。", ["audience", "inspiring", "speech"]],
  ["條件句", "If the rain stops before noon, the hikers ___ the mountain trail.", ["take", "took", "will take", "would take"], 2, "雨停是未來可能條件，健行者的後續行動用 will take。", ["if 子句 stops 用現在式。", "before noon 指未來條件。", "主句用 will take。"], "第一類條件句 if 子句用現在式，主句用 will + 原形。", ["hiker", "trail", "before noon"]],
  ["字彙語境", "Please keep your voice low; the patient is resting in the next room.", ["quiet", "expensive", "crowded", "early"], 0, "要求降低音量，意思是保持 quiet（安靜）。", ["從 keep your voice low 判斷。", "需要描述聲音大小的形容詞。", "選 quiet。"], "quiet 是安靜；quite 是相當，拼字相似易混。", ["voice", "patient", "rest"]],
  ["閱讀理解", "A schedule lists: “Workshop A: 9:00–10:15, Room 4. Workshop B: 10:30–11:45, Room 2.” Where is Workshop B held?", ["Room 2", "Room 4", "Room 9", "The main hall"], 0, "時間表直接標示 Workshop B 在 Room 2。", ["先定位 Workshop B。", "讀取同一列的教室資訊。", "選 Room 2。"], "表格題逐列對應活動、時間與地點，避免串錯欄位。", ["schedule", "workshop", "hold"]],
  ["代名詞受格", "The librarian showed ___ how to search the online catalog.", ["we", "our", "us", "ours"], 2, "showed 是及物動詞，空格作為被展示方法的對象，需用受格 us。", ["找出動詞 showed。", "空格是動作接受者，作受詞。", "we 的受格是 us，選 C。"], "主格 we 作主詞；受格 us 作動詞或介系詞的受詞。", ["librarian", "catalog", "search"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(541 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${541 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "八年級下", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 8 && index <= 19 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0541–0560 with varied CAP grammar, reading, and vocabulary.");
