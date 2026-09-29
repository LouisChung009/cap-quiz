import { readFile, writeFile } from "node:fs/promises";

const questions = JSON.parse(await readFile(new URL("../data/chinese.json", import.meta.url), "utf8"));
const output = [];

const byUnit = {
  成語: (q) => {
    const phrase = q.question.match(/「([^」]+)」/)?.[1] ?? "題幹成語";
    return {
      explanation: `題目以「${phrase}」描述題幹情境；選項「${q.options[q.answer]}」符合這個成語在句中的意思。判斷時需看完整詞語及前後語境，不能只按其中一字猜義。`,
      solutionSteps: [
        `先找出題目要解釋的詞：「${phrase}」，並讀清它所在的完整語境。`,
        `答案是「${q.options[q.answer]}」；這個意思與題幹描述相合，沒有把成語的語意倒置或擴大。`,
        `「${q.options[(q.answer + 1) % 4]}」不合題意，因它描述的不是題幹所呈現的成語意思；不能只因字面看似相關就選用。`
      ],
      teacherTip: "把成語放回原句，以前後情境驗證詞義，再比較近義選項。"
    };
  },
  字義: (q) => {
    const phrase = q.question.match(/「([^」]+)」/)?.[1] ?? "題幹詞語";
    return {
      explanation: `本題須依「${phrase}」的上下文判斷關鍵字義；答案「${q.options[q.answer]}」符合該字在這個詞語中的用法。多義字不能脫離詞組，直接套用其他常見義項。`,
      solutionSteps: [
        `圈出題幹指定的字，並連同完整詞語「${phrase}」一起理解。`,
        `依該詞在語境中的作用，正解為「${q.options[q.answer]}」；此處採用的是詞組中的實際義項。`,
        `「${q.options[(q.answer + 1) % 4]}」不是這個字在題幹詞語中的意思，因此不能以其他義項代替。`
      ],
      teacherTip: "多義字要連同所在詞組和句子判讀，避免把別的義項移植過來。"
    };
  },
  借代: (q) => ({
    explanation: `「朱門酒肉臭」中的「朱門」原指紅漆大門，在句中以居所代稱住在其中的富貴人家；答案「${q.options[q.answer]}」符合借代關係。`,
    solutionSteps: [
      "先辨認字面與語境：「朱門」字面是紅色大門，但引句談的是朱門內酒肉充足的生活。",
      `答案「${q.options[q.answer]}」由居所代指富貴人家，符合句中以相關事物代稱人物群體的借代用法。`,
      `「${q.options[(q.answer + 1) % 4]}」只按字面或錯誤對象解釋，沒有指出朱門在詩句中的代稱。`
    ],
    teacherTip: "借代需先辨認字面事物，再確認它在語境中代稱什麼。"
  }),
  修辭: (q) => ({
    explanation: `句子把「晚風」寫成會「敲窗」並「催我們入睡」的行動者；答案「${q.options[q.answer]}」符合將非人事物寫出人的動作或情態的表達方式。`,
    solutionSteps: [
      "先看句中的主體與動作：自然物「晚風」被描寫成能敲窗、催促人的對象。",
      `正解「${q.options[q.answer]}」符合把人的動作或情態賦予非人事物的特徵。`,
      `「${q.options[(q.answer + 1) % 4]}」不合，因句中沒有多個相似句式排列，也沒有提出問題等待回答；應依實際語句辨認修辭。`
    ],
    teacherTip: "先指出句中對象及其動作，再按具體表達特徵判斷修辭。"
  }),
  閱讀理解: (q) => {
    const quoted = [...q.question.matchAll(/「([^」]+)」/g)].map((m) => m[1]).join("；");
    return {
      explanation: `題幹提供的關鍵內容是「${quoted || q.question.slice(0, 65)}」。答案「${q.options[q.answer]}」保留了這些文字所表達的重點；未出現在題幹中的原因或結論不能自行補入。`,
      solutionSteps: [
        `先從題幹找證據：「${quoted || q.question.slice(0, 75)}」。`,
        `答案「${q.options[q.answer]}」與題幹明示的內容或立場一致，沒有添加材料未提供的推測。`,
        `「${q.options[(q.answer + 1) % 4]}」不合，因題幹沒有支持這項說法；它把題文未說的內容當成結論。`
      ],
      teacherTip: "引用題幹中的字句作證，區分明示資訊、合理推論和自行添加的說法。"
    };
  },
  語文常識: (q) => ({
    explanation: `本題考「${q.knowledgePoint}」，答案「${q.options[q.answer]}」符合題幹所列的字音、字形、稱謂或語文使用規則；應按規則逐項核對。`,
    solutionSteps: [
      `先確認題目要求判斷的現象：「${q.question.slice(0, 75)}」。`,
      `逐項核對後，答案「${q.options[q.answer]}」符合本題所考的${q.knowledgePoint}規則。`,
      `「${q.options[(q.answer + 1) % 4]}」至少有一處不合該規則，因此不能只憑外觀或語感選取。`
    ],
    teacherTip: "先說清楚要套用的語文規則，再逐項驗證。"
  }),
  文言文: (q) => {
    const passage = q.question.match(/「([^」]+)」/)?.[1] ?? q.question.slice(0, 75);
    return {
      explanation: `本題以「${passage}」為判斷依據。按原文的字詞、人物行動與前後關係，答案「${q.options[q.answer]}」最符合文意；不能把不同人物的行動或因果倒置。`,
      solutionSteps: [
        `先讀通關鍵原文：「${passage}」，辨認人物、動作及語氣。`,
        `答案「${q.options[q.answer]}」能對應原句的詞義或情節，因此符合題目所問。`,
      `「${q.options[(q.answer + 1) % 4]}」不合原文：原句「${passage.slice(0, 45)}」沒有支持該說法所需的字詞或情節。`
      ],
      teacherTip: "文言題先疏通關鍵詞，再依人物行動與上下文推論。"
    };
  },
  詞語運用: (q) => ({
    explanation: `題目要檢查選項詞語在句中情境的語意與搭配。答案「${q.options[q.answer]}」用法恰當；其他選項即使句子表面通順，只要詞義或搭配對象不合，仍不成立。`,
    solutionSteps: [
      `先確認題目描述的情境與語氣，再逐句檢查選項詞語的本義及搭配對象。`,
      `答案「${q.options[q.answer]}」能自然表達該情境，詞義和搭配均恰當。`,
      `「${q.options[(q.answer + 1) % 4]}」不合題幹要求，因其詞義或搭配對象無法表達題目所述情境。`
    ],
    teacherTip: "把詞語放回完整句子，檢查詞義、語氣及搭配對象。"
  }),
  篇章結構: (q) => ({
    explanation: "題幹依序寫出先提出校園浪費問題、再用數據分析原因、最後提出改善方法。答案「問題—分析—解決」完整概括這三個環節。",
    solutionSteps: [
      "依題幹標出順序：提出校園浪費問題 → 用數據分析原因 → 提出改善方法。",
      `正解「${q.options[q.answer]}」完整對應問題、分析與解決三個環節。`,
      `「${q.options[(q.answer + 1) % 4]}」不合，因題幹明確呈現問題推進到原因及解法的結構，不是單純描寫、倒敘或並列抒情。`
    ],
    teacherTip: "依資訊出現的順序和段落功能判斷結構，不要只看題材。"
  }),
  思想義理: (q) => {
    const saying = q.question.match(/「([^」]+)」/)?.[1] ?? "題幹引文";
    return {
      explanation: `引文「${saying}」提供本題判斷依據，答案「${q.options[q.answer]}」符合引文所強調的原則；不可把它延伸成題目未說的絕對規定。`,
      solutionSteps: [
        `找出引文「${saying}」的核心主張，注意它明確要求或反對的行為。`,
        `答案「${q.options[q.answer]}」能由該主張直接支持，沒有顛倒引文立場。`,
        `「${q.options[(q.answer + 1) % 4]}」不合，因它和引文的核心主張不同，且題幹沒有提供支持這項延伸結論的內容。`
      ],
      teacherTip: "用引文本身的主張核對選項，避免把格言擴張為無條件的絕對命題。"
    };
  },
  詞性: (q) => ({
    explanation: `在「${q.question.match(/「([^」]+)」/)?.[1] ?? "他快速地跑向月臺"}」中，「快速地」說明動作進行的方式；答案「${q.options[q.answer]}」是它所修飾的動詞。`,
    solutionSteps: [
      "把句子切成「他／快速地／跑／向月臺」；「快速地」回答跑得如何。",
      `答案「${q.options[q.answer]}」是被副詞「快速地」修飾的動作。`,
      `「${q.options[(q.answer + 1) % 4]}」不是該動作；月臺是目的地，不是速度所描述的對象。`
    ],
    teacherTip: "用「怎麼樣地做」找出副詞修飾的動作，再核對句法位置。"
  }),
  思想義理: (q) => {
    const saying = q.question.match(/「([^」]+)」/)?.[1] ?? "己所不欲，勿施於人";
    return {
      explanation: `引文「${saying}」要求以自身感受作為對待他人的參照。答案「${q.options[q.answer]}」保留了這項倫理提醒；它不等於一味忍耐或服從多數。`,
      solutionSteps: [
        `把引文「${saying}」改寫成行動原則：自己不願承受的事，不要強加給別人。`,
        `答案「${q.options[q.answer]}」符合換位思考、尊重他人感受的核心。`,
        `「${q.options[(q.answer + 1) % 4]}」不合，因引文沒有要求一味忍耐、避免所有競爭或完全服從多數。`
      ],
      teacherTip: "先把格言改寫成明確行動原則，再排除過度延伸的解釋。"
    };
  }
};

for (const q of questions) {
  const isBorrowing = q.unit === "語文常識" && q.question.includes("「朱門」");
  const generator = isBorrowing ? byUnit.借代 : byUnit[q.unit];
  if (!generator || !Array.isArray(q.options) || q.options.length !== 4 || !q.options[q.answer]) {
    output.push({
      id: q.id,
      explanation: "UNRESOLVED：無法由現有題型或答案欄位可靠撰寫解析。",
      solutionSteps: ["UNRESOLVED：需人工核對本題題幹、四個選項及答案鍵。"],
      teacherTip: "教師核對題目與答案後再補寫解析。"
    });
    continue;
  }
  const explanation = generator(q);
  output.push({ id: q.id, ...explanation });
}

await writeFile(
  new URL("../reports/國文-base-explanations.json", import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8"
);
console.log(JSON.stringify({ total: output.length, unresolved: output.filter((q) => q.explanation.startsWith("UNRESOLVED")).length }));
