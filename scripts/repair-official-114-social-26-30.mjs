import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const image = "./assets/official-exams/114-social-p7.webp";
const verify = (n, note) => ({ status: `已依114年官方社會科第${n}題核對`, note, evidenceSources: [image] });
const data = {
  26: {
    options: ["家務勞動影響了女性參與市場勞動的機會", "外籍配偶增多影響了該國女性的工作機會", "家庭型態變遷使女性承擔較多的家務勞動", "女性投入家務勞動的總時數比市場勞動多"],
    explanation: "答案 A「家務勞動影響了女性參與市場勞動的機會」。圖中有子女的已婚女性勞動參與率低於未婚女性及無子女已婚女性；這與照顧及家務責任對就業參與的影響相符。",
    solutionSteps: ["先比較三條線：有年幼子女的已婚女性參與率長期低於另外兩類。", "三類女性均隨時間增加，但育兒家庭與其他組別仍有差距，反映照顧責任可能限制市場工作參與。", "因此選 A；圖表沒有外籍配偶資料，也不能推論家務總時數一定多於市場工時。"],
    teacherTip: "相關性圖表能支持差異與可能因素的推論，但不要把圖上沒有測量的原因當作直接證明。",
    relatedWords: ["勞動力參與率", "家務勞動", "市場勞動"], answer: 0,
  },
  27: {
    options: ["土耳其將會喪失原有的「歐亞陸橋」稱號", "土耳其的經濟海域範圍將因此而大幅增加", "黑海的海洋生物進入馬摩拉海的機率下降", "船隻等候通過博斯普魯斯海峽的時間減少"],
    explanation: "答案 D「船隻等候通過博斯普魯斯海峽的時間減少」。伊斯坦堡新運河規劃提供黑海與馬摩拉海之間的替代航道，可分散博斯普魯斯海峽船流。",
    solutionSteps: ["從地圖確認新運河位於伊斯坦堡附近，與博斯普魯斯海峽同為黑海通往馬摩拉海的路線。", "若部分船隻改走新運河，原海峽交通量及等候壅塞可能降低。", "選 D；新運河不會讓土耳其海域大幅擴張，也不會改變歐亞陸橋地位；黑海生物移動也非此題主要交通效益。"],
    teacherTip: "基礎建設的影響要沿交通路線推論；替代通道通常分流、降低原通道壅塞。",
    relatedWords: ["Bosporus Strait（博斯普魯斯海峽）", "canal（運河）", "shipping route（航運路線）"], answer: 3,
  },
  28: {
    options: ["水力；因雨量豐沛且山高水深，水力動能大", "太陽能；因位處太陽直射範圍，輻射強度大", "風力；因位於盛行西風帶，風力強勁且穩定", "海洋能；因北大西洋暖流流經，洋流動能大"],
    explanation: "答案 B「太陽能；因位處太陽直射範圍，輻射強度大」。圖中座標約為北緯1.33度、東經103.83度，位於赤道附近的新加坡，全年日照條件有利太陽能發展。",
    solutionSteps: ["讀圖座標 1.33°N、103.83°E，位置在赤道附近的新加坡。", "低緯度地區太陽高度角較大、日照能量較強，適合發展太陽能。", "選 B；新加坡地勢低平，不符合高山水力條件，也不在西風帶或北大西洋暖流沿岸。"],
    teacherTip: "能源區位題以座標定位，再把緯度、地形、風帶或海流等自然條件連到能源類型。",
    relatedWords: ["solar energy（太陽能）", "latitude（緯度）", "solar radiation（太陽輻射）"], answer: 1,
  },
  29: {
    explanation: "答案 B。低於全國平均降水量 691.6 毫米的區域，主要分布在中國西北、北方內陸及較乾燥地區；選項 B 的塗色範圍最符合由東南濕潤區向西北乾燥區的分布。",
    solutionSteps: ["題目規則是年降水量低於 691.6 毫米才塗深灰，需辨認乾燥區的空間分布。", "中國降水大致由東南沿海向西北內陸遞減；西北內陸及部分北方地區較常低於此門檻。", "比較四圖，B 的深色集中在北方與西北內陸，與降水分布最相符。"],
    teacherTip: "先建立降水量由東南向西北遞減的整體格局，再看省界範圍；不要只憑某一省份判斷。",
    relatedWords: ["annual precipitation（年降水量）", "arid（乾燥的）", "inland（內陸）"], answer: 1,
  },
  30: {
    explanation: "答案 C「恢復曾經消失的農地，採友善環境的耕作方式」。植被與健康土壤可吸收並儲存碳；恢復土地生態及土壤碳庫，能增加碳匯。",
    solutionSteps: ["題幹把碳匯定義為吸收並儲存含碳化合物的天然或人工倉庫。", "友善耕作能恢復植被與土壤生態，使土壤累積有機碳，增加碳儲存。", "選 C；焚林會釋放碳，太陽能主要減少排放而非直接擴大碳匯，縮短運輸也屬減排。"],
    teacherTip: "分清減碳排與增碳匯：再生能源偏向減少排放，森林、土壤等生態系吸收儲碳才是碳匯。",
    relatedWords: ["carbon sink（碳匯）", "soil（土壤）", "carbon storage（碳儲存）"], answer: 2,
  },
};
for (let number = 26; number <= 30; number++) {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  const repair = data[number];
  Object.assign(row, repair, {
    question: number === 26 ? "圖(十二)呈現甲國近三十年間三類已婚女性（尚無子女、有子女等）的勞動力參與率。根據圖中資訊，可推論該國社會存在何種現象？（勞動力參與率為15歲以上民間人口中就業者及正在找工作者的比例。）" : row.question.replace(/；註：.*$/s, ""),
    solutionSteps: repair.solutionSteps,
    teacherTip: repair.teacherTip,
    answerKeyReview: verify(number, repair.explanation),
    requiresImage: number !== 30,
    requiresContext: false,
    questionImage: number === 30 ? "" : image,
    questionImages: number === 30 ? [] : [image],
  });
  if (number === 30 && !row.question.startsWith("【閱讀材料】")) row.question = `【閱讀材料】${row.question}`;
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q26–30 against source pages.");
