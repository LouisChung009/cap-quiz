import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const allowedRoots = new Set(["account", "admin", "assets", "data", "shared", "vendor"]);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp"
};

const server = createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/admin/dashboard" && request.method === "GET") {
      const url = new URL(request.url, "http://localhost");
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const query = (url.searchParams.get("q") || "").trim().toLowerCase();
      const allStudents = Array.from({ length: 235 }, (_, index) => {
        const sequence = index + 1;
        return {
          user_id: `user_test_${String(sequence).padStart(3, "0")}`,
          public_code: `S-${String(sequence).padStart(5, "0")}`,
          display_name: `測試學生 ${String(sequence).padStart(3, "0")}`,
          answered_count: sequence % 3,
          correct_count: sequence % 3,
          accuracy_base: sequence % 3,
          total_count: sequence * 2,
          streak: sequence % 8,
          weakest_points: [],
          last_activity_at: null
        };
      });
      const filtered = query ? allStudents.filter(student => `${student.display_name} ${student.public_code}`.toLowerCase().includes(query)) : allStudents;
      const pageSize = 100;
      const pageStudents = filtered.slice((page - 1) * pageSize, page * pageSize);
      const totalPages = Math.ceil(filtered.length / pageSize);
      const body = {
        summary: { student_count: 235, active_count: 0, answered_count: 0, accuracy: 0 },
        students: pageStudents,
        subjects: [],
        trend: [],
        alerts: { inactive_3d: 235, low_accuracy: 0, many_wrong: 0 },
        pagination: { page, pageSize, totalCount: filtered.length, totalPages, query: url.searchParams.get("q") || "" },
        generatedAt: new Date().toISOString()
      };
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(body));
      return;
    }
    response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" }).end('{"message":"Local E2E preview"}');
    return;
  }
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const rootName = relative.split(/[\\/]/, 1)[0];
  if (relative.startsWith(".") || (rootName !== "index.html" && !allowedRoots.has(rootName) && !["app.js", "bootstrap.js", "icon.svg", "manifest.webmanifest", "privacy.html", "question-validation.js", "styles.css", "sw.js", "terms.html", "help.html"].includes(rootName))) {
    response.writeHead(404).end();
    return;
  }
  const filePath = resolve(root, relative);
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const metadata = await stat(filePath);
    if (!metadata.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": metadata.size,
      "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(4187, "127.0.0.1", () => console.log("CAP-Quiz isolated E2E preview listening on http://127.0.0.1:4187"));
