import { Clerk } from "@clerk/clerk-js";
import { ui } from "@clerk/ui";

let clerkPromise;

export async function getClerk() {
  if (!clerkPromise) clerkPromise = initializeClerk();
  return clerkPromise;
}

async function initializeClerk() {
  const response = await fetch("/api/auth/config", { cache: "no-store" });
  if (!response.ok) throw new Error("登入服務尚未完成設定，請稍後再試。");
  const { publishableKey } = await response.json();
  if (!publishableKey) throw new Error("登入服務缺少公開金鑰。");
  const clerk = new Clerk(publishableKey);
  await clerk.load({ ui });
  window.CapQuizAuth = clerk;
  return clerk;
}

export async function requireUser() {
  const clerk = await getClerk();
  if (!clerk.user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    location.replace(`/account/login.html?returnTo=${returnTo}`);
    return null;
  }
  return clerk.user;
}

export async function authenticatedFetch(url, options = {}) {
  const clerk = await getClerk();
  const token = await clerk.session?.getToken();
  if (!token) throw new Error("登入狀態已失效，請重新登入。");
  return fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
}
