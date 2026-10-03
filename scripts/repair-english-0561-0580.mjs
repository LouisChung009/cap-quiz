import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["被動語態", "The school website ___ every week to keep the information current.", ["updates", "is updated", "updated", "is updating"], 1, "website 是被更新的對象，every week 表示固定頻率，用現在被動 is updated。", ["主詞 website 承受 update。", "every week 表示規則。", "單數現在被動選 is updated。"], "現在被動式 am/is/are + p.p.。", ["website", "update", "current"]],
  ["過去被動語態", "The ancient temple ___ during an earthquake hundreds of years ago.", ["damages", "was damaged", "has damaged", "is damaging"], 1, "temple 是受損對象，hundreds of years ago 指過去，使用 was damaged。", ["判斷主詞 temple 承受 damage。", "時間在數百年前。", "過去被動用 was + p.p.，選 B。"], "過去被動：was/were + 過去分詞。", ["ancient", "temple", "earthquake"]],
  ["現在完成被動", "Several new bike lanes ___ since the city began its safety project.", ["add", "added", "have been added", "are adding"], 2, "bike lanes 是被新增的；since 表示從過去到現在，使用 have been added。", ["主詞 bike lanes 承受 add。", "since 將時間連到現在。", "複數現在完成被動為 have been + p.p.。"], "現在完成被動：has/have been + p.p.。", ["bike lane", "safety", "project"]],
  ["被動語態疑問句", "Where ___ the lost-and-found items ___ after each school term?", ["do / store", "are / stored", "are / storing", "did / stored"], 1, "物品是被存放的；現在被動疑問句為 be + 主詞 + p.p.，選 are / stored。", ["主詞 items 承受 store。", "after each school term 表固定規則。", "複數現在被動疑問句用 are stored。"], "被動疑問句把 be 動詞置於主詞前；後接過去分詞。", ["lost-and-found", "store", "term"]],
  ["情態助動詞被動", "All visitors must ___ their tickets at the entrance.", ["show", "be shown", "showed", "be showing"], 0, "visitors 是出示票券的人，主詞主動執行 show；must 後接原形。", ["判斷主詞 visitors 是動作者。", "不是票被出示給訪客。", "must 後用原形 show。"], "must + 原形動詞；先辨認主詞是動作者還是承受者。", ["visitor", "ticket", "entrance"]],
  ["過去進行式", "At 8 p.m. yesterday, the students ___ for the school play.", ["rehearse", "were rehearsing", "have rehearsed", "are rehearsing"], 1, "At 8 p.m. yesterday 表過去特定時刻正在進行；students 為複數，用 were rehearsing。", ["辨認昨天晚上八點。", "動作當時進行中。", "複數主詞搭 were + V-ing。"], "過去進行式 was/were + V-ing。", ["rehearse", "school play", "yesterday"]],
  ["字彙語境", "The sign is visible from far away because the letters are large and bright.", ["easy to see", "hard to hear", "safe to touch", "ready to eat"], 0, "visible 表看得見；因字體大且明亮，所以 easy to see 最接近。", ["由 letters are large and bright 推知。", "visible 描述視覺可見性。", "選 easy to see。"], "visible ≈ able/easy to be seen；不要和 audible（聽得見）混淆。", ["visible", "bright", "letter"]],
  ["連接詞", "The weather was cold; ___, the hikers continued toward the summit.", ["therefore", "however", "because", "so that"], 1, "天冷與仍繼續登頂形成轉折，however 表然而。", ["比較兩個分句的預期關係。", "寒冷通常使人停止，但他們仍前進。", "選 however。"], "however 表轉折；therefore 表因果結果。", ["hiker", "continue", "summit"]],
  ["代名詞", "The two teams shared ___ ideas before choosing the best design.", ["each other", "one another's", "another", "the others"], 1, "兩隊分享彼此的想法，所有格 one another's 修飾 ideas。", ["空格後接名詞 ideas。", "表達互相分享，需互相代名詞所有格。", "選 one another's。"], "each other/one another 表彼此；後接名詞時用所有格形式。", ["share", "design", "idea"]],
  ["閱讀理解", "A note says, “Please return borrowed tablets to the media desk before the 4:00 bell. The desk closes at 4:15.” When should students return the tablets?", ["Before the 4:00 bell", "At 4:15", "After the desk closes", "The next morning"], 0, "便條要求在 4 點鐘響前歸還平板；櫃台 4:15 關閉是另一時間資訊。", ["找問題問歸還時間。", "辨認明確指示 before the 4:00 bell。", "選 Before the 4:00 bell。"], "閱讀規則時區分交還期限與櫃台關閉時間。", ["borrow", "return", "media desk"]],
  ["不定詞與動名詞", "The students decided ___ a short survey about sleep habits.", ["conduct", "conducting", "to conduct", "conducted"], 2, "decide 後接不定詞 to conduct。", ["確認主要動詞 decided。", "decide + to V。", "選 to conduct。"], "decide to do；不同動詞對後接 to V 或 V-ing 有固定搭配。", ["decide", "survey", "habit"]],
  ["字彙與同義詞", "The team finally solved the problem after testing several possible solutions.", ["at last", "at first", "by mistake", "in danger"], 0, "finally 表最後終於，與 at last 意思相近。", ["觀察 finally 所描述的結果。", "選同樣表示終於的片語。", "選 at last。"], "finally ≈ at last/eventually；at first 表一開始。", ["finally", "solve", "solution"]],
  ["關係副詞", "That is the café ___ our debate club meets after school.", ["which", "who", "where", "whose"], 2, "先行詞 café 是地點，子句完整而表「在那裡聚會」，用 where。", ["先行詞是 café。", "meet 發生在該地點，子句不缺受詞。", "選 where。"], "where = in/at which；若子句缺受詞才用 which/that。", ["café", "debate club", "meet"]],
  ["被動語態", "The science fair ___ in the gym next Friday if the weather is poor.", ["holds", "will hold", "will be held", "held"], 2, "science fair 是被舉辦的活動，next Friday 指未來，使用 will be held。", ["主詞 fair 承受 hold。", "next Friday 表未來。", "未來被動為 will be + p.p.，選 C。"], "hold an event 的被動是 event is held。", ["science fair", "gym", "weather"]],
  ["現在完成式", "I ___ this science podcast several times, so I know the explanation well.", ["hear", "heard", "have heard", "am hearing"], 2, "several times 表到現在為止的經驗，使用現在完成式 have heard。", ["辨認次數 several times。", "經驗與現在了解內容相關。", "I 搭 have heard。"], "現在完成式 have/has + p.p.；hear–heard–heard。", ["podcast", "several times", "explanation"]],
  ["條件句", "If the museum ticket includes the audio guide, visitors ___ extra for it.", ["don't pay", "didn't pay", "won't pay", "wouldn't paid"], 2, "若門票含語音導覽，訪客將不必另付費，未來結果用 won't pay。", ["if 子句 includes 用現在式。", "主句說明未來費用結果。", "選 won't pay。"], "第一類條件句主句可用 won't + 原形表未來否定。", ["ticket", "audio guide", "extra"]],
  ["分詞形容詞", "The children were ___ by the planetarium show and asked many questions.", ["amazing", "amazed", "amaze", "amazes"], 1, "children 是感到驚奇的人，用 amazed；表演才是 amazing。", ["判斷被描述的是 children。", "人的感受用 -ed。", "選 amazed。"], "amazed 描述感受者；amazing 描述令人驚奇的事物。", ["planetarium", "show", "question"]],
  ["冠詞", "We saw ___ eagle circling above the lake during the field trip.", ["a", "an", "the", "不需冠詞"], 1, "eagle 開頭為母音音素，首次提及單數可數名詞用 an。", ["確認 eagle 為單數可數名詞。", "首次提及使用不定冠詞。", "母音音素前用 an。"], "冠詞依發音而非字母；an eagle、a university。", ["eagle", "circle", "field trip"]],
  ["閱讀推論", "A message says, “The 2:15 ferry is full. Extra seats are available on the 2:45 ferry, but tickets must be bought at the harbor office.” What should a passenger do for a seat?", ["Board the 2:15 ferry", "Buy a ticket at the harbor office for 2:45", "Wait at the airport", "Use the 2:15 ticket twice"], 1, "正確答案是 Buy a ticket at the harbor office for 2:45。2:15 班次已滿；2:45 尚有座位，且需在港口辦公室買票。", ["排除已滿的 2:15 班次。", "找出有座位的 2:45 班次。", "依指示到 harbor office 購票。"], "綜合交通公告時同時核對班次、座位與購票地點。", ["ferry", "available", "harbor"]],
  ["字彙與易混淆詞", "The museum is open daily except Monday; it is ___ on that day.", ["closed", "close", "closely", "closing"], 0, "except Monday 表示週一例外不開放，使用形容詞 closed。", ["理解 except 表示例外。", "句子說明週一的開放狀態。", "選 closed。"], "closed 作形容詞表示關閉；close 作動詞，closely 是仔細地。", ["except", "daily", "closed"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(561 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${561 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "八年級下", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 8 && index <= 19 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0561–0580 with varied CAP grammar, reading, and vocabulary.");
