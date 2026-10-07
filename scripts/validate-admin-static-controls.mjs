import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, "admin", "index.html"), "utf8");
const adminScript = await readFile(join(root, "admin", "admin.js"), "utf8");
const dashboardApi = await readFile(join(root, "api", "admin", "dashboard.js"), "utf8");
const section = html.match(/<section class="panel attention-actions"[\s\S]*?<\/section>/)?.[0];
if (!section) throw new Error("Admin intervention guidance section is missing");
if (/<button\b/i.test(section)) throw new Error("Admin intervention guidance contains a button without an implemented action");
const statusLabels = [...section.matchAll(/<span class="action-status">([^<]+)<\/span>/g)].map(match => match[1].trim());
if (statusLabels.length !== 3) throw new Error(`Expected 3 visible non-interactive status labels; found ${statusLabels.length}`);
for (const phrase of ["目前不會發送提醒", "目前不會建立任務", "複習排程尚未提供"]) {
  if (!statusLabels.some(label => label.includes(phrase))) throw new Error(`Missing transparent unavailable-state label: ${phrase}`);
}
for (const id of ["studentPagination", "studentPageSummary", "previousStudents", "nextStudents"]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing all-user pagination control: ${id}`);
}
if (!dashboardApi.includes("totalCount") || !dashboardApi.includes("rosterPageSize") || dashboardApi.includes("offset < 5000") || /LIMIT\s+500\b/.test(dashboardApi)) throw new Error("Admin dashboard does not page the complete Clerk roster");
if (!adminScript.includes("loadLiveDashboard(1,document.querySelector(\"#searchInput\").value.trim())")) throw new Error("Admin search does not query Clerk across all roster pages");
if (!adminScript.includes('location.hostname==="127.0.0.1"&&window.CapQuizAdminPreviewAuth===true')) throw new Error("Admin preview auth bypass is not restricted to the local E2E host");
console.log("Admin controls are transparent, and roster pagination covers the full Clerk count.");
