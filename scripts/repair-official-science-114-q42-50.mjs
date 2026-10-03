import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const pages = number => `./assets/official-exams/114-science-p${number}.webp`;
const repairs = [
  {
    id: "OFF-1080",
    question: "瑞典學生拍攝影片表達節能的重要性，影片中請來奧運自行車選手踩單車發電烤吐司，最終選手踩到精疲力竭，才烤好一片吐司，如圖（二十六），過程中發電的平均電功率約 700 W，總共產生的電能約 0.021 kWh。若以一度電 3 元計算，上述過程產生的電能，其對應的電費應如何計算？",
    options: ["700 ÷ 1000 × 3 元", "0.021 × 3 元", "(0.021 × 700) ÷ 1000 × 3 元", "(0.021 × 1000) ÷ 700 × 3 元"],
    answer: 1,
    explanation: "1 度電等於 1 kWh，題目已給電能 0.021 kWh，因此電費為 0.021×3＝0.063 元；答案 B。700 W 是平均功率，不能再拿來乘電能。",
    solutionSteps: ["辨認計價單位：每度電 3 元，也就是每 kWh 3 元。", "直接用已知電能 0.021 kWh 乘單價：0.021×3。", "結果為 0.063 元，選 B；700 W 是功率，不是電能。"],
    teacherTip: "先分清功率 W 與電能 kWh；題目已給 kWh 時，不必再用功率重算。",
    questionImages: [pages(12)], requiresContext: false, requiresImage: true,
  },
  {
    id: "OFF-1081",
    question: "根據實驗結果，關於不同溫度對蒜頭變綠色的影響，下列說明何者最合理？",
    options: ["全程在 10℃，變色的速率最快", "全程在 25℃，變色的速率最快", "先低溫處理，接著改在 25℃放置會減緩變色的速率", "先低溫處理，接著改在 25℃放置會加快變色的速率"],
    answer: 3,
    explanation: "實驗二中，先在低溫處理再移至 25℃，第 5 天變色比例達 96% 或 100%；全程在 25℃則為 0%。結果支持低溫處理後轉至 25℃會加快後續變色，答案 D。",
    solutionSteps: ["比較實驗二各組在第 5 天的結果，而非只看前 3 天。", "低溫處理後轉至 25℃的兩組，變色比例都大幅上升。", "因此選 D；全程 25℃組沒有變色，不能說它最快。"],
    teacherTip: "實驗比較要讀清楚處理順序與觀察時間，不能把不同階段混為同一溫度條件。",
    questionImages: [pages(13)], requiresContext: true, requiresImage: true,
  },
  {
    id: "OFF-1082",
    question: "僅根據實驗三的結果，推測使蒜頭變綠色的有利環境，最可能是下列何者？",
    options: ["酸性越弱的環境", "酸性越強的環境", "有 –COOH 原子團的環境", "沒有 –COOH 原子團的環境"],
    answer: 2,
    explanation: "實驗三控制各水溶液 pH 為 3。醋酸組變色 100%、乳酸組 70%，鹽酸與硫酸組皆為 0%；含 –COOH 原子團的兩組有變色，支持此條件下含有該原子團較有利，答案 C「有 –COOH 原子團的環境」。這是該實驗條件下的推論，不代表所有羧酸環境皆必然如此。",
    solutionSteps: ["先確認實驗三將各水溶液 pH 控制為 3，重點是比較溶質特徵。", "醋酸、乳酸含 –COOH 且有變色；鹽酸與硫酸不含此基團，變色比例皆為 0%。", "由這組比較選 C；不能把結果簡化成酸性強弱造成差異。"],
    teacherTip: "讀實驗題要先找控制變因；結論只能限於題目實際測試的條件。",
    questionImages: [pages(13)], requiresContext: true, requiresImage: true,
  },
  {
    id: "OFF-1083",
    question: "僅根據小芷檢測的初步結果，下列推論何者最合理？",
    options: ["出血時間過短，須進一步檢查", "出血時間於容許範圍內，可能無異常", "出血時間於容許範圍內，但可能罹患 X 減少症或其他凝血因子異常", "出血時間過長，可能罹患 X 減少症或其他凝血因子異常"],
    answer: 3,
    explanation: "圖示以濾紙接觸傷口的血點大小表示出血量，血點持續到超過 5 分鐘才停止。表中超過 5 分鐘屬過長，可能與血小板減少或其他凝血因子異常有關；答案 D。題目明確註明仍需其他檢查才能確認診斷。",
    solutionSteps: ["依每 30 秒一次的濾紙紀錄，判讀出血停止所需時間。", "結果落在表列的「超過 5 分鐘」區間，分類為過長。", "因此選 D；這只是初步篩檢，不能單憑此結果確診。"],
    teacherTip: "醫療檢測題要區分篩檢與診斷；題幹提示的限制也屬答案判讀的一部分。",
    questionImages: [pages(14)], requiresContext: true, requiresImage: true,
  },
  {
    id: "OFF-1084",
    question: "表中的 X 最可能為下列何者？",
    options: ["淋巴", "白血球", "紅血球", "血小板"],
    answer: 3,
    explanation: "表格指出 X 減少可能造成出血時間過長；血小板會參與凝血與止血，因此 X 最可能是血小板，答案 D。",
    solutionSteps: ["先找出表格中 X 減少與出血時間過長的關聯。", "血小板能聚集並參與形成血塊，是止血的重要成分。", "因此 X 為血小板，選 D；紅血球主要負責運送氣體。"],
    teacherTip: "用題幹中的生理功能線索配對細胞，不要只憑名稱熟悉度作答。",
    questionImages: [pages(14)], requiresContext: false, requiresImage: true,
  },
  {
    id: "OFF-1085",
    question: "阿哲在做砝碼質量為 200 g 的實驗時，他施一個鉛直向上的定力將彈簧秤以穩定且緩慢的速度向上移動 10 cm，並使砝碼上升 5 cm，此過程彈簧秤拉力所作的功為多少 gw·cm？",
    options: ["1000", "1500", "2000", "3000"],
    answer: 1,
    explanation: "由圖（二十九）讀出砝碼質量 200 g 時，彈簧秤拉力 F 為 150 gw。彈簧秤移動 10 cm，拉力作功為 F×施力點移動距離＝150×10＝1500 gw·cm；答案 B。計算作功要用彈簧秤的位移，不是砝碼的 5 cm。",
    solutionSteps: ["在 F–M 圖上讀取 M＝200 g 時的拉力：F＝150 gw。", "彈簧秤（施力點）上升 10 cm，故作功為 150×10。", "得到 1500 gw·cm，選 B；5 cm 是砝碼位移，不是施力點位移。"],
    teacherTip: "功＝力×力的作用點沿力方向的位移；滑輪系統中兩者位移常不同。",
    questionImages: [pages(14), pages(15)], requiresContext: true, requiresImage: true,
  },
  {
    id: "OFF-1086",
    question: "阿哲經多次重複同樣的實驗所得結果均與圖（二十九）相同，而圖中的三點連線之延長線與縱軸 F 交點不是原點。若不考慮摩擦力，則關於交點不是原點的原因，下列敘述何者最合理？",
    options: ["此實驗的誤差很大", "此實驗裝置是屬於費力的簡單機械", "阿哲所記錄彈簧秤讀數 F，其數值同時受到彈簧秤質量及砝碼質量的影響", "阿哲所記錄彈簧秤讀數 F，其數值同時受到動滑輪質量及砝碼質量的影響"],
    answer: 3,
    explanation: "理想動滑輪需由兩段繩子分擔砝碼與動滑輪的總重量。即使砝碼質量趨近 0，動滑輪本身仍有重量，因此 F 軸截距不為 0；答案 D。",
    solutionSteps: ["將圖線延伸至 M＝0，截距仍大於零，表示仍有額外重量需要支撐。", "此裝置中被提升的動滑輪也有質量，其重量由兩段繩子分擔。", "所以彈簧秤讀數包含動滑輪與砝碼的影響，選 D。"],
    teacherTip: "圖表截距可反映未被橫軸變數表示的固定量；先檢查裝置本身是否有重量。",
    questionImages: [pages(14), pages(15)], requiresContext: true, requiresImage: true,
  },
  {
    id: "OFF-1087",
    question: "考量月球在甲、乙兩處的月相，下列俯視圖何者最可能是阿哲進行模擬時，球於兩處的亮暗面分布狀態？",
    options: ["A", "B", "C", "D"],
    answer: 2,
    explanation: "球塗黑的一半代表未受陽光照射，未塗黑的一半代表受光面。模擬上弦月、下弦月時，甲、乙兩處的受光面都須朝向同一太陽方向；符合圖示的是 C。答案 C。",
    solutionSteps: ["先記住月球受光半球始終朝向太陽，不會因月相而改變受光方向。", "甲到乙的路徑跨過半圈，兩位置從地球觀察分別對應上弦月與下弦月。", "依此檢查圖中的亮暗面方向與月地相對位置，符合者是 C。"],
    teacherTip: "分辨月球受光的半球與地球上看到的月相；月相是觀察到的亮面比例，不是月球本身改變受光。",
    questionImages: [pages(15)], requiresContext: true, requiresImage: true, optionsInImage: true,
  },
  {
    id: "OFF-1088",
    question: "根據圖（三十一）模擬的月球移動路徑，當月球由甲處移動至乙處的這段時間，地球自轉或繞太陽公轉大約轉了幾圈？",
    options: ["地球大約自轉半圈", "地球大約自轉 15 圈", "地球繞太陽大約公轉半圈", "地球繞太陽大約公轉 15 圈"],
    answer: 1,
    explanation: "甲為上弦月、乙為下弦月，月球移動約半個朔望月，約需 15 天。地球每天自轉約一圈，15 天約自轉 15 圈；地球繞日公轉在這段時間遠不到半圈，答案 B。",
    solutionSteps: ["上弦月到下弦月約相隔半個朔望月，約 15 天。", "地球約 24 小時自轉一圈，因此 15 天約自轉 15 圈。", "選 B；同一時間地球繞日只前進一小段，不會公轉半圈或 15 圈。"],
    teacherTip: "先估算月相所需天數，再用地球自轉週期換算圈數，注意區分自轉與公轉。",
    questionImages: [pages(15)], requiresContext: true, requiresImage: true,
  },
];

for (const repair of repairs) {
  const row = rows.find(item => item.id === repair.id);
  if (!row) throw new Error(`Missing ${repair.id}`);
  Object.assign(row, repair);
  const answerLetter = String.fromCharCode(65 + row.answer);
  if (row.options.length !== 4 || new Set(row.options).size !== 4 || row.solutionSteps.length !== 3 || (!row.explanation.includes(row.options[row.answer]) && !row.explanation.includes(`答案 ${answerLetter}`))) throw new Error(`Invalid repair ${repair.id}`);
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
