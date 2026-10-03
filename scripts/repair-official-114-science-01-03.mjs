import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const sourcePage = "./assets/official-exams/114-science-p2.webp";
const items = {
  "OFF-1039": {
    source: { year: 114, questionNumber: 1, url: "https://cap.rcpet.edu.tw/exam/114/114exam.html", paperUrl: "https://drive.google.com/file/d/1vFl3qctoBXYcCtWbAqKUqhekIMgV6q-m/view" },
    question: "孕婦產檢時常使用超聲波檢查胎兒生長。醫生使用超聲波檢查時，孕婦對超聲波的聽覺感受最合理的說明為何？",
    options: ["孕婦會聽見低沉的轟隆聲", "孕婦會聽見尖銳刺耳的聲音", "因頻率過高，故孕婦聽不見超聲波", "因波速過快，故孕婦聽不見超聲波"],
    answer: 2,
    explanation: "答案 C「因頻率過高，故孕婦聽不見超聲波」。超聲波頻率超出人耳可聽範圍，耳膜無法隨其振動，因此人聽不見。",
    solutionSteps: ["先分辨聲音是否能被人耳聽見，關鍵在頻率，而非傳播速度。", "超聲波頻率高於人耳可聽範圍，耳膜無法跟著振動。", "因此孕婦聽不見超聲波，選 C；波速快慢不決定是否聽得到。"],
    teacherTip: "聲音能否聽見由頻率範圍決定；聲速主要與介質和溫度相關，不能把高頻誤說成高速。",
    relatedWords: ["超聲波／超音波", "頻率", "人耳可聽範圍"],
    requiresImage: false, requiresContext: false, questionImage: "", questionImages: [],
    answerKeyReview: { status: "已依114年官方自然科第1題及教師解析核對", note: "超聲波頻率超出人耳範圍，答案C。", evidenceSources: [sourcePage, "https://website.hle.com.tw/market/jr/國中會考解析/114/6-自然/解析卷/114年會考_解析卷(自然)-翰林.pdf"] },
  },
  "OFF-1040": {
    source: { year: 114, questionNumber: 2, url: "https://cap.rcpet.edu.tw/exam/114/114exam.html", paperUrl: "https://drive.google.com/file/d/1vFl3qctoBXYcCtWbAqKUqhekIMgV6q-m/view" },
    question: "小陞要測量一顆形狀不規則的小石頭密度。器材代號為：甲＝天平、乙＝溢水裝置、丙＝量筒、丁＝直尺。應選哪兩項器材？",
    options: ["甲與丁", "甲與丙", "乙與丁", "乙與丙"],
    answer: 1,
    explanation: "答案 B「甲與丙」。密度需測質量與體積：用天平甲測質量，再將石頭放入量筒丙，以排水法量出不規則體積。",
    solutionSteps: ["密度的計算式為質量除以體積，因此需取得這兩項測量值。", "天平甲測量石頭質量；量筒丙可比較放入前後水量，測得排水體積。", "所以選 B 甲與丙；直尺不能測不規則體積，題目器材組合中溢水裝置乙不是本題答案。"],
    teacherTip: "不規則固體體積可用排水法，密度題還必須另測質量；讀器材圖時先把每種工具功能對上。",
    relatedWords: ["密度＝質量÷體積", "排水法", "量筒"],
    requiresImage: false, requiresContext: false, questionImage: "", questionImages: [],
    answerKeyReview: { status: "已依114年官方自然科第2題及教師解析核對", note: "以天平測質量、量筒排水法測不規則固體體積，答案B。", evidenceSources: [sourcePage, "https://website.hle.com.tw/market/jr/國中會考解析/114/6-自然/解析卷/114年會考_解析卷(自然)-翰林.pdf"] },
  },
  "OFF-1041": {
    source: { year: 114, questionNumber: 3, url: "https://cap.rcpet.edu.tw/exam/114/114exam.html", paperUrl: "https://drive.google.com/file/d/1vFl3qctoBXYcCtWbAqKUqhekIMgV6q-m/view" },
    question: "都市麻雀數量減少可能與白尾八哥入侵有關。白尾八哥築巢位置與麻雀相近、食物種類相似，且曾被觀察到以麻雀幼鳥為食。兩物種之間最符合哪兩種交互作用？",
    options: ["競爭、掠食", "競爭、共生", "共生、掠食", "寄生、掠食"],
    answer: 0,
    explanation: "答案 A「競爭、掠食」。兩者爭用相近巢位及食物資源，屬競爭；白尾八哥捕食麻雀幼鳥，屬掠食。",
    solutionSteps: ["築巢位置及食物相近，表示兩物種使用相同資源，會形成競爭。", "白尾八哥以麻雀幼鳥為食，符合捕食者吃掉獵物的掠食關係。", "因此兩種關係是競爭與掠食，選 A；沒有互利共生或寄生的線索。"],
    teacherTip: "競爭是爭奪共同資源；掠食是一方捕食另一方，兩者可以同時存在於同一對物種。",
    relatedWords: ["競爭", "掠食", "資源重疊"],
    requiresImage: false, requiresContext: false, questionImage: "", questionImages: [],
    answerKeyReview: { status: "已依114年官方自然科第3題及教師解析核對", note: "巢位和食物重疊為競爭；白尾八哥吃麻雀幼鳥為掠食，答案A。", evidenceSources: [sourcePage, "https://website.hle.com.tw/market/jr/國中會考解析/114/6-自然/解析卷/114年會考_解析卷(自然)-翰林.pdf"] },
  },
};
for (const [id, patch] of Object.entries(items)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Restored official 114 Science Q1–3 from the original paper; removed misplaced garlic items from their slots.");
