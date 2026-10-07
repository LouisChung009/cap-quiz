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
