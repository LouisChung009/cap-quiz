import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questionsData = JSON.parse(await readFile(path, "utf8"));
const alpha = "電影大師希區考克說：「製作一部偉大的電影需要三樣東西：劇本、劇本、劇本。」由此可見劇本對電影的重要性。在劇本中，對白固然重要，但劇本必須深植於令人感覺真實的世界裡，才能有生命，也才能攫住觀眾。而視覺化寫作，就能創造出這個世界。\n\n劇本中的視覺化書寫是指在劇本中，除了對白之外的所有部分，亦即視覺描寫。任何能夠讓讀者或觀眾腦中浮現出圖像的描寫方式，就是視覺化寫作。視覺化寫作的要素有以下四種：\n一、場景外觀：劇中的地點看起來如何？須具體寫出地點的獨特之處，別只是說房間裡有燈和水桶，而要說出這個廚房的特色。\n二、場景事件：場景中發生什麼事？火車呼嘯而過？小鳥飛過窗邊？角色周邊有什麼正在發生？\n三、角色外貌：劇中角色看起來是整潔體面還是不修邊幅？雙眼有神還是疲憊？他們穿的是制服或便服？劇本作者選擇的視覺細節會透露角色的性格及當下的狀態。\n四、角色行動：角色如何行動？當這個角色聽見別人對他說「我愛你」，他是低頭沈默或歡喜地跳起來？角色的肢體動作可以反映出他們的心理。\n──改寫自《視覺化寫作：4個電影劇本範例》";
const beta = "室內，安德魯的練習室。安德魯正在陰暗狹小的練習室裡，試著打出雙跳。在他左前方銀灰色譜架上的電子節拍器，正閃爍，紅色的電子數字顯示目前速度設定在380。\n\n安德魯停了下，重新設定為390。又繼續打擊，試著跟上。再將節拍器調到400。現在完全跟不上。全力以赴、汗流浹背、雙手起泡，這時——喀啦。安德魯的右鼓棒斷成兩半。\n\n他停下來，疲憊地看著自己的手，半身汗濕，雙手發痛。回頭看節拍器仍在響。他喘著氣，將它關上。抬頭看海報中的人物——巴迪．瑞奇俯在鼓上。\n──改寫自電影劇本《進擊的鼓手》";
const underlinedBeta = beta
  .replace("安德魯的練習室", "【畫線處：安德魯的練習室】")
  .replace("在他左前方銀灰色譜架上的電子節拍器正閃爍，紅色的電子數字顯示目前速度設定在380", "【畫線處：在他左前方銀灰色譜架上的電子節拍器正閃爍，紅色的電子數字顯示目前速度設定在380】")
  .replace("全力以赴、汗流浹背、雙手起泡", "【畫線處：全力以赴、汗流浹背、雙手起泡】")
  .replace("喀啦", "【畫線處：喀啦】")
  .replace("巴迪．瑞奇俯在鼓上", "【畫線處：巴迪．瑞奇俯在鼓上】");
const shared = `【閱讀材料】\n甲文：\n${alpha}\n\n乙劇本：\n${beta}`;
const repairs = new Map([
  [29, { id: "OFF-0903", stem: "根據甲文，關於劇本的創作，下列敘述何者最恰當？" }],
  [30, { id: "OFF-0904", stem: "關於乙劇本的寫作分析，下列何者最恰當？" }],
  [31, { id: "OFF-0905", stem: `【閱讀材料】\n甲文：\n${alpha}\n\n乙劇本：\n【原題畫線處】\n${underlinedBeta}\n\n乙劇本畫線處的文句，最無法呼應甲文中哪一項視覺化寫作要素？` }]
]);
for (const [number, item] of repairs) {
  const question = questionsData.find(entry => entry.id === item.id);
  if (!question || question.source?.year !== 114 || question.source.questionNumber !== number || question.options?.length !== 4) throw new Error(`114國文第${number}題資料不符`);
  question.question = number === 31 ? item.stem : `${shared}\n\n${item.stem}`;
  question.questionImage = "";
  question.questionImages = [];
  question.imageAlt = "";
  question.requiresImage = false;
  question.requiresContext = false;
}
await writeFile(path, `${JSON.stringify(questionsData, null, 2)}\n`, "utf8");
console.log("Restored the complete shared screenplay material for 114 Chinese Q29–Q31.");
