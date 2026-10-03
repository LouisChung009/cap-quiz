import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const trailText = "【Reading material: The Southend Trail】The Southend Trail is a 120-km trail popular with nature lovers. It passes beautiful lakes, crosses rivers, and goes through mountains and hills. This gives bird lovers some of the best places for birdwatching. The trail also takes visitors to Southend Museum and two famous castles, Edward Castle and Sloan Castle. Plan one day for one part of the trail and start your hike early in the morning, because each part takes at least seven hours. Visitors may bike, but must stay on the main trail because the side trails are not wide enough for biking. There are two kinds of lodging: camping is popular in summer but allowed only at a few campgrounds; visitors can also stay at hotels in towns, some of which serve breakfast.";
const wordGames = "【Reading material: Palindromes and anagrams】English words are made of 26 letters, and palindromes and anagrams are two kinds of word games about spelling. A palindrome is a word or a sentence that reads the same from left to right or from right to left, __40__, “eye,” “Bob,” “my gym,” and “Was it a car or a cat I saw?” An anagram of a word or words is made by putting the letters of the word or words in a different way. Examples: earth → heart; between → been wet; a lie → I eat; mistake → __41__. Anagrams are often longer words that don’t really mean anything but are fun to say. Sometimes they can even mean something __42__, like when a common word, “restaurant,” becomes “Eat rats, run!” Actually, palindromes and anagrams are __43__. Palindromes can be used to learn mathematics and make music. Anagrams are also a good way to hide something. In history, people often hid their important studies in anagrams.";

const updates = {
  "OFF-0311": {
    question: `${trailText}\n\nWhat is recommended to people who are visiting the Southend Trail?`,
    options: ["Camping on the side trails.", "Biking along the side trails.", "Hiking one part of the trail a day.", "Visiting the museum in the morning."],
    explanation: "答案是 C：一天走一段步道。文章建議一段步道安排一天，並要早點出發，因為每段至少需要七小時。露營只限少數營地；自行車不能走較窄的支線；文章沒有建議早上參觀博物館。 Answer: C.",
    solutionSteps: ["找建議句：‘Plan one day for one part of the trail and start your hike early in the morning.’", "文章也說每一段至少要走七小時，支持一天安排一段。", "所以選 C。A、B 與營地限制及支線太窄不能騎車相反，D 的早上參觀並非文章建議。"],
    teacherTip: "問建議時找文中的 should、best、plan 等明確建議語句，避免自行推想行程。",
    relatedWords: ["recommend（建議）", "trail（步道）", "at least（至少）"]
  },
  "OFF-0312": {
    question: `${trailText}\n\nWhat does “lodging” mean in the reading?`,
    explanation: "答案是 B「A place to stay in（住宿的地方）」。上下文接著列出露營和住旅館兩種方式，兩者都是住宿選擇，因此 lodging 指住宿。 Answer: B.",
    solutionSteps: ["先看 lodging 後面接著列舉的兩種方式：camping 和 staying at a hotel。", "露營與旅館都是旅客過夜、停留的住宿方式。", "因此 lodging 是住宿的地方或安排，選 B；其他選項的餐點、參觀時間和交通方式都不符。"],
    teacherTip: "字義題先看生字後面的例子或分類；此處 camping 和 hotel 共同指向住宿。",
    relatedWords: ["lodging（住宿）", "campground（露營地）", "hotel（旅館）"]
  },
  "OFF-0313": {
    question: `${trailText}\n\nKaylen will start his trip from Cove. He plans to visit one of the old castles. He also wants to go birdwatching near the river. Which parts of the trail should Kaylen go on?`,
    explanation: "答案是 A：Parts 1 and 2。依原卷路線圖，從 Cove 走 Part 1 可到 Dove，再走 Part 2 到 Kint；路線靠近 Sloan Castle，且其中一段鄰近河流，符合參觀古堡及河邊賞鳥的兩個條件。路線圖是必要作答資料，已保留。 Answer: A.",
    solutionSteps: ["從起點 Cove 出發，先沿 Part 1 到 Dove，再接 Part 2 到 Kint。", "對照路線圖，這組連續路段可到 Sloan Castle 附近，且其中一段鄰近河流，符合參觀古堡與河邊賞鳥的目的。", "因此選 A。其他組合不是從 Cove 出發的連續路段，或未同時符合城堡與河流條件。"],
    teacherTip: "地圖題同時核對起點、路段連續性及目的地／沿途地標；圖示是本題必要資料。",
    relatedWords: ["castle（城堡）", "birdwatching（賞鳥）", "near（靠近）"],
    requiresImage: true,
    requiresContext: true,
    questionImages: ["./assets/official-exams/111-english-p13.webp"]
  },
  "OFF-0314": {
    question: `${wordGames}\n\nFill in blank 40 in the passage above.`,
    explanation: "答案是 D「for example（例如）」。後面列出 eye、Bob、my gym 等回文例子，因此需要用 for example 引出例子。",
    solutionSteps: ["先看空格後的內容：接著列出 eye、Bob、my gym 和一個完整句子。", "這些都是 palindrome 的實例，所以需要表示舉例的連接語。", "for example 意為「例如」，選 D；in fact、at first、of course 都不負責引出例子。"],
    teacherTip: "連接詞題要看前後句的邏輯關係；列舉例子時用 for example。",
    relatedWords: ["palindrome（回文）", "for example（例如）", "spelling（拼字）"]
  },
  "OFF-0315": {
    question: `${wordGames}\n\nFill in blank 41 in the passage above.`,
    explanation: "答案是 C「it makes」。mistake 的七個字母重新排列後，可組成 it makes；兩者字母數量及字母種類相同。",
    solutionSteps: ["把 mistake 的字母列出：m、i、s、t、a、k、e。", "it makes 也使用 i、t、m、a、k、e、s，各字母恰好各一次。", "所以 it makes 是 mistake 的 anagram，選 C；其他片語含有不同字母或字母數不符。"],
    teacherTip: "Anagram 必須保留原詞所有字母，不能增減或重複字母。",
    relatedWords: ["anagram（易位構詞／字母重排詞）", "rearrange（重新排列）", "letter（字母）"]
  },
  "OFF-0316": {
    question: `${wordGames}\n\nFill in blank 42 in the passage above.`,
    explanation: "答案是 A「strange（奇怪的）」。文章舉 ‘restaurant’ 變成 ‘Eat rats, run!’ 的例子，說明易位後的語句有時意思很奇特。",
    solutionSteps: ["先看 ‘restaurant’ 和 ‘Eat rats, run!’ 這組例子。", "新組成的語句內容荒誕、出人意料，作者用它說明 anagram 有時會形成奇怪的意思。", "因此選 strange（奇怪的），答案 A；difficult、delicious、important 都不符合這個例子的語氣。"],
    teacherTip: "strange ≈ odd / unusual（奇怪／不尋常）；勿把 difficult（困難）混為「意思奇怪」，要根據餐廳字母重排後的荒誕例子判斷。",
    relatedWords: ["strange（奇怪的）", "odd（奇怪的）", "unusual（不尋常的）", "difficult（困難的；勿混淆）"]
  },
  "OFF-0317": {
    question: `${wordGames}\n\nFill in blank 43 in the passage above.`,
    explanation: "答案是 A「more than just games（不只是遊戲）」。下文接著說回文可用於學數學、作曲，易位詞可用來隱藏資訊，這些用途說明它們不只是文字遊戲。",
    solutionSteps: ["讀空格後的支持內容：回文可協助學數學和作曲，易位詞可隱藏重要研究。", "這些用途超出遊戲本身，所以作者要說兩者不只是遊戲。", "選 A。B、C、D 都與下文列出的實際用途無關或相反。"],
    teacherTip: "more than just games ≈ not merely games（不只是遊戲）；用後文列出的用途統整主旨，別只看到前文的 word games 就選項。",
    relatedWords: ["more than just（不只是）", "not merely（不僅／不只是）", "use（用途）", "hide（隱藏）"]
  }
};

for (const row of rows) {
  const update = updates[row.id];
  if (!update) continue;
  Object.assign(row, update);
  if (!Object.hasOwn(update, "requiresImage")) {
    row.requiresImage = false;
    row.requiresContext = false;
    row.questionImages = [];
    delete row.questionImage;
    delete row.imageAlt;
  }
}

if (Object.keys(updates).some(id => !rows.some(row => row.id === id))) throw new Error("One or more IDs were not found");
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(updates).length} official 111 English items.`);
