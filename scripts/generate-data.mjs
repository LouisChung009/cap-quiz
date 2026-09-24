import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, "data");
const grades = ["七年級上", "七年級下", "八年級上", "八年級下", "九年級上", "九年級下"];
const difficulties = ["基礎", "基礎", "中等", "中等", "進階"];
const review = { intervalDays: 0, repetitions: 0, easeFactor: 2.5, lastReviewedAt: null, nextReviewAt: null };

function rotateOptions(correct, distractors, seed) {
  const all = [String(correct), ...distractors.map(String)].filter((value, index, values) => values.indexOf(value) === index).slice(0, 4);
  if (all.length !== 4) throw new Error(`選項無法建立：${correct}`);
  const answer = seed % 4;
  const options = [...all.slice(1)]; options.splice(answer, 0, all[0]);
  return { options, answer };
}
function numeric(correct, seed, suffix = "") {
  const delta = (seed % 5) + 1;
  return rotateOptions(`${correct}${suffix}`, [`${correct + delta}${suffix}`, `${correct - delta}${suffix}`, `${correct + delta * 2}${suffix}`], seed);
}
const teacherTips = {
  國文: { 成語意義: "成語題先放回原句判斷語境，不要只憑其中一個字猜意思。", 一字多義: "同一個字在不同句子可能有不同詞義與用法，要連同前後文判斷。", 擬人: "看到無生命事物出現人的動作、感情或語氣，通常就是擬人。", 主旨判斷: "主旨要涵蓋整段共同重點，避免選只提到局部細節或說法過度絕對的選項。", 借代: "借代不是比喻，而是用與對象密切相關的名稱代替本體。", 文意理解: "文言文先逐句換成白話，再比較各選項是否完整符合原意。", 成語選用: "先確認成語的感情色彩與使用對象，再檢查是否符合句中情境。", 問題分析解決: "篇章結構題可圈出轉折詞與段落功能，依提出問題、分析、解決的順序判斷。", 副詞修飾: "帶「地」的詞語通常修飾後面的動作，但仍要以句意確認。", 推己及人: "義理題要掌握核心價值，不要選範圍過大或過度極端的說法。" },
  數學: { 整數四則: "先乘除、後加減；遇到負號或括號時要特別標記，避免符號錯誤。", 一元一次方程式: "移項其實是等式兩邊做相同運算；最後可把答案代回原式驗算。", 比例式: "比例式可用外項乘積等於內項乘積，並注意題目各量的對應順序。", 矩形面積: "面積與周長公式不同，面積單位要寫平方單位。", 三角形內角: "三角形內角和固定為 180°，算完要確認第三角大於 0°。", 一次函數代入: "先用括號代入 x，再依運算順序計算，可避免正負號錯誤。", 平均數: "平均數＝總和÷資料個數；資料個數不要漏算。", 古典機率: "機率＝有利情形數÷所有等可能情形數，分子、分母不可顛倒。", 折扣: "幾折代表原價的十分之幾；八折是乘 0.8，不是減 0.8 元。", 平方根: "若題目限定正數，只取正平方根；若問平方根則通常要考慮正負兩值。" },
  自然: { 等速運動: "等速直線運動代表速度大小與方向都不變，因此加速度和合力皆為零。", 化學變化: "判斷重點是有沒有新物質生成；狀態改變通常仍是物理變化。", 光合作用: "不要混淆光合作用與呼吸作用：前者吸收二氧化碳，後者通常消耗氧氣。", 四季成因: "四季不是地球離太陽遠近造成，而是地軸傾斜配合公轉。", 重力位能: "同一物體的質量不變，高度增加時重力位能增加。", 酸鹼判斷: "25°C 時 pH＜7 為酸性、＝7 為中性、＞7 為鹼性。", 呼吸系統: "真正進行氣體交換的是肺泡；氣管主要負責輸送空氣。", 串聯電路: "串聯電路電流相同；並聯電路各支路電壓相同，兩者不要混用。", 地震規模: "規模描述地震釋能且同一地震只有一個；震度會因地點而不同。", 遺傳物質: "真核細胞大部分 DNA 在細胞核，但粒線體與葉綠體也含少量 DNA。" },
  社會: { 權力分立: "權力分立的核心是分權與制衡，不代表各機關彼此完全不合作。", 臺灣天氣: "依季節、風向與降雨型態判讀；夏秋強風豪雨常先想到颱風。", 清領初期: "歷史題要同時核對年代、政權與行政名稱，避免把日治或戰後名稱混入。", 供需法則: "判斷價格前先確認題目是否說其他條件不變，再分辨是需求或供給曲線移動。", 都市化: "都市化看都市人口比例與人口集中，不等於每個都市人口都必然增加。", 消費者保護: "商品安全、品質、標示與交易公平通常屬消費者保護範圍。", 工業革命: "記憶歷史事件時可連結時間、地點、條件與影響，而非只背單一答案。", 人口分布: "人口分布要綜合地形、交通、水源與產業，不宜只看單一自然因素。", 通貨膨脹: "物價普遍且持續上漲才是通膨；個別商品漲價不一定構成通膨。", 平等原則: "平等不是所有人一律相同，而是相同情況相同處理、合理差別可不同處理。" },
  英文: { 現在簡單式: "看到 every、usually、often 等頻率線索，要檢查第三人稱單數動詞是否加 -s／-es。", 過去進行式: "過去進行式為 was／were + V-ing，常描述另一個過去動作發生時正在進行的事。", 介系詞: "at 接明確時刻，on 接日期或星期，in 接月份、年份或較長期間。", 比較級: "看到 than 通常要用比較級；短形容詞多加 -er，不用 more short 這種重複比較。", 條件句: "第一類條件句為 If + 現在式，主句用 will + 原形動詞；if 子句不用 will。", 被動語態: "先判斷主詞是執行者還是承受者；被動語態必須有 be + 過去分詞。", 近義字: "近義字仍可能有語氣、正式程度與搭配差異，要放回句子確認。", 推論: "閱讀推論只能根據文中線索，不能加入文章沒有提供的背景。", 時間判讀: "先畫出時間先後；later 是更晚，earlier 是更早。", 語意轉折: "前後意思相反用 but／however／yet；因果關係則用 because 或 so。" }
};
const englishRelated = {
  現在簡單式: ["usually（通常）", "often（經常）", "every Monday（每週一）"], 過去進行式: ["while（當……時）", "at that time（當時）", "was／were + V-ing（正在……）"], 介系詞: ["at noon（在中午）", "at night（在夜晚）", "at + 時刻"], 比較級: ["shorter = less long（較短）", "faster = more quickly（較快）", "better（較好）"], 條件句: ["if（如果）", "unless = if...not（除非）", "on condition that（條件是）"], 被動語態: ["be made by（由……製作）", "be produced by（由……生產）", "be created by（由……創作）"], 近義字: ["rapid = quick = fast（快速的）", "swift（迅速的）", "speedy（快速的）"], 推論: ["probably = likely（很可能）", "expect（預期）", "suggest（暗示）"], 時間判讀: ["close = shut（關閉）", "arrive at = reach（抵達）", "later（較晚）"], 語意轉折: ["but = yet（但是）", "however（然而）", "although（雖然）"]
};
function teachingDetails(subject, knowledgePoint, body) {
  const correct = body.options[body.answer];
  return { solutionSteps: [`先辨認考點：本題考「${knowledgePoint}」。`, body.explanation, `排除不符合題意的選項後，可確定答案是「${correct}」。`], teacherTip: teacherTips[subject]?.[knowledgePoint] || "作答時先圈出關鍵詞，再逐一檢查選項是否完整符合題意。", relatedWords: subject === "英文" ? (englishRelated[knowledgePoint] || []) : [] };
}
function make(subject, code, index, meta, body) {
  return { id: `${code}-${String(index + 1).padStart(4, "0")}`, subject, gradeSemester: grades[index % grades.length], unit: meta.unit, knowledgePoint: meta.knowledgePoint, difficulty: difficulties[index % difficulties.length], type: meta.type || "單題選擇", ...body, ...teachingDetails(subject, meta.knowledgePoint, body), sourceType: "原創會考程度練習", review: { ...review } };
}

function mathQuestion(index) {
  const family = Math.floor(index / 100), n = index % 100, a = n + 2, b = (n % 17) + 3;
  const specs = [
    ["數與數線", "整數四則", () => { const value = a * 2 - b; return [`計算 ${a * 2}－${b} 的值。`, numeric(value, n), `${a * 2}－${b}＝${value}。`]; }],
    ["代數", "一元一次方程式", () => { const x = (n % 20) + 1, c = a * x + b; return [`若 ${a}x＋${b}＝${c}，則 x 為何？`, numeric(x, n), `移項得 ${a}x＝${c - b}，所以 x＝${x}。`]; }],
    ["比例", "比例式", () => { const x = a * b; return [`若 x：${a}＝${b}：1，則 x 為何？`, numeric(x, n), `x＝${a}×${b}＝${x}。`]; }],
    ["幾何", "矩形面積", () => { const area = a * b; return [`一個長方形長 ${a} 公分、寬 ${b} 公分，面積為何？`, numeric(area, n, " 平方公分"), `長方形面積＝長×寬＝${a}×${b}＝${area} 平方公分。`]; }],
    ["幾何", "三角形內角", () => { const x = 30 + n % 50, y = 40 + n % 40, z = 180 - x - y; return [`三角形兩內角為 ${x}°、${y}°，第三角為何？`, numeric(z, n, "°"), `三角形內角和為 180°，所以第三角為 ${z}°。`]; }],
    ["函數", "一次函數代入", () => { const x = n % 15, value = a * x + b; return [`已知 y＝${a}x＋${b}，當 x＝${x} 時，y 為何？`, numeric(value, n), `代入得 y＝${a}×${x}＋${b}＝${value}。`]; }],
    ["統計", "平均數", () => { const mean = a + 3; const values = [a, a + 2, a + 4, a + 6]; return [`資料 ${values.join("、")} 的平均數為何？`, numeric(mean, n), `總和為 ${mean * 4}，除以 4 得 ${mean}。`]; }],
    ["機率", "古典機率", () => { const total = 6 + n % 10, good = 1 + n % (total - 1); const correct = `${good}/${total}`; return [`第 ${n + 1} 號袋中有 ${total} 顆大小相同的球，其中 ${good} 顆為紅球。隨機取一顆，取到紅球的機率為何？`, rotateOptions(correct, [`${good + 1}/${total}`, `${good}/${total + 1}`, `${good + 1}/${total + 1}`], n), `有利情形 ${good} 種、全部 ${total} 種，機率為 ${correct}。`]; }],
    ["百分率", "折扣", () => { const price = (n + 10) * 100, rate = [5, 6, 7, 8][n % 4], value = price * rate / 10; return [`定價 ${price} 元的商品打 ${rate} 折，售價為何？`, numeric(value, n, " 元"), `${price}×${rate / 10}＝${value} 元。`]; }],
    ["根式與乘方", "平方根", () => { const base = n + 2, square = base * base; return [`若 x 為正數且 x²＝${square}，則 x 為何？`, numeric(base, n), `因為 ${base}²＝${square}，且 x 為正數，所以 x＝${base}。`]; }]
  ];
  const [unit, knowledgePoint, build] = specs[family]; const [question, choice, explanation] = build();
  return make("數學", "MAT", index, { unit, knowledgePoint }, { question, ...choice, explanation });
}

function englishQuestion(index) {
  const family = Math.floor(index / 100), n = index % 100;
  const names = ["Amy","Ben","Cindy","David","Emma","Frank","Grace","Henry","Iris","Jason"];
  const name = names[n % names.length], place = ["school","the library","the park","the station","the museum"][Math.floor(n / 10) % 5];
  const specs = [
    ["文法", "現在簡單式", `${name} ___ to ${place} every Monday.`, "goes", ["go","went","going"], `主詞 ${name} 為第三人稱單數，習慣動作用 goes。`],
    ["文法", "過去進行式", `${name} ___ dinner when the phone rang at ${6 + n % 4}:00.`, "was eating", ["eats","is eating","has eaten"], "過去某動作發生時正在進行的行為用過去進行式。"],
    ["文法", "介系詞", `The ${["meeting","class","show","game"][n % 4]} starts ___ ${7 + n % 5}:00 p.m.`, "at", ["in","on","from"], "特定時刻前使用介系詞 at。"],
    ["文法", "比較級", `This route is ___ than the old one for ${name}.`, "shorter", ["short","shortest","more short"], "句中有 than，使用形容詞比較級 shorter。"],
    ["文法", "條件句", `If it ___ tomorrow, ${name} will stay home.`, "rains", ["rained","will rain","raining"], "第一類條件句的 if 子句用現在式。"],
    ["文法", "被動語態", `The cake for table ${n + 1} ___ by ${name} yesterday.`, "was made", ["made","is made","makes"], "yesterday 表示過去，蛋糕是被製作，使用 was made。"],
    ["字彙", "近義字", `In report ${n + 1}, which word is closest in meaning to “rapid”?`, "quick", ["slow","quiet","weak"], "rapid 與 quick 都有「快速的」之意。"],
    ["閱讀", "推論", `${name} brought an umbrella to ${place} because the sky was dark and cloudy. What did ${name} probably expect?`, "Rain", ["Strong sunshine","Snow","A dry day"], "Dark clouds and an umbrella suggest expected rain."],
    ["閱讀", "時間判讀", `${place.replace(/^./, c => c.toUpperCase())} closes at ${5 + n % 3}:00 p.m. ${name} arrived ten minutes later. What is most likely true?`, "It was closed.", ["It was open all night.",`${name} was early.`,"It opened ten minutes later."], "抵達時間晚於閉館時間，因此場所已關閉。"],
    ["連接詞", "語意轉折", `${name} was tired after trip ${n + 1}, ___ still finished the homework.`, "but", ["because","if","so"], "前後語意相反，使用 but 表示轉折。"]
  ];
  const [unit, knowledgePoint, question, correct, distractors, explanation] = specs[family];
  return make("英文", "ENG", index, { unit, knowledgePoint }, { question: `Practice ${family + 1}-${n + 1}: ${question}`, ...rotateOptions(correct, distractors, n), explanation });
}

function chineseQuestion(index) {
  const family = Math.floor(index / 100), n = index % 100, scene = `閱讀札記第 ${n + 1} 則`;
  const specs = [
    ["成語", "成語意義", `${scene}寫道：「規劃活動前先查天氣、備妥雨具，真是未雨綢繆。」句中「未雨綢繆」最接近何意？`, "事先準備", ["事後補救","臨時改變","順其自然"], "未雨綢繆比喻事先做好準備。"],
    ["字義", "一字多義", `${scene}引用「不恥下問」。其中「恥」的意思最接近下列何者？`, "以……為可恥", ["感到害怕","公開責備","十分討厭"], "此處「恥」是意動用法，指以某事為可恥。"],
    ["修辭", "擬人", `${scene}有句：「晚風輕輕敲著第 ${n + 1} 扇窗，催我們入睡。」主要運用哪一種修辭？`, "擬人", ["排比","設問","借代"], "把風寫成會敲窗、催人入睡，賦予人的動作。"],
    ["閱讀理解", "主旨判斷", `${scene}說：「真正的節省，不是完全不花費，而是把有限資源用在最需要的地方。」這段話的主旨為何？`, "資源應有效配置", ["任何消費都應停止","存錢是唯一目標","需求愈少一定愈好"], "重點是讓有限資源用在真正需要之處。"],
    ["語文常識", "借代", `${scene}提到「朱門酒肉臭」。其中「朱門」主要代指什麼？`, "富貴人家", ["紅色木材","城門守衛","一般百姓"], "朱門原指紅漆大門，此處借代富貴之家。"],
    ["文言文", "文意理解", `${scene}引用「學而不思則罔，思而不學則殆」，最適合用來說明什麼？`, "學習與思考應並重", ["只要勤讀便足夠","思考可取代學習","學習時不宜提問"], "句意強調學與思不可偏廢。"],
    ["詞語運用", "成語選用", `整理第 ${n + 1} 號資料櫃時，文件分類清楚、次序分明。最適合用哪個成語形容？`, "井然有序", ["捕風捉影","刻舟求劍","杯弓蛇影"], "井然有序指整齊而有次序。"],
    ["篇章結構", "問題分析解決", `${scene}先提出校園浪費問題，再列數據分析原因，最後提出改善方法。其結構最接近何者？`, "問題—分析—解決", ["純粹描寫","倒敘回憶","並列抒情"], "文章依序提出問題、分析原因並提出解法。"],
    ["詞性", "副詞修飾", `${scene}寫道：「他快速地跑向第 ${n + 1} 月臺。」其中「快速」主要修飾哪個詞？`, "跑", ["他","月臺","向"], "「快速地」說明「跑」這個動作的方式。"],
    ["思想義理", "推己及人", `${scene}引用「己所不欲，勿施於人」，最主要提醒我們什麼？`, "尊重他人感受", ["凡事一味忍耐","避免所有競爭","完全服從多數"], "不要把自己不願承受的事強加在別人身上。"]
  ];
  const [unit, knowledgePoint, question, correct, distractors, explanation] = specs[family];
  return make("國文", "CHI", index, { unit, knowledgePoint }, { question, ...rotateOptions(correct, distractors, n), explanation });
}

function scienceQuestion(index) {
  const family = Math.floor(index / 100), n = index % 100, sample = n + 1;
  const specs = [
    ["物理", "等速運動", `實驗 ${sample} 中，小車沿直線等速度前進。忽略阻力時，其合力為何？`, "合力為零", ["持續增加","方向不斷改變","一定大於重力"], "等速直線運動的速度不變，合力為零。"],
    ["化學", "化學變化", `觀察紀錄 ${sample} 中，哪一現象屬於化學變化？`, "鐵釘生鏽", ["冰塊融化","水受熱沸騰","糖溶於水"], "鐵生鏽產生新物質氧化鐵。"],
    ["生物", "光合作用", `第 ${sample} 株綠色植物進行光合作用時，主要吸收哪一種氣體？`, "二氧化碳", ["氧氣","氮氣","氫氣"], "光合作用利用二氧化碳與水合成有機物。"],
    ["地球科學", "四季成因", `針對觀測點 ${sample} 的四季變化，最主要的成因為何？`, "地軸傾斜且地球繞太陽公轉", ["地球每天自轉","月球繞地球公轉","太陽亮度每季劇變"], "地軸傾斜配合公轉，使日照角度與時間出現季節差異。"],
    ["能量", "重力位能", `將編號 ${sample} 的同一物體由一樓搬到五樓，明顯增加的是哪一項？`, "重力位能", ["質量","密度","電量"], "同一物體高度增加，重力位能增加。"],
    ["化學", "酸鹼判斷", `溶液 ${sample} 的 pH 值為 ${1 + n % 6}，此溶液屬於哪一類？`, "酸性", ["中性","鹼性","無法判斷"], "pH 小於 7 的水溶液呈酸性。"],
    ["生物", "呼吸系統", `人體模型 ${sample} 中，負責與外界進行氣體交換的主要器官為何？`, "肺", ["胃","腎臟","肝臟"], "肺泡是氧氣與二氧化碳交換的主要場所。"],
    ["電學", "串聯電路", `在編號 ${sample} 的串聯電路中，各處電流大小的關係為何？`, "處處相同", ["沿途愈來愈大","沿途愈來愈小","各處一定為零"], "串聯電路只有單一路徑，各處電流相同。"],
    ["地球科學", "地震規模", `地震事件 ${sample} 的「規模」主要描述什麼？`, "地震釋放能量的大小", ["單一地點的搖晃程度","房屋受損的數量","震央附近的人口"], "規模表示地震本身釋放能量的大小。"],
    ["生物", "遺傳物質", `觀察第 ${sample} 個真核細胞時，大部分 DNA 位於哪個構造？`, "細胞核", ["細胞膜","液胞","細胞壁"], "真核細胞的大部分遺傳物質位於細胞核。"]
  ];
  const [unit, knowledgePoint, question, correct, distractors, explanation] = specs[family];
  return make("自然", "SCI", index, { unit, knowledgePoint }, { question, ...rotateOptions(correct, distractors, n), explanation });
}

function socialQuestion(index) {
  const family = Math.floor(index / 100), n = index % 100, caseNo = n + 1;
  const specs = [
    ["公民", "權力分立", `案例 ${caseNo} 討論民主政府的權力分立，其最主要目的為何？`, "避免權力過度集中", ["提高所有稅率","取消定期選舉","讓意見完全一致"], "權力分立與制衡可降低權力過度集中的風險。"],
    ["地理", "臺灣天氣", `氣象紀錄 ${caseNo} 顯示臺灣夏季出現強風豪雨，最可能受哪種天氣系統影響？`, "颱風", ["寒流","沙塵暴","暴風雪"], "西北太平洋颱風常在夏秋影響臺灣。"],
    ["臺灣史", "清領初期", `史料編號 ${caseNo} 提到清廷於 1684 年設置行政區管轄臺灣，該行政區為何？`, "臺灣府", ["臺北州","高雄州","臺灣省"], "1684 年清廷設臺灣府，隸屬福建省。"],
    ["經濟", "供需法則", `市場案例 ${caseNo} 中，其他條件不變而商品需求增加，價格通常受到何種壓力？`, "上升", ["下降","固定不變","必定歸零"], "供給不變時，需求增加通常使均衡價格上升。"],
    ["地理", "都市化", `人口資料 ${caseNo} 顯示大量人口由鄉村移往都市，最直接造成哪種現象？`, "都市化程度提高", ["海平面下降","板塊停止移動","季風消失"], "人口向都市集中會提高都市人口比例。"],
    ["公民", "消費者保護", `交易案例 ${caseNo} 中，消費者買到有重大瑕疵的商品，最直接涉及哪一類權益？`, "消費者權益", ["參政權","宗教自由","著作人格權"], "商品品質與交易保障屬消費者保護範圍。"],
    ["世界史", "工業革命", `歷史卡片 ${caseNo} 問：工業革命最早在哪一國發展？`, "英國", ["日本","印度","巴西"], "18 世紀後期工業革命首先在英國發展。"],
    ["地理", "人口分布", `地理資料 ${caseNo} 顯示臺灣西部平原人口較稠密，最主要的有利條件為何？`, "地勢平坦且交通便利", ["終年大量降雪","火山分布最密集","完全沒有河川"], "西部地形較平坦，聚落、交通與產業發展條件較佳。"],
    ["經濟", "通貨膨脹", `經濟報告 ${caseNo} 顯示物價普遍且持續上漲，貨幣購買力通常如何變化？`, "降低", ["提高","完全不變","立即變成零"], "通貨膨脹時，同樣金額通常能購買的商品與服務減少。"],
    ["公民", "平等原則", `法治案例 ${caseNo} 強調「法律之前人人平等」，最接近哪一原則？`, "平等原則", ["秘密原則","世襲原則","多數暴力"], "人民不應因不合理差別而受到不同法律待遇。"]
  ];
  const [unit, knowledgePoint, question, correct, distractors, explanation] = specs[family];
  return make("社會", "SOC", index, { unit, knowledgePoint }, { question, ...rotateOptions(correct, distractors, n), explanation });
}

const subjects = { chinese: chineseQuestion, english: englishQuestion, math: mathQuestion, science: scienceQuestion, social: socialQuestion };
await mkdir(outputDir, { recursive: true });
for (const [filename, factory] of Object.entries(subjects)) {
  const questions = Array.from({ length: 1000 }, (_, index) => factory(index));
  await writeFile(join(outputDir, `${filename}.json`), `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  console.log(`${filename}: ${questions.length}`);
}
