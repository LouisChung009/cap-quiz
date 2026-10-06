import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0271": { unit: "文言文", knowledgePoint: "遞進與學習層次", teacherTip: "比較「知」「好」「樂」三個動詞的投入程度，判斷語意逐層深化；這裡重點是遞進，不是單純列舉。" },
  "CHI-0272": { unit: "詩詞閱讀", teacherTip: "合讀「萬里」和「若飛」：前者誇寫征途遙遠，後者呈現行軍迅速，兩者共同營造出征聲勢。" },
  "CHI-0273": { unit: "詩詞閱讀", teacherTip: "比較木蘭從軍與返家梳妝的行動，分析同一人物在戰場和家庭生活中的身分反差。" },
  "CHI-0274": { unit: "閱讀理解", teacherTip: "整合措施目的時同時檢查電子公告的資源效益和紙本備援的對象，避免只讀其中一項安排。" },
  "CHI-0275": { unit: "成語", teacherTip: "把「虎穴、虎子」先視為比喻，再推論成語勸勉承擔必要風險；「才可能」不等於保證成功。" },
  "CHI-0276": { unit: "文言文", teacherTip: "在「見賢思齊」中以「見賢」作為「思」的對象，從向賢者學習的語境判斷「齊」是看齊、效法。" },
  "CHI-0277": { unit: "文言文", teacherTip: "《桃花源記》的「向」需依返程語境判義；漁人循著先前走過的路離開，不是朝某方向前進。" },
  "CHI-0278": { unit: "文言文", teacherTip: "古今同形詞要確認修飾對象；「鮮美」修飾芳草並與落花景象相連，描述景色，不談食物滋味。" },
  "CHI-0279": { unit: "文言文", teacherTip: "古文「再」常指第二次；在「一鼓、再、三」的次序中核對它所在的位置，避免套用現代的「再次」泛義。" },
  "CHI-0280": { unit: "文言文", teacherTip: "把「成人之美」和「不成人之惡」成對解釋，分清成全善事與不助長惡行兩種互補的待人原則。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
