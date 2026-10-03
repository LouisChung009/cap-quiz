import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["被動語態", "The school rules ___ to all new students during orientation.", ["explain", "are explained", "explained", "are explaining"], 1, "rules 是被說明的內容，during orientation 表固定流程，使用現在被動 are explained。", ["主詞 rules 承受 explain。", "句子描述迎新時的流程。", "複數現在被動為 are explained。"], "現在被動式 am/is/are + p.p.。", ["rule", "orientation", "explain"]],
  ["過去被動語態", "The first public library in the town ___ in 1954.", ["opens", "opened", "was opened", "has opened"], 2, "library 是被開設的機構，in 1954 指過去，使用 was opened。", ["主詞 library 承受 open。", "時間是 1954 年。", "過去被動選 was opened。"], "事件若主詞承受動作，使用 be + p.p.。", ["public library", "town", "in 1954"]],
  ["未來被動語態", "The winning photographs ___ in the school hall next month.", ["display", "will display", "will be displayed", "displayed"], 2, "照片將被展示，next month 指未來，使用 will be displayed。", ["photographs 承受 display。", "next month 表未來。", "未來被動為 will be + p.p.。"], "未來被動式 will be + 過去分詞。", ["photograph", "display", "winning"]],
  ["現在完成式", "The volunteers ___ more than 300 kilograms of litter from the beach so far.", ["collect", "collected", "have collected", "are collecting"], 2, "so far 表示到目前為止的成果，使用現在完成式 have collected。", ["找出 so far。", "成果累積至現在。", "複數主詞 volunteers 搭 have collected。"], "現在完成式 have/has + p.p.。", ["volunteer", "litter", "beach"]],
  ["時間介系詞", "The school play will begin ___ 6:30, so please take your seats early.", ["in", "on", "at", "by"], 2, "6:30 是明確時刻，時間前使用 at。", ["辨認空格後是鐘點。", "明確時刻前用 at。", "選 at。"], "at + 時刻；on + 星期/日期；in + 月份/年份。", ["play", "begin", "seat"]],
  ["動名詞", "The doctor recommends ___ enough water during hot weather.", ["drink", "to drink", "drinking", "drank"], 2, "recommend 後接動名詞 drinking。", ["確認主要動詞 recommends。", "recommend + V-ing。", "選 drinking。"], "recommend doing something；不要誤用 recommend to do。", ["recommend", "enough", "weather"]],
  ["比較級", "The new bus route is ___ for students who live near the river.", ["convenient", "more convenient", "most convenient", "conveniently"], 1, "句中比較新路線對學生的方便程度，多音節形容詞用 more convenient。", ["辨認比較語意。", "convenient 為多音節形容詞。", "比較級用 more，選 B。"], "多音節形容詞常以 more/most 構成比較級、最高級。", ["route", "convenient", "near"]],
  ["關係代名詞", "The musician ___ performed at the opening ceremony is from Taiwan.", ["which", "who", "where", "whose"], 1, "先行詞 musician 指人，且關係子句缺主詞，使用 who。", ["先行詞是 musician。", "關係子句中缺少表演者主詞。", "選 who。"], "who 指人；which 指物。", ["musician", "perform", "ceremony"]],
  ["閱讀理解", "A sign reads, “The computer room is reserved for Grade 9 until 3:30. Other students may enter after that time.” When may Grade 8 students enter?", ["Before 3:30", "Until noon", "After 3:30", "Only on weekends"], 2, "電腦教室保留給九年級直到 3:30，其他學生可在該時間之後進入。", ["找出其他年級的規定。", "reserved until 3:30 表示之前不能使用。", "選 After 3:30。"], "until 表示截至某時間；after 表示該時間之後。", ["reserve", "Grade", "enter"]],
  ["字彙與易混淆詞", "The coach gave us useful advice about how to avoid injuries.", ["helpful", "expensive", "dangerous", "unusual"], 0, "useful 意為有用的，與 helpful 意思最接近。", ["注意 advice 的內容是避免受傷。", "判斷 useful 的近義形容詞。", "選 helpful。"], "useful ≈ helpful；advice 是不可數名詞，不加 s。", ["useful", "advice", "injury"]],
  ["現在進行式", "Look! The clouds ___ over the mountains, and rain is likely soon.", ["move", "moved", "are moving", "have moved"], 2, "Look! 表示觀察當下，雲正在移動，使用現在進行式 are moving。", ["找出 Look! 的當下線索。", "動作正在發生。", "clouds 複數搭 are moving。"], "現在進行式 am/is/are + V-ing。", ["cloud", "mountain", "likely"]],
  ["連接詞", "The instructions looked simple; ___, several students made the same mistake.", ["therefore", "however", "because", "so that"], 1, "說明看似簡單但學生仍犯錯，前後形成轉折，使用 however。", ["比較 simple 與 made the same mistake。", "實際情況違反預期。", "選 however。"], "however 表轉折；therefore 表結果。", ["instruction", "mistake", "however"]],
  ["動詞片語", "We need to ___ the meeting because several members are sick.", ["put off", "put on", "put away", "put out"], 0, "多位成員生病，需要延後會議，put off 表延期。", ["由 members are sick 推知要改時間。", "延後會議用 put off。", "選 A。"], "put off ≈ postpone；put on 是穿上或上演。", ["put off", "meeting", "member"]],
  ["現在完成式", "How long ___ Mina ___ in this neighborhood?", ["did / live", "has / lived", "have / lived", "is / living"], 1, "How long 問 Mina 居住多久且住到現在，正確組合是「has / lived」，使用現在完成式。", ["辨認 How long 問持續時間。", "居住延續至現在，使用現在完成式。", "Mina 為單數主詞，選 has / lived。"], "How long + 現在完成式詢問持續到現在的時間長度。", ["neighborhood", "How long", "live"]],
  ["被動語態", "The classroom windows ___ before the parents' meeting yesterday.", ["clean", "were cleaned", "are cleaning", "have cleaned"], 1, "windows 是被清潔的對象，yesterday 指過去，複數主詞用 were cleaned。", ["主詞 windows 承受 clean。", "yesterday 表過去。", "過去被動複數選 were cleaned。"], "過去被動 was/were + p.p.。", ["classroom", "window", "parent meeting"]],
  ["字彙語境", "The instructions were so confusing that we asked the guide to explain them again.", ["unclear", "accurate", "ordinary", "silent"], 0, "confusing 表令人困惑，因此 unclear（不清楚）最接近。", ["從 asked the guide to explain again 推知。", "原說明令人難懂。", "選 unclear。"], "confusing ≈ unclear/difficult to understand；confused 描述人的感受。", ["confusing", "explain", "guide"]],
  ["不定詞表目的", "The school installed brighter lights ___ the stairs safer at night.", ["make", "making", "to make", "made"], 2, "安裝明亮燈光的目的是讓樓梯夜間更安全，使用 to make 表目的。", ["找出 installed lights 的目的。", "目的用 to + 原形。", "選 to make。"], "to V 表目的；make + 受詞 + 形容詞。", ["install", "stair", "safer"]],
  ["閱讀理解", "A schedule says, “Bus 12 leaves at 7:40 from Gate C. Bus 15 leaves at 8:05 from Gate A.” Which bus leaves earlier?", ["Bus 12", "Bus 15", "Both at the same time", "The schedule gives no time"], 0, "Bus 12 在 7:40 發車，早於 Bus 15 的 8:05。", ["讀出兩班車的發車時間。", "比較 7:40 與 8:05。", "較早的是 Bus 12。"], "時刻表題先對齊車次和時間，不要將月台資訊當成時間。", ["schedule", "leave", "gate"]],
  ["反身代名詞", "The students taught ___ how to edit the video using an online tutorial.", ["them", "their", "themselves", "they"], 2, "學生自行學會剪輯，主詞與受詞相同，使用反身代名詞 themselves。", ["主詞是 students。", "動作 taught 回指主詞自己。", "選 themselves。"], "teach oneself 表自學；反身代名詞依主詞單複數變化。", ["teach oneself", "edit", "tutorial"]],
  ["條件句", "If the museum is closed on Monday, we ___ the history center instead.", ["visit", "visited", "will visit", "would visit"], 2, "博物館週一關門是未來可能條件，替代計畫用 will visit。", ["if 子句 is closed 用現在式。", "主句提出可能的未來安排。", "選 will visit。"], "第一類條件句主句常用 will + 原形。", ["museum", "history center", "instead"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(581 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${581 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "八年級下", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 8 && index <= 19 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0581–0600 with distinct grammar, reading, and vocabulary skills.");
