import { readFile, writeFile } from "node:fs/promises";
const path = new URL("../data/english.json", import.meta.url);
const bank = JSON.parse(await readFile(path, "utf8"));
const rows = [
  {
    "question": "By the time the guests arrived, Maya _____ the living room and set the table.",
    "options": [
      "has cleaned",
      "had cleaned",
      "was cleaning",
      "will clean"
    ],
    "answer": 1,
    "explanation": "正解是 had cleaned。客人到達前，Maya 已完成打掃，表示「過去的過去」，使用過去完成式。has cleaned 是現在完成式，時態不合；was cleaning 表示當時正在打掃，與 set the table 的完成動作不搭；will clean 是未來式。",
    "solutionSteps": [
      "找出兩個過去事件：客人到達與打掃完成。",
      "判斷打掃發生在客人到達之前。",
      "選擇表示較早過去事件的過去完成式 had cleaned。"
    ],
    "relatedWords": [
      "arrive",
      "finish",
      "before"
    ],
    "commonMistake": "看到過去時間就只用過去簡單式，忽略兩個過去事件的先後。",
    "teacherTip": "句中若有一個過去事件發生在另一個之前，可用 had + 過去分詞標示較早發生者。",
    "unit": "文法：過去完成式",
    "knowledgePoint": "過去完成式表示在另一個過去事件之前已完成的動作",
    "difficulty": "中"
  },
  {
    "question": "The heavy rain _____ our outdoor concert, so we moved it into the gym.",
    "options": [
      "canceled",
      "borrowed",
      "invited",
      "repaired"
    ],
    "answer": 0,
    "explanation": "正解是 canceled，意為「取消」。大雨使戶外音樂會取消，因此改到體育館。borrowed 是借用，invited 是邀請，repaired 是修理，語意都不符合。",
    "solutionSteps": [
      "讀後半句，確認活動因大雨改到室內。",
      "推測前半句需要表示活動被取消或更改的動詞。",
      "選 canceled，其他選項無法合理描述大雨對音樂會的影響。"
    ],
    "relatedWords": [
      "call off",
      "postpone",
      "event"
    ],
    "commonMistake": "把 canceled 和 postponed 都當成完全相同；前者是取消，後者是延後。",
    "teacherTip": "利用句中的 so 判斷因果關係，再確認動詞是否符合事件情境。",
    "unit": "字彙：活動與天氣",
    "knowledgePoint": "根據上下文判斷動詞語意",
    "difficulty": "易"
  },
  {
    "question": "The little boy was too _____ to reach the top shelf, so his sister helped him.",
    "options": [
      "tall",
      "short",
      "wide",
      "heavy"
    ],
    "answer": 1,
    "explanation": "正解是 short，意為「矮的」。男孩搆不到高處的架子，原因是身高不夠。tall 是高的，與情境相反；wide 是寬的，heavy 是重的，都無法說明搆不到架子的原因。",
    "solutionSteps": [
      "找出關鍵線索 reach the top shelf。",
      "判斷男孩需要的是身高方面的描述。",
      "選 short；其餘形容詞與搆不到高架的原因無關或相反。"
    ],
    "relatedWords": [
      "height",
      "reach",
      "high"
    ],
    "commonMistake": "忽略 too ... to ... 表示「太……以致不能……」的句型。",
    "teacherTip": "讀到 too 後，連同後面的 to 不定詞一起判斷原因與結果。",
    "unit": "字彙：身高與形容詞",
    "knowledgePoint": "依情境選擇適當形容詞",
    "difficulty": "易"
  },
  {
    "question": "A: You look worried. What happened?  B: I can't find my bus card.  A: _____  B: Thanks. I'll check my desk again.",
    "options": [
      "Would you like me to help you look for it?",
      "How long does the bus ride take?",
      "Why don't you buy a new desk?",
      "Did you enjoy the school trip?"
    ],
    "answer": 0,
    "explanation": "正解是 Would you like me to help you look for it?，是在對方找不到車卡時主動提出幫忙。其餘選項分別詢問車程、建議買新桌子、詢問校外教學，和當前情境不連貫。",
    "solutionSteps": [
      "確認 B 的問題是找不到公車卡。",
      "判斷 A 接下來最自然的回應是提供協助。",
      "選擇 Would you like me to help you look for it?，其他選項未回應 B 的困擾。"
    ],
    "relatedWords": [
      "offer",
      "help",
      "look for"
    ],
    "commonMistake": "只看選項中的個別單字，沒有確認對話前後是否連貫。",
    "teacherTip": "對話題先辨認說話者的需求，再選能回應需求或延續話題的句子。",
    "unit": "對話：提供協助",
    "knowledgePoint": "依對話情境選擇合宜回應",
    "difficulty": "易"
  },
  {
    "question": "A: I heard you joined the school band. _____  B: I play the drums. We practice every Wednesday.",
    "options": [
      "What instrument do you play?",
      "Where did you buy the drums?",
      "How much is the band room?",
      "Why did the concert end early?"
    ],
    "answer": 0,
    "explanation": "正解是 What instrument do you play?，因為 B 回答自己演奏鼓。Where did you buy the drums? 問購買地點；How much is the band room? 問價格且語意不合理；Why did the concert end early? 與回答的樂器種類無關。",
    "solutionSteps": [
      "閱讀 B 的回答，找出他提供的資訊是演奏樂器。",
      "推測 A 的問句應詢問樂器種類。",
      "選 What instrument do you play?，其餘選項詢問其他資訊。"
    ],
    "relatedWords": [
      "instrument",
      "drum",
      "band"
    ],
    "commonMistake": "看到 drums 就選購買或價格相關的問句，忽略對話的問答對應。",
    "teacherTip": "先用 B 的回答反推最可能的疑問詞與問句內容。",
    "unit": "對話：詢問興趣與技能",
    "knowledgePoint": "問句與回答的語意配對",
    "difficulty": "易"
  },
  {
    "question": "A: This box is really heavy.  B: _____  A: Yes, please. The books are for the library.",
    "options": [
      "Shall I carry it for you?",
      "Did you read all the books?",
      "Can you close the library?",
      "How often do you buy boxes?"
    ],
    "answer": 0,
    "explanation": "正解是 Shall I carry it for you?，是在對方提到箱子很重時提出幫忙搬運。其餘選項問讀書、關閉圖書館或買箱子的頻率，無法自然引出 Yes, please。",
    "solutionSteps": [
      "從 A 的話判斷他遇到搬重物的困難。",
      "觀察 A 接著以 Yes, please 接受幫助。",
      "選 Shall I carry it for you?，其他選項不是可接受的搬運協助。"
    ],
    "relatedWords": [
      "carry",
      "heavy",
      "offer"
    ],
    "commonMistake": "沒有注意 Yes, please 通常是在接受邀請或提議。",
    "teacherTip": "對話中的接受語常能直接提示前一句是提議、邀請或請求。",
    "unit": "對話：提出提議",
    "knowledgePoint": "Shall I ...? 表示主動提議",
    "difficulty": "易"
  },
  {
    "question": "A: I forgot to bring my lunch today.  B: _____  A: That's very kind of you. I'll pay you back tomorrow.",
    "options": [
      "You can share mine if you like.",
      "You should leave school early.",
      "I don't know how to cook.",
      "The lunch room closes at noon."
    ],
    "answer": 0,
    "explanation": "正解是 You can share mine if you like.，表示願意和對方分享午餐，符合 A 忘記帶午餐及其感謝的回應。其他選項雖然談到學校或午餐，卻無法合理引出「你人真好，我明天還你錢」。",
    "solutionSteps": [
      "找出 A 遇到的問題：今天沒有帶午餐。",
      "利用 A 的感謝與明天還錢推斷 B 曾提供食物或金錢協助。",
      "選 You can share mine if you like.，其他選項與接受午餐幫助不符。"
    ],
    "relatedWords": [
      "share",
      "lunch",
      "kind"
    ],
    "commonMistake": "只依單字 lunch 判斷，沒有利用下一句的感謝和還錢線索。",
    "teacherTip": "閱讀對話時也要看空格後的回應，常能提供關鍵語意線索。",
    "unit": "對話：分享與感謝",
    "knowledgePoint": "由上下文推論對話中省略的提議",
    "difficulty": "中"
  },
  {
    "question": "A: I didn't do well on the science test.  B: _____ You can ask Ms. Lin to explain the parts you missed.  A: That's a good idea.",
    "options": [
      "Don't give up.",
      "Take your time.",
      "Help yourself.",
      "Never mind."
    ],
    "answer": 0,
    "explanation": "正解是 Don't give up.，意為「不要放棄」，並能自然接續請老師解釋錯題的建議。Take your time 是慢慢來；Help yourself 是請自便；Never mind 是別介意，這些都不如 Don't give up. 符合考試失利後的鼓勵情境。",
    "solutionSteps": [
      "確認 A 因考試表現不理想而沮喪。",
      "閱讀 B 接下來提出的補救方法，判斷前句需要鼓勵語。",
      "選 Don't give up.，其餘片語的語用情境不合。"
    ],
    "relatedWords": [
      "encourage",
      "try again",
      "improve"
    ],
    "commonMistake": "把 Never mind 當成所有情境都適用的安慰語。",
    "teacherTip": "固定用語要根據說話目的理解，例如鼓勵、道歉、接受或請求。",
    "unit": "對話：鼓勵與建議",
    "knowledgePoint": "辨識常見口語片語的語用功能",
    "difficulty": "中"
  },
  {
    "question": "A: The new student seems a little lonely.  B: _____ We can invite him to sit with us at lunch.  A: Good idea.",
    "options": [
      "Let's make him feel welcome.",
      "Let's keep the classroom empty.",
      "Let's ask him to go home.",
      "Let's make lunch much later."
    ],
    "answer": 0,
    "explanation": "正解是 Let's make him feel welcome.，表示讓新同學感到受歡迎，與邀請他一起吃午餐相呼應。其餘選項可能使他更孤立，或與接納新同學無關。",
    "solutionSteps": [
      "判斷新同學的處境：他看起來孤單。",
      "利用後句邀請他共進午餐，推知 B 想讓他融入。",
      "選 Let's make him feel welcome.，其他選項與友善接納的目的不符。"
    ],
    "relatedWords": [
      "welcome",
      "include",
      "lonely"
    ],
    "commonMistake": "忽略後句的邀請行動，選到只提及地點或時間的選項。",
    "teacherTip": "先找出對話中的共同目的，再確認選項是否能概括後續行動。",
    "unit": "對話：人際互動",
    "knowledgePoint": "依前後文選擇符合情境的建議",
    "difficulty": "中"
  },
  {
    "question": "Notice: The school library will be closed on Friday afternoon for cleaning. Please return all borrowed books by Thursday. Students may use the reading room on the second floor.  What should students do before Friday?",
    "options": [
      "Return their borrowed books.",
      "Clean the school library.",
      "Move the reading room downstairs.",
      "Borrow more books on Friday afternoon."
    ],
    "answer": 0,
    "explanation": "正解是 Return their borrowed books.，公告明確要求學生在星期四前歸還借閱的書。打掃圖書館是公告說明的閉館原因，並非要求學生做的事；閱覽室在二樓而非要搬動；星期五下午圖書館關閉，不能在該時段借書。",
    "solutionSteps": [
      "閱讀公告中的 Please return all borrowed books by Thursday。",
      "將 by Thursday 理解為星期四前完成。",
      "選 Return their borrowed books.，其他選項與公告內容相反或未提及。"
    ],
    "relatedWords": [
      "notice",
      "return",
      "borrow"
    ],
    "commonMistake": "把公告中的閉館原因誤認成學生必須完成的任務。",
    "teacherTip": "公告閱讀題可先圈出 should、please、must、by 等行動與期限線索。",
    "unit": "公告：圖書館通知",
    "knowledgePoint": "擷取公告中的行動要求與時間資訊",
    "difficulty": "易"
  },
  {
    "question": "NOTICE: The school garden needs volunteers this Saturday. Meet at the front gate at 8:30 a.m. Please bring a hat and a reusable water bottle. Gloves will be provided.  Which item do volunteers need to bring?",
    "options": [
      "A hat",
      "A pair of gloves",
      "A garden shovel",
      "A school uniform"
    ],
    "answer": 0,
    "explanation": "正解是 A hat，公告明確請志工自備帽子與可重複使用的水瓶。手套由校方提供，因此不能選 gloves；公告未要求帶鏟子或穿制服。",
    "solutionSteps": [
      "找出公告中的 Please bring。",
      "確認志工需要自備 hat 和 reusable water bottle。",
      "選 A hat；手套由校方提供，另外兩項沒有提到。"
    ],
    "relatedWords": [
      "volunteer",
      "bring",
      "provide"
    ],
    "commonMistake": "看到園藝活動就自行推測要帶工具，沒有依公告文字作答。",
    "teacherTip": "公告題應以文本明示資訊為準，不要用生活常識補入未提到的規定。",
    "unit": "公告：志工活動",
    "knowledgePoint": "辨識公告中的必備物品與提供物品",
    "difficulty": "易"
  },
  {
    "question": "NOTICE: The art club's photo display opens in the main hall on Monday. Visitors may vote for their favorite photo until Wednesday. The winning student will receive a book voucher.  When can visitors vote?",
    "options": [
      "Only on Monday",
      "From Monday through Wednesday",
      "Only after the winner is announced",
      "Every day for one month"
    ],
    "answer": 1,
    "explanation": "正解是 From Monday through Wednesday。公告表示投票可持續到星期三，展覽星期一開始，因此投票期間為星期一至星期三。其他選項把期間縮成一天、延到公布之後或擴大成一個月，都沒有文本根據。",
    "solutionSteps": [
      "找出投票期限 until Wednesday。",
      "連同展覽 Monday opens 的資訊確認投票從展覽開放時開始。",
      "選 From Monday through Wednesday，其他選項皆錯解投票期間。"
    ],
    "relatedWords": [
      "display",
      "vote",
      "until"
    ],
    "commonMistake": "將 until Wednesday 誤解成星期三之後才開始。",
    "teacherTip": "時間題注意 from、until、by 等介系詞對起訖時間的影響。",
    "unit": "公告：校園展覽",
    "knowledgePoint": "理解活動公告中的時間範圍",
    "difficulty": "中"
  },
  {
    "question": "NOTICE: The school bus to the sports center leaves at 9:10 a.m. Students should arrive at the bus stop ten minutes early. The bus will not wait for late students.  What time should students arrive?",
    "options": [
      "8:50 a.m.",
      "9:00 a.m.",
      "9:10 a.m.",
      "9:20 a.m."
    ],
    "answer": 1,
    "explanation": "正解是 9:00 a.m.。公車 9:10 出發，學生應提早十分鐘到達，所以 9:10 減去十分鐘是 9:00。其他時間不是提早十分鐘到達。",
    "solutionSteps": [
      "確認公車出發時間為 9:10 a.m.。",
      "依公告提早 ten minutes 到站。",
      "計算得 9:00 a.m.，其餘選項分別太早、準時或太晚。"
    ],
    "relatedWords": [
      "leave",
      "arrive",
      "early"
    ],
    "commonMistake": "把提早十分鐘看成晚十分鐘，選到 9:20。",
    "teacherTip": "時間計算題先確定是往前還是往後，再計算分鐘差。",
    "unit": "公告：校車資訊",
    "knowledgePoint": "從公告擷取並計算出發前的抵達時間",
    "difficulty": "易"
  },
  {
    "question": "NOTICE: The computer room is open to students from 3:30 to 5:00 p.m. on weekdays. Students must sign in and may use a computer for up to 30 minutes if others are waiting.  What must a student do before using a computer?",
    "options": [
      "Sign in",
      "Pay a fee",
      "Bring a laptop",
      "Ask a classmate to wait"
    ],
    "answer": 0,
    "explanation": "正解是 Sign in，公告明確要求學生使用前登記。公告沒有提到費用或自備筆電；若有人等待，每位學生最多使用三十分鐘，並未要求同學等待。",
    "solutionSteps": [
      "定位 must 一字後的規定。",
      "讀出學生使用電腦前必須 sign in。",
      "選 Sign in，其他選項都不是公告要求。"
    ],
    "relatedWords": [
      "sign in",
      "available",
      "weekday"
    ],
    "commonMistake": "把公告中有條件才適用的使用時間限制當成每個人使用前的動作。",
    "teacherTip": "留意 must、may、if 等字詞，區分必要規定、允許事項與條件。",
    "unit": "公告：電腦教室規定",
    "knowledgePoint": "辨識公告中的義務與條件",
    "difficulty": "中"
  },
  {
    "question": "NOTICE: The school swimming pool will open late this Saturday because the water is being tested. It will open at 11:00 a.m. instead of 9:00 a.m.  Why will the pool open late?",
    "options": [
      "The water is being tested.",
      "The pool needs more swimmers.",
      "A swimming class was canceled.",
      "The building is being painted."
    ],
    "answer": 0,
    "explanation": "正解是 The water is being tested.，公告直接說明延後開放是因為正在檢測池水。其他選項在公告中都沒有提到。",
    "solutionSteps": [
      "讀取公告中的 because，找出原因。",
      "確認原因是 the water is being tested。",
      "選第一項；其餘選項都是文本未提供的資訊。"
    ],
    "relatedWords": [
      "test",
      "pool",
      "open"
    ],
    "commonMistake": "只記得開放時間有變，卻沒有回到 because 後面找原因。",
    "teacherTip": "原因題可優先搜尋 because、so、since 等因果連接詞。",
    "unit": "公告：設施開放時間",
    "knowledgePoint": "從公告中找出事件原因",
    "difficulty": "易"
  },
  {
    "question": "Mia used to be afraid of speaking English in class. She began practicing with her cousin for ten minutes every night. After a few weeks, she volunteered to give a short report. What helped Mia become more confident?",
    "options": [
      "Regular practice with her cousin",
      "A new English textbook",
      "A longer report from her teacher",
      "Watching a movie at school"
    ],
    "answer": 0,
    "explanation": "正解是 Regular practice with her cousin。文章指出 Mia 每晚和表親練習，幾週後更有自信並主動報告。其他選項沒有出現在文章中，不能推論為原因。",
    "solutionSteps": [
      "讀出 Mia 原本害怕在課堂上說英文。",
      "找出轉變前新增的行動：每晚與表親練習。",
      "選 Regular practice with her cousin，其他選項皆未在文章提及。"
    ],
    "relatedWords": [
      "practice",
      "confident",
      "volunteer"
    ],
    "commonMistake": "以為自信來自課本或影片等常見學習方式，而非依據文章線索。",
    "teacherTip": "原因推論題要找出變化前發生的行動或條件。",
    "unit": "短篇閱讀：練習與自信",
    "knowledgePoint": "根據文章線索推論人物改變的原因",
    "difficulty": "易"
  },
  {
    "question": "On Sunday, Leo planned to ride his bike to the beach. When he saw dark clouds, he checked the weather report and changed his plan. He took a bus to the science museum instead. What can we learn about Leo?",
    "options": [
      "He changed his plan after checking the weather.",
      "He went to the beach before the rain started.",
      "He does not like science museums.",
      "He forgot how to ride a bike."
    ],
    "answer": 0,
    "explanation": "正解是 He changed his plan after checking the weather. 文章說 Leo 看見烏雲、查詢天氣後改搭公車去科學博物館。其他選項與文章相反或沒有提及。",
    "solutionSteps": [
      "依序整理 Leo 的行動：原本要騎車去海邊、看見烏雲、查天氣。",
      "確認他之後改搭公車去了科學博物館。",
      "選第一項；其餘選項不符合或超出文本資訊。"
    ],
    "relatedWords": [
      "plan",
      "weather report",
      "instead"
    ],
    "commonMistake": "將原本的計畫誤認成最後實際完成的行程。",
    "teacherTip": "留意 instead、but、however 等轉折或改變計畫的線索。",
    "unit": "短篇閱讀：計畫改變",
    "knowledgePoint": "辨別人物原計畫與實際行動",
    "difficulty": "中"
  },
  {
    "question": "Nora's family started a small herb garden on their balcony. Nora waters the plants every morning, while her brother checks for insects. They use the herbs in soup and salad. What is the main idea of the passage?",
    "options": [
      "How a family grows and uses herbs",
      "Why balconies are difficult to clean",
      "How to cook soup for a large group",
      "Why insects are helpful to plants"
    ],
    "answer": 0,
    "explanation": "正解是 How a family grows and uses herbs，因為短文介紹家人如何照顧香草並把它們用於料理。其他選項只提到文章的零碎詞語或內容未涵蓋的主題。",
    "solutionSteps": [
      "概括短文各句：種植香草、澆水、檢查蟲害、加入食物。",
      "找出能涵蓋照顧與使用兩部分的主旨。",
      "選 How a family grows and uses herbs，其他選項過於狹窄或未提及。"
    ],
    "relatedWords": [
      "herb",
      "garden",
      "grow"
    ],
    "commonMistake": "挑選只涵蓋單一細節的選項，而非能統整全文的主旨。",
    "teacherTip": "主旨題要找出能概括多數句子、又不增加文本外資訊的選項。",
    "unit": "短篇閱讀：家庭生活",
    "knowledgePoint": "歸納短文主旨",
    "difficulty": "中"
  },
  {
    "question": "Ben found a wallet near the school gate. It had some money and an ID card inside. He took it to the school office, where a teacher called the owner. What did Ben do with the wallet?",
    "options": [
      "He gave it to the school office.",
      "He kept the money and threw it away.",
      "He left it at the bus stop.",
      "He gave it to his best friend."
    ],
    "answer": 0,
    "explanation": "正解是 He gave it to the school office. 短文說 Ben 把錢包帶到學校辦公室，由老師聯絡失主。其他選項都與文章描述不符。",
    "solutionSteps": [
      "找出 Ben 發現錢包後的行動。",
      "讀到 He took it to the school office。",
      "選 He gave it to the school office，其他選項與原文相反。"
    ],
    "relatedWords": [
      "wallet",
      "owner",
      "office"
    ],
    "commonMistake": "只注意錢包裡有錢，便自行推測 Ben 如何處理金錢。",
    "teacherTip": "細節題可回到文本定位人名與動作，不需加入道德推測。",
    "unit": "短篇閱讀：誠實行為",
    "knowledgePoint": "擷取人物採取的具體行動",
    "difficulty": "易"
  },
  {
    "question": "When Sam joined the basketball team, he could not run for very long. He started jogging three times a week. Two months later, he could finish the team's warm-up without stopping. How did Sam improve his running?",
    "options": [
      "By jogging regularly",
      "By resting after every practice",
      "By buying new basketball shoes",
      "By watching games on television"
    ],
    "answer": 0,
    "explanation": "正解是 By jogging regularly。文章指出 Sam 每週慢跑三次，兩個月後體能進步。其他選項沒有文本依據，不能解釋他的改變。",
    "solutionSteps": [
      "辨認 Sam 遇到的困難：無法跑很久。",
      "找出他持續採取的訓練方法：每週慢跑三次。",
      "選 By jogging regularly，其他選項未在文章中出現。"
    ],
    "relatedWords": [
      "jog",
      "regularly",
      "improve"
    ],
    "commonMistake": "把加入籃球隊當成進步原因，忽略文章明確描述的訓練方式。",
    "teacherTip": "遇到 how 題，優先尋找文章中的方式或手段，常由 by、through 或動作序列提示。",
    "unit": "短篇閱讀：運動與習慣",
    "knowledgePoint": "根據文章找出能力進步的方法",
    "difficulty": "易"
  },
  {
    "question": "The city opened a new bike path along the river. Many people now ride there after work because the path is separate from busy roads. What is one benefit of the new bike path?",
    "options": [
      "It keeps cyclists away from busy traffic.",
      "It makes the river water cleaner.",
      "It gives people free bicycles.",
      "It shortens everyone's workday."
    ],
    "answer": 0,
    "explanation": "正解是 It keeps cyclists away from busy traffic. 短文說自行車道與繁忙道路分開，這是騎乘者的好處。河水變乾淨、提供免費腳踏車或縮短工作時間都未在文章中提到。",
    "solutionSteps": [
      "找到自行車道的特點：separate from busy roads。",
      "推論此設計讓騎士避開繁忙車流。",
      "選第一項；其他選項皆非文章所述的效益。"
    ],
    "relatedWords": [
      "path",
      "traffic",
      "separate"
    ],
    "commonMistake": "把城市建設的可能好處當成文章已經說明的事實。",
    "teacherTip": "推論可以用文本資訊延伸一步，但不能跳到沒有根據的結論。",
    "unit": "短篇閱讀：城市與交通",
    "knowledgePoint": "由文章明示資訊推論設施的用途",
    "difficulty": "中"
  },
  {
    "question": "The class collected old newspapers for a recycling project. At first, only a few students brought some. Their teacher put a box near the classroom door and reminded everyone each Friday. By the end of the month, the box was full. What helped the class collect more newspapers?",
    "options": [
      "A collection box and weekly reminders",
      "A prize from a newspaper company",
      "A trip to a recycling factory",
      "A rule that students buy new newspapers"
    ],
    "answer": 0,
    "explanation": "正解是 A collection box and weekly reminders。老師放置收集箱並每週提醒，月底收集量增加。其餘選項沒有在文章中提到。",
    "solutionSteps": [
      "比較一開始與月底的收集情況。",
      "找出期間新增的措施：教室門口的箱子與每週提醒。",
      "選 A collection box and weekly reminders，其他選項沒有文本支持。"
    ],
    "relatedWords": [
      "collect",
      "recycle",
      "remind"
    ],
    "commonMistake": "把回收成果歸因於文章未提到的獎品或活動。",
    "teacherTip": "問原因或促進因素時，找出文章中由少到多期間增加的具體措施。",
    "unit": "短篇閱讀：環保行動",
    "knowledgePoint": "分析文章中的行動與結果關係",
    "difficulty": "中"
  },
  {
    "question": "Nina borrowed a cookbook from the library because she wanted to learn how to make bread. She followed one recipe with her father. The first loaf was too hard, but they tried again and made a softer one. What can we infer about Nina?",
    "options": [
      "She is willing to learn from mistakes.",
      "She never wants to cook again.",
      "She already knew every recipe.",
      "She made bread without any help."
    ],
    "answer": 0,
    "explanation": "正解是 She is willing to learn from mistakes. 第一個麵包太硬後，Nina 和父親再次嘗試並做出較柔軟的麵包，顯示她願意從失敗中繼續學習。其餘選項與文章相反或不符。",
    "solutionSteps": [
      "找出第一次烘焙的結果：麵包太硬。",
      "確認 Nina 沒有放棄，而是和父親再試一次。",
      "推論她願意從錯誤中學習；其餘選項不符合文本。"
    ],
    "relatedWords": [
      "recipe",
      "try again",
      "mistake"
    ],
    "commonMistake": "把一次失敗直接推論成不喜歡或不擅長，而忽略後續行動。",
    "teacherTip": "人物特質推論要依據反覆出現的行動或面對困難的反應。",
    "unit": "短篇閱讀：學習與嘗試",
    "knowledgePoint": "根據人物行動推論性格",
    "difficulty": "中"
  },
  {
    "question": "The school started a quiet corner for students who need a short break. It has comfortable chairs, books, and drawing paper. Students may stay for fifteen minutes and then return to class. What is the quiet corner mainly for?",
    "options": [
      "Giving students a place to rest briefly",
      "Holding long meetings after school",
      "Teaching students to play instruments",
      "Storing books for the school library"
    ],
    "answer": 0,
    "explanation": "正解是 Giving students a place to rest briefly。短文說這個空間提供給需要短暫休息的學生，並限制停留十五分鐘。其他選項與場所用途不符。",
    "solutionSteps": [
      "讀出設置空間的目的：students who need a short break。",
      "用後文十五分鐘的限制確認是短暫停留。",
      "選 Giving students a place to rest briefly，其他選項均非其用途。"
    ],
    "relatedWords": [
      "quiet",
      "break",
      "briefly"
    ],
    "commonMistake": "只看到房間裡有書，就誤以為主要用途是存放圖書。",
    "teacherTip": "判斷用途時以文本直接說明的目的為主，設備只作為輔助線索。",
    "unit": "短篇閱讀：校園空間",
    "knowledgePoint": "辨認短文所描述場所的主要用途",
    "difficulty": "易"
  },
  {
    "question": "Last year, the school used many paper cups at sports events. This year, students brought their own bottles, and the school set up water stations. The amount of trash after each event became much smaller. What is the best title for the passage?",
    "options": [
      "A Simple Way to Reduce Event Trash",
      "The History of School Sports",
      "How to Make Paper Cups",
      "Why Students Need More Homework"
    ],
    "answer": 0,
    "explanation": "正解是 A Simple Way to Reduce Event Trash。文章描述學生自備水瓶、學校設置飲水站後，活動垃圾減少。其他選項不是文章主題，或與內容無關。",
    "solutionSteps": [
      "整理文章重點：自備水瓶、設置飲水站、垃圾減少。",
      "選擇能概括做法與結果的標題。",
      "選 A Simple Way to Reduce Event Trash，其他標題未涵蓋文章內容。"
    ],
    "relatedWords": [
      "reduce",
      "trash",
      "water station"
    ],
    "commonMistake": "標題只抓住 sports events 這個背景，沒有概括文章主要改變。",
    "teacherTip": "好標題要涵蓋全文核心，不能只描述單一細節或加入無關主題。",
    "unit": "短篇閱讀：環保與校園活動",
    "knowledgePoint": "根據全文主旨選擇標題",
    "difficulty": "中"
  }
];
if(rows.length!==25) throw new Error("Expected 25 reviewed English items");
const normalized = value => value.replace(/\\s+/g," ").trim().toLowerCase();
const keys = new Set(bank.filter(item => !(Number(item.id.slice(4))>=233 && Number(item.id.slice(4))<=257)).map(item=>normalized(item.question+"|"+item.options.join("|"))));
for(let i=0;i<rows.length;i+=1){
 const item=rows[i], id="ENG-"+String(i+233).padStart(4,"0"), row=bank.find(x=>x.id===id);
 if(!row||item.options.length!==4||new Set(item.options.map(x=>x.toLowerCase())).size!==4||!Number.isInteger(item.answer)||item.answer<0||item.answer>3||item.solutionSteps.length!==3||item.relatedWords.length<2) throw new Error("Invalid "+id);
 const key=normalized(item.question+"|"+item.options.join("|")); if(keys.has(key)) throw new Error("Cross-bank duplicate "+id); keys.add(key);
 if(!item.explanation.toLowerCase().includes(item.options[item.answer].toLowerCase())) throw new Error("Answer not explained "+id);
 Object.assign(row,{gradeSemester:"九年級",unit:item.unit,knowledgePoint:item.knowledgePoint,difficulty:item.difficulty,type:item.question.startsWith("NOTICE:")?"公告閱讀選擇":item.question.startsWith("A:")?"對話選擇":item.question.startsWith("短文")?"短文閱讀選擇":"單題選擇",question:item.question,options:item.options,answer:item.answer,explanation:item.explanation,solutionSteps:item.solutionSteps,relatedWords:item.relatedWords,commonMistake:item.commonMistake,teacherTip:item.teacherTip,sourceType:"原創會考程度練習"});
}
await writeFile(path,JSON.stringify(bank,null,2)+"\n","utf8");
console.log("Rebuilt ENG-0233–0257 with 25 teacher-reviewed items.");
