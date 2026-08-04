import fs from "fs";
import path from "path";

const h = fs.readFileSync("public/index.html", "utf8");
for (const s of [
  "Application development",
  "Bug & issue",
  "And many others",
  "Frontend bugs",
  "Unit and E2E",
  "Automated on-call",
  "Technical debt",
  "Building SaaS",
]) {
  const i = h.indexOf(s);
  console.log(s, i);
  if (i >= 0) console.log("  ctx:", h.slice(Math.max(0, i - 120), i + 80).replace(/\s+/g, " "));
}

// Find img tags near Frontend bugs
const i = h.indexOf("Frontend bugs");
console.log("\n--- around Frontend bugs ---");
console.log(h.slice(i - 800, i + 400));

// list all pngs in assets
function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) {
      if (n === "case-studies" || n === "home-hero" || n === "_backup-devin-mockups") continue;
      walk(f, a);
    } else if (/\.(png|webp|svg)$/i.test(n)) a.push(f.replace(/\\/g, "/"));
  }
  return a;
}
console.log("\nroot images:");
walk("public/assets/images").forEach((f) => console.log(f));
