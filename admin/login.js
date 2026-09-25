const config = window.CAP_QUIZ_ADMIN_CONFIG || { mode: "demo" };
const form = document.querySelector("#loginForm");
const message = document.querySelector("#message");
const button = document.querySelector("#loginButton");

if (config.mode !== "vercel" || !config.authEndpoint) {
  message.textContent = "此站尚未連接 Vercel 的登入服務；可先開啟互動原型預覽。";
  button.disabled = true;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  button.disabled = true;
  message.textContent = "正在驗證管理員帳號…";
  try {
    const response = await fetch(config.authEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: document.querySelector("#email").value, password: document.querySelector("#password").value })
    });
    const session = await response.json();
    if (!response.ok || !session.accessToken) throw new Error(session.message || "登入失敗，請檢查帳號與密碼。");
    sessionStorage.setItem("capQuizAdminSession", JSON.stringify({ accessToken: session.accessToken, expiresAt: session.expiresAt }));
    location.replace("./");
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
  }
});
