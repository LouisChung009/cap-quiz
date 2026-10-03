import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["現在完成式", "Our class ___ three different ways to reduce food waste this semester.", ["tries", "tried", "has tried", "is trying"], 2, "this semester 表示本學期到現在的經驗，使用現在完成式 has tried。", ["辨認時間範圍延續到現在。", "現在完成式用 have/has + p.p.。", "class 視為單數，選 has tried。"], "this year/this semester 常搭現在完成式，表到目前為止。", ["reduce", "food waste", "semester"]],
  ["比較級", "The new science building is ___ than the old one, but it uses less electricity.", ["large", "larger", "largest", "more largely"], 1, "than 表示兩棟建築比較；large 為短母音加子音結尾，需雙寫 g 再加 -er：larger。", ["找比較線索 than。", "比較兩棟建築的大小。", "large → larger，選 B。"], "large 的比較級雙寫 g；不要選副詞 largely。", ["building", "electricity", "larger"]],
  ["分詞形容詞", "The documentary about ocean plastic was so ___ that I watched it twice.", ["interest", "interested", "interesting", "interests"], 2, "documentary 是引起興趣的事物，用 -ing 形容詞 interesting。", ["被描述的是影片。", "事物令人感興趣用 -ing。", "選 interesting。"], "interesting 描述事物；interested 描述觀眾的感受。", ["documentary", "ocean", "plastic"]],
  ["動詞片語", "Please ___ the computer before you leave the classroom to save energy.", ["turn off", "turn down", "look after", "take after"], 0, "離開教室前為節省能源要關掉電腦，turn off 表關閉電器。", ["由 save energy 判斷要減少耗電。", "需要關閉電腦。", "選 turn off。"], "turn off 關閉；turn down 是調低音量或拒絕。", ["turn off", "save energy", "leave"]],
  ["名詞子句", "The teacher asked ___ the students had finished the online survey.", ["what", "whether", "where", "whose"], 1, "asked 後面是是否完成問卷的間接疑問，使用 whether。", ["子句內容是完成與否。", "表示「是否」用 whether。", "選 whether。"], "whether/if 引導是否；名詞子句用直述句語序。", ["survey", "finish", "whether"]],
  ["被動語態", "The school garden ___ by students every Wednesday afternoon.", ["waters", "is watered", "watered", "is watering"], 1, "garden 是被澆水的對象，every Wednesday 表固定安排，用現在被動 is watered。", ["主詞 garden 承受 water。", "every Wednesday 表習慣。", "單數主詞用 is + p.p.，選 B。"], "現在被動 am/is/are + 過去分詞。", ["garden", "water", "Wednesday"]],
  ["過去完成式", "By the time the firefighters arrived, the residents ___ the building safely.", ["leave", "have left", "had left", "were leaving"], 2, "居民在消防員抵達前已離開，較早的過去事件用 had left。", ["辨認兩個過去事件。", "居民離開早於消防員抵達。", "較早事件用過去完成式 had left。"], "By the time + 過去式常搭過去完成式表示先後。", ["firefighter", "resident", "safely"]],
  ["不定詞與動名詞", "The coach suggested ___ the route before the cycling race.", ["check", "to check", "checking", "checked"], 2, "suggest 後接動名詞 checking，不接不定詞。", ["確認主要動詞 suggest。", "suggest + V-ing。", "選 checking。"], "suggest doing；不是 suggest someone to do。", ["suggest", "route", "race"]],
  ["閱讀理解", "A notice reads, “The art room is reserved for an exam from 1:00 to 2:30. Club members may use it after 2:30.” When may club members enter?", ["Before 1:00 only", "Between 1:00 and 2:30", "After 2:30", "At any time"], 2, "告示指出考試於 2:30 結束，社團成員可在 2:30 之後使用美術教室。", ["找出 enter 的時間條件。", "1:00–2:30 期間教室保留給考試。", "社團可 after 2:30 進入。"], "注意時間範圍的起訖與 after/until 的差別。", ["reserve", "exam", "member"]],
  ["字彙語境", "The path is slippery after the rain, so walk ___ and hold the handrail.", ["carefully", "careful", "care", "caring"], 0, "空格修飾 walk，描述行走方式用副詞 carefully。", ["找被修飾的動詞 walk。", "動作方式使用副詞。", "選 carefully。"], "careful 是形容詞，carefully 是副詞；修飾動詞需用副詞。", ["slippery", "handrail", "carefully"]],
  ["關係代名詞", "The scientist ___ research changed the way we understand sleep received an award.", ["who", "whose", "which", "where"], 1, "空格後接名詞 research，表示研究屬於 scientist，使用 whose。", ["先行詞是人 scientist。", "空格修飾 research 表所有關係。", "選 whose。"], "whose + 名詞表示所有；who 作主詞或受詞。", ["research", "understand", "award"]],
  ["不定代名詞", "The first plan was too expensive, so we chose the ___ one.", ["other", "another", "others", "the other"], 3, "兩個方案中已提到第一個，剩下特定的另一個用 the other。", ["題目指出 total plans 為 two。", "第一個已知，另一個是特定剩餘者。", "選 the other。"], "the other 指兩者中特定另一個；another 指不特定再一個。", ["plan", "expensive", "choose"]],
  ["時間子句", "Please wait here until the doctor ___ your name.", ["will call", "calls", "called", "calling"], 1, "until 引導未來時間子句時用現在式 calls。", ["辨認 until 子句談未來。", "時間子句不用 will。", "doctor 單數，選 calls。"], "when/until/before/after 子句表未來時用現在式。", ["wait", "doctor", "call"]],
  ["被動語態", "The community center ___ next month, according to the construction notice.", ["opens", "will open", "will be opened", "has opened"], 2, "community center 將被啟用，next month 指未來，使用未來被動 will be opened。", ["主詞 center 承受 open 動作。", "next month 表未來。", "未來被動 will be + p.p.，選 C。"], "will be + 過去分詞表示未來被動。", ["community center", "construction", "notice"]],
  ["假設語氣", "If the students ___ more time, they could improve the model before the exhibition.", ["have", "had", "will have", "are having"], 1, "could improve 表假設結果，if 子句使用過去式 had。", ["觀察主句 could improve。", "假設現在可用時間更多。", "選 had。"], "第二類條件句 If + 過去式，主句 could/would + 原形。", ["improve", "model", "exhibition"]],
  ["字彙與同義詞", "The guide gave a brief explanation before the visitors entered the cave.", ["short", "confusing", "noisy", "private"], 0, "brief 表簡短，closest meaning 為 short。", ["辨認 brief 修飾 explanation。", "選意思相近的形容詞。", "short 表短的，選 A。"], "brief ≈ short/concise；confusing 是令人困惑，易混淆但不同義。", ["brief", "explanation", "visitor"]],
  ["附加問句", "You haven't returned the library book yet, ___?", ["have you", "haven't you", "did you", "do you"], 0, "主句是現在完成式否定句 haven't returned，附加問句用肯定 have you。", ["找主句助動詞 have。", "主句否定，tag 改肯定。", "主詞 you 不變，選 have you。"], "附加問句沿用助動詞並反轉肯否。", ["return", "library book", "yet"]],
  ["字彙語境", "The museum is free on Sundays, so visitors do not need to pay an ___.", ["entrance fee", "appointment", "experiment", "address"], 0, "免費入館表示不必支付 entrance fee（入場費）。", ["由 free 判斷費用為零。", "需要名詞表示入場時支付的費用。", "選 entrance fee。"], "fee 是費用；fare 常指交通票價，注意語境。", ["free", "visitor", "entrance fee"]],
  ["閱讀推論", "A message says, “Your online order will arrive in two separate boxes. The first box contains the books; the second will arrive next Tuesday.” What should the customer expect?", ["All items arrive today", "The books are in the first box", "The second box is canceled", "The books arrive next Tuesday"], 1, "訊息直接說第一箱裝書，第二箱下週二送達；因此可確定書在第一箱。", ["分辨 first box 與 second box 的內容。", "books 明確在第一箱。", "選 The books are in the first box。"], "閱讀多步資訊時分開比對箱次、內容與送達日期。", ["separate", "contain", "expect"]],
  ["字彙語境", "The hiking trail was ___ after the heavy snow, so visitors had to take another route.", ["closed", "borrowed", "invented", "collected"], 0, "大雪後需改走其他路線，表示登山步道 closed（封閉）。", ["由 visitors had to take another route 推知原路不能通行。", "需要表達道路暫停開放的字。", "選 closed。"], "closed 可描述道路或場所暫停開放；close 作動詞也表示關閉。", ["trail", "heavy snow", "route"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(521 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${521 + index}`);
  const [knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester: "八年級下", unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 8 || index >= 16 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0521–0540 with varied grammar, vocabulary, and reading contexts.");
