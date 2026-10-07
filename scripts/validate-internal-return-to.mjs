import assert from "node:assert/strict";
import { safeInternalReturnTo } from "../shared/internal-return-to.js";
import handler from "../api/auth/start.js";

const safePaths = ["/", "/index.html", "/account/login.html?returnTo=%2Fadmin%2F", "/path/to/page?subject=math#quiz"];
for (const path of safePaths) assert.equal(safeInternalReturnTo(path), path);

const unsafePaths = ["https://attacker.test", "//attacker.test/path", "/\\attacker.test", "\\\\attacker.test", " javascript:alert(1)", "\n//attacker.test", null, 4];
for (const path of unsafePaths) assert.equal(safeInternalReturnTo(path), "/", `unsafe redirect should fall back to app root: ${String(path)}`);

async function invoke(returnTo) {
  let statusCode;
  let body;
  const response = {
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return this; }
  };
  handler({ method: "POST", body: { flow: "login", returnTo } }, response);
  return { statusCode, body };
}

for (const path of ["//attacker.test", "/\\attacker.test", "https://attacker.test"]) {
  assert.equal((await invoke(path)).statusCode, 400, `auth start should reject unsafe returnTo: ${path}`);
}
assert.equal((await invoke("/account/login.html?next=1")).statusCode, 503, "valid local path should proceed to the configured auth-service check");
console.log("Internal return-path validation rejects external, protocol-relative, and backslash redirects.");
