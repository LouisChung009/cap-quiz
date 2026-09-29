import { readFile, writeFile } from "node:fs/promises";
const path=new URL("../data/english.json",import.meta.url);
const bank=JSON.parse(await readFile(path,"utf8"));
const rows=[
  {
    "question": "Kevin _____ his homework before he turned on the computer to play a game.",
    "options": [
      "finishes",
      "had finished",
      "will finish",
      "is finishing"
    ],
    "answer": 1,
    "explanation": "正解是 had finished。Kevin 先完成作業，之後才打開電腦玩遊戲；較早發生的過去動作用過去完成式。finishes 是現在式，will finish 是未來式，is finishing 表示現在進行，均不符合過去事件的先後。",
    "solutionSteps": [
      "找出兩個過去動作：完成作業與打開電腦。",
      "判斷完成作業發生在打開電腦之前。",
      "選 had finished；其他選項的時態不符合過去事件順序。"
    ],
    "relatedWords": [
      "homework",
      "before",
      "complete"
    ],
    "commonMistake": "看到句子描述過去，就只用過去式，忽略兩個動作的先後。",
    "teacherTip": "遇到 before 或 after 時，先排出事件順序，再判斷是否需要過去完成式。",
    "unit": "文法：過去完成式",
    "knowledgePoint": "用過去完成式表示較早發生的過去動作",
    "difficulty": "中"
  },
  {
    "question": "While the students _____ for the bus, it suddenly began to rain.",
    "options": [
      "wait",
      "were waiting",
      "have waited",
      "will wait"
    ],
    "answer": 1,
    "explanation": "正解是 were waiting。學生正在等車時，突然開始下雨；持續中的過去動作用過去進行式，突發事件用過去簡單式。wait 是現在式，have waited 是現在完成式，will wait 是未來式。",
    "solutionSteps": [
      "辨認 began 是過去簡單式，描述突然發生的事件。",
      "判斷下雨之前，學生正在等車。",
      "選 were waiting，表示過去某時正在進行的動作。"
    ],
    "relatedWords": [
      "while",
      "suddenly",
      "rain"
    ],
    "commonMistake": "把兩個動詞都填成過去簡單式，沒有區分背景動作與突發事件。",
    "teacherTip": "while 常引出持續中的背景動作，可留意過去進行式。",
    "unit": "文法：過去進行式",
    "knowledgePoint": "過去進行中的動作與過去突發事件",
    "difficulty": "中"
  },
  {
    "question": "If you _____ the green button, the machine will start.",
    "options": [
      "press",
      "pressed",
      "will press",
      "are pressing"
    ],
    "answer": 0,
    "explanation": "正解是 press。這是表示可能發生結果的第一類條件句，if 子句用現在簡單式，主句用 will + 原形動詞。pressed 是過去式，will press 不用在這類條件句的 if 子句中，are pressing 也不符合一般規則。",
    "solutionSteps": [
      "找出 if 子句與主句：按按鈕，以及機器啟動。",
      "判斷這是可能發生的條件與未來結果。",
      "選 press；第一類條件句的 if 子句使用現在簡單式。"
    ],
    "relatedWords": [
      "button",
      "machine",
      "start"
    ],
    "commonMistake": "因主句有 will，就在 if 子句也使用 will。",
    "teacherTip": "第一類條件句常見結構是 If + 現在簡單式，主句 + will + 原形動詞。",
    "unit": "文法：第一類條件句",
    "knowledgePoint": "if 子句使用現在式表達未來可能條件",
    "difficulty": "中"
  },
  {
    "question": "If I _____ more free time, I would learn to play the guitar.",
    "options": [
      "have",
      "had",
      "will have",
      "am having"
    ],
    "answer": 1,
    "explanation": "正解是 had。這是假設目前沒有較多空閒時間的情況，屬於第二類條件句，if 子句使用過去式，主句使用 would + 原形動詞。have 是現在式，will have 不適用於 if 子句，am having 也不符合此假設句型。",
    "solutionSteps": [
      "注意主句的 would learn。",
      "判斷句子是假設目前不太可能或與現況相反的情況。",
      "選 had；第二類條件句的 if 子句使用過去式。"
    ],
    "relatedWords": [
      "free time",
      "assume",
      "guitar"
    ],
    "commonMistake": "把條件句的過去式誤認為表示過去時間。",
    "teacherTip": "第二類條件句的過去式常用來表示現在的假設，而非過去已發生的事。",
    "unit": "文法：第二類條件句",
    "knowledgePoint": "用過去式 if 子句表達現在的假設",
    "difficulty": "中"
  },
  {
    "question": "The old bridge is unsafe, so visitors are not allowed to _____ it.",
    "options": [
      "cross",
      "borrow",
      "collect",
      "invite"
    ],
    "answer": 0,
    "explanation": "正解是 cross，意為「穿越」。橋不安全，因此遊客不得通過。borrow 是借用，collect 是收集，invite 是邀請，都不符合橋梁與通行的語境。",
    "solutionSteps": [
      "從 old bridge 和 unsafe 判斷句子談的是通行安全。",
      "確認空格需要描述遊客對橋的動作。",
      "選 cross；其他動詞無法合理搭配橋梁。"
    ],
    "relatedWords": [
      "bridge",
      "pass",
      "unsafe"
    ],
    "commonMistake": "只依句型選動詞，忽略動詞與受詞的語意搭配。",
    "teacherTip": "利用名詞與上下文判斷動詞搭配，例如 cross a bridge。",
    "unit": "字彙：交通與安全",
    "knowledgePoint": "依上下文選擇合適動詞",
    "difficulty": "易"
  },
  {
    "question": "Please keep your voice down. The baby is _____ in the next room.",
    "options": [
      "sleeping",
      "shouting",
      "building",
      "waiting"
    ],
    "answer": 0,
    "explanation": "正解是 sleeping，意為「正在睡覺」。請降低音量的原因是隔壁房間的嬰兒正在睡覺。shouting 是大叫，building 是建造，waiting 是等待，均不符合需要保持安靜的情境。",
    "solutionSteps": [
      "讀取 Please keep your voice down，推知需要安靜。",
      "找出能解釋需要安靜的嬰兒狀態。",
      "選 sleeping；其他選項無法合理說明降低音量的原因。"
    ],
    "relatedWords": [
      "quiet",
      "asleep",
      "noise"
    ],
    "commonMistake": "把 sleeping 和 asleep 混淆；此處 be 動詞後可用現在分詞 sleeping。",
    "teacherTip": "遇到情境字彙題，先用前後句的因果線索縮小答案範圍。",
    "unit": "字彙：日常活動",
    "knowledgePoint": "依情境線索判斷動作字彙",
    "difficulty": "易"
  },
  {
    "question": "The school asked students to _____ the lights when they leave the classroom.",
    "options": [
      "turn off",
      "look after",
      "pick up",
      "put on"
    ],
    "answer": 0,
    "explanation": "正解是 turn off，意為「關掉」。離開教室時應關燈。look after 是照顧，pick up 是撿起或接人，put on 是穿上或打開設備，均不符合 lights 的語意搭配。",
    "solutionSteps": [
      "找出離開教室時需要完成的節能行動。",
      "確認 lights 需要被關閉。",
      "選 turn off；其餘片語與燈的動作不合。"
    ],
    "relatedWords": [
      "switch off",
      "light",
      "save energy"
    ],
    "commonMistake": "把 put on 當成所有電器的開關用語。",
    "teacherTip": "熟記常見片語動詞搭配，如 turn off the lights、pick up a book。",
    "unit": "字彙：片語動詞",
    "knowledgePoint": "辨識片語動詞與受詞的搭配",
    "difficulty": "易"
  },
  {
    "question": "The guide spoke _____ so that everyone in the back could hear her.",
    "options": [
      "clearly",
      "carelessly",
      "quietly",
      "recently"
    ],
    "answer": 0,
    "explanation": "正解是 clearly，意為「清楚地」。導覽員清楚說話，後排的人才聽得到。quietly 是安靜地，與讓後排聽見相反；carelessly 是粗心地，recently 是最近，不能自然修飾說話方式。",
    "solutionSteps": [
      "注意 so that everyone ... could hear her，這是目的與結果線索。",
      "推知導覽員需要清楚地說話。",
      "選 clearly；其他副詞語意不符合聽眾能聽清楚的目的。"
    ],
    "relatedWords": [
      "clearly",
      "loudly",
      "hear"
    ],
    "commonMistake": "只想到聲音大小，忽略 clearly 表示發音清楚，也能讓人聽懂。",
    "teacherTip": "副詞題先確認空格修飾的動詞，再用句子目的判斷方式。",
    "unit": "字彙：副詞",
    "knowledgePoint": "依語境選擇修飾動詞的副詞",
    "difficulty": "中"
  },
  {
    "question": "A: I have to return these books, but the library is closed.  B: _____ You can return them tomorrow morning.",
    "options": [
      "That's okay. The due date is next week.",
      "You must read them all tonight.",
      "Let's take them to the gym.",
      "I borrowed them from your brother."
    ],
    "answer": 0,
    "explanation": "正解是 That's okay. The due date is next week.，表示不必擔心，因為下週才到期。其餘選項要求今晚讀完、把書拿去體育館，或提到向別人借書，都無法自然回應圖書館已關門的問題。",
    "solutionSteps": [
      "確認 A 擔心無法歸還書籍。",
      "閱讀 B 後句，得知明早可歸還，因此前句應安慰 A 不必著急。",
      "選 That's okay. The due date is next week.，其餘選項無法解除擔憂。"
    ],
    "relatedWords": [
      "return",
      "due date",
      "closed"
    ],
    "commonMistake": "忽略後句 tomorrow morning，把問題誤判為需要立即處理。",
    "teacherTip": "先看空格前的困擾，再用空格後提供的解決方式確認語氣。",
    "unit": "對話：回應擔憂",
    "knowledgePoint": "結合前後句判斷適當的安慰與回應",
    "difficulty": "中"
  },
  {
    "question": "A: Would you mind opening the window? It's a little warm in here.  B: _____",
    "options": [
      "Not at all.",
      "Yes, I do it every day.",
      "No, the window is made of glass.",
      "I opened the book already."
    ],
    "answer": 0,
    "explanation": "正解是 Not at all.，在此表示「不介意」，也就是願意幫忙開窗。Yes, I do it every day 沒有直接回應請求；第三項只描述窗戶材質；第四項把 window 誤解成書的 window，語意不通。",
    "solutionSteps": [
      "辨認 Would you mind ...? 是有禮貌的請求。",
      "判斷 B 若願意幫忙，可用 Not at all. 回答。",
      "選 Not at all.；其他選項未恰當回應請求。"
    ],
    "relatedWords": [
      "mind",
      "request",
      "open"
    ],
    "commonMistake": "把 Would you mind ...? 的肯定回答誤當成 Yes 就是願意。",
    "teacherTip": "回答 Would you mind ...? 時，Not at all 通常表示不介意、願意配合。",
    "unit": "對話：有禮貌的請求",
    "knowledgePoint": "理解 Would you mind ...? 的答句語意",
    "difficulty": "中"
  },
  {
    "question": "A: I can't decide which photo to use for the class poster.  B: _____ The one with the blue sky is easier to see.  A: You're right.",
    "options": [
      "Why don't you choose this one?",
      "How did you take the bus?",
      "Would you like some soup?",
      "When does the store close?"
    ],
    "answer": 0,
    "explanation": "正解是 Why don't you choose this one?，是在對方難以選擇照片時提出建議，後句也說明推薦藍天照片的理由。其他選項分別問搭車、提供食物及詢問商店時間，與照片選擇無關。",
    "solutionSteps": [
      "確認 A 正在挑選海報照片。",
      "讀取後句對某張照片的評價，推知 B 正在提出選擇建議。",
      "選 Why don't you choose this one?，其他選項與照片話題無關。"
    ],
    "relatedWords": [
      "choose",
      "suggest",
      "photo"
    ],
    "commonMistake": "只看 A 的疑問句，沒有利用 B 後句對藍天照片的評價。",
    "teacherTip": "建議句常以 Why don't you ...? 或 You could ... 開頭。",
    "unit": "對話：提出建議",
    "knowledgePoint": "辨識並理解建議句型",
    "difficulty": "易"
  },
  {
    "question": "A: I'm sorry I stepped on your foot.  B: _____ It was an accident.",
    "options": [
      "That's all right.",
      "Here you are.",
      "Good luck.",
      "Same to you."
    ],
    "answer": 0,
    "explanation": "正解是 That's all right.，用來回應道歉，表示沒關係。Here you are 用於遞交物品，Good luck 用於祝福，Same to you 用於回應相同的祝福或問候，都不適合此處。",
    "solutionSteps": [
      "辨認 A 正在為踩到對方的腳道歉。",
      "判斷 B 應接受道歉或表示不介意。",
      "選 That's all right.；其他片語各有不同語用情境。"
    ],
    "relatedWords": [
      "apologize",
      "accident",
      "forgive"
    ],
    "commonMistake": "把 That's all right 和回答 thank you 的 You're welcome 混用。",
    "teacherTip": "熟悉道歉、感謝與祝福的常見回應，注意其使用情境。",
    "unit": "對話：回應道歉",
    "knowledgePoint": "辨識日常對話中的道歉回應",
    "difficulty": "易"
  },
  {
    "question": "NOTICE: The school nurse will give free eye checks in Room 204 on Tuesday. Students who want a check should sign up with their homeroom teacher by Monday. Each check takes about five minutes.  What should an interested student do?",
    "options": [
      "Sign up with the homeroom teacher by Monday.",
      "Go to Room 204 on Monday for the check.",
      "Pay the nurse before Tuesday.",
      "Bring a parent to school on Tuesday."
    ],
    "answer": 0,
    "explanation": "正解是 Sign up with the homeroom teacher by Monday.，公告要求有意願的學生在星期一前向導師登記。檢查安排在星期二，不是星期一；公告說免費，且沒有要求家長陪同。",
    "solutionSteps": [
      "找出有意參加者的指示：sign up with their homeroom teacher。",
      "確認期限是 by Monday，檢查地點和日期則是星期二的 204 教室。",
      "選第一項；其他選項誤讀日期或加入未公告的要求。"
    ],
    "relatedWords": [
      "eye check",
      "sign up",
      "nurse"
    ],
    "commonMistake": "把活動舉行日期和報名截止日期混為一談。",
    "teacherTip": "公告中的日期要分別標出活動日、報名期限與地點。",
    "unit": "公告：校園健康服務",
    "knowledgePoint": "區分公告中的活動日期、地點與登記期限",
    "difficulty": "中"
  },
  {
    "question": "NOTICE: The school will hold a used-book exchange in the cafeteria this Thursday. Bring books in good condition before 12:00 noon. For each book you bring, you may take one different book home.  What is the exchange rule?",
    "options": [
      "Students may take one book for each book they bring.",
      "Students may take as many books as they want.",
      "Only new books can be exchanged.",
      "Books must be brought after noon."
    ],
    "answer": 0,
    "explanation": "正解是 Students may take one book for each book they bring.，公告說每帶一本書，就可以帶一本不同的書回家。沒有數量不限的規定；公告要求書況良好，而不是全新；帶書期限是中午十二點前，不是之後。",
    "solutionSteps": [
      "定位 For each book you bring 這項規則。",
      "理解每帶一本書，可換取一本不同的書。",
      "選第一項；其他選項與數量、書況或時間規定相反。"
    ],
    "relatedWords": [
      "exchange",
      "condition",
      "cafeteria"
    ],
    "commonMistake": "忽略 for each 所表達的一對一對應關係。",
    "teacherTip": "讀規則時注意 each、per、only 等限定詞，它們常決定答案。",
    "unit": "公告：二手書交換",
    "knowledgePoint": "理解公告中的交換規則與限制",
    "difficulty": "中"
  },
  {
    "question": "NOTICE: The school photo will be taken on Wednesday morning. Students should wear their regular school uniform. If it rains, the photo will be taken in the gym instead of the courtyard.  Where will students take the photo if it rains?",
    "options": [
      "In the gym",
      "In the courtyard",
      "In the library",
      "In the classroom"
    ],
    "answer": 0,
    "explanation": "正解是 In the gym。公告清楚說明如果下雨，照片會改在體育館拍。庭院是晴天時原定的地點；圖書館與教室均未提及。",
    "solutionSteps": [
      "找出公告中的條件句 If it rains。",
      "閱讀條件發生時的替代地點 in the gym。",
      "選 In the gym；其他地點不符合下雨時的安排。"
    ],
    "relatedWords": [
      "courtyard",
      "rain",
      "instead"
    ],
    "commonMistake": "只記住原定的庭院地點，沒有注意 if 後的替代安排。",
    "teacherTip": "公告若同時列出原計畫與備案，注意 if、instead 等條件和轉換線索。",
    "unit": "公告：校園活動安排",
    "knowledgePoint": "讀取公告中的條件與替代地點",
    "difficulty": "易"
  },
  {
    "question": "NOTICE: The school cooking club will meet in the home economics room after school on Thursday. Members should bring an apron. The club will provide all ingredients, and students will make vegetable soup.  What should a club member bring?",
    "options": [
      "An apron",
      "Vegetables",
      "A cooking pot",
      "A recipe book"
    ],
    "answer": 0,
    "explanation": "正解是 An apron。公告要求社員自備圍裙，並說材料由社團提供。公告未要求自帶蔬菜、鍋子或食譜。",
    "solutionSteps": [
      "找到公告中的 Members should bring。",
      "確認應帶物品是 an apron。",
      "選 An apron；材料由社團提供，其他物品沒有要求。"
    ],
    "relatedWords": [
      "apron",
      "ingredient",
      "provide"
    ],
    "commonMistake": "因為活動是烹飪，就自行推測需要帶食材或廚具。",
    "teacherTip": "區分 should bring 和 will provide，確認物品由誰準備。",
    "unit": "公告：社團活動",
    "knowledgePoint": "擷取公告中的自備物品與主辦方提供物",
    "difficulty": "易"
  },
  {
    "question": "NOTICE: The school art room will be unavailable from March 3 to March 7 because new tables are being installed. Art club meetings will take place in Room 105 during that week.  Where will the art club meet from March 3 to March 7?",
    "options": [
      "In Room 105",
      "In the art room",
      "In the cafeteria",
      "In the school office"
    ],
    "answer": 0,
    "explanation": "正解是 In Room 105。公告表示美術教室暫停使用期間，社團改在 105 教室開會。美術教室在該週不能使用，其他地點也未提到。",
    "solutionSteps": [
      "確認美術教室在 March 3 to March 7 暫停使用。",
      "找出這段期間社團的替代地點 Room 105。",
      "選 In Room 105；其他選項與公告不符。"
    ],
    "relatedWords": [
      "unavailable",
      "install",
      "during"
    ],
    "commonMistake": "看到 art club 就直接選 art room，忽略公告中的暫停使用資訊。",
    "teacherTip": "注意 unavailable、closed、instead 等字詞，它們常標示地點或安排變更。",
    "unit": "公告：教室使用通知",
    "knowledgePoint": "根據公告辨認臨時變更的活動地點",
    "difficulty": "中"
  },
  {
    "question": "At the start of the school year, Eli was nervous about taking the train alone. His aunt showed him how to read the station map and check the platform number. After practicing the route with her twice, he traveled to his music lesson by himself. What helped Eli travel alone?",
    "options": [
      "Learning to read the station map and platform number",
      "Buying a new musical instrument",
      "Taking a different bus every day",
      "Moving closer to the train station"
    ],
    "answer": 0,
    "explanation": "正解是 Learning to read the station map and platform number。文章指出阿姨教 Eli 看站內地圖和月台號碼，他也練習路線兩次，之後便能獨自搭車。其餘選項沒有在文章中提到。",
    "solutionSteps": [
      "找出 Eli 原本的困難：不敢獨自搭火車。",
      "確認阿姨教他的資訊及兩次路線練習。",
      "選 Learning to read the station map and platform number；其他選項沒有文本根據。"
    ],
    "relatedWords": [
      "station map",
      "platform",
      "practice"
    ],
    "commonMistake": "把音樂課當成他能獨自搭車的原因，忽略學習和練習的線索。",
    "teacherTip": "原因題要追蹤人物從困難到成功之間做了什麼。",
    "unit": "短篇閱讀：交通與獨立",
    "knowledgePoint": "根據文章內容找出能力提升的原因",
    "difficulty": "中"
  },
  {
    "question": "Every Wednesday, Mr. Wu leaves a basket of clean towels beside the school gym. Students can use one during sports practice and put it in a separate bag afterward. The towels are washed and returned to the basket each week. Why does Mr. Wu leave towels by the gym?",
    "options": [
      "So students can use a clean towel during practice",
      "So students can take the towels home permanently",
      "So the gym can be closed on Wednesdays",
      "So students can avoid sports practice"
    ],
    "answer": 0,
    "explanation": "正解是 So students can use a clean towel during practice。文章說學生運動時可使用毛巾，之後放入指定袋子清洗。毛巾會每週洗好歸還，並非讓學生永久帶回；文章也沒有說要關閉體育館或取消練習。",
    "solutionSteps": [
      "閱讀學生使用毛巾的句子，確認使用情境是 sports practice。",
      "再看毛巾之後會被清洗並放回，判斷它是供學生使用的公用物品。",
      "選第一項；其餘選項與毛巾的使用和回收方式不符。"
    ],
    "relatedWords": [
      "towel",
      "basket",
      "practice"
    ],
    "commonMistake": "把 use one 誤解成可以把毛巾帶回家。",
    "teacherTip": "閱讀物品使用規則時，留意 afterward、returned 等字詞所描述的後續流程。",
    "unit": "短篇閱讀：校園生活",
    "knowledgePoint": "根據細節判斷物品的設置目的",
    "difficulty": "易"
  },
  {
    "question": "Rita wanted to save money for a bicycle. She wrote down every snack she bought for a month and noticed that she spent a lot on drinks after school. She began bringing water from home and put the money she saved in a jar. What did Rita change to save money?",
    "options": [
      "She brought water from home.",
      "She stopped going to school.",
      "She bought a more expensive snack.",
      "She sold her old bicycle."
    ],
    "answer": 0,
    "explanation": "正解是 She brought water from home. Rita 發現放學後買飲料花費很多，於是開始自備水並把省下的錢存起來。文章沒有說她不去上學、改買更貴的點心或賣掉腳踏車。",
    "solutionSteps": [
      "找出 Rita 花費較多的項目：放學後買飲料。",
      "確認她採取的改變是從家裡帶水。",
      "選 She brought water from home.，其他選項沒有文章依據。"
    ],
    "relatedWords": [
      "save",
      "spend",
      "bring"
    ],
    "commonMistake": "把她想買自行車的目標當成已經完成的事情。",
    "teacherTip": "區分人物的目標、發現和實際採取的行動。",
    "unit": "短篇閱讀：金錢管理",
    "knowledgePoint": "擷取人物為達成目標所做的改變",
    "difficulty": "易"
  },
  {
    "question": "A group of students noticed that the playground had very little shade at noon. They asked the principal if they could plant small trees near the benches. The school agreed, and the students now water the trees every Friday. What problem were the students trying to solve?",
    "options": [
      "There was not enough shade near the playground at noon.",
      "The benches were too far from the school.",
      "The trees were growing too quickly.",
      "Students had no place to buy lunch."
    ],
    "answer": 0,
    "explanation": "正解是 There was not enough shade near the playground at noon. 短文一開始指出遊樂場中午時幾乎沒有遮蔭，學生因此提議在長椅附近種樹。其他選項並非文章提到的問題。",
    "solutionSteps": [
      "讀取學生注意到的狀況：playground had very little shade at noon。",
      "理解種樹提議是為了解決這個問題。",
      "選第一項；其他選項與提議的原因無關。"
    ],
    "relatedWords": [
      "shade",
      "playground",
      "plant"
    ],
    "commonMistake": "把學生採取的行動誤當成他們原本面臨的問題。",
    "teacherTip": "問題解決類閱讀題可分開標記 problem、plan 和 action。",
    "unit": "短篇閱讀：校園環境",
    "knowledgePoint": "辨認文章中的問題與解決方案",
    "difficulty": "中"
  },
  {
    "question": "When Mei moved to a new neighborhood, she did not know anyone nearby. She began walking her dog at the same park each evening. After a few days, she met another student who also walked a dog there. They started walking together and soon became friends. How did Mei meet the other student?",
    "options": [
      "They often walked their dogs at the same park.",
      "They were classmates in the same music class.",
      "They met while buying food after school.",
      "Their parents introduced them at a party."
    ],
    "answer": 0,
    "explanation": "正解是 They often walked their dogs at the same park. 文章說 Mei 每晚在同一個公園遛狗，遇見另一位也在那裡遛狗的學生。其他相遇方式沒有在文章中提及。",
    "solutionSteps": [
      "確認 Mei 在新社區原本不認識附近的人。",
      "找出她遇見新朋友的地點與共同活動：同一公園遛狗。",
      "選第一項；其他選項均為文本未提及的相遇情境。"
    ],
    "relatedWords": [
      "neighborhood",
      "park",
      "meet"
    ],
    "commonMistake": "只記得兩人後來成為朋友，沒有回到文章找初次相遇的方式。",
    "teacherTip": "細節題可依題目中的人物或動詞回到文章定位相關句子。",
    "unit": "短篇閱讀：社區與交友",
    "knowledgePoint": "擷取人物相遇的地點與共同活動",
    "difficulty": "易"
  },
  {
    "question": "The science club tested three kinds of paper airplanes. They used the same paper and threw each plane from the same line. The club members measured how far each plane flew and repeated each test three times. Why did they repeat each test?",
    "options": [
      "To make their results more reliable",
      "To change the paper each time",
      "To make the planes look different",
      "To finish the experiment without measuring"
    ],
    "answer": 0,
    "explanation": "正解是 To make their results more reliable. 重複測試可減少單次結果偶然造成的影響，讓比較更可靠。文章說他們使用同樣的紙並測量距離，並非每次換紙、改變外觀或不測量。",
    "solutionSteps": [
      "整理實驗控制方式：同種紙、同一起點、測量飛行距離。",
      "判斷重複測試的作用是確認結果是否穩定。",
      "選 To make their results more reliable；其他選項與實驗流程不符。"
    ],
    "relatedWords": [
      "test",
      "measure",
      "reliable"
    ],
    "commonMistake": "把重複測試誤認為要改變實驗條件。",
    "teacherTip": "科學短文常考實驗步驟的目的，注意相同條件與重複測量。",
    "unit": "短篇閱讀：科學實驗",
    "knowledgePoint": "推論重複測試對實驗結果的作用",
    "difficulty": "中"
  },
  {
    "question": "A small bookstore started a weekend reading hour for children. A volunteer reads a short story aloud, and children can draw a picture of their favorite part afterward. The event is free, but families should register online because space is limited. Which statement is true?",
    "options": [
      "Families should register online before attending.",
      "Children must buy a book at the event.",
      "The reading hour is held every weekday.",
      "Only adults may join the activity."
    ],
    "answer": 0,
    "explanation": "正解是 Families should register online before attending. 短文說活動免費，但因名額有限，家庭應先在線上登記。文章沒有要求買書，活動在週末舉辦，也明確是為兒童設計。",
    "solutionSteps": [
      "找出活動的時間、對象與參加方式。",
      "注意 because space is limited，確認需要 online register。",
      "選第一項；其餘選項與活動資訊相反或未提及。"
    ],
    "relatedWords": [
      "volunteer",
      "register",
      "limited"
    ],
    "commonMistake": "因活動免費，就推斷不需要事先登記。",
    "teacherTip": "免費與是否需要預約是不同資訊，閱讀時分開確認。",
    "unit": "短篇閱讀：社區活動",
    "knowledgePoint": "判斷短文中的正確敘述與參加規定",
    "difficulty": "中"
  },
  {
    "question": "Lena _____ her science project yet, so she is working on it now.",
    "options": ["doesn't finish", "hasn't finished", "didn't finish", "won't finish"],
    "answer": 1,
    "explanation": "正解是 hasn't finished。yet 常與現在完成式搭配，表示到目前為止尚未完成；後句 she is working on it now 也說明工作仍在進行。doesn't finish 是現在簡單式，didn't finish 指過去，won't finish 表示未來，都不符合目前尚未完成的語意。",
    "solutionSteps": ["注意 yet 及後句現在仍在做專題的線索。", "判斷完成與否連結過去到現在，且結果是目前尚未完成。", "選 hasn't finished，使用現在完成式的否定形式。"],
    "relatedWords": ["yet", "complete", "project"],
    "commonMistake": "看到工作尚未完成就選未來式，忽略 yet 常提示現在完成式。",
    "teacherTip": "現在完成式否定句為 have/has not + 過去分詞，常搭配 yet。",
    "unit": "文法：現在完成式",
    "knowledgePoint": "現在完成式否定句與 yet",
    "difficulty": "中"
  }
];
const norm=s=>s.replace(/\\s+/g," ").trim().toLowerCase();
const keys=new Set(bank.filter(x=>!(Number(x.id.slice(4))>=258&&Number(x.id.slice(4))<=282)).map(x=>norm(x.question+"|"+x.options.join("|"))));
if(rows.length!==25)throw new Error("Expected 25 items");
for(let i=0;i<25;i++){const item=rows[i],id="ENG-"+String(i+258).padStart(4,"0"),row=bank.find(x=>x.id===id);if(!row||item.options.length!==4||new Set(item.options.map(x=>x.toLowerCase())).size!==4||item.answer<0||item.answer>3||item.solutionSteps.length!==3||item.relatedWords.length<2)throw new Error("Invalid "+id);const key=norm(item.question+"|"+item.options.join("|"));if(keys.has(key))throw new Error("Duplicate "+id);keys.add(key);if(!item.explanation.toLowerCase().includes(item.options[item.answer].toLowerCase()))throw new Error("Answer missing "+id);Object.assign(row,{gradeSemester:"九年級",unit:item.unit,knowledgePoint:item.knowledgePoint,difficulty:item.difficulty,type:item.question.startsWith("NOTICE:")?"公告閱讀選擇":item.question.startsWith("A:")?"對話選擇":item.question.startsWith("短文")?"短文閱讀選擇":"單題選擇",question:item.question,options:item.options,answer:item.answer,explanation:item.explanation,solutionSteps:item.solutionSteps,relatedWords:item.relatedWords,commonMistake:item.commonMistake,teacherTip:item.teacherTip,sourceType:"原創會考程度練習"});}
await writeFile(path,JSON.stringify(bank,null,2)+"\n","utf8");
console.log("Rebuilt ENG-0258–0282 with 25 teacher-reviewed items.");
