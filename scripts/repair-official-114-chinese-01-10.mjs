import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const repairs = {
  "OFF-0875": {
    question: "根據資料，右側詐騙簡訊使用了哪一種話術？",
    options: ["A", "B", "C", "D"],
    optionsInImage: true,
    questionImages: ["./assets/official-exams/114-chinese-p2.webp"],
    questionImage: "./assets/official-exams/114-chinese-p2.webp",
    explanation: "答案 D。簡訊先聲稱水費欠繳 275 元，再要求收件人在三日內點連結繳費，否則停止供水；欠費威脅和限時期限會引發焦慮，催促收件人立刻行動，符合④「引發情緒反應」。它不是以友善稱呼建立親切感，也沒有故事或相似經歷。",
    solutionSteps: ["先看訊息要求收件人做什麼：透過陌生連結在三日內繳納欠款。", "再找它促使人立即行動的方式：以停水威脅加上短期限製造恐慌與急迫感。", "這種誘發焦慮、促成立即反應的設計是④，因此選 D；題圖右側的簡訊內容是判斷證據。"],
    teacherTip: "辨識詐騙話術時，分清楚「親切用語」「同情故事」「相似經歷」與「製造恐懼、急迫感」；限時威脅常是情緒操控線索。",
    answerKeyReview: { status: "已依114年官方國文題本第1頁核對題幹、簡訊圖與選項", note: "官方答案 D；簡訊以三日內繳款否則停水製造急迫與恐懼，對應④引發情緒反應。", evidenceSources: ["assets/official-exams/114-chinese-p2.webp"] },
  },
  "OFF-0876": {
    questionImages: [], questionImage: undefined, requiresImage: false, requiresContext: false,
    explanation: "答案 B。本文明說清代驗屍時，涉案人、關係人和家屬必須在場，目的在讓眾人共同確認屍傷屍狀。B 符合這項程序。A 把屍體移到別處，違反必須在屍所驗屍；C 驅離旁觀者，與一般大眾也可圍觀相反；D 拒絕家屬確認，也違反共同質對的目的。",
    solutionSteps: ["先圈出程序限制：驗屍必須在屍體所在的「屍所」，不可把屍體帶到他處。", "再圈出在場規定：涉案人、關係人及家屬必須到場，一般民眾也能圍觀。", "只有 B 保留家屬到場；A、C、D 分別違反驗屍地點、旁觀或共同確認的敘述。"],
    teacherTip: "文意判讀先把材料中的規定拆成地點、在場者和目的，再逐一比對選項，不要只抓住「驗屍」關鍵字。",
    answerKeyReview: { status: "已依114年官方國文題本第1頁核對文字題", note: "本題題幹已完整提供全部閱讀材料，不需另附題本截圖；答案 B。", evidenceSources: ["assets/official-exams/114-chinese-p2.webp"] },
  },
  "OFF-0877": {
    questionImages: ["./assets/official-exams/114-chinese-p2.webp"], questionImage: "./assets/official-exams/114-chinese-p2.webp",
    explanation: "答案 B「木」。圖中的「月」以線條描摹月亮的外形，屬象形；「木」也由樹幹、枝條與根部的形狀描摹樹木，屬象形。小以短畫指示位置，出由構件組合表意，汝以形符和聲符構成，造字原則不同。",
    solutionSteps: ["先判斷題目例字「月」：古文字直接描摹月亮的形狀，屬象形。", "逐字查看選項的造字方式；「木」描繪樹幹、枝條和根部，也是象形。", "「小」是指事、「出」以構件會意、「汝」為形聲，因此選 B。"],
    teacherTip: "象形是描摹物體外形；指事用符號標示抽象位置或概念；會意組合意符；形聲則兼有表意與表音線索。",
    answerKeyReview: { status: "已依114年官方國文題本第1頁核對字形表", note: "題目所需古文字字形皆在題圖表格中；答案 B「木」，與「月」同為象形。", evidenceSources: ["assets/official-exams/114-chinese-p2.webp"] },
  },
  "OFF-0878": {
    questionImages: ["./assets/official-exams/114-chinese-p2.webp"], questionImage: "./assets/official-exams/114-chinese-p2.webp",
    explanation: "答案 B。詩句寫「我的快樂除以我的悲傷」後，所得的商是 1；除數不為 0 時，商為 1 表示被除數與除數相等，所以詩中呈現快樂與悲傷等量並存。A 說悲傷消失、快樂留下，C 說只剩悲傷，D 說每段愛情只有一種結果，都不是詩句的意思。",
    solutionSteps: ["抓住詩中的運算：快樂 ÷ 悲傷＝1。", "商為 1 表示兩個量相等，因此快樂與悲傷並非互相抵銷或先後取代。", "最貼近此比喻的是「我的快樂等同於我的悲傷」，選 B。"],
    teacherTip: "遇到詩中的數學比喻，先照字面理解關係式，再回到情感語境；不要把運算符號直接解讀成情緒消失。",
    answerKeyReview: { status: "已依114年官方國文題本第1頁核對詩作與選項", note: "詩句明示快樂除以悲傷的商為1，故兩者相等；答案 B。", evidenceSources: ["assets/official-exams/114-chinese-p2.webp"] },
  },
  "OFF-0879": {
    optionsInImage: true,
    questionImages: ["./assets/official-exams/114-chinese-p3.webp"], questionImage: "./assets/official-exams/114-chinese-p3.webp",
    explanation: "答案 A。A 圖字形筆畫方整、構形為後起的楷書「封」字，不屬《說文解字》以小篆為主並兼收秦以前古文字、籀文的範圍。B、C、D 都呈現篆籀或更早字形，可見題圖所示的古文字構件與線條特徵。",
    solutionSteps: ["先依題幹限定《說文解字》所收字體：小篆為主，兼收秦以前古文字和籀文。", "比較四個字形；A 筆畫方整，已是後起楷書形態，而非古文字、籀文或小篆。", "因此不會收入的是 A；不能只因四字都讀作「封」就判斷字體相同。"],
    teacherTip: "判讀古文字先看字體年代與筆畫風格：小篆及更早字形常保留象形構造，楷書則是後世定型的方整筆畫。",
    answerKeyReview: { status: "已依114年官方國文題本第2頁核對字形與答案", note: "A 為後起楷書；官方參考答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p3.webp"] },
  },
  "OFF-0880": {
    questionImages: ["./assets/official-exams/114-chinese-p3.webp"], questionImage: "./assets/official-exams/114-chinese-p3.webp",
    explanation: "答案 A。圖表顯示法國於 3 月 17 日封城後，家暴通報上升 30%；另列阿根廷家暴專線來電增加 25%，並同時指出家庭壓力升高及行動自由受限會提高受害風險。資料支持封城情境可能使潛在家暴浮現。B 把通報增加直接當成通報意願變高，資料沒有比較意願；C 顛倒因果與結果；D 也未見政府漠視平權的證據。",
    solutionSteps: ["讀取圖表的具體證據：法國封城後家暴通報上升30%，阿根廷專線來電增加25%。", "搭配下方說明：家庭壓力、收入與行動自由受限，可能提高女性成為家暴受害者的風險。", "因此可推論封城易誘發或使潛在家暴浮現；不能把通報量增加直接等同意願提高，故選 A。"],
    teacherTip: "圖表的「通報數增加」不等於「發生數或通報意願」單一因素增加；推論需同時使用數據與文字說明，避免超出證據。",
    answerKeyReview: { status: "已依114年官方國文題本第2頁核對圖表數據與文字", note: "法國封城後通報上升30%，並有家庭壓力與行動限制的解釋；答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p3.webp"] },
  },
  "OFF-0881": {
    questionImages: ["./assets/official-exams/114-chinese-p3.webp"], questionImage: "./assets/official-exams/114-chinese-p3.webp",
    explanation: "答案 B。甲圖直接標示「仄聲貼右、平聲貼左」，乙圖也以對聯末字標出仄聲與平聲的配置，兩圖共同呈現傳統對聯「仄起平收」的聲律原則。A 不是辨認四聲的教學；C 的張貼順序並非兩圖共同說明；D 把觀看方向和上下聯位置混為一談。",
    solutionSteps: ["比較甲、乙兩圖共同標示的規則，而非只看其中一張圖的張貼步驟。", "兩圖都以對聯末字的平、仄聲作為上下聯配置依據，符合上聯仄收、下聯平收。", "這就是「仄起平收」原則，選 B；其餘選項不是兩圖共同傳達的內容。"],
    teacherTip: "「仄起平收」簡記為上聯末字仄聲、下聯末字平聲；張貼左右則要再配合面向大門的方向判斷。",
    answerKeyReview: { status: "已依114年官方國文題本第2頁核對春聯圖示", note: "甲、乙兩圖共同呈現對聯末字平仄規則；答案 B。", evidenceSources: ["assets/official-exams/114-chinese-p3.webp"] },
  },
  "OFF-0882": {
    questionImages: [], questionImage: undefined, requiresImage: false, requiresContext: false,
    explanation: "答案 C。曲中「菊花黃」「秋光」「金風」和「桂枝香」集中描寫秋季色彩、風與花香，彼此呼應，故 C 最恰當。A 把曲牌名〈小梁州〉誤當題目；曲的題目是「秋」。B 不對，韻腳如「黃、光、藏、香、行」一韻到底。D 將斜月、新雁過度解作繁華消逝，曲中沒有此象徵依據。",
    solutionSteps: ["辨認曲牌與題目：〈小梁州〉是曲牌，題目為「秋」，所以 A 不對。", "檢查押韻，黃、光、藏、香、行相互協韻，並非中途換韻。", "菊花、秋光、金風、桂枝香都直接烘托秋意；斜月、新雁是秋景描寫而非繁華消逝的象徵，故選 C。"],
    teacherTip: "散曲題先分清曲牌與題目，再看意象是否直接寫景或具有文中可證的象徵；不要把所有景物都過度寓意化。",
    answerKeyReview: { status: "已依114年官方國文題本第3頁核對曲文與選項", note: "完整曲文已置於題幹，不需題本圖片；答案 C。", evidenceSources: ["assets/official-exams/114-chinese-p4.webp"] },
  },
  "OFF-0883": {
    optionsInImage: true,
    questionImages: ["./assets/official-exams/114-chinese-p4.webp"], questionImage: "./assets/official-exams/114-chinese-p4.webp",
    explanation: "答案 C。文中明說成品沒有花、香氣濃的香片等級最高；玫瑰烏龍屬於「成品內有花」的第二種，並非最高等級，所以把它推薦給想買最高級花茶的顧客不恰當。A 不要喝到茶葉可選第三種純花茶；B 想看見花瓣可選第二種；D 想自製茶香片可依文中方法用茶葉和新鮮茉莉花窨製。",
    solutionSteps: ["整理三類：香片成品無花但有花香且等級最高；第二類成品有花；第三類為純花、沒有茶葉。", "逐列核對顧客需求：A、B、D 的建議分別符合純花茶、花瓣可見、茶葉加鮮花窨製。", "C 將玫瑰烏龍（第二類）說成最高等級，與文章分類衝突，因此答案 C。"],
    teacherTip: "分類題先把每一類的定義和例子整理成對照表，再檢查推薦是否符合顧客需求；不要把「看得到花」誤認為等級最高。",
    answerKeyReview: { status: "已依114年官方國文題本第3頁核對花茶分類與需求表", note: "文章已完整置於題幹；價目需求表保留為必要圖表。答案 C。", evidenceSources: ["assets/official-exams/114-chinese-p4.webp"] },
  },
  "OFF-0884": {
    question: "【閱讀材料】「蜂造之蜜出山崖、土穴者十居其八，而人家招蜂造釀而割取者，十居其二也。北方乾燥，土穴所釀多出於此。南方卑溼，故有崖蜜而無穴蜜。西北半天下，蓋與蔗漿分勝云。」\n【問題】根據本文，下列推論何者最恰當？",
    questionImages: [], questionImage: undefined, requiresImage: false, requiresContext: false,
    explanation: "答案 A。文中說北方乾燥，土穴所釀的穴蜜多出於北方，因此可推論穴蜜多產於乾燥地區。B 把崖蜜說成人工養育，與「山崖、土穴的天然蜂蜜占八成」不符；C 說潮濕地區沒有天然蜂蜜，但文中明言南方有崖蜜；D 把「西北半天下」誤讀成西北產量是東南的一半，原文是在說蜂蜜與蔗漿各有市場、相互競勝。",
    solutionSteps: ["先解關鍵句：北方乾燥，所以土穴所釀的穴蜜多出於北方。", "因此 A「穴蜜多產於乾燥之處」是直接根據因果敘述作出的合理推論。", "南方雖卑溼仍有崖蜜，故 C 錯；人工養蜂只占兩成，且「分勝」不是產量一半，B、D 也不成立。"],
    teacherTip: "文言推論要先疏通詞義：「十居其八」是八成，「卑溼」是低下潮濕，「分勝」指各有勝場；勿把比例或競勝誤當一半產量。",
    answerKeyReview: { status: "已依114年官方國文題本第3頁核對文言材料與選項", note: "文言材料已完整置於題幹，不需重複顯示原卷；答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p4.webp"] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 114 Chinese questions.`);
