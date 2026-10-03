import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const repairs = {
  "OFF-0726": {
    explanation: "答案是 C「5:00pm」。Kevin 必須買齊白吐司、農家麵包、貝果和猶太辮子麵包。店內時刻表顯示它們分別在 10:30am、4:30pm、11:30am、3:30pm 出爐；最後一種是 4:30pm 出爐的農家麵包。題目問能取得新鮮出爐的全部麵包的最早時間，選項中最早可行時刻是 5:00pm。",
    solutionSteps: ["列出四種麵包的出爐時間，取其中最晚的 4:30pm 作為必須等待到的時間。", "對照選項，11:00am、4:00pm 都太早；5:00pm 是第一個晚於 4:30pm 的時間。", "故選 C，而不是等到 7:00pm。"],
    teacherTip: "多項條件都要滿足時，找最晚完成的那項，再選其後最早的可行時間。",
    relatedWords: ["earliest possible（最早可能的）", "fresh out of the oven（剛出爐）", "farm bread（農家麵包）", "challah（猶太辮子麵包）"]
  },
  "OFF-0727": {
    explanation: "答案是 B。海報明確寫著麵包在下午 5 點後半價，只有星期六、日才延至 7 點後，所以 B 正確。店家週一至週日都有營業，不是每週只開五天；可頌只有星期五供應，而蝴蝶餅也標示星期五供應，並非週末；會員資格要付 100 美元，優惠是購物打九折，不是星期五省 100 美元。",
    solutionSteps: ["直接查海報中的折扣、營業日、限定品項與會員條款。", "折扣列明平日 5 點後、週末 7 點後半價，因此 B 的敘述正確。", "其餘選項分別與每日營業、星期五限定及會員年費/折扣內容不符。"],
    teacherTip: "圖表題要留意 after、only、weekend 等限定詞，避免把時間或日期範圍看反。",
    relatedWords: ["half price（半價）", "before / after（之前／之後）", "on weekends（週末）", "member（會員）"]
  },
  "OFF-0728": {
    explanation: "答案是 A。節慶公告直接建議遊客從 Goat Street Station 搭免費接駁車前往會場。週末花市每天開放不代表主節慶只在週末；公告說 Fox Street 在活動期間封街，不能據此建議從該路進入；Garden Square 活動期間不開放汽車停車，因此 D 與公告相反。",
    solutionSteps: ["定位公告中對訪客的交通建議，而不是只看活動日期或場地名稱。", "第 2 點明說可從 Goat Street Station 搭免費 Festival Bus 到會場。", "選 A；B、C、D 分別曲解週末花市、封街資訊及停車限制。"],
    teacherTip: "推薦題要分清楚公告直接建議的行動，和只是附帶提供的場地資訊。",
    relatedWords: ["recommend（建議／推薦）", "free shuttle / bus service（免費接駁服務）", "close to traffic（禁止車輛通行）", "parking（停車）"]
  },
  "OFF-0729": {
    explanation: "答案是 D。地圖上 farmers’ market 位於 Garden Square，最近的地鐵符號在 Koala Street，因此最近的地鐵站是 Koala Street Station。花市在 Bear Road 另一側，中間隔著街廓；農夫市集和節慶公園不在同一街廓；157 號公車站位於 Goat Street，並非 Puppy Street。",
    solutionSteps: ["先在地圖定位 farmers’ market/Garden Square，再辨認地鐵圖示與街名。", "最近的地鐵標示在 Koala Street；不要把車站旁標示的公車號碼當成地鐵站。", "故選 D；其餘選項與街道位置或交通標記不符。"],
    teacherTip: "地圖題先辨認圖例，再追蹤街名、街廓與交通符號，不能只憑地點名稱猜測。",
    relatedWords: ["nearest（最近的）", "block（街廓）", "metro station（地鐵站）", "farmers’ market（農夫市集）"]
  },
  "OFF-0730": {
    explanation: "答案是 B。第一則故事中，Yan 只準備一小盤魚，朋友用「看不見其他美食」暗示他不願分享；第二則故事裡，Chang 不想讓朋友留下吃午餐，朋友便要求借刀、殺馬，最後反問 Chang 不介意借出許多鴨或雞吧。兩則都是用幽默方式呈現主人不慷慨、不願分享。",
    solutionSteps: ["比較兩個故事共同點，不要只根據第一則的食物內容作答。", "Yan 的小份魚與 Chang 不給午餐，兩者都顯示待客時不願分享。", "因此選 B；兩人願意招待朋友的表面情節並非故事反諷重點。"],
    teacherTip: "短篇寓意題要讀出反諷語氣，尤其注意結尾反問如何反轉前文。",
    relatedWords: ["share（分享）", "invite（邀請）", "borrow（借用）", "dry smile（苦笑／帶諷刺的笑）"]
  },
  "OFF-0731": {
    explanation: "答案是 B「The horse」。第二則故事先說朋友打算殺掉自己騎來的馬作午餐，後來 Chang 問他「How are you going to go home without it?」；without it 指沒有那匹馬，因為馬是回家的交通工具。big knife 是用來殺馬的工具，lunch 是目的，鴨或雞則是朋友最後想借走的東西，都不是 it 的先行詞。",
    solutionSteps: ["在第二則故事中找到 it 所在句，再往前找能符合語意的名詞。", "朋友要殺掉騎來的馬，Chang 問沒有它要如何回家，因此 it 指 horse。", "選 B；刀、午餐和鴨雞都無法合理代入「沒有它如何回家」。"],
    teacherTip: "代名詞指涉題把選項逐一代回原句，檢查文法與情境是否同時合理。",
    relatedWords: ["without（沒有／缺少）", "refer to（指涉）", "ride（騎乘）", "lend（借出）"]
  },
  "OFF-0732": {
    explanation: "答案是 A。作者先用醫院與診所說明：大圖書館、博物館像醫院，處理嚴重問題；陳炳宏的書店則像健康中心，修補封面脫落、缺頁等較小問題。這個比喻是為了解釋陳的修書服務與其工作定位，不是在談未來計畫、個人愛書原因或一般書店的重要性。",
    solutionSteps: ["找出 doctors/health center 比喻出現的位置及前後句。", "文章把陳的書店比作健康中心，因他替有小問題的書修補，故比喻在說明服務。", "選 A；其他選項不是這段類比所要說明的內容。"],
    teacherTip: "作者目的題要看比喻前後的解釋句，判斷例子服務於哪個主旨。",
    relatedWords: ["health center（健康中心）", "repair / fix（修理）", "service（服務）", "problem（問題）"]
  },
  "OFF-0733": {
    explanation: "答案是 D。陳修補的舊科學書，是書主的老師送給他的禮物；老師曾幫助書主追尋研讀科學的夢想。修好後，書主覺得彷彿回到與老師相處的日子，因此這份服務幫助他重新想起過去珍貴的時光。A、B、C 都不是故事指出的修書重要性。",
    solutionSteps: ["閱讀例子中書的來歷、書主反應及修復後的感受。", "書主因修好的書想起老師與求學往事，文章說他彷彿回到當年。", "因此選 D；重點是喚回珍貴回憶，不是贈書、節省購書費或追夢的直接效果。"],
    teacherTip: "例證題要把原因和結果串起來：書的來歷 → 修復後的感受 → 作者要證明的價值。",
    relatedWords: ["owner（物主）", "gift（禮物）", "remind（使想起）", "memory（回憶）"]
  }
};

for (const [id, repair] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題") throw new Error(`Missing official question ${id}`);
  Object.assign(row, repair);
}

rows.find(item => item.id === "OFF-0728").question = rows.find(item => item.id === "OFF-0728").question.replace(" 【字彙】recommend 推薦", "");
rows.find(item => item.id === "OFF-0730").question = rows.find(item => item.id === "OFF-0730").question.replace(" 【字彙】likely 可能", "");

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official English explanations.`);
