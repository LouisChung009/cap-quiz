import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0221": { unit: "閱讀理解", teacherTip: "分辨主張和理由時看句間功能：作者先表態，後文的雨水滲透與棲地功能才是支持主張的證據。" },
  "CHI-0222": { unit: "閱讀理解", teacherTip: "判斷段落末句功能時，留意「這段經驗讓我們知道」是否把前面的個案提升成一般原則。" },
  "CHI-0223": { unit: "修辭", teacherTip: "判讀對偶需同時比較字數、詞性位置和語意相應；不能只因兩句都寫山林景物就作判斷。" },
  "CHI-0224": { unit: "閱讀理解", teacherTip: "區分事實與推測，注意時間和證據是否已發生；「可能會」標示尚待驗證的預測。" },
  "CHI-0225": {
    unit: "閱讀理解",
    solutionSteps: ["找出前文的關鍵物件：父親留下的蘭花。", "比對作者多年後也照顧蘭花的呼應情節。", "末句由物件回扣往事並歸納記憶延續的意義，答案為索引 1。"],
    teacherTip: "分析結尾照應時追蹤前後重現的物件與情節，再說明末句如何把個人回憶提升為全文主旨。",
  },
  "CHI-0226": { unit: "詩詞閱讀", teacherTip: "推論詩句視野時把兩句景物連起來看：夕陽依山而落，黃河又奔向大海，空間由近景延伸到遠方。" },
  "CHI-0227": { unit: "詩詞閱讀", teacherTip: "由寫景推寓意時先找限制視角的字句，再把山中只能見局部的經驗轉成一般處世道理。" },
  "CHI-0228": { unit: "詩詞閱讀", teacherTip: "詩句中的動作和目標常呈現志向；「凌絕頂」「一覽」一起構成主動攀登並擴展視野的形象。" },
  "CHI-0229": { unit: "詩詞閱讀", teacherTip: "分辨情景與情感線索時，先辨認月、江、楓、火等景物，再找直接寫出心理狀態的詞。" },
  "CHI-0230": {
    unit: "詩詞閱讀",
    knowledgePoint: "譬喻與意象效果",
    question: "「忽如一夜春風來，千樹萬樹梨花開」以春景形容雪景，「梨花」最主要使讀者聯想到雪的哪種景象？",
    options: ["雪融化後水流遍地", "寒風中枝條搖晃的聲音", "白雪覆枝、繁盛如花盛開的畫面", "落葉散在地面形成的顏色"],
    explanation: "正解是「白雪覆枝、繁盛如花盛開的畫面」。詩句把冬日雪覆樹枝比作千樹梨花盛開，借梨花的潔白與繁盛呈現雪景，不是在寫真正的春花。",
    solutionSteps: ["辨認實際描寫的是冬雪，梨花是用來比擬雪景的形象。", "將梨花的白色和盛開狀態對照雪覆枝頭的視覺效果。", "此意象呈現白雪覆枝、繁盛如花的畫面，答案為索引 2。"],
    teacherTip: "讀譬喻詩句時把本體和喻體分開，再比較顏色、形狀或動態等共同特徵，推論意象帶來的畫面。",
  },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
