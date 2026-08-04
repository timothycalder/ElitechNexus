/**
 * Fully redraw bento phone + knowledge cards as clean SVG composites.
 * No overlay on old Devin pixels — eliminates ghost text.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = "public/assets/images";
const LOGO = "public/assets/images/elitechnexus-logo-transparent.png";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function raster(svg, w, h, file) {
  const buf = await sharp(Buffer.from(svg)).resize(w, h).png().toBuffer();
  await fs.promises.writeFile(file, buf);
  console.log("wrote", file);
}

async function makeBento02() {
  const w = 638;
  const h = 892;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="#071525"/>
      <stop offset="45%" stop-color="#0a2034"/>
      <stop offset="100%" stop-color="#0f3d4a"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <!-- subtle glow -->
  <circle cx="120" cy="760" r="220" fill="#1a6b78" opacity="0.35" filter="url(#soft)"/>

  <!-- status bar -->
  <text x="28" y="42" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="600" fill="#fff">9:41</text>
  <rect x="270" y="18" width="98" height="28" rx="14" fill="#000"/>
  <!-- signal / wifi / battery simplified -->
  <rect x="540" y="30" width="22" height="12" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
  <rect x="543" y="33" width="14" height="6" rx="1" fill="#fff"/>
  <rect x="562" y="33" width="2" height="6" rx="1" fill="#fff"/>
  <path d="M520 40c6-8 14-8 20 0" fill="none" stroke="#fff" stroke-width="1.6"/>
  <path d="M500 42c4-6 10-6 14 0" fill="none" stroke="#fff" stroke-width="1.6"/>

  <!-- greeting block — structured hierarchy -->
  <text x="48" y="210" font-family="Segoe UI, system-ui, sans-serif" font-size="36" font-weight="600" fill="#ffffff">${esc("Hey there!")}</text>
  <text x="48" y="262" font-family="Segoe UI, system-ui, sans-serif" font-size="36" font-weight="600" fill="#ffffff">${esc("I'm ")}<tspan fill="#5eead4" font-weight="700">${esc("Elitechnexus")}</tspan></text>
  <text x="48" y="314" font-family="Segoe UI, system-ui, sans-serif" font-size="34" font-weight="600" fill="#ffffff">${esc("and I'm a software engineer.")}</text>

  <text x="48" y="372" font-family="Segoe UI, system-ui, sans-serif" font-size="18" font-weight="400" fill="#93a9bd">${esc("Enter a coding task below to get started.")}</text>

  <!-- input card -->
  <rect x="36" y="700" width="566" height="120" rx="22" fill="#0a1624" stroke="#1c3348" stroke-width="1"/>
  <text x="60" y="755" font-family="Segoe UI, system-ui, sans-serif" font-size="18" font-weight="400" fill="#7b92a8">${esc("Give Elitechnexus a task to work on...")}</text>
  <line x1="60" y1="780" x2="576" y2="780" stroke="#1a2f42" stroke-width="1"/>
</svg>`;
  await raster(svg, w, h, path.join(OUT, "bento02.png"));
}

async function makeBentoMobile02() {
  const w = 554;
  const h = 540;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#071525"/>
      <stop offset="50%" stop-color="#0a2236"/>
      <stop offset="100%" stop-color="#0f3d4a"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="90" cy="480" r="180" fill="#1a6b78" opacity="0.28"/>

  <text x="24" y="36" font-family="Segoe UI, system-ui, sans-serif" font-size="14" font-weight="600" fill="#fff">9:41</text>
  <rect x="228" y="14" width="90" height="26" rx="13" fill="#000"/>
  <rect x="470" y="26" width="20" height="11" rx="2" fill="none" stroke="#fff" stroke-width="1.4"/>
  <rect x="473" y="28.5" width="12" height="6" rx="1" fill="#fff"/>

  <text x="40" y="130" font-family="Segoe UI, system-ui, sans-serif" font-size="30" font-weight="600" fill="#fff">${esc("Hey there!")}</text>
  <text x="40" y="174" font-family="Segoe UI, system-ui, sans-serif" font-size="30" font-weight="600" fill="#fff">${esc("I'm ")}<tspan fill="#5eead4" font-weight="700">${esc("Elitechnexus")}</tspan></text>
  <text x="40" y="218" font-family="Segoe UI, system-ui, sans-serif" font-size="28" font-weight="600" fill="#fff">${esc("and I'm a software engineer.")}</text>
  <text x="40" y="268" font-family="Segoe UI, system-ui, sans-serif" font-size="15" font-weight="400" fill="#93a9bd">${esc("Enter a coding task below to get started.")}</text>

  <rect x="28" y="400" width="498" height="88" rx="18" fill="#0a1624" stroke="#1c3348" stroke-width="1"/>
  <text x="48" y="450" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="400" fill="#7b92a8">${esc("Give Elitechnexus a task...")}</text>
</svg>`;
  await raster(svg, w, h, path.join(OUT, "bento-mobile02.png"));
}

async function makeBento01() {
  const w = 1288;
  const h = 722;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c1c30"/>
      <stop offset="100%" stop-color="#123a48"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>

  <!-- icon tile -->
  <rect x="64" y="72" width="72" height="72" rx="16" fill="#163247"/>
  <!-- lightbulb -->
  <path d="M100 92c-10 0-18 8-18 18 0 7 4 12 9 15v8h18v-8c5-3 9-8 9-15 0-10-8-18-18-18z" fill="none" stroke="#5eead4" stroke-width="3"/>
  <line x1="92" y1="141" x2="108" y2="141" stroke="#5eead4" stroke-width="3" stroke-linecap="round"/>

  <text x="160" y="108" font-family="Segoe UI, system-ui, sans-serif" font-size="42" font-weight="600" fill="#fff">${esc("Add knowledge")}</text>
  <text x="160" y="148" font-family="Segoe UI, system-ui, sans-serif" font-size="26" font-weight="400" fill="#a8bbcce">${esc("Would you like Elitechnexus to remember this?")}</text>

  <!-- knowledge list card -->
  <rect x="64" y="220" width="1160" height="420" rx="28" fill="#0d2436" opacity="0.85"/>
  <g font-family="Consolas, 'Courier New', monospace" font-size="30" fill="#5eead4">
    <text x="110" y="300">${esc("- The repo is cloned in ~/my_project_backend")}</text>
    <text x="110" y="370">${esc("- The main branch name is 'master'")}</text>
    <text x="110" y="440">${esc("- Run `poetry install` before you start")}</text>
    <text x="110" y="510">${esc("- Run ./lint.sh to check lint before making commits")}</text>
  </g>
</svg>`;
  // fix typo in fill color
  const fixed = svg.replace('fill="#a8bbcce"', 'fill="#a8bbcc"');
  await raster(fixed, w, h, path.join(OUT, "bento01.png"));
}

async function makeBentoMobile01() {
  const w = 612;
  const h = 590;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c1c30"/>
      <stop offset="100%" stop-color="#123a48"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>

  <rect x="36" y="36" width="52" height="52" rx="12" fill="#163247"/>
  <path d="M62 50c-7 0-12 5-12 12 0 5 3 8 6 10v6h12v-6c3-2 6-5 6-10 0-7-5-12-12-12z" fill="none" stroke="#5eead4" stroke-width="2.5"/>

  <text x="104" y="58" font-family="Segoe UI, system-ui, sans-serif" font-size="28" font-weight="600" fill="#fff">${esc("Add knowledge")}</text>
  <text x="104" y="88" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="400" fill="#a8bbcc">${esc("Would you like Elitechnexus")}</text>
  <text x="104" y="110" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="400" fill="#a8bbcc">${esc("to remember this?")}</text>

  <!-- input row -->
  <rect x="36" y="140" width="360" height="48" rx="10" fill="#0a1624" stroke="#1c3348"/>
  <text x="52" y="170" font-family="Segoe UI, system-ui, sans-serif" font-size="15" fill="#7b92a8">${esc("When working in the backend repo")}</text>
  <rect x="410" y="140" width="48" height="48" rx="10" fill="#163247"/>
  <text x="424" y="172" font-family="Segoe UI, system-ui, sans-serif" font-size="22" fill="#fff">×</text>
  <rect x="470" y="140" width="48" height="48" rx="10" fill="#5eead4"/>
  <text x="484" y="172" font-family="Segoe UI, system-ui, sans-serif" font-size="22" fill="#0b1a2e">✓</text>

  <rect x="36" y="220" width="540" height="320" rx="20" fill="#0d2436" opacity="0.9"/>
  <g font-family="Consolas, 'Courier New', monospace" font-size="16" fill="#5eead4">
    <text x="60" y="270">${esc("- The repo is cloned in")}</text>
    <text x="80" y="296">${esc("~/my_project_backend")}</text>
    <text x="60" y="340">${esc("- The main branch name is 'master'")}</text>
    <text x="60" y="384">${esc("- Run poetry install before you start")}</text>
    <text x="60" y="428">${esc("- Run ./lint.sh to check lint")}</text>
    <text x="80" y="454">${esc("before making commits")}</text>
  </g>
</svg>`;
  await raster(svg, w, h, path.join(OUT, "bento-mobile01.png"));
}

async function makeBento03() {
  const w = 1288;
  const h = 628;
  const logoBuf = await sharp(LOGO)
    .resize(40, 40, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1a2c"/>
      <stop offset="100%" stop-color="#0f3a48"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>

  <text x="64" y="70" font-family="Segoe UI, system-ui, sans-serif" font-size="34" font-weight="600" fill="#fff">${esc("Elitechnexus Workspace")}</text>
  <circle cx="1210" cy="58" r="22" fill="#5eead4"/>
  <text x="1198" y="65" font-family="Segoe UI, system-ui, sans-serif" font-size="22" font-weight="700" fill="#0b1a2e">···</text>

  <!-- tabs: tighter, even spacing -->
  <text x="118" y="130" font-family="Segoe UI, system-ui, sans-serif" font-size="24" font-weight="600" fill="#5eead4">${esc("Shell")}</text>
  <text x="230" y="130" font-family="Segoe UI, system-ui, sans-serif" font-size="24" font-weight="500" fill="#8aa0b5">${esc("Browser")}</text>
  <text x="370" y="130" font-family="Segoe UI, system-ui, sans-serif" font-size="24" font-weight="500" fill="#8aa0b5">${esc("Editor")}</text>
  <text x="490" y="130" font-family="Segoe UI, system-ui, sans-serif" font-size="24" font-weight="500" fill="#8aa0b5">${esc("Planner")}</text>

  <!-- terminal -->
  <rect x="64" y="170" width="1160" height="400" rx="24" fill="#081420" stroke="#1c3348" stroke-width="1"/>
  <g font-family="Consolas, 'Courier New', monospace" font-size="26" fill="#c8d6e4">
    <text x="100" y="240">${esc("KW: iterm-test (master*) $ git status")}</text>
    <text x="100" y="290">${esc("On branch master")}</text>
    <text x="100" y="340">${esc("Changes to be committed:")}</text>
    <text x="120" y="390" fill="#8aa0b5">${esc('(use "git reset HEAD <file> ..." to unstage)')}</text>
    <text x="140" y="450" fill="#5eead4">${esc("new file:   app/app.js")}</text>
  </g>
</svg>`;

  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  const out = await sharp(base)
    .composite([{ input: logoBuf, top: 106, left: 68 }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento03.png"), out);
  console.log("wrote", path.join(OUT, "bento03.png"));
}

async function makeBentoMobile03() {
  const w = 610;
  const h = 494;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1a2c"/>
      <stop offset="100%" stop-color="#0f3a48"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <text x="36" y="48" font-family="Segoe UI, system-ui, sans-serif" font-size="24" font-weight="600" fill="#fff">${esc("Elitechnexus Workspace")}</text>
  <circle cx="560" cy="40" r="18" fill="#5eead4"/>
  <text x="550" y="46" font-family="Segoe UI, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0b1a2e">···</text>

  <!-- dropdown -->
  <rect x="80" y="80" width="400" height="200" rx="16" fill="#12263a" stroke="#1c3348"/>
  <rect x="96" y="96" width="368" height="44" rx="10" fill="#5eead4"/>
  <text x="116" y="125" font-family="Segoe UI, system-ui, sans-serif" font-size="17" font-weight="700" fill="#0b1a2e">${esc("Use Elitechnexus Machine")}</text>
  <text x="116" y="175" font-family="Segoe UI, system-ui, sans-serif" font-size="17" fill="#d7e3ef">${esc("Create machine snapshot")}</text>
  <text x="116" y="215" font-family="Segoe UI, system-ui, sans-serif" font-size="17" fill="#d7e3ef">${esc("Toggle work view")}</text>
  <text x="116" y="255" font-family="Segoe UI, system-ui, sans-serif" font-size="17" fill="#d7e3ef">${esc("Expand workspace")}</text>

  <text x="36" y="330" font-family="Segoe UI, system-ui, sans-serif" font-size="18" font-weight="600" fill="#5eead4">${esc("Shell")}</text>
  <rect x="36" y="350" width="538" height="110" rx="16" fill="#081420" stroke="#1c3348"/>
  <text x="56" y="395" font-family="Consolas, monospace" font-size="14" fill="#c8d6e4">${esc("KW: iterm-test (master*) $ git status")}</text>
  <text x="56" y="425" font-family="Consolas, monospace" font-size="14" fill="#8aa0b5">${esc("On branch master")}</text>
</svg>`;
  await raster(svg, w, h, path.join(OUT, "bento-mobile03.png"));
}

async function makeBentoHover03() {
  const w = 1288;
  const h = 628;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#050b12"/>
  <rect x="360" y="170" width="560" height="280" rx="20" fill="#12263a" stroke="#1c3348"/>
  <rect x="384" y="194" width="512" height="56" rx="12" fill="#5eead4"/>
  <text x="430" y="230" font-family="Segoe UI, system-ui, sans-serif" font-size="26" font-weight="700" fill="#0b1a2e">${esc("Use Elitechnexus Machine")}</text>
  <text x="430" y="300" font-family="Segoe UI, system-ui, sans-serif" font-size="24" fill="#d7e3ef">${esc("Create machine snapshot")}</text>
  <text x="430" y="360" font-family="Segoe UI, system-ui, sans-serif" font-size="24" fill="#d7e3ef">${esc("Toggle work view")}</text>
  <circle cx="840" cy="352" r="14" fill="#5eead4"/>
  <text x="430" y="420" font-family="Segoe UI, system-ui, sans-serif" font-size="24" fill="#d7e3ef">${esc("Expand workspace")}</text>
  <circle cx="840" cy="412" r="14" fill="#5eead4"/>
</svg>`;
  await raster(svg, w, h, path.join(OUT, "bento-hover03.png"));
}

await makeBento02();
await makeBentoMobile02();
await makeBento01();
await makeBentoMobile01();
await makeBento03();
await makeBentoMobile03();
await makeBentoHover03();

// bump cache
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
const names = [
  "bento01.png",
  "bento02.png",
  "bento03.png",
  "bento-hover03.png",
  "bento-mobile01.png",
  "bento-mobile02.png",
  "bento-mobile03.png",
];
let touched = 0;
for (const f of walk("public")) {
  let html = fs.readFileSync(f, "utf8");
  const before = html;
  for (const name of names) {
    html = html.replace(
      new RegExp(`(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
      `$1?v=11`
    );
  }
  if (html !== before) {
    fs.writeFileSync(f, html);
    touched++;
  }
}
console.log("cache-bust", touched);
