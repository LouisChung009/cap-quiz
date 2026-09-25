export default function handler(request, response) {
  const authorization = request.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return response.status(401).json({ message: "需要管理員登入。" });
  }

  return response.status(503).json({
    message: "管理看板正在等待資料庫與登入服務連線。",
    setupRequired: ["DATABASE_URL", "管理員登入服務", "伺服器端權杖驗證"]
  });
}
