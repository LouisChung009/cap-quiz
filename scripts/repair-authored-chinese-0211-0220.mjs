import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0211": { unit: "閱讀理解", teacherTip: "分析例子在論說文中的功能時，對照它所回應的原主張，並檢查例子支持的是普遍結論還是修正絕對語氣。" },
  "CHI-0212": { unit: "閱讀理解", teacherTip: "推論人物態度要用行動變化作證；作者承認作品不完美，同時指出第二次操作更穩當，語氣並非全盤否定。" },
  "CHI-0213": { unit: "閱讀理解", teacherTip: "辨認程序順序時留意「先、接著、後、最後」等標記，並確認句中描述的是連續步驟而非重要性排序。" },
  "CHI-0214": { unit: "閱讀理解", teacherTip: "比較兩種工具時分別整理各自的優點和限制；作者並列兩端，不代表其中一種在所有情況都較好。" },
  "CHI-0215": {
    unit: "閱讀理解",
    question: "班級記錄每趟通勤的平均時間：步行 18 分鐘、公車 25 分鐘、腳踏車 12 分鐘。若一名學生上課日每天往返都騎腳踏車，連續五天相較於步行共節省多少通勤時間？",
    options: ["30 分鐘，只計五天的單程差", "12 分鐘，只計一天的往返差", "120 分鐘，把每天的往返差多算一倍", "60 分鐘，五天各往返一次的時間差"],
    explanation: "正解是「60 分鐘，五天各往返一次的時間差」。每趟步行比騎車多 18−12＝6 分鐘；每天往返省 6×2＝12 分鐘，五天共省 12×5＝60 分鐘。",
    solutionSteps: ["先算每趟的時間差：18−12＝6 分鐘。", "每天往返兩趟方向，故一天省 6×2＝12 分鐘。", "連續五天共省 12×5＝60 分鐘，答案為索引 3。"],
    teacherTip: "表格計算先確認數值代表單程或往返，再乘上實際天數；避免只算單趟或把往返重複計算。",
  },
  "CHI-0216": { unit: "閱讀理解", teacherTip: "抓主旨時比較問題與作者提出的對策；「因此」後的保存說明回應了影像檔缺少人事時地脈絡的問題。" },
  "CHI-0217": {
    unit: "閱讀理解",
    solutionSteps: ["找出目前證據範圍：只試行兩週，且觀察結果涉及部分班級。", "注意材料明確保留限制：仍需蒐集更長期資料。", "所以只能推論此安排可能有幫助，不能說已證明普遍或長期效果；答案為索引 1。"],
    teacherTip: "評估研究結論時比對樣本、觀察期間和作者的限制聲明；短期局部觀察只能支持暫時性推論，不能證成普遍因果。",
  },
  "CHI-0218": {
    unit: "修辭",
    solutionSteps: ["前句以「像」連接河面和銀色帶子，構成譬喻。", "後句把柳枝寫成會「低頭」「問候」的人，構成擬人。", "兩句依序是譬喻、擬人，答案為索引 2。"],
    teacherTip: "同段出現多種修辭時逐句拆開判讀：先找明示喻詞，再看非人事物是否被賦予人的行為，別把兩句的手法對調。",
  },
  "CHI-0219": {
    unit: "閱讀理解",
    solutionSteps: ["讀出「因此」前的好處：雨天仍可進行部分活動。", "讀出「然而」後的限制：場地容量有限，仍須分組。", "後句轉折補充前述便利的限制，答案為索引 3。"],
    teacherTip: "連接詞的關係要看前後命題如何相接；「然而」後的內容限制前句好處，不能只按詞語位置猜因果。",
  },
  "CHI-0220": {
    unit: "閱讀理解",
    solutionSteps: ["找出阿哲把最後一個麵包推給妹妹的行動。", "母親看到空碗，才推知阿哲其實也餓，這個細節補充了讓食物的代價。", "作者用行動與旁人觀察間接呈現體貼，答案為索引 0。"],
    teacherTip: "分辨直接描寫與間接描寫時，檢查作者是否直接貼上性格標籤，或讓行動和細節由讀者自行推知人物特質。",
  },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
