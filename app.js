const SUBJECTS = ["國文", "英文", "數學", "自然", "社會"];
const FILES = { 國文: "chinese", 英文: "english", 數學: "math", 自然: "science", 社會: "social" };
const STORAGE_KEY = "capQuizV2";
const DAILY_GOAL = 20;
const LESSON_SIZE = 10;
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
const state = {
  subject: saved.subject || "數學", difficulty: saved.difficulty || "", unit: saved.unit || "",
  history: saved.history || [], wrongs: saved.wrongs || [], review: saved.review || {},
  game: { xp: 0, ...saved.game }, wrongMode: false, questions: [], current: null, selected: null, answered: false,
  lesson: { active: false, answered: 0, correct: 0, xp: 0, combo: 0, hearts: 5, shouldEnd: false }
};
const ids = ["subjectTabs","difficultyFilter","unitFilter","resetFilters","loading","quiz","empty","meta","question","options","feedback","wrongButton","mainButton","doneCount","accuracy","wrongCount","todayCount","streakDays","xpCount","heartCount","questMessage","goalRing","goalCount","startChallenge","lessonProgress","exitChallenge","progressBar","lessonHearts","rewardPop","resultModal","resultTitle","resultSummary","resultXp","resultAccuracy","closeResult"];
const elements = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ subject: state.subject, difficulty: state.difficulty, unit: state.unit, history: state.history, wrongs: state.wrongs, review: state.review, game: state.game, migratedV1: true }));
}
function migrateV1() {
  if (saved.migratedV1 || state.history.length) return;
  const oldHistory = JSON.parse(localStorage.getItem("hist") || "[]");
  const oldWrongs = JSON.parse(localStorage.getItem("wrongs") || "[]");
  if (oldHistory.length || oldWrongs.length) { state.history = oldHistory.map(item => ({ ...item, subject: item.s || item.subject })); state.wrongs = oldWrongs; save(); }
}
function localDateKey(timestamp = Date.now()) {
  const date = new Date(timestamp); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function todayHistory() { const today = localDateKey(); return state.history.filter(item => localDateKey(item.timestamp || item.ts) === today); }
function streakDays() {
  const active = new Set(state.history.map(item => localDateKey(item.timestamp || item.ts)));
  let cursor = new Date(); if (!active.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (active.has(localDateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
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
  let pool = state.questions.filter(item => (!state.difficulty || item.difficulty === state.difficulty) && (!state.unit || item.unit === state.unit));
  if (state.wrongMode) { const wrongIds = new Set(state.wrongs); pool = pool.filter(item => wrongIds.has(item.id)); }
  return pool;
}
function nextQuestion() {
  const pool = filteredPool(); elements.loading.classList.add("hidden");
  if (!pool.length) { state.current = null; elements.quiz.classList.add("hidden"); elements.empty.classList.remove("hidden"); updateStats(); return; }
  const choices = pool.filter(item => item.id !== state.current?.id); const candidates = choices.length ? choices : pool;
  state.current = candidates[Math.floor(Math.random() * candidates.length)]; state.selected = null; state.answered = false;
  elements.empty.classList.add("hidden"); elements.quiz.classList.remove("hidden"); renderQuestion();
}
function renderTabs() {
  elements.subjectTabs.innerHTML = SUBJECTS.map(subject => `<button class="tab ${subject === state.subject ? "active" : ""}" data-subject="${subject}" type="button">${subject}</button>`).join("");
  elements.subjectTabs.querySelectorAll("button").forEach(button => button.addEventListener("click", async () => { state.subject = button.dataset.subject; state.unit = ""; state.wrongMode = false; save(); renderTabs(); await loadSubject(); }));
}
function renderUnits() {
  const units = [...new Set(state.questions.map(item => item.unit))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  if (state.unit && !units.includes(state.unit)) state.unit = "";
  elements.unitFilter.innerHTML = `<option value="">全部單元</option>${units.map(unit => `<option value="${unit}">${unit}</option>`).join("")}`; elements.unitFilter.value = state.unit;
}
function renderQuestion() {
  const item = state.current;
  elements.meta.textContent = `${item.subject}｜${item.gradeSemester}｜${item.unit}｜${item.knowledgePoint}｜${item.difficulty}${state.wrongMode ? "｜錯題複習" : ""}`;
  elements.question.textContent = item.question; elements.feedback.className = "feedback hidden";
  elements.options.innerHTML = item.options.map((option, index) => `<button class="option" data-index="${index}" type="button"><b>${String.fromCharCode(65 + index)}</b>　${option}</button>`).join("");
  elements.options.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { if (state.answered) return; state.selected = Number(button.dataset.index); elements.options.querySelectorAll("button").forEach(option => option.classList.remove("selected")); button.classList.add("selected"); }));
  elements.mainButton.textContent = "確認答案"; elements.wrongButton.textContent = state.wrongMode ? "回一般刷題" : "只刷錯題"; elements.wrongButton.classList.toggle("hidden", state.lesson.active); updateStats();
}
function showReward(text, correct) {
  elements.rewardPop.textContent = text; elements.rewardPop.style.color = correct ? "var(--yellow)" : "var(--red)";
  elements.rewardPop.classList.remove("hidden"); elements.rewardPop.getAnimations().forEach(animation => animation.cancel());
  requestAnimationFrame(() => { elements.rewardPop.style.animation = "none"; requestAnimationFrame(() => { elements.rewardPop.style.animation = "reward 1s ease both"; }); });
  setTimeout(() => elements.rewardPop.classList.add("hidden"), 1000);
}
function checkAnswer() {
  if (state.answered) { if (state.lesson.active && state.lesson.shouldEnd) return finishChallenge(); return nextQuestion(); }
  if (state.selected === null) return alert("請先選一個答案");
  state.answered = true; const correct = state.selected === state.current.answer;
  state.history.push({ id: state.current.id, subject: state.subject, correct, timestamp: Date.now() });
  if (correct) state.wrongs = state.wrongs.filter(id => id !== state.current.id); else if (!state.wrongs.includes(state.current.id)) state.wrongs.push(state.current.id);
  const previous = state.review[state.current.id] || { intervalDays: 0, repetitions: 0, easeFactor: 2.5 };
  state.review[state.current.id] = { ...previous, lastReviewedAt: new Date().toISOString(), nextReviewAt: null, repetitions: correct ? previous.repetitions + 1 : 0 };
  let earnedXp = correct ? 10 : 2;
  if (state.lesson.active) {
    state.lesson.answered += 1;
    if (correct) { state.lesson.correct += 1; state.lesson.combo += 1; earnedXp += Math.min(state.lesson.combo - 1, 5) * 2; }
    else { state.lesson.combo = 0; state.lesson.hearts = Math.max(0, state.lesson.hearts - 1); }
    state.lesson.xp += earnedXp; state.lesson.shouldEnd = state.lesson.answered >= LESSON_SIZE || state.lesson.hearts === 0;
  }
  state.game.xp += earnedXp; save();
  elements.options.querySelectorAll("button").forEach((button, index) => { button.classList.remove("selected"); if (index === state.current.answer) button.classList.add("correct"); if (index === state.selected && !correct) button.classList.add("incorrect"); });
  const comboText = state.lesson.active && correct && state.lesson.combo >= 2 ? `・${state.lesson.combo} 連擊！` : "";
  elements.feedback.className = `feedback ${correct ? "ok" : "no"}`;
  elements.feedback.innerHTML = `<b>${correct ? `答對了 ${comboText}` : `答錯了，正確答案是 ${String.fromCharCode(65 + state.current.answer)}`}</b><br>${state.current.explanation}`;
  elements.mainButton.textContent = state.lesson.active && state.lesson.shouldEnd ? "查看結果" : "下一題";
  showReward(correct ? `+${earnedXp} XP` : "愛心 -1", correct); updateStats();
}
function startChallenge() {
  state.wrongMode = false; state.lesson = { active: true, answered: 0, correct: 0, xp: 0, combo: 0, hearts: 5, shouldEnd: false };
  document.body.classList.add("challenge-active"); elements.lessonProgress.classList.remove("hidden"); nextQuestion(); updateStats();
}
function exitChallenge() {
  if (state.lesson.answered && !confirm("離開後本回合進度會結束，確定退出嗎？")) return;
  state.lesson.active = false; document.body.classList.remove("challenge-active"); elements.lessonProgress.classList.add("hidden"); nextQuestion(); updateStats();
}
function finishChallenge() {
  const accuracy = state.lesson.answered ? Math.round(state.lesson.correct / state.lesson.answered * 100) : 0;
  elements.resultTitle.textContent = state.lesson.hearts === 0 ? "別放棄，再來一關！" : accuracy === 100 ? "完美通關！" : "挑戰完成！";
  elements.resultSummary.textContent = state.lesson.hearts === 0 ? "愛心用完了，但每次訂正都在變強。" : `完成 ${state.lesson.answered} 題，答對 ${state.lesson.correct} 題。`;
  elements.resultXp.textContent = `+${state.lesson.xp} XP`; elements.resultAccuracy.textContent = `${accuracy}%`; elements.resultModal.classList.remove("hidden");
  state.lesson.active = false; document.body.classList.remove("challenge-active"); elements.lessonProgress.classList.add("hidden"); updateStats();
}
function closeResult() { elements.resultModal.classList.add("hidden"); nextQuestion(); }
function updateStats() {
  const correct = state.history.filter(item => item.correct ?? item.ok).length; const today = todayHistory(); const progress = Math.min(today.length / DAILY_GOAL * 100, 100);
  elements.doneCount.textContent = state.history.length; elements.accuracy.textContent = state.history.length ? `${Math.round(correct / state.history.length * 100)}%` : "—"; elements.wrongCount.textContent = state.wrongs.length;
  elements.todayCount.textContent = today.length; elements.streakDays.textContent = streakDays(); elements.xpCount.textContent = state.game.xp; elements.heartCount.textContent = state.lesson.active ? state.lesson.hearts : 5;
  elements.goalCount.textContent = Math.min(today.length, DAILY_GOAL); elements.goalRing.style.setProperty("--goal", `${progress}%`);
  elements.questMessage.textContent = today.length >= DAILY_GOAL ? "今日目標達成！再玩一關累積更多 XP" : `今天再答 ${DAILY_GOAL - today.length} 題即可達標`;
  if (state.lesson.active) { elements.progressBar.style.width = `${state.lesson.answered / LESSON_SIZE * 100}%`; elements.lessonHearts.textContent = `❤️ ${state.lesson.hearts}`; }
}
elements.mainButton.addEventListener("click", checkAnswer);
elements.wrongButton.addEventListener("click", () => { state.wrongMode = !state.wrongMode; nextQuestion(); });
elements.difficultyFilter.addEventListener("change", event => { state.difficulty = event.target.value; save(); nextQuestion(); });
elements.unitFilter.addEventListener("change", event => { state.unit = event.target.value; save(); nextQuestion(); });
elements.resetFilters.addEventListener("click", () => { state.difficulty = ""; state.unit = ""; elements.difficultyFilter.value = ""; elements.unitFilter.value = ""; save(); nextQuestion(); });
elements.startChallenge.addEventListener("click", startChallenge); elements.exitChallenge.addEventListener("click", exitChallenge); elements.closeResult.addEventListener("click", closeResult);
migrateV1(); elements.difficultyFilter.value = state.difficulty; renderTabs(); loadSubject(); updateStats();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
