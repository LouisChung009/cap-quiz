import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const repairs = {
  "OFF-0821": {
    answer: 1,
    explanation: "區域立委席次依各選區人口分配，人口較多的縣市通常有較多席次。新北市人口遠多於宜蘭縣，因此新北市的區域立委席次較多，答案 B；其餘選項所述的屏東、彰化、臺南也不符合席次排序。",
    solutionSteps: ["圖(二十四)顯示臺灣人口集中於都會區，立委席次依人口分布而分配。", "新北市是人口最多的直轄市之一，宜蘭縣人口規模遠小於新北市。", "因此新北市區域立委席次多於宜蘭縣，選 B。"],
    teacherTip: "區域立委席次反映人口數，不是縣市面積或人口密度；判斷時要比較總人口。"
  },
  "OFF-0822": {
    answer: 3,
    explanation: "戰後早期臺灣電影常配合反共政策並受政治審查；1980 年代新電影才開始挑戰官方禁忌，處理二二八事件等政治創傷。以二二八事件及家屬長期受監視為劇情，在新電影前最不可能公開播映，答案 D。",
    solutionSteps: ["文章指出 1950 年代電影多配合反共政策，並受到政府審查。", "新電影興起後，創作者才開始挑戰政治禁忌與處理被遮蔽的歷史。", "二二八事件及政治監控屬敏感題材，因此在新電影出現前最不可能播映，答案 D。"],
    teacherTip: "依電影史時序區分反共審查時期與新電影挑戰禁忌的階段。"
  },
  "OFF-0823": {
    answer: 1,
    explanation: "選文指出臺灣新電影以寫實風格、自然與真實為主，並在題材上有意挑戰官方政治禁忌；關注一般農民、勞工等小人物的生活困境，符合此創作方向，答案 B。",
    solutionSteps: ["找出文章描述的新電影特徵：寫實、自然、真實，並關注被忽略的題材。", "小人物的日常困境符合寫實電影呈現社會現況的做法。", "因此最可能選擇農民與勞工生活為題材，答案 B。"],
    teacherTip: "把新電影的寫實風格與題材相連；不要和早期配合政策宣傳的電影混淆。"
  },
  "OFF-0824": {
    answer: 2,
    explanation: "「削蘋果事件」中，政府介入電影內容並限制其公開放映，侵害的是言論與出版傳播自由。禁止過度血腥暴力影像出版同樣涉及國家限制內容公開，權利類型最相近，答案 C。",
    solutionSteps: ["先辨認國家限制的行為：干預電影內容並阻止作品上映。", "這涉及創作者表達以及作品出版、傳播的自由。", "禁止影像出版同樣限制內容傳播，與案例權利類型最相似，答案 C。"],
    teacherTip: "問的是權利類型相似，不是限制目的是否相同；分辨表意／出版自由與選舉、公務資格等權利。"
  }
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing ${id}`);
  if (row.source?.year !== 113 || row.subject !== "社會" || row.source?.questionNumber !== Number(id.slice(4)) - 770) throw new Error(`Unexpected source for ${id}`);
  if (!row.options?.[repair.answer] || repair.solutionSteps.length < 3 || !/(?:答案|選項|故選|選)\s*[A-D]/.test(repair.explanation)) throw new Error(`Invalid repair for ${id}`);
  Object.assign(row, repair, { answerKeyReview: { ...(row.answerKeyReview || {}), status: "已依官方題本逐題核對", reviewedAgainst: "113 年國中教育會考社會科試題第 51–54 題" } });
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 113 social explanations.`);
