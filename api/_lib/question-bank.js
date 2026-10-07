import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const files = ["chinese", "english", "math", "science", "social", "mission-questions"];
let questionsPromise;

export function getQuestionMap() {
  if (!questionsPromise) {
    questionsPromise = Promise.all(files.map(async file => {
      const contents = await readFile(resolve(process.cwd(), "data", `${file}.json`), "utf8");
      return JSON.parse(contents);
    })).then(banks => new Map(banks.flat().map(question => [question.id, question]))).catch(error => {
      questionsPromise = null;
      throw error;
    });
  }
  return questionsPromise;
}
