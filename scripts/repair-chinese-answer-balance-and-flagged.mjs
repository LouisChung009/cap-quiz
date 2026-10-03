import { readFile, writeFile } from "node:fs/promises";

const files = ["chinese", "english", "math", "science", "social"];
const banks = new Map();
for (const subject of files) {
  const file = new URL(`../data/${subject}.json`, import.meta.url);
  const rows = JSON.parse(await readFile(file, "utf8"));
  if (rows.length !== 1000) throw new Error(`Expected 1000 ${subject} questions, got ${rows.length}`);
  banks.set(subject, { file, rows });
}
const rows = banks.get("chinese").rows;

Object.assign(rows.find(row => row.id === "CHI-0158"), {
  question: "下列哪一句的「薄」讀音為ㄅㄛˊ，且意思是物體厚度小？",
  options: ["薄暮時分天色漸暗", "薄荷散發清香", "紙張很薄，容易透光", "薄利多銷是商業策略"],
  answer: 2,
  explanation: "答案 C「紙張很薄，容易透光」中的「薄」讀ㄅㄛˊ，表示厚度小。A「薄暮」的「薄」讀ㄅㄛˊ但指迫近黃昏，B「薄荷」讀ㄅㄛˋ，D「薄利」讀ㄅㄛˊ但指利潤少；題目同時限定讀音與詞義，因此只有 C 符合。",
  solutionSteps: ["先讀清楚兩個條件：讀音要是ㄅㄛˊ，詞義還要表示厚度小。", "A雖同音但「薄暮」指傍晚；D雖同音但「薄利」指利潤少；B「薄荷」讀音不同。", "只有 C「紙張很薄」同時符合ㄅㄛˊ與厚度小，答案為 C。"],
  teacherTip: "多音字題要同時比對讀音和語境義，不能只找同音字。",
});
Object.assign(rows.find(row => row.id === "CHI-0288"), {
  question: "「他走過的路，比別人走過的多；他看過的事，比別人看過的廣。」這兩個結構相近的分句，主要運用了何種修辭？",
  options: ["排比", "借代", "對偶", "摹寫"],
  answer: 2,
  explanation: "答案 C「對偶」。兩個分句字數與句法相近，分別以「走過的路／走過的多」和「看過的事／看過的廣」相互映照。排比通常由三個或以上結構相似的語句排列；本句只有兩個分句，判作對偶較精確。",
  solutionSteps: ["數一數相互並列的分句：本句只有兩個。", "兩句結構相近、語意相應，符合對偶的形式。", "排比通常需三個以上相似語句，因此選 C「對偶」。"],
  teacherTip: "辨認排比與對偶時要看句數及結構：兩句相對常為對偶，三句以上整齊排列才考慮排比。",
});
Object.assign(rows.find(row => row.id === "CHI-0933"), {
  question: "文章主線依序寫成年返鄉、整理老屋；作者在整理老屋的敘述中插入童年離家的往事，之後又回到整理老屋。這段童年片段屬於哪種敘述手法？",
  options: ["順敘", "倒敘", "插敘", "平敘"],
  answer: 2,
  explanation: "答案 C「插敘」。文章主線仍在成年返鄉後整理老屋，童年離家的片段是插入主線中的補充回憶，之後敘事再接回原來的整理情節。倒敘則是把後發事件先寫，再從頭回述主要事件；本題描述的是主線中途插入往事。",
  solutionSteps: ["先找主線：成年返鄉後整理老屋。", "童年離家往事插在整理老屋的主線中，並非取代主線順序。", "敘事再回到老屋整理情節，這種插入補充片段是插敘，選 C。"],
  teacherTip: "倒敘改變主要事件的呈現先後；插敘是在主線中穿插補充另一段背景或往事。",
});

function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function targetSequence(seedStart = 1, length = 1000, initialCounts = [250, 250, 250, 250]) {
  for (let seed = seedStart; seed < seedStart + 10000; seed += 1) {
    const random = randomGenerator(seed);
    const remaining = [...initialCounts];
    const sequence = [];
    let failed = false;
    while (sequence.length < length) {
      const candidates = remaining.map((count, index) => ({ count, index })).filter(item => item.count > 0 && !(sequence.length >= 2 && sequence.at(-1) === item.index && sequence.at(-2) === item.index)).map(item => item.index);
      if (!candidates.length) { failed = true; break; }
      const total = candidates.reduce((sum, index) => sum + remaining[index], 0);
      let pick = random() * total;
      let selected = candidates[0];
      for (const candidate of candidates) {
        pick -= remaining[candidate];
        if (pick < 0) { selected = candidate; break; }
      }
      sequence.push(selected);
      remaining[selected] -= 1;
    }
    if (!failed) return sequence;
  }
  throw new Error("Could not create a balanced answer sequence");
}

function remapOptionReferences(text, mapping) {
  const labels = /((?:correct\s+answer|answer|答案|正確答案|正解|故選|所以選|選項|選|排除)\s*(?:(?:is|為|是)\s*)?(?:[:：=]\s*)?)([A-D])\b/gi;
  return text.replace(labels, (match, prefix, letter) => `${prefix}${mapping[letter.toUpperCase()]}`)
    .replace(/\(([A-D])\)(?=\s|[、，：:.。）」]|$)/g, (match, letter) => `(${mapping[letter]})`)
    .replace(/(^|[\s，、；：。])([A-D])(?=[、，：:.。）」])/g, (match, prefix, letter) => `${prefix}${mapping[letter]}`)
    .replace(/([A-D])(?=選項|「|『)/g, (match, letter) => mapping[letter]);
}

function rebalanceOption(row, target) {
  const originalCorrectOption = row.options[row.answer];
  const correctIndex = row.answer;
  const targetIndex = target;
  if (correctIndex === targetIndex) return;
  const nextOptions = [...row.options];
  const mapping = Object.fromEntries(row.options.map((option, oldIndex) => [String.fromCharCode(65 + oldIndex), String.fromCharCode(65 + (oldIndex === correctIndex ? targetIndex : oldIndex === targetIndex ? correctIndex : oldIndex))]));
  [nextOptions[correctIndex], nextOptions[targetIndex]] = [nextOptions[targetIndex], nextOptions[correctIndex]];
  row.explanation = remapOptionReferences(row.explanation || "", mapping);
  row.solutionSteps = (row.solutionSteps || []).map(step => remapOptionReferences(step, mapping));
  row.options = nextOptions;
  row.answer = targetIndex;
}

for (const [subject, bank] of banks) {
  const subjectRows = bank.rows;
  const existingCounts = [0, 0, 0, 0];
  for (const row of subjectRows) existingCounts[row.answer] += 1;
  const desiredCounts = [250, 250, 250, 250];
  for (const row of subjectRows) {
    const sourceText = `${row.explanation || ""} ${(row.solutionSteps || []).join(" ")}`;
    const answerMatch = subject === "english"
      ? sourceText.match(/(?:correct answer|answer)\s*(?:is|:|=)\s*([A-D])\b/i)
      : sourceText.match(/(?:答案|正解|正確答案|故選|所以選)\s*(?:是|為)?\s*[「（(]?([A-D])(?=[、，：:.。）」]|$)/);
    if (answerMatch) {
      const named = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (Number.isInteger(named) && named >= 0 && named < 4 && named !== row.answer) desiredCounts[named] -= 1;
    }
  }
  const movableCounts = existingCounts.map((count, index) => count - (desiredCounts[index] < 0 ? 0 : 0));
  const targets = targetSequence(1000 + files.indexOf(subject) * 10000, subjectRows.length, desiredCounts);
  for (const [index, row] of subjectRows.entries()) {
    if (!Array.isArray(row.options) || row.options.length !== 4 || new Set(row.options).size !== 4) throw new Error(`${row.id}: expected four distinct choices`);
    const correct = row.options[row.answer];
    const target = targets[index];
    const sourceText = `${row.explanation || ""} ${(row.solutionSteps || []).join(" ")}`;
    const answerMatch = subject === "english"
      ? sourceText.match(/(?:correct answer|answer)\s*(?:is|:|=)\s*([A-D])\b/i)
      : sourceText.match(/(?:答案|正解|正確答案|故選|所以選)\s*(?:是|為)?\s*[「（(]?([A-D])(?=[、，：:.。）」]|$)/);
    const namedAnswer = answerMatch ? answerMatch[1].toUpperCase().charCodeAt(0) - 65 : null;
    const lockedAnswer = Number.isInteger(namedAnswer) && namedAnswer >= 0 && namedAnswer < 4 ? namedAnswer : null;
    const safeTarget = lockedAnswer === null ? target : lockedAnswer;
    rebalanceOption(row, safeTarget);
    if (row.options[row.answer] !== correct) throw new Error(`${row.id}: answer text changed during rebalance`);
  }
  const counts = [0, 0, 0, 0];
  for (const row of bank.rows) counts[row.answer] += 1;
  if (counts.some(count => count !== 250)) throw new Error(`${subject}: unexpected answer distribution ${counts}`);
  await writeFile(bank.file, `${JSON.stringify(subjectRows, null, 2)}\n`);
  console.log(`${subject}: balanced correct-answer positions ${counts.join("/")}; maximum consecutive run is 2.`);
}
console.log("Corrected CHI-0158, CHI-0288, CHI-0933 and balanced answer positions across all authored banks.");
