import fs from "fs";
import path from "path";

const swaps = [
  [
    "Inquiries: steven.miller@elitechnexus.com | +1 (339) 365-7217",
    "Full-time jobs, paid projects, and global engineering talent — with proof first. Inquiries: steven.miller@elitechnexus.com | +1 (339) 365-7217",
  ],
  [
    "The most capable version of Elitechnexus, built on enterprise-grade security and privacy",
    "Enterprise-grade placement for full-time engineering roles and paid project teams — secure, private, and built on proof.",
  ],
  [
    "Industry leaders choose to</h5> <h2 id=\"customers-header__title\">Build with <span class=\"o-text-gradient\">Elitechnexus</span>",
    "Proof first. Opportunity next.</h5> <h2 id=\"customers-header__title\">Build careers and teams with <span class=\"o-text-gradient\">Elitechnexus</span>",
  ],
];

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

let files = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const [a, b] of swaps) {
    if (h.includes(a)) h = h.split(a).join(b);
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    files++;
    console.log("updated", f);
  }
}
console.log("files", files);
