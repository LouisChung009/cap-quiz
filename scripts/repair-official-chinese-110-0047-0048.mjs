import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const sharedMaterial = `【甲】
柳開少好任氣，大言凌物。應舉時，以文章投於主考簾前，凡千軸，載以獨輪車。引試日，自擁車入，欲以此駭眾取名。其時張景能文有名，唯袖一書簾前獻之。主考大稱賞，擢景優等。時人為之語曰：「柳開千軸，不如張景一書。」
——改寫自沈括《夢溪筆談》

【乙】
張景，字晦之，江陵公安人。幼能長言，嗜學尤力。貧不治產，往從柳開。柳開以文自名，而篤愛士類，一見歡甚，悉出家書予之，由是屬辭益有法度。柳開常說：「如今朝中的士人，誰能超過晦之？」便厚贈資財，送他前往京師，後來張景考中進士。
——改寫自宋祁〈故大理評事張公墓誌銘〉

【丙】相關人物簡表
柳開：948–1001／973
張景：970–1018／1000
宋祁：998–1061／1024
沈括：1031–1095／1063

詞語提示：「凌物」指傲視他人；「引試」指面試；「晦之」是張景的字；「墓誌銘」是記錄死者生平事蹟的文字；「駭眾取名」的「名」指聲名；「嗜學尤力」的「尤」指特別、更加；「悉出家書予之」的「悉」指全數；「使如京師」的「如」指前往。`;
const repairs = {
  "OFF-0046": {
    question: `${sharedMaterial}\n\n下列文句「」中字的意義說明，何者最恰當？`,
    explanation: "答案 D「使如京師──前往」。「如京師」是前往京城的意思。A「駭眾取名」的名是聲名，不是姓名；B「嗜學尤力」的尤是特別、更加，不是尚且；C「悉出家書予之」的悉是全數，不是明白。",
    solutionSteps: ["先利用題幹詞語提示確認四個字在原句中的語境義。", "「使如京師」意為送／派他前往京城，因此「如」解作前往。", "其餘三項分別把聲名、更加、全數誤解成姓名、尚且、明白，只有 D 正確。"],
    teacherTip: "文言字義需放回原句判讀；同一個字在不同語境可能有不同意思。",
    answerKeyReview: { status: "verified", note: "依110年國中教育會考國文原卷第14頁與官方答案表核對；官方答案D。", evidenceSources: ["assets/official-exams/110-chinese-p15.webp", "https://drive.google.com/file/d/1z7jBxC9t24e2Y3WK71XxWe0JOjJRLcNW/view"] }
  },
  "OFF-0047": {
    question: `${sharedMaterial}\n\n關於甲、乙兩文的內容，下列說明何者最不恰當？`,
    explanation: "答案 C。甲文寫柳開載千軸文章應試，張景只獻一書卻獲主考賞識，並以「柳開千軸，不如張景一書」對比兩人的表現；乙文則寫柳開賞識張景、給他家藏書並資助他赴京。只有甲文呈現柳開「大言凌物」的形象，乙文重點是提攜張景，所以「兩文皆凸顯柳開自大」不恰當。",
    solutionSteps: ["先分別抓兩文重點：甲文以應試經過對比柳開與張景；乙文記柳開賞識、資助張景。", "甲文開頭明言柳開「少好任氣，大言凌物」，並寫他以千軸文章炫示；乙文沒有重述這種自大行為。", "因此不能說兩文都凸顯柳開自大，選 C。A、B、D 均可由兩文內容找到依據。"],
    teacherTip: "比較兩篇材料時，逐篇確認人物形象，不要把甲文的描寫直接套用到乙文。",
    answerKeyReview: { status: "verified", note: "依110年國中教育會考國文原卷第14頁及官方答案表核對；原卷的乙文與年表已整理為完整、單一版本。官方答案C。", evidenceSources: ["assets/official-exams/110-chinese-p15.webp", "https://drive.google.com/file/d/1z7jBxC9t24e2Y3WK71XxWe0JOjJRLcNW/view"] }
  },
  "OFF-0048": {
    question: `${sharedMaterial}\n\n根據丙表所列年分，對照甲、乙兩文內容，下列推論何者最合理？`,
    explanation: "答案 D。丙表顯示張景生於970年、卒於1018年；宋祁生於998年，與張景生活年代重疊；沈括則生於1031年，晚於張景去世。乙文作者宋祁的年代較接近張景，且乙文為張景墓誌銘，因此依題目提供的年表，乙文相較甲文可信度較高。",
    solutionSteps: ["先讀年表：張景970–1018，宋祁998–1061，沈括1031–1095。", "乙文作者宋祁出生時張景仍在世；甲文作者沈括出生時張景已去世。", "因此宋祁與張景年代較接近，且乙文是墓誌銘，依題幹資訊可推得乙文相對較可信，選 D。注意這是根據年表作相對判斷，不代表墓誌銘必然完全客觀。"],
    teacherTip: "史料可信度題只能依題目給的年代、作者身分與文類作相對推論；「年代較近」不等於內容必定毫無偏誤。",
    answerKeyReview: { status: "verified", note: "依110年國中教育會考國文原卷第14頁與官方答案表核對；完整年表已轉錄入題幹。官方答案D。", evidenceSources: ["assets/official-exams/110-chinese-p15.webp", "https://drive.google.com/file/d/1z7jBxC9t24e2Y3WK71XxWe0JOjJRLcNW/view"] }
  }
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row || row.source?.year !== 110) throw new Error(`Unexpected or missing item ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Reconstructed original shared materials for OFF-0046–0048.");
