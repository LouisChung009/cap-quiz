import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const review = (number, page, note) => ({ status: `已依113年官方自然科題本第${number}題核對`, note, evidenceSources: [`${base}113-science-p${page}.webp`] });
const coldPassage = "【題組材料】冷氣時是當年各地平均氣溫超過 28°C 的時數累積，可用來了解住宅用電。一般認為冷氣時愈多，住宅用電愈高；2020 年起 COVID-19 疫情使民眾居家時間變長，住宅用電明顯成長。2017～2021 年住宅用電量與冷氣時如下：2017 年 47,612 億度、2,283 小時；2018 年 46,879 億度、2,038 小時；2019 年 47,189 億度、2,030 小時；2020 年 50,207 億度、2,247 小時；2021 年 52,729 億度、2,235 小時。";
const energyPassage = "【題組材料】再生能源包含太陽能、風力、水力、地熱及生質能等，具有溫室氣體排放量低等優點。某國 2020 年發電比例為：燃煤 46.1%、燃氣 33.3%、燃油 2.1%、核能 11.8%、再生能源 5.5%、抽蓄水力 1.2%。政府希望未來能源轉型能降低溫室氣體排放、廢除核能、逐年提高再生能源比例，並以燃氣發電取代燃煤發電，同時兼顧用電需求與環境保護。";
const turtlePassage = "【閱讀材料】食蛇龜目前在臺灣為保育類動物。過去因中國市場需求，食蛇龜曾被大量非法運往中國，造成野外數量下降。國際自然保護聯盟（IUCN）為維護生物多樣性及環境穩定，會評估物種滅絕風險；IUCN 評估類別包括 EX（滅絕）、EW（野外滅絕）、CR（極危）、EN（瀕危）、VU（易危）、NT（近危）、LC（暫無危機）、DD（資料缺乏）及 NE（未評估）。食蛇龜目前列為 EN。";
const repairs = {
  "OFF-0865": {
    question: "工廠加工時，酵素 X 持續催化物質甲轉變為乙；溫度超過 75°C 後，酵素便永久失去催化功能。製程如下：10:00–10:20 為 25°C；10:20–10:30 為 35°C；10:30–10:50 為 85°C；10:50–11:00 為 35°C。假設只考慮酵素 X 的作用，哪一對時間點的物質乙含量最接近？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D（10:50 和 11:00）。酵素在 10:30–10:50 經歷 85°C，超過 75°C 後永久失去活性；回到 35°C 也不能恢復催化，因此之後甲不再轉變成乙，兩時間點乙的量相同。",
    solutionSteps: ["先標出酵素仍能作用的條件：溫度不高於 75°C 時有效。", "10:30–10:50 的溫度為 85°C，酵素超過門檻後永久失去功能。", "10:50 降至 35°C 也不能讓酵素恢復；10:50 到 11:00 乙的量不變，所以選 D。"],
    teacherTip: "題目若明說高溫後失活，不能自行假設降溫後會復原；先辨認不可逆條件再比較反應進度。",
    answerKeyReview: review(41, 12, "完整轉錄表十一四階段時間、溫度與酵素失活條件；比較加熱後的 10:50 與 11:00。"),
  },
  "OFF-0866": {
    question: `${turtlePassage}\n\n根據本文，食蛇龜過去曾面臨哪一種問題？`,
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C，過度捕捉。材料指出食蛇龜因市場需求被大量非法運往中國，野外數量因此下降；這是人為大量捕捉造成的族群壓力，不是棲地破壞、污染或外來種引入。",
    solutionSteps: ["回到材料找出數量下降的直接原因：食蛇龜被大量非法運往中國。", "把野生個體大量移出族群，屬於過度捕捉。", "因此選 C；文中沒有說明棲地破壞、污染或外來種問題。"],
    teacherTip: "閱讀生態題先區分威脅類型：捕捉、棲地改變、污染與外來種是不同成因。",
    answerKeyReview: review(42, 12, "將第42–43題共用閱讀材料完整嵌入；依非法輸出造成野外數量下降核對 C。"),
  },
  "OFF-0867": {
    question: `${turtlePassage}\n\n根據本文，食蛇龜在 IUCN 的分類最合理為何？`,
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D，屬於生存受脅物種。材料指出食蛇龜列為 EN；EN 是瀕危類別，屬於 IUCN 的受脅物種類別之一，並非已滅絕、低風險或尚未評估。",
    solutionSteps: ["從材料取得分類代碼：食蛇龜為 EN。", "IUCN 中 EN 代表瀕危；CR、EN、VU 均屬受脅類別。", "所以它是生存受脅物種，選 D。"],
    teacherTip: "讀 IUCN 代碼時要分清滅絕、受脅與低風險類別；EN 是瀕危，不等於已滅絕。",
    answerKeyReview: review(43, 12, "將 IUCN 流程圖中的代碼與分類名稱文字化；依 EN＝瀕危核對 D。"),
  },
  "OFF-0868": {
    question: `${energyPassage}\n\n下列哪組 2030 年與 2050 年發電比例，最符合政府對未來發電方式的期望？`,
    options: ["A：燃煤 25%→13%，再生能源 25%→52%，燃氣 50%→35%（不再使用核能）", "B：燃煤 24%→11%，再生能源 25%→29%，燃氣 25%→30%，核能 26%→30%", "C：燃煤 55%→60%，再生能源 15%→25%，燃氣 30%→15%", "D：燃煤 22%→14%，再生能源 25%→20%，燃氣 45%→60%，核能 8%→6%"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 A。政府目標是逐步淘汰核能、提高再生能源比例，並以燃氣取代燃煤。A 同時符合核能歸零、再生能源由 25% 增至 52%、燃煤由 25% 降至 13%；其餘選項仍保留或增加核能，或再生能源比例沒有增加。",
    solutionSteps: ["把題幹目標轉成條件：核能逐步廢除、再生能源逐年增加、燃煤降低並由燃氣替代。", "逐一比對四組數據，A 的再生能源增加且燃煤下降，核能不再列入。", "B、D 仍有核能，C 的燃煤反而增加，因此選 A。"],
    teacherTip: "多條件圖表題先把文字目標列成檢核清單，再逐項淘汰不符合的方案。",
    answerKeyReview: review(44, 13, "完整轉錄政府能源轉型目標與四組發電比例，依三項政策條件核對 A。"),
  },
  "OFF-0869": {
    question: `${energyPassage}\n\n每發一度電的空氣污染物排放如下：燃煤電廠懸浮微粒 0.0447 g、硫氧化物 0.3417 g、氮氧化物 0.4155 g；燃氣電廠分別為 0.0205 g、0.0017 g、0.3446 g。若將燃煤改採燃氣發電為主，可達到什麼目的？`,
    options: ["減少每度電的金錢成本", "減少每度電的空氣污染物排放", "增加再生能源占整體能源的比例", "增加每度電排放的溫室氣體量"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 B。比較同樣發一度電的數據，燃氣電廠的懸浮微粒、硫氧化物與氮氧化物排放量都低於燃煤電廠，因此改用燃氣可減少這些空氣污染物。這些資料無法推出成本或再生能源比例，也不支持溫室氣體增加。",
    solutionSteps: ["逐項比較燃煤與燃氣：懸浮微粒 0.0447＞0.0205，硫氧化物 0.3417＞0.0017，氮氧化物 0.4155＞0.3446。", "三類空氣污染物每度電排放量都下降。", "因此可減少空氣污染物排放，選 B。"],
    teacherTip: "表格比較需確認分母相同；本題是每度電的排放量，因此可以直接逐項比較。",
    answerKeyReview: review(45, 13, "轉錄每度電三類污染物排放值，逐項比較燃煤與燃氣。"),
  },
  "OFF-0870": {
    question: `${coldPassage}\n\n根據圖表，2021 年住宅用電量 52,729 億度應以何種科學記號表示？`,
    options: ["2.235×10¹⁰ 度", "2.235×10¹¹ 度", "5.2729×10¹¹ 度", "5.2729×10¹² 度"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 D。圖表中的 52,729 單位是億度，1 億＝10⁸；因此 52,729 億度＝52,729×10⁸ 度＝5.2729×10¹² 度。",
    solutionSteps: ["把 52,729 寫成科學記號：5.2729×10⁴。", "「億度」再乘上 10⁸ 度，因此總量為 5.2729×10⁴×10⁸。", "指數相加得 5.2729×10¹² 度，選 D。"],
    teacherTip: "科學記號換算要同時處理數字與單位；「億」是 10⁸，不可只把 52,729 移小數點。",
    answerKeyReview: review(46, 13, "確認圖表單位為億度，按 52,729 億＝5.2729×10¹² 度換算。"),
  },
  "OFF-0871": {
    question: `${coldPassage}\n\n哪一組數據最符合「冷氣時增加會使住宅用電增加，減少則使住宅用電減少」的說法？`,
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A。2017 到 2018 年，冷氣時由 2,283 降至 2,038 小時，住宅用電也由 47,612 降至 46,879 億度，兩者同時下降，最符合題述趨勢。",
    solutionSteps: ["先找冷氣時與住宅用電同方向變動的年份。", "2017→2018 年冷氣時減少 245 小時，住宅用電減少 733 億度。", "兩者都減少，符合引號中的說法，選 A。2020→2021 年則冷氣時略減而住宅用電增加，不符合。"],
    teacherTip: "圖表相關不代表每一年都完全同步；題目問最符合時，要比較變化方向並留意疫情等其他因素。",
    answerKeyReview: review(47, 13, "依五年表列值核對 2017–2018 年兩項指標同時下降；補上明確標答與步驟。"),
  },
  "OFF-0872": {
    question: `${coldPassage}\n\n「冷氣時」以平均氣溫超過 28°C 的時數計算，其原因最可能為何？`,
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。超過 28°C 時，多數人較可能感到炎熱並開啟冷氣，故這段時數可作為住宅冷氣使用與用電的指標。28°C 並非臺灣平均氣溫，也不是冷氣機最耗電或最佳設定溫度。",
    solutionSteps: ["題目將冷氣時定義為平均氣溫超過 28°C 的累積時數。", "這個指標要代表可能使用冷氣的炎熱時段，而不是冷氣機的設定溫度或效率。", "氣溫超過 28°C 時，多數民眾較可能開冷氣，選 C。"],
    teacherTip: "讀指標定義時分清楚「環境氣溫」與「冷氣設定溫度」；相同數字不代表同一變因。",
    answerKeyReview: review(48, 13, "依題組對冷氣時的定義及其作為使用需求指標的目的核對 C。"),
  },
  "OFF-0873": {
    question: "圖（二十五）顯示大氣二氧化碳濃度隨時間上升，並有週期性起伏。本文指出秋冬植物落葉與枯枝分解、春夏植物旺盛行光合作用，使 CO₂ 約每年週期變化。圖中約出現五次週期起伏；整張圖涵蓋時間最可能為多久？",
    requiresImage: true, requiresContext: false, questionImages: [`${base}113-science-p15.webp`], questionImage: `${base}113-science-p15.webp`,
    explanation: "答案 C，約 5 年。圖中的週期起伏對應每年春夏與秋冬的季節變化，約有五個年度週期，因此資料範圍約五年；不是五週、五個月或五十年。",
    solutionSteps: ["先辨認圖上重複的濃度波動：約有五次完整起伏。", "材料說明波動由春夏、秋冬植物活動造成，代表一年一個週期。", "五個年度週期約為五年，選 C。"],
    teacherTip: "從時間序列估算總時長時，先利用題幹找出一個週期代表多久，再乘上週期數。",
    answerKeyReview: review(49, 14, "保留必要濃度曲線；依季節性起伏每年重複、圖中約五個週期判斷五年。"),
  },
  "OFF-0874": {
    question: "工業革命後大量燃燒化石燃料，使大氣 CO₂ 濃度逐漸升高。秋冬枯枝落葉分解增加 CO₂；春夏植物行光合作用，反應可寫為 6CO₂＋6H₂O→C₆H₁₂O₆＋6O₂。CO₂ 濃度因此約有 2～3% 的季節性變化；氧氣濃度也會週期變化。氧氣變化百分比及理由何者最合理？",
    options: ["因 CO₂ 分子量較大，O₂ 的變化百分比遠小於 2～3%", "因 CO₂ 分子量較大，O₂ 的變化百分比遠大於 2～3%", "因大氣中 O₂ 濃度遠高於 CO₂，O₂ 的變化百分比遠小於 2～3%", "因大氣中 O₂ 濃度遠高於 CO₂，O₂ 的變化百分比遠大於 2～3%"],
    requiresImage: false, requiresContext: false, optionsInImage: false, questionImages: [], questionImage: "",
    explanation: "答案 C。光合作用與呼吸作用造成的 CO₂、O₂ 絕對量變動大致相關；百分比變化要用變動量除以原本濃度。大氣中的 O₂ 約占五分之一，濃度遠高於微量 CO₂，因此相似的絕對變動量相對於 O₂ 背景值所占比例小得多。",
    solutionSteps: ["先用反應式確認光合作用消耗 CO₂、產生 O₂；季節變化會使兩種氣體濃度反向變動。", "百分比變化＝變化量÷原始量；相似的絕對變化量，背景濃度越大，百分比越小。", "大氣 O₂ 濃度遠高於 CO₂，因此 O₂ 的相對變化遠小於 CO₂ 的 2～3%，選 C。"],
    teacherTip: "比較百分比變化要看分母，不要用分子量或氣體分子大小解釋濃度變化比例。",
    answerKeyReview: review(50, 14, "將季節變化、光合作用反應式與濃度比較轉錄成完整題幹，依相對變化量判定 C。"),
  },
};

for (const [id, patch] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, patch);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 113 Science Q41–50 against original question pages.");
