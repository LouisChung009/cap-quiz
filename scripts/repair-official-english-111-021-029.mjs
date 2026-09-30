import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const teaAd = "【Reading material: Tea-Rock advertisement】‘You Drink Tea-Rock & We Send You to the USA.’ The ad thanks customers for being with the company for ‘Twenty Summers & Winters.’ To enter, cut out two tea-cup pictures from Tea-Rock tea bottles and paste them on a postcard. Write your name, birthday, telephone number, e-mail address, and favorite Tea-Rock tea. Send it to Tea-Rock 20, PO Box 70265, Miao-Song, between January 10 and March 15, 2010. The first prize is two tickets from Taipei to New York. Other prizes include a TV and an MP4 player.";
const sugarInfo = "【Reading material: ‘Dangerously Sweet: Sugar’ infographic】One sugar-spoon symbol represents 4 g of sugar. Recommended daily limits are 9 teaspoons for a man, 6 for a woman, and 3 for a child. Average daily intake per person is 17.1 teaspoons in the UK, 17.75 in Taiwan, and 18.75 in the US. In the hidden-sugar panel, 66 g of ice cream is shown with two sugar-spoon symbols (8 g); a 400-ml serving of rice milk has four symbols (16 g), while 400 ml of grape juice has seven (28 g). Other comparisons include cheesecake (95 g), orange juice (300 ml), cola (330 ml), and a sports drink (590 ml).";
const pinterestTalk = "【Reading material: conversation】Marina says she needs to draw a future house for art class but has no ideas. Darrell suggests Pinterest. When Marina asks whether it is a shopping app, Darrell explains that people share their works there and tell others how they made them, so she can get ideas. He says he recently found an ‘A to Z’ guide to making chocolate cake, from choosing good chocolate and baking the cake to making sugar flowers. Marina says she will check it later.";
const tabataText = "【Reading material: Tabata training】Tabata is a popular way to exercise that takes little time and space and burns calories quickly. A cycle uses 20 seconds of exercise followed by 10 seconds of rest; repeat the exercise-and-rest cycle at least eight times. Common moves include jumping jacks, high knees, squats, and planks; people may choose their own moves, such as doing more leg exercises to strengthen their legs. After four minutes, the body may continue burning calories for at least an hour, but this ‘afterburn’ requires hard effort during each 20-second exercise period. It may not suit people who seldom exercise or have heart problems. It may suit people who enjoy exercising but are too busy to go to the gym.";

const updates = {
  "OFF-0295": {
    question: `${teaAd}\n\nWhat does Tea-Rock celebrate?`,
    explanation: "答案是 C「Their 20th year of business（營業第 20 年）」。廣告用 ‘Twenty Summers & Winters’ 表達與顧客共度二十個夏冬；在四個選項中，這句最支持 Tea-Rock 慶祝營業二十年的解讀，但原文沒有逐字寫出 ‘20th year of business’。其他選項所說的銷售國家數、茶品數和美國門市數都沒有廣告證據。 Answer: C.",
    solutionSteps: ["找廣告中的時間線索：‘Thank You for Being with Us for Twenty Summers & Winters.’", "這句宣傳語指向與顧客共度二十年，是四個選項中最符合營業年數的線索。", "選 C；需注意這是依宣傳語選出最合理解讀，原文並未直接寫出「營業第 20 年」。"],
    teacherTip: "閱讀廣告題要把標題和宣傳語當作證據；不要看到數字 20 就自行推成店數、商品數或國家數。",
    relatedWords: ["celebrate（慶祝）", "business（營業／事業）", "for twenty years（二十年來）"]
  },
  "OFF-0296": {
    question: `${teaAd}\n\n【Postcard information】Jason’s postcard already has his name, telephone number, e-mail address, favorite tea, the two required tea-cup pictures, and the recipient/address. No birthday information is written on it.\n\nHere is the postcard Jason is going to send to Tea-Rock 20. What else does he need to put on the postcard before he sends it?`,
    explanation: "答案是 C「His birthday（他的生日）」。活動規定明信片要寫姓名、生日、電話、電子郵件和最喜歡的茶。Jason 的卡片已填其餘資料、貼好兩張茶杯圖片，也寫了收件地址；唯獨尚未寫生日。 Answer: C.",
    solutionSteps: ["先從廣告列出必填資料：name、birthday、telephone number、e-mail address 和 favorite Tea-Rock tea，並需貼兩張茶杯圖片。", "逐項對照明信片：姓名、電話、電子郵件、喜愛的茶、兩張圖片和收件地址都已出現，但明信片上尚未寫生日。", "所以還要補上生日，選 C；年齡、地址和另一張茶杯圖都不是缺漏項目。"],
    teacherTip: "表單題使用「要求清單逐項勾核」；有地址不代表還要填地址，先確認哪些欄位已出現。",
    relatedWords: ["postcard（明信片）", "birthday（生日）", "recipient（收件人）"]
  },
  "OFF-0297": {
    question: `${sugarInfo}\n\nWhat can we learn about sugar from the infographic?`,
    explanation: "答案是 D：同為 400 ml，米奶有 4 個糖匙符號（16 g），葡萄汁有 7 個（28 g），所以米奶含糖較少。A 不正確，因為 66 g 冰淇淋旁有 2 個符號，即 8 g，不是 4 g；B 把女性 6 匙和男性 9 匙的建議上限說成相同；C 則顛倒美國 18.75 匙與臺灣 17.75 匙的人均攝取量。 Answer: D.",
    solutionSteps: ["先讀圖例：一個糖匙符號代表 4 g；冰淇淋 66 g 旁有 2 個符號，為 8 g。", "比較相同的 400 ml 份量：米奶 4 匙，葡萄汁 7 匙，米奶含糖較少。", "因此 D 正確。女性每日建議上限 6 匙低於男性 9 匙；美國人均攝取量 18.75 匙也高於臺灣 17.75 匙。"],
    teacherTip: "圖表比較要先對齊單位和份量，再比數值；別把建議上限與實際平均攝取量混為一談。",
    relatedWords: ["infographic（資訊圖表）", "serving（份量）", "daily limit（每日上限）"]
  },
  "OFF-0298": {
    question: `${sugarInfo}\n\nWhat can be a reason why the list of “Sugar that is hidden in foods and drinks” is put in the infographic?`,
    explanation: "答案是 C：提醒讀者，日常食物和飲料中也可能含有不容易察覺的糖。標題 ‘Sugar that is hidden in foods and drinks’ 及旁邊的糖匙圖示都聚焦於揭示這些含糖量；清單本身沒有說明糖對身體的危害、兒童喜好的食品或食品的適口糖量。 Answer: C.",
    solutionSteps: ["看小標 ‘Sugar that is hidden in foods and drinks’，hidden 表示不易察覺，直接點出圖表主題。", "清單列出冰淇淋、起司蛋糕、果汁、米奶、汽水等日常品項，並用糖匙符號顯示其含糖量。", "所以清單的目的在提醒讀者日常食品也藏有糖，選 C；不延伸成圖表未直接說明的健康結論。"],
    teacherTip: "推論資訊圖表用途時，優先連結標題、圖例和列出的項目，不要推成圖中沒有呈現的研究目的。",
    relatedWords: ["hidden（隱藏的／不易察覺的）", "intake（攝取量）", "without knowing it（在不知情的情況下）"]
  },
  "OFF-0299": {
    question: `${pinterestTalk}\n\nWhy did Darrell tell Marina to go to Pinterest?`,
    explanation: "答案是 A：To find some examples for her homework（找美術作業的參考例子）。Marina 說她要為美術課畫一棟未來房子，卻沒有想法；Darrell 說 Pinterest 上有人分享作品和製作方式，她可以從中得到靈感。 Answer: A.",
    solutionSteps: ["找出 Marina 使用 Pinterest 的前因：她要畫未來房子作為美術課作業，但還沒有想法。", "Darrell 說網站上有他人分享的作品及製作方式，能提供她作業的靈感和例子。", "所以目的為替作業找參考，選 A；對話沒有說她要購物、交朋友或分享自己的作品。"],
    teacherTip: "Why 題要沿著對話中的「問題—建議—目的」找因果，不要把平台的一般功能當成此處目的。",
    relatedWords: ["example（例子）", "homework（作業）", "get ideas（得到靈感）"]
  },
  "OFF-0300": {
    question: `${pinterestTalk}\n\nWhat does it mean when you learn something from A to Z?`,
    explanation: "答案是 C「You learn everything about it（完整學會一件事）」。對話中的例子從挑選巧克力、烘焙蛋糕一路到製作糖花，涵蓋製作巧克力蛋糕的整個過程；A to Z 在此表示從頭到尾、完整地了解。 Answer: C.",
    solutionSteps: ["不要把 A to Z 只按字母表面解讀；回到對話中的例子看它如何使用。", "Darrell 舉出從選巧克力、烘烤到做糖花的一整套蛋糕製作內容。", "這表示把主題完整學會，選 C；不是任何時間都能學、只在烘焙課學或一生持續學。"],
    teacherTip: "片語含義要用上下文例子確認；from A to Z 常表示從頭到尾、完整涵蓋。",
    relatedWords: ["from A to Z（從頭到尾／完整地）", "choose（選擇）", "make（製作）"]
  },
  "OFF-0301": {
    question: `${tabataText}\n\nWhich idea is talked about in the first paragraph of the reading?`,
    options: ["How you should do Tabata training.", "What is the best time for Tabata training.", "Who first had the idea of Tabata training.", "How often you should do Tabata training."],
    explanation: "答案是 A：How you should do Tabata training。第一段說明一次運動 20 秒、休息 10 秒、至少重複八次，並列出可做的動作及自行選擇動作的方式，重點是訓練如何進行。 Answer: A.",
    solutionSteps: ["題目限定 first paragraph，先只看第一段，不把第二段 afterburn 的內容混進來。", "第一段介紹 20 秒運動、10 秒休息、至少八回合，以及常見動作和可自行選擇動作。", "這些都在說訓練方式，故選 A；第一段沒有談最佳時段、發明者或每週頻率。"],
    teacherTip: "段落主旨題依題目指定範圍找共同主軸；避免用全文其他段落的細節作答。",
    relatedWords: ["training（訓練）", "repeat（重複）", "at least（至少）"]
  },
  "OFF-0302": {
    question: `${tabataText}\n\nWho might find that Tabata training is right for them?`,
    explanation: "答案是 D「People who already have a habit of exercising」；這是四個選項中最接近原文「喜歡運動但太忙去健身房」的人。需留意，enjoy exercising 不必然等同於 already have a habit；原選項比文章說得更強，因此 D 是最佳可選答案，而非原文逐字支持的同義句。 Answer: D.",
    solutionSteps: ["文章說 Tabata 可能適合喜歡運動但太忙、無法去健身房的人。", "文章排除很少運動或有心臟問題者；A、B、C 分別沒有支持、與排除條件衝突，或改成治療心臟病。", "D 是四個選項中最接近喜歡運動者的答案，但「喜歡運動」不必然表示已養成習慣；這是原選項用語比原文更強之處。"],
    teacherTip: "用文章的正反條件排除選項；may be right 不代表對所有人都安全或必然適合。",
    relatedWords: ["seldom（很少）", "heart problem（心臟問題）", "be right for（適合）"]
  },
  "OFF-0303": {
    question: `${tabataText}\n\nWhich is true about Tabata training?`,
    explanation: "答案是 B：參加者可以自行選擇動作。第一段明確說 ‘You can decide yourself what moves to do’，也舉出想練強腿部時可多做腿部動作。其餘選項與文章相反：動作不難學、不需很大空間，而且每 20 秒運動後安排 10 秒休息。 Answer: B.",
    solutionSteps: ["定位文章明說的選動作資訊：‘You can decide yourself what moves to do.’", "作者並舉例，可依訓練目標多做腿部動作，支持自己選擇運動內容。", "因此 B 正確。A 與 ‘not difficult to learn’ 相反；C 與不需太多空間相反；D 忽略每輪有 10 秒休息。"],
    teacherTip: "判斷正誤題逐項比對原文，留意否定詞、頻率和時間等容易被改寫的細節。",
    relatedWords: ["choose（選擇）", "move（動作）", "rest（休息）"]
  }
};

for (const row of rows) {
  const update = updates[row.id];
  if (!update) continue;
  Object.assign(row, update, { requiresImage: false, requiresContext: false, questionImages: [] });
  delete row.questionImage;
  delete row.imageAlt;
}

if (Object.keys(updates).some(id => !rows.some(row => row.id === id))) throw new Error("One or more IDs were not found");
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(updates).length} official 111 English items.`);
