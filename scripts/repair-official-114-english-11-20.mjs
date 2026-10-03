import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const rexPassage = "【Reading】Rex is a dog that lives at the bakery next to our school. He is cute and friendly. Every morning, he stands in front of the school to welcome everybody. We all see Rex as one of us. But one Monday morning, I was surprised that Rex was not there to say hello to us. “Rex is in the hospital. He was hit by a car last night,” my classmate told me. We went to see Rex in the hospital that day after school. Two weeks later, Rex was much better, and we decided to take him for a walk every evening. Because of the exercise, Rex became healthier and stronger. Soon he could happily run and jump again. He is now as handsome and strong as before!";
const review = (number, page, note) => ({ status: `已依114年官方英文科題本第${number}題核對`, note, evidenceSources: [`${base}114-english-p${page}.webp`] });
const repairs = {
  "OFF-0927": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A, make。前半句說 Jo 不會喜歡你遲到，所以後半句是提醒對方準時：「所以務必確定你準時到」。make sure 是固定用法；祈使句以原形動詞開頭，主詞 you 省略。",
    solutionSteps: ["so 連接結果：因為遲到會讓 Jo 不高興，說話者接著給對方一項提醒。", "固定搭配是 make sure (that)＋子句，表示「務必確認……」。", "祈使句用原形 make，選 A；makes 是第三人稱現在式，to make 與 is making 不符合祈使句句型。"],
    teacherTip: "make sure＝be sure（務必確認）；祈使句通常省略 you，動詞用原形。",
    answerKeyReview: review(11, 3, "依 so 的因果語意及 make sure 固定搭配核對原形動詞 A。"),
  },
  "OFF-0928": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D, traffic（交通、車流）。很多汽車和公車在同一時段塞在路上，造成交通壅塞，讓開車時間變長。常見搭配是 heavy／terrible traffic；traffic jam 指交通堵塞。",
    solutionSteps: ["第二句給線索：這段時間通常有很多汽車和公車。", "車輛多會形成 traffic（車流／交通），導致開車時間拉長。", "選 D；experience（經驗）、machine（機器）、service（服務）都不能解釋大量車輛。"],
    teacherTip: "traffic 作「交通、車流」時通常不可數；常說 heavy traffic 或 a traffic jam，不說 many traffics。",
    answerKeyReview: review(12, 3, "依大量汽車、公車及 long drive 語境核對 traffic。"),
  },
  "OFF-0929": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D, perhaps（也許、或許）。句子先說未來可能出現比 Stephen Curry 更出色的球員，再用 but 對比「現在我們相信他最好」。perhaps 表示未來推測，不是確定會發生。",
    solutionSteps: ["找出時間對比：In the future（未來）和 but now（但現在）。", "說話者推測將來可能有人更出色，因此需要表示不確定性的副詞。", "perhaps＝maybe（也許），選 D；never（從不／絕不）與 greater players 的正向推測相反。"],
    teacherTip: "perhaps 和 maybe 都表示「也許」；already 表示已經，again 表示再一次，不能表達未來可能性。",
    answerKeyReview: review(13, 3, "依 In the future 的推測語氣及 but now 對比核對 perhaps。"),
  },
  "OFF-0930": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A, All。後句說除廚房那一扇以外，窗戶都關著，因此其餘窗戶全部關閉。all of the windows 使用複數名詞 windows；both 只用於兩個，most／some 則不表示全部。",
    solutionSteps: ["except the one in the kitchen 表示廚房那扇是例外。", "前面要說其餘所有窗戶都關上，使用 All of the windows。", "選 A；both 要恰好兩個，most 是大多數，some 是一些，都不如 all 符合。"],
    teacherTip: "all of＋複數名詞表示全部；both 限定兩個，不能因為看見多扇窗就選 both。",
    answerKeyReview: review(14, 3, "依 except the one in the kitchen 判斷其餘所有窗戶皆關閉。"),
  },
  "OFF-0931": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A, Although（雖然）。兩個子句形成讓步對比：機器早已用於採收水果，然而直到數年前才用在草莓農場。although 引導「雖然……但是……」的關係。",
    solutionSteps: ["先比較前後內容：水果採收機器早已存在，但草莓農場很晚才開始使用。", "這是預期與實際情況不同的讓步／對比關係。", "Although 最合適，選 A；because 表原因、before 表時間先後、if 表條件。"],
    teacherTip: "although＝though（雖然）；同一句通常不再加 but，避免 although … but 的重複連接。",
    answerKeyReview: review(15, 3, "依一般水果採收與草莓農場較晚採用之間的讓步對比核對 Although。"),
  },
  "OFF-0932": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D, save。居家跟著線上影片運動，可以省去去健身房一趟，也省下一些錢。save someone a trip/time/money 是「讓某人免去一趟／省下時間或金錢」的搭配。",
    solutionSteps: ["影片提供在家運動的方法，因此不必前往健身房。", "空格後接 you a trip，構成 save you a trip（替你省去一趟路）。", "選 D save；cost 是花費，give 是給，keep 是保留，都不符合此搭配。"],
    teacherTip: "save＋人＋time／money／a trip 表示替某人省下時間、金錢或一趟行程；spare someone a trip 也可表相近意思。",
    answerKeyReview: review(16, 3, "依 save someone a trip 的固定搭配及在家運動情境核對 D。"),
  },
  "OFF-0933": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B, are。mine 在此代替 my parents，指 Jane 的父母與說話者的父母相比；parents 是複數，且後面省略重複的 happy，完整意思是 mine are less happy。",
    solutionSteps: ["mine 是所有代名詞，這裡代替 my parents，不是單數的 my parent。", "be 動詞需與複數主詞 parents 一致，用 are。", "so 代替前面提到的 happy，故 mine are less so＝我的父母就沒那麼開心，選 B。"],
    teacherTip: "mine＝my＋名詞；先還原被代替的名詞判斷單複數。less so 是省略形容詞的比較說法。",
    answerKeyReview: review(17, 3, "還原 mine＝my parents 並補出省略的 happy，核對複數 are。"),
  },
  "OFF-0934": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A, asks。Before 引導未來時間副詞子句時，子句通常用現在簡單式表示未來；主句 you should tell 是建議，意思是「在她問起之前，你應該先告訴 Daphne」。",
    solutionSteps: ["句意要求在 Daphne 問起事情之前先告訴她。", "Before 引導時間副詞子句，即使談未來，通常不用 will，而用現在簡單式。", "主詞 she 為第三人稱單數，ask 加 -s，選 A asks。"],
    teacherTip: "未來時間子句常見連接詞 when／before／after／until；連接詞後用現在式，不用 will。",
    answerKeyReview: review(18, 3, "依 Before 引導未來時間子句不使用 will，且 she 為第三人稱單數核對 asks。"),
  },
  "OFF-0935": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B, and fell。衣服先被風吹走（were blown away），接著掉進池塘（fell in the pond）。and 連接兩個過去發生的動作；fell 是 fall 的過去式。",
    solutionSteps: ["主詞 shirts 被風帶走，所以前段用被動語態 were blown away。", "後續是衣服掉進池塘，主詞主動發生動作，使用 fell。", "用 and 連接兩個動作，選 B and fell；fallen 是過去分詞，不能單獨作此處的主要動詞。"],
    teacherTip: "fall－fell－fallen；句中已有完整的 were blown away，後面要用 and 連接另一個完整過去式 fell。",
    answerKeyReview: review(19, 3, "依衣服先被風吹走、再掉進池塘的動作順序及 fall 過去式核對 B。"),
  },
  "OFF-0936": {
    question: `${rexPassage}\n\nWhat happened to Rex?`,
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B, He got hurt（他受傷了）。文章明說 Rex 前一晚被車撞，之後住院兩週才逐漸好轉；這直接表示他受傷。",
    solutionSteps: ["定位關鍵句：Rex was in the hospital. He was hit by a car last night.（Rex 在醫院；昨晚被車撞了。）", "被車撞並住院表示他受傷，後文說兩週後才好轉也再次確認。", "所以選 B He got hurt；文章沒有說他走失、咬人或吃太多。"],
    teacherTip: "hurt＝injure（受傷）；got hurt 是 get＋形容詞／過去分詞表示狀態改變。看閱讀題要用原文證據，而不是只猜最常見的狗狗狀況。",
    answerKeyReview: review(20, 4, "將第20–21題共用 Rex 閱讀全文嵌入題目；依被車撞、住院的原文證據核對 B。"),
  },
};

for (const [id, patch] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 English Q11–20 against original question pages.");
