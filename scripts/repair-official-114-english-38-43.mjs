import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const passage = "Most kids want gifts from their parents on their birthdays, but Cameron doesn't. On his birthday, he gives his mom a gift. He ____ doing this in his first year of junior high school. That year, during class, he watched a video about how a baby is pushed from its mother's body. After class, ____. How brave a woman is to have a baby! Thank God I'll never have to do that! When Cameron came home that day, he held his mom in his arms for a long time. He decided that his birthday ____. During those nine months inside his mom, he just ate and slept while his mom was doing all the hard work. So why should he get a birthday gift for doing nothing? If anyone should get a gift on his birthday, it should be his mom. The ____ ‘birthday gift’ Cameron prepared was a bag of cookies he baked. The cookies tasted so bad, but his mom said they were the best thing she ever got. Hearing that ____. It was so much better than getting a gift. Now, on his birthday every year, Cameron makes a gift for his mother to thank her for giving him life. This year, Cameron ____ his mom a nice dress. A few months ago, he learned to make dresses at school and decided to make one for his mom. Now the dress is finished and hanging behind Cameron's bedroom door. He believes the gift will tell his mother how much he loves her.";
const fixes = new Map([
  ["OFF-0954", { stem: "He ____ doing this in his first year of junior high school.", explanation: "答案 B（started）。‘in his first year of junior high school’指過去一段已完成的時間，因此用一般過去式 started。starts 是現在式，has started 不與明確過去時間搭配，will start 則是未來式。", steps: ["找時間線索：first year of junior high school 指 Cameron 已經歷過的過去。", "描述過去開始做這件事，用 start 的過去式 started。", "選 B；現在式、現在完成式和未來式都不符合這個明確的過去時間。"], tip: "易錯：現在完成式通常不與明確的過去時間（如 in 2020、last year）連用。" }],
  ["OFF-0955", { stem: "After class, ____. How brave a woman is to have a baby! Thank God I'll never have to do that!", explanation: "答案 C。後面兩句呈現 Cameron 看完生產影片後反覆想到的兩件事：女性生產很勇敢，以及慶幸自己不用經歷生產。couldn't stop thinking about 表示「一直想著、忘不了」，能自然銜接後文。", steps: ["觀察空格後的兩個想法：佩服女性生產的勇敢，以及慶幸自己不用生孩子。", "這表示 Cameron 看完影片後一直想著兩件事，而非害怕、無法理解或已做出兩件改變人生的事。", "選 C couldn't stop thinking about two things。"], tip: "近義表達：keep thinking about、can't get something out of one's mind；不要把 think about 誤解成「做了某件事」。" }],
  ["OFF-0956", { stem: "He decided that his birthday ____.", explanation: "答案 C。下文說明他認為生日不該只為自己慶祝；若有人該在生日收到禮物，那應該是媽媽。", steps: ["先讀空格後的理由：媽媽承受懷孕的辛勞，而 Cameron 只是吃、睡。", "因此生日的主角應從 Cameron 轉為媽媽。", "選 C should not be about him, but about his mom。"], tip: "易混：be about someone 表示「以某人為主角／焦點」，不是「替某人做某事」。" }],
  ["OFF-0957", { stem: "The ____ ‘birthday gift’ Cameron prepared was a bag of cookies he baked.", explanation: "答案 A（first）。前文指出 Cameron 從國中一年級開始在生日送媽媽禮物，這裡回述故事中的第一份生日禮物。", steps: ["把空格句連回前文：這是 Cameron 開始生日送媽媽禮物的回憶。", "餅乾是故事裡描述的第一份生日禮物，因此用 first。", "last、only、other 都不符合前後文的時間順序與語意。"], tip: "易錯：first 是序數詞，說明先後次序；不要因為只描述一個禮物就選 only。" }],
  ["OFF-0958", { stem: "Hearing that ____.", explanation: "答案 B（made his heart sing）。媽媽稱讚餅乾是她收過最棒的東西，讓 Cameron 非常開心。make one's heart sing 是「使某人欣喜」的比喻。", steps: ["that 指媽媽說餅乾是她收到過最棒的東西。", "這句話帶給 Cameron 喜悅，因此選 made his heart sing。", "這個片語近似 made him very happy／delighted，不是字面上的唱歌。"], tip: "近義詞：delighted、overjoyed、pleased；易錯：heart sing 是比喻，不是實際唱歌。" }],
  ["OFF-0959", { stem: "This year, Cameron ____ his mom a nice dress.", explanation: "答案 A（is going to give）。本文說洋裝已完成並掛在房門後，這是 Cameron 為今年生日預先安排的未來行動。", steps: ["This year 指今年的安排；後文說洋裝已完成，顯示送禮計畫已確定。", "be going to＋原形動詞可表達已有計畫的未來行動。", "因此選 is going to give。"], tip: "易錯：is going to give 表計畫中的未來；gives 是習慣，gave 是過去，has given 是已完成。" }]
]);

for (const [id, fix] of fixes) {
  const row = rows.find((item) => item.id === id);
  if (!row) throw new Error(`Missing question ${id}`);
  row.question = `【閱讀材料】${passage}\n\n${fix.stem}`;
  row.explanation = fix.explanation;
  row.solutionSteps = fix.steps;
  row.teacherTip = fix.tip;
  row.requiresImage = false;
  row.requiresContext = true;
  row.questionImage = "";
  row.questionImages = [];
  row.imageAlt = "";
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Restored source passages and question blanks for ${fixes.size} English items.`);
