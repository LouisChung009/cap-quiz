import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const sharedPassage = `【Reading material】A HISTORY LESSON ON THE PANDEMIC (2020.10.29)
Since the Covid-19 pandemic began, people have used “social distancing”—keeping a safe space between people who do not live together. Although it became a popular topic in 2020, it is not a new idea: it was widely used in the U.S. during the 1918 flu pandemic. The experience of American cities can show whether it saved lives.

The original chart compares weekly deaths per 100,000 people with each city’s social-distancing period in Portland, New York, Denver, and Pittsburgh. New York began distancing before the other three cities. Portland and Denver initially kept deaths down, but after they ended distancing, deaths rose again. Portland combined several measures: separating sick people from healthy people, closing schools, and stopping public activities.

For Q40–43, use the article and chart information above. Fill the numbered blank indicated in the question below.`;

const repairs = {
  "OFF-0734": {
    explanation: "答案是 A「Fixing books」。前文說陳炳宏像醫生一樣修補有小問題的書；結尾的 magic 指他修復書籍後，讓書主重新找回完整舊書與珍貴回憶的能力。B 是修書帶來的結果（書主微笑），不是魔法本身；C、D 均未在文章提及。",
    solutionSteps: ["回看文章如何比喻陳的工作：大型圖書館處理嚴重問題，他修補小問題的書。", "magic 對應他的修書能力；書主微笑是修復後的反應。", "選 A，分辨工作本身與工作造成的情緒結果。"],
    teacherTip: "問 What is his magic? 時要找文中對 magic 的實際指涉，不要選後續效果。",
    relatedWords: ["magic（魔法／特別能力）", "fix / repair（修理／修補）", "owner（物主）"]
  },
  "OFF-0735": {
    explanation: "答案是 A。文章說 Rohla 和 Kreytenberg 與難民共事後，發現有些人在敘利亞曾是廚師，於是創辦結合奧地利與敘利亞料理的餐廳，幫助難民在奧地利展開新生活，並提供工作及未來成為餐廳經營者的機會。文章不是募款支援戰爭、教育奧地利人了解戰爭，或協助難民返國。",
    solutionSteps: ["找出餐廳創辦前的背景：兩位奧地利人曾與難民共事，邀請他們參與會議。", "他們的目標是讓難民開始新生活，並以餐廳提供工作與發展機會。", "選 A；不是替敘利亞戰爭募款，也不是讓難民返鄉。"],
    teacherTip: "why did they open 題要分清楚創辦目的和餐廳後續營運方式。",
    relatedWords: ["refugee（難民）", "start a new life（展開新生活）", "restaurant（餐廳）"]
  },
  "OFF-0736": {
    explanation: "答案是 B。文末說兩位創辦人希望最優秀的員工最後能買下這家餐廳，因此它將來可能出售給員工。A 把兩國料理誤解成餐廳從敘利亞搬到奧地利；C 文中沒有烹飪課程；D 雖有兩地文化相遇，但文章說的是奧地利和敘利亞食物，不是只服務敘利亞人的聚會場所。",
    solutionSteps: ["定位文章最後一段，找出創辦人對餐廳未來的計畫。", "want their best workers to buy the restaurant in the end，直接支持 B。", "其他選項分別把菜色、餐廳所在地或服務對象誤讀。"],
    teacherTip: "may 表示可能性；不要把希望或計畫誤讀成已經發生的事。",
    relatedWords: ["in the end（最後）", "worker（員工）", "sell / buy（出售／購買）"]
  },
  "OFF-0737": {
    explanation: "答案是 A「They do not agree」。beg to differ 是固定片語，委婉地表示「持不同意見／不認同」。文中作者先提到有些人視難民為問題，接著說兩位創辦人 beg to differ，表示他們不認為難民必然是問題。其餘選項把 differ 誤當外貌不同、替人發言或沒注意到。",
    solutionSteps: ["看片語所在語境：有人認為難民是問題，兩位創辦人接著 beg to differ。", "後文指出他們相信難民可以開始新生活，說明他們不同意前述看法。", "選 A；此片語不是字面上的「看起來不同」。"],
    teacherTip: "beg to differ 是慣用語，整體理解為禮貌地表示不同意。",
    relatedWords: ["differ（不同）", "disagree（不同意）", "opinion（看法）"]
  },
  "OFF-0738": {
    explanation: "答案是 B。文中說 Smith is an advocate of bringing extinct animals back，後面立刻解釋他認為應盡力讓牠們復生；advocate 在此是支持某理念、主張應實行的人。A 是空談者，C 是有不良經驗者，D 是先行者，皆不是此字義。",
    solutionSteps: ["利用後文解釋 advocate 的立場：Smith 認為應盡力讓滅絕動物復生。", "因此 advocate 指支持並主張推動某事的人。", "選 B；不要和名詞 advocate「倡議者」之外的 advocate for the first/early adopter 概念混淆。"],
    teacherTip: "遇到字彙題先讀同段後續的立場或例子，常能用上下文推義。",
    relatedWords: ["advocate（支持者／倡議者）", "support（支持）", "bring back（使復原／帶回）"]
  },
  "OFF-0739": {
    explanation: "答案是 B。Smith 認為胃中育有蝌蚪的絕種青蛙，可能幫助研究如何讓部分孕婦順利保住胎兒，因此這種青蛙可能為健康問題帶來解方。作者也質疑此推論尚無實證，但題目問的是 Smith 書中所述的特殊之處，不能把作者的懷疑當成另一項事實。",
    solutionSteps: ["找出青蛙特徵：牠曾在胃裡孕育蝌蚪。", "Smith 推測研究這種生殖方式或能幫助有流產風險的女性，對應健康問題。", "選 B；留意題目問 Smith 的主張，作者後續則對可行性提出質疑。"],
    teacherTip: "閱讀評論文時區分被評論者的主張與評論者本人的立場。",
    relatedWords: ["extinct（絕種的）", "tadpole（蝌蚪）", "health problem（健康問題）"]
  },
  "OFF-0740": {
    explanation: "答案是 C。Zimmer 引用 Wang 所說的「throwing good money after bad」，用這句話強化並說明她認為復育絕種動物耗費大量資源卻沒有成果的立場。這不是開啟新主題、分享夢想或呼籲行動；她是在用另一位專家的評語讓自己的批判更清楚。",
    solutionSteps: ["閱讀引言前後：她先說投入許多努力和金錢，卻尚未看到成果。", "Wang 的引言以「繼續把錢投入無效計畫」概括相同觀點。", "選 C；引言的功能是釐清並支持作者觀點。"],
    teacherTip: "作者引用他人話語的目的，要從引文如何支撐前後主張判斷。",
    relatedWords: ["quote（引用）", "make an idea clear（使想法清楚）", "expensive（昂貴的）"]
  },
  "OFF-0741": {
    explanation: "答案是 C。Zimmer 明說她不知道復育需要多少時間和金錢，也懷疑絕種動物能否真正回來；青蛙研究十年只得到少數死亡的卵，且沒有看到活體。這表示她認為目前復育成功並不可能／尚無法實現。A 認為可行與她的懷疑相反；B、D 的危險性文章未討論。",
    solutionSteps: ["整理作者的語氣與證據：不知道能否復活、投入十年仍只有死卵。", "這些內容顯示她不相信目前能成功復育，而非單純擔心危險。", "選 C；不要將「不確定能否做到」擴大成「一定危險」。"],
    teacherTip: "most likely 題綜合作者反覆表達的證據與態度，不只看單一句子。",
    relatedWords: ["likely（可能）", "actually（實際上）", "bring back（使復生）"]
  },
  "OFF-0742": {
    question: `${sharedPassage}\n\nQ40. Complete the sentence: “Though it has been a very popular topic this year, social distancing ____.”`,
    explanation: "答案是 A「is not a new idea」。空格後立即以 In fact 引出證據：社交距離在 1918 年美國流感大流行時已廣泛使用，所以雖是 2020 年熱門話題，並不是新想法。B、C、D 都沒有後文支持。",
    solutionSteps: ["注意 In fact 引出的是補充歷史事實，不是反例。", "1918 年已廣泛使用，證明這個方法並非新出現。", "選 A；時態用 is，描述社交距離概念至今的性質。"],
    teacherTip: "前句設空、後句以 In fact 舉證時，檢查兩句是支持、補充還是轉折關係。",
    relatedWords: ["social distancing（社交距離）", "popular（熱門的）", "in fact（事實上）"]
  },
  "OFF-0743": {
    question: `${sharedPassage}\n\nQ41. Which city started social distancing earlier than the other three?`,
    explanation: "答案是 B「New York」。題組圖比較四個城市開始社交距離的時間；紐約的起始時間線早於波特蘭、丹佛與匹茲堡。較早採取措施後，文中指出該市死亡數維持較低。",
    solutionSteps: ["先看材料中對四城社交距離開始時間的比較。", "紐約時間線最早，並且和後文死亡數較低的描述吻合。", "選 B；不可用城市大小或地理位置代替圖表證據。"],
    teacherTip: "比較時間線時先對齊橫軸起點，再判斷哪一條措施區間最早出現。",
    relatedWords: ["earlier than（比……早）", "start（開始）", "death rate（死亡率）"]
  },
  "OFF-0744": {
    question: `${sharedPassage}\n\nQ42. What happened to Portland and Denver after the first few weeks?`,
    explanation: "答案是 B「stopped social distancing too soon」。文字指出兩城前幾週控制得不錯，但其後限制措施停止，死亡數又上升，表示維持時間不夠。A 把結果當成兩城原本就有較高死亡數；C、D 均與文章描述的變化不符。",
    solutionSteps: ["留意轉折詞 However：前幾週有效，接著情況轉差。", "限制措施過早停止後，死亡數再度上升，說明措施沒有維持足夠久。", "選 B；這是措施時長與疫情結果的因果脈絡。"],
    teacherTip: "遇到 however 要比較轉折前後的狀況；climbed again 指數值再度上升。",
    relatedWords: ["stop too soon（過早停止）", "climb（上升）", "keep an action long enough（維持措施足夠久）"]
  },
  "OFF-0745": {
    question: `${sharedPassage}\n\nQ43. Choose the best connector: “____, sick people were kept away from healthy ones; schools were closed; public activities were not allowed.”`,
    explanation: "答案是 D「For example」。前句概括 Portland 同時採取多種社交距離方式，後面列出隔離病患、關閉學校、禁止公共活動，這些都是具體例子。Also 表增加另一項同層訊息，At first 表時間起點，However 表轉折，均不符合總述後列舉例證的結構。",
    solutionSteps: ["辨認前句是總述：Portland 同時使用數種措施。", "分號後列出三種具體措施，是對「數種方式」的例示。", "選 D For example；它能自然引出後面的清單。"],
    teacherTip: "總述後接具體例子常用 for example；also 加資訊，however 轉折，at first 標示時間。",
    relatedWords: ["for example（例如）", "also（此外）", "however（然而）"]
  }
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題") throw new Error(`Missing official question ${id}`);
  Object.assign(row, repair);
}

for (const id of ["OFF-0742", "OFF-0743", "OFF-0744", "OFF-0745"]) {
  const row = rows.find(item => item.id === id);
  row.requiresImage = false;
  row.requiresContext = false;
  row.questionImages = [];
  delete row.questionImage;
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official English explanations and embedded missing Q40–43 reading material.`);
