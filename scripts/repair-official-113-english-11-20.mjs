import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const repairs = {
  "OFF-0713": ["答案是 C「finds」。until 引導未來時間副詞子句時，通常用現在簡單式表示未來，因此說 John will stay... until he finds an apartment。主詞 he 是第三人稱單數，find 加 s。A 把 will 放進時間子句，B 是假設語氣，D 過去式，都不合此句型。", ["主句有 will，代表未來計畫；辨認 until 子句是時間副詞子句。", "未來時間子句用現在簡單式，不用 will；he 的動詞加 s。", "選 C finds。",], "時間連接詞 when/until/before/after 引導未來子句時，常以現在式代替 will。", ["until（直到）", "apartment（公寓）", "time clause（時間副詞子句）"]],
  "OFF-0714": ["答案是 A「who want」。who 引導關係子句，修飾前面的 Students；整句是「想參加校外教學的學生應先問父母」。關係子句中 who 作主詞，所以後面直接接動詞 want。B 缺少連接詞，C 多了重複主詞 they，D 的 what 不能用來限定前面的先行詞 Students。", ["找出被修飾的名詞 Students，判斷空格後是否需補充「哪些學生」。", "who want to go... 是關係子句，who 代表 students 並作 want 的主詞。", "選 A；不能在關係代名詞後再重複放 they。"], "關係代名詞 who 作子句主詞時，不再另加人稱主詞。", ["student（學生）", "relative clause（關係子句）", "go on a trip（參加旅行）"]],
  "OFF-0715": ["答案是 A「above」。at a height of 3,000m above sea level 是「海拔 3,000 公尺」的固定表達。below sea level 表示低於海平面；at、in 都不能和這個高度片語組成相同意思。", ["辨識句子在描述寺廟相對於海平面的高度。", "高於海平面用 above sea level。", "選 A；below sea level 是海平面以下，方向相反。"], "高度常寫 3,000 meters above sea level，縮寫為 3,000 m above sea level。", ["height（高度）", "above sea level（海拔）", "below（在……之下）"]],
  "OFF-0716": ["答案是 A「but」。Patty 花了好幾天計畫邀請 Charlie 共進晚餐，見面時卻一句話也說不出來，前後形成預期落差，應用 but 表轉折。so 表結果會暗示「因為計畫邀請，所以說不出話」，因果不合理；if 是條件，or 是選擇，也不合句意。", ["比較計畫和實際見面時的結果：原本打算邀請，最後卻沉默。", "兩分句是反差，因此用 but。", "選 A；so 連結果、if 連條件、or 連選擇，皆不符。"], "but 表轉折；不要只依逗號選 so，須確認前後因果真的成立。", ["plan to（計畫）", "invite（邀請）", "but（但是／然而）"]],
  "OFF-0717": ["答案是 C「haven’t seen」。說話者尚未看過電影，因此現在不能評論；本週六才可能去看。現在完成式 have not seen 表示截至現在尚未發生、且結果影響現在。A 現在進行式不合「未看過」；B 現在簡單式表示習慣；D won’t see 則是將來不看，和週六可能觀看矛盾。", ["用 because 找出無法評論電影的原因：尚未觀看。", "從過去到現在都未發生的經驗，用現在完成式 haven’t seen。", "選 C；I’ll probably watch it this Saturday 是未來計畫，不代表拒絕觀看。"], "現在完成式 have/has + p.p. 可表示至今尚未完成的經驗；see 的過去分詞是 seen。", ["present perfect（現在完成式）", "review / opinion（評論／看法）", "probably（可能）"]],
  "OFF-0718": ["答案是 D「robot」。新員工說話沒有高低起伏，聽不出情緒，像機器人一樣平板。father、foreigner、radio 都不能準確表達這種缺乏人類情緒變化的語氣。answers calls like a robot 是比喻用法。", ["看後一句對聲音的解釋：沒有高低變化，也聽不出喜怒。", "這種機械、平板的語氣像 robot。", "選 D；不是在說電話設備或某類人的口音。"], "like + 名詞可表示「像……一樣」；此處不是動詞 like「喜歡」。", ["robot（機器人）", "voice（聲音／嗓音）", "ups and downs（起伏）"]],
  "OFF-0719": ["答案是 C「miss」。Jasmine 原本打算在鄉間度過夏天，但到了那裡後開始想念城市的喧鬧。miss 在此表示懷念／想念；enjoy 是享受、mind 是介意、notice 是注意到，都不表達離開熟悉環境後的思念。", ["but 表示前後想法轉折：原計畫待在鄉間，到了之後卻……。", "她想念的是熟悉的城市聲音，所以用 miss。", "選 C；miss 還可表示錯過，須依受詞和上下文判斷。"], "miss + 人／事物可表示想念；miss the bus 則是錯過公車。", ["miss（想念／錯過）", "country（鄉間）", "noise（噪音／聲響）"]],
  "OFF-0720": ["答案是 D「worst」。老闆知道走路上班只要五分鐘，卻用交通壅塞當遲到藉口，顯然是很差、站不住腳的藉口；在四個最高級形容詞中 worst 最合適。easiest、oldest、smartest 都不符合「不合理藉口」的負面評價。", ["掌握 when 引導的原因：老闆知道步行只需五分鐘。", "因此 bad traffic 是糟糕、最不可信的藉口。", "選 D worst，是 bad 的最高級。"], "bad 的比較級是 worse，最高級是 worst；此處有 the，使用最高級。", ["excuse（藉口）", "traffic（交通／車流）", "worst（最差的）"]],
  "OFF-0721": ["答案是 A「is shared」。主詞 housework 是不可數名詞，視為單數；家務「被分配」給夫妻和孩子，因此用單數被動式 is shared。B are shared 把不可數名詞當複數；C、D 是主動語態，會變成家務自己去分享別人，主被動方向不合。", ["先找真正主詞 housework，而非離它較近的 kids。", "housework 不可數，搭配 is；工作由家人分擔，需用被動語態 be + p.p.。", "選 A is shared。"], "housework 是不可數名詞，通常用單數動詞；被動式要有 be 動詞加過去分詞。", ["housework（家務）", "share（分擔）", "passive voice（被動語態）"]],
  "OFF-0722": ["答案是 C「mine」。mine 是名詞性所有格，等於 my dentist，作 pulled out 的主詞：因為我的牙醫上次拔錯了一顆好牙。I 是主格但缺少後面的名詞來組成 my dentist；me 是受格，不能作此句主詞；myself 是反身代名詞，沒有可回指的主詞。", ["空格位於 because 子句主詞位置，意義是「我的牙醫」。", "mine 可獨立使用並代替 my + 名詞，即 mine = my dentist。", "選 C；my dentist 也可改寫此句，不能用受格 me。"], "my 是限定詞，後面必須接名詞；mine 可單獨代替「我的＋名詞」。", ["mine（我的；名詞性所有格）", "dentist（牙醫）", "pull out（拔除）"]]
};

for (const [id, [explanation, solutionSteps, teacherTip, relatedWords]] of Object.entries(repairs)) {
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題") throw new Error(`Missing official question ${id}`);
  Object.assign(row, { explanation, solutionSteps, teacherTip, relatedWords });
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Repaired ${Object.keys(repairs).length} official English explanations.`);
