import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0281": { unit: "文言文", teacherTip: "依動作搭配辨析多義字：「入門不顧」寫元方離開時的舉止，因此「顧」是回頭看，不是照料。" },
  "CHI-0282": { unit: "詩詞閱讀", teacherTip: "判讀「綠」的詞性活用時看誰使誰改變顏色；「春風」使「江南岸」轉綠，呈現春回的動態。" },
  "CHI-0283": { unit: "詩詞閱讀", teacherTip: "構想邊塞詩畫面時把大漠、長河、孤煙和落日的空間關係合看，避免只抓單一景物判氛圍。" },
  "CHI-0284": { unit: "詩詞閱讀", teacherTip: "判斷詩歌意象與情緒時同看梧桐、秋雨、寒窗和思鄉語句；單一景物未必固定只代表一種情感。" },
  "CHI-0285": {
    unit: "修辭",
    knowledgePoint: "誇飾判讀",
    question: "李白「白髮三千丈，緣愁似個長」以白髮形容愁緒，主要運用了哪種修辭？",
    options: ["對偶", "設問", "借代", "誇飾"],
    explanation: "正解是「誇飾」。白髮不可能實際長達三千丈，詩人刻意放大髮長來強調愁緒深重；「緣愁」也直接點出誇寫的原因。",
    solutionSteps: ["先抓住詩句明示的原因「緣愁」。", "檢查「白髮三千丈」是否為現實可達的長度；此處明顯刻意放大。", "用不合常理的尺度強調愁緒，屬誇飾，答案為索引 3。"],
    teacherTip: "判斷誇飾時檢查字面尺度是否刻意超出常理，再說明放大或縮小如何加強情感；不可按實際數值解讀。",
  },
  "CHI-0286": { unit: "修辭", teacherTip: "此句同時出現問句和春水意象：先辨認提問方式，再比較愁緒與江水綿延流動的相似處。" },
  "CHI-0287": { unit: "修辭", teacherTip: "題幹指定單句分析，因此以「太陽有臉且會紅」判斷擬人，不把文章其他句子的排比結構套進來。" },
  "CHI-0288": { unit: "修辭", teacherTip: "區分對偶和排比要數句數並核對結構；本例兩句相應，不因詞語重複就誤判為三句排比。" },
  "CHI-0289": { unit: "閱讀理解", teacherTip: "概括主旨時合併措施與結果：自主選書是做法，專注和分享增加才是短文明示的益處。" },
  "CHI-0290": { unit: "閱讀理解", teacherTip: "人物情感推論要找直接線索；樹下仍有人聊天及「留著祖父母的故事」指向共同生活記憶，而非經濟價值。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
