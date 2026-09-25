import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

await build({
  entryPoints: ["client/auth-runtime.js"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: "vendor/auth-runtime.js",
  target: ["safari15"]
});

await rm("public", { recursive: true, force: true });
await mkdir("public", { recursive: true });
for (const entry of [
  "index.html", "app.js", "bootstrap.js", "styles.css", "sw.js",
  "manifest.webmanifest", "icon.svg", "privacy.html", "terms.html", "help.html",
  "account", "admin", "assets", "data", "vendor"
]) await cp(entry, `public/${entry}`, { recursive: true });
console.log("Static PWA copied to public/");
