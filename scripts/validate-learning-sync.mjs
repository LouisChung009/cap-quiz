import assert from "node:assert/strict";
import { createLearningSync } from "../shared/learning-sync.js";

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    values
  };
}

const storage = createStorage();
const progressResults = [];
let progressCalls = 0;
const progressSync = createLearningSync({
  storage,
  debounceMs: 0,
  retryBaseMs: 30000,
  request: async (_url, options) => {
    progressCalls++;
    progressResults.push(JSON.parse(options.body).state.revision);
    return { ok: progressCalls > 1, status: progressCalls > 1 ? 200 : 503 };
  }
});
progressSync.saveProgress({ revision: 1 });
await wait(10);
assert.equal(progressResults[0], 1);
await progressSync.retryNow();
assert.deepEqual(progressResults, [1, 1]);

const attemptStorage = createStorage();
const sentAttempts = [];
let attemptFailures = 1;
const attemptSync = createLearningSync({
  storage: attemptStorage,
  retryBaseMs: 30000,
  request: async (_url, options) => {
    const attempt = JSON.parse(options.body);
    sentAttempts.push(attempt.clientAttemptId);
    if (attemptFailures-- > 0) return { ok: false, status: 503 };
    return { ok: true, status: 201 };
  }
});
const clientAttemptId = await attemptSync.recordAttempt({ questionId: "math-0001", subject: "數學", correct: true });
assert.ok(clientAttemptId);
assert.ok(attemptStorage.getItem("capQuizAttemptOutboxV1"));
await attemptSync.retryNow();
assert.deepEqual(sentAttempts, [clientAttemptId, clientAttemptId]);
assert.deepEqual(JSON.parse(attemptStorage.getItem("capQuizAttemptOutboxV1")), []);

let allowOutboxWrite = true;
const durableStorage = {
  ...createStorage(),
  setItem(key, value) {
    if (!allowOutboxWrite && value === "[]") throw new Error("storage unavailable");
    this.values.set(key, String(value));
  }
};
const duplicateSafeIds = [];
const durableSync = createLearningSync({
  storage: durableStorage,
  retryBaseMs: 30000,
  request: async (_url, options) => {
    duplicateSafeIds.push(JSON.parse(options.body).clientAttemptId);
    return { ok: true, status: 201 };
  }
});
allowOutboxWrite = false;
const durableAttemptId = await durableSync.recordAttempt({ questionId: "math-0002", subject: "數學", correct: false });
assert.equal(JSON.parse(durableStorage.getItem("capQuizAttemptOutboxV1")).length, 1);
allowOutboxWrite = true;
await durableSync.retryNow();
assert.deepEqual(duplicateSafeIds, [durableAttemptId, durableAttemptId]);
assert.deepEqual(JSON.parse(durableStorage.getItem("capQuizAttemptOutboxV1")), []);

let previewRequests = 0;
const previewSync = createLearningSync({ storage: createStorage(), localPreview: true, request: async () => { previewRequests++; return { ok: true }; } });
previewSync.saveProgress({ revision: 1 });
await previewSync.recordAttempt({ questionId: "math-0001", subject: "數學", correct: true });
assert.equal(previewRequests, 0);

console.log("Learning sync validation passed (progress retry, durable attempt outbox, local-preview isolation).");
