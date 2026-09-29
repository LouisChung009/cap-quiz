import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const reading = `【閱讀材料】Teachers’ Day
On Teachers’ Day, we thank our teachers for their hard work. We also celebrate this day to remember Confucius, the great Chinese teacher from 2,500 years ago. Well, that’s everything we’re taught about Teachers’ Day. But the first Teachers’ Day was not on Confucius’s birthday, and it was not about thanking our teachers.

In 1930, Mr. Tai Shuang-qiu and other teachers celebrated the first Teachers’ Day in Nanjing. But there was nothing to celebrate. Teachers were paid very little and not respected. These teachers took this chance to shout out their problems. They had Teachers’ Day on June 6 because the date was easy to remember and near the end of the school year. This action by Mr. Tai and the other teachers was welcomed and followed by teachers from other cities. In 1939, the government made Teachers’ Day a national holiday. However, it was on August 27, the day when Confucius’s birthday was celebrated. Not everyone hailed this decision: Teachers’ Day was never about Confucius, and Confucius couldn’t speak for all teachers either.

One funny thing was that the government was wrong about the date of Confucius’s birthday. In 1952, people found out that he was in fact born on September 28. That was when we started to celebrate Teachers’ Day on Confucius’s real birthday.`;

const fixes = {
  "OFF-0073": {
    question: `${reading}\n\nWhat idea is talked about in the reading?`,
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0074": {
    question: `${reading}\n\nWhich is true about Teachers’ Day from the reading?`,
    explanation: "答案 A「It used to be celebrated on different dates.」。文中列出 1930 年最初定在 6 月 6 日、1939 年政府將教師節定為國定假日並訂在 8 月 27 日，1952 年確認孔子生日是 9 月 28 日後，才改在 9 月 28 日慶祝，證明日期曾多次不同。B 錯在發起者是教師而非學生；C 把兩千五百年的孔子歷史誤當成南京慶祝教師節的年數；D 錯在 1930 年的教師節原本不是孔子生日。",
    solutionSteps: ["先按年代整理三個日期：1930 年 6 月 6 日、1939 年 8 月 27 日、1952 年確認後的 9 月 28 日。", "這些日期代表教師節先後採用過不同日期，因此 A 正確。", "B 的發起者是教師；C 混淆孔子距今約兩千五百年與教師節在南京的歷史；D 與首段明說最初並非孔子生日相反。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0075": {
    question: `${reading}\n\nWhat does “not everyone hailed this decision” mean in the reading?`,
    explanation: "答案 B「Not everyone welcomed the decision.」此處 hailed 是「歡迎、喝采」的意思。前文說政府把教師節定在孔子生日，但有些教師反對，因為教師節原本不是紀念孔子，而且孔子不能代表所有教師；因此不是每個人都歡迎這項決定。A 的 cared 是在不在意，C 的 heard 是有沒有聽說，D 的 remembered 是有沒有記得，都不是 hailed 在此處的意思。",
    solutionSteps: ["看 hailed 所在句：政府決定把教師節改在 8 月 27 日，冒號後接教師不認同的理由。", "因此 not everyone hailed this decision 表示不是每個人都歡迎／贊同這項決定，選 B。", "cared about 是在意、heard about 是聽說、remembered 是記得；都不等於以正面態度接受決定。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0076": {
    question: `${reading}\n\nWhat does the writer try to do with this reading?`,
    explanation: "答案 C「To tell a piece of history that few people know about.」。作者先提一般人以為教師節是感謝教師、紀念孔子，隨即說明這只是常見印象，接著追溯 1930 年南京教師因待遇低、缺乏尊重而發起教師節，並交代日期如何由 6 月 6 日改到 8 月 27 日，再到 9 月 28 日。文章主要是在介紹教師節的歷史與較少人知道的起源，不是在講趣事或抽象觀念。",
    solutionSteps: ["分辨文章的寫作目的，不只看單一細節；全文以教師節的起源及日期沿革為主線。", "1930 年教師因低薪、未受尊重而發起教師節，後續段落再交代政府採用日期及孔子生日更正。", "這些內容是在介紹一段教師節歷史，故選 C；A、B、D 均不能概括全文主要內容。"],
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
}

for (const id of Object.keys(fixes)) {
  const question = questions.find((item) => item.id === id);
  if (question.requiresContext || question.requiresImage || !question.question.includes("【閱讀材料】Teachers’ Day")) {
    throw new Error(`Incomplete embedded reading for ${id}`);
  }
  delete question.questionImage;
  delete question.questionImages;
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Embedded the complete Teachers’ Day passage and repaired explanations for OFF-0073–0076.");
