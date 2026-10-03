import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/113%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const base = "./assets/official-exams/";
const Edinburgh = "最近經常想起愛丁堡，可能是冬天到了的緣故，我就想起那個寒冷的城市。但想起愛丁堡時，記憶幾乎都局限於從宿舍到圖書館的一段路，其他地方有時連路名都想不起來。我在那個城市住了三年多，但從離開那天起，有關它的記憶越來越縮小，失去細節的厚度。\n\n在愛丁堡期間，最常走的一段路是從宿舍到國家圖書館，有時也會為特定資料改去大學總圖或神學院圖書館。我喜歡圖書館，尤其老圖書館厚重的木頭桌椅、沉靜的氣氛和古舊味。但每天最盼望的，還是我給自己訂下的休息時間：下午三、四點到街市旁的大象咖啡館喝咖啡、吃杏仁糖餅、看報紙。從咖啡館望向窗外，可以看見冷寂的城堡與街景。\n\n二十幾歲時，人和城市的關係是有目的性的，有了目標就偏觸。你去到一個地方，心裡清楚不只是經常，只是為了完成些什麼，然後又以執行李往別處去。例如留學，每個留學生的心裡都有一張時間表，底層是完成學業與回家的時間，而那往往和獎學金的年限有關。懷著這張時間表生活，每一天都不是獨立的日子，「現在」不只是現在，是朝向日後而存在，日子長長地投影在未來。\n\n那是一種生活在他方。只是當時不覺得如此忙，往後回想，才看出其中的風塵僕僕。那時我們都還不知道，攜帶著單一的目標去生活是件掛一漏萬的事。二十來歲時銳意求知，要到稍晚才學會，那個尖銳的姿態，同時也是狹窄的。";
const Swift = "《格理弗遊記》（舊譯《格列佛遊記》）或《大小人國遊記》在中文世界裡是學生書架和兒童書架的常客，但在英美文學裡卻是嚴肅的一部諷刺人性、英國時政與權貴的作品。原書有四冊，但許多譯本只有第一、二冊的《小人國》、《大人國》，使人無法窺其全貌。\n\n在原始版本中，《小人國》王將三種不同顏色的絲線：藍、紅、綠賞賜給表演舞蹈的侏儒摔跤手。這三種不同顏色的絲線，是分別刺繡在時稱三種頭子爵士的勳章上：藍色綬帶的嘉德勳章、紅色綬帶的巴斯勳章、綠色綬帶的薊勳章。因為凌波舞高手的筋骨要很柔軟，綏夫特用來影射沒有骨氣的人才能得到寵愛、成為高官。但也因為暗示過於明顯，出版商擔心會得罪當道，所以在出版時將絲線的顏色改為紫、黃、白。顏色一改，寓意就煙消雲散。\n\n此外，早期的中文版本有許多譯字之處。如原書中應搭「冒險」一詞，卻被譯者翻成「格物學」。所學的內容一變，主人翁船長的身分也就變了，在長途航行中該如何發揮所學令人有些困惑。由此可見，翻譯時被誤解的內容，有時會有極大的影響。";
const repairs = {
  "OFF-0685": {
    question: `【閱讀材料】${Edinburgh}\n\n關於文中的「我」，下列敘述何者最恰當？`, requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A。文中說二十幾歲時人與城市的關係帶有目的性，留學者心中有完成學業與返家的時間表，愛丁堡三年多的停留也嵌在這段有目標的求學生活中。作者喜歡老圖書館，但沒有說因此忘記時間；去大象咖啡館是休息安排，不是偏頗決定；他懷念這座城市，也不是討厭寒冷。",
    solutionSteps: ["找出作者對年輕時停留城市的概括：帶著目標前往，完成一件事後再離開。", "文中明說留學時間受學業和獎學金年限安排，愛丁堡停留具有目的性。", "因此選 A；B、C、D 都把作者的喜愛或回憶曲解成否定態度。"], teacherTip: "閱讀題需區分作者明說的回憶與選項自行加上的情緒判斷。",
    answerKeyReview: { status: "已依113年官方國文閱讀材料核對並完整嵌入原文", note: "留學停留受學業目標與時間表安排；答案 A。", evidenceSources: [`${base}113-chinese-p7.webp`, solutionUrl] },
  },
  "OFF-0686": {
    question: `【閱讀材料】${Edinburgh}\n\n文末「那個尖銳的姿態，同時也是狹窄的」這句話，最可能是什麼意思？`, requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 D。作者回望二十幾歲時帶著單一目標生活，當時銳意求知、急著完成學業，卻因此忽略沿途生活的細節；「尖銳」指目標明確而強烈，「狹窄」則指出視野只朝單一目標，未能容納其他經驗。不是粗心失誤、好爭或器量狹小。",
    solutionSteps: ["先接回前文：作者說年輕留學生常把生活排進時間表，只朝完成學業等目標前進。", "「尖銳」形容目標集中、追求急切；「同時也是狹窄」補充其代價是視野與生活經驗受限。", "所以 D「眼前只有單一目標，視野不夠開闊」最貼切。"], teacherTip: "抽象語句要從作者前面描述的生活方式找線索，再解釋比喻兩端的正面與代價。",
    answerKeyReview: { status: "已依113年官方國文閱讀材料核對並完整嵌入原文", note: "單一目標帶來強烈方向，也限制生活視野；答案 D。", evidenceSources: [`${base}113-chinese-p7.webp`, solutionUrl] },
  },
  "OFF-0687": {
    question: `【閱讀材料】${Swift}\n\n根據本文，出版社把原書絲線的顏色改掉，造成的影響最可能是什麼？`, requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A。原書以不同顏色絲線對應英國勳章，諷刺柔弱逢迎者因討好權貴而受寵。出版社把藍、紅、綠改成紫、黃、白後，顏色與勳章的對應關係消失，讀者便難以讀出作者借舞蹈與勳章諷刺權貴、阿諛者的用意。",
    solutionSteps: ["先找原書顏色的功能：藍、紅、綠絲線分別對應英國不同勳章。", "這種對應讓讀者看出授勳與討好權貴的諷刺；絲線顏色被改後，對應線索不見。", "因此原有隱喻和諷刺效果被削弱，選 A。"], teacherTip: "讀諷刺作品時要把虛構細節對回現實象徵；刪改細節可能改變作品的批判效果。",
    answerKeyReview: { status: "已依113年官方國文閱讀材料核對並完整嵌入原文", note: "絲線顏色對應勳章，改色使象徵線索消失；答案 A。", evidenceSources: [`${base}113-chinese-p8.webp`, solutionUrl] },
  },
  "OFF-0688": {
    question: `【閱讀材料】${Swift}\n\n根據本文，關於綏夫特《格理弗遊記》的敘述，何者最恰當？`, requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 B。文章指出《格理弗遊記》在英美文學中是諷刺人性、英國時政與權貴的作品，並非單純兒童奇幻故事；作者藉虛構的旅行和異國制度映照現實弊病。原書四冊而許多中文譯本只有前兩冊，D 則把「格物學」誤說成譯者為免得罪當道，文中並未作此解釋。",
    solutionSteps: ["先辨認作者對作品的定位：它是諷刺人性、時政與權貴的文學作品。", "虛構旅程讓作者能影射現實社會問題，故 B 符合。", "A 將作品簡化成兒童奇幻；C 把「許多譯本只有前兩冊」誤稱為所有早期譯者濃縮；D 對譯詞原因作無根據推論，均排除。"], teacherTip: "比較文學概述時，注意「許多」不等於「全部」，也不要替作者或譯者補上文中沒有的動機。",
    answerKeyReview: { status: "已依113年官方國文閱讀材料核對並完整嵌入原文", note: "本文明言作品藉虛構諷刺現實人性與權貴；答案 B。", evidenceSources: [`${base}113-chinese-p8.webp`, `${base}113-chinese-p9.webp`, solutionUrl] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 113 Chinese questions.`);
