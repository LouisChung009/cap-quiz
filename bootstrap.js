import { authenticatedFetch, getClerk, requireUser } from "./vendor/auth-runtime.js";

const gate = document.querySelector("#authGate");
const app = document.querySelector(".app");
const localPreview = location.hostname === "localhost" || location.hostname === "127.0.0.1";

let authRedirectStarted = false;
const authRedirectTimer = window.setTimeout(() => {
  if (authRedirectStarted || !gate || !app) return;
  gate.innerHTML = `<div class="gate-card"><b>登入驗證時間較久</b><p>可以重新登入，或重試載入學習資料。</p><a href="./account/login.html">重新登入</a><button type="button" id="retryAuth">重試</button></div>`;
  document.querySelector("#retryAuth")?.addEventListener("click", () => location.reload());
}, 12000);
window.addEventListener("unhandledrejection", event => {
  if (!gate || gate.classList.contains("hidden")) return;
  clearTimeout(authRedirectTimer);
  gate.innerHTML = `<div class="gate-card"><b>登入驗證沒有完成</b><p>${String(event.reason?.message || "連線暫時中斷，請重新登入或重試。")}</p><a href="./account/login.html">重新登入</a><button type="button" id="retryAuth">重試</button></div>`;
  document.querySelector("#retryAuth")?.addEventListener("click", () => location.reload());
});
window.addEventListener("error", event => {
  if (!gate || gate.classList.contains("hidden")) return;
  clearTimeout(authRedirectTimer);
  gate.innerHTML = `<div class="gate-card"><b>登入頁面載入失敗</b><p>${String(event.message || "請檢查連線後重試。")}</p><a href="./account/login.html">重新登入</a><button type="button" id="retryAuth">重試</button></div>`;
  document.querySelector("#retryAuth")?.addEventListener("click", () => location.reload());
});

try {
  const user = localPreview ? { firstName: "本機預覽", username: "preview" } : await requireUser();
  if (localPreview) window.CapQuizPreviewAuth = true;
  authRedirectStarted = true;
  clearTimeout(authRedirectTimer);
  if (user) {
    if (!localPreview) {
      const clerk = await getClerk();
      clerk.mountUserButton(document.querySelector("#userButton"), { afterSignOutUrl: "/account/login.html" });
    }
    document.querySelector("#studentName").textContent = user.firstName || user.username || "學習者";
    try {
      const response = await authenticatedFetch("/api/progress", { cache: "no-store" });
      if (response.ok) {
        const cloud = await response.json();
        const local = JSON.parse(localStorage.getItem("capQuizV2") || "null");
        const localLatest = Math.max(0, ...(local?.history || []).map(item => Number(item.timestamp || item.ts || 0)));
        const cloudLatest = Math.max(0, ...(cloud.state?.history || []).map(item => Number(item.timestamp || item.ts || 0)));
        if (cloud.state && cloudLatest > localLatest) localStorage.setItem("capQuizV2", JSON.stringify(cloud.state));
      }
    } catch { /* Offline mode keeps the latest local copy. */ }
    gate.classList.add("hidden");
    app.classList.remove("auth-pending");
    const runtimeVersion = new URL(import.meta.url).searchParams.get("v");
    await import(`./app.js${runtimeVersion ? `?v=${encodeURIComponent(runtimeVersion)}` : ""}`);
  }
} catch (error) {
  clearTimeout(authRedirectTimer);
  gate.innerHTML = `<div class="gate-card"><b>登入服務暫時無法使用</b><p>${String(error.message || error)}</p><a href="./account/login.html">重新登入</a></div>`;
}
