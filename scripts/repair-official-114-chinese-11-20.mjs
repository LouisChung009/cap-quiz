import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/114%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const repairs = {
  "OFF-0885": {
    explanation: "答案 D。作者把時間比喻成作者或編輯：旅途中尚未整理出的札記，經過時間沉澱後，可能被整理成作品，也可能發現並不值得寫。D 抓到「時間幫助判斷哪些內容值得留下」的意思。A 把比喻扭成作品能否經受考驗；B、C 把重點誤放在寫作能力或編輯經驗。",
    solutionSteps: ["前文說旅行札記凌亂、難以剪裁，作者暫時無法決定如何成篇。", "「時間是作者／編輯」是比喻：時間能沉澱材料、整理內容，也可能讓人判斷不必寫。", "因此重點是時間後能釐清值得寫的內容，選 D；不是評價作品是否經得起考驗。"],
    teacherTip: "解讀比喻句要回扣前後文。這裡的「時間」是整理與篩選材料的力量，不是字面上的編輯職業。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "畫線句以時間比喻整理、篩選遊記材料；答案 D。", evidenceSources: ["assets/official-exams/114-chinese-p4.webp", solutionUrl] },
  },
  "OFF-0886": {
    question: "「我的本行是科學而非文學（甲）也許這正是我的缺失（乙）也許這反而是我的長處，無論如何我清楚明白（丙）科學需要人文的關懷（丁）而文學需要理性的自覺。」根據文意脈絡，甲、乙、丙、丁四處，何者最適合填入冒號？",
    explanation: "答案 C（丙）。「科學需要人文的關懷」和「文學需要理性的自覺」是在具體說明前面的「我清楚明白」：冒號可用來引出說明或解釋，所以放在丙。甲句意未完不宜用句號；乙兩個相近分句用逗號即可；丁兩句結構相承，用逗號，不需在「而」前加冒號。",
    solutionSteps: ["先找冒號可能引出的內容：丙後面列出作者「清楚明白」的兩項認知。", "後文「科學需要人文關懷」及「文學需要理性自覺」正是對前句的說明，符合冒號用法。", "因此冒號置於丙；其他三處依句意使用句號或逗號較恰當，選 C。"],
    teacherTip: "冒號常用於提示下文、引出說明或列舉；判斷標點時要看前後句的語意關係，不只看句子長短。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "丙後兩句解釋「清楚明白」的內容；官方答案 C。", evidenceSources: ["assets/official-exams/114-chinese-p5.webp", solutionUrl] },
  },
  "OFF-0887": {
    explanation: "答案 C。「延宕」是延遲拖延，「竣工」是工程完成；「延宕多時，如今終於竣工」語意通順。A 的「淪為」帶有陷入不佳處境的負面語氣，應改「傳為佳話」；B 表意意外應用「竟然」，不是表示前提的「既然」；D 表示幸運應用「幸好」，「不愧」不是慶幸義。",
    solutionSteps: ["逐句檢查詞語和上下文語意是否搭配。", "「延宕多時」說工程拖延，「終於竣工」說工程完成，前後形成合理轉折。", "其餘三句分別把「淪為／傳為」、「既然／竟然」、「不愧／幸好」混用，因此選 C。"],
    teacherTip: "近義詞題要把詞語放回句子判斷褒貶和語法位置；「既然」引出前提，「竟然」表示出乎意料。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "「延宕」與「竣工」語意搭配正確；答案 C。", evidenceSources: ["assets/official-exams/114-chinese-p5.webp", solutionUrl] },
  },
  "OFF-0888": {
    explanation: "答案 A。「揶揄」讀 ㄧㄝˊ ㄩˊ，題目標示的「揶」讀音正確。B「晾」讀 ㄌㄧㄤˋ，不讀 ㄐㄧㄥ；C「藩」讀 ㄈㄢ，不讀 ㄆㄢ；D「栽」讀 ㄗㄞ，不讀 ㄘㄞˊ。",
    solutionSteps: ["先確認 A 的詞：「揶揄」指嘲笑、戲弄，「揶」讀 ㄧㄝˊ。", "核對其餘多音／形近字：「晾」ㄌㄧㄤˋ、「藩」ㄈㄢ、「栽」ㄗㄞ。", "只有 A 的注音與字音相符，選 A。"],
    teacherTip: "形音題可先把熟悉詞語整詞讀出，再單獨核對目標字；不要受同部件或相似字音干擾。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "A「揶」讀ㄧㄝˊ；其餘晾、藩、栽的注音均有誤；答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p5.webp", solutionUrl] },
  },
  "OFF-0889": {
    explanation: "答案 A。魯迅說《聊齋志異》「頗有從唐傳奇轉化而出者」，表示有些故事取材自唐傳奇。B 把「近半數短篇小說非原創」誤當成全書篇數的一半；C 找到原型的多是數千言的真正短篇小說，不是幾十字的奇聞逸事；D 把短篇小說和短篇幅混淆，本文說其故事可長達數千言。",
    solutionSteps: ["先分清全書兩類作品：短小奇聞逸事與數千言的真正短篇小說，各約占一半。", "約百篇找到前人本事，指的是短篇小說中有改寫來源；魯迅的引文又明示來源包含唐傳奇。", "所以 A 正確；不可把短篇小說內部的比例誤算成全書比例，也不可把「短篇」誤解成字數很少。"],
    teacherTip: "比例題先確認分母。「近二分之一」指真正短篇小說，不是全書492篇；閱讀包含多層分類的句子時要逐層標出範圍。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "「近二分之一」指真正短篇小說篇章，不是全書；魯迅引文支持唐傳奇為部分來源。答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p5.webp", solutionUrl] },
  },
  "OFF-0890": {
    explanation: "答案 A。「有志竟成」是有志向、肯努力，事情終究能成功，用字正確。B 應寫「趕盡殺絕」；C 應寫「情不自禁」；D 應寫「眼不見為淨」，三者各有一字誤用。",
    solutionSteps: ["檢查 A 的成語：「有志竟成」字形與意思都正確。", "B 的固定用語是「趕盡殺絕」，不是「趕進殺絕」。", "C、D 分別應為「情不自禁」「眼不見為淨」，故只有 A 完全正確。"],
    teacherTip: "成語用字題可先想固定詞形，再代回句意；同音字常是干擾，例如「竟／進」「禁／盡」「淨／靜」。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "B、C、D各有一個同音誤字，A「有志竟成」正確；答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p5.webp", solutionUrl] },
  },
  "OFF-0891": {
    question: "祖可〈小重山〉：「誰向江頭遺恨濃？碧波流不斷，楚山重。柳煙和雨隔疏鐘。黃昏後，羅幕更朦朧。桃李小園空。阿誰猶笑語，拾殘紅。珠簾捲盡夜來風。人不見，春在綠蕪中。」（阿誰：何人）關於這闋詞的分析，下列何者最恰當？",
    explanation: "答案 C。「碧波流不斷」把抽象的「遺恨濃」轉化為江水不斷流淌的具體景象，呈現愁恨綿延。A 上下片韻腳都押平聲；B 下片仍以空園、殘花、綠蕪等景物抒情，沒有論理；D「桃李小園空」表示園中已空，並無桃李豔麗景象可供反襯。",
    solutionSteps: ["理解起句提出濃重遺恨，接著寫「碧波流不斷」，以不停流動的江水形象化愁恨。", "核對韻腳：上片濃、重、鐘、朧；下片空、紅、風、中，兩片都押平聲韻。", "下片仍是藉景抒情；「小園空」也不是桃李盛開，故只有 C 符合，答案 C。"],
    teacherTip: "古典詩詞常用景物把抽象情緒具體化；讀詞時也要逐片檢查韻腳和抒情方式，避免把寫景誤判成論理。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對並清理OCR註記", note: "刪除原題幹誤混入的註腳數字；「碧波流不斷」具體化遺恨綿延，答案 C。", evidenceSources: ["assets/official-exams/114-chinese-p5.webp", solutionUrl] },
  },
  "OFF-0892": {
    explanation: "答案 D。詩人敲門沒有聽到狗吠，準備離開時去問西邊鄰居，鄰居告知陸鴻漸去了山中；因此詩人此次見到或接觸到的是鄰居。農地有桑麻並非荒蕪；菊花「秋來未著花」尚未開；題名「不遇」也說明沒有遇見陸鴻漸。",
    solutionSteps: ["「野徑入桑麻」寫田間作物，不是荒蕪農地。", "「秋來未著花」明確表示菊花尚未開；「不遇」且朋友去了山中，故沒有見到陸鴻漸。", "詩人「欲去問西家」，由鄰居回答朋友去向，可知此次接觸到鄰居，選 D。"],
    teacherTip: "詩句直接線索優先：「未著花」是否開花、「不遇」是否見到友人，都能排除選項；最後再按事件順序推論。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "由「欲去問西家」可知作者向西家鄰居詢問，答案 D。", evidenceSources: ["assets/official-exams/114-chinese-p6.webp", solutionUrl] },
  },
  "OFF-0893": {
    explanation: "答案 A。「不可名狀」指無法用言語形容，形容電影戰爭場面的慘烈，搭配恰當。B「毫不在乎」和「不以為意」意思相近，與轉折詞「但」不合；C「不言而喻」表示不說也明白，和大家不知喜怒矛盾；D「不置可否」是不表明態度，不能讓下屬有明確方向。",
    solutionSteps: ["先解 A：不可名狀＝無法用言語描述，能修飾極其慘烈的戰爭場面。", "B 轉折後應接相反意思，不以為意並非毫不在乎的反義詞。", "C、D 的成語意義分別與後半句矛盾，故最恰當的是 A。"],
    teacherTip: "成語語境題除了查字面意思，也要檢查句中的轉折、因果和前後是否自相矛盾。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷交叉核對", note: "A「不可名狀」意為無法用言語形容；其餘選項語意矛盾或不合轉折。答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p6.webp", solutionUrl] },
  },
  "OFF-0894": {
    explanation: "答案 D。太祖說要讓劉基當丞相，劉基以換柱作比：更換支柱需要大木，不能把小木捆成一束充數。前文劉基已稱李善長是有功勳且能調和諸將的舊臣，後文又替他辯護；「大木」指李善長，顯示劉基認為李善長更適任。A 把想害劉基的人誤認成太祖；B 把「相汝」方向顛倒；C 把比喻對象弄反。",
    solutionSteps: ["先釐清代名詞：「是數欲害汝」指李善長曾多次想害劉基；「吾將相汝」則是太祖想讓劉基任丞相。", "劉基拿更換柱子比喻任命：大木才能支撐屋柱，捆小木代替會立刻倒塌。", "結合劉基稱讚李善長能調和諸將並為他辯護，可知「大木」指李善長，劉基認為李更適合任相，選 D。"],
    teacherTip: "文言文先確認省略主語和代詞指涉，再解比喻；「相汝」是讓你做丞相，不要把任命對象看反。",
    answerKeyReview: { status: "已依114年官方國文題本、翰林解析卷與《明史》原文交叉核對", note: "「大木」比喻李善長具備丞相能力；「吾將相汝」是太祖欲任劉基為相。答案 D。", evidenceSources: ["assets/official-exams/114-chinese-p6.webp", solutionUrl, "《明史》卷128"] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 114 Chinese questions.`);
