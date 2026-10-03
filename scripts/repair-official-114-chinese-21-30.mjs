import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/114%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const repairs = {
  "OFF-0895": {
    requiresImage: true,
    imageAlt: "16強單淘汰賽賽程圖與冠軍、亞軍、季軍組合選項",
    optionsInImage: false,
    explanation: "答案 D。淘汰賽輸一場即出局，冠軍與亞軍必須分屬左右兩個賽區，而季軍是另一場準決賽的敗方。D 中克羅埃西亞位於左半區、摩洛哥位於右半區，可在冠軍戰相遇；塞內加爾也可能在右半區另一支路線輸掉準決賽，取得季軍。A 的阿根廷與巴西都在左半區，不可能同列冠亞軍；B 的荷蘭、澳洲無法同時成為冠軍與季軍；C 的法國、西班牙同在右半區，亦不能分列冠亞軍。",
    solutionSteps: ["先從賽程圖辨認半區：冠軍戰兩隊必須分別由左、右半區晉級。", "再檢查選項 D：克羅埃西亞從左半區晉級、摩洛哥從右半區晉級；塞內加爾可能於右半區另一場準決賽落敗，故三個名次可同時成立。", "排除同半區卻分列冠亞軍的 A、C，以及不符合準決賽敗者季軍位置的 B，因此選 D。"],
    teacherTip: "單淘汰賽推名次時，先判斷隊伍所在半區；冠亞軍必須跨半區，季軍只能是準決賽敗隊之一。",
    questionImages: ["./assets/official-exams/114-chinese-q21-bracket.png"], questionImage: "./assets/official-exams/114-chinese-q21-bracket.png",
    answerKeyReview: { status: "已依114年官方國文題本賽程表與翰林解析卷核對", note: "核對左右半區、準決賽敗者及官方選項；答案 D。", evidenceSources: ["assets/official-exams/114-chinese-q21-bracket.png", solutionUrl] },
  },
  "OFF-0896": {
    questionImages: [], questionImage: undefined,
    explanation: "答案 B。賣餅者說「本流既大，所謀益增，不暇唱曲矣」：本金增加後，計畫與經營範圍也變大，忙到沒有空閒唱歌，說明工作更繁忙。文中沒有說「吾」天天買餅，也沒有表示賣餅者不再賣；「吾」給錢是讓他增加本金，不是要他用歌聲招攬客人。",
    solutionSteps: ["理解關鍵句：「本流」指本金／資本，「所謀益增」指經營打算增多，「不暇」是沒有空閒。", "把關鍵句連起來：資本變多後擴大經營，工作增加，所以無暇唱歌。", "因此 B 說生意資本擴增後工作更繁忙；其餘選項都超出文章內容，選 B。"],
    teacherTip: "文言詞義要放回語境：「本流」看作本金，「不暇」是無暇；別把敘述者聽歌誤推成天天購買。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷核對", note: "「本流既大，所謀益增，不暇唱曲」直接說明工作增加；完整短文已置於題幹，不需截圖。答案 B。", evidenceSources: ["assets/official-exams/114-chinese-p7.webp", solutionUrl] },
  },
  "OFF-0897": {
    optionsInImage: false,
    explanation: "答案 D。遠方徵來的戍卒不熟悉塞下地勢、心裡畏懼胡人；改募當地居民屯戍，居民熟悉環境，又要保護家人、田產，遇到胡人來犯時會互相救助、不避死戰。因此兩種方法對「對胡人的心態」可分別概括為畏懼與不畏懼。",
    solutionSteps: ["找出遠方戍卒的特點：不習地勢，而且心畏胡人。", "找出募民屯戍的特點：當地人可相互救助，為了保全親人和財產，遇敵不避死。", "比較心態，遠卒畏懼、募民不畏懼，表格 D 正確。"],
    teacherTip: "比較題先將兩組對象的原文線索分欄整理，再檢查表格是否把特徵顛倒；此題關鍵是「心畏胡」與「赴胡不避死」。",
    questionImages: [], questionImage: undefined,
    answerKeyReview: { status: "已依114年官方國文題本表格與翰林解析卷核對", note: "遠卒心畏胡；當地募民因自保而赴胡不避死。答案 D。", evidenceSources: ["assets/official-exams/114-chinese-p7.webp", solutionUrl] },
  },
  "OFF-0898": {
    questionImages: [], questionImage: undefined,
    explanation: "答案 B。文章先說《碧雲騢》被誤傳為梅聖俞所作，後來查明是魏泰寫作並嫁名給梅聖俞，所以《碧雲騢》應非梅聖俞所作。A 把「范文正被批評」錯解成他揭發過錯；C 把梅聖俞與魏泰的仕途、怨懟混淆；D 與歐陽修不記人過惡、君子應如此的主張相反。",
    solutionSteps: ["抓住轉折：「後聞之，乃魏泰所為，嫁之聖俞也」指出作品實為魏泰所作，卻冒署梅聖俞。", "因此最恰當的敘述是《碧雲騢》並非梅聖俞所作，選 B。", "末句引用《歸田錄》稱不記人過惡是君子用心；這是在肯定寬厚，不是反對替賢者隱諱。"],
    teacherTip: "文言文遇到「乃」「嫁之」等轉折與指代詞，要追蹤作者、被誣者及議論者，避免把人物角色互換。",
    answerKeyReview: { status: "已依114年官方國文題本與翰林解析卷核對", note: "文中明言作品為魏泰所作並嫁名梅聖俞；完整原文已置於題幹。答案 B。", evidenceSources: ["assets/official-exams/114-chinese-p7.webp", solutionUrl] },
  },
  "OFF-0899": {
    questionImages: [], questionImage: undefined,
    explanation: "答案 B。公呆遇到動物靠噴水示警或嚇退，但水柱會暴露牠們藏在泥灘中的位置，反而容易再被發現。文中說牠們生活在淺灘、壽命短且殼薄，深海更冷、壓力更大，並不會延長生命；殼薄也不耐碰撞；躺平晒太陽是趁活著享受溫暖與陪伴，不是群體死亡前的儀式。",
    solutionSteps: ["先找防禦行為：有動物接近時，公呆會噴水，可能嚇退敵人。", "作者指出噴水同時會暴露位置，使牠更容易被發現，因此 B 符合文意。", "深海寒冷且壓力大，公呆殼薄無法承受；躺平晒太陽也不是死亡前行為，其他選項不成立。"],
    teacherTip: "讀作者的敘事時分辨事實與推論；「或許嚇退敵人」後面緊接「暴露位置」，構成行為的反效果。",
    answerKeyReview: { status: "已依114年官方國文題本閱讀材料與翰林解析卷核對", note: "材料說噴水警示會暴露藏身位置；僅保留含閱讀材料的必要頁圖。答案 B。", evidenceSources: ["assets/official-exams/114-chinese-p8.webp", solutionUrl] },
  },
  "OFF-0900": {
    questionImages: [], questionImage: undefined,
    explanation: "答案 A。文章由外婆與孫子的對話呈現不同世代對生活的看法：外婆以勞動生活經驗看待短命、殼薄的公呆，孫子則從環境與生命議題提出疑問。這種對話使兩代價值觀差異浮現。文中沒有作者懷念親人，也非在倡議永續發展；公呆象徵的是現代「躺平」態度，不是活到老學到老。",
    solutionSteps: ["辨認寫作形式：外婆先講公呆，孫子不斷追問，兩人對生命與生活的理解不同。", "這些對話呈現外婆的生活經驗和孫子的環境／生命觀，暗示世代價值觀差異。", "文章沒有懷親、永續倡議或終身學習的主旨，因此選 A。"],
    teacherTip: "寫作分析題要看對話如何推動主題；不要把文中出現的環保或生命議題直接放大成全文主旨。",
    answerKeyReview: { status: "已依114年官方國文題本閱讀材料與翰林解析卷核對", note: "祖孫對公呆的不同解讀暗示世代價值觀差異；答案 A。", evidenceSources: ["assets/official-exams/114-chinese-p8.webp", solutionUrl] },
  },
  "OFF-0901": {
    imageAlt: "灰面鵟鷹南下與北返遷徙地圖",
    questionImages: ["./assets/official-exams/114-chinese-q27-migration-maps.png"], questionImage: "./assets/official-exams/114-chinese-q27-migration-maps.png",
    explanation: "答案 B。本文明確說春季一條北上路線從臺灣東北外海的蘭嶼出發，經琉球群島前往日本等地；圖（二）的北上路線少了蘭嶼這段。南下則會經墾丁出海，且來自中國東北的路線已在圖中表示，因此 A、C、D 不成立。",
    solutionSteps: ["先從本文摘出春季北上的兩條路線：一條經臺灣東北外海的蘭嶼、琉球；另一條由臺灣西岸往中國東北等地。", "對照圖（二），北上線缺少蘭嶼—琉球的路段，故 B 成立。", "圖示已有中國方向的南下線，且文中南下線會經墾丁；A、C、D 與文圖不符。"],
    teacherTip: "路線題要先把文字中的起點、途經地、方向列出，再逐段核對地圖；不要把南下與北上箭頭混讀。",
    answerKeyReview: { status: "已依114年官方國文題本路線圖與翰林解析卷核對", note: "春季北上應經蘭嶼、琉球，圖（二）漏畫蘭嶼路段；答案 B。", evidenceSources: ["assets/official-exams/114-chinese-q27-migration-maps.png", solutionUrl] },
  },
  "OFF-0902": {
    questionImages: [], questionImage: undefined,
    explanation: "答案 C。本文直接指出八卦山次生林提供豐富食物；此外灰面鵟鷹遷徙時利用山脈尋找上升氣流，八卦山的地形正好提供停棲與滑翔條件。因此原因是食物豐富、地形適合。文中沒有說雨量、繁殖氣候或單純容易辨識是主要原因。",
    solutionSteps: ["定位本文對八卦山的兩項說明：次生林提供豐富食物，山脈地形有助尋找上升氣流。", "題目問休息站原因，食物供應與遷徙地形條件都能解釋鵟鷹停留。", "因此選 C；林相雨量、辨識度與繁殖氣候都不是本文給出的證據。"],
    teacherTip: "因果推論應以文章明示資訊為準；同一段列出的食物與地形線索共同對應選項，不必自行補入氣候假設。",
    answerKeyReview: { status: "已依114年官方國文題本圖文與翰林解析卷核對", note: "文中直接給出食物來源與上升氣流地形兩項條件；答案 C。", evidenceSources: ["assets/official-exams/114-chinese-p9.webp", solutionUrl] },
  },
  "OFF-0903": {
    questionImages: [], questionImage: undefined,
    explanation: "答案 C。甲文說視覺化寫作要描寫場景外觀、事件、角色外貌及角色行動，讓劇本讀者能在腦中形成畫面、掌握情境，所以 C 正確。文章沒有說增加對白會提升電影視覺效果，也沒有說觀眾必須先學會此技能才能看電影；希區考克提到劇本需要劇本本身等三元素，並非認為視覺化寫作是最重要部分。",
    solutionSteps: ["從甲文找視覺化寫作的功能：把地點、事件、角色外貌和行動描寫清楚，讓讀者在腦中形成影像。", "因此它能幫助讀劇本的人掌握情境，符合 C。", "對白比例、觀眾是否必須學習，以及「最重要」等說法都不是本文主張，排除 A、B、D。"],
    teacherTip: "閱讀說明文要區分作者主張與延伸推論；像「必須」「最重要」這類絕對詞，需確認原文確實支持。",
    answerKeyReview: { status: "已依114年官方國文題本甲文與翰林解析卷核對", note: "視覺化寫作把情境轉成讀者可想像的畫面；答案 C。", evidenceSources: ["assets/official-exams/114-chinese-p10.webp", solutionUrl] },
  },
  "OFF-0904": {
    questionImages: [], questionImage: undefined,
    explanation: "答案 D。「喀啦」是安德魯雙手全力打鼓後，右鼓棒斷成兩半時的狀聲詞，標示一個動作結果與情節轉折。A 對白並非重點；B 的「關上」只是動作描述，沒有形成角色衝突；C 節拍器數值由 380 調到 390、400，呈現的是安德魯努力追上節奏，不是故障或偏執。",
    solutionSteps: ["沿乙劇本的事件順序讀：節拍器速度逐步提高，安德魯努力追上，最後雙手全力敲擊。", "隨後出現「喀啦」，緊接著描寫右鼓棒斷成兩半，這個狀聲詞突出突發結果。", "因此它製造情節轉折，選 D；節拍器沒有故障，且「關上」並非主要衝突。"],
    teacherTip: "劇本分析要把舞台動作、狀聲詞和後續事件連起來；不要把速度調整誤讀為節拍器故障。",
    answerKeyReview: { status: "已依114年官方國文題本乙劇本及續頁與翰林解析卷核對", note: "「容啦」後鼓棒斷裂，是動作結果並形成情節轉折；答案 D。", evidenceSources: ["assets/official-exams/114-chinese-p10.webp", "assets/official-exams/114-chinese-p11.webp", solutionUrl] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 114 Chinese questions.`);
