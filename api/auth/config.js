export default function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ message: "Method not allowed" });
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return response.status(503).json({ message: "Authentication is not configured" });
  return response.status(200).json({ publishableKey });
}
