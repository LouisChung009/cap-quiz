import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0231": { unit: "詩詞閱讀", teacherTip: "讀「不及」句式時比較兩端的分量：眼前景物是衡量基準，作者藉更深的情誼凸顯送別情感。" },
  "CHI-0232": { unit: "文言文", teacherTip: "《禮記》此句反覆使用「親」「子」；先看它們在句中的位置和搭配，辨別動詞「親愛」與名詞「父母」。" },
  "CHI-0233": { unit: "文言文", teacherTip: "古文單字要放進動賓結構判義；「具言」修飾「說」，表示說得詳盡，不是名詞器具。" },
  "CHI-0234": { unit: "文言文", teacherTip: "辨析古今異義時以原句人物範圍為準；桃源人攜帶家眷同行，「妻子」在此包含妻與兒女。" },
  "CHI-0235": { unit: "文言文", teacherTip: "「交通」不可先套現代的運輸義；前面的「阡陌」已限定語境為田間小路，應理解為道路交錯相通。" },
  "CHI-0236": { unit: "文言文", teacherTip: "辨認通假字要先用上下文確認事件，再找讀音相近、語意通順的本字；設宴款待前的「要」是邀請。" },
  "CHI-0237": { unit: "文言文", teacherTip: "分析古文景物描寫時留意動詞的方向感；「上」「入」將苔痕和草色寫成向階與簾延展。" },
  "CHI-0238": { unit: "文言文", teacherTip: "讀「斯是陋室，惟吾德馨」要注意「惟」標出作者強調的關鍵，並由「德馨」連結居室價值與品格。" },
  "CHI-0239": { unit: "文言文", teacherTip: "解讀複合詞時拆看構詞線索：「鴻儒」以「儒」指向學者，再由「鴻」推知學識廣博。" },
  "CHI-0240": { unit: "文言文", teacherTip: "由「魚若在空中游」推景物特徵時，找出造成視覺錯覺的條件；魚身清楚可見而水幾乎隱去，凸顯水清。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
