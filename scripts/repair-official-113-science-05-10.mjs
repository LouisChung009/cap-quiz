import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const base = "./assets/official-exams/";
const explanationUrl = "https://public.ehanlin.com.tw/pre-exam/cap/113%E6%9C%83%E8%80%83%E8%87%AA%E7%84%B6%E7%A7%91%E8%A7%A3%E6%9E%90.pdf";
const review = number => ({ status: `已依113年官方自然科題本第${number}題核對`, note: "答案與推理依題幹及官方圖表核對。", evidenceSources: [`${base}113-science-p${number <= 5 ? 2 : number <= 8 ? 3 : 4}.webp`, explanationUrl] });
const repairs = {
  "OFF-0829": {
    explanation: "答案 A。副甲狀腺激素由內分泌腺分泌後，經血液運送；分泌過多會促使骨骼釋出鈣，使骨骼中的鈣含量降低，長期可能造成骨質疏鬆。因此 X 是血液、Y 是鈣。",
    solutionSteps: ["先判斷激素的運送途徑：內分泌激素進入血液，再運送到目標器官。", "副甲狀腺激素調節血鈣；分泌過多會增加骨鈣流失，影響骨骼中的鈣含量。", "所以 X 為血液、Y 為鈣，選 A。"],
    teacherTip: "內分泌激素由血液運送；閱讀骨質疏鬆題時留意被影響的是骨骼中的鈣，而不是鉀。", answerKeyReview: review(5),
  },
  "OFF-0830": {
    questionImages: [`${base}113-science-p3.webp`], questionImage: `${base}113-science-p3.webp`,
    explanation: "答案 C。圖(五)的修補方式讓插頭附近的裸露銅線可能彼此接觸；通電後兩條不同電位的導線直接相連會形成短路，電流急遽增大，可能使電線過熱而走火。這不是風扇轉速變慢或一般耗電量稍增的問題。",
    solutionSteps: ["對照圖(四)、圖(五)，注意破損處是否仍有導體裸露，以及兩條導線之間是否被妥善隔開。", "若裸露銅線互相接觸，電流會繞過電扇形成低電阻短路路徑。", "短路造成大電流和過熱風險，可能引發走火，選 C。"],
    teacherTip: "電線修補不可只看外觀；裸露導體接觸可能形成短路，應停止使用並由合格人員更換或修復。", answerKeyReview: review(6),
  },
  "OFF-0831": {
    requiresImage: false, requiresContext: false, questionImages: [], questionImage: "",
    explanation: "答案 A。生石灰（氧化鈣）遇水生成熟石灰，反應會放出熱量；水溫升高通常能提高固體物質的溶解速率，並可能增加鴉片成分溶入水中的程度。題幹說的是石灰遇水使水溫改變，不是鴉片本身使水升降溫。",
    solutionSteps: ["確認反應物：加入水的是石灰，生石灰與水反應會放熱。", "放熱使浸泡液溫度提高；較高溫度可促進鴉片成分溶入水中。", "因此選 A；C、D 把水溫變化錯歸因於鴉片。"],
    teacherTip: "判斷熱效應時先鎖定實際發生反應的物質，再辨認放熱或吸熱；不要把溶解物和反應物混為一談。", answerKeyReview: review(7),
  },
  "OFF-0832": {
    question: "圖(六)呈現《小王子》中美國正午、法國夕陽西下的情境。若以箭頭表示太陽光方向與地球自轉方向，下列何者最符合文中畫雙底線處的狀態？",
    optionsInImage: true, requiresImage: true, requiresContext: false, questionImages: [`${base}113-science-p3.webp`], questionImage: `${base}113-science-p3.webp`,
    explanation: "答案 C。美國位於法國以西；若美國正值正午而法國已近日落，表示法國當地時間較晚。地球自轉方向為由西向東，因此地表位置會依序由美國轉向法國；再配合太陽光照向地球的方向，符合圖中的 C。",
    solutionSteps: ["從時間判斷東西位置：同一時刻法國比美國晚，表示法國在地球自轉方向上位於美國之後。", "地球由西向東自轉；美國正午、法國日落，表示法國一側接近由白晝進入黑夜。", "核對太陽光照明半球和自轉箭頭，符合的示意圖是 C。"],
    teacherTip: "地球日照圖先定太陽光方向，再用「東邊時間較早／晚」與自轉方向交叉檢查。", answerKeyReview: review(8),
  },
  "OFF-0833": {
    questionImages: [`${base}113-science-p4.webp`], questionImage: `${base}113-science-p4.webp`,
    explanation: "答案 A。鹽漬使細胞外液濃度高於細胞內液，水會經半透性的細胞膜由細胞內向外移動，造成細胞質收縮、與細胞壁分離；這符合小凱的圖。鹽離子不會因此大量由細胞內流出或直接穿膜進入細胞。",
    solutionSteps: ["在高麗菜外灑鹽後，細胞外環境變成高濃度溶液。", "水分依滲透作用由細胞內較高水勢處移向外界，細胞質體積縮小。", "表中呈現原生質收縮的是小凱的圖，且移動物質是水，因此選 A。"],
    teacherTip: "滲透作用移動的是水分子；高濃度外液會使植物細胞失水，原生質體可能離開細胞壁。", answerKeyReview: review(9),
  },
  "OFF-0834": {
    question: "圖(八)為中洋脊附近的剖面，X 位於中洋脊旁，Y、Z 位於離中洋脊較遠處。根據海洋地殼形成與擴張的過程，下列何者最可能表示 X、Y、Z 的地殼年齡關係？",
    optionsInImage: true, requiresImage: true, requiresContext: false, questionImages: [`${base}113-science-p4.webp`], questionImage: `${base}113-science-p4.webp`,
    explanation: "答案 D。新的海洋地殼在中洋脊形成，之後隨海底擴張向兩側移動；距離中洋脊越遠，形成時間通常越早、年齡越大。圖中 X 最靠近中洋脊，Y 次之，Z 最遠，因此年齡為 X＜Y＜Z，對應 D。",
    solutionSteps: ["記住海底擴張的順序：岩漿在中洋脊冷卻形成新地殼，舊地殼被推向兩側。", "因此離中洋脊近的 X 年齡最小；較遠的 Y、Z 年齡依距離增加。", "圖中距離依序 X、Y、Z 增大，故年齡關係 X＜Y＜Z，選 D。"],
    teacherTip: "判斷海洋地殼年齡時，以中洋脊為新生位置；兩側離脊越遠，通常地殼越老。", answerKeyReview: review(10),
  },
};

for (let number = 5; number <= 10; number++) {
  const id = `OFF-${String(824 + number).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repairs[id]);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 113 Science Q5–10.");
