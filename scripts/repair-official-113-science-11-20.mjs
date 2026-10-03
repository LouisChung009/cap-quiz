import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const makeReview = (number, page, note) => ({
  status: `已依113年官方自然科題本第${number}題核對`,
  note,
  evidenceSources: [`${base}113-science-p${page}.webp`],
});
const repairs = {
  "OFF-0835": {
    question: "密閉玻璃瓶中有紅棕色二氧化氮，降溫後部分二氧化氮結合成無色四氧化二氮：2NO₂ ⇌ N₂O₄。瓶內顏色先逐漸變淡，溫度固定一段時間後不再改變。此時正、逆反應速率的關係為何？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。顏色不再改變表示各物質濃度維持穩定，正、逆反應已達動態平衡；兩個方向仍持續反應，但速率相等，所以不是停止反應。",
    solutionSteps: ["密閉系統中，二氧化氮仍可生成四氧化二氮，四氧化二氮也可分解回二氧化氮。", "顏色與濃度不再隨時間改變，表示兩方向造成的濃度變化互相抵銷，故正反應速率等於逆反應速率。", "動態平衡不是反應停止；兩方向速率都大於零，因此選 B。"],
    teacherTip: "平衡時「速率相等、濃度不變」，不代表反應物和生成物等量，也不代表反應停止。",
    answerKeyReview: makeReview(11, 4, "依反應式與顏色不再變化判斷動態平衡；正逆反應持續且速率相等。"),
  },
  "OFF-0836": {
    question: "老師讓基因型皆為 Aa 的雄、雌長翅果蠅交配，請學生觀察 1,000 隻第一子代。小坪只觀察到 4 隻長翅及 6 隻短翅，就推測 1,000 隻中會有 400 隻長翅、600 隻短翅。老師認為理論上不太可能出現這種比例。根據上述資訊，第一子代長翅與短翅的理論表現型比例最可能為何？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。Aa × Aa 的理論子代基因型比例為 AA：Aa：aa＝1：2：1。A 為長翅顯性，因此長翅：短翅＝3：1，1,000 隻預期約為 750：250；小坪把 10 隻中 4：6 的偶然結果直接放大成 400：600，與理論比例差異太大。",
    solutionSteps: ["雄、雌親代皆為 Aa，各自形成 A 或 a 配子，四種組合為 AA、Aa、Aa、aa。", "前三種基因型帶有顯性 A，表現長翅；只有 aa 表現短翅，因此理論表現型比例為 3：1。", "若觀察 1,000 隻，預期約 750 隻長翅、250 隻短翅；4：6 是僅觀察 10 隻的小樣本結果，不宜直接放大成 400：600，選 D。"],
    teacherTip: "先用棋盤方格列出 Aa × Aa 的四種組合，再比較樣本量：10 隻的比例容易受偶然影響，不能直接當成 1,000 隻的可靠預測。",
    answerKeyReview: makeReview(12, 5, "核對題本第5頁：Aa×Aa，僅觀察4隻長翅與6隻短翅，即外推至1,000隻為400與600；此小樣本外推與理論3：1不符。"),
  },
  "OFF-0837": {
    question: "實驗中，兩個以相同方向繞製的相同銅線螺線管分別接上相同檢流計；兩個相同磁鐵一個 N 極朝上、另一個 N 極朝下，分別置於線圈上方 20 cm 處後由靜止釋放。磁鐵進入線圈時，甲、乙檢流計測得的感應電流方向及大小，何者最合理？",
    options: ["方向相同，甲大於乙", "方向相同，兩者大致相同", "方向不同，甲大於乙", "方向不同，兩者大致相同"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 D。磁鐵以相反磁極進入線圈，穿過線圈的磁通量變化方向相反；依楞次定律，感應電流方向相反。磁鐵、線圈、釋放高度與運動條件相同，磁通量變化率大小近似相同，所以感應電流大小大致相同。",
    solutionSteps: ["兩磁鐵相同且由相同高度自由落下，進入線圈時速率及磁場變化量級相近。", "但朝下的磁極相反，線圈磁通量改變方向相反，感應電流方向也相反。", "因此方向不同、大小大致相同，選 D。"],
    teacherTip: "電磁感應要分別比較磁通量「改變方向」與「改變快慢」；前者決定電流方向，後者影響電流大小。",
    answerKeyReview: makeReview(13, 5, "將原圖磁鐵極性、兩個相同線圈與四種表格選項轉寫成完整文字；依電磁感應及對稱條件判定 D。"),
  },
  "OFF-0838": {
    question: "圖示將河川鯰魚族群數量分為甲、乙、丙、丁四個時期：甲數量增加，乙持續增加，丙大致穩定，丁減少。哪個時期可判定「出生數＋遷入數＞死亡數＋遷出數」？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。族群數量增加時，增加來源（出生、遷入）合計大於減少來源（死亡、遷出）合計。圖示乙期數量上升，符合這個關係。",
    solutionSteps: ["族群變化可寫成：期末數量＝期初數量＋出生＋遷入－死亡－遷出。", "曲線在乙期向上，表示出生與遷入的總量超過死亡與遷出的總量。", "因此選項 B 正確；丙期穩定表示兩者相等，丁期下降則減少來源較大。"],
    teacherTip: "讀族群曲線看斜率：上升代表淨增加，水平代表大致平衡，下降代表淨減少。",
    answerKeyReview: makeReview(14, 5, "依題本族群數量曲線各時期趨勢判讀乙期上升。"),
  },
  "OFF-0839": {
    question: "圖(十一)是北半球地面附近的等壓線圖，其中一條曲線標示 1020 hPa。若再知道另一條等壓線的數值，利用氣壓梯度與北半球風場特性，可合理推論何者？",
    options: ["等壓線密集處的氣壓值一定較高", "標示 1020 hPa 的等壓線一定是氣壓最高處", "可由等壓線數值推知該處大致溫度", "可判斷氣壓高低方向，進而推估此處大致風向"],
    requiresImage: true, requiresContext: false, optionsInImage: false,
    questionImages: [`${base}113-science-p5.webp`], questionImage: `${base}113-science-p5.webp`,
    explanation: "答案 D。單條等壓線只表示線上各點氣壓相同；再知道相鄰等壓線的數值，才能判斷高、低壓方向，配合等壓線走向與北半球風場特性推估大致風向。線距密不代表壓力值較高，1020 也不能單獨判定為最高值；氣壓數值本身不能直接給出溫度。",
    solutionSteps: ["等壓線上的數字是氣壓值，不是溫度；單獨看到 1020 hPa 不能判定全圖最高或最低。", "相鄰等壓線的數值可顯示氣壓增加、降低的方向；線距反映氣壓梯度大小，不是氣壓值大小。", "已知北半球及等壓線方向後，可用水平氣壓梯度和地轉偏向等關係估計近地面風向，因此選 D。"],
    teacherTip: "等壓線的數值看氣壓高低，線距看梯度強弱；不要把「線密」誤解成「氣壓值高」。",
    answerKeyReview: makeReview(15, 5, "保留必要的原始等壓線圖；題幹與四個選項已轉成可讀文字，正確概念為利用相鄰數值判斷壓力梯度與大致風向。"),
  },
  "OFF-0840": {
    question: "汽車胎壓監測裝置以 psi 顯示數值；1 psi＝1 磅力／平方英寸，且磅力是力、英寸是長度單位。依此單位判斷，裝置最可能測量輪胎的哪一種物理量？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。壓力定義為單位面積所受的力，單位可寫成力／面積。psi 正是磅力除以平方英寸，因此量測的是輪胎內氣體的壓力。",
    solutionSteps: ["把單位拆開：分子是磅力，代表力；分母是平方英寸，代表面積。", "力除以面積是壓力，不是轉動頻率、推力本身或摩擦力。", "胎壓裝置量測輪胎內的氣體壓力，選 B。"],
    teacherTip: "遇到陌生單位先化成基本物理量；壓力的單位特徵是「力／面積」。",
    answerKeyReview: makeReview(16, 6, "依 psi＝磅力／平方英寸的題幹單位判斷壓力，已移除不必要的題本掃描。"),
  },
  "OFF-0841": {
    question: "研究牙齒酸蝕時，將大小相近的豬牙浸在不同 pH 的鹽酸中，測量重量減少。實驗一數據如下：pH 2.4 的 X 組第1天減少 6.82%、第2天 7.87%；pH 3.7 的 Y 組分別減少 4.15%、4.92%；pH 3.1 的 Z 組分別減少 5.95%、6.76%。實驗二中，大小相近的豬牙分別浸泡 pH 介於 2～4 的甲、乙、丙飲料，重量減少百分比為丙＜甲＜乙。若只考慮 pH 的影響，哪個推論最合理？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。實驗一顯示 pH 越低（酸性越強），牙齒重量減少越多；實驗二乙造成的重量減少最大，因此乙的 pH 最低、最酸。",
    solutionSteps: ["比較實驗一：pH 2.4 的 X 組損耗最大，pH 3.7 的 Y 組損耗最小，支持 pH 越低酸蝕越明顯。", "實驗二的損耗排序是乙＞甲＞丙，所以乙的酸蝕最強。", "只考慮 pH 時，乙的 pH 應最小，選 B；「最酸」不等於 pH 最大。"],
    teacherTip: "先依表格建立變因關係，再把第二個實驗的結果套回去；酸性越強，pH 越低。",
    answerKeyReview: makeReview(17, 6, "完整轉錄官方表格數值並依兩組實驗的重量損失排序判斷 B。"),
  },
  "OFF-0842": {
    question: "一篇報導指出，重力波由帶質量物體的加速度運動造成，在時空中傳播，不需要介質，且以光速傳播。依題目提供的資訊，重力波的性質最接近何者？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。力學波必須藉由介質中的振動傳遞；重力波依題幹可在不需要介質的情況下傳播，因此不屬於力學波，和光波同樣不需介質。超聲波和水波都需要介質。",
    solutionSteps: ["判斷力學波的關鍵不是波名，而是傳播是否需要介質。", "題幹明確說重力波不需要介質，所以排除水波、超聲波等力學波。", "光波也不需介質，兩者都不屬於力學波，選 C。"],
    teacherTip: "可用「是否需要介質」區分力學波與非力學波；聲波、超聲波和水波都需要介質。",
    answerKeyReview: makeReview(18, 6, "依題幹關於重力波不需介質的報導判斷，完整報導內容已嵌入題目。"),
  },
  "OFF-0843": {
    question: "甲、乙、丙、丁均為純物質，元素質量百分比如下：甲含 C 75%、H 25%、O 0%；乙含 C 27%、H 0%、O 73%；丙含 C 100%、H 0%、O 0%；丁含 C 52%、H 13%、O 35%。依國中課程中有機化合物的判準，哪些物質不可能是有機化合物？（原子量：C＝12、H＝1、O＝16）",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B（乙、丙）。乙只含碳、氧且質量比約為 12：32，可對應二氧化碳這類無機碳氧化物；丙是單一元素碳，不是化合物。甲與丁都含碳、氫，符合國中課程常用的有機化合物判別特徵。",
    solutionSteps: ["逐列看元素組成：乙沒有氫，C：O 質量比 27：73 約等於 12：32，可形成 CO₂，屬無機碳氧化物。", "丙只由碳元素構成，是元素物質而非化合物。", "因此不可能是有機化合物的是乙、丙，選 B。甲、丁同時含 C、H，符合課程中的有機物判準。"],
    teacherTip: "依題目採用的國中判準判讀時，留意「含碳」不等於有機物；二氧化碳等碳氧化物與元素碳都不是有機化合物。",
    answerKeyReview: makeReview(19, 6, "完整轉錄官方組成表；以乙的碳氧比例及丙為元素碳核對 B。"),
  },
  "OFF-0844": {
    question: "已知刺絲胞動物都生活在水中。有人主張「所有刺絲胞動物都生活在海洋中」，並以海月水母為例。若要檢驗這個全稱主張是否成立，哪種觀察最有力？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。要推翻「所有刺絲胞動物都生活在海洋中」這個全稱命題，只要找到一個反例：生活在淡水中的刺絲胞動物。再多海洋例子也不能證明所有個體都只生活在海洋。",
    solutionSteps: ["題目要檢驗的是全稱主張：「每一種刺絲胞動物都生活在海洋」。", "全稱命題可由一個反例推翻；若淡水中找到刺絲胞動物，它就不是生活在海洋。", "所以應到淡水中尋找一種刺絲胞動物，選 C。找到海洋物種只能增加例子，不能證明全稱。"],
    teacherTip: "檢驗「全部、所有、一定」等全稱敘述時，最有效的反證通常是一個可靠反例。",
    answerKeyReview: makeReview(20, 7, "依原題全稱命題判斷反例法；題幹與選項已完整文字化，移除掃描圖。"),
  },
};

for (const [id, patch] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 113 Science Q11–20 against original question pages.");
