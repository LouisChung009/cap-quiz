import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/114%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const base = "./assets/official-exams/";
const repairs = {
  "OFF-0912": {
    optionsInImage: true, questionImages: [`${base}114-chinese-p13.webp`], questionImage: `${base}114-chinese-p13.webp`,
    explanation: "答案 A。吳王壽夢有諸樊、餘祭、夷昧、季子札四子。壽夢死後諸樊繼位，諸樊死後傳餘祭、餘祭死後傳夷昧；夷昧死後季子札仍不肯即位，吳人便立夷昧之子僚。公子光是諸樊之子，故親屬圖應由同一父親連出四子諸樊、餘祭、夷昧、季子札，並分別在諸樊下接光、夷昧下接僚，符合 A。",
    solutionSteps: ["依本文整理壽夢的四個兒子：諸樊、餘祭、夷昧、季子札，四人應同屬一代並連到同一父親。", "再定位下一代：公子光是諸樊之子；僚是夷昧之子。", "只有 A 把四兄弟放在同一層，並將光接在諸樊下、僚接在夷昧下，所以選 A。"],
    teacherTip: "把古文親屬關係先改寫成「父親→兒子」清單，再轉成圖；不要把繼位先後誤當成親子關係。",
    answerKeyReview: { status: "已依114年官方國文題本世系史料與親屬圖核對", note: "壽夢四子同代，光為諸樊子、僚為夷昧子；答案 A。", evidenceSources: [`${base}114-chinese-p13.webp`, solutionUrl] },
  },
  "OFF-0913": {
    questionImages: [`${base}114-chinese-p13.webp`], questionImage: `${base}114-chinese-p13.webp`,
    explanation: "答案 D「僚」。本文記載，夷昧死後季子札仍不肯即位，吳人便立夷昧之子僚為王。公子光是諸樊之子，他認為應由季子札依兄弟次序承位；若僚為王，便會使光失去王位，因此他最不能接受僚繼位。",
    solutionSteps: ["先按本文還原繼位順序：諸樊、餘祭、夷昧之後，原應輪到季子札。", "季子札拒絕即位後，吳人改立夷昧之子僚；公子光則是諸樊之子。", "光認為王位應按兄弟次序傳給季子札，因此不能接受僚越過季子札成為吳王，選 D。"],
    teacherTip: "讀史傳要區分「血緣身分」與「繼位次序」；人物反對誰，常要從他認定的名分推論。",
    answerKeyReview: { status: "已依114年官方國文題本史料核對", note: "季子札拒位後僚受立，違背公子光所認定的兄弟繼位次序；答案 D。", evidenceSources: [`${base}114-chinese-p13.webp`, solutionUrl] },
  },
  "OFF-0914": {
    questionImages: [`${base}114-chinese-p14.webp`], questionImage: `${base}114-chinese-p14.webp`,
    explanation: "答案 B。「比來」在文中是「近來、最近」的意思，與選項 B 相同。A「令郎」是對他人兒子的敬稱，不是「令尊」（對他人父親的敬稱）；C「一旦」是「有一天／忽然某時」，不是「剎那」所強調的極短時間；D「俗故」指俗世舊交，不是「老友」這個人的稱呼，語境與替換詞義不完全相同。",
    solutionSteps: ["逐一判斷古詞在原句中的語意，不只看字面相似。", "「比來數於都下朋從處見此屏」意為近來常在京城友人處看見此屏，故「比來」可換成「近來」。", "其餘三組分別混淆令郎／令尊、一旦／剎那、俗故／老友，所以選 B。"],
    teacherTip: "古文詞義題要把詞放回句子翻譯，尤其敬稱、時間詞與指人的名詞，不能只靠現代字面聯想。",
    answerKeyReview: { status: "已依114年官方國文題本司馬光書信與注釋核對", note: "「比來」即近來；答案 B。", evidenceSources: [`${base}114-chinese-p14.webp`, solutionUrl] },
  },
  "OFF-0915": {
    questionImages: [`${base}114-chinese-p14.webp`], questionImage: `${base}114-chinese-p14.webp`,
    explanation: "答案 D。司馬光在信中說石月屏「性本疏野，雅叶所欲」，並描寫其自然清奇之美，表示它正合自己的性情與喜好。A 不對，因他是在薛虢州處見到石月屏，不是因獲贈才第一次得見；B 誤把文錦、白璧與友情作價格比較；C 與文中「欣然領受」相反，他沒有婉拒。",
    solutionSteps: ["先看司馬光對石月屏的直接評語：天然清奇、符合自己的喜好。", "「雅叶所欲」表明石月屏合他的性情，因此 D 的判斷有文本依據。", "再排除：他曾在薛處見過石月屏；文中未比較價格與友情；收到後是欣然接受，不是婉拒。"],
    teacherTip: "人物態度題優先找直接評語與動作；不要把贈禮背景自行延伸成價格或人情債。",
    answerKeyReview: { status: "已依114年官方國文題本書信原文與注釋核對", note: "「性本疏野，雅叶所欲」說明石月屏合司馬光喜好；答案 D。", evidenceSources: [`${base}114-chinese-p14.webp`, solutionUrl] },
  },
  "OFF-0916": {
    questionImages: [`${base}114-chinese-p14.webp`], questionImage: `${base}114-chinese-p14.webp`,
    explanation: "答案 B。司馬光收到石月屏後寫信答謝，說自己「素心悅之，無從可得，豈意一旦不煩懇請，坐致寢中」，意為原本喜歡卻無法得到，沒想到不必開口懇求就送到臥室，因此喜出望外。這最符合 B。信中沒有安排回禮、已備厚禮或邀友鑑賞的內容。",
    solutionSteps: ["抓住信中關鍵語句：「素心悅之，無從可得」表示早就喜愛但一直得不到。", "「豈意一旦不煩懇請，坐致寢中」表示意外獲贈，且無須開口請求，石月屏便送到家中。", "這說明他驚喜並寫信致謝，符合 B；其他選項提到的回禮、厚禮、邀友都沒有文本根據。"],
    teacherTip: "文言推論先逐句翻譯關鍵語，再判斷選項有沒有加入原文沒有的情節。",
    answerKeyReview: { status: "已依114年官方國文題本書信原文核對", note: "司馬光因久愛而意外獲贈，書信致謝；答案 B。", evidenceSources: [`${base}114-chinese-p14.webp`, solutionUrl] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 114 Chinese questions.`);
