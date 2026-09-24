const SUBJECTS = ["國文", "英文", "數學", "自然", "社會"];
const FILES = { 國文: "chinese", 英文: "english", 數學: "math", 自然: "science", 社會: "social" };
const STORAGE_KEY = "capQuizV2";
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
const state = { subject: saved.subject || "數學", difficulty: saved.difficulty || "", unit: saved.unit || "", history: saved.history || [], wrongs: saved.wrongs || [], review: saved.review || {}, wrongMode: false, questions: [], current: null, selected: null, answered: false };
const byId = id => document.getElementById(id);
const elements = Object.fromEntries(["subjectTabs","difficultyFilter","unitFilter","resetFilters","loading","quiz","empty","meta","question","options","feedback","wrongButton","mainButton","doneCount","accuracy","wrongCount","todayCount"].map(id => [id, byId(id)]));

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ subject: state.subject, difficulty: state.difficulty, unit: state.unit, history: state.history, wrongs: state.wrongs, review: state.review, migratedV1: true })); }
function migrateV1() {
  if (saved.migratedV1 || state.history.length) return;
  const oldHistory = JSON.parse(localStorage.getItem("hist") || "[]");
  const oldWrongs = JSON.parse(localStorage.getItem("wrongs") || "[]");
  if (oldHistory.length || oldWrongs.length) { state.history = oldHistory.map(item => ({ ...item, subject: item.s || item.subject })); state.wrongs = oldWrongs; save(); }
}
async function loadSubject() {
  elements.loading.classList.remove("hidden"); elements.loading.textContent = "正在載入題庫…"; elements.quiz.classList.add("hidden"); elements.empty.classList.add("hidden");
  try {
    const response = await fetch(`./data/${FILES[state.subject]}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.questions = await response.json(); renderUnits(); nextQuestion();
  } catch (error) { elements.loading.textContent = `題庫載入失敗：${error.message}`; }
}
function filteredPool() {
  let pool = state.questions.filter(question => (!state.difficulty || question.difficulty === state.difficulty) && (!state.unit || question.unit === state.unit));
  if (state.wrongMode) { const wrongIds = new Set(state.wrongs); pool = pool.filter(question => wrongIds.has(question.id)); }
  return pool;
}
function nextQuestion() {
  const pool = filteredPool(); elements.loading.classList.add("hidden");
  if (!pool.length) { state.current = null; elements.quiz.classList.add("hidden"); elements.empty.classList.remove("hidden"); updateStats(); return; }
  const choices = pool.filter(question => question.id !== state.current?.id); const candidates = choices.length ? choices : pool;
  state.current = candidates[Math.floor(Math.random() * candidates.length)]; state.selected = null; state.answered = false;
  elements.empty.classList.add("hidden"); elements.quiz.classList.remove("hidden"); renderQuestion();
}
function renderTabs() {
  elements.subjectTabs.innerHTML = SUBJECTS.map(subject => `<button class="tab ${subject === state.subject ? "active" : ""}" data-subject="${subject}" type="button">${subject}</button>`).join("");
  elements.subjectTabs.querySelectorAll("button").forEach(button => button.addEventListener("click", async () => { state.subject = button.dataset.subject; state.unit = ""; state.wrongMode = false; save(); renderTabs(); await loadSubject(); }));
}
function renderUnits() {
  const units = [...new Set(state.questions.map(question => question.unit))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  if (state.unit && !units.includes(state.unit)) state.unit = "";
  elements.unitFilter.innerHTML = `<option value="">全部單元</option>${units.map(unit => `<option value="${unit}">${unit}</option>`).join("")}`; elements.unitFilter.value = state.unit;
}
function renderQuestion() {
  const question = state.current;
  elements.meta.textContent = `${question.subject}｜${question.gradeSemester}｜${question.unit}｜${question.knowledgePoint}｜${question.difficulty}${state.wrongMode ? "｜錯題複習" : ""}`;
  elements.question.textContent = question.question; elements.feedback.className = "feedback hidden";
  elements.options.innerHTML = question.options.map((option, index) => `<button class="option" data-index="${index}" type="button"><b>${String.fromCharCode(65 + index)}</b>　${option}</button>`).join("");
  elements.options.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { if (state.answered) return; state.selected = Number(button.dataset.index); elements.options.querySelectorAll("button").forEach(item => item.classList.remove("selected")); button.classList.add("selected"); }));
  elements.mainButton.textContent = "確認答案"; elements.wrongButton.textContent = state.wrongMode ? "回一般刷題" : "只刷錯題"; updateStats();
}
function checkAnswer() {
  if (state.answered) return nextQuestion();
  if (state.selected === null) return alert("請先選一個答案");
  state.answered = true; const correct = state.selected === state.current.answer;
  state.history.push({ id: state.current.id, subject: state.subject, correct, timestamp: Date.now() });
  if (correct) state.wrongs = state.wrongs.filter(id => id !== state.current.id); else if (!state.wrongs.includes(state.current.id)) state.wrongs.push(state.current.id);
  const previous = state.review[state.current.id] || { intervalDays: 0, repetitions: 0, easeFactor: 2.5 };
  state.review[state.current.id] = { ...previous, lastReviewedAt: new Date().toISOString(), nextReviewAt: null, repetitions: correct ? previous.repetitions + 1 : 0 };
  save();
  elements.options.querySelectorAll("button").forEach((button, index) => { button.classList.remove("selected"); if (index === state.current.answer) button.classList.add("correct"); if (index === state.selected && !correct) button.classList.add("incorrect"); });
  elements.feedback.className = `feedback ${correct ? "ok" : "no"}`; elements.feedback.innerHTML = `<b>${correct ? "答對了" : `答錯了，正確答案是 ${String.fromCharCode(65 + state.current.answer)}`}</b><br>${state.current.explanation}`;
  elements.mainButton.textContent = "下一題"; updateStats();
}
function updateStats() {
  elements.doneCount.textContent = state.history.length; const correct = state.history.filter(item => item.correct ?? item.ok).length;
  elements.accuracy.textContent = state.history.length ? `${Math.round(correct / state.history.length * 100)}%` : "—"; elements.wrongCount.textContent = state.wrongs.length;
  const today = new Date().toDateString(); elements.todayCount.textContent = `今日 ${state.history.filter(item => new Date(item.timestamp || item.ts).toDateString() === today).length} 題`;
}
elements.mainButton.addEventListener("click", checkAnswer);
elements.wrongButton.addEventListener("click", () => { state.wrongMode = !state.wrongMode; nextQuestion(); });
elements.difficultyFilter.addEventListener("change", event => { state.difficulty = event.target.value; save(); nextQuestion(); });
elements.unitFilter.addEventListener("change", event => { state.unit = event.target.value; save(); nextQuestion(); });
elements.resetFilters.addEventListener("click", () => { state.difficulty = ""; state.unit = ""; elements.difficultyFilter.value = ""; elements.unitFilter.value = ""; save(); nextQuestion(); });
migrateV1(); elements.difficultyFilter.value = state.difficulty; renderTabs(); loadSubject();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
