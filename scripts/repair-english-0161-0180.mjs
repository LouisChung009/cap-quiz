import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(file, "utf8"));
const items = [
  ["七年級上", "時間介系詞", "Our class meeting is ___ Friday afternoon, not Thursday.", ["at", "in", "on", "by"], 2, "Friday 是星期，星期前用 on；afternoon 不改變星期前介系詞。", ["辨認時間資訊是 Friday。", "星期前用 on。", "選 on。"], "on Friday；in the afternoon，但合併時可說 on Friday afternoon。", ["meeting", "Friday", "afternoon"]],
  ["七年級上", "主詞與動詞一致", "Neither of the two answers ___ correct; check the calculation again.", ["are", "is", "were", "be"], 1, "neither of + 複數名詞在正式文法中通常視為單數，使用 is。", ["主詞核心是 neither。", "neither 表兩者皆非，文法視為單數。", "選 is。"], "neither 通常搭單數動詞；不要只被後面的 answers 誘導。", ["neither", "answer", "calculation"]],
  ["七年級上", "所有格", "That is ___ bicycle; the name tag on it says “Mia.”", ["Mia", "Mias", "Mia's", "Mias'"], 2, "名牌顯示腳踏車屬於 Mia，單數人名所有格加 's。", ["找出擁有者 Mia。", "單數名詞表示所有格加 's。", "選 Mia's。"], "單數所有格加 's；複數以 s 結尾通常只加撇號。", ["bicycle", "name tag", "belong to"]],
  ["七年級上", "感官動詞", "The singer's voice sounds ___ in the empty hall.", ["beautiful", "beautifully", "beauty", "beautify"], 0, "sound 為連綴動詞，後接形容詞描述聲音，用 beautiful。", ["主詞是 voice。", "sound 在此表示聽起來，不是發出聲音的動作。", "選形容詞 beautiful。"], "連綴動詞 sound/look/feel 後用形容詞，不用副詞。", ["voice", "sound", "hall"]],
  ["七年級下", "過去式不規則變化", "The bus ___ ten minutes late because of heavy traffic yesterday.", ["comes", "come", "came", "has come"], 2, "yesterday 指過去；come 的過去式是不規則變化 came。", ["先確認時間是 yesterday。", "come 不加 -ed，過去式為 came。", "選 came。"], "come–came–come；不要把過去式寫成 comed。", ["traffic", "late", "come"]],
  ["七年級下", "many/much", "How ___ time do we have before the museum closes?", ["many", "much", "few", "several"], 1, "time 在此為不可數名詞，詢問多少時間用 How much。", ["辨認 time 是不可數用法。", "How much 修飾不可數名詞。", "選 much。"], "How many + 可數複數；How much + 不可數名詞或詢問價格。", ["time", "before", "close"]],
  ["七年級下", "動詞 + to V", "The nurse reminded the visitors ___ their hands before entering the ward.", ["wash", "washing", "to wash", "washed"], 2, "remind + 人 + to V 表提醒某人做某事，故用 to wash。", ["受詞是 the visitors。", "remind + 人 + to V。", "選 to wash。"], "remind/tell/ask + 人 + to V；勿漏 to。", ["remind", "visitor", "ward"]],
  ["七年級下", "祈使句否定", "___ the glass bottle in the regular trash; recycle it instead.", ["Don't put", "Doesn't put", "Not putting", "No put"], 0, "句子要求不要把玻璃瓶放入一般垃圾，否定祈使句用 Don't + 原形動詞。", ["辨認句子是在給指示。", "否定祈使句使用 Don't。", "put 維持原形，選 Don't put。"], "Don't + 原形動詞；主詞 you 通常省略。", ["glass", "trash", "recycle"]],
  ["七年級下", "連接詞", "The sidewalk was crowded, ___ we crossed the street to use the quieter path.", ["because", "so", "although", "unless"], 1, "人行道擁擠造成改走另一條路，前因後果用 so 連接結果。", ["前句是擁擠的原因。", "後句是因此採取的行動。", "選 so。"], "because 引原因子句；so 引結果，避免同一句重複使用 because...so。", ["sidewalk", "crowded", "quieter"]],
  ["八年級上", "動詞片語", "The school will ___ a survey to learn how students travel to campus.", ["carry out", "carry on", "carry away", "carry off"], 0, "執行調查用 carry out a survey。", ["判斷空格需要「執行」的片語。", "carry out 有執行、實施之意。", "選 carry out。"], "carry out a survey/research；carry on 是繼續。", ["carry out", "survey", "campus"]],
  ["八年級上", "數量詞", "Only ___ students signed up, so the trip was canceled.", ["a little", "much", "a few", "little"], 2, "students 是可數複數，表示少數幾位用 a few。", ["先判斷 students 可數且為複數。", "修飾可數複數用 few。", "a few 表有一些，符合能報名但人數不足，選 C。"], "a few + 可數複數；a little + 不可數名詞。", ["sign up", "a few", "cancel"]],
  ["八年級上", "to V / V-ing 易混", "Mr. Wu stopped ___ when the fire alarm rang.", ["teach", "to teach", "teaching", "taught"], 2, "stop teaching 表停止正在做的教學；警報響起後他中止課程。", ["理解警報響起造成的動作。", "stop + V-ing 表停止該動作。", "選 teaching。"], "stop doing 是停止；stop to do 是停下手邊工作去做另一件事。", ["stop teaching", "fire alarm", "ring"]],
  ["八年級上", "比較級與反義", "The north entrance is ___ than the south one; it has no stairs.", ["accessible", "more accessible", "most accessible", "accessibly"], 1, "than 表兩者比較；多音節形容詞 accessible 用 more 構成比較級。", ["比較 north 與 south 兩個入口。", "accessible 為多音節形容詞。", "用 more accessible，選 B。"], "多音節形容詞通常用 more/most；accessibility 是名詞。", ["accessible", "entrance", "stairs"]],
  ["八年級下", "被動語態", "All library books ___ before they are returned to the shelves.", ["check", "are checked", "checked", "are checking"], 1, "books 是被檢查的對象；一般規則以現在式被動 are checked 表示。", ["主詞 books 承受 check 動作。", "一般規則用現在簡單式。", "複數主詞搭 are + p.p.，選 are checked。"], "現在被動 am/is/are + p.p.；主詞複數用 are。", ["library", "check", "shelf"]],
  ["八年級下", "完成式與 since/for", "Our team has practiced together ___ three months.", ["since", "for", "during", "from"], 1, "three months 是一段期間，現在完成式搭配 for 表持續多久。", ["辨認 three months 是期間長度。", "for + 一段時間；since + 起始點。", "選 for。"], "for three months；since March。不要把期間和時間起點混用。", ["practice", "together", "for"]],
  ["八年級下", "關係代名詞", "The park ___ my grandparents met is now a public garden.", ["who", "which", "where", "whose"], 2, "先行詞 park 是地點，關係子句中表「在公園相遇」，用 where。", ["找先行詞 park。", "meet 發生在該地點，子句不缺人或物受詞。", "用 where，選 C。"], "where = in/at which；若子句缺受詞才考慮 which/that。", ["park", "meet", "public garden"]],
  ["八年級下", "used to", "My father ___ ride his bike to work, but he takes the train now.", ["is used to", "used to", "uses to", "was using to"], 1, "but he takes the train now 表示過去習慣已改變，使用 used to + 原形動詞。", ["對照以前騎車和現在搭火車。", "描述過去習慣用 used to。", "選 used to。"], "used to do 過去常做；be used to doing 習慣於，後接 V-ing。", ["used to", "ride", "take the train"]],
  ["九年級上", "附加問句", "Let's review the answers together, ___?", ["do we", "shall we", "will you", "don't we"], 1, "Let's 開頭的提議句，慣用附加問句 shall we。", ["先辨認 Let's 是提出共同建議。", "Let's 的 tag question 有固定形式。", "選 shall we。"], "Let's..., shall we?；Let us 命令句的附加問句通常不同。", ["review", "together", "shall we"]],
  ["九年級上", "字彙與同義詞", "The instructions are brief, so you can finish reading them in one minute.", ["short", "unclear", "important", "difficult"], 0, "brief 表簡短，closest meaning 為 short。", ["從 one minute 推知內容不長。", "選與 brief 同義的形容詞。", "short 意為短的，選 A。"], "brief ≈ short/concise；brief 不表示 unclear（不清楚）。", ["brief", "short", "concise"]],
  ["九年級上", "閱讀理解", "A message says, “The 4:20 train is delayed by 15 minutes. The 4:50 train will leave on time.” Which train is expected to leave as scheduled?", ["The 4:20 train", "The 4:35 train", "The 4:50 train", "Both trains are canceled"], 2, "訊息指出 4:20 班次延誤 15 分鐘，4:50 班次準時，因此按原定時間發車的是 4:50 train。", ["分別讀兩班車的狀態。", "4:20 班次延誤；4:50 班次準時。", "選 The 4:50 train。"], "資訊題不要把延誤時間加到另一班車；逐項對照時間與狀態。", ["delay", "on time", "scheduled"]],
];

for (let index = 0; index < items.length; index += 1) {
  const row = rows.find(item => item.id === `ENG-${String(161 + index).padStart(4, "0")}`);
  if (!row) throw new Error(`Missing ENG-${161 + index}`);
  const [gradeSemester, knowledgePoint, question, options, answer, explanation, solutionSteps, teacherTip, relatedWords] = items[index];
  if (options.length !== 4 || new Set(options).size !== 4 || !options[answer]) throw new Error(`Invalid choices for ${row.id}`);
  Object.assign(row, { gradeSemester, unit: "文法與閱讀", knowledgePoint, difficulty: index % 3 === 0 ? "中等" : "進階", type: index >= 18 ? "素養題" : "單題選擇", question, options, answer, explanation, solutionSteps, teacherTip, relatedWords });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote ENG-0161–0180 as 20 distinct CAP-level items.");
