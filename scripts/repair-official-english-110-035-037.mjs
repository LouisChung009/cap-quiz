import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const email = `【閱讀材料】From: Mia Loren <mloren@qmail.com>\nTo: Dave Doddo <dd1225@qmail.com>\nDate: Tue, Oct 24, 2017 at 10:01 AM\nSubject: Daniel’s 5th Birthday Party – This Saturday!\n\nHello Dave,\n\nWe’re happy to invite you and your family to Daniel’s fifth birthday party this Saturday.\n\nWe know we told you that the party would be in ____ (35) ____. However, we just moved to Carlton City last month, so the party won’t be in Pattersons Town. It’ll be at Mosman Garden right next to Victor Zoo, just across from our new apartment. Please don’t go to Northbank Park next to our old house.\n\nThe weather report said that it may be rainy this weekend, but ____ (36) ____. If it rains, we’ll move the party inside our home. However, if we’re ____ (37) ____ and it is fine, we’ll still have the party at the garden.\n\nAgain, we’re all very happy and excited to welcome you to join us for some fun this weekend!\n\nBest,\nMia, Sam & Daniel`;

const fixes = {
  "OFF-0083": {
    question: `${email}\n\n請選出最適合填入文章中標示 (35) 空格的選項。`,
    explanation: "答案 D「Northbank Park」。Mia 說以前曾告訴 Dave 派對會在某處舉行，接著說他們搬家後，派對不會在 Pattersons Town；實際改到新公寓旁的 Mosman Garden，並特別提醒不要再去舊家旁的 Northbank Park。這表示原先告知的舊地點是 Northbank Park。",
    solutionSteps: ["由後文看地點變化：搬到 Carlton City 後，派對改在新住處旁的 Mosman Garden。", "作者又特別提醒『不要去我們舊家旁的 Northbank Park』，指出這是原本容易去錯的舊地點。", "因此空格填 D「Northbank Park」；A 是新地點附近的動物園，B 是搬去的新城市，C 是現在的派對地點。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0084": {
    question: `${email}\n\n請選出最適合填入文章中標示 (36) 空格的選項。`,
    explanation: "答案 A「we have a plan if this happens」。前句說週末可能下雨，下一句立刻說若下雨就把派對移到家裡，這正是預先準備好的應變計畫，因此用 A 承接最自然。B 只說等雨停，與下一句的室內備案不一致；C 說雨不大就沒事，與後句條件無關；D 說會再通知是否舉辦，但文中已明確交代下雨時的安排。",
    solutionSteps: ["先讀空格前後：天氣預報可能下雨，後句明確說下雨就把派對移到家裡。", "這句室內安排就是對下雨的預案，所以前面應說『若發生這種情況，我們有計畫』，選 A。", "B、C、D 分別與後文的直接搬到室內、條件邏輯或已確定的派對安排不合。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0085": {
    question: `${email}\n\n請選出最適合填入文章中標示 (37) 空格的選項。`,
    explanation: "答案 C「lucky」。句子說如果他們夠幸運而天氣晴好，就仍在花園舉辦派對；若下雨則移到家裡。lucky 與天氣是否配合的情境相符。crazy、good、strong 都不能自然表達『碰上好天氣的運氣』。",
    solutionSteps: ["掌握句子條件：只有天氣晴好，派對才會留在花園；下雨則改到室內。", "天氣好並非主辦者能控制，說 if we’re lucky（如果我們夠幸運）符合此情境。", "crazy（瘋狂）、good（好）、strong（強壯）都不能自然描述遇到晴天的運氣，故選 C。"],
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

const expected = { "OFF-0083": 3, "OFF-0084": 0, "OFF-0085": 2 };
for (const [id, answer] of Object.entries(expected)) {
  const question = questions.find((item) => item.id === id);
  if (question.answer !== answer || !question.question.includes("Daniel’s 5th Birthday Party")) {
    throw new Error(`Answer or email material mismatch for ${id}`);
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored the complete birthday invitation and explanations for OFF-0083–0085.");
