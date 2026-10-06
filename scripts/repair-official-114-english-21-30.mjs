import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const rexPassage = "【Reading】Rex is a dog that lives at the bakery next to our school. He is cute and friendly. Every morning, he stands in front of the school to welcome everybody. We all see Rex as one of us. But one Monday morning, I was surprised that Rex was not there to say hello to us. ‘Rex is in the hospital. He was hit by a car last night,’ my classmate told me. We went to see Rex in the hospital that day after school. Two weeks later, Rex was much better, and we decided to take him for a walk every evening. Because of the exercise, Rex became healthier and stronger. Soon he could happily run and jump again. He is now as handsome and strong as before!";
const farmPassage = "At 5 o'clock every morning, 16-year-old Libby Larson is already up. She mops the floor, gets the mail and newspapers, and gets ready for visitors to Rolling Acres. Libby's grandparents started Rolling Acres in 1970, and the Larson family has worked there ever since. It used to be just a sheep farm, but now it has fruit trees, vegetable gardens, and many kinds of animals, and has become a popular family vacation place. Visitors can pick fruit, collect eggs, and feed animals. Libby shows children how to feed the baby sheep. Libby is paid $10 an hour and expects to make about $1,200 this summer. She plans to buy a cell phone. Working at the family business also means making sacrifices: she would like to sleep until noon or go to summer camp, and her friends stopped inviting her on trips because she is busy in summer. Still, she says working with family is great because they feel closer to each other.";
const cardAd = "【Advertisement】Buy a White Lake City Card When You're in the City. With any card, you can visit the city by metro, bus, or train as many times as you want; take one child under 12 with you for free; and save 20% on public museum tickets. The 1-day, 3-day, and 5-day cards are for trips from Monday to Friday; the Weekend Card is for weekends and holidays. Buy the right card for the zones you enter. Prices: 1-day—Zone 1 $20, Zones 1–2 $40, Zones 1–3 $60; 3-day—$40, $60, $80; 5-day—$50, $80, $110; Weekend—$30, $50, $80. The cards are only for trips inside the three zones. Map key: White Lake Main Station is in Zone 1; Museum of White Lake City History is in Zone 2; White Lake is in Zone 2.";
const comicContext = "【Comic context】Around the year 400, people came to Easter Island, where there were many trees. They used trees to make fire and build houses. They also made large statues and moved them with wood. Trees were needed in every part of life; over time fewer trees remained. Without enough trees to keep water under the ground, the land became dry and plants did not grow. People began to fight for water and food, and the statues were moved to fighting grounds to show power. The last trees were probably cut down, and when the last trees fell, people on the island fell too. The final panel warns: ‘Let's not make Earth, our only home, another Easter Island.’";
const review = (number, page, note) => ({ status: "已依114年官方英文科題本核對", note, evidenceSources: [base + "114-english-p" + page + ".webp"] });
const textOnly = { requiresImage: false, requiresContext: false, questionImages: [], questionImage: "" };
const repairs = {
  "OFF-0937": {
    ...textOnly, question: `【閱讀材料】${rexPassage}\n\nHow did the writer help Rex?`,
    explanation: "答案 B, By making him exercise.（帶他運動）。Rex 車禍後好轉，作者一行人每天晚上帶他散步；文章直接說運動讓他更健康、更強壯。",
    solutionSteps: ["定位 after two weeks：Rex 開始好轉，大家決定每天晚上帶他散步。", "原文接著說 Because of the exercise（因為運動），Rex 變得更健康、更強壯。", "因此作者是藉由讓 Rex 運動幫助他，選 B。去醫院探望不等於帶他看醫生；文中也沒有報警或替他找新家。"],
    teacherTip: "exercise 可作名詞「運動」或動詞「運動」；take a walk＝go for a walk。勿把探病 visit him 誤讀為帶他看醫生 take him to a doctor。",
    relatedWords: ["exercise＝work out（運動）", "get better＝recover（康復）", "stronger＝更強壯（strong 的比較級）"],
    answerKeyReview: review(21, 4, "全文指出每天帶 Rex 散步，並明說 exercise 令他更健康強壯，核對 B。"),
  },
  "OFF-0938": {
    ...textOnly, question: "【Group chat】Jenny: ‘Hey guys, guess what? I'm getting married next year!’ Linda: ‘Wow, I'm so happy for you.’ Mark: ‘I have good news too! I just got the job I've wanted so much.’ Linda: ‘Come on, Mark. Don't start again. You're stealing Jenny's thunder. Jenny was telling us about her big news. It's very important to her. And you want us to hear about your new job now? I agree. Last time when we were talking about how delicious Linda's cake was, you started telling us about the chocolate cake you made at home.’ Mark: ‘All right, all right, my problem. Sorry, Jenny. I'll never do that again. So do you want to know what job I got?’\n\nWhat do we know about Mark from the dialogue?",
    explanation: "答案 A, He made Linda unhappy.（他讓 Linda 不高興）。Linda 說 Mark 又搶走 Jenny 分享喜訊的焦點，也提到他上次在大家稱讚 Linda 蛋糕時也轉談自己的蛋糕，可見 Linda 對此不悅。",
    solutionSteps: ["先看 Linda 對 Mark 的直接反應：‘Don't start again’ 和 ‘You're stealing Jenny's thunder.’ 都是在責備他搶話題。", "她再舉上次的例子，表示這不是第一次；Mark 最後也道歉。", "所以對話可知 Mark 讓 Linda 不高興，選 A。沒有證據說他在找新工作、不喜歡蛋糕，或要和 Jenny 結婚。"],
    teacherTip: "steal someone's thunder 是習語，指搶走別人受矚目的時刻／搶先公布消息；thunder 不是字面上的雷聲。",
    relatedWords: ["upset＝make someone unhappy（使不高興）", "apologize＝say sorry（道歉）", "attention＝notice（注意力）"],
    answerKeyReview: review(22, 5, "依 Linda 的責備、重提舊事及 Mark 道歉判讀其不悅，核對 A。"),
  },
  "OFF-0939": {
    ...textOnly,
    question: "Which is most likely an example of ‘stealing someone's thunder’?\n\n(A) Dennis never changes his mind except when his wife tells him to.\n(B) Melisa tells Tom she'll go to the party but tells her mom she'll stay home.\n(C) Jeff tells everyone he'll move abroad when Ivy is still telling them about her baby.\n(D) Alisa says she doesn't care what we have for lunch but also doesn't like the restaurant we chose.",
    explanation: "答案 C。Ivy 正在和大家分享寶寶的消息時，Jeff 卻插入宣布自己要搬到國外，搶走 Ivy 的焦點，正是 steal someone's thunder。",
    solutionSteps: ["此習語指在別人分享重要消息／成就時，搶先插話或把注意力轉到自己身上。", "C 中 Ivy 還在說寶寶的事，Jeff 就告訴大家自己要移居國外，符合搶焦點。", "A 是受他人影響改變想法；B 是對不同人說不同打算；D 是口是心非，都不是搶走別人風頭。"],
    teacherTip: "判斷習語例句要找兩個元素：原本正在受關注的人，以及另一人如何把焦點移走。",
    relatedWords: ["steal the spotlight（搶走聚光燈）", "interrupt（打斷）", "announce（宣布）"],
    answerKeyReview: review(23, 5, "原題 C 的 Ivy 正說寶寶消息時，Jeff 插入自己的移居消息，符合習語情境。"),
  },
  "OFF-0940": {
    ...textOnly, question: `${cardAd}\n\nWhat can you do with a White Lake City Card?`,
    explanation: "答案 D。任何 White Lake City Card 都可讓持卡者在市內不限次搭乘地鐵、公車或火車，因此可在市內不限次搭地鐵。",
    solutionSteps: ["讀廣告第一項權益：visit the city by metro, bus, or train as many times as you want。", "as many times as you want 表示次數不限；範圍是 city 和標示的三個區域。", "因此選 D。折扣是公共博物館門票 20%，不是免費；未滿 12 歲兒童免費同行，不是兒童火車票打折；也不能搭到三區以外。"],
    teacherTip: "as … as you want 表示「任意／不限……」；注意卡片可在區內不限次搭乘，不等於可搭出指定區域。",
    relatedWords: ["as many times as you want（不限次數）", "save 20%（節省兩成）", "inside the zones（區域範圍內）"],
    answerKeyReview: review(24, 5, "逐項核對廣告權益，D 精確符合市內不限次搭乘地鐵。"),
  },
  "OFF-0941": { question: "Weekday Zones 1–2 ticket ($40) plus Weekend Zones 1–2 ticket ($50), total $90.", explanation: "答案 D；兩張票都需涵蓋 Zone 1 到 Zone 2，分別符合週五平日和週六週末。總價 $40+$50=$90。", solutionSteps: ["Main Station 在 Zone 1，博物館及湖在 Zone 2。", "週五買 weekday Zones 1–2 $40；週六買 weekend Zones 1–2 $50。", "合計 $90，選 D；C 僅含平日 Zone 1，不能滿足跨區行程。"], teacherTip: "逐項核對日期、區域與票價。", relatedWords: ["weekday", "weekend", "zone"], answer: 3, answerKeyReview: review(25, 5, "按票券日期、分區及價格核算為 $90，答案 D。") },
  "OFF-0942": {
    ...textOnly, question: `【閱讀材料】${farmPassage}\n\nWhat is Rolling Acres?`,
    explanation: "答案 C, A vacation farm（供家庭度假的農場）。文章說它從前是養羊場，現在有果樹、菜園與多種動物，已成為家庭度假熱門地點。",
    solutionSteps: ["定位原文：it has become a popular place for families to go on vacation。", "前文列出果樹、菜園及各種動物，遊客可採果、撿蛋和餵動物。", "所以選 C 度假農場；它不是單純動物園、露營地或家庭餐廳。"],
    teacherTip: "回答 What is …? 要抓文章對主角的定義句；used to be 是「過去曾是」，不能當成現在的分類。",
    relatedWords: ["vacation＝holiday（假期）", "farm（農場）", "used to be（過去曾是）"],
    answerKeyReview: review(26, 6, "依 passage 將 Rolling Acres 描述為家庭度假熱門地點，核對 C。"),
  },
  "OFF-0943": {
    ...textOnly, question: `【閱讀材料】${farmPassage}\n\nWhat do we learn from the first paragraph?`,
    explanation: "答案 A, What Libby does at Rolling Acres。第一段具體描述 Libby 清晨拖地、收信報、接待訪客，以及帶小朋友餵小羊，都是她在農場的工作。",
    solutionSteps: ["題目限定 first paragraph，只用第一段找答案。", "列出的動作包括 mops the floor、gets the mail and newspapers、gets ready for visitors、show kids how to feed baby sheep。", "這些都在說 Libby 在 Rolling Acres 做什麼，選 A；不是遊客的想法、祖父母創辦原因或家族未來計畫。"],
    teacherTip: "題目問 What do we learn from a paragraph? 先遵守指定段落範圍，再對照各選項的主詞和資訊類型。",
    relatedWords: ["visitor（訪客）", "get ready for（為……做準備）", "show someone how to（示範如何……）"],
    answerKeyReview: review(27, 6, "限定第一段並依 Libby 的工作細節核對 A。"),
  },
  "OFF-0944": {
    ...textOnly, question: `【閱讀材料】${farmPassage}\n\nWhat does ‘making sacrifices’ mean in the passage?`,
    explanation: "答案 D, Giving up something important to do something else（為了做另一件事而放棄重要事物）。Libby 工作賺錢，但犧牲睡到中午、參加夏令營和與朋友出遊的機會。",
    solutionSteps: ["找作者對 making sacrifices 的具體例子：Libby 想睡到中午或去夏令營，卻因工作做不到；朋友也不再邀她旅行。", "她放棄部分休閒時間，換取工作收入並協助家族事業。", "所以選 D；其他選項談理財、了解家人或替困難找藉口，均非上下文意思。"],
    teacherTip: "片語意思要用上下文的例子推斷；sacrifice 作名詞是「犧牲、取捨」，make a sacrifice 是「作出犧牲」。",
    relatedWords: ["give up（放棄）", "trade A for B（以 A 換取 B）", "sacrifice（犧牲）"],
    answerKeyReview: review(28, 6, "依 Libby 放棄休閒活動去工作賺錢的例子核對 D。"),
  },
  "OFF-0945": {
    question: `${comicContext}\n\nWhat do the comics tell us?`, questionImage: `${base}114-english-p8.webp`, imageAlt: "復活節島六格漫畫：森林由繁茂到砍伐殆盡，土地乾旱、居民爭奪資源；末格警告不要讓地球成為另一個復活節島", questionImages: [`${base}114-english-p8.webp`], requiresImage: true, requiresContext: false,
    explanation: "答案 C, Save our planet before it's too late。漫畫呈現復活節島從樹木豐茂到森林消失、土地乾旱與居民衝突的過程，最後把警告連結到地球：不要讓地球成為另一個復活節島。",
    solutionSteps: ["依漫畫順序讀圖：砍樹供生活與搬運石像，樹木減少，地下水不足、土地乾旱，最後居民爭奪資源。", "末格寫 ‘Let's not make Earth, our only home, another Easter Island.’ 這是警告現代人避免重蹈環境崩壞。", "因此主旨是及時保護地球，選 C；不是只享受當下、沿用舊方法或單純善待他人。"],
    teacherTip: "漫畫主旨通常結合事件因果和最後一格的警語；不要把其中一格的細節誤當整篇主旨。",
    relatedWords: ["planet（行星；此處指地球）", "before it's too late（趁還來得及）", "environment（環境）"],
    answerKeyReview: review(29, 8, "依森林消失的因果及末格警語核對主旨 C；保留必需的漫畫圖。"),
  },
  "OFF-0946": {
    question: `${comicContext}\n\nWhat can we learn about the people in the comics?`, questionImage: `${base}114-english-p8.webp`, imageAlt: "復活節島六格漫畫：島民搬動石像並將其移到戰場，以展現力量；圖中同時呈現森林減少與土地乾旱", questionImages: [`${base}114-english-p8.webp`], requiresImage: true, requiresContext: false,
    explanation: "答案 D, They used statues to show how strong they were。第六格明說雕像被移到戰場以展現權力（show their power）；D 的意思是用石像展示力量，與此相符。",
    solutionSteps: ["定位第六格文字：The statues were moved to fighting grounds to show their power。", "show their power 與 show how strong they were 意思相近，都是展示力量／權勢。", "選 D。漫畫沒有說他們先放火再開戰、一直為土地植物打仗，或向石像祈禱。"],
    teacherTip: "power 可指力量或權勢；題目常用同義改寫，需辨認 show their power ≈ show how strong they were。",
    relatedWords: ["power＝strength（力量）", "statue（雕像）", "fight for（為……而爭鬥）"],
    answerKeyReview: review(30, 8, "依漫畫第六格 show their power 原句核對 D；保留必要漫畫圖。"),
  },
};

for (const [id, patch] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 English Q21–30 against original question pages.");
