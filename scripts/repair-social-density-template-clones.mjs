import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "social.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const replacements = new Map([
  ["SOC-0464", {
    question: "某縣人口 360,000 人，人口密度為每平方公里 2,000 人，該縣面積是多少平方公里？",
    options: ["180 平方公里", "720 平方公里", "1,800 平方公里", "7,200 平方公里"],
    answer: 0,
    explanation: "人口密度＝人口÷面積，因此面積＝人口÷人口密度＝360,000÷2,000＝180 平方公里，答案 A。",
    solutionSteps: ["先寫出人口密度公式：人口密度＝人口÷面積。", "要求面積時移項：面積＝人口÷人口密度。", "360,000÷2,000＝180，該縣面積為 180 平方公里，選 A。"],
    teacherTip: "反求面積時用人口除以人口密度；不要把人口密度乘人口。"
  }],
  ["SOC-0568", {
    question: "甲市人口 450,000 人、面積 150 平方公里。若人口增加 90,000 人而市域面積不變，人口密度會增加多少人／平方公里？",
    options: ["300 人／平方公里", "3,000 人／平方公里", "3,600 人／平方公里", "600 人／平方公里"],
    answer: 3,
    explanation: "面積固定時，密度增加量等於新增人口除以面積：90,000÷150＝600 人／平方公里，答案 D。原密度 3,000，增加後為 3,600；題目問的是增加量，不是新密度。",
    solutionSteps: ["題目問密度增加量，只需用新增人口 90,000 除以固定面積 150。", "90,000÷150＝600 人／平方公里。", "因此密度增加 600 人／平方公里，選 D。"],
    teacherTip: "分清「增加量」與「增加後的密度」；若求新密度，才要再加上原本的 3,000。"
  }],
  ["SOC-0585", {
    question: "甲區面積 30 平方公里、人口 120,000 人；乙區面積 50 平方公里、人口 150,000 人。乙區人口比甲區多，但兩區人口密度相差多少人／平方公里？",
    options: ["甲區比乙區高 1,000 人／平方公里", "乙區比甲區高 1,000 人／平方公里", "兩區相同", "資料不足"],
    answer: 0,
    explanation: "甲區密度為 120,000÷30＝4,000 人／平方公里；乙區為 150,000÷50＝3,000 人／平方公里。甲區比乙區高 1,000 人／平方公里，答案 A。",
    solutionSteps: ["分別計算人口除以面積，不能只比較總人口。", "甲區密度 4,000，乙區密度 3,000 人／平方公里。", "4,000−3,000＝1,000，甲區較高，選 A。"],
    teacherTip: "人口較多不等於人口密度較高；密度比較要同時考慮面積，最後再看題目問的是差值還是較高者。"
  }],
  ["SOC-0935", {
    knowledgePoint: "權力分立與預算監督",
    question: "行政機關編列新建公共運輸補助計畫的經費，立法院審議中央政府總預算時要求說明計畫用途與效益。這主要展現哪一種制度功能？",
    options: ["立法院直接管理各地公共運輸日常營運", "法院對行政機關進行刑事判決", "立法機關透過預算審議監督行政施政", "行政機關因此取得制定法律的權力"],
    answer: 2,
    explanation: "行政機關提出預算並負責施政，立法院審議預算、要求說明，屬立法權對行政權的監督與制衡；立法院並未接手日常營運，答案 C。",
    solutionSteps: ["先辨認預算由行政機關編列，公共政策也由行政機關執行。", "立法院審議預算並要求說明用途，代表行使預算審議與監督權。", "監督不等於直接執行政策，因此選 C。"],
    teacherTip: "預算審議是立法機關監督行政的重要方式；要和立法院親自執行行政業務區分。"
  }],
  ["SOC-0586", {
    knowledgePoint: "年齡結構比較",
    question: "甲地總人口 240 萬人，其中 65 歲以上人口 36 萬人；乙地總人口 120 萬人，其中 65 歲以上人口 24 萬人。哪地高齡人口占總人口的比例較高？",
    options: ["甲地，為 15%", "乙地，為 20%", "兩地都是 20%", "資料不足"],
    answer: 1,
    explanation: "高齡人口比例＝65 歲以上人口÷總人口。甲地為 36÷240＝15%；乙地為 24÷120＝20%。乙地高齡人口占比高，答案 B。",
    solutionSteps: ["比較年齡結構要算比例，不能只看高齡人口的絕對人數。", "甲地比例為 36÷240＝15%；乙地為 24÷120＝20%。", "20% 大於 15%，所以乙地高齡人口占比較高，選 B。"],
    teacherTip: "看高齡化程度時要用高齡人口除以總人口；人口規模不同，不能直接比較高齡人口人數。"
  }]
]);

for (const [id, replacement] of replacements) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing target ${id}`);
  Object.assign(row, replacement);
}

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Reworked ${replacements.size} Social Studies population-density items with distinct reasoning tasks.`);
