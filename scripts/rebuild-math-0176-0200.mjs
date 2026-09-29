import {readFile,writeFile} from "node:fs/promises";
const path=new URL("../data/math.json",import.meta.url);const bank=JSON.parse(await readFile(path,"utf8"));const rows=[
  {
    "question": "一件外套打八折後售價為 1,440 元，原價是多少元？",
    "options": [
      "1,720 元",
      "1,800 元",
      "1,840 元",
      "1,920 元"
    ],
    "answer": 1,
    "explanation": "打八折表示售價是原價的 0.8 倍。原價為 1,440 ÷ 0.8 = 1,800 元。 正確答案：B「1,800 元」。",
    "solutionSteps": [
      "設原價為 x 元，依題意列式 0.8x = 1,440。",
      "解方程得 x = 1,440 ÷ 0.8 = 1,800。",
      "原價是 1,800 元。"
    ],
    "unit": "元",
    "knowledgePoint": "百分率與一元一次方程式",
    "difficulty": "中等"
  },
  {
    "question": "甲、乙兩數的比為 3：5，且甲數比乙數少 18，甲數是多少？",
    "options": [
      "27",
      "30",
      "33",
      "36"
    ],
    "answer": 0,
    "explanation": "兩數相差 5－3＝2 份，2 份是 18，因此 1 份是 9，甲數為 3×9＝27。 正確答案：A「27」。",
    "solutionSteps": [
      "設每份為 x，依題意列式 5x－3x = 18。",
      "解得 x = 9。",
      "甲數為 3×9 = 27。"
    ],
    "unit": "無",
    "knowledgePoint": "比例與一元一次方程式",
    "difficulty": "中等"
  },
  {
    "question": "一輛汽車以每小時 72 公里的速率行駛，行駛 1.5 小時後，距離目的地還有 48 公里。出發地到目的地相距多少公里？",
    "options": [
      "144 公里",
      "150 公里",
      "156 公里",
      "162 公里"
    ],
    "answer": 2,
    "explanation": "已行駛 72×1.5＝108 公里，加上剩下的 48 公里，總距離為 156 公里。 正確答案：C「156 公里」。",
    "solutionSteps": [
      "已行駛距離為 72×1.5 = 108 公里。",
      "總距離 = 已行駛距離＋剩餘距離 = 108＋48。",
      "出發地到目的地相距 156 公里。"
    ],
    "unit": "公里",
    "knowledgePoint": "速率、時間與距離",
    "difficulty": "中等"
  },
  {
    "question": "一個長方形的周長是 54 公分，長比寬多 5 公分。這個長方形的面積是多少平方公分？",
    "options": [
      "176 平方公分",
      "160 平方公分",
      "165 平方公分",
      "170 平方公分"
    ],
    "answer": 0,
    "explanation": "長與寬的和是 54÷2＝27 公分。設寬為 w，則 2w＋5＝27，得寬 11 公分、長 16 公分，面積為 11×16＝176 平方公分。 正確答案：A「176 平方公分」。",
    "solutionSteps": [
      "長與寬的和為 54÷2 = 27 公分；設寬 w，則長為 w＋5。",
      "由 w＋(w＋5) = 27 得 w = 11，長為 16 公分。",
      "面積為 11×16 = 176 平方公分。"
    ],
    "unit": "平方公分",
    "knowledgePoint": "長方形周長與面積",
    "difficulty": "中等"
  },
  {
    "question": "某班 5 位同學的數學測驗分數為 72、80、85、91、92 分。若再加入一位同學後，6 人平均為 84 分，加入的同學得幾分？",
    "options": [
      "82 分",
      "84 分",
      "86 分",
      "88 分"
    ],
    "answer": 1,
    "explanation": "原 5 人總分為 72＋80＋85＋91＋92＝420 分；6 人總分為 6×84＝504 分，因此加入同學得 504－420＝84 分。 正確答案：B「84 分」。",
    "solutionSteps": [
      "原 5 人總分為 72＋80＋85＋91＋92 = 420 分。",
      "6 人總分為 6×84 = 504 分。",
      "加入同學得分為 504－420 = 84 分。"
    ],
    "unit": "分",
    "knowledgePoint": "平均數",
    "difficulty": "中等"
  },
  {
    "question": "袋中有 4 顆紅球、3 顆藍球及 5 顆白球，任取 1 顆球。取到藍球的機率是多少？",
    "options": [
      "1/4",
      "1/3",
      "3/8",
      "5/12"
    ],
    "answer": 0,
    "explanation": "球的總數為 4＋3＋5＝12 顆，取到藍球的機率為 3/12＝1/4。 正確答案：A「1/4」。",
    "solutionSteps": [
      "球的總數為 4＋3＋5 = 12 顆。",
      "有利結果數為藍球 3 顆。",
      "機率 = 3/12 = 1/4。"
    ],
    "unit": "無",
    "knowledgePoint": "古典機率",
    "difficulty": "中等"
  },
  {
    "question": "函數 y＝－2x＋7 中，當 x＝－3 時，y 的值是多少？",
    "options": [
      "11",
      "12",
      "13",
      "14"
    ],
    "answer": 2,
    "explanation": "代入 x＝－3，得 y＝－2×(－3)＋7＝6＋7＝13。 正確答案：C「13」。",
    "solutionSteps": [
      "將 x = −3 代入 y = −2x＋7。",
      "計算 y = −2×(−3)＋7 = 6＋7。",
      "所以 y = 13。"
    ],
    "unit": "無",
    "knowledgePoint": "一次函數代入求值",
    "difficulty": "中等"
  },
  {
    "question": "成人票每張 180 元，學生票每張 120 元。某團體購買 8 張票，共付 1,140 元。學生票買了幾張？",
    "options": [
      "3 張",
      "4 張",
      "5 張",
      "6 張"
    ],
    "answer": 2,
    "explanation": "設學生票 x 張，則成人票有 8－x 張。列式 120x＋180(8－x)＝1,140，解得 x＝5。 正確答案：C「5 張」。",
    "solutionSteps": [
      "設學生票買 x 張，成人票為 8－x 張。",
      "依總票價列式 120x＋180(8－x) = 1,140，解得 x = 5。",
      "學生票買了 5 張。"
    ],
    "unit": "張",
    "knowledgePoint": "二元數量關係化為一元一次方程式",
    "difficulty": "中等"
  },
  {
    "question": "某水桶原有 12 公升的水，每分鐘流入 3 公升，同時每分鐘流出 1 公升。幾分鐘後桶中有 32 公升的水？",
    "options": [
      "8 分鐘",
      "9 分鐘",
      "10 分鐘",
      "11 分鐘"
    ],
    "answer": 2,
    "explanation": "每分鐘淨增加 3－1＝2 公升。要從 12 公升增加到 32 公升需增加 20 公升，因此需 20÷2＝10 分鐘。 正確答案：C「10 分鐘」。",
    "solutionSteps": [
      "設經過 x 分鐘，水量為 12＋(3－1)x 公升。",
      "依題意列式 12＋2x = 32，解得 x = 10。",
      "經過 10 分鐘桶中有 32 公升的水。"
    ],
    "unit": "分鐘",
    "knowledgePoint": "流量與一元一次方程式",
    "difficulty": "中等"
  },
  {
    "question": "一個三角形的三內角度數比為 2：3：4。最大角是多少度？",
    "options": [
      "70°",
      "75°",
      "80°",
      "90°"
    ],
    "answer": 2,
    "explanation": "三角形內角和為 180°，9 份代表 180°，每份為 20°，最大角為 4×20°＝80°。 正確答案：C「80°」。",
    "solutionSteps": [
      "設每份為 x 度，列式 2x＋3x＋4x = 180。",
      "解得 x = 20。",
      "最大角為 4×20° = 80°。"
    ],
    "unit": "度",
    "knowledgePoint": "三角形內角和與比例",
    "difficulty": "中等"
  },
  {
    "question": "某社團有 40 人，其中 30% 參加美術組。後來有若干人加入美術組，使美術組人數占全社團人數的 40%，而社團總人數不變。新增加入美術組的有幾人？",
    "options": [
      "2 人",
      "3 人",
      "4 人",
      "5 人"
    ],
    "answer": 2,
    "explanation": "原有美術組 40×30%＝12 人，目標人數為 40×40%＝16 人，新增 16－12＝4 人。 正確答案：C「4 人」。",
    "solutionSteps": [
      "原美術組人數為 40×0.30 = 12 人。",
      "目標美術組人數為 40×0.40 = 16 人。",
      "新增加入美術組的人數為 16－12 = 4 人。"
    ],
    "unit": "人",
    "knowledgePoint": "百分率與資料判讀",
    "difficulty": "中等"
  },
  {
    "question": "等腰三角形的頂角為 38°，每個底角是多少度？",
    "options": [
      "61°",
      "69°",
      "71°",
      "72°"
    ],
    "answer": 2,
    "explanation": "兩個底角相等，且三角形內角和為 180°，所以每個底角為 (180°－38°)÷2＝71°。 正確答案：C「71°」。",
    "solutionSteps": [
      "兩個底角的和為 180°－38° = 142°。",
      "等腰三角形的兩底角相等。",
      "每個底角為 142°÷2 = 71°。"
    ],
    "unit": "度",
    "knowledgePoint": "等腰三角形性質與內角和",
    "difficulty": "中等"
  },
  {
    "question": "某組 6 位同學的身高平均為 160 公分，其中 5 位同學身高總和為 795 公分。第 6 位同學身高是多少公分？",
    "options": [
      "160 公分",
      "162 公分",
      "165 公分",
      "168 公分"
    ],
    "answer": 2,
    "explanation": "6 位同學的身高總和為 6×160＝960 公分，第 6 位身高為 960－795＝165 公分。 正確答案：C「165 公分」。",
    "solutionSteps": [
      "6 位同學的身高總和為 6×160 = 960 公分。",
      "扣除其餘 5 位的總和：960－795 = 165 公分。",
      "第 6 位同學身高是 165 公分。"
    ],
    "unit": "公分",
    "knowledgePoint": "平均數與總和",
    "difficulty": "中等"
  },
  {
    "question": "一個盒子中有 2 顆紅球、3 顆藍球及 5 顆綠球。任取 1 顆球，取到「不是綠球」的機率是多少？",
    "options": [
      "1/5",
      "1/2",
      "3/5",
      "4/5"
    ],
    "answer": 1,
    "explanation": "不是綠球的有 2＋3＝5 顆，總數為 10 顆，因此機率為 5/10＝1/2。 正確答案：B「1/2」。",
    "solutionSteps": [
      "盒中球的總數為 2＋3＋5 = 10 顆。",
      "不是綠球的球數為 2＋3 = 5 顆。",
      "所求機率為 5/10 = 1/2。"
    ],
    "unit": "無",
    "knowledgePoint": "古典機率與補事件",
    "difficulty": "中等"
  },
  {
    "question": "直線 y＝3x－4 上有一點，其 x 座標為 6。此點的 y 座標是多少？",
    "options": [
      "12",
      "13",
      "14",
      "15"
    ],
    "answer": 2,
    "explanation": "將 x＝6 代入 y＝3x－4，得 y＝18－4＝14。 正確答案：C「14」。",
    "solutionSteps": [
      "將 x = 6 代入 y = 3x－4。",
      "計算 y = 3×6－4 = 18－4。",
      "所以 y 座標為 14。"
    ],
    "unit": "無",
    "knowledgePoint": "一次函數代入求值",
    "difficulty": "中等"
  },
  {
    "question": "買 3 支相同的原子筆和一本 45 元的筆記本，共付 126 元。每支原子筆多少元？",
    "options": [
      "25 元",
      "26 元",
      "27 元",
      "28 元"
    ],
    "answer": 2,
    "explanation": "3 支原子筆共 126－45＝81 元，每支為 81÷3＝27 元。 正確答案：C「27 元」。",
    "solutionSteps": [
      "設每支原子筆 x 元，列式 3x＋45 = 126。",
      "解得 3x = 81，因此 x = 27。",
      "每支原子筆 27 元。"
    ],
    "unit": "元",
    "knowledgePoint": "依情境列一元一次方程式",
    "difficulty": "中等"
  },
  {
    "question": "一輛腳踏車以每小時 15 公里的速率行駛，行駛相同距離時比每小時 12 公里的速率少花 30 分鐘。這段距離是多少公里？",
    "options": [
      "24 公里",
      "27 公里",
      "30 公里",
      "36 公里"
    ],
    "answer": 2,
    "explanation": "設距離為 d 公里。依題意，d/12－d/15＝0.5，解得 d＝30 公里。 正確答案：C「30 公里」。",
    "solutionSteps": [
      "設路程為 d 公里，兩種所需時間分別為 d/12 與 d/15 小時。",
      "依題意列式 d/12－d/15 = 0.5，整理得 d/60 = 0.5。",
      "解得 d = 30 公里。"
    ],
    "unit": "公里",
    "knowledgePoint": "速率與時間差",
    "difficulty": "進階"
  },
  {
    "question": "一個長方形的長是寬的 1.5 倍，且周長為 50 公分。這個長方形的面積是多少平方公分？",
    "options": [
      "140",
      "144",
      "150",
      "156"
    ],
    "answer": 2,
    "explanation": "長寬和為 25 公分。設寬為 w，則 1.5w＋w＝25，得寬 10 公分、長 15 公分，面積為 150 平方公分。 正確答案：C「150」。",
    "solutionSteps": [
      "設寬為 w 公分，長為 1.5w 公分；由周長得 1.5w＋w = 25。",
      "解得 w = 10，長為 15 公分。",
      "面積 = 10×15 = 150 平方公分。"
    ],
    "unit": "平方公分",
    "knowledgePoint": "長方形周長、倍數關係與面積",
    "difficulty": "中等"
  },
  {
    "question": "某次測驗 8 位同學的平均分數為 76 分。若其中一位同學的分數從 68 分更正為 84 分，更正後的平均分數是多少？",
    "options": [
      "77 分",
      "78 分",
      "79 分",
      "80 分"
    ],
    "answer": 1,
    "explanation": "更正使總分增加 84－68＝16 分，平均增加 16÷8＝2 分，因此新平均為 76＋2＝78 分。 正確答案：B「78 分」。",
    "solutionSteps": [
      "原總分為 8×76 = 608 分。",
      "更正後總分為 608－68＋84 = 624 分。",
      "新平均為 624÷8 = 78 分。"
    ],
    "unit": "分",
    "knowledgePoint": "平均數更正與資料判讀",
    "difficulty": "進階"
  },
  {
    "question": "一個袋子裡有 6 張標示 1 至 6 的卡片，任取 1 張。抽到偶數的機率是多少？",
    "options": [
      "1/3",
      "1/2",
      "2/3",
      "5/6"
    ],
    "answer": 1,
    "explanation": "偶數卡有 2、4、6 共 3 張，總共有 6 張，機率為 3/6＝1/2。 正確答案：B「1/2」。",
    "solutionSteps": [
      "所有可能結果共有 6 個。",
      "符合條件的偶數卡為 2、4、6，共 3 個。",
      "機率為 3/6 = 1/2。"
    ],
    "unit": "無",
    "knowledgePoint": "古典機率",
    "difficulty": "中等"
  },
  {
    "question": "一次函數 y＝－3x＋12 與 x 軸的交點，其 x 座標是多少？",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": 1,
    "explanation": "與 x 軸交點的 y 座標為 0，令 0＝－3x＋12，解得 x＝4。 正確答案：B「4」。",
    "solutionSteps": [
      "在 x 軸上的點滿足 y = 0。",
      "列式 0 = −3x＋12，得 3x = 12。",
      "解得交點的 x 座標為 4。"
    ],
    "unit": "無",
    "knowledgePoint": "一次函數與座標軸交點",
    "difficulty": "中等"
  },
  {
    "question": "一個數的 4 倍減去 7，等於該數的 2 倍加 9。這個數是多少？",
    "options": [
      "6",
      "7",
      "8",
      "9"
    ],
    "answer": 2,
    "explanation": "設這個數為 x，列式 4x－7＝2x＋9，得 2x＝16，因此 x＝8。 正確答案：C「8」。",
    "solutionSteps": [
      "設這個數為 x，依題意列式 4x－7 = 2x＋9。",
      "移項得 2x = 16。",
      "解得 x = 8。"
    ],
    "unit": "無",
    "knowledgePoint": "文字敘述列一元一次方程式",
    "difficulty": "中等"
  },
  {
    "question": "小明每分鐘走 80 公尺，小華每分鐘走 65 公尺。兩人同時從同一地點朝同方向出發，幾分鐘後小明會領先小華 300 公尺？",
    "options": [
      "15 分鐘",
      "18 分鐘",
      "20 分鐘",
      "24 分鐘"
    ],
    "answer": 2,
    "explanation": "兩人每分鐘相差 80－65＝15 公尺。要拉開 300 公尺需 300÷15＝20 分鐘。 正確答案：C「20 分鐘」。",
    "solutionSteps": [
      "兩人每分鐘的距離差為 80－65 = 15 公尺。",
      "設經過 t 分鐘，領先距離為 15t 公尺。",
      "列式 15t = 300，解得 t = 20 分鐘。"
    ],
    "unit": "分鐘",
    "knowledgePoint": "同方向追及與速率差",
    "difficulty": "進階"
  },
  {
    "question": "某班有 40 人，其中 18 人搭公車、14 人騎腳踏車，其餘步行。隨機選 1 人，選到步行同學的機率是多少？",
    "options": [
      "1/5",
      "1/4",
      "3/10",
      "2/5"
    ],
    "answer": 0,
    "explanation": "步行人數為 40－18－14＝8 人，總人數 40 人，機率為 8/40＝1/5。 正確答案：A「1/5」。",
    "solutionSteps": [
      "步行人數為 40－18－14 = 8 人。",
      "全班共有 40 人。",
      "選到步行同學的機率為 8/40 = 1/5。"
    ],
    "unit": "無",
    "knowledgePoint": "統計資料判讀與機率",
    "difficulty": "中等"
  },
  {
    "question": "直線 y＝2x＋b 通過點 (3, 11)，則 b 的值是多少？",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": 2,
    "explanation": "將點 (3,11) 代入 y＝2x＋b，得 11＝2×3＋b，因此 b＝5。 正確答案：C「5」。",
    "solutionSteps": [
      "將 x = 3、y = 11 代入 y = 2x＋b。",
      "得到 11 = 6＋b。",
      "解得 b = 5。"
    ],
    "unit": "無",
    "knowledgePoint": "一次函數係數與點的座標",
    "difficulty": "中等"
  }
];
if(rows.length!==25)throw new Error("Expected 25 reviewed math items");
const norm=s=>s.replace(/\\s+/g,"").toLowerCase();const keys=new Set(bank.filter(x=>!(Number(x.id.slice(4))>=176&&Number(x.id.slice(4))<=200)).map(x=>norm(x.question+"|"+x.options.join("|"))));
for(let i=0;i<25;i++){const item=rows[i],id="MAT-"+String(i+176).padStart(4,"0"),row=bank.find(x=>x.id===id);if(!row||item.options.length!==4||new Set(item.options).size!==4||item.answer<0||item.answer>3||item.solutionSteps.length!==3)throw new Error("Invalid "+id);const key=norm(item.question+"|"+item.options.join("|"));if(keys.has(key))throw new Error("Duplicate "+id);keys.add(key);Object.assign(row,{gradeSemester:"九年級",unit:item.unit,knowledgePoint:item.knowledgePoint,difficulty:item.difficulty,type:"素養題",question:item.question,options:item.options,answer:item.answer,explanation:item.explanation,solutionSteps:item.solutionSteps,teacherTip:"先定義未知數或整理已知量，再依題意列式，最後檢查單位和答案是否合理。",relatedWords:[],sourceType:"原創會考程度練習"});}
await writeFile(path, JSON.stringify(bank, null, 2) + String.fromCharCode(10), "utf8");console.log("Rebuilt MAT-0176–0200 with 25 teacher-reviewed items.");
