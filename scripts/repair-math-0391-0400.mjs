import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "math.json");
let original = await readFile(file, "utf8");
const bank = JSON.parse(original);
const replacements = [
  {
    id: "MAT-0391", gradeSemester: "七年級上", unit: "統計", knowledgePoint: "平均數與加權平均",
    question: "某班 20 位學生數學小考平均 72 分，另有 10 位學生平均 84 分。全班 30 位學生的平均分數為多少？",
    options: ["76 分", "77 分", "78 分", "80 分"], answer: 0,
    explanation: "兩組人數不同，不能直接平均 72 與 84。總分為 20×72＋10×84＝2280 分，再除以 30 人，平均為 76 分。",
    solutionSteps: ["第一組總分為 20×72＝1440 分，第二組總分為 10×84＝840 分。", "全班總分為 1440＋840＝2280 分。", "全班平均為 2280÷30＝76 分，因此選 A。"],
    teacherTip: "合併不同人數群體的平均時，先加總各組總量，再除以總人數。",
  },
  {
    id: "MAT-0392", gradeSemester: "七年級下", unit: "統計與機率", knowledgePoint: "古典機率與互斥事件",
    question: "袋中有編號 1 至 8 的八張相同大小卡片，隨機抽一張。抽到 3 的倍數或偶數的機率為何？",
    options: ["1/2", "5/8", "3/4", "7/8"], answer: 1,
    explanation: "八種結果等可能。符合條件的號碼為 2、3、4、6、8，共 5 張，故機率為 5/8。",
    solutionSteps: ["列出 1 至 8 中的 3 倍數：3、6；偶數：2、4、6、8。", "符合『或』的號碼合併且不重複計數，為 2、3、4、6、8，共 5 個。", "機率為 5÷8＝5/8，因此選 B。"],
    teacherTip: "處理『或』事件時，重疊結果只能計算一次。",
  },
  {
    id: "MAT-0393", gradeSemester: "八年級上", unit: "代數", knowledgePoint: "二元一次聯立方程式",
    question: "文具店中 2 枝鉛筆與 3 本筆記本共 54 元，3 枝鉛筆與 2 本筆記本共 51 元。每枝鉛筆多少元？",
    options: ["9 元", "10 元", "12 元", "15 元"], answer: 0,
    explanation: "設鉛筆每枝 x 元、筆記本每本 y 元，列式 2x＋3y＝54、3x＋2y＝51。消去 y 得 5x＝45，所以鉛筆單價為 9 元。",
    solutionSteps: ["設鉛筆單價為 x 元、筆記本單價為 y 元，得 2x＋3y＝54、3x＋2y＝51。", "第一式乘 2 得 4x＋6y＝108；第二式乘 3 得 9x＋6y＝153。", "相減得 5x＝45，所以鉛筆每枝 9 元，選 A。"],
    teacherTip: "聯立方程式可先讓某一未知數係數相同，再相減消去。",
  },
  {
    id: "MAT-0394", gradeSemester: "八年級下", unit: "幾何", knowledgePoint: "畢氏定理與直角三角形",
    question: "一個直角三角形的兩股長分別為 9 公分與 12 公分。斜邊長為多少公分？",
    options: ["13", "15", "18", "21"], answer: 1,
    explanation: "依畢氏定理，斜邊平方為 9²＋12²＝81＋144＝225，因此斜邊長為 15 公分。",
    solutionSteps: ["直角三角形斜邊是最長邊，使用 c²＝a²＋b²。", "代入兩股長，c²＝9²＋12²＝225。", "取正平方根得 c＝15 公分，選 B。"],
    teacherTip: "先確認題目給的是兩股，再用畢氏定理求斜邊。",
  },
  {
    id: "MAT-0395", gradeSemester: "九年級上", unit: "函數", knowledgePoint: "一次函數與交點",
    question: "直線 y＝2x＋1 與 y＝−x＋10 相交於一點，該交點的 x 坐標為何？",
    options: ["2", "3", "4", "5"], answer: 1,
    explanation: "交點同時滿足兩個函數式，令 2x＋1＝−x＋10，解得 3x＝9，所以 x＝3。",
    solutionSteps: ["交點的 y 值相同，因此令 2x＋1 與 −x＋10 相等。", "移項整理：2x＋x＝10−1，得到 3x＝9。", "解得 x＝3，交點的 x 坐標為 3，選 B。"],
    teacherTip: "求兩直線交點時，先令兩個 y 表示式相等。",
  },
  {
    id: "MAT-0396", gradeSemester: "九年級下", unit: "資料判讀", knowledgePoint: "圓形圖與比例",
    question: "某校社團人數共 240 人，圓形圖中音樂社扇形的圓心角為 90°。音樂社有多少人？",
    options: ["45 人", "60 人", "80 人", "90 人"], answer: 1,
    explanation: "圓心角 90° 占全圓 360° 的 1/4，因此音樂社人數為 240×1/4＝60 人。",
    solutionSteps: ["整個圓代表 360°，音樂社所占比例為 90÷360＝1/4。", "將全校社團總人數 240 乘以 1/4。", "240×1/4＝60 人，選 B。"],
    teacherTip: "圓形圖的扇形比例等於圓心角除以 360°。",
  },
  {
    id: "MAT-0397", gradeSemester: "七年級上", unit: "數與量", knowledgePoint: "百分率與連續折扣",
    question: "一件外套原價 1500 元，先打 8 折，再用折後價打 9 折。最後售價是多少元？",
    options: ["1050 元", "1080 元", "1200 元", "1350 元"], answer: 1,
    explanation: "第一次折後為 1500×0.8＝1200 元；第二次以折後價計算，1200×0.9＝1080 元。",
    solutionSteps: ["打 8 折表示付原價的 80%，第一次折後價為 1500×0.8＝1200 元。", "第二次打 9 折是付 1200 元的 90%。", "最後售價為 1200×0.9＝1080 元，選 B。"],
    teacherTip: "連續折扣需依序乘折數，後一次折扣以當時價格為基準。",
  },
  {
    id: "MAT-0398", gradeSemester: "七年級下", unit: "數與量", knowledgePoint: "速率與相遇問題",
    question: "甲、乙兩地相距 420 公里，兩車同時相向而行，速率分別為每小時 60 公里與 80 公里。幾小時後相遇？",
    options: ["2 小時", "3 小時", "3.5 小時", "7 小時"], answer: 1,
    explanation: "相向而行時兩車每小時合計接近 60＋80＝140 公里，420÷140＝3 小時後相遇。",
    solutionSteps: ["相向而行，兩車距離每小時減少 60＋80＝140 公里。", "相遇時間＝總距離÷每小時接近距離。", "420÷140＝3 小時，選 B。"],
    teacherTip: "相向速率相加、同向追趕時則用速率差。",
  },
  {
    id: "MAT-0399", gradeSemester: "八年級上", unit: "幾何", knowledgePoint: "圓周角與圓心角",
    question: "在同一圓中，弧 AB 所對的圓心角為 124°。同弧 AB 所對的圓周角為多少度？",
    options: ["31°", "62°", "124°", "248°"], answer: 1,
    explanation: "同弧所對的圓周角等於圓心角的一半，所以圓周角為 124°÷2＝62°。",
    solutionSteps: ["辨認圓心角為 124°，且題目所問圓周角對同一弧。", "同弧所對圓周角＝圓心角÷2。", "124°÷2＝62°，選 B。"],
    teacherTip: "同弧的圓心角是圓周角的兩倍。",
  },
  {
    id: "MAT-0400", gradeSemester: "八年級下", unit: "代數", knowledgePoint: "等差數列與總和",
    question: "等差數列 5、8、11、14、⋯ 的前 10 項和為多少？",
    options: ["170", "175", "185", "190"], answer: 2,
    explanation: "公差為 3，第 10 項為 5＋9×3＝32。前 10 項和為 (5＋32)×10÷2＝185。",
    solutionSteps: ["首項 a₁＝5，公差 d＝3，第 10 項為 5＋(10−1)×3＝32。", "等差數列前 n 項和為 (首項＋末項)×項數÷2。", "前 10 項和＝(5＋32)×10÷2＝185，選 C。"],
    teacherTip: "求等差數列總和可配對首末項，或使用首末項平均乘項數。",
  },
];

for (const replacement of replacements) {
  const row = bank.find((item) => item.id === replacement.id);
  if (!row) throw new Error(`Missing ${replacement.id}`);
  const { id, ...fields } = replacement;
  Object.assign(row, fields, { difficulty: "中等", type: "單題選擇" });
  if (replacement.options.length !== 4 || new Set(replacement.options).size !== 4 || replacement.answer < 0 || replacement.answer > 3 || replacement.solutionSteps.length < 3) {
    throw new Error(`Invalid structure: ${replacement.id}`);
  }
  if (!replacement.explanation.includes(replacement.options[replacement.answer])) {
    throw new Error(`Answer not found in explanation: ${replacement.id}`);
  }
}

for (const replacement of replacements) {
  const row = bank.find(({ id }) => id === replacement.id);
  const { id, ...fields } = replacement;
  Object.assign(row, fields, { difficulty: "中等", type: "單題選擇" });
  const recordPattern = new RegExp(`  \\{\\r?\\n(?:(?!  \\},?\\r?\\n)[\\s\\S])*?    \\"id\\": \\"${id}\\",[\\s\\S]*?\\r?\\n  \\}(?=,?\\r?\\n)`, "m");
  const match = original.match(recordPattern);
  if (!match) throw new Error(`Could not locate original record ${id}`);
  const oldRecord = JSON.parse(match[0].replace(/,$/, ""));
  const updatedRecord = JSON.stringify({ ...oldRecord, ...fields, difficulty: "中等", type: "單題選擇" }, null, 2)
    .split("\n").map((line, index) => index === 0 ? `  ${line}` : `  ${line}`).join("\n");
  original = original.replace(match[0], updatedRecord);
}
await writeFile(file, original);
