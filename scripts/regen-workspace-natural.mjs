/**
 * Natural rebrand of workspace mockups from Devin backups.
 * Hard-erase old text with matched fills, then draw Elitechnexus (no stacked overlays).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const BACKUP = "public/assets/images/_backup-devin-mockups";
const OUT = "public/assets/images";
const CACHE = 21;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadRaw(file) {
  return sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

function fillRect(data, W, H, x0, y0, x1, y1, [r, g, b], { onlyOpaque = false } = {}) {
  x0 = Math.max(0, Math.floor(x0));
  y0 = Math.max(0, Math.floor(y0));
  x1 = Math.min(W - 1, Math.ceil(x1));
  y1 = Math.min(H - 1, Math.ceil(y1));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (onlyOpaque && data[i + 3] < 40) continue;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      if (!onlyOpaque) data[i + 3] = 255;
    }
  }
}

async function rawToPng(data, info) {
  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function drawTexts(w, h, texts) {
  const parts = texts
    .map(
      (t) => `<text x="${t.x}" y="${t.y}"
    font-family="Inter, Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="${t.size}" font-weight="${t.weight || 500}"
    fill="${t.fill}">${esc(t.text)}</text>`
    )
    .join("\n");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${parts}</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function writeComposite(baseBuf, overlayBuf, outPath) {
  await sharp(baseBuf)
    .composite([{ input: overlayBuf, top: 0, left: 0 }])
    .png()
    .toFile(outPath);
}

/** Find first (topmost) mint highlight band inside a search box. */
function findFirstMintBand(data, W, H, x0, y0, x1, y1) {
  const isMint = (i) => {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    if (a < 180) return false;
    return g > 190 && r > 60 && r < 160 && b > 140 && g > r + 40;
  };

  let firstY = -1;
  for (let y = y0; y <= y1; y++) {
    let c = 0;
    for (let x = x0; x <= x1; x++) if (isMint((y * W + x) * 4)) c++;
    if (c > 40) {
      firstY = y;
      break;
    }
  }
  if (firstY < 0) return null;

  let lastY = firstY;
  for (let y = firstY; y <= y1; y++) {
    let c = 0;
    for (let x = x0; x <= x1; x++) if (isMint((y * W + x) * 4)) c++;
    if (c < 30) break;
    lastY = y;
    // stop at first item (~one row)
    if (lastY - firstY > 75) break;
  }

  let minX = x1,
    maxX = x0;
  for (let y = firstY; y <= lastY; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isMint((y * W + x) * 4)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  return { minX, maxX, minY: firstY, maxY: lastY };
}

async function fixBento03() {
  const src = path.join(BACKUP, "bento03.png");
  const { data, info } = await loadRaw(src);
  const W = info.width,
    H = info.height;

  // Wipe original "Devin's Workspace"
  fillRect(data, W, H, 100, 85, 560, 125, [45, 59, 92]);

  const base = await rawToPng(data, info);
  const overlay = await drawTexts(W, H, [
    {
      x: 118,
      y: 116,
      size: 30,
      weight: 500,
      fill: "#B5D1EF",
      text: "Elitechnexus Workspace",
    },
  ]);
  await writeComposite(base, overlay, path.join(OUT, "bento03.png"));
  console.log("wrote bento03.png");
}

async function fixBentoHover03() {
  const src = path.join(BACKUP, "bento-hover03.png");
  const { data, info } = await loadRaw(src);
  const W = info.width,
    H = info.height;
  const GREEN = [107, 236, 205];

  const band = findFirstMintBand(data, W, H, 400, 160, 1100, 320);
  console.log("hover mint band", band);
  if (band) {
    // Hard fill the entire first mint row (covers Devin text completely)
    fillRect(
      data,
      W,
      H,
      band.minX + 6,
      band.minY + 4,
      band.maxX - 6,
      band.maxY - 4,
      GREEN,
      { onlyOpaque: true }
    );
  }

  const base = await rawToPng(data, info);
  const textY = band ? Math.round((band.minY + band.maxY) / 2 + 7) : 245;
  const textX = band ? band.minX + 36 : 505;
  const overlay = await drawTexts(W, H, [
    {
      x: textX,
      y: textY,
      size: 24,
      weight: 600,
      fill: "#0B1A2E",
      text: "Use Elitechnexus Machine",
    },
  ]);
  await writeComposite(base, overlay, path.join(OUT, "bento-hover03.png"));
  console.log("wrote bento-hover03.png");
}

async function fixBentoMobile03() {
  const src = path.join(BACKUP, "bento-mobile03.png");
  const { data, info } = await loadRaw(src);
  const W = info.width,
    H = info.height;
  const GREEN = [107, 236, 205];

  // Title
  fillRect(data, W, H, 30, 42, 380, 80, [47, 62, 94]);

  const band = findFirstMintBand(data, W, H, 30, 90, 560, 220);
  console.log("mobile mint band", band);
  if (band) {
    fillRect(
      data,
      W,
      H,
      band.minX + 4,
      band.minY + 3,
      Math.min(band.maxX - 4, band.minX + 420),
      band.maxY - 3,
      GREEN
    );
  }

  const base = await rawToPng(data, info);
  const texts = [
    {
      x: 40,
      y: 68,
      size: 22,
      weight: 500,
      fill: "#B5D1EF",
      text: "Elitechnexus Workspace",
    },
  ];
  if (band) {
    texts.push({
      x: band.minX + 28,
      y: Math.round((band.minY + band.maxY) / 2 + 6),
      size: 17,
      weight: 600,
      fill: "#0B1A2E",
      text: "Use Elitechnexus Machine",
    });
  }
  const overlay = await drawTexts(W, H, texts);
  await writeComposite(base, overlay, path.join(OUT, "bento-mobile03.png"));
  console.log("wrote bento-mobile03.png");
}

async function fixBento01() {
  const src = path.join(BACKUP, "bento01.png");
  const { data, info } = await loadRaw(src);
  const W = info.width,
    H = info.height;
  fillRect(data, W, H, 145, 145, 780, 185, [45, 59, 92]);

  const base = await rawToPng(data, info);
  const overlay = await drawTexts(W, H, [
    {
      x: 150,
      y: 172,
      size: 26,
      weight: 450,
      fill: "#C5D4E6",
      text: "Would you like Elitechnexus to remember this?",
    },
  ]);
  await writeComposite(base, overlay, path.join(OUT, "bento01.png"));
  console.log("wrote bento01.png");
}

async function fixBentoMobile01() {
  const src = path.join(BACKUP, "bento-mobile01.png");
  if (!fs.existsSync(src)) return;
  const { data, info } = await loadRaw(src);
  const W = info.width,
    H = info.height;
  fillRect(data, W, H, 80, 85, 560, 130, [45, 59, 92]);
  const base = await rawToPng(data, info);
  const overlay = await drawTexts(W, H, [
    {
      x: 90,
      y: 115,
      size: 17,
      weight: 450,
      fill: "#C5D4E6",
      text: "Would you like Elitechnexus to remember this?",
    },
  ]);
  await writeComposite(base, overlay, path.join(OUT, "bento-mobile01.png"));
  console.log("wrote bento-mobile01.png");
}

await fixBento03();
await fixBentoHover03();
await fixBentoMobile03();
await fixBento01();
await fixBentoMobile01();

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

const names = [
  "bento01.png",
  "bento03.png",
  "bento-hover03.png",
  "bento-mobile01.png",
  "bento-mobile03.png",
];
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const name of names) {
    h = h.replace(
      new RegExp(`(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
      `$1?v=${CACHE}`
    );
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log("cache", f);
  }
}
