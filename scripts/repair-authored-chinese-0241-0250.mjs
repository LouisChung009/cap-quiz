import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0241": { unit: "文言文", teacherTip: "判斷結尾效果時看事件是否有結果：劉子驥也未能找到桃花源，讓理想之地更添難以求證的餘韻。" },
  "CHI-0242": { unit: "文言文", teacherTip: "「間」有空隙、間隔等常見義；本句接在權貴謀劃之後，結合反問語氣判斷為參與。" },
  "CHI-0243": { unit: "文言文", teacherTip: "理解《曹劌論戰》人物動機時逐一比較君主提出的政事與曹劌的評語，不能把小恩小信直接等同於取信於民。" },
  "CHI-0244": { unit: "文言文", teacherTip: "讀「受任」「奉命」要連同「敗軍」「危難」的時局，分辨受命背景、作者感念與承擔使命三層關係。" },
  "CHI-0245": { unit: "文言文", teacherTip: "解釋蘇軾的「閒人」需合看深夜賞月的行動和被貶處境；語意同時包含閒情與自我調侃。" },
  "CHI-0246": { unit: "閱讀理解", teacherTip: "由活動與結果推論時連結修繕做法、垃圾量和參與人數；資料支持可能效果，但不宜延伸成垃圾完全消失。" },
  "CHI-0247": {
    unit: "閱讀理解",
    solutionSteps: ["研究問題是比較兩種材質杯子的保溫效果。", "初始水溫、測量間隔和杯口覆蓋方式也會影響降溫，因此需要固定。", "控制這些變因才能較公平地比較材質，答案為索引 3。"],
    teacherTip: "實驗設計先找操縱變因（杯子材質），再辨認可能影響結果的控制變因；公平比較不等於讓水溫完全不變。",
  },
  "CHI-0248": { unit: "閱讀理解", teacherTip: "評估措施依據時區分事前需求調查與事後成效數據；兩種資料分別回答為何試辦及試辦後如何。" },
  "CHI-0249": { unit: "閱讀理解", teacherTip: "判斷決策是否依證據，依序追蹤觀察紀錄、追加訪談和最後調整，不能把單次低使用量當成完整原因。" },
  "CHI-0250": { unit: "閱讀理解", teacherTip: "改寫公告要找出舊句造成的時間歧義，再核對新版是否明確寫出截止日期與具體時點。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
