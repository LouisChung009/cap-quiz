import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const workReport = "【Reading material: Modern Workplace report】Long working hours are a serious problem and kill many people each year. Companies try to change this with at least one ‘No Overtime Day’ each week, often Wednesday. Workers are asked to leave before 8 p.m.; at 8 p.m. the song ‘There’s Always Tomorrow’ plays and the lights are turned off. However, some workers return later, turn on their desk lamps, and continue working; others work elsewhere until late, making restaurants and coffee shops busy. A study says people who work longer hours often have a better chance of getting paid more and promoted, for both men and women. Long hours have become a way to show that people are hard-working. ‘Clearly, this must be changed before the problem gets any worse.’\n\n【Figure 1 data】People killed because of long working hours: 2011—187; 2012—216; 2013—194; 2014—220; 2015—189.\n\n【Figure 2 data】The graph compares men and women’s chance of getting paid more and promoted with annual working hours. The solid line represents women and the dashed line represents men. At 2,200 hours, women’s rate is approximately 13% and men’s approximately 12%, so they are nearly the same.";
const cameroonArticle = "【Reading material: ‘Language and Power: Cameroon’s Story’】In the modern world, speaking English is often a way to get power, but this is not true for English speakers in Cameroon. In 1919, Kamerun (the name of Cameroon at the time) was divided into two parts: one belonged to France and the other to the UK. In 1960, French Cameroon became the Republic of Cameroon, and the UK’s part joined it in 1961. The new country was called the Federal Republic of Cameroon. French and English are both official languages, but only about 20% of the people speak English; the government has been in French speakers’ hands since the two parts became one country.\n\nFor a long time, English speakers have felt unwelcome. It is difficult for them to get government jobs, and they are often asked to speak French in business and at official events. They have become more resentful of the government and decided to fight for themselves. Since last year, they have tried to build their own country. At a public meeting, they said they were no longer part of Cameroon and called their new country ‘Ambazonia.’ When police tried to stop the meeting, at least eight people were killed.";

const updates = {
  "OFF-0304": {
    question: `${workReport}\n\nThere are four important points in the report: a. What “No Overtime Day” is; b. Why “No Overtime Day” fails; c. Why there is “No Overtime Day” in the country; d. How workers deal with “No Overtime Day”. How are they ordered in the report?`,
    explanation: "答案是 D（c→a→d→b）。第一段先以長工時造成死亡的問題交代設置 No Overtime Day 的背景（c），再說明每週的制度（a）。第二段寫員工離開後仍回辦公室或換地方工作（d）；第三段先以 ‘But why do these people keep working?’ 引出加薪升遷研究，再指出長工時被當成勤奮象徵、並主張改變這種觀念，對應 b。 Answer: D.",
    solutionSteps: ["第一段先提出長工時造成傷亡，接著說公司因此推動 No Overtime Day，對應 c，再介紹每週的安排，對應 a。", "第二段描述員工如何應對這一天：離開後再回去開桌燈工作，或到餐廳、咖啡店繼續工作，對應 d。", "第三段先問員工為何仍工作，再談加薪升遷誘因及「長工時代表勤奮」的觀念，並提出應改變它，對應 b；順序為 c→a→d→b，選 D。"],
    teacherTip: "篇章排序先看每段功能：問題／原因、制度介紹、行動、後果或解釋。",
    relatedWords: ["overtime（加班）", "deal with（處理／應對）", "order（順序）"]
  },
  "OFF-0305": {
    question: `${workReport}\n\nIn the report, what does the word “this” in the sentence “Clearly, this must be changed before the problem gets any worse” refer to?`,
    explanation: "答案是 A「The way workers show they are hard-working（員工藉以表現勤奮的方式）」。原文寫道 ‘Working long hours has become a way to show that people are hard-working. Clearly, this must be changed before the problem gets any worse.’ 其中 this 回指把長工時當成勤奮證明的風氣。 Answer: A.",
    solutionSteps: ["定位原句：‘Working long hours has become a way to show that people are hard-working. Clearly, this must be changed before the problem gets any worse.’", "this 緊接在前述觀點之後，回指把長工時當成勤奮表現的風氣。", "因此選 A；它不是指餐廳營業時間、員工是否回家或升遷人數。"],
    teacherTip: "代名詞 this 常回指前一句的概念或整件事；先讀前後句再判斷。",
    relatedWords: ["refer to（指涉）", "hard-working（勤奮的）", "working hours（工時）"]
  },
  "OFF-0306": {
    question: `${workReport}\n\nWhat can we learn from Figure 1 and Figure 2?`,
    explanation: "答案是 D：年工作 2,200 小時時，女性獲得加薪或升遷的機率約 13%，男性約 12%，兩者相近。圖一死亡人數在 2011–2015 年間有升有降，因此不能說每年都增加。 Answer: D.",
    solutionSteps: ["先核對圖一：2011 至 2015 年數值為 187、216、194、220、189，呈現波動，不是逐年上升。", "再讀圖二圖例：實線代表女性、虛線代表男性；在 2,200 小時處，女性約 13%、男性約 12%，相差不大。", "所以 D 正確。圖表沒有按性別拆分死亡人數，也不支持 A 或 C。"],
    teacherTip: "讀折線圖要對準同一個 x 軸位置比較；近似圖值應使用「約」「接近」，不可寫成精確相等。",
    relatedWords: ["figure（圖表）", "percentage（百分比）", "approximately（大約）"]
  },
  "OFF-0307": {
    question: `${cameroonArticle}\n\nWhich map is most likely the map of Cameroon in 1962?`,
    explanation: "答案是 D。英屬喀麥隆在 1961 年加入法屬喀麥隆，形成新的 Federal Republic of Cameroon；因此 1962 年應是已合併、稱為聯邦共和國的地圖 D。地圖圖示保留供判讀。 Answer: D.",
    solutionSteps: ["先整理年代：1919 年分成法屬與英屬兩部分；1960 年法屬喀麥隆獨立。", "英屬部分於 1961 年加入，合併後稱 Federal Republic of Cameroon。", "1962 年應是兩部分已合併的聯邦共和國，對應地圖 D；B、C 仍顯示分治狀態。"],
    teacherTip: "歷史地圖題先按年份排列事件，再核對領土是否分治、合併及名稱變更。",
    relatedWords: ["belong to（屬於）", "join（加入／合併）", "federal republic（聯邦共和國）"],
    requiresImage: true,
    requiresContext: true,
    questionImages: ["./assets/official-exams/111-english-p12.webp"]
  },
  "OFF-0308": {
    question: `${cameroonArticle}\n\nWhat does “resentful” mean in the reading?`,
    explanation: "答案是 B「Angry（生氣的／憤懣的）」。文章說英語使用者長期感到不受歡迎、難以取得政府工作，且在商業與官方場合常被要求說法語；在這些不公平經驗之後，他們對政府變得 resentful，表示不滿與憤懣。 Answer: B.",
    solutionSteps: ["看 resentful 前後文：英語使用者感到不受歡迎、難找政府工作，並被要求在正式場合說法語。", "這些長期不滿使他們對政府產生強烈不悅，resentful 最接近 angry。", "選 B；sad 是悲傷、careful 是小心、worried 是擔心，都不如 angry 符合語境。"],
    teacherTip: "生字題用上下文中的原因和後續行動推情緒，不要只靠字形猜測。",
    relatedWords: ["resentful（憤懣的）", "unwelcome（不受歡迎的）", "angry（生氣的）"]
  },
  "OFF-0309": {
    question: `${cameroonArticle}\n\nWhat does Cameroon’s government most likely think of Ambazonia?`,
    explanation: "答案是 D「It does not agree that Ambazonia is a country（不認為 Ambazonia 是一個國家）」。文章說英語使用者自行宣布脫離並稱新國家為 Ambazonia，警方則試圖阻止集會。這顯示當局至少反對該分離行動；就題目提供的選項而言，D 是最接近的推論，但原文沒有直接陳述政府對其國家地位的正式承認。 Answer: D.",
    solutionSteps: ["文章說英語使用者在集會上自行宣布不再屬於喀麥隆，並把新國家命名為 Ambazonia。", "警方試圖阻止集會，支持「當局反對這項分離行動」的推論；但文章沒有直接交代正式承認政策。", "在四個選項中，D 最接近這項推論，故選 D；用 most likely 的語氣，不把間接線索說成官方明文立場。"],
    teacherTip: "推論政府立場時用文章中的行動作線索，並以 ‘most likely’ 保留推論語氣。",
    relatedWords: ["agree（同意／認可）", "government（政府）", "country（國家）"]
  },
  "OFF-0310": {
    question: `${cameroonArticle}\n\nWhat does Elisa Grant try to tell readers by talking about the history of Cameroon?`,
    explanation: "答案是 B「Why English speakers in Cameroon have less power（為何喀麥隆英語使用者權力較少）」。文章先交代法、英殖民分治與後來合併，再指出英語人口約占兩成、政府長期由法語使用者掌握，並描述英語使用者面臨的工作與語言處境；這些歷史脈絡用來解釋權力不平等。 Answer: B.",
    solutionSteps: ["首段提出核心問題：為何在喀麥隆，英語使用者沒有因英語而取得更多權力。", "後文回顧殖民分治、合併及政府由法語使用者掌握，並描述英語使用者的處境。", "因此作者談歷史是為解釋英語使用者權力較少的原因，選 B；其他選項只抓到局部資訊。"],
    teacherTip: "作者目的題要把全文歷史細節連回首段提出的核心問題。",
    relatedWords: ["power（權力）", "history（歷史）", "official language（官方語言）"]
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
