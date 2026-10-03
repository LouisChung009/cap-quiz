import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const repairs = {
  "OFF-0723": {
    explanation: "答案是 B「I did」。Linda 省略重複的動詞片語：I did [most of my report] this afternoon。問句 Have you finished...? 詢問完成情況，她接著說下午已完成大部分，並將於週五前完成剩餘部分，因此用一般過去式 did 指下午做過的事。A would do 是假設語氣，C was doing 強調當時進行中，D I’ll do 與後面的未來計畫重複，皆不合時間線。",
    solutionSteps: ["把省略處補回：I ___ most of it this afternoon；most of it 指 report 的大部分。", "this afternoon 在對話中指已經過去的下午，故用 did 代替 did most of the report。", "選 B；注意 did 在此代替前文動詞片語，而不是接在空格後再加原形動詞。"],
    teacherTip: "省略句要先還原被省略的動詞與受詞，再依時間副詞判斷時態。",
    relatedWords: ["finish（完成）", "report（報告）", "this afternoon（今天下午；依語境可指已過時間）", "by Friday（最晚於星期五）"]
  },
  "OFF-0724": {
    explanation: "答案是 D「To buy food for his brother」。短文第一段說 Jason 肚子餓並一直哭，Philip 不會煮飯，父親又還在辦公室加班，所以 Philip 決定帶弟弟出去找食物。其餘選項把後來遇到的女子、父親及警察誤當成出門目的；三者都是他們返家後才出現的事件。",
    solutionSteps: ["找出問題問的是出門原因，而非返家後發生什麼事。", "第一段因果順序是弟弟餓哭、哥哥不會煮、父親不在家，因此 Philip 帶弟弟出去找吃的。", "選 D。A、B、C 都是把第二段的後續情節錯當成出門目的。"],
    teacherTip: "閱讀理解的 why 題先定位事件發生前的原因句，避免被後續情節干擾。",
    relatedWords: ["go out（外出）", "hungry（餓的）", "decide to（決定做）", "get some food（弄些食物／買食物）"]
  },
  "OFF-0725": {
    explanation: "答案是 C「The police didn’t believe what he said」。父親大聲說自己只是忘了鑰匙、想回自己的家，但警察不相信；直到 Philip 回來說明情況，警察才相信父親。因此父親生氣的直接原因是警察不信他的解釋。A 雖是父親說的理由，卻不是他生氣的原因；B 是女子的狀態，D 是 Philip 和弟弟先前外出的事，都不是文中指出的原因。",
    solutionSteps: ["區分 father 忘記鑰匙（他對警察的解釋）和 father 生氣（警察不相信他）。", "文中明確說警察直到 Philip 解釋後才相信父親，直接支持 C。", "因此選 C；答題時要找 why was he angry 的原因，不要照抄人物辯解內容。"],
    teacherTip: "注意題目問的是人物的情緒原因，不一定等於人物口中說出的事件。",
    relatedWords: ["angry（生氣的）", "believe（相信）", "forget one’s keys（忘記帶鑰匙）", "explain（解釋）"]
  }
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題") throw new Error(`Missing official question ${id}`);
  Object.assign(row, repair);
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official English explanations.`);
