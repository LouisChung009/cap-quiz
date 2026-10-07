import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = await readFile(join(root, "app.js"), "utf8");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const start = source.indexOf("function renderQuestionPrompt(");
const end = source.indexOf("\nfunction renderQuestion()", start);
assert(start >= 0 && end > start, "question prompt renderer must be defined before renderQuestion");
assert(source.slice(start, end).includes("document.createTextNode"), "question content must be emitted as inert text nodes");

class Element {
  constructor(tagName, text = "") { this.tagName = tagName; this.children = []; this.value = text; this.className = ""; this.scope = ""; }
  append(...nodes) { for (const node of nodes) node.tagName === "#fragment" ? this.children.push(...node.children) : this.children.push(node); }
  replaceChildren(...nodes) { this.children = []; this.value = ""; this.append(...nodes); }
  set textContent(value) { this.value = String(value); this.children = []; }
  get textContent() { return this.children.length ? this.children.map(node => node.textContent).join("") : this.value; }
}

const document = {
  createDocumentFragment: () => new Element("#fragment"),
  createElement: tagName => new Element(tagName),
  createTextNode: value => new Element("#text", value)
};
const renderQuestionPrompt = runInNewContext(`${source.slice(start, end)}; renderQuestionPrompt`, { document });
const findAll = (node, tagName) => [...(node.tagName === tagName ? [node] : []), ...node.children.flatMap(child => findAll(child, tagName))];

for (const [id, headerCells, bodyRows, expected] of [
  ["OFF-0560", 8, 3, ["年齡組成", "1953", "17.95%", "68.55%"]],
  ["OFF-0562", 2, 2, ["自由中國", "雷震等人", "美麗島", "黃信介等人"]],
  ["OFF-0584", 4, 4, ["測站", "緯度", "經度", "高度（公尺）", "23.98°N", "121.74°E", "40.8"]]
]) {
  const question = questions.find(item => item.id === id);
  assert(question?.question.split("\n").filter(line => line.trim().startsWith("|")).length >= 3, `${id}: source table should be represented as pipe-table data`);
  const container = new Element("div");
  renderQuestionPrompt(container, question.question);
  const tables = findAll(container, "table");
  assert.equal(tables.length, 1, `${id}: expected one semantic HTML table`);
  assert.equal(findAll(tables[0], "th").length, headerCells, `${id}: table headers must be preserved`);
  assert.equal(findAll(tables[0], "tr").length - 1, bodyRows, `${id}: table rows must be preserved`);
  for (const value of expected) assert(tables[0].textContent.includes(value), `${id}: missing table value ${value}`);
  assert(!tables[0].textContent.includes("|"), `${id}: Markdown delimiters should not be visible`);
}

const unsafeText = new Element("div");
renderQuestionPrompt(unsafeText, "| 名稱 | 說明 |\n|---|---|\n| <img src=x onerror=alert(1)> | 安全文字 |");
assert.equal(findAll(unsafeText, "img").length, 0, "untrusted table content must never become markup");
assert(unsafeText.textContent.includes("<img src=x onerror=alert(1)>"), "untrusted content should remain readable as text");
console.log("Question tables render semantically, preserve source values, and keep cell content inert.");
