import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const repairs = {
  "OFF-0641": {
    answer: 2,
    explanation: "培養皿向左移時，尾鰭影像在顯微鏡視野中相對向右移；依題圖箭頭辨認血液由小動脈經微血管流向小靜脈，反向追蹤影像移動時，依序離開視野的是小靜脈、微血管、小動脈，故選 C。",
    solutionSteps: [
      "顯微鏡下，標本向左移動，視野中的影像會相對向右移；不要把培養皿方向直接當成影像方向。",
      "先用題圖箭頭辨認血流通路：小動脈連到微血管，再由微血管匯入小靜脈。",
      "依影像右移時各段離開視野的順序，先小靜脈，再微血管，最後小動脈，答案 C。"
    ],
    teacherTip: "顯微鏡影像與標本移動方向相反；判讀血管順序時也要先辨認血流方向。"
  },
  "OFF-0642": {
    answer: 2,
    explanation: "口腔原本接近中性，餐後酸性增加會使 pH 下降；嚼無糖口香糖刺激唾液分泌後，酸性降低、pH 回升。符合先下降再回升且回到接近中性的圖為 C，答案 C。",
    solutionSteps: [
      "pH 越低代表酸性越強；餐後口腔變酸，所以曲線應先由接近中性的 pH 約 7 向下。",
      "嚼無糖口香糖後唾液增加，有助於中和酸性，曲線應再向上回到接近 pH 7。",
      "四圖中只有 C 呈現先下降、嚼食後回升，且起始值接近 7，答案 C。"
    ],
    teacherTip: "勿把 pH 下降說成酸性下降；pH 越低，酸性越強。"
  },
  "OFF-0643": {
    answer: 2,
    explanation: "外力 100、200 gw 時木塊靜止，靜摩擦力分別與外力等大；外力 300 gw 時已加速運動，摩擦力 250 gw 為動摩擦力。最大靜摩擦力須大於動摩擦力、又小於使木塊開始運動的 300 gw，因此 250 gw＜fₛ＜300 gw，答案 C。",
    solutionSteps: [
      "木塊靜止時，靜摩擦力會配合外力改變；表中外力 100、200 gw 時摩擦力也分別是 100、200 gw。",
      "外力 300 gw 時木塊已加速，該狀態的 250 gw 摩擦力是動摩擦力；最大靜摩擦力大於動摩擦力。",
      "開始滑動所需外力小於 300 gw，因此最大靜摩擦力介於 250 與 300 gw，答案 C。"
    ],
    teacherTip: "表中的 250 gw 是滑動後的動摩擦力，不是最大靜摩擦力；注意區分運動狀態。"
  },
  "OFF-0644": {
    answer: 3,
    explanation: "標示功率為 1200 W，也就是每秒消耗 1200 J。每分鐘有 60 秒，故每分鐘電能為 1200×60＝72,000 J，答案 D。",
    solutionSteps: [
      "從電器標示讀出最大功率 P＝1200 W＝1200 J/s。",
      "一分鐘為 60 秒，使用電能公式 E＝Pt。",
      "E＝1200×60＝72,000 J，因此選 D。"
    ],
    teacherTip: "瓦特是焦耳／秒；題目問每分鐘的能量，必須把 60 秒乘進去。"
  },
  "OFF-0645": {
    answer: 2,
    explanation: "開花植物的子房受精後發育成果實，子房中的胚珠才發育成種子。題目已指定星號構造由草莓子房發育而來，因此稱為果實，答案 C。",
    solutionSteps: [
      "先抓題目指定的來源：星號構造是由草莓的子房發育而成。",
      "植物生殖構造的發育對應為子房形成果實、胚珠形成種子。",
      "因此該構造是果實，不是胚珠或種子，答案 C。"
    ],
    teacherTip: "草莓可食部分主要由花托膨大形成，但題目問的是子房發育出的星號構造，兩者不可混為一談。"
  },
  "OFF-0646": {
    answer: 0,
    explanation: "中午竿影消失表示太陽直射該地；一年出現兩次代表地點位於南北回歸線之間。日期落在 1 月底與 11 月底，兩次直射都在太陽直射點位於南半球的時段，故位置須在赤道以南的熱帶，圖中為甲，答案 A。",
    solutionSteps: [
      "鉛直竿在中午無影，表示太陽高度角為 90°，當日太陽直射當地。",
      "一年可有兩次直射，該地須位於南、北回歸線之間；日期在年初及年末，顯示是南半球熱帶位置。",
      "對照圖中落在赤道與南回歸線間的標示點為甲，答案 A。"
    ],
    teacherTip: "判斷直射地點需同時用『一年兩次』定位熱帶，再用月份辨認所在半球。"
  },
  "OFF-0647": {
    answer: 1,
    explanation: "導線通電後在磁場中受力，方向由磁場方向、電流方向共同決定，可用左手定則判斷。依圖中兩磁鐵的 N、S 極及電路電流方向分別判讀，甲、乙兩段導線受力皆向西，答案 B。",
    solutionSteps: [
      "先由每個馬蹄形磁鐵的 N 極指向 S 極，標出甲、乙處的磁場方向。",
      "沿電池正負極及導線連接，判斷甲、乙導線中的傳統電流方向。",
      "分別對兩段導線使用左手定則，受力方向都指向西，故選 B。"
    ],
    teacherTip: "左手定則要分別確認磁場、電流和受力三個方向；不要只看兩段導線的電流方向就推斷受力相同或相反。"
  },
  "OFF-0648": {
    answer: 3,
    explanation: "題幹指出患者是因自身發生新突變而罹病，父母皆未患病；若疾病等位基因 F 不是由親代遺傳，父母在此簡化遺傳模型中皆為正常型 ff，答案 D。",
    solutionSteps: [
      "題幹已給定阿佑的致病突變是新發生的，並非從患病親代遺傳。",
      "父母都沒有疾病表現，且題目以 F 表突變型、f 表正常型描述遺傳。",
      "在題目設定下父母皆為 ff；子代的新突變不代表親代帶有 F，答案 D。"
    ],
    teacherTip: "區分遺傳自親代的變異與個體新發突變；不能僅依患病子代反推雙親必帶致病基因。"
  },
  "OFF-0649": {
    answer: 3,
    explanation: "月食發生時月球接近滿月，日食發生時月球接近朔（新月）。9 日月食、23 日日食相隔約 14 天，符合滿月至新月的半個朔望月；新月後約 7 天為上弦月，因此 30 日為上弦月，答案 D。",
    solutionSteps: [
      "月食時地球位於太陽與月球之間，月相接近滿月，所以 9 日接近滿月。",
      "日食時月球位於太陽與地球之間，月相接近朔；23 日接近新月，與 9 日約相隔半個朔望月。",
      "新月後約一週月球到達上弦位置，因此 30 日應為上弦月，答案 D。"
    ],
    teacherTip: "先用日食、月食定位朔與望，再按月相順序推算；不可把日期數字當作月相週期的精確刻度。"
  },
  "OFF-0650": {
    answer: 0,
    explanation: "空氣本來含大量氮氣，泳池水也會接觸空氣中的氮；若只是氮與泳池消毒成分接觸就會生成足以致害的三氯化氮，平常泳池應也常出現同類事件。液態氮大量汽化更直接的危險是氮氣擠走周圍氧氣造成缺氧，因此理由選 A，答案 A。",
    solutionSteps: [
      "氮氣本來就大量存在於空氣中，泳池水面平時也會與空氣接觸。",
      "一般泳池不會僅因這種日常接觸便頻繁發生題述中毒，故『氮與水中氯直接生成三氯化氮』不是合理的主要解釋。",
      "大量液態氮迅速汽化會使局部氧氣濃度下降，造成缺氧昏迷；支持小莫質疑的選項為 A。"
    ],
    teacherTip: "勿把氮氣與含氯消毒劑的日常接觸直接等同於三氯化氮生成；液態氮事故另須注意缺氧窒息風險。"
  }
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing ${id}`);
  if (row.source?.year !== 112 || row.subject !== "自然" || row.source?.questionNumber !== 31 + Number(id.slice(-2)) - 41) throw new Error(`Unexpected source for ${id}`);
  const correctOption = row.options?.[repair.answer];
  if (!correctOption || repair.solutionSteps.length < 3 || !/(?:答案|故選) [A-D]。/.test(repair.explanation)) throw new Error(`Invalid repair for ${id}`);
  Object.assign(row, repair, { answerKeyReview: { ...(row.answerKeyReview || {}), status: "已依官方題本逐題核對", reviewedAgainst: "112 年國中教育會考自然科試題第 31–40 題" } });
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 112 science explanations.`);
