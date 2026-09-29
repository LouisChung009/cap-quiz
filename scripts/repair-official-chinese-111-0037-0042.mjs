import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const caveText = `【閱讀材料】柏拉圖洞穴寓言
有個洞穴中有一群人，他們的身子被鍊著，無法轉向，只能面向洞穴的內壁。他們無法看見身旁每一個人，亦無法看見身後的洞口。洞穴裡唯一的光源是一堆營火。有一道遮蔽物擋在這群人與營火之間，遮蔽物後有人高舉著人類和動物雕像來來往往。那些被鍊著的人看不見雕像，只能在內壁看到遮蔽物後雕像的影子，且這些黑影配合洞穴裡的回音舞動。對那些被鍊著的人來說，這些影子是真實的事物。他們無事可做，只能談論這些影子。
如果被鍊著的人中有一人被釋放，得以起身走出洞穴。陽光會讓這個人感到極大的痛苦，因為他只習慣於黑暗。等他習慣了光線，看見遮蔽物後真正發生的事情，他就能發現真相，得到啟蒙。
當這個人再回到洞內，試著告訴其他人外界的真相，其他人卻很可能無法理解並認為這個人是瘋狂的。就算這個人將他們釋放，想拉他們走出洞穴，他們依然只願相信內壁上的影子才是真實，甚至可能將這個人殺死。`;

const coinsText = `【資料甲】漢文帝時，莢錢日益增多且較輕，於是改鑄四銖錢，錢上鑄有「半兩」字樣，百姓也可以自行鑄錢。吳王利用銅山鑄錢，富可敵國，後來因此叛逆；大夫鄧通也靠鑄錢富甲天下。吳、鄧兩家的錢流布各地，之後朝廷才開始禁止私鑄錢幣。\n【資料乙】漢文帝賜鄧通蜀地銅山，允許他鑄錢；鄧通錢的形制、文字、重量都與天子的四銖錢相同。吳王也有銅山並鑄造吳錢，吳錢略重，形制與文字則和天子錢相同。\n\n註：莢錢是西漢初年所鑄、形如榆莢的銅錢。`;

const peopleText = `【閱讀材料】
王起主持科舉，想讓白敏中當狀元，卻擔心他和賀拔惎是朋友。賀拔惎有文才但不得志。王起便暗中吩咐門人轉達心意，要白敏中和賀拔惎絕交。門人再約白敏中，把此事詳細告訴他；白敏中說：「都照你教的做。」
後來賀拔惎果然登門，左右的人謊稱白敏中不在，賀拔惎等了一會兒，沒說什麼便離開。過了一會兒，白敏中突然跑出來，連聲叫左右把賀拔惎追回，並把實情全告訴他，說：「一個科舉功名何愁得不到，怎能輕易辜負至交！」兩人於是相對歡飲。門人看見後大怒離去，並向王起報告，說事情恐怕不成。王起說：「我原本只得到白敏中，現在應當再取賀拔惎了。」
——改寫自《唐摭言》`;

const fixes = {
  "OFF-0269": {
    question: `${caveText}\n\n在這則寓言中，「這個走出洞穴後再回到洞內的人」最可能象徵下列哪一種人？`,
    explanation: "正確答案為 B「孤獨的先知」。走出洞穴的人看見真相後回去啟發眾人，卻不被理解，甚至可能遭到殺害，形同孤獨傳達真理的先知。",
    solutionSteps: ["先看這個人的經歷：他離開黑暗、看見洞外真相，因而得到啟蒙。", "回洞後，他試圖告訴其他人真相，卻被當成瘋子，甚至可能被殺。", "他象徵孤獨傳達真理、又不被群眾理解的人，選 B；不是受迫的奴隸、命運主宰或蒙昧愚者。"],
    teacherTip: "寓言人物象徵要根據整段遭遇推論，不只看他曾被囚禁。",
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0270": {
    question: `${caveText}\n\n根據這則寓言，下列何者最接近柏拉圖的想法？`,
    explanation: "正確答案為 A「多數人相信的事未必為真」。囚徒把牆上的影子當成真實；即使有人見過洞外真相，其他人仍可能拒絕相信。",
    solutionSteps: ["囚徒只能看到影子，卻把影子當成全部真實。", "走出洞穴的人見到真相後回來說明，其他人仍堅信影子才是真的。", "寓言提醒人們群體共同相信的事也可能只是表象，選 A；其餘選項不是故事重點。"],
    teacherTip: "哲理寓言題先找表象與真實的對照，再歸納作者要提醒的認知問題。",
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0271": {
    question: `${coinsText}\n\n根據甲、乙兩文推論，漢文帝時各種錢幣的重量依序最可能是下列何者？`,
    explanation: "正確答案為 D「吳錢 ＞ 鄧通錢 ＝ 四銖錢」。乙文明說吳錢略重於天子錢，而鄧通錢重量與四銖錢相同。",
    solutionSteps: ["資料乙指出鄧通錢與天子四銖錢重量相同。", "資料乙另說吳錢『微重』，即比天子四銖錢略重。", "合併兩項資訊，吳錢 ＞ 鄧通錢 ＝ 四銖錢，選 D。"],
    teacherTip: "跨文本比較先找同一比較基準；『同』與『微重』分別轉成等號和大於號。",
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0272": {
    question: `${coinsText}\n\n根據甲、乙兩文，下列敘述何者最恰當？`,
    explanation: "正確答案為 B。資料甲說四銖錢鑄有「半兩」字樣；資料乙說鄧通錢與四銖錢的文字相同，吳錢的文字也和天子錢相同，因此兩者都應有「半兩」字樣。",
    solutionSteps: ["先從資料甲確認天子四銖錢上的文字是『半兩』。", "鄧通錢的文字與天子四銖錢相同；吳錢的文字也與天子錢相同。", "因此鄧通錢與吳王所鑄的錢都應有『半兩』字樣，選 B；A、C、D 混淆鑄幣種類、人物或因果順序。"],
    teacherTip: "跨文本題把各篇共同的比較對象連起來，特別注意形制、文字、重量是不同屬性。",
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0273": {
    question: `${peopleText}\n\n根據本文，下列文句省略的主語，何者是白敏中？`,
    explanation: "正確答案為 C「悉以實告」。白敏中把王起要他與賀拔惎絕交的實情全數告訴賀拔惎。",
    solutionSteps: ["A『病其與賀拔惎為友』承接王起，指王起擔心兩人交好。", "B『乃密令門人申意』主語仍是王起，因他暗中吩咐門人。", "C『悉以實告』承接白敏中，他把實情告訴賀拔惎；D『大怒而去』則是門人，因此選 C。"],
    teacherTip: "文言文省略主語時，沿著前後動作與對話對象逐句追蹤，不要只看最近出現的人名。",
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0274": {
    question: `${peopleText}\n\n根據本文，王起說「我原只得白敏中，今當更取賀拔惎矣」的原因最可能是下列何者？`,
    explanation: "正確答案為 D。白敏中認為科舉功名尚可再得，卻不能辜負至交；他把友情看得重於狀元名位，讓王起看出賀拔惎是值得結交的人。",
    solutionSteps: ["王起一開始只打算取白敏中為狀元，甚至要求他和賀拔惎絕交。", "白敏中最後選擇追回賀拔惎並坦白，說功名可以再得，不能辜負朋友。", "王起因此認為白敏中如此看重賀拔惎，賀拔惎必有可取之處，於是也想取他，選 D。"],
    teacherTip: "人物動機題先看前後立場變化，再用人物親口說的話解釋轉折原因。",
    requiresImage: false,
    requiresContext: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  if (!question) throw new Error(`Missing question ${id}`);
  Object.assign(question, fix);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log(`Updated ${Object.keys(fixes).length} official Chinese questions (111, Q37–42).`);
