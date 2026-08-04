/**
 * Rebuild bento feature cards with clean, structured Elitechnexus typography.
 * Uses original Devin mockups as compositional reference / gradient base where helpful,
 * but redraws text regions so long brand name never overlaps.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const BACKUP = "public/assets/images/_backup-devin-mockups";
const OUT = "public/assets/images";
const LOGO = "public/assets/images/elitechnexus-logo-transparent.png";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function writePng(file, buf) {
  await fs.promises.writeFile(file, buf);
  console.log("wrote", file);
}

/** Phone greeting card — desktop bento02 */
async function makeBento02() {
  const w = 638;
  const h = 892;
  const base = await sharp(path.join(BACKUP, "bento02.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  // Cover original greeting + placeholder text with matching dark panels
  const overlays = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1a2e"/>
      <stop offset="55%" stop-color="#0d2438"/>
      <stop offset="100%" stop-color="#123a48"/>
    </linearGradient>
  </defs>
  <!-- cover main text block -->
  <rect x="28" y="150" width="580" height="280" rx="8" fill="url(#bgFade)" opacity="0.98"/>
  <!-- cover input placeholder area inside card -->
  <rect x="48" y="700" width="540" height="90" rx="12" fill="#0a1520"/>
</svg>`;

  const textSvg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .hi { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 600; font-size: 34px; fill: #ffffff; }
    .brand { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 700; font-size: 34px; fill: #5eead4; }
    .rest { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 600; font-size: 34px; fill: #ffffff; }
    .sub { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; font-size: 18px; fill: #9fb3c8; }
    .ph { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; font-size: 18px; fill: #6b849c; }
  </style>
  <!-- Structured 3-line greeting — no overlap -->
  <text x="52" y="210" class="hi">${esc("Hey there!")}</text>
  <text x="52" y="258" class="hi">${esc("I'm ")}<tspan class="brand">${esc("Elitechnexus")}</tspan></text>
  <text x="52" y="306" class="rest">${esc("and I'm a software engineer.")}</text>
  <text x="52" y="360" class="sub">${esc("Enter a coding task below to get started.")}</text>
  <text x="72" y="748" class="ph">${esc("Give Elitechnexus a task to work on...")}</text>
</svg>`;

  const out = await sharp(base)
    .composite([
      { input: Buffer.from(overlays), top: 0, left: 0 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await writePng(path.join(OUT, "bento02.png"), out);
}

/** Mobile phone greeting — bento-mobile02 */
async function makeBentoMobile02() {
  const w = 554;
  const h = 540;
  const base = await sharp(path.join(BACKUP, "bento-mobile02.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const overlays = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1a2e"/>
      <stop offset="60%" stop-color="#0e2838"/>
      <stop offset="100%" stop-color="#134048"/>
    </linearGradient>
  </defs>
  <rect x="20" y="90" width="510" height="230" rx="8" fill="url(#bgFade)" opacity="0.98"/>
  <rect x="36" y="400" width="480" height="70" rx="12" fill="#0a1520"/>
</svg>`;

  const textSvg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .hi { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 600; font-size: 28px; fill: #ffffff; }
    .brand { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 700; font-size: 28px; fill: #5eead4; }
    .sub { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; font-size: 15px; fill: #9fb3c8; }
    .ph { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; font-size: 15px; fill: #6b849c; }
  </style>
  <text x="44" y="140" class="hi">${esc("Hey there!")}</text>
  <text x="44" y="180" class="hi">${esc("I'm ")}<tspan class="brand">${esc("Elitechnexus")}</tspan></text>
  <text x="44" y="220" class="hi">${esc("and I'm a software engineer.")}</text>
  <text x="44" y="268" class="sub">${esc("Enter a coding task below to get started.")}</text>
  <text x="56" y="440" class="ph">${esc("Give Elitechnexus a task...")}</text>
</svg>`;

  const out = await sharp(base)
    .composite([
      { input: Buffer.from(overlays), top: 0, left: 0 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await writePng(path.join(OUT, "bento-mobile02.png"), out);
}

/** Add knowledge card — bento01 */
async function makeBento01() {
  const w = 1288;
  const h = 722;
  const base = await sharp(path.join(BACKUP, "bento01.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  // Cover only the subtitle line that says Devin
  const overlays = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="140" y="95" width="900" height="55" rx="6" fill="#13263a"/>
</svg>`;

  const textSvg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .sub { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; font-size: 28px; fill: #b7c7d6; }
  </style>
  <text x="155" y="132" class="sub">${esc("Would you like Elitechnexus to remember this?")}</text>
</svg>`;

  const out = await sharp(base)
    .composite([
      { input: Buffer.from(overlays), top: 0, left: 0 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await writePng(path.join(OUT, "bento01.png"), out);
}

/** Mobile add knowledge */
async function makeBentoMobile01() {
  const w = 612;
  const h = 590;
  const base = await sharp(path.join(BACKUP, "bento-mobile01.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const overlays = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="90" y="58" width="500" height="70" rx="6" fill="#15293c"/>
</svg>`;

  const textSvg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .sub { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 400; font-size: 20px; fill: #b7c7d6; }
  </style>
  <text x="100" y="85" class="sub">${esc("Would you like Elitechnexus")}</text>
  <text x="100" y="112" class="sub">${esc("to remember this?")}</text>
</svg>`;

  const out = await sharp(base)
    .composite([
      { input: Buffer.from(overlays), top: 0, left: 0 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await writePng(path.join(OUT, "bento-mobile01.png"), out);
}

/** Workspace card — bento03 */
async function makeBento03() {
  const w = 1288;
  const h = 628;
  const base = await sharp(path.join(BACKUP, "bento03.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const logo = await sharp(LOGO)
    .resize(36, 36, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Cover title + shell icon area
  const overlays = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="28" width="520" height="50" rx="6" fill="#12263a"/>
  <rect x="48" y="95" width="42" height="42" rx="8" fill="#163047"/>
</svg>`;

  const textSvg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 600; font-size: 32px; fill: #ffffff; }
  </style>
  <text x="55" y="62" class="title">${esc("Elitechnexus Workspace")}</text>
</svg>`;

  const out = await sharp(base)
    .composite([
      { input: Buffer.from(overlays), top: 0, left: 0 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
      { input: logo, top: 98, left: 51 },
    ])
    .png()
    .toBuffer();

  await writePng(path.join(OUT, "bento03.png"), out);
}

/** Mobile workspace */
async function makeBentoMobile03() {
  const w = 610;
  const h = 494;
  const base = await sharp(path.join(BACKUP, "bento-mobile03.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const overlays = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="24" y="18" width="420" height="44" rx="6" fill="#12263a"/>
  <!-- cover dropdown first item Devin text -->
  <rect x="80" y="78" width="360" height="48" rx="8" fill="#6ee7b7"/>
</svg>`;

  const textSvg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 600; font-size: 24px; fill: #ffffff; }
    .item { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 600; font-size: 18px; fill: #0b1a2e; }
  </style>
  <text x="36" y="48" class="title">${esc("Elitechnexus Workspace")}</text>
  <text x="100" y="108" class="item">${esc("Use Elitechnexus Machine")}</text>
</svg>`;

  const out = await sharp(base)
    .composite([
      { input: Buffer.from(overlays), top: 0, left: 0 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await writePng(path.join(OUT, "bento-mobile03.png"), out);
}

/** Hover menu */
async function makeBentoHover03() {
  const w = 1288;
  const h = 628;
  const base = await sharp(path.join(BACKUP, "bento-hover03.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const overlays = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="380" y="160" width="520" height="70" rx="10" fill="#6ee7b7"/>
</svg>`;

  const textSvg = `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .item { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 700; font-size: 28px; fill: #0b1a2e; }
  </style>
  <text x="430" y="205" class="item">${esc("Use Elitechnexus Machine")}</text>
</svg>`;

  const out = await sharp(base)
    .composite([
      { input: Buffer.from(overlays), top: 0, left: 0 },
      { input: Buffer.from(textSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await writePng(path.join(OUT, "bento-hover03.png"), out);
}

await makeBento02();
await makeBentoMobile02();
await makeBento01();
await makeBentoMobile01();
await makeBento03();
await makeBentoMobile03();
await makeBentoHover03();

// cache bust bump to v=9 for bento assets in HTML
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
    const re = new RegExp(
      `(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`,
      "g"
    );
    html = html.replace(re, `$1?v=9`);
  }
  if (html !== before) {
    fs.writeFileSync(f, html);
    touched++;
  }
}
console.log("cache-bust files", touched);
