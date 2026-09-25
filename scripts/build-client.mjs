import { build } from "esbuild";
await build({ entryPoints: ["client/auth-runtime.js"], bundle: true, minify: true, format: "esm", outfile: "vendor/auth-runtime.js", target: ["safari15"] });
