import fs from "fs";
import path from "path";
import sharp from "sharp";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="612" height="590" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c2a44"/>
      <stop offset="100%" stop-color="#243a52"/>
    </linearGradient>
  </defs>
  <rect width="612" height="590" rx="24" fill="url(#bg)"/>
  <rect x="36" y="32" width="52" height="52" rx="12" fill="#243552"/>
  <path d="M62 46c-7 0-12 5-12 12 0 5 3 8 6 10v6h12v-6c3-2 6-5 6-10 0-7-5-12-12-12z" fill="none" stroke="#5eead4" stroke-width="2.5"/>
  <line x1="56" y1="78" x2="68" y2="78" stroke="#5eead4" stroke-width="2.5" stroke-linecap="round"/>
  <text x="104" y="54" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="26" font-weight="600" fill="#F2F6FB">${esc("Add knowledge")}</text>
  <text x="104" y="82" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="16" fill="#A8BBCC">${esc("Would you like Elitechnexus")}</text>
  <text x="104" y="104" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="16" fill="#A8BBCC">${esc("to remember this?")}</text>
  <rect x="36" y="128" width="360" height="40" rx="10" fill="#32486C"/>
  <text x="52" y="154" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="14" fill="#D3E3F6">${esc("When working in the backend repo")}</text>
  <rect x="408" y="128" width="40" height="40" rx="10" fill="#243552"/>
  <text x="420" y="155" font-size="20" fill="#fff">×</text>
  <rect x="460" y="128" width="40" height="40" rx="10" fill="#5EEAD4"/>
  <text x="472" y="155" font-size="20" fill="#0B1A2E">✓</text>
  <rect x="36" y="190" width="540" height="360" rx="20" fill="#152338" opacity="0.92"/>
  <g font-family="Consolas, monospace" font-size="15" fill="#5EEAD4">
    <text x="56" y="240">${esc("- The repo is cloned in ~/my_project_backend")}</text>
    <text x="56" y="290">${esc("- The main branch name is 'master'")}</text>
    <text x="56" y="340">${esc("- Run poetry install before you start")}</text>
    <text x="56" y="390">${esc("- Run ./lint.sh to check lint before commits")}</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).resize(612, 590).png().toFile("public/assets/images/bento-mobile01.png");
console.log("wrote mobile");

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  h = h.replace(
    /(\/assets\/images\/bento01\.png)(?:\?v=\d+)?/g,
    "$1?v=23"
  );
  h = h.replace(
    /(\/assets\/images\/bento-mobile01\.png)(?:\?v=\d+)?/g,
    "$1?v=23"
  );
  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log("cache", f);
  }
}
