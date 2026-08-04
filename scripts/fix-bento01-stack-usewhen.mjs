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
<svg width="1288" height="722" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c2a44"/>
      <stop offset="100%" stop-color="#243a52"/>
    </linearGradient>
  </defs>
  <rect width="1288" height="722" rx="28" fill="url(#bg)"/>

  <rect x="64" y="40" width="72" height="72" rx="16" fill="#243552"/>
  <path d="M100 62c-11 0-20 9-20 20 0 8 4 14 10 17v8h20v-8c6-3 10-9 10-17 0-11-9-20-20-20z"
    fill="none" stroke="#5eead4" stroke-width="3"/>
  <line x1="90" y1="115" x2="110" y2="115" stroke="#5eead4" stroke-width="3" stroke-linecap="round"/>

  <text x="160" y="76" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="42" font-weight="600" fill="#F2F6FB">${esc("Add knowledge")}</text>
  <text x="160" y="116" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="26" fill="#A8BBCC">${esc(
      "Would you like Elitechnexus to remember this?"
    )}</text>

  <text x="64" y="168" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="22" fill="#6583A4">${esc("Use when")}</text>
  <rect x="64" y="184" width="980" height="52" rx="12" fill="#32486C"/>
  <text x="84" y="218" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="22" fill="#D3E3F6">${esc("When working in the backend repo")}</text>
  <rect x="1060" y="184" width="52" height="52" rx="12" fill="#243552"/>
  <text x="1075" y="219" font-size="28" fill="#fff">×</text>
  <rect x="1128" y="184" width="52" height="52" rx="12" fill="#5EEAD4"/>
  <text x="1143" y="219" font-size="28" fill="#0B1A2E">✓</text>

  <rect x="48" y="260" width="1192" height="410" rx="28" fill="#152338" opacity="0.92"/>
  <g font-family="Consolas, 'Courier New', monospace" font-size="28" fill="#5EEAD4">
    <text x="100" y="340">${esc("- The repo is cloned in ~/my_project_backend")}</text>
    <text x="100" y="410">${esc("- The main branch name is 'master'")}</text>
    <text x="100" y="480">${esc("- Run poetry install before you start")}</text>
    <text x="100" y="550">${esc("- Run ./lint.sh to check lint before making commits")}</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(1288, 722)
  .png()
  .toFile("public/assets/images/bento01.png");
console.log("wrote bento01");

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
  for (const name of [
    "bento01.png",
    "card01.png",
    "card02-line.png",
    "card03-line.png",
  ]) {
    h = h.replace(
      new RegExp(`(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
      `$1?v=25`
    );
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log("cache", f);
  }
}
