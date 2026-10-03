import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const review = (number, page, note) => ({ status: `已依114年官方英文科題本第${number}題核對`, note, evidenceSources: [`${base}114-english-p${page}.webp`] });
const repairs = {
  "OFF-0917": {
    explanation: "答案 D, plane（飛機）。題目要求看圖判斷飛在房屋上空的物體；圖中物體有機身與機翼，是 plane。bird 是鳥、butterfly 是蝴蝶、kite 是風箏，外形和圖示不符。",
    solutionSteps: ["先看空格後的句型：A ____ is flying over the houses，空格需要一個可飛在房屋上空的單數名詞。", "再對照圖中的輪廓：物體有機身與機翼，判斷為飛機。", "因此選 D plane。鳥、蝴蝶和風箏雖然也能在空中，但形狀不符合圖示。"],
    teacherTip: "plane 的近義詞是 airplane；kite 是風箏，不能只因為題目提到 flying 就選任何會飛的物品。",
    answerKeyReview: review(1, 2, "依第1題圖示辨認房屋上空的飛機；保留此題必要插圖。"),
  },
  "OFF-0918": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D, shy（害羞的）。句子用 But now 對比過去和現在：以前不容易和人交談，現在比較容易，表示以前較害羞。shy 的近義詞有 timid、bashful；happy 是快樂，lazy 是懶惰，popular 是受歡迎，均不符合談話上的轉變。",
    solutionSteps: ["抓轉折詞 But now，前後在比較青少年時期和現在。", "現在更容易和人交談，暗示以前較不擅長社交，因此形容詞應是 shy。", "選 D。句型 When I was a teenager 用過去式 was，描述過去狀態。"],
    teacherTip: "shy＝timid／bashful（害羞）；不要把 popular（受歡迎）當成 talkative（健談），兩者意思不同。",
    answerKeyReview: review(2, 2, "依 But now 的今昔對比及談話情境核對形容詞 D。"),
  },
  "OFF-0919": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C, sailing（航行、帆船活動）。Lena 怕水，所以不想和 John 去航海。go＋V-ing 常用於活動：go dancing、go hiking、go sailing、go shopping。",
    solutionSteps: ["because 子句指出原因：她怕水。", "四個活動中，sailing（航海）直接涉及水，與怕水的原因吻合。", "選 C。其餘 dancing（跳舞）、hiking（健行）、shopping（購物）都不一定需要接觸水。"],
    teacherTip: "活動搭配 go＋動名詞：go swimming／sailing／hiking；不要在這個固定用法中改用 to sail。",
    answerKeyReview: review(3, 2, "依 afraid of water 的原因線索及 go＋V-ing 活動用法核對 C。"),
  },
  "OFF-0920": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B, listening to。enjoy 後面接動名詞 V-ing，因此要說 enjoys listening to。listen to her dad read stories 的 her dad 是受詞，read 是感官動詞後的原形動詞，表示聽爸爸念故事。",
    solutionSteps: ["先看動詞 enjoy 的用法：enjoy＋V-ing，不接 to V，也不直接接原形動詞。", "listen 後面要接聽的對象時使用 listen to，因此形式是 listening to。", "選 B；her dad read stories 中，read 為受詞後的原形，補足聽到的動作。"],
    teacherTip: "enjoy doing；listen to someone do something。常見錯誤是漏掉 to，或把 enjoy 接成 to listen。",
    answerKeyReview: review(4, 2, "依 enjoy＋V-ing 與 listen to＋受詞的句型核對 B。"),
  },
  "OFF-0921": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D, ready（準備好的）。爸爸正在煮飯，十分鐘後晚餐就會準備好。ready 的近義詞是 prepared；free 是有空／免費，full 是滿的，medium 是中等大小，都不符合晚餐完成的意思。",
    solutionSteps: ["前句 Dad is busy cooking 提供晚餐正在準備的情境。", "空格描述十分鐘後晚餐的狀態，應是「準備好了」。", "選 D ready；will be＋形容詞表示未來的狀態。"],
    teacherTip: "ready＝prepared（準備好的）；be ready 與 get ready 不同，前者描述已準備好，後者表示開始準備。",
    answerKeyReview: review(5, 2, "依烹煮晚餐及十分鐘後的語境核對 ready。"),
  },
  "OFF-0922": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A, faces。此處 face 不是字面上的臉，而是以「新面孔」借代新同事。後句說需要時間記住誰是誰，直接指向辦公室裡有許多新的人。",
    solutionSteps: ["後句 It’ll take me some time to remember who is who 說明說話者還不認識這些人。", "因此 new ____ 應指新出現的人；英文常用 new faces 表示新面孔／新人。", "選 A faces；ideas（想法）、rules（規則）、tools（工具）都不能對應 who is who。"],
    teacherTip: "a familiar face／new faces 是以臉代表人的轉喻用法；不要只按 face 的字面義理解。",
    answerKeyReview: review(6, 2, "依 remember who is who 的語境判斷 new faces 指新同事。"),
  },
  "OFF-0923": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A, fool（傻瓜、糊塗的人）。說話者找鑰匙找了好幾小時，最後才發現一直在口袋裡，因此覺得自己很糊塗。fool 的近義詞依語境可用 silly person；ghost（鬼）、king（國王）、stranger（陌生人）都不合。",
    solutionSteps: ["先讀第二句的結果：鑰匙一直在口袋裡，卻找了好幾個小時。", "說話者因自己的疏忽而自嘲，空格需要表示「糊塗的人」的名詞。", "選 A fool。I feel like a＋名詞，表示「我覺得自己像……」。"],
    teacherTip: "fool 在此是自嘲「糊塗的人」；不要把 feel like a fool 誤讀成「想要一個傻瓜」。",
    answerKeyReview: review(7, 2, "依鑰匙其實在口袋中的反差及 feel like a fool 慣用語核對 A。"),
  },
  "OFF-0924": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B, the other（另一個、剩下那一個）。吳先生夫婦有三個女兒，其中兩個上高中，剩下一個上小學。已知總數為三、兩個已指定，唯一剩下的一個用 the other。",
    solutionSteps: ["先算集合數量：三個女兒中已說明兩個在高中，還有一個未交代。", "指特定範圍中剩下的唯一一個，用 the other；another 通常表示不特定的「再一個」。", "選 B the other。each 是每一個，the one 是那一個，the next 是下一個，均不表示剩下的唯一一位。"],
    teacherTip: "兩者中另一個常用 the other；三者以上已指出部分後，剩下唯一一個也可用 the other。another 是「另一個／再一個」，不強調唯一剩餘。",
    answerKeyReview: review(8, 2, "依三個女兒中兩人已指定、剩下一人的數量關係核對 the other。"),
  },
  "OFF-0925": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D, grow（生長）。海風吹起強風，使樹木難以在海灘生長。grow 的近義詞是 develop；blow 是吹，build 是建造，follow 是跟隨，文法雖都能放在 to 後面，但語意不合。",
    solutionSteps: ["句型 It is hard for＋人／物＋to V 表示「對……而言做某事很困難」。", "樹木在強風海灘上遇到困難的自然活動是生長。", "因此選 D grow；選項都能作不定詞原形，需靠語意判斷。"],
    teacherTip: "grow 可指生物生長，也可指逐漸增加；此處主詞是 trees，取「生長」義。",
    answerKeyReview: review(9, 2, "依海灘強風與 trees 的語意搭配核對 grow。"),
  },
  "OFF-0926": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C, is coming。Christmas is coming 是「聖誕節快到了」的現在進行式表未來／即將發生，符合說話者正在安排出國探親、詢問對方計畫的語境。",
    solutionSteps: ["由 Do you have any plans yet? 可知對話在談即將到來的節日安排。", "come 可用現在進行式表示已逐漸接近的未來事件，Christmas is coming＝聖誕節快到了。", "選 C；came／was coming 是過去，comes 多表習慣或固定時刻，不如現在進行式符合此處語氣。"],
    teacherTip: "現在進行式除了正在進行，也可表示近期已確定或正在接近的未來；Christmas is coming 是常見表達。",
    answerKeyReview: review(10, 3, "依問及未來計畫的語境核對現在進行式表即將到來的事件。"),
  },
};

for (const [id, patch] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 English Q1–10 against original question pages.");
