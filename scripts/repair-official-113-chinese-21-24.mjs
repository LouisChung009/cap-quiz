import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const solutionUrl = "https://public.ehanlin.com.tw/pre-exam/cap/113%E6%9C%83%E8%80%83%E5%9C%8B%E6%96%87%E8%A7%A3%E6%9E%90.pdf";
const base = "./assets/official-exams/";
const plain = { requiresImage: false, requiresContext: false, questionImages: [], questionImage: "" };
const repairs = {
  "OFF-0681": {
    ...plain,
    explanation: "答案 C。鞠武先承認太子想雪恥報仇的心情，再用對偶句「事必成，然後舉；身必安，而後行」說明行動前須確認可成且自身安全，最後指出太子只憑匹夫之勇、一劍之任而求功，謀略不足。本文以整齊句式強化勸諫，主張謀定而後動。",
    solutionSteps: ["先讀核心對偶句：「事必成，然後舉；身必安，而後行」，兩句結構相對，提出行動的先決條件。", "再看前後文，鞠武勸太子不要只憑一時意氣和個人勇力，應先確保計畫可行、安全。", "因此寫作方式是運用工整句式勸謀定後動，選 C；文章沒有列舉前人失敗事例。"],
    teacherTip: "分析勸諫文要同時看句式與說理方向；成對句往往是論點最凝練的證據。",
    answerKeyReview: { status: "已依113年官方國文題本古文書信核對", note: "對偶句「事必成…身必安…」勸其先謀定再行動；答案 C。", evidenceSources: [`${base}113-chinese-p6.webp`, solutionUrl] },
  },
  "OFF-0682": {
    question: "【閱讀材料】商人某日經過直隸，遇大雨雹，躲在禾田中，聽見空中說：「此張不量田，勿傷其稼。」雨停後，別人的田都倒伏毀壞，只有張家的田無恙。原來張家積糧很多，每年春天借糧給貧民，收還時不計較多少，不曾用量器硬取足額，因此鄉人稱他「不量」。根據本文，「張田獨無恙」的原因最可能是什麼？",
    ...plain,
    explanation: "答案 A。故事把張家田地免於冰雹破壞，連結到張氏長期借糧救濟貧民、收還時不苛求足額的善行，暗示善行得到護佑。文中沒有說貧民祈願，也不是張家田地太多難以丈量；商人只是目擊者，並未使張田倖免。",
    solutionSteps: ["找出作者交代的原因：張氏常借糧給貧民，收回時不計較多寡，不強求足額。", "這些行為顯示他樂善好施，故事以此解釋張田未受災，帶有善有善報的因果觀。", "所以選 A；B、C、D 都沒有文中依據。"],
    teacherTip: "文言故事的因果題要找「蓋」「故」等解說語；不要把故事的超自然情節誤當作有明示證據的其他原因。",
    answerKeyReview: { status: "已依113年官方國文題本短文核對並完整嵌入材料", note: "張氏借糧濟貧且不苛求償還，故事以善行解釋田地免災；答案 A。", evidenceSources: [`${base}113-chinese-p6.webp`, solutionUrl] },
  },
  "OFF-0683": {
    question: "【閱讀材料】目前鰲鼓濕地水位升高，黑面琵鷺棲息處距賞鳥亭 300 多公尺；往年水位低時，沙洲露出，鳥群約在亭前 50 公尺。今年觀賞須帶高倍望遠鏡。賞鳥期為 11 月 1 日至次年 2 月 18 日，期間假日 8 時至 16 時實施車輛管制，改由北閘門進、南閘門出。根據本文，下列敘述何者最恰當？",
    ...plain,
    explanation: "答案 D。管制只在賞鳥期的假日 8 時至 16 時實施，該時段才改為北閘門進、南閘門出；非假日不在這項管制時段內，因此仍可由南閘門進入。A 把望遠鏡需求說反；B 是棲地與亭距離改變，不是棲地隨亭移動；C 把假日時段限定誤成全天候。",
    solutionSteps: ["分清水位與觀賞距離：今年水位高、距離較遠，所以今年更需要高倍望遠鏡，A 顛倒因果。", "管制條件是賞鳥期內的假日 8–16 時，不是整個賞鳥期全天，故 C 錯。", "題目說原先南、北閘門都可自由進出，新的單向規則限於假日管制時段；非假日可從南閘門進，選 D。"],
    teacherTip: "公告題務必圈出日期、星期條件與時段；「期間逢假日」不等於整個期間天天管制。",
    answerKeyReview: { status: "已依113年官方國文題本公告核對並完整嵌入材料", note: "車輛管制僅限賞鳥期假日8至16時，非假日仍可南閘門進；答案 D。", evidenceSources: [`${base}113-chinese-p6.webp`, `${base}113-chinese-p7.webp`, solutionUrl] },
  },
  "OFF-0684": {
    ...plain,
    explanation: "答案 A。文章先說蠶繭若不處理會腐壞，經女工抽絲才能成為美錦；接著以「身者，繭也」作比，指出人若不受教化，智慧品行也會腐敗，經賢者教導才可能成為受敬重的士人。核心是借繭喻人，說明教化修身的重要。",
    solutionSteps: ["讀出明喻：「身者，繭也」把人的身心比作尚未加工的蠶繭。", "蠶繭經女工抽絲成錦，對應人經賢者教導而修養成才。", "所以作者以繭為喻，說明教化對修身的重要，選 A；其餘選項都把重點轉成奢靡、環境或國政。"],
    teacherTip: "古文譬喻題先找明確的「甲者，乙也」，再配對兩邊的變化與作用。",
    answerKeyReview: { status: "已依113年官方國文題本譬喻文核對", note: "繭經加工成錦比喻人受教化而修身成才；答案 A。", evidenceSources: [`${base}113-chinese-p7.webp`, solutionUrl] },
  },
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`找不到題目 ${id}`);
  Object.assign(row, repair);
}

await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official 113 Chinese questions.`);
