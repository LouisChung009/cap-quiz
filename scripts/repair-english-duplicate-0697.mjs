import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const row = rows.find(item => item.id === "ENG-0697");
if (!row) throw new Error("Missing ENG-0697");
Object.assign(row, {
  gradeSemester: "九年級上",
  unit: "文法",
  knowledgePoint: "過去完成式與被動語態",
  difficulty: "中等",
  question: "The reports ____ by the students before the teacher arrived.",
  options: ["completed", "had completed", "had been completed", "are completed"],
  answer: 2,
  explanation: "The reports received the action, so a passive form is needed. The completion happened before another past event (the teacher arrived), so the past perfect passive ‘had been completed’ is correct. Answer: C. ‘Had completed’ is active, and ‘are completed’ is present tense.",
  solutionSteps: [
    "Identify the subject: ‘the reports’ receive the action, so the verb must be passive.",
    "The reports were finished before the past event ‘the teacher arrived’; use the past perfect passive: had been + past participle.",
    "Choose C, ‘had been completed’. ‘Had completed’ lacks passive voice; ‘are completed’ does not match the past-time sequence."
  ],
  teacherTip: "For two past events, use the past perfect for the earlier event; add be + past participle when the subject receives the action.",
  relatedWords: ["complete = finish", "passive voice = 受動語態", "before = 之前"]
});
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Replaced the duplicate ENG-0697 item with a past-perfect passive question.");
