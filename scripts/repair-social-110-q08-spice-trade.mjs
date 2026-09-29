import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find(({ id }) => id === "OFF-0123");
if (!question || question.subject !== "社會" || question.source?.year !== 110 || question.source?.questionNumber !== 8) {
  throw new Error("Unexpected or missing 110 social Q8 (OFF-0123)");
}

question.question = "【圖表資料】約 1400 年，義大利商人運回歐洲的香料重量明顯高於葡萄牙（葡萄牙約為零）；到 1500 年，義大利運量大幅減少，葡萄牙運量則升高並超越義大利。此變化最可能與下列何者有關？";
question.options = ["文藝復興的出現", "工業革命的興起", "海外新航路的發現", "鄂圖曼土耳其帝國的滅亡"];
question.answer = 2;
question.explanation = "1400 至 1500 年間，葡萄牙運回歐洲的香料由幾乎沒有大幅增加並超越義大利，反映葡萄牙遠洋航行與通往亞洲的新航路開闢後，直接參與香料貿易。這最符合海外新航路的發現，選 C。文藝復興不是造成葡萄牙香料運量躍升的直接原因；工業革命發生於更晚的年代。";
question.solutionSteps = [
  "先比較兩個時間點：1400 年葡萄牙香料運量約為零；1500 年已明顯增加並超越義大利。",
  "這表示葡萄牙在十五世紀逐步投入遠洋航行，開闢通往亞洲的海上路線並取得香料貿易。",
  "因此最直接相關的是海外新航路的發現，答案為 C；工業革命年代較晚，文藝復興也不能直接解釋此貿易路線變化。"
];
question.teacherTip = "讀歷史圖表先找時間與地區的變化，再連結同一時期的交通、貿易和政治事件；不要只因年代接近就判定因果。";
question.requiresImage = false;
question.requiresContext = false;

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Transcribed 110 social Q8 chart trend and restored choices and explanation.");
