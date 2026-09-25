import { authenticatedFetch, getClerk, requireUser } from "./vendor/auth-runtime.js";

const gate = document.querySelector("#authGate");
const app = document.querySelector(".app");

try {
  const user = await requireUser();
  if (user) {
    const clerk = await getClerk();
    clerk.mountUserButton(document.querySelector("#userButton"), { afterSignOutUrl: "/account/login.html" });
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
    await import("./app.js?v=5.4.0");
  }
} catch (error) {
  gate.innerHTML = `<div class="gate-card"><b>登入服務暫時無法使用</b><p>${String(error.message || error)}</p><a href="./account/login.html">重新登入</a></div>`;
}
