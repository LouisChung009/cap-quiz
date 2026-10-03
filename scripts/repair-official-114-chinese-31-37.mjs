import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/114%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const base = "./assets/official-exams/";
const repairs = {
  "OFF-0905": {
    questionImages: [`${base}114-chinese-p10.webp`, `${base}114-chinese-p11.webp`], questionImage: `${base}114-chinese-p10.webp`,
    explanation: "答案 C。甲文列出場景外觀、場景事件、角色外貌、角色行動四項。乙劇本畫線處交代安德魯面前的電子節拍器及其閃爍、數字設定和逐步加速，呈現場景中的物件與事件；文中也寫他停下、加速敲擊等行動，但沒有描寫安德魯的臉部、身形、服裝等外貌，因此最無法呼應「角色外貌」。",
    solutionSteps: ["先依甲文定義四項：場景外觀是地點或物件樣貌；場景事件是當下發生的事；角色外貌是人物外在特徵；角色行動是人物做了什麼。", "回到乙劇本畫線處，找出節拍器位置、燈光／數字變化，以及安德魯的演奏動作；這些分別能讓讀者想像場景、事件與行動。", "畫線處沒有提供安德魯外表特徵，所以答案是 C。"],
    teacherTip: "遇到文學概念配對題，先把每個術語轉成可觀察的問題：在哪裡、發生什麼、長什麼樣、做了什麼，再逐句分類。",
    answerKeyReview: { status: "已依114年官方國文題本核對題幹與劇本", note: "畫線內容有場景、節拍器事件及人物動作，未描寫人物外貌；答案 C。", evidenceSources: [`${base}114-chinese-p10.webp`, `${base}114-chinese-p11.webp`, solutionUrl] },
  },
  "OFF-0906": {
    questionImages: [`${base}114-chinese-p11.webp`], questionImage: `${base}114-chinese-p11.webp`,
    explanation: "答案 C。本文批評把收入數字當成人生唯一指標的人，指出他們會為了錢犧牲生活品質、工作熱忱、自我實現、健康、人生命信念，甚至幸福。因此「重視良好的生活品質」與文中描寫的追問者心態相反，是最不可能的原因；A、B、D 都呼應金錢焦慮與狹窄的價值觀。",
    solutionSteps: ["先找文中對追問者的描述：不斷比較收入、只想知道金額，並把其他價值放到金錢之後。", "文中直接列出被犧牲的項目，包括生活品質、工作熱忱、自我實現、健康與信念。", "所以追問者不是因為重視生活品質才追問，C 與作者描述相反；其餘選項都能從對金錢的恐懼、未來想像單一及工作唯金錢論推得。"],
    teacherTip: "題目問「最不可能」時，先找作者明確列出的原因與結果，再挑與原文價值方向相反的選項。",
    answerKeyReview: { status: "已依114年官方國文題本短文核對", note: "追逐收入數字者會犧牲生活品質；C 與文意相反，答案 C。", evidenceSources: [`${base}114-chinese-p11.webp`, solutionUrl] },
  },
  "OFF-0907": {
    questionImages: [`${base}114-chinese-p11.webp`], questionImage: `${base}114-chinese-p11.webp`,
    explanation: "答案 D。文末說人會把自我、夢想、健康、幸福與信念拿去交換收入，但「到了夠的時候，沒有人不能說夠」，意指忍受犧牲也有極限，終究會想停止。這不是實現自我、停止比較或賺到足夠金錢，而是付出的代價已到不能再承受的程度。",
    solutionSteps: ["把「夠」放回前文：人為收入犧牲多種重要生活價值。", "「到了夠的時候」承接這些犧牲，表示忍耐與付出終有上限。", "因此最接近的是 D「犧牲已到達極限」；A、B、C 都把句意轉成追求成功或金錢結果，原文沒有這樣說。"],
    teacherTip: "解讀抽象句要看前後句的因果與轉折；同一個詞的意思常由前文所列的代價決定。",
    answerKeyReview: { status: "已依114年官方國文題本短文核對", note: "「夠」承接犧牲的代價，指付出已達可承受上限；答案 D。", evidenceSources: [`${base}114-chinese-p11.webp`, solutionUrl] },
  },
  "OFF-0908": {
    optionsInImage: true, questionImages: [`${base}114-chinese-p11.webp`], questionImage: `${base}114-chinese-p11.webp`,
    explanation: "答案 A。縮水式漲價是售價沒有明顯上調，卻減少內容量、縮小尺寸或降低規格，讓消費者用相近價格買到較少商品。A 說因原料異常漲價而調整售價，屬於直接漲價，不是縮水式漲價。B 把麵量減半、C 把瓶裝容量由 500 c.c. 改為 400 c.c.、D 不再附贈作業簿，都以減少商品或附加內容維持表面價格，較符合本文定義。",
    solutionSteps: ["抓住本文定義：縮水式漲價是價格表面不變，商品份量、規格或附加內容減少。", "看 A：明說原料成本上升、價格調漲，變動的是售價而非商品份量，所以不是縮水式漲價。", "B、C、D 都分別減少食物份量、飲料容量或贈品，符合內容縮減的特徵，故選 A。"],
    teacherTip: "比較選項時把價格和內容量分成兩欄：只要售價直接調高、沒有縮減內容，就不是「縮水式」漲價。",
    answerKeyReview: { status: "已依114年官方國文題本圖文題核對", note: "A 是原料成本造成的直接調價；B、C、D 均減少內容或附加品；答案 A。", evidenceSources: [`${base}114-chinese-p11.webp`, solutionUrl] },
  },
  "OFF-0909": {
    questionImages: [`${base}114-chinese-p11.webp`], questionImage: `${base}114-chinese-p11.webp`,
    explanation: "答案 D。企業採取小包裝、客製化或其他替代方案時，消費者較不抗拒，是因為價格變化不容易直接看出來；即使單位價格已提高，消費者不易像面對明顯漲價那樣立即比較。A 的廠商誠意、B 的實際需求與 C 的產品區隔都不是本文指出的關鍵心理。",
    solutionSteps: ["本文先說消費者對明顯漲價反應強烈，對份量縮減也逐漸警覺。", "企業改走另一條路，例如小包裝或客製化，讓價格比較不直觀。", "所以消費者較不抗拒的原因是較難察覺價格改變，選 D；其他選項沒有文中證據。"],
    teacherTip: "作者若直接說明消費者心理，答案通常要對回該句，不要把「企業採取的策略」誤當成「消費者接受的原因」。",
    answerKeyReview: { status: "已依114年官方國文題本短文核對", note: "替代方案使價格變化不易直接察覺；答案 D。", evidenceSources: [`${base}114-chinese-p11.webp`, solutionUrl] },
  },
  "OFF-0910": {
    questionImages: [`${base}114-chinese-p12.webp`], questionImage: `${base}114-chinese-p12.webp`,
    explanation: "答案 B。題文指出《舊五代史》把南唐君主列入「僭偽列傳」，《新五代史》稱南唐為「世家」，都沒有把南唐君主正式列為中原正統帝王。A 把記錄誤解為承認正統；C 顛倒兩書的分類差異；D 說《新五代史》不提李後主入宋，但本文明確提到李煜降宋。",
    solutionSteps: ["先比對兩書分類：《舊五代史》列「僭偽列傳」，《新五代史》列「世家」，兩者都不是承認南唐帝王正統的本紀。", "據此可知兩書都未承認南唐君主具有中原正統帝王身分，B 正確。", "A 將記載等同認可，C 誤稱《舊五代史》地位較高；D 忽略文中明載李煜降宋，故排除。"],
    teacherTip: "比較史書觀點要注意分類名稱的政治意涵；「有記錄」不等於「承認正統」。",
    answerKeyReview: { status: "已依114年官方國文題本史料文核對", note: "兩書分列僭偽列傳與世家，均非正統帝王本紀；答案 B。", evidenceSources: [`${base}114-chinese-p12.webp`, solutionUrl] },
  },
  "OFF-0911": {
    questionImages: [`${base}114-chinese-p12.webp`], questionImage: `${base}114-chinese-p12.webp`,
    explanation: "答案 C。作者先比較五代十國的頻繁戰亂與南唐相對安定，再指出李氏三代君主重視文教、珍藏圖書、興辦學校與網羅畫師，使南唐成為文化重鎮。這段明確肯定李氏三代對文化的貢獻。A 把文章主題誤換成正統之爭；B 與作者對北方政權頻繁戰亂的描述相反；D 將「稱帝」直接判為僭越，非作者論點。",
    solutionSteps: ["找出文章收束處的評價：李氏三代重視文教、珍藏圖書、設立教坊並網羅畫師。", "這些事例共同支持「李氏三代對文化有貢獻」，因此選 C。", "文章不是主張北方較穩定，也沒有要求追求正統或批判趙匡胤；A、B、D 均不合作者觀點。"],
    teacherTip: "作者觀點題可優先看總結評語與例證；不要把文章提及的背景議題誤認為作者主張。",
    answerKeyReview: { status: "已依114年官方國文題本史料文核對", note: "文末具體列出李氏三代的文教措施並予以肯定；答案 C。", evidenceSources: [`${base}114-chinese-p12.webp`, solutionUrl] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 114 Chinese questions.`);
