import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const repairs = {
  "OFF-0703": ["答案是 A「an envelope」。圖中門下有一個信封；植物在門旁，告示牌掛在門上，雨傘放在傘架中，都不符合 under the door。單數可數名詞 envelope 以母音音素開頭，因此用 an。", ["先看 under the door 指門下方的位置，圖中該處是扁平的信封。", "envelope 是單數可數名詞，且開頭母音音素用 an。", "選 A；不要把門旁、門上或傘架裡的物件誤認為門下物品。"], "an 用在母音音素前；a sign 雖有字母 i，但發音以子音音素 /s/ 開頭。", ["envelope（信封）", "under（在……下方）", "sign（標誌／告示）", "umbrella（雨傘）"]],
  "OFF-0704": ["答案是 C「neck」。不能轉頭最直接牽涉頸部疼痛。arm 是手臂、knee 是膝蓋、stomach 是胃／腹部，都不會直接限制轉頭。句中 head 是頭，常見搭配是 neck hurts（脖子痛）。", ["把症狀 cannot turn my head 與身體部位配對。", "轉動頭部需要頸部活動，因此 neck 最合邏輯。", "選 C；疼痛部位不能只按身體部位詞彙猜，要看後面的症狀線索。"], "hurt 可指疼痛；stomachache 是胃痛，不能和 turn my head 的症狀混淆。", ["neck（脖子）", "turn one’s head（轉頭）", "arm（手臂）", "stomach（胃／腹部）"]],
  "OFF-0705": ["答案是 B「proud of」。球隊贏得全國賽，說話者因此為球隊感到驕傲；固定搭配是 be proud of someone。popular with 是受……歡迎，sorry for 是同情／為……感到抱歉，worried about 是擔心，均不合勝利後的正面情緒。", ["先用 won the national game 判斷情境是正向的成就。", "英文以 be proud of + 人/事 表示為其感到驕傲。", "選 B；別把 proud of（為……驕傲）和 popular with（受……歡迎）混為一談。"], "be proud of 是固定介系詞搭配；不要說 proud for them。", ["proud（驕傲的）", "popular（受歡迎的）", "sorry（抱歉／同情）", "worried（擔心的）"]],
  "OFF-0706": ["答案是 B「leave」。Tomorrow is Sam’s last day in the office 表示明天是他最後一天在辦公室，後句自然是他決定離開（工作／公司）。hide 是躲藏、pack 是打包、walk 是走路，皆不能自然表達離職；離開工作常用 decide to leave。", ["用 last day in the office 推斷 Sam 即將結束在此處的工作。", "decide to 後接原形動詞；leave 可表示離開職位或公司。", "選 B；pack 需要受詞或行李等語境，不能取代 leave 的離職意思。"], "leave 可表示離開某地或離職；pack 是收拾／打包，不等於辭職。", ["leave（離開／離職）", "decide to（決定做）", "hide（躲藏）", "pack（打包）"]],
  "OFF-0707": ["答案是 D「weather」。颱風期間不適合爬山，應等颱風離開，語境明確談的是惡劣天氣，搭配 bad weather。chance 是機會、dream 是夢、habit 是習慣，都不能自然接在 mountain climbing in this bad 後。", ["從 typhoon 和 wait until it goes away 判斷空格指環境狀況。", "bad weather 是「天氣惡劣」的固定搭配。", "選 D；chance、dream、habit 的語意都與颱風和登山安全不合。"], "weather 是不可數名詞；此處不加 a。", ["weather（天氣）", "typhoon（颱風）", "mountain climbing（登山）", "chance（機會）"]],
  "OFF-0708": ["答案是 D「it」。Anna hates it 指她討厭在下雪天散步這件事；it 可代替前句整個活動。them 需指複數名詞，so 不能作 hate 的受詞，one 通常代替一個可數名詞，不能自然代替「散步」這個活動。", ["確認 hate 後需要受詞，並找出代名詞要代替的內容。", "it 指 walking with Chris on snowy days 這件事。", "選 D；them 不合單數活動，one 也不能在此代替動名詞片語。"], "hate + 動名詞可說 hates walking；也可用 hates it 指前述整件事。", ["hate（討厭）", "walking（散步）", "it（代替前述事情）", "one（代替單數可數名詞）"]],
  "OFF-0709": ["答案是 B「do」。前句主要動詞是 likes，後句用 and so + 助動詞 + 主詞表「某人也一樣」；第三人稱單數 Lora likes 以 do-support 的 does 表示，空格前已有 so，句型完整應是 and so do I? 但主詞 I 對應第一人稱，助動詞用 do。am 對應 be 動詞，have/will 都不與 likes 的一般現在式一致。", ["辨識 and so + 助動詞 + 主詞 的附和句型。", "前句一般現在式動詞 like 用 do/does 代替；主詞是 I，所以用 do。", "選 B；不能因前句主詞 Lora 是第三人稱，就把後句 I 的助動詞也用 does。"], "附和句的助動詞跟隨被附和句的動詞類型，但人稱要看後面的主詞 I。", ["and so do I（我也一樣）", "auxiliary verb（助動詞）", "like（喜歡）", "主詞一致"]],
  "OFF-0710": ["答案是 D「still」。句意是冰箱現在不該再有巨大噪音，但如果它仍然有噪音就打電話；still 表示某狀況持續存在。already 是已經，even 是甚至，finally 是終於，都不符合「修過後噪音仍未消失」的條件句。", ["注意 but 引出與預期相反的情況：若噪音還持續，請再聯絡。", "still + 動詞表示狀況仍然存在，still does 是「仍然會如此」。", "選 D；already 強調已發生，finally 強調終於發生，語意不符。"], "still 通常放在一般動詞前；此處修飾 does，表示問題持續。", ["still（仍然）", "already（已經）", "finally（終於）", "give someone a call（打電話給某人）"]],
  "OFF-0711": ["答案是 C「lucky」。Jay 玩牌贏錢後決定再試一次，他覺得自己可能第二次也會走運，因此 be lucky a second time 符合上下文。famous 是出名、interested 是感興趣、ready 是準備好，都不是贏錢後再賭一局的合理期待。", ["找出 felt that he might also be... 與前一句 winning money 的關係。", "他期待再次贏得好結果，也就是可能再次幸運。", "選 C；be lucky 是固定自然搭配，其他形容詞無法表達「再中一次」。"], "lucky 是形容詞，常用 be lucky 表示走運；不要誤用副詞 luckily 填在 be 後。", ["lucky（幸運的）", "win（贏得）", "a second time（第二次）", "ready（準備好的）"]],
  "OFF-0712": ["答案是 D「sharp」。刀切不動東西，表示刀刃不如以前鋒利，sharp 描述刀刃；bright 是明亮、heavy 是重、quick 是快，都不能表示刀的切割能力。句型 not as + 形容詞 + as 表示「不如……」。", ["用 doesn’t cut very well 推論刀刃狀態，而不是重量或速度。", "刀刃鋒利是 sharp；not as sharp as before 即不如以前鋒利。", "選 D；bright 常形容光線，quick 常形容速度，均不適合刀刃。"], "比較句型為 not as + 原級形容詞 + as；此處不能用比較級 sharper。", ["sharp（鋒利的）", "cut（切）", "not as...as（不如……）", "bright（明亮的）"]]
};

for (const [id, [explanation, solutionSteps, teacherTip, relatedWords]] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題") throw new Error(`Missing official question ${id}`);
  Object.assign(row, { explanation, solutionSteps, teacherTip, relatedWords });
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official English explanations.`);
