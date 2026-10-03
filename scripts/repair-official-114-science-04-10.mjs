import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const paper = "./assets/official-exams/114-science-p";
const teacher = "https://website.hle.com.tw/mgz/file/jna/114%E5%B9%B4%E6%9C%83%E8%80%83_%E8%A7%A3%E6%9E%90%E5%8D%B7%28%E8%87%AA%E7%84%B6%29-%E7%BF%B0%E6%9E%97.pdf";
const review = (number, page, note) => ({ status: `已依114年官方自然科第${number}題及翰林教師解析核對`, note, evidenceSources: [`${paper}${page}.webp`, teacher] });
const entries = {
  4: {
    question: "小志將物質分成元素、化合物和混合物三類，並列出例子：元素－硫磺；化合物－笑氣（N₂O）；混合物－花岡岩。比較各例子所含的原子種類數，何者正確？",
    questionImage: null, questionImages: [], requiresImage: false, requiresContext: false, imageAlt: "",
    explanation: "答案 A「笑氣＞硫磺」。硫磺（硫）是元素，只含硫原子一種；笑氣 N₂O 是化合物，含氮、氧兩種原子。因此笑氣所含原子種類較多。花岡岩雖是多種礦物組成的混合物，但本題比較的是各例子的原子種類，不是物質種類。",
    solutionSteps: ["先辨認物質分類：硫磺是元素，笑氣 N₂O 是化合物，花岡岩是混合物。", "硫磺只含硫原子；笑氣含氮原子與氧原子，共兩種。", "故笑氣的原子種類多於硫磺，選 A；不要把混合物的成分數和某一化合物的原子種類混為一談。"],
    teacherTip: "比較原子種類時看化學式中的元素符號；N₂ 的下標表示原子個數，不會增加元素種類。",
    answerKeyReview: review(4, 2, "硫磺為單一元素；N₂O 含氮、氧兩種元素，原卷答案A。"),
  },
  5: {
    question: "某鋒面剖面中，地面鋒面交界左側為甲、右側為乙；暖空氣沿斜面由乙側向左上方爬升，雲雨集中在鋒面附近。依此判斷，甲、乙空氣性質為何？",
    options: ["甲、乙皆為暖空氣", "甲、乙皆為冷空氣", "甲為暖空氣、乙為冷空氣", "甲為冷空氣、乙為暖空氣"],
    questionImage: null, questionImages: [], requiresImage: false, requiresContext: false, imageAlt: "",
    explanation: "答案 D「甲為冷空氣、乙為暖空氣」。乙側暖空氣沿鋒面向左上方爬升，鋒面另一側甲為貼近地面的冷空氣；因此甲冷、乙暖。",
    solutionSteps: ["鋒面兩側空氣密度不同，較密的冷空氣會楔入地面附近，暖空氣沿斜面抬升。", "題幹描述暖空氣由乙側沿鋒面向左上方爬升，甲位於另一側的地面冷空氣。", "因此甲為冷空氣、乙為暖空氣，選 D；鋒面附近的上升氣流也解釋了雲雨集中。"],
    teacherTip: "鋒面剖面題要以圖上的冷暖空氣位置與上升箭頭判讀，不要只背鋒面名稱。",
    answerKeyReview: review(5, 2, "依原卷剖面圖冷空氣楔入暖空氣下方、暖空氣沿鋒面上升，答案D。"),
  },
  6: {
    question: "臺灣地下水資源豐富。若長期過度抽取地下水，最可能直接造成哪一種災害？",
    options: ["地層下陷", "順向坡滑動", "土石流", "地震造成房屋受損"],
    questionImage: null, questionImages: [], requiresImage: false, requiresContext: false, imageAlt: "",
    explanation: "答案 A「地層下陷」。超抽地下水會使含水地層孔隙中的水壓下降，鬆散沉積物受上方地層重量壓密，地表因而下沉。其餘選項分別涉及坡地地質、豪雨沖刷或地震，並非抽取地下水的直接結果。",
    solutionSteps: ["找出題幹的原因：長期過度抽取地下水。", "地下水水壓降低後，含水層及其上方鬆散沉積物容易壓密、體積縮小。", "地表隨地層壓密而下沉，對應照片 A 的地層下陷；不是坡地災害或地震。"],
    teacherTip: "超抽地下水的典型影響是地層下陷；海岸地區還可能伴隨海水入侵。",
    answerKeyReview: review(6, 3, "翰林解析指出超抽地下水導致地層下陷；原卷照片A為地層下陷。"),
  },
  7: {
    question: "端午節有立蛋習俗，有人認為生雞蛋只有在臺灣端午節正午才能立起，並主張端午節時太陽引力與地球引力方向恰好相反、兩力相互拉扯才使蛋直立。下列哪項實驗設計及結果最適合反駁這項主張？",
    questionImage: null, questionImages: [], requiresImage: false, requiresContext: false, imageAlt: "",
    explanation: "答案 B「使用同一種的生雞蛋，改於聖誕節正午時在臺灣成功立蛋」。要反駁「只有端午節正午才能立蛋」，需保留臺灣、正午和同種生雞蛋，只改變節日／太陽直射位置。若聖誕節也成功，就證明端午節並非必要條件。",
    solutionSteps: ["把主張拆成條件：成功立蛋必須是端午節正午；要反駁它，需在非端午節仍成功。", "控制地點、時間（正午）及雞蛋種類，避免同時改變其他條件。", "B只把端午節改為聖誕節，若仍能立蛋即可推翻「只有端午節」；A改成煮熟蛋，C、D又換蛋種或雞蛋，控制較差。"],
    teacherTip: "反駁因果主張時，一次只改變關鍵變因，並盡量控制其他條件一致。",
    answerKeyReview: review(7, 3, "控制雞蛋種類與地點，只改節日以檢驗太陽直射位置主張，答案B。"),
  },
  8: {
    question: "某蘆筍植株的甲部位受日光照射而呈綠色，乙部位未受日光照射而呈白色。關於兩部位進行生理作用時釋出的氣體，下列何者最合理？",
    options: ["甲能釋出 O₂，但乙不能", "甲能釋出 CO₂，但乙不能", "乙能釋出 O₂，但甲不能", "乙能釋出 CO₂，但甲不能"],
    questionImage: null, questionImages: [], requiresImage: false, requiresContext: false, imageAlt: "",
    explanation: "答案 A「甲能釋出 O₂，但乙不能」。照光呈綠色的甲部位含葉綠素，可行光合作用並釋出氧氣；地下未照光的白色乙部位不能行光合作用，因此不會因光合作用釋出氧氣。植物細胞呼吸仍會進行，題目比較的是兩部位光合作用相關的氣體釋出。",
    solutionSteps: ["先由顏色與光照判斷：甲受光且呈綠色，具有葉綠素；乙未受光且呈白色。", "有光時，綠色部位可行光合作用，吸收二氧化碳並釋出氧氣。", "因此甲可釋出 O₂，而乙不能以光合作用釋出 O₂，選 A；不是把呼吸作用的 CO₂ 和光合作用產物混淆。"],
    teacherTip: "光合作用需要光與葉綠素，主要消耗 CO₂、產生 O₂；呼吸作用則不以有光為必要條件。",
    answerKeyReview: review(8, 3, "依甲部位照光、綠色有葉綠素可行光合作用；翰林解析答案A。"),
  },
  9: {
    question: "未削尖的鉛筆置於桌面，右端為軟質橡皮、左端為硬質木頭。以手指在兩端沿同一直線施水平力，鉛筆靜止平衡。兩端手指施於鉛筆的力分別為 F左、F右；鉛筆施於兩端手指的反作用力分別為 F′左、F′右。已知 F左＝1 N，且忽略鉛筆與桌面的摩擦力，F′右與 F右的大小關係為何？",
    options: ["F′右＜F右＜1 N", "F′右＜F右＝1 N", "F′右＝F右＜1 N", "F′右＝F右＝1 N"],
    questionImage: null, questionImages: [], requiresImage: false, requiresContext: false, imageAlt: "",
    explanation: "答案 D「F′右＝F右＝1 N」。鉛筆靜止且忽略桌面摩擦，水平方向合力為零，左右手施力大小相等，因此右端手指的力 F右＝左端已知的 1 N。依牛頓第三運動定律，鉛筆對右端手指的反作用力 F′右與 F右大小相等，故兩者皆為 1 N。",
    solutionSteps: ["鉛筆保持靜止，且桌面摩擦忽略，水平方向受力平衡：左端與右端手指施力大小相等。", "已知左端施力 F左＝1 N，所以右端施力 F右＝1 N。", "鉛筆對手指的反作用力與手指對鉛筆的作用力大小相等，故 F′右＝F右＝1 N，選 D。"],
    teacherTip: "先用物體平衡求作用力，再用牛頓第三定律比較作用力與反作用力；兩力作用在不同物體上。",
    answerKeyReview: review(9, 3, "無摩擦水平平衡得F右=F左=1N，再由第三定律F′右=F右，答案D。"),
  },
  10: {
    question: "甲、乙、丙三個金屬球中，甲帶負電，乙、丙帶正電。初始時乙距甲 2 m、距丙 1 m；將乙向左移動 1 m 後，乙距甲變為 1 m、距丙變為 2 m。令甲乙間與乙丙間的靜電力大小分別為 F甲乙、F乙丙；移動前後這兩力大小如何變化？",
    explanation: "答案 B「F甲乙變大，F乙丙變小」。庫侖力大小與兩帶電球距離平方成反比。乙向左移後，甲乙距離由 2 m 減為 1 m，甲乙間作用力增大；乙丙距離由 1 m 增為 2 m，乙丙間作用力減小。電性決定吸引或排斥方向，不改變此處比較的力大小趨勢。",
    questionImage: null, questionImages: [], requiresImage: false, requiresContext: false, imageAlt: "",
    solutionSteps: ["先讀圖追蹤距離變化：甲乙從 2 m 縮短為 1 m；乙丙從 1 m 增加為 2 m。", "依庫侖定律，在電量不變時，距離縮短會使靜電力增大，距離增加會使靜電力減小。", "因此 F甲乙變大、F乙丙變小，選 B；不要把帶異號／同號影響的力方向，誤當成力大小變化。"],
    teacherTip: "庫侖力比較題先用距離平方反比判斷大小，再另行判斷異號相吸、同號相斥的方向。",
    answerKeyReview: review(10, 4, "依原卷距離由2m至1m及1m至2m的改變，庫侖力分別增大、減小，答案B。"),
  },
};
for (const [number, patch] of Object.entries(entries)) {
  const row = rows.find(item => item.subject === "自然" && item.source?.year === 114 && item.source.questionNumber === Number(number));
  if (!row) throw new Error(`找不到114自然第${number}題`);
  Object.assign(row, patch, { solutionSteps: patch.solutionSteps, teacherTip: patch.teacherTip, relatedWords: ["根據原卷圖表與題幹逐步判讀", "先列出條件，再套用科學原理"], answerKeyReview: patch.answerKeyReview });
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Rewrote official 114 Science Q4–10 using original exam diagrams and teacher explanations.");
