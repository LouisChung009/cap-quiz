import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const card = "【Advertisement】Buy a White Lake City Card. Any card allows unlimited metro, bus, or train trips inside its zones, one child under 12 travels free, and public museum tickets are 20% off. 1-, 3-, and 5-day cards are for Monday–Friday; Weekend cards are for weekends and holidays. Prices (Zone 1 / Zones 1–2 / Zones 1–3): 1-day $20/$40/$60; 3-day $40/$60/$80; 5-day $50/$80/$110; Weekend $30/$50/$80. White Lake Main Station and the Museum of White Lake City History are in Zone 1; White Lake is in Zone 2.";
const easter = "【Reading material】Around the year 400, people came to Easter Island, where there were many trees. They used trees to make fire and build houses. They also made large statues and moved them with wood. Trees were needed in every part of their lives. Years passed, and there were fewer and fewer trees. Without enough trees to keep water under the ground, the land became dry and plants did not grow. People began to fight for water and food. The statues were moved to fighting grounds to show their power. The last trees were probably cut down at this time. Those who cut down the last trees surely understood how important trees were—but still, they did it. When the last trees fell to the ground, people on the island fell, too. The final panel warns: ‘Let's not make Earth, our only home, another Easter Island.’";
const ikea = "【Reading material】Many years ago, Dan Ariely bought a cabinet from IKEA, a furniture store that sells boxes of furniture parts. Buyers must put all the parts together themselves. It took Ariely hours to build his cabinet. He did not enjoy assembling it, but after finishing he felt good about himself and his cabinet, and later loved it more than his other furniture. To find out if others shared this feeling, Ariely invited two groups to an origami study: ‘builders’ made origami, while ‘buyers’ looked at it. Buyers said they would pay only five cents for the builders' origami, while builders thought their work was worth 25 cents. Ariely called this the IKEA effect: people sometimes value things more when they make them themselves.";
const electricity = "The picture shows a UK electricity worker in the 1970s. In 1972, electricity workers asked for higher pay and stopped working until their request was answered. The government feared there would not be enough electricity, so it agreed to a pay rise. A year later the workers asked for another rise, worked shorter hours, and acted as if they might leave their jobs. This time the government fought back with rules to save electricity: families could heat only one room, TV stations stopped at 10:30 p.m., and businesses opened only three days a week. Without enough heat, people used blankets; hospitals used candles; factories could not run machines, and many people lost their jobs. After months, the government agreed to a second pay rise. The picture reflects what many people thought of the workers during this ‘dark’ time.";
const cameron = "Most kids want gifts from their parents on their birthdays, but Cameron doesn't. On his birthday, he gives his mom a gift. He started doing this in his first year of junior high school. That year, during class, he watched a video about how a baby is pushed from its mother's body. After class, he was amazed by how brave a woman must be to have a baby and thought, ‘Thank God I'll never have to do that!’ When Cameron came home that day, he held his mom in his arms for a long time. He decided that his birthday should not be about him, but about his mom. During those nine months inside his mom, he ate and slept while his mom did all the hard work. The birthday gift Cameron prepared was a bag of cookies he baked. They tasted bad, but his mom said they were the best thing she ever got. Hearing that made his heart sing. Now, on his birthday every year, Cameron makes a gift for his mother to thank her for giving him life. This year, Cameron is going to give his mom a nice dress. A few months ago, he learned to make dresses at school and decided to make one for his mom.";
const review = (number, page, note) => ({ status: `已依114年官方英文科題本第${number}題核對`, note, evidenceSources: [`./assets/official-exams/114-english-p${page}.webp`] });
const patch = (number, data) => {
  const row = rows.find(item => item.subject === "英文" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114英文第${number}題`);
  Object.assign(row, data);
};
const englishText = (question, answer, explanation, steps, tip, number, page, relatedWords = []) => ({
  question, answer, explanation, solutionSteps: steps, teacherTip: tip,
  relatedWords: relatedWords.length ? relatedWords : ["關鍵字依上下文判讀", "注意選項同義改寫"],
  requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
  answerKeyReview: review(number, page, explanation),
});

patch(25, englishText(`${card}\n\nStacy is staying near White Lake Main Station (Zone 1). She wants to visit the Museum of White Lake City History on Friday and see White Lake on Saturday. Which card choices are best and cost the least?\n(A) A 3-day Card for Zone 1.\n(B) A Weekend Card for Zones 1–3.\n(C) A 1-day Card for Zone 1 and a Weekend Card for Zones 1–2.\n(D) A 1-day Card for Zones 1–2 and a Weekend Card for Zones 1–2.`, 2,
  "答案 C。地圖顯示車站與歷史博物館都在 Zone 1，White Lake 在 Zone 2。週五可買 Zone 1 平日一日卡 $20；週六買 Zones 1–2 週末卡 $50，總計 $70。",
  ["先按地圖定位：車站和歷史博物館在 Zone 1，White Lake 在 Zone 2。", "週五前往 Zone 1 的博物館，買 Zone 1 平日一日卡即可，價格 $20。", "週六從 Zone 1 前往 Zone 2 的 White Lake，買 Zones 1–2 週末卡 $50；總價 $20+$50=$70，選 C。D 多花 $20；A 日期不符且無法涵蓋週末，B 可行但需 $80。"],
  "逐項檢查日期、跨區範圍和票價，不能只選總價最低但無法抵達目的地的票。", 25, 5, ["weekday（平日）", "weekend（週末）", "zone（分區）"]));

patch(31, { ...englishText(`${easter}\n\nWhat does ‘did it’ in Picture 7 mean?`, 1,
  "答案是 B，cut down the last trees（砍掉最後的樹）。Picture 7 前句說有人砍掉最後的樹，did it 回指這個動作。",
  ["找代名詞 it 的先行內容：上一句是 those who cut down the last trees。", "did 代替前文重複的動詞片語 cut down the last trees。", "因此選 B；fall to the ground 是後句 trees fell 的結果，不是 did it 所代替的行為。"],
  "代動詞 do／did 會回指前文動作；要看相鄰句，不要只用同段出現的字猜。", 31, 8, ["cut down（砍伐）", "refer back to（回指）"]), requiresImage: true, requiresContext: true, questionImage: "./assets/official-exams/114-english-p8.webp", questionImages: ["./assets/official-exams/114-english-p7.webp", "./assets/official-exams/114-english-p8.webp"] });
patch(32, englishText(`${ikea}\n\nWhat did Ariely try to find out in the origami study?`, 3,
  "答案 D。文章明說 Ariely 想知道是否有人也有和他相同的 IKEA 感受；origami study 是用來檢驗這種感受。",
  ["定位研究目的句：Ariely wanted to know if anyone shared his feelings。", "shared his feelings 對應題目選項 shared his IKEA experience。", "選 D；研究不是要阻止 IKEA effect、探究人們為何愛摺紙或 IKEA 為何有名。"],
  "shared his feelings 是 shared his experience 的同義改寫，作答要對照研究目的句。", 32, 9, ["share an experience（有相同經驗）", "find out（查明）"]));
patch(33, englishText(`${ikea}\n\nWhich is true about the origami study?`, 0,
  "答案 A。買家只願意付 5 美分，摺紙製作者認為作品值 25 美分，所以買家對製作者作品的估價較低。",
  ["比較原文兩個價格：buyers 願付 5 cents；builders 認為作品值 25 cents。", "5 小於 25，因此買家估價低於製作者自己的估價。", "選 A；建作者與買家不必共同訂價，且文中沒有說買家看過製作過程後會出更高價。"],
  "比較數字時確認比較主體與方向；would pay five cents 對比 believed … cost that much money。", 33, 9, ["buyer（買家）", "builder（製作者）", "value（估價）"]));
patch(34, englishText("Jerry cannot get his daughter Mia to eat vegetables. If he wants to use the IKEA effect, what should he do?\n(A) Tell Mia he cooks vegetables just for her.\n(B) Ask Mia to help cook vegetables for her meal.\n(C) Give Mia candy after she eats vegetables.\n(D) Ask what vegetables she likes and cook them for her.", 1,
  "答案 B。IKEA effect 指人們往往更珍惜自己參與製作的東西；讓 Mia 一起料理蔬菜，最能讓她參與並提高對成果的認同。",
  ["先把文章中的原理轉用到情境：親手參與製作，會更珍惜成品。", "A 只是告知，C 是外在獎勵，D 是替她挑選並烹調，都沒有讓 Mia 親自製作。", "選 B，請 Mia 一起做蔬菜料理。"],
  "IKEA effect 的重點是投入勞力、參與製作，不是單純偏好、被告知或得到獎賞。", 34, 10, ["participate（參與）", "value（珍惜／重視）"]));

for (const n of [35, 36, 37]) {
  const q = rows.find(item => item.subject === "英文" && item.source?.year === 114 && item.source.questionNumber === n);
  const stem = q.question.split(/\n\n(?=(?:What|Why|In the UK)\b)/).at(-1);
  const answer = [2, 2, 2][n - 35];
  const specifics = {
    35: ["答案 C。文章從 1972 年電工爭取加薪、政府應對，到停電期間大眾承受的影響，說明這幅電工圖片背後的歷史。", ["首段交代電工要求加薪並罷工。", "後續說明政府採取節電措施及民眾生活、工廠和醫院受到的影響。", "結尾回扣圖片呈現當時大眾對電工的看法，主旨是圖片背後的歷史，選 C。"]],
    36: ["答案 C。電工第二次要求加薪、縮短工時並持續施壓，政府與民眾因此受影響；這使人們覺得他們要求太多、不知何時停止。", ["文章說電工再度要求加薪，縮短工時並表現得隨時會離職。", "接著政府限制用電，民眾生活受影響數月，顯示社會承受壓力。", "因此最可能的看法是要求太多且不知足，選 C；不是不勇敢、不適應改變或不關心健康。"]],
    37: ["答案 C。dark 同時指電力不足、燈光熄滅的黑暗時期，也象徵民眾生活困苦、失業的艱難處境。", ["找最後一句的引號：dark time 回顧電工罷工造成的整段時期。", "文中既寫停電、醫院用蠟燭，也寫民眾受寒、工廠停擺與失業。", "引號提示 dark 不只字面上沒有燈，也包含艱難生活的比喻，選 C。"]],
  };
  const [explanation, steps] = specifics[n];
  const image = "";
  if (n === 36) q.options = q.options.map(option => option.replace(" 【字彙】 likely 可能", ""));
  const teacherTips = {
    35: "主旨題要串起全文因果：罷工、節電措施與民眾受影響，共同交代圖片背後的歷史。",
    36: "推測群體觀感時要從文中後果推論；停電限制和失業是判斷工人形象的證據。",
    37: "引號常提示字詞有特殊或比喻義；此處 dark 同時指停電黑暗與艱困時期。"
  };
  Object.assign(q, { question: `【Reading material】${electricity}\n\n${stem}`, answer, explanation, solutionSteps: steps, teacherTip: teacherTips[n], relatedWords: ["pay rise（加薪）", "dark time（黑暗／艱困時期）", "strike（罷工）"], requiresImage: false, requiresContext: false, questionImages: [], questionImage: "", answerKeyReview: review(n, n === 35 ? 11 : 12, explanation) });
}
for (let n = 38; n <= 43; n++) {
  const q = rows.find(item => item.subject === "英文" && item.source?.year === 114 && item.source.questionNumber === n);
  const steps = {
    38: ["That year 指 Cameron 上 junior high 第一年的過去時間。", "敘述已完成的過去事件，用 start 的過去式 started。", "選 B；has started、starts 和 will start 都不符合明確過去時間。"],
    39: ["上文說 Cameron 看了生產影片；下文提到他回家抱住媽媽並反思她的辛勞。", "空格需要銜接他看完影片後腦中反覆思考的內容。", "選 C couldn’t stop thinking about two things，符合上下文。"],
    40: ["Cameron 認為生日禮物不該只給自己，因為母親承擔懷孕生產的辛勞。", "比較選項的核心：焦點應從 Cameron 轉向母親。", "選 C should not be about him, but about his mom。"],
    41: ["空格修飾 birthday gift，下一句說這份禮物是一袋他烤的餅乾。", "這是他第一次在生日為媽媽準備禮物的故事起點。", "選 A first；last、only、other 都不符合此處敘事。"],
    42: ["媽媽說餅乾是她收到過最好的東西，這句話讓 Cameron 感到非常開心。", "made his heart sing 是「令他欣喜」的習語。", "選 B；不是頭痛、改變想法或放棄烘焙。"],
    43: ["This year 與 hanging behind his bedroom door 表示他已決定並正在準備今年要送的洋裝。", "is going to＋原形動詞表示已計畫的未來行動。", "選 A is going to give；不是一般習慣、已完成或單純過去事件。"],
  }[n];
  const answer = q.answer;
  Object.assign(q, { question: `【Reading material】${cameron}\n\n${q.options.length === 4 ? `Choose the correct answer for question ${n}.` : q.question}`, explanation: `答案 ${String.fromCharCode(65 + answer)}。${steps.join(" ")}`, solutionSteps: steps, teacherTip: q.teacherTip, relatedWords: ["birthday（生日）", "gift（禮物）", "上下文線索"], requiresImage: false, requiresContext: false, questionImages: [], questionImage: "", answerKeyReview: review(n, 13, "依完整 Cameron 題組上下文核對答案。") });
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Restored complete source contexts and teacher explanations for official 114 English Q25 and Q31–43.");
