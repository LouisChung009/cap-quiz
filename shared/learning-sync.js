const ATTEMPT_OUTBOX_KEY = "capQuizAttemptOutboxV1";

function readAttemptOutbox(storage) {
  try {
    const value = JSON.parse(storage.getItem(ATTEMPT_OUTBOX_KEY) || "[]");
    return Array.isArray(value) ? value.filter(item => item && typeof item.clientAttemptId === "string") : [];
  } catch {
    return [];
  }
}

function createAttemptId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function createLearningSync({
  request,
  storage,
  localPreview = false,
  onStatus = () => {},
  debounceMs = 800,
  retryBaseMs = 1000,
  setTimer = setTimeout,
  clearTimer = clearTimeout
}) {
  let pendingProgress = null;
  let progressInFlight = false;
  let progressFailed = false;
  let progressRetries = 0;
  let progressDebounceTimer = null;
  let progressRetryTimer = null;
  let attempts = readAttemptOutbox(storage);
  let attemptsInFlight = false;
  let attemptsFailed = false;
  let attemptsRetries = 0;
  let attemptsRetryTimer = null;
  let progressStorageFailed = false;
  let attemptsStorageFailed = false;

  function updateStatus() {
    if (localPreview) {
      onStatus("本機預覽：答題與進度只保存在此瀏覽器", "local", false);
      return;
    }
    if (progressStorageFailed || attemptsStorageFailed) {
      onStatus("裝置儲存失敗；尚有資料未能保留，請保持頁面開啟", "error", true);
      return;
    }
    if (progressFailed || attemptsFailed) {
      const count = attempts.length;
      onStatus(`雲端同步暫時失敗；資料已保存在此裝置${count ? `・${count} 筆答題待同步` : ""}，將自動重試`, "error", true);
      return;
    }
    if (progressInFlight || pendingProgress || attemptsInFlight || attempts.length) {
      onStatus(attempts.length ? `同步中・${attempts.length} 筆答題待上傳` : "學習進度同步中…", "pending", false);
      return;
    }
    onStatus("學習進度與答題紀錄已同步", "synced", false);
  }

  function scheduleProgressRetry() {
    if (progressRetryTimer !== null) return;
    const delay = Math.min(30000, retryBaseMs * 2 ** Math.min(progressRetries++, 5));
    progressRetryTimer = setTimer(() => {
      progressRetryTimer = null;
      void flushProgress();
    }, delay);
  }

  function scheduleAttemptsRetry() {
    if (attemptsRetryTimer !== null) return;
    const delay = Math.min(30000, retryBaseMs * 2 ** Math.min(attemptsRetries++, 5));
    attemptsRetryTimer = setTimer(() => {
      attemptsRetryTimer = null;
      void flushAttempts();
    }, delay);
  }

  async function flushProgress() {
    if (localPreview || progressInFlight || !pendingProgress) return;
    if (progressDebounceTimer !== null) {
      clearTimer(progressDebounceTimer);
      progressDebounceTimer = null;
    }
    if (progressRetryTimer !== null) {
      clearTimer(progressRetryTimer);
      progressRetryTimer = null;
    }
    progressInFlight = true;
    let activeState = null;
    try {
      while (pendingProgress) {
        activeState = pendingProgress;
        pendingProgress = null;
        const response = await request("/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: activeState })
        });
        if (!response.ok) throw new Error(`Progress sync failed: ${response.status}`);
        activeState = null;
      }
      progressFailed = false;
      progressRetries = 0;
    } catch {
      pendingProgress = pendingProgress || activeState;
      progressFailed = true;
      scheduleProgressRetry();
    } finally {
      progressInFlight = false;
      updateStatus();
      if (pendingProgress && !progressFailed) void flushProgress();
    }
  }

  async function flushAttempts() {
    if (localPreview || attemptsInFlight || !attempts.length) return;
    if (attemptsRetryTimer !== null) {
      clearTimer(attemptsRetryTimer);
      attemptsRetryTimer = null;
    }
    attemptsInFlight = true;
    try {
      while (attempts.length) {
        const attempt = attempts[0];
        const response = await request("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attempt)
        });
        if (!response.ok) throw new Error(`Attempt sync failed: ${response.status}`);
        const remaining = attempts.filter(item => item.clientAttemptId !== attempt.clientAttemptId);
        try {
          storage.setItem(ATTEMPT_OUTBOX_KEY, JSON.stringify(remaining));
        } catch {
          attemptsStorageFailed = true;
          throw new Error("Could not persist the remaining attempt outbox");
        }
        attempts = remaining;
        attemptsStorageFailed = false;
      }
      attemptsFailed = false;
      attemptsRetries = 0;
      attemptsStorageFailed = false;
    } catch {
      attemptsFailed = true;
      scheduleAttemptsRetry();
    } finally {
      attemptsInFlight = false;
      updateStatus();
      if (attempts.length && !attemptsFailed) void flushAttempts();
    }
  }

  function saveProgress(state) {
    if (localPreview) {
      updateStatus();
      return;
    }
    pendingProgress = state;
    if (progressRetryTimer !== null) {
      clearTimer(progressRetryTimer);
      progressRetryTimer = null;
    }
    if (progressDebounceTimer !== null) clearTimer(progressDebounceTimer);
    progressDebounceTimer = setTimer(() => {
      progressDebounceTimer = null;
      void flushProgress();
    }, debounceMs);
    updateStatus();
  }

  async function recordAttempt(attempt) {
    if (localPreview) {
      updateStatus();
      return null;
    }
    const queued = { ...attempt, clientAttemptId: attempt.clientAttemptId || createAttemptId() };
    if (!attempts.some(item => item.clientAttemptId === queued.clientAttemptId)) attempts.push(queued);
    try {
      storage.setItem(ATTEMPT_OUTBOX_KEY, JSON.stringify(attempts));
      attemptsStorageFailed = false;
    } catch {
      attemptsStorageFailed = true;
    }
    updateStatus();
    await flushAttempts();
    return queued.clientAttemptId;
  }

  async function retryNow() {
    if (progressDebounceTimer !== null) {
      clearTimer(progressDebounceTimer);
      progressDebounceTimer = null;
    }
    await Promise.all([flushProgress(), flushAttempts()]);
  }

  function markStorageFailed() {
    progressStorageFailed = true;
    updateStatus();
  }

  function markStorageSaved() {
    progressStorageFailed = false;
    updateStatus();
  }

  updateStatus();
  if (attempts.length && !localPreview) void flushAttempts();

  return { saveProgress, recordAttempt, retryNow, updateStatus, markStorageFailed, markStorageSaved };
}
