import fs from "fs";
import crypto from "crypto";
import path from "path";

const html = fs.readFileSync("public/index.html", "utf8");
const refs = [...html.matchAll(/\/assets\/images\/[^"'?#\s>]+/g)].map((m) =>
  m[0].split("?")[0]
);
const counts = {};
for (const r of refs) counts[r] = (counts[r] || 0) + 1;
console.log("--- HTML path refs used >1 ---");
Object.entries(counts)
  .filter(([, c]) => c > 1)
  .sort((a, b) => b[1] - a[1])
  .forEach(([p, c]) => console.log(c, p));

function walk(d, a = []) {
  if (!fs.existsSync(d)) return a;
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (
      /\.(png|jpe?g|webp)$/i.test(n) &&
      !n.includes("pre-el") &&
      !n.startsWith("_") &&
      !n.includes("title-crop")
    )
      a.push(f);
  }
  return a;
}

const files = [
  ...walk("public/assets/images/home-hero"),
  ...walk("public/assets/images/services"),
  ...walk("public/assets/images/income-routes"),
  ...walk("public/assets/images/unique"),
  ...walk("public/assets/images/career-prep"),
].filter((f) => !f.includes("support-bak") && !f.includes("-pool"));

const byHash = {};
for (const f of files) {
  const buf = fs.readFileSync(f);
  const h = crypto.createHash("md5").update(buf).digest("hex");
  (byHash[h] || (byHash[h] = [])).push(f.replace(/\\/g, "/"));
}
console.log("\n--- identical file hashes ---");
for (const a of Object.values(byHash)) {
  if (a.length > 1) console.log(a.join("\n  "));
}

// Show key section image wiring
const markers = [
  "hero-proof-",
  "hero_layer_",
  "hero-steps-",
  "income-routes/support/",
  "services/",
];
console.log("\n--- section refs ---");
for (const m of markers) {
  const hits = [...new Set(refs.filter((r) => r.includes(m)))];
  console.log(m, hits.length, hits.slice(0, 12).join(", "));
}
