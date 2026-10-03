import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const page = n => `./assets/official-exams/114-social-p${n}.webp`;
const verified = (n, p, note) => ({ status: `已依114年官方社會科第${n}題核對`, note, evidenceSources: [page(p)] });
const materialFree = { requiresImage: false, requiresContext: false, questionImage: "", questionImages: [] };
const fixes = {
  1: {
    ...materialFree,
    explanation: "答案 A「日本」。日本和臺灣一樣位於環太平洋地震帶，且常受颱風侵襲；其他選項並非同時以這兩種災害頻繁聞名。",
    solutionSteps: ["題幹的兩項條件是地震頻繁、易受颱風侵襲，必須同時符合。", "日本位於環太平洋地震帶，且常有颱風侵襲，符合兩項條件。", "選 A 日本；伊朗、北韓及澳洲不如日本符合題目所述的雙重災害特徵。"],
    teacherTip: "比較地理條件題要逐項符合所有線索，不能只因一國有地震或颱風其中之一就選。",
  },
  2: {
    ...materialFree,
    explanation: "答案 A「農業勞動力老化」。農業移工補充農場與牧場人力，政策主要回應農業人口高齡化及勞動力不足。",
    solutionSteps: ["題幹說明外籍人力受聘後被派到農務場所工作，重點是補充直接從事農業的人手。", "臺灣農業人口老化、青年投入不足，使農業勞動力短缺。", "因此選 A；食品安全、農村失業或稻米過剩不能說明引進農業移工的主要目的。"],
    teacherTip: "由政策工具反推問題：引進勞工通常是補足人力，不等於解決農產品品質或產量過剩。",
  },
  3: {
    ...materialFree,
    explanation: "答案 B「來自泰、緬的新住民與移工齊聚慶祝潑水節」。電影中的春節、清明節與華語，呈現移民在海外延續並傳播原鄉文化；泰、緬移民在異地共同慶祝潑水節是相同現象。",
    solutionSteps: ["辨認題幹線索：主角在美國出生長大，仍使用華語並與家人過原鄉節日。", "這是移民在居住地延續、傳承和傳播原生文化的例子。", "選 B，泰、緬移民在海外慶祝潑水節同樣呈現移民社群傳承原鄉文化。"],
    teacherTip: "文化傳播題注意「人群遷移、原鄉文化、異地延續」的因果鏈；不只是節日或食物的表面相似。",
  },
  4: {
    question: "圖(一)是某行政區內名為挖仔的聚落地圖。根據該聚落所處環境特色判斷，其地名代表的意義最可能為下列何者？",
    options: ["位於岬灣海岸的灣澳", "鄰近溪流河道的轉彎處", "位處高山之間的小谷地", "台地上的低窪地蓄水成湖"],
    answer: 1, requiresImage: true, requiresContext: false, questionImage: page(2), questionImages: [page(2)],
    explanation: "答案 B「鄰近溪流河道的轉彎處」。地圖上的聚落靠近彎曲河道；「挖仔」地名與河流曲流旁的聚落環境相符。",
    solutionSteps: ["先看圖中的聚落位置與河道，不只從地名單字猜測。", "聚落緊鄰蜿蜒河道的彎曲處，呈現河流曲流地形。", "因此選 B；地圖沒有呈現海灣、高山谷地或台地湖泊。"],
    teacherTip: "地名判讀要把位置圖和地形線索一起看；地圖比例或符號只支持相對位置，不代表實際尺寸。",
  },
  5: {
    ...materialFree,
    explanation: "答案 B「落實區域間資源分配，讓民眾獲得同等醫療品質」。離島交通距離遠、醫療院所及專科資源較少，醫療可近性與資源均衡是居民切身議題。",
    solutionSteps: ["題幹說地方居民更關注與周遭生活環境直接相關的問題。", "離島相較本島都會區，醫療院所與專科服務可近性較弱。", "故選 B；房價、重工業污染及大型土石流並非離島普遍最具代表性的議題。"],
    teacherTip: "地方議題題要把區域特色連到居民需求；離島常見交通與公共服務可近性差異。",
  },
  6: {
    question: "圖(二)呈現臺北地區的帝國大學、臺灣總督府、鐵道部工場及飛行場等設施。根據內容判斷，此圖最可能出自下列何者？",
    options: ["大航海時代的〈熱蘭遮城鎮鳥瞰圖〉", "清帝國統治時期的《淡水廳志》", "日本統治時期的〈臺北州大觀〉", "戰後臺灣的《最新版臺灣街道圖》"],
    answer: 2, requiresImage: true, requiresContext: false, questionImage: page(3), questionImages: [page(3)],
    explanation: "答案 C「日本統治時期的〈臺北州大觀〉」。圖中有臺灣總督府、帝國大學、鐵道部工場與飛行場，皆為日治時期臺北的機關或設施。",
    solutionSteps: ["從地圖標示讀出帝國大學、臺灣總督府、鐵道部工場與飛行場。", "臺灣總督府是日本統治臺灣的最高行政機關，帝國大學及其餘設施也符合日治時期城市景觀。", "選 C；熱蘭遮城屬荷治時期臺南，淡水廳志屬清代，街道圖則不符合這些日治機關線索。"],
    teacherTip: "史料判讀用機關名稱和設施年代交叉定位，不能只看地圖所在區域。",
  },
  7: {
    ...materialFree,
    question: "某中國作家著作主張女性應恢復下列六項自然權利：入學、交友、營業、掌握財產、出入自由、婚姻自由。此著作所提倡的主張最可能與下列何者有關？",
    explanation: "答案 D「晚清時期，近代歐洲思潮傳入中國」。女性受教育、財產、職業與婚姻自主等權利，反映近代平等觀念傳入並被中國知識分子提出。",
    solutionSteps: ["把六項權利歸類：受教育、交友、經營、財產、行動與婚姻自主，核心是女性平等及自主。", "這類近代權利觀念在晚清伴隨西方近代思潮傳入中國。", "選 D；其他選項的隋唐、宋元或明末清初年代與近代女性權利主張不符。"],
    teacherTip: "歷史思想題先概括主張，再依思想內容判斷時代；多項權利並列時找共同核心。",
  },
  8: {
    ...materialFree,
    explanation: "答案 C「市舶司」。宋代市舶司管理海外貿易，負責徵稅、接待或管理外商與進出口貨物，符合題幹描述。",
    solutionSteps: ["題幹限定十一世紀，且機構要管理港口貿易。", "收取關稅、管理外商船隻及進口商品，符合宋代市舶司的職掌。", "選 C；洋行是近代商行，驛站供交通傳遞，總理衙門則是清末外交機構。"],
    teacherTip: "古代機關題可由職掌辨識：市舶司管海外貿易，驛站管交通傳遞。",
  },
  9: {
    ...materialFree,
    explanation: "答案 C「中國共產黨的成立」。五四運動後部分知識分子轉向俄國革命與受壓迫民族理論，促成馬克思主義傳播及中國共產黨成立的思想背景。",
    solutionSteps: ["按時間線索定位：巴黎和會、五四運動之後，知識分子對西方失望。", "文中提到俄國革命、世界革命理論及新政權放棄沙皇時代在華特權，顯示馬克思主義影響擴大。", "此脈絡與中國共產黨成立有關，選 C；其他事件年代或性質不符。"],
    teacherTip: "歷史因果題抓時間詞與思想轉變；巴黎和會、五四運動是理解新思潮傳入的重要背景。",
  },
  10: {
    question: "圖(三)呈現教士向群眾販售贖罪券，並以圖文批判贖罪券交易。作者立場最可能為何？",
    options: ["強調君士坦丁堡教會擁有基督教的領導權", "支持路德教派所提出因信得救的信仰主張", "主張只有希伯來民族能作為耶和華的選民", "認同羅耀拉等人所提倡天主教改革的理念"],
    answer: 1, requiresImage: true, requiresContext: false, questionImage: page(3), questionImages: [page(3)],
    explanation: "答案 B「支持路德教派所提出因信得救的信仰主張」。版畫批判教會販售贖罪券，呼應路德反對以購買贖罪券換取救贖、主張因信稱義的改革立場。",
    solutionSteps: ["觀察版畫：教士向群眾販售贖罪券，畫面文字質疑這種做法。", "馬丁路德批評贖罪券，主張人因信仰得救，而非以金錢購買赦罪。", "因此選 B；不是東西教會領導權、猶太選民論或天主教內部改革派的立場。"],
    teacherTip: "宗教改革題分清路德宗教改革與天主教改革；贖罪券批判是辨認路德立場的關鍵線索。",
  },
};

for (let number = 1; number <= 10; number++) {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  Object.assign(row, fixes[number], { teacherTip: fixes[number].teacherTip, solutionSteps: fixes[number].solutionSteps, relatedWords: ["依題幹證據判斷", "辨析歷史或地理脈絡"], answerKeyReview: verified(number, number <= 5 ? 2 : 3, fixes[number].explanation) });
  if (fixes[number].answer !== undefined) row.answer = fixes[number].answer;
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q1–10 using the original exam pages.");
