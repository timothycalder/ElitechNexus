import fs from "fs";
import path from "path";

const h = fs.readFileSync("public/index.html", "utf8");

// Search for card titles from screenshot
for (const t of [
  "Migrate",
  "Price visualization",
  "auto-triage",
  "Lint warning",
  "Next.js",
  "Workspace",
  "hero-steps",
  "thumb",
]) {
  console.log(t, h.indexOf(t));
}

// Dump HTML around hero-steps references
let idx = 0;
let n = 0;
while ((idx = h.indexOf("hero-steps", idx)) >= 0 && n < 12) {
  console.log("\n#", n, h.slice(idx - 80, idx + 160).replace(/\s+/g, " "));
  idx++;
  n++;
}

// Check all images under assets for "Devin" in nearby html attributes
const imgs = [...h.matchAll(/\/assets\/images\/[a-zA-Z0-9_\-\/.]+/g)].map(
  (m) => m[0]
);
console.log("\nunique image count", new Set(imgs).size);
console.log(
  [...new Set(imgs)].filter((p) => /hero|step|card|slide|visual/i.test(p)).join("\n")
);
