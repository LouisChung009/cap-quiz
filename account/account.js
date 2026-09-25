import { getClerk } from "../vendor/auth-runtime.js";

const mount = document.querySelector("#clerkMount");
const message = document.querySelector("[data-message]");
const flow = document.body.dataset.authFlow;
const returnTo = new URLSearchParams(location.search).get("returnTo") || "/";

try {
  const clerk = await getClerk();
  if (clerk.user) location.replace(returnTo);
  else if (flow === "register") clerk.mountSignUp(mount, { signInUrl: "/account/login.html", fallbackRedirectUrl: returnTo });
  else clerk.mountSignIn(mount, { signUpUrl: "/account/register.html", fallbackRedirectUrl: returnTo });
} catch (error) {
  message.textContent = error.message || "帳號服務暫時無法使用。";
}
