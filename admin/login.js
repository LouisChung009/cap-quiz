import { getClerk } from "../vendor/auth-runtime.js";
const mount = document.querySelector("#adminClerkMount"), message = document.querySelector("#message");
try { const clerk = await getClerk(); if (clerk.user) location.replace("./"); else clerk.mountSignIn(mount, { fallbackRedirectUrl: "/admin/" }); } catch (error) { message.textContent = error.message || "管理員登入暫時無法使用。"; }
