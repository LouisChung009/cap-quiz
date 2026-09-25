import { verifyToken } from "@clerk/backend";

function bearerToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
}

export async function requireAuth(request) {
  const token = bearerToken(request);
  if (!token || !process.env.CLERK_SECRET_KEY) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  try {
    return await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY, authorizedParties: (process.env.AUTHORIZED_PARTIES || "https://cap-quiz-orpin.vercel.app").split(",") });
  } catch {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
}

export async function requireAdmin(request) {
  const claims = await requireAuth(request);
  const admins = (process.env.ADMIN_USER_IDS || "").split(",").map(value => value.trim()).filter(Boolean);
  const role = claims.metadata?.role || claims.publicMetadata?.role;
  if (role !== "platform_admin" && !admins.includes(claims.sub)) throw Object.assign(new Error("Forbidden"), { status: 403 });
  return claims;
}

export function handleApiError(response, error) {
  const status = Number(error.status) || 500;
  if (status >= 500) console.error(error);
  return response.status(status).json({ message: status === 401 ? "請重新登入。" : status === 403 ? "沒有管理員權限。" : "服務暫時無法使用。" });
}
