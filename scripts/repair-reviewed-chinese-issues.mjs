import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "chinese.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const update = (id, changes) => {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing ${id}`);
  Object.assign(row, changes);
};

update("CHI-0154", {
  question: "《馬說》「其真無馬邪？其真不知馬也。」末句中的第二個「其」，語氣最接近何者？",
  options: ["代詞，指前文提到的人或事", "推測語氣，近於「恐怕、大概」", "指示詞，近於「那、那個」", "反問語氣，近於「難道」"],
  answer: 1,
  explanation: "題目限定《馬說》末句「其真不知馬也」中的第二個「其」。此處是推測語氣，可譯為「恐怕、大概真的不懂得千里馬」；前句的「其」則有反問語氣，兩者不可混為一談。答案 B。",
  solutionSteps: ["先依題幹定位末句「其真不知馬也」，不分析前句的第一個「其」。", "末句是在推測原因：恐怕是他們真的不懂得千里馬。", "因此末句第二個「其」表推測，選 B。"],
  teacherTip: "古文中同一虛詞可能因句位不同而有不同語氣，作答時先確定題目指定的字句。"
});
update("CHI-0270", {
  answer: 3,
  explanation: "「敏而好學」稱許一個人聰敏又喜愛學習；此處「敏」指聰明、反應敏捷，最接近 D「聰明伶俐」。勤勉好學由「好學」表達，不是「敏」的本義。",
  solutionSteps: ["先把句子拆成兩部分：「敏」和「好學」。", "「好學」已表達喜愛學習；「敏」在此指聰敏、反應敏捷。", "因此選 D「聰明伶俐」，不可把整句稱許的求學態度都解作「敏」。"],
  teacherTip: "解釋文言詞義時要聚焦被問的單字，不要把整句的褒揚意思移作該字字義。"
});
update("CHI-0287", {
  question: "朱自清《春》句子「太陽的臉紅起來了」單獨分析，主要運用哪種修辭？",
  answer: 1,
  explanation: "句中把太陽寫成有「臉」且會「紅起來」的人，將人的外貌與狀態轉用於景物，主要是轉化（擬人），答案 B。題目限定這一句，不以全段的排比結構作判斷。",
  solutionSteps: ["依題幹只分析「太陽的臉紅起來了」這一句。", "太陽被賦予人的臉和臉紅的狀態。", "因此主要使用轉化中的擬人，選 B。"],
  teacherTip: "修辭題若提供較長文句，要先確認題目指定全句、局部詞語，還是整段結構。"
});
update("CHI-0601", {
  gradeSemester: "九年級上",
  unit: "閱讀理解",
  knowledgePoint: "評選程序與偏誤",
  difficulty: "進階",
  type: "素養題",
  question: "校刊編輯將同題材稿件匿名後交由不同年級代表閱讀，並依內容完整性與證據品質評選。這種作法最能降低哪種偏誤？",
  options: ["評選受作者身分或年級影響", "文章中的錯字數量", "讀者是否能看見稿件內容", "投稿是否符合字數限制"],
  answer: 0,
  explanation: "稿件匿名可減少評選者受到作者身分或年級影響；明訂內容與證據標準則提供共同評選依據，答案 A。此作法不會自動消除錯字，也與字數規範無關。",
  solutionSteps: ["找出程序設計：匿名稿件、跨年級評讀、公開評選標準。", "匿名主要切斷作者身分與作品評價之間的影響。", "因此最能降低身分偏誤，選 A。"],
  teacherTip: "推論制度設計的效果時，讓措施與欲降低的風險一一對應。"
});
update("CHI-0602", {
  gradeSemester: "八年級下",
  unit: "閱讀理解",
  knowledgePoint: "研究設計與變因控制",
  difficulty: "進階",
  type: "素養題",
  question: "學生想比較兩種紙巾的吸水量，分別倒入不同水量並使用不同大小的紙片。若要公平比較，最應先怎麼改進？",
  options: ["固定倒水量與紙片面積，只改變紙巾種類", "讓每種紙巾各自使用不同水量和大小", "只記錄最後剩下的紙巾包數", "依外觀猜測哪種紙巾吸水較多"],
  answer: 0,
  explanation: "目前水量與紙片面積同時改變，無法判斷結果是否由紙巾種類造成。應固定其他條件，只改變紙巾種類並測量吸水量，答案 A。",
  solutionSteps: ["找出要比較的因素：紙巾種類。", "水量和紙片面積也會影響吸水結果，必須控制一致。", "固定其他條件、只改變紙巾種類，才能公平比較，選 A。"],
  teacherTip: "比較實驗一次只改變一個主要變因，並控制可能影響結果的條件。"
});
update("CHI-0909", {
  question: "句子「午後的雷聲在遠山滾動，急促地敲著天空的門」主要運用了哪一種修辭？",
  explanation: "「急促地」描寫雷聲的節奏，「敲著天空的門」把人的動作賦予雷聲，形成擬人，答案 A。",
  solutionSteps: ["先把「急促地」理解為雷聲連續而急的節奏描寫。", "「敲著門」是人的動作，卻用來描寫雷聲。", "因此主要修辭是擬人，選 A。"]
});
update("CHI-0930", {
  question: "一篇報導統計某校 240 名受訪者，其中 15% 每週至少閱讀三本課外書。符合此條件者有多少人？",
  options: ["24 人", "30 人", "36 人", "40 人"],
  answer: 2,
  explanation: "符合條件者占 15%，所以計算 240×0.15＝36 人，答案 C。結果為整數，與人數必須為整數相符。",
  solutionSteps: ["將 15% 化為小數 0.15。", "計算 240×0.15＝36。", "因此符合條件者有 36 人，選 C。"]
});

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Corrected seven reviewed Chinese items and replaced two near-duplicate items.");
