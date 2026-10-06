import fs from "node:fs";

const file = new URL("../data/chinese.json", import.meta.url);
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const changes = {
  "CHI-0291": { unit: "閱讀理解", teacherTip: "推論領隊態度時連起事前的氣象資料、延後決定和午後起霧結果；不要只依隊員抱怨判斷。" },
  "CHI-0292": { unit: "閱讀理解", teacherTip: "找作者觀點時看木匠主動保留刮痕及其理由；他重視的是修復後仍保有原物件的生活記憶。" },
  "CHI-0293": { unit: "閱讀理解", teacherTip: "比較人物前後行動：照表澆水是依既定程序，觀察乾濕、調整位置並商量排水才是主動解決問題。" },
  "CHI-0294": { unit: "詩詞閱讀", teacherTip: "解讀「大庇天下寒士俱歡顏」時看「天下」擴大的受益對象與「俱」所含的普遍願望，不要縮成詩人個人居所。" },
  "CHI-0295": { unit: "詩詞閱讀", teacherTip: "由「孤、獨、寒」等字和人物所處空間合看氛圍；判情感不能只憑一個景物名稱套用固定象徵。" },
  "CHI-0296": { unit: "詩詞閱讀", teacherTip: "分析《天淨沙・秋思》時先整理景物的蕭瑟感，再看「人家」與天涯旅人的對照如何加深思鄉孤獨。" },
  "CHI-0297": { unit: "文言文", teacherTip: "從「直、諒、多聞」的並列項目判斷「諒」是朋友的品格，不是動作「原諒」或心理「體諒」。" },
  "CHI-0298": { unit: "成語", teacherTip: "成語要放入完整使用情境驗義；「不求甚解」是掌握大意而不鑽細節，不等於拒絕閱讀或放棄理解。" },
  "CHI-0299": { unit: "閱讀理解", teacherTip: "由行為和後果推論寓意：反覆推託造成重要工作不再交付，說明態度如何影響信任。" },
  "CHI-0300": { unit: "閱讀理解", teacherTip: "統整不同服務安排的共同目的：地圖、無障礙動線及志工詢問都在降低參觀障礙，促進公平參與。" },
};

const targets = questions.filter((question) => Object.hasOwn(changes, question.id));
if (targets.length !== Object.keys(changes).length) throw new Error("Target ID set is incomplete or duplicated");
for (const question of targets) Object.assign(question, changes[question.id]);
fs.writeFileSync(file, `${JSON.stringify(questions, null, 2)}\n`);
