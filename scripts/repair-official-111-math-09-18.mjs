import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  {
    id: "OFF-0326",
    question: "箱子內有分別標示號碼 1～6 的球，每個號碼各 2 顆，共 12 顆。小茹先不放回地抽出 5 顆，號碼為 1、2、2、3、5。阿純再從剩餘球中等機率抽 1 顆，抽到的號碼與小茹已抽出的任一顆球號碼相同的機率是多少？",
    options: ["3/6", "4/6", "3/7", "4/7"], answer: 2,
    explanation: "小茹抽出的號碼種類為 1、2、3、5。箱中每個號碼原有 2 顆，抽完後剩下 7 顆；其中號碼 1 剩 1 顆、2 剩 0 顆、3 剩 1 顆、5 剩 1 顆，共 3 顆符合。所求機率為 3/7，答案 C。",
    solutionSteps: ["先算剩餘球數：12−5＝7 顆。", "對小茹抽過的號碼 1、2、3、5，剩餘顆數分別為 1、0、1、1，共 3 顆。", "符合條件的球有 3 顆、總球數 7 顆，機率＝3/7，答案 C。"],
    teacherTip: "抽球不放回時，要先更新各號碼的剩餘顆數，不能仍用原本的 12 顆作分母。", requiresImage: false,
  },
  {
    id: "OFF-0327",
    question: "已知一元二次方程式（x−2）²＝3 的兩根為 a、b，且 a＞b，求 2a＋b 之值為何？",
    options: ["9", "−3", "6＋√3", "−6＋√3"], answer: 2,
    explanation: "由（x−2）²＝3 得 x−2＝±√3，因此兩根為 2＋√3 與 2−√3。因 a＞b，a＝2＋√3、b＝2−√3；所以 2a＋b＝2（2＋√3）＋（2−√3）＝6＋√3，答案 C。",
    solutionSteps: ["對方程式開平方：x−2＝±√3。", "兩根是 2＋√3、2−√3；依 a＞b，a＝2＋√3，b＝2−√3。", "代入 2a＋b＝2（2＋√3）＋（2−√3）＝6＋√3，答案 C。"],
    teacherTip: "先依大小條件指定 a、b，再代入式子；不要忽略根的順序。", requiresImage: false,
  },
  {
    id: "OFF-0328",
    question: "哥哥說：「遊戲機的售價比我的預算多 1,200 元。」妹妹說：「遊戲機正在打八折，折後價格比哥哥的預算少 200 元。」哥哥的預算是多少元？",
    options: ["3,800", "4,800", "5,800", "6,800"], answer: 2,
    explanation: "設預算為 B 元，原價為 B＋1,200 元；八折後為 B−200 元。列式 0.8（B＋1,200）＝B−200，解得 0.2B＝1,160，B＝5,800，答案 C。",
    solutionSteps: ["設哥哥預算為 B，則遊戲機原價為 B＋1,200。", "依八折後少 200 元列式：0.8（B＋1,200）＝B−200。", "解得 0.8B＋960＝B−200，所以 B＝5,800 元，答案 C。"],
    teacherTip: "先把原價和預算分別設成代數式，再將折扣後價格與預算關係列方程式。", requiresImage: false,
  },
  {
    id: "OFF-0329",
    question: "已知 p＝7.52×10⁻⁶，下列關於 p 值的敘述何者正確？",
    options: ["小於 0", "介於 0 與 1 之間，且較接近 0", "介於 0 與 1 之間，且較接近 1", "大於 1"], answer: 1,
    explanation: "7.52 為正數，乘上 10⁻⁶＝0.000001 後，p＝0.00000752。此值大於 0 且小於 1，並且與 0 的距離遠小於與 1 的距離，答案 B。",
    solutionSteps: ["10⁻⁶＝1/1,000,000，因此 p＝7.52/1,000,000。", "p＝0.00000752，故 0＜p＜1。", "p 非常接近 0，答案 B。"],
    teacherTip: "負指數表示小數；先判斷正負，再比較數值與 0、1 的距離。", requiresImage: false,
  },
  {
    id: "OFF-0330",
    question: "如圖，AB 為圓 O 的弦，C 點在 AB 上。若 AC＝6、BC＝2，且圓心 O 到弦 AB 的垂直距離為 3，求 OC 的長度。",
    options: ["3", "4", "√11", "√13"], answer: 3,
    explanation: "弦 AB＝6＋2＝8，圓心到弦的垂線平分弦，所以垂足到 A、B 各為 4。C 距 A 為 6，因此 C 與弦中點相距 6−4＝2。圓心、弦中點及 C 形成直角三角形，OC＝√（3²＋2²）＝√13，答案 D。",
    solutionSteps: ["AB＝AC＋CB＝8；圓心到弦的垂線會平分弦，半弦長為 4。", "弦中點距 A 為 4，而 AC＝6，所以 C 到弦中點的距離為 2。", "套用畢氏定理：OC＝√（3²＋2²）＝√13，答案 D。"],
    teacherTip: "圓心到弦的垂線平分弦；先找弦中點，再建立直角三角形。", requiresImage: true,
    requiresImage: true,
  },
  {
    id: "OFF-0331",
    question: "某國調查 750 萬名受僱員工的年薪，平均年薪為 60 萬元。年薪低於 60 萬元的各薪資區間人數（萬人）依序為：0～6 萬 5 人、6～12 萬 5 人、12～18 萬 10 人、18～24 萬 40 人、24～30 萬 80 人、30～36 萬 100 人、36～42 萬 80 人、42～48 萬 80 人、48～54 萬 65 人、54～60 萬 45 人。年薪低於平均數的人數占總調查人數的百分率為何？",
    options: ["6%", "50%", "68%", "73%"], answer: 2,
    explanation: "年薪低於 60 萬的員工數為 5＋5＋10＋40＋80＋100＋80＋80＋65＋45＝510 萬人。占總人數 750 萬人的比例為 510÷750＝0.68＝68%，答案 C。",
    solutionSteps: ["將平均數 60 萬以下各組人數相加：5＋5＋10＋40＋80＋100＋80＋80＋65＋45＝510 萬人。", "低於平均數的人數比例＝510÷750。", "510÷750×100%＝68%，答案 C。"],
    teacherTip: "平均數不表示一半的人低於平均；須依各組實際人數加總。", requiresImage: false,
  },
  {
    id: "OFF-0332",
    question: "在 △ABC 中，D 點在 AB 上，E 點在 BC 上，DE 為 AB 的中垂線。已知 ∠B＝∠C，且 ∠EAC＞90°。圖中 ∠1、∠2、∠3 依序為 ∠BED、∠DEA、∠AEC，判斷下列何者正確？",
    options: ["∠1＝∠2，且 ∠1＜∠3", "∠1＝∠2，且 ∠1＞∠3", "∠1≠∠2，且 ∠1＜∠3", "∠1≠∠2，且 ∠1＞∠3"], answer: 1,
    explanation: "E 在 AB 的中垂線上，所以 EA＝EB，△ABE 為等腰三角形；又 E 在 BC 上，故 ∠ABE＝∠B。設 ∠B＝∠C＝β，則 ∠BAE＝β，且 DE⊥AB，因此 ∠1＝∠2＝90°−β。由 ∠EAC＞90° 可得 β＜30°；在 △AEC 中，∠3＝180°−∠EAC−β＜90°−β＝∠1。故 ∠1＝∠2 且 ∠1＞∠3，答案 B。",
    solutionSteps: ["E 在 AB 的中垂線上，所以 EA＝EB；△ABE 等腰，∠BAE＝∠ABE＝∠B。", "設 ∠B＝∠C＝β。因 DE⊥AB 且 EB 與 BC 同一直線，∠1＝90°−β；△ABE 的頂角與垂線關係得 ∠2 也等於 90°−β。", "∠EAC＞90°，所以 △AEC 中 ∠3＝180°−∠EAC−β＜90°−β＝∠1；選 ∠1＝∠2 且 ∠1＞∠3，答案 B。"],
    teacherTip: "先由中垂線推出等距與等腰三角形，再使用平行／垂直及三角形內角和比較角度。",
    requiresImage: true,
  },
  {
    id: "OFF-0334",
    question: "圖中 △ABC 的兩條截線 L、M 分別平行於 BC、AB。L 與 AC 的交點標示一個 120° 鈍角，M 與 AC 的交點標示一個 115° 鈍角。求 ∠B 的度數。",
    options: ["55°", "60°", "65°", "70°"], answer: 0,
    explanation: "因 L∥BC，圖中 120° 與三角形 C 角互補，所以 ∠C＝60°。因 M∥AB，圖中 115° 與頂角 A 互補，所以 ∠A＝65°。三角形內角和為 180°，故 ∠B＝180°−60°−65°＝55°，答案 A。",
    solutionSteps: ["由 L∥BC，120° 為 ∠C 的外角補角，∠C＝180°−120°＝60°。", "由 M∥AB，115° 為 ∠A 的外角補角，∠A＝180°−115°＝65°。", "∠B＝180°−60°−65°＝55°，答案 A。"],
    teacherTip: "遇到平行線先找同位角、內錯角或補角，再用三角形內角和。", requiresImage: true,
    requiresImage: true,
  },
  {
    id: "OFF-0335",
    question: "鞋店活動：同時買兩雙鞋，較便宜的一雙以六折計價；活動不得與折價券合用。小徹買一雙球鞋和一雙皮鞋，並持有全品項八折券。使用折價券與參加活動的花費相差 50 元。下列敘述何者正確？",
    options: ["折價券較省，兩雙鞋定價差 100 元", "折價券較省，兩雙鞋定價差 250 元", "特惠活動較省，兩雙鞋定價差 100 元", "特惠活動較省，兩雙鞋定價差 250 元"], answer: 1,
    explanation: "設較貴鞋價 H、較便宜鞋價 L。折價券費用為 0.8H＋0.8L；活動費用為 H＋0.6L。活動比折價券多 50 元，因此 0.2H−0.2L＝50，得 H−L＝250。折價券花費較少，答案 B。",
    solutionSteps: ["設兩雙定價為 H＞L；八折券總額為 0.8H＋0.8L。", "特惠活動只將較便宜的一雙打六折，總額為 H＋0.6L。", "活動減折價券＝0.2（H−L）＝50，所以價差 250 元，且折價券較省，答案 B。"],
    teacherTip: "依活動文字確認折扣套用在較便宜商品，並把兩種方案分別列式比較。", requiresImage: false,
    requiresImage: false,
  },
];

for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.options.length !== 4 || item.solutionSteps.length !== 3) throw new Error(`Invalid or answer mismatch: ${item.id}`);
  Object.assign(row, { question: item.question, options: item.options, optionsInImage: false, requiresImage: item.requiresImage, explanation: item.explanation, solutionSteps: item.solutionSteps, teacherTip: item.teacherTip });
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Reconstructed 9 source-backed 111 math questions, explanations and missing data from official page images; left the dimension-ambiguous descent-device item untouched.");
