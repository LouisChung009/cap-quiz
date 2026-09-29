import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const questions = JSON.parse(readFileSync(join(root, "data/english.json"), "utf8"));

function distractorReason(question, options, correctIndex, wrongIndex, answer) {
  const wrong = options[wrongIndex];
  const point = question.knowledgePoint;
  const q = question.question;

  if (point === "現在簡單式") {
    if (wrong === "went") return `「${wrong}」是過去式，與 every Monday 所表達的固定習慣不合。`;
    if (wrong === "going") return `「${wrong}」是 V-ing，前面沒有 be 動詞，不能單獨作本句謂語。`;
    return `「${wrong}」沒有配合單數主詞 ${q.match(/Practice \d+-\d+: (\w+)/)?.[1] || "主詞"} 作現在簡單式第三人稱單數變化。`;
  }
  if (point === "過去進行式") {
    if (wrong === "eats") return `「${wrong}」是現在簡單式，不能表達電話在過去響起時正在進行的動作。`;
    if (wrong === "is eating") return `「${wrong}」是現在進行式；when the phone rang 和題目中的時間線都在過去。`;
    return `「${wrong}」是現在完成式，表示到現在的完成或經驗，不能呈現電話響起當時正在吃晚餐。`;
  }
  if (point === "介系詞") {
    if (wrong === "in") return `「${wrong}」通常接月份、年份或較長期間，不接題幹的明確時刻 ${q.match(/\d{1,2}:\d{2} p\.m\./)?.[0] || "時刻"}。`;
    if (wrong === "on") return "「on」通常接日期或星期，不接題幹中的鐘點。";
    return "「from」表示起點，後面通常要接終點或搭配 to，不能單獨標示開始的鐘點。";
  }
  if (point === "比較級") {
    if (wrong === "short") return "「short」是原級；than 要求比較兩者時使用比較級。";
    if (wrong === "shortest") return "「shortest」是最高級，題幹只比較 this route 與 the old one 兩者。";
    return "「more short」不符合單音節形容詞 short 的比較級構詞；應加 -er。";
  }
  if (point === "條件句") {
    if (wrong === "will rain") return "第一類條件句的 if 子句用現在簡單式，不在 if 子句中放 will。";
    if (wrong === "rained") return "「rained」是過去式，與 tomorrow 及主句 will stay 所表達的未來可能條件不合。";
    return "「raining」是分詞，缺少 be 動詞，不能獨立作 if 子句的謂語。";
  }
  if (point === "被動語態") {
    if (wrong === "made") return "主詞 the cake 是被製作的承受者；單用 made 缺少被動所需的 be 動詞。";
    if (wrong === "is made") return "「is made」是現在式被動，與 yesterday 的過去時間線索衝突。";
    return "「makes」是主動現在式，既未表達 cake 承受動作，也不符合 yesterday。";
  }
  if (point === "近義字") return `此題援引的 report 未隨題目提供，無法核對 rapid 在該文中的語境；「${wrong}」看起來不像 rapid 的常見近義字，但不足以代替缺失材料，故標記 UNRESOLVED。`;
  if (point === "推論") {
    if (wrong === "Strong sunshine") return `題幹的 dark and cloudy 與帶傘線索不支持「${wrong}」。`;
    if (wrong === "Snow") return `題幹只提供陰暗多雲和帶傘，沒有任何下雪線索，因此不能選「${wrong}」。`;
    return `帶傘且天空 dark and cloudy 指向可能下雨，不支持「${wrong}」所說的晴朗乾燥天氣。`;
  }
  if (point === "時間判讀") {
    if (wrong.includes("open all night")) return `題幹只說 ${q.match(/(?:School|The \w+) closes at [\d:]+ p\.m\./)?.[0] || "場所已在指定時間關閉"}；沒有證據說它整晚營業。`;
    if (wrong.includes("was early")) return "arrived ten minutes later 表示抵達時間晚於關門時間，不是提早。";
    return "題幹只交代抵達晚於原定關門時間，沒有說場所因此延後關門。";
  }
  if (point === "語意轉折") {
    if (wrong === "because") return "because 會把疲累說成完成作業的原因，與 still 所標示的反預期關係不合。";
    if (wrong === "if") return "if 會形成條件句，但句中是在陳述疲累後仍完成作業的事實。";
    return "so 表示因果結果；still finished 與 was tired 形成讓步／轉折，不是疲累造成完成作業。";
  }
  return `「${wrong}」無法依題幹條件取代正解「${answer}」。`;
}

function answerReason(question, answer) {
  const n = Number(question.id.slice(4));
  const q = question.question;
  const person = q.match(/Practice \d+-\d+: (\w+)/)?.[1];
  const place = q.match(/to ((?:the )?[\w ]+?) every Monday/)?.[1];
  const clock = q.match(/\d{1,2}:\d{2} p\.m\./)?.[0];
  const subject = q.match(/If it .*?, (\w+) will stay home/)?.[1];
  const table = q.match(/table (\d+)/)?.[1];
  const trip = q.match(/after trip (\d+)/)?.[1];
  const location = q.match(/to (school|the library|the park|the station|the museum)/)?.[1];
  const closing = q.match(/(School|The \w+) closes at ([\d:]+ p\.m\.)/)?.slice(1);
  const arrived = q.match(/(\w+) arrived ten minutes later/)?.[1];

  switch (question.knowledgePoint) {
    case "現在簡單式":
      return `題幹中的「${person} ___ to ${place} every Monday」表示 ${person} 每週一固定前往該地；every Monday 是習慣線索，單數主詞的現在簡單式用 goes，故選「${answer}」。`;
    case "過去進行式":
      return `題幹說電話在 ${q.match(/at (\d{1,2}:00)/)?.[1]} rang，這是過去某時點；主詞 ${person} 當時正在吃晚餐，需用 was + V-ing「${answer}」。`;
    case "介系詞":
      return `題幹的開始時間是明確鐘點 ${clock}；英文以 at 標示特定時刻，因此填「${answer}」。`;
    case "比較級":
      return `句中用 than 比較 this route 和 the old one，short 的比較級是 shorter，因此填「${answer}」。`;
    case "條件句":
      return `if 子句談明天可能下雨，主句 ${subject} will stay home 是第一類條件句；if 子句用現在式 rains，所以填「${answer}」。`;
    case "被動語態":
      return `主詞是桌號 ${table} 的蛋糕，題幹以 by ${q.match(/by (\w+)/)?.[1]} 指明製作者；cake 承受製作動作，且 yesterday 要求過去式，被動形式為 was made，故選「${answer}」。`;
    case "近義字":
      return `UNRESOLVED：題幹要求依 report ${n - 600} 判斷 rapid 的語境近義字，但該 report 未提供。雖然選項「${answer}」是 rapid 的常見近義字，仍無法核實其在指定文本中的語意或搭配。`;
    case "推論":
      return `${person} 因天空 dark and cloudy 而帶傘，這兩項線索共同支持預期下雨；四個選項中「${answer}」符合。`;
    case "時間判讀":
      return `題幹指出「${closing?.[0]} closes at ${closing?.[1]}」，${arrived} ten minutes later 才抵達；因此最合理的是「${answer}」。`;
    case "語意轉折":
      return `${person} 在 trip ${trip} 後很累，卻仍完成作業；tired 與 still finished 構成反預期轉折，應用「${answer}」。`;
    default:
      return `UNRESOLVED：無法辨識題型「${question.knowledgePoint}」，需人工判讀。`;
  }
}

function teacherTip(question) {
  const q = question.question;
  switch (question.knowledgePoint) {
    case "現在簡單式": {
      const person = q.match(/Practice \d+-\d+: (\w+)/)?.[1];
      const destination = q.match(/to ((?:the )?[\w ]+?) every Monday/)?.[1];
      return `本題原文「${person} ___ to ${destination} every Monday」指出固定習慣；先辨認單數主詞，再確認現在簡單式是否使用 goes。`;
    }
    case "過去進行式": {
      const time = q.match(/when the phone rang at ([\d:]+)/)?.[1];
      return `本題以電話在 ${time} rang 作為過去時間點；檢查另一個動作是否在那一刻持續進行，再用 was/were + V-ing。`;
    }
    case "介系詞": {
      const time = q.match(/starts ___ ([\d:]+ p\.m\.)/)?.[1];
      return `本題空格後是明確鐘點 ${time}；鐘點前用 at，日期或星期才用 on，月份或年份用 in。`;
    }
    case "比較級":
      return "本題比較 route 與 the old one；看到 than，先確認需比較級，再依 short 這類短形容詞加 -er。";
    case "條件句":
      return "本題主句有 will stay home；第一類條件句的 if 子句用現在式，不能因 tomorrow 就在 if 子句加 will。";
    case "被動語態": {
      const table = q.match(/table (\d+)/)?.[1];
      const maker = q.match(/by (\w+)/)?.[1];
      return `本題的受詞位置主詞是 table ${table} 的 cake，並以 by ${maker} 指出製作者；cake 承受製作動作且有 yesterday，故用過去被動 was made。`;
    }
    case "近義字":
      return `UNRESOLVED：題目要求回到 report ${Number(question.id.slice(4)) - 600} 判斷 rapid，但材料缺失；先補上該 report，再確認語境義與 quick 的可替換性。`;
    case "推論": {
      const person = q.match(/: (\w+) brought an umbrella/)?.[1];
      const where = q.match(/umbrella to ((?:the )?(?:school|library|park|station|museum))/)?.[1];
      return `本題原文指出「${person} brought an umbrella to ${where}」且天空 dark and cloudy；把帶傘與陰雲兩條線索連起來推論預期天氣，不加入題外原因。`;
    }
    case "時間判讀": {
      const close = q.match(/(School|The \w+) closes at ([\d:]+ p\.m\.)/)?.slice(1);
      const person = q.match(/(\w+) arrived ten minutes later/)?.[1];
      return `本題原文「${close?.[0]} closes at ${close?.[1]}」並說 ${person} arrived ten minutes later；先排時間先後，再選能由此推出的敘述。`;
    }
    case "語意轉折": {
      const person = q.match(/: (\w+) was tired/)?.[1];
      const trip = q.match(/after trip (\d+)/)?.[1];
      return `本題 ${person} 在 trip ${trip} 後雖疲累，仍完成作業；still 是轉折線索，與 because、so 的因果方向不同。`;
    }
    default:
      return "UNRESOLVED：需教師依本題完整語境補充提示。";
  }
}

function unresolvedRecord(question) {
  return {
    id: question.id,
    explanation: answerReason(question, question.options[question.answer]),
    solutionSteps: [
      `題幹原文「${question.question}」引用 report ${Number(question.id.slice(4)) - 600}，但該 report 未附於資料；因此無法確認 rapid 在文中的用法，標記 UNRESOLVED。`,
      `現有選項為 A「${question.options[0]}」、B「${question.options[1]}」、C「${question.options[2]}」、D「${question.options[3]}」；標記答案的 ${["A", "B", "C", "D"][question.answer]}「${question.options[question.answer]}」只是一般字義上最接近，尚不足以證明符合指定 report 的語境。`,
      "人工覆核：補上被引用的 report 原文並重新判定答案；在材料補齊前，不應把一般同義字猜測當作已核實解析。",
    ],
    teacherTip: teacherTip(question),
  };
}

function resolvedRecord(question) {
  const answer = question.options[question.answer];
  const wrongIndices = question.options.map((_, index) => index).filter((index) => index !== question.answer);
  const wrongIndex = wrongIndices[0];
  const wrong = question.options[wrongIndex];
  const answerDetail = answerReason(question, answer);
  const wrongDetail = distractorReason(question, question.options, question.answer, wrongIndex, answer);
  const letters = ["A", "B", "C", "D"];
  return {
    id: question.id,
    explanation: `${answerDetail} ${letters[wrongIndex]}「${wrong}」不合之處：${wrongDetail}`,
    solutionSteps: [
      `回到題幹核對具體線索：「${question.question}」`,
      `答案為 ${letters[question.answer]}「${answer}」。${answerDetail}`,
      `檢查干擾選項 ${letters[wrongIndex]}「${wrong}」：${wrongDetail}`,
    ],
    teacherTip: teacherTip(question),
  };
}

const output = questions.map((question) =>
  question.knowledgePoint === "近義字" ? unresolvedRecord(question) : resolvedRecord(question)
);

writeFileSync(join(root, "reports/英文-base-explanations.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ total: output.length, unresolved: output.filter((item) => item.solutionSteps.some((step) => step.includes("UNRESOLVED"))).length }));
