import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const reading = `【閱讀材料】Darayya’s Library — John Edwards, July 21, 2016
In Darayya, a city in Syria, there’s a library, and it has 15,000 books on almost every subject you can think of. However, it is different from any libraries you know: It is a secret underground library, and only people in Darayya know where it is.

Over the years, war has shaken Darayya badly. Every day, houses are bombed and people are killed. Stores are closed one after another, and so are schools. To help the kids in Darayya with their learning, Anas Ahmad, a 19-year-old student, and his friends decided to build a library. They built the library under the ground to keep it safe from bombing. But it is dangerous to collect books for the library. Often, Ahmad and his friends look for books in houses that were bombed. They need to be careful because they may be killed in another bombing.

You may ask, “In a place like Darayya, would people be interested in books?” “Just like the body needs food, the mind needs books,” says one library user. In the library, people enjoy their time of reading and forget about the terrible world above, so their life doesn’t seem so hard. Through reading, they are able to dream of a better life after war.`;

const fixes = {
  "OFF-0080": {
    question: `${reading}\n\nBelow are the ideas that are talked about in the reading.\na. The problems Darayya has.\nb. How Darayya’s library was started.\nc. What makes Darayya’s library special.\nd. How Darayya’s library helps people there.\nIn what order does the writer put his ideas in the reading?`,
    explanation: "答案 D「c → a → b → d」。文章先介紹圖書館與眾不同之處：藏有大量書籍、位於地下且只有當地人知道；接著說明戰爭造成的困境，再交代 Anas Ahmad 等人如何為孩子建立圖書館，最後描述閱讀帶來慰藉與對戰後生活的盼望。",
    solutionSteps: ["開頭先說圖書館的特色：地下、隱密且藏書豐富，對應 c。", "接著轉到戰爭轟炸、學校關閉等 Darayya 面臨的問題 a，再說學生因此決定建圖書館 b。", "最後談閱讀讓人暫忘戰爭、想像更好的未來 d，順序是 c-a-b-d，選 D。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0081": {
    question: `${reading}\n\nWhy do people in Darayya go to the library even during the war?`,
    explanation: "答案 B「They find joy and hope in reading.」文章指出讀者在圖書館享受閱讀、暫時忘記地面上可怕的戰爭，並能藉閱讀夢想戰後更好的生活。A 免費食物、C 學習如何打贏戰爭、D 教師在圖書館上課都沒有文章證據。",
    solutionSteps: ["找出文章最後一段對閱讀效果的說明：人們享受閱讀，暫忘外界戰爭。", "作者又說閱讀讓他們能夢想戰後更好的生活，這同時包含閱讀的樂趣與希望。", "因此選 B；文章沒有提到發放食物、學習作戰或教師授課。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0082": {
    question: `${reading}\n\nWhat do we know about Darayya’s library?`,
    explanation: "答案 A「It was built during the war.」文章先描述戰爭已使 Darayya 遭受轟炸、學校停課，接著說 Anas Ahmad 和朋友為幫助孩子學習而決定建圖書館，並把它建在地下以躲避轟炸。因此圖書館是在戰爭期間建立。B 把遭轟炸的是城中房屋誤套成圖書館；C 文中沒有說建館是為紀念死者；D 館藏書籍是從當地被炸房屋中尋找，不是大多由外地收集。",
    solutionSteps: ["把事件順序連起來：戰爭轟炸 Darayya、學校關閉，學生為了孩子學習才決定建館。", "他們把圖書館建在地下來防轟炸，說明建館發生在戰爭期間，選 A。", "文章說被炸的是房屋，不是圖書館；沒有紀念死者的目的，找書地點也在當地被炸房屋，因此 B、C、D 均不符。"],
    requiresContext: false,
    requiresImage: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  if (!question || question.source?.year !== 110 || question.source?.questionNumber !== Number(id.slice(-2)) - 48) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  delete question.questionImage;
  delete question.questionImages;
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Embedded the complete Darayya’s Library passage; repaired OFF-0080–0082 explanations.");
