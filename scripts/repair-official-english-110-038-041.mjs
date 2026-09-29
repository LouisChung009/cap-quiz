import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const reading = `【閱讀材料】A rainy night in the park
Usually I wouldn’t cross the park at this time of night. But walking around the park would take more time, and it was raining so hard that I couldn’t even see clearly what was right before me. So I entered the park. And that was the first stupid thing I did tonight.

Soon after I walked into the park, I saw a man under a tree up ahead. My heart fell. The stories I’d heard about the park ____ (38) ____ into my head at this moment. Anyone with a clear mind would just turn back. But me? No. I did ____ (39) ____ stupid thing: I decided to hurry past him.

Just when I was passing the man, he raised his head and gave me the strangest smile ever. I got scared and started running. “Hey!” the man shouted from behind. “Wait!” He was running after me!

I ran like crazy. I had hoped the trees would keep some rain off. And they ____ (40) ____. But they also made the park look even darker. I couldn’t see what was ahead of me. Then, I ran into something. It was the man!

“Don’t kill me!” I cried.

“What? I ____ (41) ____ to give back your bag! You dropped it,” the man gave me my bag.

Now, I felt saying that to the man was the stupidest thing I did tonight.

【詞語】ahead：在前面；in front of。`;

const fixes = {
  "OFF-0086": {
    question: `${reading}\n\nChoose the best answer for blank (38).`,
    explanation: "答案 C「were all coming」。故事用過去時間敘述，at this moment 指當時那一刻；作者聽過的各種公園傳聞正在湧入腦海，使用過去進行式 were coming。A 現在進行式連到現在，B 現在完成式不表示當時正在發生，D 過去將來式也不合此處的即時描寫。",
    solutionSteps: ["時間錨點是 at this moment，指故事中作者走進公園的那個過去時刻。", "stories 是複數主詞，描寫傳聞當時正湧入腦海，用 were + coming；all 放在助動詞與主要動詞間。", "因此選 were all coming；are 是現在時，have come 表已來到，would come 表假設或過去未來，均不符合當下進行的畫面。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0087": {
    question: `${reading}\n\nChoose the best answer for blank (39).`,
    explanation: "答案 A「another」。作者先說進入公園是當晚第一件愚蠢的事，接著又決定匆忙從陌生男子身旁經過，這是另一件愚蠢的事；another + 單數可數名詞符合句型，也明確表達「又一件」。one stupid thing 文法上可以成立，但只表示「一件蠢事」，沒有 another 所帶出的「再犯一件」語意；the last 是最後一件，the other 通常指兩者中的另一個，均不合上下文。",
    solutionSteps: ["前文明說進入公園是 first stupid thing，先建立第一件蠢事。", "接著作者又匆忙從陌生男子身旁經過，因此要表達『又一件』，another stupid thing 最貼合上下文。", "one stupid thing 文法成立，但沒有『再一件』的語意；the last 表最後一件，the other 通常指兩者中另一個，也不符合這裡的敘事。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0088": {
    question: `${reading}\n\nChoose the best answer for blank (40).`,
    explanation: "答案 B「did」。前句作者希望樹木能替他擋掉一些雨；And they did 是用助動詞 did 代替前面已出現的 keep some rain off，意為「樹確實有擋掉一些雨」。故事敘述過去，因此用 did。have、had、would 都不能在此自然地代替前述過去式動作。",
    solutionSteps: ["先找 they 指誰：前句的 trees（樹木）。", "比較前後兩句：作者希望樹能擋雨，And they ___ 表示樹確實做到；did 代替前面的 keep some rain off，避免重複整個動詞片語。", "敘事時間在過去，因此用過去式助動詞 did；have/had/would 與此處的時態和替代結構不合。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0089": {
    question: `${reading}\n\nChoose the best answer for blank (41).`,
    explanation: "答案 A「was trying」。男子追上作者時正在做的事，是把掉落的背包還給他；was trying to give back 描述過去某一刻正在進行的動作，後面的 You dropped it 說明原因。try 是原形、would try 是過去觀點下的未來或意願、will try 是未來式，都不符合當時正在進行的情境。",
    solutionSteps: ["把對話放回情境：男子追著作者喊 Wait，追上後解釋自己不是要傷害他。", "男子當時正在嘗試把作者掉的背包還回去；以過去進行式 was trying 描寫那一刻進行中的動作。", "主詞 I 配 was；try 原形缺少時態，would try/will try 分別偏向意願或未來，均非此處的即時解釋。"],
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
console.log("Restored the rainy-park passage and item-specific explanations for OFF-0086–0089.");
