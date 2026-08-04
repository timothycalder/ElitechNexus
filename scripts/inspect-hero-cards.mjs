import fs from "fs";
import path from "path";

const h = fs.readFileSync("public/index.html", "utf8");

// Find parallel cards / copy-end section
const markers = [
  "home-hero__copy-end",
  "home-hero__cards",
  "Migrate music",
  "tirelessly",
  "hero-steps",
  "home-hero__flow",
];
for (const m of markers) {
  console.log(m, h.indexOf(m));
}

const start = h.indexOf("home-hero__copy-end");
const alt = h.indexOf("tirelessly");
const from = start > 0 ? start - 500 : alt - 2000;
const chunk = h.slice(Math.max(0, from), from + 20000);
const imgs = [
  ...chunk.matchAll(/\/assets\/images\/[^"' )\s]+/g),
].map((m) => m[0]);
console.log("\nimages near section:");
console.log([...new Set(imgs)].join("\n"));

console.log("\nvisible text:");
console.log(
  chunk
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 1200)
);

// List home-hero folder
console.log("\nfiles:");
for (const f of fs.readdirSync("public/assets/images/home-hero")) {
  const st = fs.statSync(path.join("public/assets/images/home-hero", f));
  console.log(f, st.size);
}
