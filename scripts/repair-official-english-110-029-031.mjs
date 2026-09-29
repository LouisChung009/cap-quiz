import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const material = `【閱讀材料】National Formosa Railway (NFR) service notice, August 14–28, 2016
Dear Traveler,
You have bought an NFR ticket online for a train that runs between White Water City and Cloud City. Because of last month’s typhoon, the Sand Town–Spring Town line will be closed from August 14 to 28, 2016. During this time, some trains will change lines and will not stop at a few stations. Free buses will take travelers to those stations. Please check the route and train information below.

Train schedules for the changed routes:
Southbound RL101: White Water City → Cloud City
Southbound RL102: White Water City → Spring Town
Southbound RL103: Green City → Cloud City
Northbound RL201: Spring Town → Green City
Northbound RL202: Cloud City → Green City

Trains running between Green City and Cloud City use the Smoke Town–Spring Town line and stop at every station. Replacement free buses for the closed Sand Town–Spring Town line wait at Green City (southbound) and Spring Town (northbound); they do not stop at Gray Village.

Route map (in order): White Water City—Green City; from Green City the Smoke Town–Spring Town branch passes Smoke Town, Hill Town and Spring Town, while the Sand Town–Spring Town branch passes Sand Town, Gray Village and Black Town before reaching Spring Town; both lines continue to Cloud City.`;

const fixes = {
  "OFF-0077": {
    question: `${material}\n\nWhy does National Formosa Railway write this letter?`,
    explanation: "答案 D「Some of its trains will run on different lines.」颱風造成 Sand Town–Spring Town 路線暫時封閉，因此公告說部分列車會改走其他路線，並有些車站不停靠、改由免費接駁車服務。A 沒有促銷訊息；B 把封閉月份說成七月（原文是 8 月 14–28 日）；C 也不是開新線。",
    solutionSteps: ["先找公告要旅客注意的事件：Sand Town–Spring Town 線因颱風封閉，日期為 8 月 14 至 28 日。", "公告接著說部分列車會改線、略過部分車站，並以免費巴士接駁；因此 D 概括了寫信原因。", "A 沒提票價優惠，B 日期錯誤，C 把臨時改線誤讀為開新路線。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0078": {
    question: `${material}\n\nWhat is true about NFR’s trains between August 14 and 28, 2016?`,
    explanation: "答案 D「People can go to Hill Town on any train that runs between Green City and Cloud City.」公告明說 Green City 與 Cloud City 之間的列車改走 Smoke Town–Spring Town 線，且每站都停；Hill Town 位於這段支線上，所以這些列車都可到 Hill Town。A 錯，支線列車停靠 Spring Town；B 並非所有改線列車都在 Cloud City 停靠；C 免費巴士只接駁指定車站，不能搭到該線任意車站。",
    solutionSteps: ["依公告辨認 Green City–Cloud City 的改道列車改走 Smoke Town–Spring Town 支線，且沿途每站停靠。", "路線資料顯示 Hill Town 位於該支線，因此所有行駛這段區間的列車都能前往，選 D。", "A 與『每站停靠』及 Spring Town 位置不符；B 把不同班次的行駛終點混為一談；C 把有限接駁站擴大成任意車站。"],
    requiresContext: false,
    requiresImage: false
  },
  "OFF-0079": {
    question: `${material}\n\nJames lives in Smoke Town. He wants to go to Black Town on August 19. How can he get there?`,
    explanation: "答案 A：先搭 RL202 到 Green City，再轉免費巴士。題目日期落在 8 月 14–28 日封線期間；RL202 是由 Cloud City 開往 Green City、行經 Smoke Town 的北向列車，故 James 可在 Smoke Town 上車到 Green City。公告指定往南的免費巴士在 Green City 等候，接駁被封閉線上的車站，包括 Black Town。",
    solutionSteps: ["先確認 8 月 19 日在臨時封線期間，Sand Town–Spring Town 線不能照常搭乘。", "由路線和班次表，Smoke Town 位於 RL202 的 Cloud City–Green City 路段；搭到 Green City 即可接上往南的免費巴士。", "Green City 是公告指定的南向接駁點，免費巴士可接駁到 Black Town；其餘選項的班次方向、車站或轉乘方式不符。"],
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
  if (question.requiresContext || question.requiresImage || !question.question.includes("【閱讀材料】National Formosa Railway")) {
    throw new Error(`Incomplete route material for ${id}`);
  }
  delete question.questionImage;
  delete question.questionImages;
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Embedded the NFR notice and route details; repaired OFF-0077–0079 explanations.");
