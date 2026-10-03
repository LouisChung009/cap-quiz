import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const page = n => `./assets/official-exams/114-social-p${n}.webp`;
const review = (n, p, note) => ({ status: `已依114年官方社會科第${n}題核對`, note, evidenceSources: [page(p)] });
const textOnly = { requiresImage: false, requiresContext: false, questionImage: "", questionImages: [] };
const fixes = {
  11: {
    ...textOnly,
    explanation: "答案 C「尊重多元文化，促進文化融合」。跨國公司調整色系、招牌語言與餐點以回應在地文化，屬於全球化下的在地調適與文化交流。",
    solutionSteps: ["題幹列出公司依在地特色調整視覺、語言及商品內容。", "這不是單向輸出原有品牌，而是接納地方文化並改變營運方式。", "因此選 C；其他選項描述國際分工、強勢文化轉型或成立社區組織，均非題幹重點。"],
    teacherTip: "全球化常呈現全球品牌與在地文化互動；在地化調整是回應差異，不代表放棄品牌。",
  },
  12: {
    ...textOnly,
    explanation: "答案 D「避免侵害人權的商業行為」。美國要求企業證明商品未涉及強迫勞動，是為防止供應鏈建立在侵犯勞動者基本人權之上。",
    solutionSteps: ["題幹關鍵詞是強迫勞動，且進口管制要求企業提出未涉及強迫勞動的證明。", "這項措施直接針對供應鏈中的勞動者權利與人權保障。", "選 D；不是為擴大貿易出超、降低貿易障礙，也不是保障旅外美國公民的工作權。"],
    teacherTip: "辨認政策目的要看管制的對象與要求；強迫勞動對應人權議題，而非一般貿易平衡。",
  },
  13: {
    ...textOnly,
    explanation: "答案 D「學校應招募更多廠商進駐美食街提供多元餐點」。增加供給者與選擇，會讓廠商彼此競爭，最直接提高市場競爭程度。",
    solutionSteps: ["題目問提升競爭，不是單純降低價格或提高食品安全。", "更多廠商進入同一市場，消費者可比較商品與服務，業者也必須爭取顧客。", "因此選 D；折扣、履歷、份量調整都沒有直接增加市場中的競爭者數量。"],
    teacherTip: "市場競爭的關鍵是供需雙方有選擇、業者彼此爭取消費者；單一價格措施不等於競爭增加。",
  },
  14: {
    ...textOnly,
    question: "一對姊妹先後結婚，圖(四)呈現四人親屬關係。根據圖示，甲、乙、丙、丁四人之間最不可能存在何種關係？（圖示：兩姊妹各自與配偶結婚。）",
    options: ["配偶", "姻親", "直系血親", "旁系血親"],
    explanation: "答案 C「直系血親」。圖中四人由姊妹及各自配偶構成；姊妹間為旁系血親，配偶彼此為姻親，配偶間是配偶關係，沒有任何一人是另一人的直系尊親屬或直系卑親屬。",
    solutionSteps: ["先依圖辨認兩位姊妹及各自的婚姻關係。", "姊妹是旁系血親；婚姻中的兩人是配偶；配偶與對方親屬則形成姻親。", "四人之間不構成父母子女等直系血親，所以選 C。"],
    teacherTip: "直系血親是親子、祖孫等上下代直接相連；兄弟姊妹屬旁系血親，配偶親屬屬姻親。",
  },
  15: {
    ...textOnly,
    question: "表(二)統計各臺電視新聞報導某候選人的時間比例：水果臺總36%、正面28%、負面4%；F News總12%、正面4%、負面6%；馬水新聞總7%、正面3%、負面2%；W電視總28%、正面4%、負面21%。統計期間為5月1日至7日每日19:00–20:00。讀者最應注意什麼？",
    options: ["覺察媒體的報導內容與事實不符", "解讀媒體報導中的性別刻板印象", "留意媒體業者是否持有特定的立場", "關注媒體是否善盡監督政府的責任"],
    explanation: "答案 C「留意媒體業者是否持有特定的立場」。不同臺對同一候選人的正、負面報導比例差異明顯，讀者應辨識媒體觀點及可能的選擇性報導。",
    solutionSteps: ["比較各臺比例：水果臺正面報導占多數，W電視負面報導占多數，呈現明顯差異。", "同一候選人受到不同方向的報導，值得留意媒體是否有特定立場或選材角度。", "選 C；表格只呈現報導比例，不能直接證明內容不實、性別刻板印象或是否監督政府。"],
    teacherTip: "媒體識讀須區分「報導立場」和「內容真偽」；僅有比例資料不能直接證明報導不實。",
  },
  16: {
    options: ["連結經北極海通往歐洲的航線", "節省與美墨加協定成員的海運時間", "增進與東南亞國協成員的貿易往來", "避免來自西亞的石油運輸受制於他國"],
    explanation: "答案 C「增進與東南亞國協成員的貿易往來」。西部陸海新通道連結中國西部、南部港口及東南亞方向，縮短內陸貨物通往東南亞的運輸路徑。",
    solutionSteps: ["先讀地圖路線：中國西部城市經鐵路、公路向南到南寧、再連接北部灣港與海運。", "路線面向東南亞海域及港口，有利中國西部與東南亞國協成員間物流及貿易。", "選 C；圖示不是北極航線，也不涉及美墨加協定，更不能保證西亞石油運輸不受他國影響。"],
    teacherTip: "讀交通建設效益圖要沿線追蹤起點、通道及終點，再推論改善哪個方向的連結。",
  },
  17: {
    options: ["甲", "乙", "丙", "丁"],
    explanation: "答案 A「甲」。警告指出上游水壩可能洩洪，危險點應位於溪谷中的河道或緊鄰河道處；圖中甲位在河流通過的低地谷線。",
    solutionSteps: ["洩洪水會沿河道向下游流，風險最高處是河谷及河道附近，不是只看海拔高低。", "在等高線圖上，河谷通常呈V形等高線，V形尖端指向上游；沿圖示河流定位。", "圖中甲位於溪谷河道附近，符合警告所指危險區，選 A。"],
    teacherTip: "等高線的V形可辨識河谷；洪水風險要看河道連通和上下游，不可把較高地點一律當作安全答案。",
  },
  18: {
    ...textOnly,
    explanation: "答案 B「美國、墨西哥」。甲地生活成本高、工資遠高於鄰國乙地，居民搬到乙地居住再跨境通勤或遠距工作，符合美墨邊境的跨境生活型態。",
    solutionSteps: ["題幹描述甲地高薪高物價、乙地薪資低且相鄰，形成跨境居住與工作。", "美國與墨西哥接壤，兩側生活成本與所得差異可形成此種通勤／遠距居住情形。", "選 B；法英、土希、馬新都不符合題幹所述的典型所得差及跨境移居脈絡。"],
    teacherTip: "跨境生活題須同時考慮鄰接關係、所得差異、房價和通勤可行性。",
  },
  19: {
    options: ["歐洲", "北美洲", "東北亞", "漠南非洲"],
    explanation: "答案 D「漠南非洲」。圖中甲的人口金字塔底部較寬、年輕人口比例高，呈現出生率相對較高、人口較年輕的結構，符合漠南非洲特徵。",
    solutionSteps: ["讀人口金字塔：底部代表年輕年齡層，甲的底部相對寬，年長人口比例較低。", "這表示人口結構較年輕，與歐洲、北美洲及東北亞常見的低生育、高齡化型態不同。", "選 D 漠南非洲。"],
    teacherTip: "人口金字塔底寬代表年輕人口比率較高；柱形形狀比單看總人口更能判斷區域人口特徵。",
  },
  20: {
    options: ["甲", "乙", "丙", "丁"],
    explanation: "答案 C「丙」。圖(八)介紹的陶製漏斗狀工具是早期製糖過程中的糖漏，用於糖漿結晶、瀝出糖蜜；圖(九)中與製糖活動及糖業聚落相符的位置為丙。",
    solutionSteps: ["先由工具形狀與用途辨認它是糖漏，屬於製糖加工器具。", "十八至十九世紀臺灣的重要製糖區與聚落集中於西南部平原。", "對照圖(九)的地點標示，製糖活動位置對應丙，選 C。"],
    teacherTip: "產業史料題先辨識器具功能，再把產業分布與地圖位置配對；不要只按地名猜答案。",
  },
};

for (let number = 11; number <= 20; number++) {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  const data = fixes[number];
  Object.assign(row, data, {
    solutionSteps: data.solutionSteps,
    teacherTip: data.teacherTip,
    relatedWords: ["依題幹／圖表證據判斷", "辨析地理或社會概念"],
    answerKeyReview: review(number, number <= 15 ? 4 : number <= 19 ? 5 : 6, data.explanation),
  });
  if (data.answer !== undefined) row.answer = data.answer;
  if (number >= 16) {
    row.requiresImage = true;
    row.requiresContext = false;
    row.questionImage = page(number === 20 ? 6 : 5);
    row.questionImages = [row.questionImage];
  }
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q11–20 using the original question pages.");
