import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const tips = [
  "先看圖片中葡萄盛裝的容器，再分辨 basket（籃子）、bag（袋子）、bowl（碗）和 box（盒子）；不要只靠 a ... of 的句型選答案。",
  "enjoy 後面接動名詞 V-ing；再用 beautiful voice 判斷活動內容是 singing，而不是只檢查文法就停。",
  "對聽力不好的人說話，應提高音量；shout 是大聲說，listen 卻是聆聽，留意動作方向和說話對象。",
  "watch + 受詞 + V-ing 強調看到動作正在發生；不要把它和 watch + 受詞 + 原形的完整動作混為一談。",
  "white pair 是顏色線索；比較同款鞋時要分清 colors、sizes、shapes 和 prices。",
  "at the time 指地震發生時正在進行的背景動作；搭配過去事件時檢查過去進行式 was/were + V-ing。",
  "think about 後接名詞或 V-ing；changing his job 是考慮轉職，先確認片語結構再看搭配意思。",
  "All the seats were taken 和有人站著都指向車廂已滿；不要被 dirty、fast 等單一形容詞帶偏。",
  "祈使句後接 or 可表示「否則」及可能後果；辨清警告語意，不要誤選表示結果的 so。",
  "後句的 reason 是解題線索：間接問句問原因用 why，語序維持主詞在動詞前。",
  "a headache 可比喻令人頭痛的麻煩人物或事情；辨認轉義，不要只按 headache 的字面症狀理解。",
  "this weekend 與 by Friday 顯示已安排的近期行程；現在進行式也能表達確定的未來計畫。",
  "since 子句描述耳朵在過去被咬的事件；耳朵是受詞且為複數，需用 were + bitten。",
  "第一類條件句用 If + 現在式，主句以 will + 原形表示可能的未來結果；there be 的未來式是 there will be。",
  "抱怨寄信後沒有回覆，談的是商店對顧客的 service；不要把商品、價格或公司本身當成服務品質。",
  "less possible 表示可能性更低；less difficult 反而是「沒那麼困難」，比較級否定詞會改變意思方向。",
  "找了數月而且『現在找到了』，結果語氣對應 finally（終於）；不要選 still（仍然）或 almost（幾乎）。",
  "make things worse 是固定搭配，表示讓既有壞情況惡化；不要把 more boring 當成任何負面情境都可用。",
  "the one who 指『那個曾做某事的人』；who 引導修飾人的關係子句，不能把 who 單獨放在 be 動詞後。",
  "before I went 和 gave it up 都把經歷放在已結束的過去；本題敘述一段過去時期，應用 practiced。",
  "so good ... that ... 表示程度造成結果；預期某人會得獎用 expect + 子句，不是 plan（計畫）。",
  "that just came out 與拯救生命的結果連到現在；單數主詞 medicine 搭配現在完成式 has saved。",
  "Now I often think of those days 表示回望已結束的往事；used to 描述過去反覆發生、現在不再如此的習慣。",
  "先逐項加總餐點原價，再只扣除星星可兌換的一杯飲料；優惠不能重複套用到整筆帳單。",
  "查日曆題要同時核對日期是星期幾、餐廳營業時段及休息日；只符合時間不代表當天有營業。",
  "幼鳥求助流程要先看是否受傷及羽毛狀態；即使要送醫也不可先餵食，別把照護常識想當然。",
  "題目問人類氣味時先辨識筆記中的 WRONG! 更正標記；常見迷思不等於作者支持的事實。",
  "把浪費原因放回供應鏈階段定位；On the road 指運輸途中，不能把農場、工廠與商店的原因混在一起。",
  "比較跨區百分比時固定同一 Stage，再讀三個地區數值；不要把某區某階段最高誤當成全區趨勢。",
  "蚊子逃雨滴的步驟有先後：受撞、隨雨滴下落、滾離、飛走；答案若漏掉脫離雨滴就不完整。",
  "蚊子不易被雨滴撞死的原因是質量極小、承受力有限；體毛在文中是防水線索，不是抗撞原因。",
  "危險情境由 if flies too low 指出；地面太近使蚊子沒有足夠距離滾離雨滴，勿把雨勢大小自行加成條件。",
  "三個 Elise 故事都是『作品獻給誰』的不同猜測；題目問共同主題時，不要把任一猜測當成已證實的真相。",
  "手稿於 1867 年被發現是文中明確事實；『誰是 Elise』仍無定論，分清可知事實與作者保留的猜測。",
  "三位女性的經歷不可互換：Röckel 是 Beethoven 的朋友，Malfatti 是其愛慕對象，Barensfeld 是 Malfatti 的學生。"
];

for (let number = 1; number <= tips.length; number += 1) {
  const row = questions.find(question => question.subject === "英文" && question.source?.year === 112 && question.source.questionNumber === number);
  if (!row || row.answerKeyReview?.status !== "verified" || row.options?.length !== 4 || row.solutionSteps?.length < 2) throw new Error(`112 English Q${number} is missing a required source, option, or solution field`);
  row.teacherTip = tips[number - 1];
}

const audited = questions.filter(question => question.subject === "英文" && question.source?.year === 112);
if (audited.length !== 43 || new Set(audited.map(question => question.teacherTip.trim())).size !== 43) throw new Error("112 English teacher tips are incomplete or duplicated");
await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Replaced the generic 112 English Q1–35 tips with question-specific guidance; verified all 43 tips are unique.");
