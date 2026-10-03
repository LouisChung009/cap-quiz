import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const exams = [
  {
    year: 110,
    paperUrl: "https://drive.google.com/file/d/1sKc4iLzr8WlbbxMA83Y0NNryYv9rqHiG/view",
    answerUrl: "https://drive.google.com/file/d/1z7jBxC9t24e2Y3WK71XxWe0JOjJRLcNW/view",
    keys: ["A", "B"],
    questions: [
      {
        question: "圖（一）的坐標平面上有 A、B、C、D 四點。根據圖（一）中各點位置判斷，哪一個點在第二象限？",
        options: ["A", "B", "C", "D"], answer: 0,
        explanation: "答案是 A。第二象限的點座標為（負數，正數），也就是在 y 軸左方且在 x 軸上方。圖中 A 位於這個區域。",
        solutionSteps: ["先在坐標圖上找到原點，並辨認 x 軸與 y 軸。", "第二象限位於 y 軸左側、x 軸上方，點的 x 坐標為負、y 坐標為正。", "圖中 A 位於第二象限，因此選 A。"],
        teacherTip: "象限依逆時針方向由右上開始：第一（＋，＋）、第二（－，＋）、第三（－，－）、第四（＋，－）。",
        image: "./assets/official-exams/110-math-q1-figure.png", imageAlt: "110年數學選擇題第1題坐標平面示意圖"
      },
      {
        question: "算式（−8）＋（−2）×（−3）之值為何？",
        options: ["−14", "−2", "18", "30"], answer: 1,
        explanation: "答案是 B（−2）。乘除先於加減；（−2）×（−3）＝6，再算 −8＋6＝−2。",
        solutionSteps: ["先算乘法，負數乘負數為正數：（−2）×（−3）＝6。", "原式變成 −8＋6。", "−8＋6＝−2，選 B。"],
        teacherTip: "混合四則先乘除後加減；負負得正，計算前可先標出運算順序。"
      }
    ]
  },
  {
    year: 111,
    paperUrl: "https://drive.google.com/file/d/1IyJBtIjySeyVAisE1YiCclYsSldQpHBf/view",
    answerUrl: "https://drive.google.com/file/d/1IeMHI4BmTpC_2Oc1lQ1Qj6XWHDf9qwGd/view",
    keys: ["A", "D"],
    questions: [
      {
        question: "圖（一）數線上的 A、B、C、D 四點所表示的數分別為 a、b、c、d，且 O 為原點。根據圖中各點位置判斷，下列何者的值最小？",
        options: ["|a|", "|b|", "|c|", "|d|"], answer: 0,
        explanation: "答案是 A（|a|）。絕對值表示數線上的點到原點的距離。由圖可見 A 最靠近 O，因此 |a| 最小。",
        solutionSteps: ["把每個數的絕對值想成該點到原點 O 的距離。", "在數線圖上比較 A、B、C、D 與 O 的水平距離。", "A 距離 O 最近，所以 |a| 最小，選 A。"],
        teacherTip: "數線上比較絕對值，只比較到原點的距離；正負號不決定距離大小。",
        image: "./assets/official-exams/111-math-q1-figure.png", imageAlt: "111年數學選擇題第1題數線圖"
      },
      {
        question: "計算多項式 6x²＋4x 除以 2x² 後，得到的餘式為何？",
        options: ["2", "4", "2x", "4x"], answer: 3,
        explanation: "答案是 D（4x）。以 6x²＋4x 除以 2x²，商為 3；被除式減去 3×2x² 後，餘式為 4x。",
        solutionSteps: ["用首項相除：6x²÷2x²＝3，因此商為 3。", "計算 6x²＋4x−3(2x²)。", "同類項相消後剩下 4x，選 D。"],
        teacherTip: "多項式除法先用最高次項相除，再以被除式減去「除式×商」；餘式次數須低於除式。"
      }
    ]
  },
  {
    year: 112,
    paperUrl: "https://drive.google.com/file/d/1SXbjT6B_F8eQh2GZEvB6KmgR0k2lDK8A/view",
    answerUrl: "https://drive.google.com/file/d/1OT5r0que_0bXSy0kwLEOEJMssce2OnL0/view",
    keys: ["A", "C"],
    questions: [
      {
        question: "（−3）³ 之值為何？",
        options: ["−27", "−9", "9", "27"], answer: 0,
        explanation: "答案是 A（−27）。奇數次方保留負號，且 3³＝3×3×3＝27，所以（−3）³＝−27。",
        solutionSteps: ["把三次方展開為（−3）×（−3）×（−3）。", "前兩個負數相乘為 9，再乘以 −3 得 −27。", "因此選 A。"],
        teacherTip: "負數的奇數次方為負，偶數次方為正；括號決定負號是否一起乘方。"
      },
      {
        question: "下列何者為多項式 x²−36 的因式？",
        options: ["x−3", "x−4", "x−6", "x−9"], answer: 2,
        explanation: "答案是 C（x−6）。x²−36 是平方差，可分解為（x−6）（x＋6），所以 x−6 是因式。",
        solutionSteps: ["辨認 x²−36＝x²−6²，是平方差形式。", "套用 a²−b²＝（a−b）（a＋b），得（x−6）（x＋6）。", "因此 x−6 為因式，選 C。"],
        teacherTip: "平方差須是兩個完全平方相減；分解後是一正一負的兩個一次因式。"
      }
    ]
  },
  {
    year: 113,
    paperUrl: "https://drive.google.com/file/d/1MXfrOI_4KyxF6A-2NNd_J_eIuo3Epa46/view",
    answerUrl: "https://drive.google.com/file/d/1cWlogP9FBRX1eD5kjgVDP2_6f8VCLSB4/view",
    keys: ["A", "A"],
    questions: [
      {
        question: "算式 3/7−（−1/4）之值為何？",
        options: ["19/28", "5/28", "4/11", "2/3"], answer: 0,
        explanation: "答案是 A（19/28）。減去負數等於加上正數，3/7−（−1/4）＝3/7＋1/4＝12/28＋7/28＝19/28。",
        solutionSteps: ["先處理負號：減去 −1/4 等於加上 1/4。", "通分至分母 28：3/7＝12/28，1/4＝7/28。", "相加得 19/28，選 A。"],
        teacherTip: "分數加減先確認正負號，再找最小公倍數通分；最後檢查是否可約分。"
      },
      {
        question: "圖（一）為一個直三角柱的展開圖，其中三個面積標示為甲、乙、丙。將此展開圖摺成直三角柱後，判斷下列敘述何者正確？",
        options: ["甲與乙平行，甲與丙垂直", "甲與乙平行，甲與丙平行", "甲與乙垂直，甲與丙垂直", "甲與乙垂直，甲與丙平行"], answer: 0,
        explanation: "答案是 A。直三角柱的兩個全等底面互相平行，圖中甲、乙是兩個三角形底面；側面丙垂直於底面，所以甲與乙平行，甲與丙垂直。",
        solutionSteps: ["展開圖中兩個全等三角形摺起後成為直三角柱的兩個底面，分別標為甲、乙。", "柱體的兩個底面互相平行，因此甲∥乙。", "直三角柱的側面與底面垂直；丙為側面，故甲⊥丙，選 A。"],
        teacherTip: "直柱的兩個底面互相平行；每個側面都垂直於底面。先從展開圖辨認面種類再判斷。",
        image: "./assets/official-exams/113-math-q2-figure.png", imageAlt: "113年數學選擇題第2題直三角柱展開圖"
      }
    ]
  },
  {
    year: 114,
    paperUrl: "https://drive.google.com/file/d/1c2AGC67Bq344EdGSZkO9SZhrY50hHTJx/view",
    answerUrl: "https://drive.google.com/file/d/175hz0lHG4GTDNxYet9lrRDu0lmC_G08o/view",
    keys: ["C", "B"],
    questions: [
      {
        question: "算式 7¹⁰×7²÷7⁴ 之值可用下列何者表示？",
        options: ["7³", "7⁵", "7⁸", "7¹⁶"], answer: 2,
        explanation: "答案是 C（7⁸）。同底數相乘指數相加，相除指數相減：7¹⁰×7²÷7⁴＝7^(10＋2−4)＝7⁸。",
        solutionSteps: ["同底數相乘，指數相加：10＋2。", "再除以同底數，指數相減：10＋2−4＝8。", "結果為 7⁸，選 C。"],
        teacherTip: "同底數乘法指數相加、除法指數相減；括號或運算順序要先看清楚。"
      },
      {
        question: "計算（5x²−2x）−（4−3x）的結果，與下列何者相同？",
        options: ["5x²−3x", "5x²＋x−4", "5x²−5x＋4", "5x²−5x−4"], answer: 1,
        explanation: "答案是 B（5x²＋x−4）。減去括號時括號內每一項都要變號：（5x²−2x）−（4−3x）＝5x²−2x−4＋3x＝5x²＋x−4。",
        solutionSteps: ["第二個括號前是減號，去括號時 4 變成 −4，−3x 變成 ＋3x。", "合併 x 項：−2x＋3x＝x。", "結果為 5x²＋x−4，選 B。"],
        teacherTip: "括號前的負號要分配到括號內每一項，特別留意負項變正。"
      }
    ]
  }
];

for (const exam of exams) {
  for (const existing of rows.filter(row => row.subject === "數學" && row.source?.year === exam.year)) {
    existing.source.section = existing.type === "非選擇題" ? "非選擇題" : "選擇題";
  }
  for (let index = 0; index < 2; index += 1) {
    const number = index + 1;
    const key = exam.keys[index];
    const item = exam.questions[index];
    if (item.options[item.answer] === undefined || String.fromCharCode(65 + item.answer) !== key) throw new Error(`${exam.year} Math Q${number}: key mismatch`);
    const id = `OFF-MATH-${exam.year}-Q${String(number).padStart(2, "0")}-MC`;
    const alreadyAdded = rows.find(row => row.id === id);
    if (alreadyAdded) {
      if (alreadyAdded.source?.year !== exam.year || alreadyAdded.source?.questionNumber !== number || alreadyAdded.options?.[alreadyAdded.answer] !== item.options[item.answer]) throw new Error(`Existing item ${id} does not match audited source`);
      alreadyAdded.source.section = "選擇題";
      continue;
    }
    if (rows.some(row => row.id === id)) throw new Error(`Duplicate id ${id}`);
    const constructed = rows.find(row => row.subject === "數學" && row.source?.year === exam.year && row.source?.questionNumber === number && row.type === "非選擇題");
    if (!constructed) throw new Error(`Missing constructed-response source record ${exam.year} Q${number}`);
    constructed.source.section = "非選擇題";
    constructed.knowledgePoint = `${exam.year}年數學非選第${number}題`;
    rows.push({
      id, subject: "數學", gradeSemester: "會考總複習", unit: "歷屆會考", knowledgePoint: `${exam.year}年數學選擇第${number}題`, difficulty: "基礎", type: "歷屆真題",
      question: item.question, ...(item.image ? { questionImage: item.image, imageAlt: item.imageAlt } : {}), options: item.options, answer: item.answer,
      explanation: item.explanation, solutionSteps: item.solutionSteps, teacherTip: item.teacherTip, relatedWords: [], sourceType: "官方歷屆真題",
      source: { year: exam.year, questionNumber: number, section: "選擇題", url: `https://cap.rcpet.edu.tw/exam/${exam.year}/${exam.year}exam.html`, paperUrl: exam.paperUrl },
      review: { intervalDays: 0, repetitions: 0, easeFactor: 2.5, lastReviewedAt: null, nextReviewAt: null },
      requiresImage: Boolean(item.image), requiresContext: false, ...(item.image ? { questionImages: [item.image] } : {}),
      answerKeyReview: { status: "verified", note: `依${exam.year}年官方數學選擇題答案表核對：第${number}題答案${key}，與正解索引相符。答案表：${exam.answerUrl}` }
    });
  }
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log("Added 10 source-checked official Math Q1–2 choice items; retained and relabeled all 10 constructed-response items.");
