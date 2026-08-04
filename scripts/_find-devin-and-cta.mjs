import fs from "fs";
import path from "path";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else a.push(f);
  }
  return a;
}

// Find Devin in HTML (excluding comments about "original Devin")
for (const f of walk("public").filter((x) => x.endsWith(".html"))) {
  const h = fs.readFileSync(f, "utf8");
  // strip style/script for text search of visible-ish content
  const matches = [...h.matchAll(/Devin|devin\.ai|cognition/gi)];
  if (!matches.length) continue;
  const unique = {};
  for (const m of matches) {
    const ctx = h.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, " ");
    unique[ctx] = (unique[ctx] || 0) + 1;
  }
  console.log("\nFILE", f, "count", matches.length);
  Object.keys(unique).slice(0, 8).forEach((c) => console.log(" ", c));
}

// Get started hrefs
console.log("\n=== Get started hrefs ===");
for (const f of walk("public").filter((x) => x.endsWith(".html"))) {
  const h = fs.readFileSync(f, "utf8");
  const re = /<a[^>]*>[\s\S]*?Get started[\s\S]*?<\/a>/gi;
  let m;
  while ((m = re.exec(h))) {
    const tag = m[0].replace(/\s+/g, " ").slice(0, 220);
    if (tag.includes("href=")) console.log(f, tag);
  }
  // also site-header__button-cta
  const cta = h.match(/id="site-header__button-cta"[^>]*/);
  if (cta) console.log(f, "CTA:", cta[0]);
  const foot = h.match(/id="site-footer__top-left-button"[^>]*/);
  if (foot) console.log(f, "FOOT:", foot[0]);
  const menu = h.match(/id="site-menu__btn-1"[^>]*/);
  if (menu) console.log(f, "MENU:", menu[0]);
}
