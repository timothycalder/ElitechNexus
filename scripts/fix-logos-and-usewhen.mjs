/**
 * 1) Card decorations: only Elitechnexus EL (from transparent backups)
 * 2) bento01 desktop: bake "Use when" row into image; hide HTML overlay to stop overlap
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const BACKUP = "public/assets/images/_backup-devin-mockups";
const OUT = "public/assets/images";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const CACHE = 24;
const TILE = [32, 45, 69];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function makeEl(size) {
  return sharp(fs.readFileSync(LOGO))
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function loadRaw(file) {
  return sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

function fillRect(data, W, H, x0, y0, x1, y1, [r, g, b]) {
  x0 = Math.max(0, x0 | 0);
  y0 = Math.max(0, y0 | 0);
  x1 = Math.min(W - 1, x1 | 0);
  y1 = Math.min(H - 1, y1 | 0);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
}

/** Find logo tile center from bright glyph pixels */
async function findLogoCenter(file) {
  const { data, info } = await loadRaw(file);
  const W = info.width,
    H = info.height;
  let minX = W,
    minY = H,
    maxX = 0,
    maxY = 0,
    n = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (data[i + 3] < 180) continue;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (lum < 110) continue;
      n++;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (!n) return null;
  return {
    cx: Math.round((minX + maxX) / 2),
    cy: Math.round((minY + maxY) / 2),
  };
}

async function rebuildCard(name) {
  const src = path.join(BACKUP, name);
  const center = await findLogoCenter(src);
  console.log(name, "logo center", center);
  const { data, info } = await loadRaw(src);
  const W = info.width,
    H = info.height;

  if (center) {
    const tileSize = 48;
    const half = Math.ceil(tileSize / 2) + 4;
    // Wipe old logo glyph inside tile, keep plate
    for (let y = center.cy - half; y <= center.cy + half; y++) {
      for (let x = center.cx - half; x <= center.cx + half; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = (y * W + x) * 4;
        if (data[i + 3] < 40) continue;
        const dx = Math.abs(x - center.cx);
        const dy = Math.abs(y - center.cy);
        if (Math.max(dx, dy) < tileSize / 2 - 1) {
          data[i] = TILE[0];
          data[i + 1] = TILE[1];
          data[i + 2] = TILE[2];
          data[i + 3] = 255;
        }
      }
    }
  }

  let base = await sharp(Buffer.from(data), {
    raw: { width: W, height: H, channels: 4 },
  })
    .png()
    .toBuffer();

  if (center) {
    const elSize = 34;
    const icon = await makeEl(elSize);
    base = await sharp(base)
      .composite([
        {
          input: icon,
          left: Math.round(center.cx - elSize / 2),
          top: Math.round(center.cy - elSize / 2),
        },
      ])
      .png()
      .toBuffer();
  }

  await sharp(base).toFile(path.join(OUT, name));
  console.log("wrote", name);
}

async function rebuildBento01Desktop() {
  // Bake Use-when row INTO image so HTML overlay is not needed (no overlap)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1288" height="722" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c2a44"/>
      <stop offset="100%" stop-color="#243a52"/>
    </linearGradient>
  </defs>
  <rect width="1288" height="722" rx="28" fill="url(#bg)"/>

  <rect x="64" y="48" width="72" height="72" rx="16" fill="#243552"/>
  <path d="M100 70c-11 0-20 9-20 20 0 8 4 14 10 17v8h20v-8c6-3 10-9 10-17 0-11-9-20-20-20z"
    fill="none" stroke="#5eead4" stroke-width="3"/>
  <line x1="90" y1="123" x2="110" y2="123" stroke="#5eead4" stroke-width="3" stroke-linecap="round"/>

  <text x="160" y="84" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="42" font-weight="600" fill="#F2F6FB">${esc("Add knowledge")}</text>
  <text x="160" y="124" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="26" fill="#A8BBCC">${esc(
      "Would you like Elitechnexus to remember this?"
    )}</text>

  <!-- Use when row — ABOVE the list, single line, no duplicate -->
  <text x="64" y="188" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="22" fill="#6583A4">${esc("Use when")}</text>
  <rect x="200" y="160" width="820" height="48" rx="12" fill="#32486C"/>
  <text x="220" y="192" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="22" fill="#D3E3F6">${esc("When working in the backend repo")}</text>
  <rect x="1040" y="160" width="48" height="48" rx="12" fill="#243552"/>
  <text x="1054" y="193" font-size="26" fill="#fff">×</text>
  <rect x="1104" y="160" width="48" height="48" rx="12" fill="#5EEAD4"/>
  <text x="1118" y="193" font-size="26" fill="#0B1A2E">✓</text>

  <rect x="48" y="240" width="1192" height="430" rx="28" fill="#152338" opacity="0.92"/>
  <g font-family="Consolas, 'Courier New', monospace" font-size="28" fill="#5EEAD4">
    <text x="100" y="320">${esc("- The repo is cloned in ~/my_project_backend")}</text>
    <text x="100" y="390">${esc("- The main branch name is 'master'")}</text>
    <text x="100" y="460">${esc("- Run poetry install before you start")}</text>
    <text x="100" y="530">${esc("- Run ./lint.sh to check lint before making commits")}</text>
  </g>
</svg>`;

  await sharp(Buffer.from(svg)).resize(1288, 722).png().toFile(path.join(OUT, "bento01.png"));
  console.log("wrote bento01.png with baked Use-when row");
}

await rebuildCard("card01.png");
await rebuildCard("card02-line.png");
await rebuildCard("card03-line.png");
await rebuildBento01Desktop();

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

const CSS_ID = "elitechnexus-bento01-overlay-css";
const CSS = `<style id="${CSS_ID}">
/* Image now includes Use-when row — hide HTML overlay to prevent double text */
#home-bento__item-01-visual-wrapper {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>`;

const names = ["card01.png", "card02-line.png", "card03-line.png", "bento01.png"];

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const name of names) {
    h = h.replace(
      new RegExp(`(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
      `$1?v=${CACHE}`
    );
  }
  if (h.includes(`id="${CSS_ID}"`)) {
    h = h.replace(new RegExp(`<style id="${CSS_ID}">[\\s\\S]*?</style>`), CSS);
  } else if (h.includes("</head>")) {
    h = h.replace("</head>", `${CSS}</head>`);
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log("updated", f);
  }
}
