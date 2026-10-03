import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/113%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const base = "./assets/official-exams/";
const commonTip = "作答時把題幹的關鍵詞改寫成檢核條件，再用材料中的明確證據逐一核對選項。";
const repairs = {
  "OFF-0661": {
    question: "粉絲專頁貼文寫著「秋刀魚已經加薪了」，並標出新售價每條 50 元。這則貼文的用意最可能是什麼？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。貼文以「秋刀魚加薪」作諧趣說法，搭配「新售價 50 元／條」直接傳達售價調高。它不是徵求小編、預告直播，也不是暗示產季將近；核心訊息是宣布秋刀魚價格上漲。",
    solutionSteps: ["先看貼文中最醒目的文字與數字：「新售價 50 元／條」及「加薪」。", "「加薪」是把商品擬人化的幽默說法，實際上說的是價格調高。", "因此貼文用意是宣布秋刀魚漲價，選 D。"], teacherTip: commonTip,
    answerKeyReview: { status: "已依113年官方國文題本貼文核對並轉為文字題幹", note: "貼文標明新售價每條50元，答案 D。", evidenceSources: [`${base}113-chinese-p2.webp`, solutionUrl] },
  },
  "OFF-0662": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。「樹欲靜而風不止」比喻子女想盡孝時，父母可能已不在，因此提醒孝親要及時。A 的「不知所衷」應作「不知所終」；B 的「言襲」應作「沿襲」；C 的「失誤招領處」應作「失物招領處」。只有 D 用字正確。",
    solutionSteps: ["逐句檢查容易混淆的字：A「所衷」應作「所終」；B「言襲」應作「沿襲」。", "C 的機構名稱應是「失物招領處」，不是「失誤招領處」。", "D 的成語與孝親提醒用字正確，所以選 D。"], teacherTip: "字形題先辨認固定詞語，再檢查是否有同音近形字被替換。",
    answerKeyReview: { status: "已依113年官方國文題本選項逐字核對", note: "A、B、C 各有錯字，D 正確；答案 D。", evidenceSources: [`${base}113-chinese-p2.webp`, solutionUrl] },
  },
  "OFF-0663": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。「獻醜」是謙稱自己表演或作品不成熟，適合班長自告奮勇上台前使用。A「承讓」用於比賽中承蒙對手相讓，不是賽後道賀；C「淺見」是說自己的見解，主席不宜用來稱呼各位提供的意見；D「薄酌」是謙稱自己的酒菜，不適合用來稱讚主人準備的宴席。",
    solutionSteps: ["辨認謙詞所指對象：獻醜、淺見、薄酌通常是說話者謙稱自己的表現、見解或酒菜。", "B 班長要表演，說「如果大家不嫌棄，我就獻醜了」使用得當。", "A「承讓」情境錯；C 把他人意見稱作「淺見」；D 把主人酒菜稱作「薄酌」，都不合禮貌對象，因此選 B。"], teacherTip: "謙詞要看「謙的是誰的東西」；不能拿自謙詞去貶稱對方的作品或款待。",
    answerKeyReview: { status: "已依113年官方國文題本謙詞用法核對", note: "只有班長以「獻醜」自謙表演符合對象；答案 B。", evidenceSources: [`${base}113-chinese-p2.webp`, solutionUrl] },
  },
  "OFF-0664": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。B 的立場是反對基因改造，面對「是否同意禁止種植基因改造植物」回答同意，兩者一致。A 主張保障最低工資，卻同意廢除；C 優先考量人類福祉，卻不同意政府不應全面禁止動物實驗；D 不想多繳稅，卻不同意政府不可為建設提高稅率，皆與自己的立場不一致。",
    solutionSteps: ["把雙重否定或政策方向改寫成白話：同意「禁止基改」代表支持停止種植基改植物。", "B 的立場正是反對基因改造，因此回答「同意禁止」與立場吻合。", "A、C、D 的選擇分別支持與自身立場相反的政策，故選 B。"], teacherTip: "問卷題先把「同意／不同意」後面的政策改寫成結果，再和受訪者立場比較，避免被否定詞繞住。",
    answerKeyReview: { status: "已依113年官方國文題本問卷表格核對", note: "反對基改者同意禁止種植基改植物，答案 B。", evidenceSources: [`${base}113-chinese-p2.webp`, solutionUrl] },
  },
  "OFF-0665": {
    question: "某書店開幕廣告以中秋夜為情境，邀請民眾到店喝咖啡、聽歌、讀書、跳舞、賞月，並標出開幕當晚的營業資訊。根據廣告內容，下列敘述何者錯誤？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。廣告用中秋夜與月兔等節慶意象營造氣氛，邀請民眾到店參加活動，也提供開幕當晚營業訊息；它沒有論述終身學習的重要性。讀書只是邀請到店的活動之一，不能據此把廣告目的說成宣揚終身學習。",
    solutionSteps: ["從廣告辨認實際資訊：中秋節情境、邀請到店參與活動，以及開幕當晚營業安排。", "檢查 C：廣告並未說明終身學習的價值或提出相關論證，只把讀書列為店內活動之一。", "因此 C 是錯誤敘述；A、B、D 都能由廣告內容支持。"], teacherTip: "看廣告題要分清楚「出現某活動」與「宣揚某理念」；不可把單一活動擴大成文章主旨。",
    answerKeyReview: { status: "已依113年官方國文題本廣告內容核對並轉為文字題幹", note: "廣告是開幕邀請，未論述終身學習；答案 C。", evidenceSources: [`${base}113-chinese-p3.webp`, solutionUrl] },
  },
  "OFF-0666": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。「月落星沉」的「落」是下降、沉下。D「水落石出」指水位下降後石頭顯露，「落」同樣表示下降。A「下落不明」指去向不明；B「草木疏落」指稀疏；C「丟三落四」的「落」是遺漏，意思都不同。",
    solutionSteps: ["先確定「月落」是月亮降下地平線，不是遺失或稀少。", "比較各選項：只有「水落石出」的「落」也表示水位退降。", "所以選 D。"], teacherTip: "一字多義題要替每個字換成句中實際意思，再比較義項，不要只看整個成語熟不熟。",
    answerKeyReview: { status: "已依113年官方國文題本詞義核對", note: "「月落」與「水落」皆為下降、退落；答案 D。", evidenceSources: [`${base}113-chinese-p3.webp`, solutionUrl] },
  },
  "OFF-0667": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。本文只對照人生前段可結伴、後段進入森林後各自尋路，指出每個人終究要尋找自己的方向；沒有談論應以樂觀態度面對人生。A 的平順轉坎坷、C 的同伴終會分離及 D 的各自開創未來，都能由這個比喻推得，與本文並不相遠。",
    solutionSteps: ["平原上同伴可同行，象徵人生某些階段能與人相伴；進入森林後各走各路，象徵各自面對選擇。", "因此文章重點是人生境遇與道路不同、方向需自己尋找。", "B 加入「樂觀面對」的態度判斷，原文沒有提到，最遠；A、C、D 均與比喻相合。"], teacherTip: "題目問「相去最遠」時，找出選項中唯一額外加入、原文未談的觀念。",
    answerKeyReview: { status: "已依113年官方國文題本譬喻文核對", note: "文章談人生路徑與各自尋路，未提出樂觀態度主張；答案 B。", evidenceSources: [`${base}113-chinese-p3.webp`, solutionUrl] },
  },
  "OFF-0668": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。「罄」讀 ㄑㄧㄥˋ，售罄就是商品全部售完。A「兌」讀 ㄉㄨㄟˋ，不讀 ㄩㄝˋ；B「垠」讀 ㄧㄣˊ，不讀 ㄍㄣ；D「桔梗」的「桔」讀 ㄐㄧㄝˊ，不讀 ㄓㄜˊ。",
    solutionSteps: ["逐一核對字音：兌 ㄉㄨㄟˋ、垠 ㄧㄣˊ、罄 ㄑㄧㄥˋ、桔 ㄐㄧㄝˊ。", "只有 C 的「售罄」注音 ㄑㄧㄥˋ 正確。", "故選 C。"], teacherTip: "多音或易誤讀字要連同詞語記憶；「售罄」常見於商品售完的公告。",
    answerKeyReview: { status: "已依113年官方國文題本注音選項核對", note: "「罄」讀ㄑㄧㄥˋ，答案 C。", evidenceSources: [`${base}113-chinese-p3.webp`, solutionUrl] },
  },
  "OFF-0669": {
    question: "【閱讀材料】由國家出資的遠征計畫經費較高，卻少有重大發現。官方主事者常攜帶大批補給裝備，而非輕裝簡從；又受政治考量限制，無法自行選拔合適成員。相較之下，私人支持的遠征隊較能達成目標，主事者專心致志，可主導成員挑選，每個人都有擅長領域。根據本文，私人支持的遠征隊較能達成目標的原因不包含下列何者？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。本文說官方遠征隊攜帶大量補給、未能輕裝簡從；私人支持的隊伍較能達成目標，原因是政治限制較少、主事者可自行挑選成員，而且隊員各有所長。故「補給裝備較多」不但不是私人隊伍的優勢，還與文中描述的官方隊伍相對，選 B。",
    solutionSteps: ["先圈出題目限定：問私人支持隊伍成功的原因「不包含」哪一項。", "原文把大量補給、受政治考量牽制描述為官方隊伍的問題。", "私人隊伍的優勢是政治考量少、主事者權限大、成員專業；補給裝備較多不是原因，選 B。"], teacherTip: "比較兩類事物時，可用表格分欄列出特徵，避免把甲方的缺點誤套到乙方。",
    answerKeyReview: { status: "已依113年官方國文題本短文核對", note: "大量補給是官方隊伍的特徵，不是私人隊伍達成目標的原因；答案 B。", evidenceSources: [`${base}113-chinese-p3.webp`, solutionUrl] },
  },
  "OFF-0670": {
    optionsInImage: true, requiresImage: true, requiresContext: false, questionImages: [`${base}113-chinese-q10-glyph-options.svg`], questionImage: `${base}113-chinese-q10-glyph-options.svg`, imageAlt: "113年會考國文第10題小篆字形選項 A 至 D",
    explanation: "答案 A。秦代《瑯琊臺刻石》屬小篆，字形特徵是線條圓轉、結構勻稱、筆畫粗細較一致。四幅字形中 A 的線條較圓整、布局均衡，符合小篆；其餘字形可見筆畫形態或結構不符。",
    solutionSteps: ["依題幹列出的篆書特徵檢視字形：筆畫圓轉、左右均衡、線條粗細相對一致。", "逐幅比較圖中 A–D，A 的字形最圓整、結構勻稱，最符合小篆。", "故選 A；本題必須對照字形圖，不能只靠文字選項判斷。"], teacherTip: "辨字體要比較整體結構與筆勢；小篆常見圓轉、對稱、線條均勻。",
    answerKeyReview: { status: "已依113年官方國文題本字形圖核對", note: "四個圖形中 A 符合小篆圓轉勻稱特徵；答案 A。", evidenceSources: [`${base}113-chinese-p4.webp`, solutionUrl] },
  },
  "OFF-0671": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。「鐵畫銀鉤」形容書法筆畫剛勁有力，適合書法比賽。A「妙筆生花」形容文筆優美，較適合作文；B「新鶯出谷」形容歌聲清脆婉轉，適合歌唱；D「口若懸河」形容善於說話，適合演說，不應配給歌唱。",
    solutionSteps: ["把每個題辭的核心意象與比賽能力配對：妙筆對寫作、新鶯對歌聲、鐵畫銀鉤對筆畫、口若懸河對口才。", "C 將書法與「鐵畫銀鉤」相配，最恰當。", "A、B、D 分別把作文、歌唱、演說的題辭錯置，因此選 C。"], teacherTip: "題辭搭配要看詞語描寫的能力或形象，不要只憑熟悉感配對。",
    answerKeyReview: { status: "已依113年官方國文題本表格與成語義核對", note: "「鐵畫銀鉤」形容書法；答案 C。", evidenceSources: [`${base}113-chinese-p4.webp`, solutionUrl] },
  },
  "OFF-0672": {
    question: "【閱讀材料】老農家貧在山住，耕種山田三四畝。苗疏稅多不得食，輸入官倉化為土。歲暮鋤犁傍空室，呼兒登山收橡實。西江賈客珠百斛，船中養犬長食肉。關於這首詩的說明，下列敘述何者最恰當？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。詩中農家收成稀少，稅賦沉重，糧食交入官倉後自己仍須登山採橡實充飢；後兩句再以富商船中養犬吃肉形成對照，凸顯農民生活困苦與分配不均。全詩八句、每句七字，但不是七言律詩；主旨也不是閒適或單純歌頌人情。",
    solutionSteps: ["讀前四句：老農田少、禾苗稀疏，收成被稅賦徵走，官倉有糧而農家無食。", "讀後四句：年末農家登山拾橡實，富商卻以珍珠換得大量財物，船上犬隻也能吃肉。", "農民困苦與富商奢裕形成對比，詩的核心是沉重稅賦下的民生艱難，選 C。"], teacherTip: "古詩分析先抓人物處境與對比，再判斷主旨；形式特徵不能取代內容證據。",
    answerKeyReview: { status: "已依113年官方國文題本詩句核對", note: "稅多不得食、歲暮收橡實與商賈犬食肉形成對照；答案 C。", evidenceSources: [`${base}113-chinese-p4.webp`, solutionUrl] },
  },
  "OFF-0673": {
    question: "【閱讀材料】遺忘就像舞臺打燈後的暗處，漆黑越大片，就越能凸顯光照的明亮。遺忘幫我們揀選人生最值得珍惜的過往片段。因此，遺忘是無須哀悼的，忘得越多，就越應該把眼光投向光照的所在，那才是值得留戀的人事代謝。下列何者最接近本文作者的觀點？",
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 C。作者說遺忘能幫我們揀選值得珍惜的過往，並應把目光投向仍值得留戀的人事；因此 C 的「不被遺忘的事物才最值得珍惜」最接近。D 把「光照」誤解為一般人生光明面，沒有扣合原文所指的珍貴回憶；A、B 則否定或顛倒作者的比喻。",
    solutionSteps: ["抓住作者明說的作用：「遺忘幫我們揀選人生最值得珍惜的過往片段」。", "因此未被遺忘、仍留在記憶中的片段，正是作者認為值得珍惜的人事。", "選 C；D 把「光照」泛化成看見人生光明面，沒有對應文中珍貴回憶的意思。"], teacherTip: "比喻題要先對應兩邊的元素，再回到作者明說的結論，避免只抓住單一意象。",
    answerKeyReview: { status: "已依113年官方國文題本及翰林解析核對", note: "官方解析答案為 C；D 對光照的解讀過度泛化。", evidenceSources: [`${base}113-chinese-p4.webp`, solutionUrl] }, answer: 2,
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 113 Chinese questions.`);
