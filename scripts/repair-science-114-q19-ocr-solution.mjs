import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find(({ id }) => id === "OFF-1057");
if (!question || question.subject !== "自然" || question.source?.year !== 114 || question.source?.questionNumber !== 19) {
  throw new Error("Unexpected or missing 114 science Q19 (OFF-1057)");
}

question.question = "為了減少溫室氣體，地質學家將二氧化碳變成岩石的一部分。將發電廠產生的二氧化碳灌入大量的水中，以管線將這些氣泡水輸送到數公里遠的區域，接著透過高壓將氣泡水注入地下一千公尺深的岩層中。這些氣泡水會和鈣、鎂等離子反應而「固化」，並填充岩層空隙。二氧化碳一旦固化後，就能存在岩層中。上述二氧化碳變成岩石一部分的過程，是利用下列二氧化碳（水溶液）的何種性質？";
question.explanation = "二氧化碳溶於水後，溶解無機碳會以 CO₂(aq)、HCO₃⁻及 CO₃²⁻等形態存在；在適當水化學條件下，CO₃²⁻可與 Ca²⁺形成難溶的 CaCO₃ 沉澱，將碳固定在岩層中，因此選 C。二氧化碳密度或溶於水呈酸性不能直接說明固化機制；Na₂CO₃ 易溶於水，也不符合形成固體沉澱的描述。";
question.solutionSteps = [
  "題幹關鍵是二氧化碳水溶液與岩層中的鈣、鎂離子反應後「固化」，需要找出能生成難溶固體的反應。",
  "溶解無機碳會以 CO₂(aq)、HCO₃⁻及 CO₃²⁻等形態存在；在適當水化學條件下，CO₃²⁻可與 Ca²⁺結合，形成難溶的碳酸鈣（CaCO₃）沉澱，因而把碳固定在岩層中。",
  "因此答案是 C。密度大於空氣及溶於水呈酸性不是固化成岩石的關鍵；鈉離子形成的碳酸鈉易溶於水，也不符合沉澱固化。"
];
question.teacherTip = "題幹提到離子反應後「固化」，要判斷是否生成難溶物；形成沉澱是把溶液中的物質固定下來的關鍵。";

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Cleaned OCR and added a chemistry-specific solution for 114 science Q19.");
