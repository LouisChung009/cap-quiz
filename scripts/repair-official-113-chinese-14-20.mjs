import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/113%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const base = "./assets/official-exams/";
const repairs = {
  "OFF-0674": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。下闋「尋好夢，夢難成」寫的是離別後想在夢中與佳人相會而不可得，並沒有說「我」為追求理想離開佳人。A 的「慘」「愁」呈現離情，C 以枕前淚與階前雨寫整夜難眠，D 也正確概括上闋離別、下闋別後相思；題目問錯誤敘述，因此選 B。",
    solutionSteps: ["先分辨詞的上下闋：上闋寫出城送別與唱〈陽關曲〉，呈現分手場景。", "下闋從「尋好夢，夢難成」轉入離別後的思念；沒有追求理想或主動遠行的資訊。", "因此 B 錯；其餘選項分別符合別情、夢難成與上下闋情境，答案 B。"],
    teacherTip: "古典詩詞題要用原句限制推論；不能把「尋夢」擴大成追求理想，先判斷語境是相思還是志業。",
    answerKeyReview: { status: "已依113年官方國文題本詞作核對", note: "「尋好夢，夢難成」寫別後相思，不是追求理想；錯誤敘述為 B。", evidenceSources: [`${base}113-chinese-p5.webp`, solutionUrl] },
  },
  "OFF-0675": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。文字說明，當說話內容與表情、語調等非語言訊息不一致時，人們容易受後者影響。朋友嘴上說「謝謝」，卻臭著臉，表情和話語矛盾，因此旁人會推知他其實不開心，符合 C。A 談用字簡潔，B 說語調提升說服力，D 把看不到表情直接推成無法判斷真實性，都不是題幹所述情形。",
    solutionSteps: ["抓住題幹規則：內容與語調、表情或手勢不一致時，接收者較容易受非語言行為影響。", "C 的口語內容是感謝，臉色卻不悅，兩種訊息互相矛盾。", "因此旁人依表情判斷其真實情緒，選 C。"],
    teacherTip: "對照題先找「說了什麼」和「表現如何」是否衝突；真正符合的是同時出現兩種不一致訊息的情境。",
    answerKeyReview: { status: "已依113年官方國文題本溝通說明核對", note: "口頭道謝與臭臉表情不一致，旁人依非語言訊息判讀；答案 C。", evidenceSources: [`${base}113-chinese-p5.webp`, solutionUrl] },
  },
  "OFF-0676": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。「行將就木」指人將近死亡，用來形容生命將盡者恰當。A「五穀不分」是分不清五穀，不是營養均衡；B「不愧屋漏」指獨處暗室仍無愧於心，不形容房屋堅固；C「以蠡測海」比喻用狹小方法估量廣大事物，不能表示用儀器得到準確數據。",
    solutionSteps: ["先確認 D 的成語義：「行將就木」即將走進棺木，比喻人將近死亡，與句意相符。", "A 的五穀不分指缺乏常識；B 的不愧屋漏談品德操守；C 的以蠡測海是以偏概全，三者都被誤用。", "因此只有 D 用詞恰當。"],
    teacherTip: "成語選用要把成語換成白話再代回句子；字面能通不代表語意合適。",
    answerKeyReview: { status: "已依113年官方國文題本成語義核對", note: "「行將就木」用來形容生命將盡者，答案 D。", evidenceSources: [`${base}113-chinese-p5.webp`, solutionUrl] },
  },
  "OFF-0677": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。正確句意是「學者想成為聖賢，就像射箭者想射中靶心；不以聖賢為目標而求學，就像不立靶心便射箭」。B 在「聖賢」後斷開比喻，在「學者」後斷開條件與判斷，語意完整。其他選項把「猶」拆開、把「中夫正鵠」切斷，或拆散「準的」等詞，造成句法不通。",
    solutionSteps: ["先找比喻句的對應：學者求成聖賢，猶如射者求中正鵠（靶心）。", "下一句以「不以聖賢為準的而學者」作條件，後接「是不立正鵠而射者也」作比喻結論。", "只有 B 保持兩句的主謂與比喻結構完整，故選 B。"],
    teacherTip: "文言斷句先找固定詞組和句法關係；「猶……也」通常構成完整比喻，不宜從中切開。",
    answerKeyReview: { status: "已依113年官方國文題本斷句選項核對", note: "B 保持「求中正鵠」及條件判斷句完整；答案 B。", evidenceSources: [`${base}113-chinese-p5.webp`, solutionUrl] },
  },
  "OFF-0678": {
    question: "漢靈帝時，陳留蔡邕多次上書陳奏，違逆皇帝旨意，又遭內寵厭惡，擔心獲罪，於是逃往江海、遠避吳郡。吳人曾燒桐木煮食，蔡邕聽見木材燃燒的聲音，認出它是良材，便請來製琴，琴聲果然優美；因琴尾仍有燒焦痕跡，故名「焦尾琴」。根據這則故事，下列敘述何者最恰當？",
    options: ["焦尾琴因蔡邕識材而製成", "吳人向來以燒桐製琴聞名", "焦尾琴製成後經火烤而音色優美", "蔡邕因忤逆上意而遭流放至吳郡"],
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A。蔡邕聽出正在燃燒的桐木是良材，向燒木者索取後製成琴，琴聲美妙，焦痕留在琴尾，因此稱焦尾琴。B 把個別事件誤說成吳郡普遍製琴；C 誤以為琴成後再經火烤；D 把蔡邕避居吳郡說成被流放。",
    solutionSteps: ["依事件順序整理：蔡邕聽燃燒聲辨出良材，請得桐木，削製成琴。", "琴聲美妙，而木材原有的燒焦痕跡留在琴尾，名稱由此而來。", "所以 A 符合因果；B、C、D 都增加或改變了原文沒有的事實，選 A。"],
    teacherTip: "文言敘事題先整理人物、動作、先後順序；不要把原因、結果或主詞互換。",
    answerKeyReview: { status: "已依113年官方國文題本故事核對並清除OCR註腳", note: "蔡邕辨材後取桐木製琴，答案 A。", evidenceSources: [`${base}113-chinese-p6.webp`, solutionUrl] },
  },
  "OFF-0679": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。蝸牛因黏液、蟬因鳴聲、螢火蟲因光亮而被人發現捕捉，接著作者勸愛惜自身者不要追求顯赫聲名。D「樹大招風、人為名高傷身」同樣指出過度顯眼容易招來傷害。A 鼓勵留名，B 談善惡名聲，C 談名譽取得不易，都沒有表達避免顯名以自保的警示。",
    solutionSteps: ["先看三個例子共同點：蝸牛、蟬、螢火蟲因明顯特徵暴露而被捕。", "作者由此推到人應避免追求過度顯赫的名聲，以免招來危害。", "D 的樹大招風、名高傷身正是相同道理，選 D。"],
    teacherTip: "先從排比例子找共同因果，再選能保留「顯露而招禍」關係的成語或俗諺。",
    answerKeyReview: { status: "已依113年官方國文題本古文語意核對", note: "三種生物因顯露特徵被捕，對應樹大招風、名高傷身；答案 D。", evidenceSources: [`${base}113-chinese-p6.webp`, solutionUrl] },
  },
  "OFF-0680": {
    optionsInImage: true, requiresImage: true, requiresContext: false, questionImages: [`${base}113-chinese-p6.webp`], questionImage: `${base}113-chinese-p6.webp`,
    explanation: "答案 A。指事字會在象形字上加指示符號，表達抽象位置或概念；表格中的「本」在「木」字形下方加一橫，指出樹根所在，正是以木的象形為基礎再加符號。其餘字形不是這種在象形字上加標記的構造。",
    solutionSteps: ["先認出造字原則：指事是用抽象符號標示位置或概念，有些字會在象形字上加一筆。", "「本」由「木」加下方標記構成，標出樹根／根本的位置。", "表格中符合此構造的是 A，故選 A；必須依字形表判斷。"],
    teacherTip: "辨指事字時注意附加符號的位置和功能；「本」的下橫不是樹枝，而是標出根部。",
    answerKeyReview: { status: "已依113年官方國文題本字形表核對", note: "「本」以木形加下方指示符號表示根部；答案 A。", evidenceSources: [`${base}113-chinese-p6.webp`, solutionUrl] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 113 Chinese questions.`);
