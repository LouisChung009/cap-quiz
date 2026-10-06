import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0191": {
    unit: "文言文",
    teacherTip: "讀《出師表》的勸諫時，分辨作者陳述的歷史原因與對當今君主提出的做法；「親賢臣，遠小人」直接點出任賢遠佞。",
  },
  "CHI-0192": {
    teacherTip: "《曹劌論戰》以擊鼓次數表現士氣消長；不要把「三而竭」誤當成我軍已經無力，而要確認主語是敵軍。",
  },
  "CHI-0193": {
    teacherTip: "古文實詞要回到上下文判義；「肉食者鄙」緊接「未能遠謀」，因此此處談的是見識，不是地理位置或官位。",
  },
  "CHI-0194": {
    teacherTip: "「布衣」從衣著轉指未任官的平民，是身分借代；別把字面衣料當成句中的人物身分。",
  },
  "CHI-0195": {
    teacherTip: "古今異義詞不可直接套用現代義；可用前文「臣本布衣」核對「卑鄙」描述的是身分與見識。",
  },
  "CHI-0196": {
    teacherTip: "「危急存亡之秋」中的「秋」要看整個固定語境，表示關鍵時刻；不要只因字形就解作秋季。",
  },
  "CHI-0197": {
    teacherTip: "同一個字可能兼有名詞、動詞等用法；《桃花源記》後文說再尋訪，能反推「誌」是沿途做記號。",
  },
  "CHI-0198": {
    question: "《陋室銘》以「山不在高，有仙則名；水不在深，有龍則靈」起筆，接著說「斯是陋室，惟吾德馨」，主要用意為何？",
    teacherTip: "讀《陋室銘》的起筆類比，要找出山水顯名、顯靈的共同原因，再對應陋室與主人的品德；不是在說自然地理。",
  },
  "CHI-0199": {
    question: "《記承天寺夜遊》寫「庭下如積水空明，水中藻、荇交橫，蓋竹柏影也」，實際上庭院中呈現的是什麼？",
    teacherTip: "辨認《記承天寺夜遊》的譬喻時，分清月光與竹柏影的實景，以及「積水、藻荇」的比喻形象。",
  },
  "CHI-0200": {
    teacherTip: "文本推論只採用題目給的制度與前後變化；人數增加支持參與度提高，但不能推出每個人都讀完每一本書。",
  },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
