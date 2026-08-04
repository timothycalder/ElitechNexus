/**
 * Fix bento-mobile03 only: title + Shell molecule → EL
 * (Desktop bento03 already correct)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = "public/assets/images";
const BACKUP = "public/assets/images/_backup-devin-mockups";
const LOGO = "public/assets/images/elitechnexus-logo.svg";

function sampleBg(data, W, C, x0, y0, x1, y1) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || y < 0 || x >= W) continue;
      const i = (y * W + x) * C;
      const L = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (L > 80) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (!n) return { r: 30, g: 40, b: 60, alpha: 255 };
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
    alpha: 255,
  };
}

async function paintRect(buf, left, top, width, height, color) {
  const patch = await sharp({
    create: { width, height, channels: 4, background: color },
  })
    .png()
    .toBuffer();
  return sharp(buf)
    .composite([{ input: patch, left, top }])
    .png()
    .toBuffer();
}

async function makeEl(w, h) {
  return sharp(fs.readFileSync(LOGO))
    .resize(w, h, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function titleOverlay(text, w, h, fontSize, fill) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="${Math.round(fontSize * 0.85)}"
    font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="${fontSize}" font-weight="500"
    fill="${fill}">${text}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

const bak = path.join(BACKUP, "bento-mobile03.png");
const { data, info } = await sharp(bak)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const C = info.channels;
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const isTeal = (r, g, b) =>
  g > 140 && g > r + 20 && b > 100 && lum(r, g, b) > 120;

let buf = await sharp(bak).ensureAlpha().png().toBuffer();

// Title
const titlePts = [];
for (let y = 40; y < 90; y++) {
  for (let x = 30; x < 280; x++) {
    const i = (y * W + x) * C;
    if (lum(data[i], data[i + 1], data[i + 2]) > 140)
      titlePts.push({ x, y, r: data[i], g: data[i + 1], b: data[i + 2] });
  }
}
const tMinX = Math.min(...titlePts.map((p) => p.x));
const tMinY = Math.min(...titlePts.map((p) => p.y));
const tMaxX = Math.max(...titlePts.map((p) => p.x));
const tMaxY = Math.max(...titlePts.map((p) => p.y));
console.log("title", { tMinX, tMinY, tMaxX, tMaxY });
const titleBg = sampleBg(data, W, C, 20, 30, 60, 45);
buf = await paintRect(
  buf,
  Math.max(0, tMinX - 6),
  Math.max(0, tMinY - 4),
  tMaxX - tMinX + 20,
  tMaxY - tMinY + 12,
  titleBg
);
let tr = 0,
  tg = 0,
  tb = 0;
for (const p of titlePts) {
  tr += p.r;
  tg += p.g;
  tb += p.b;
}
const fill = `rgb(${Math.round(tr / titlePts.length)},${Math.round(tg / titlePts.length)},${Math.round(tb / titlePts.length)})`;
const fontSize = Math.max(14, tMaxY - tMinY + 2);
const title = await titleOverlay(
  "Elitechnexus Workspace",
  260,
  tMaxY - tMinY + 14,
  fontSize,
  fill
);
buf = await sharp(buf)
  .composite([{ input: title, left: tMinX - 2, top: tMinY - 1 }])
  .png()
  .toBuffer();

// Shell molecule: leftmost teal in Shell row only (y ~150-185, x < 90)
const iconPts = [];
for (let y = 148; y <= 190; y++) {
  for (let x = 30; x <= 85; x++) {
    const i = (y * W + x) * C;
    if (isTeal(data[i], data[i + 1], data[i + 2])) iconPts.push({ x, y });
  }
}
console.log("icon pts", iconPts.length);
if (iconPts.length > 20) {
  const ix0 = Math.min(...iconPts.map((p) => p.x)) - 3;
  const iy0 = Math.min(...iconPts.map((p) => p.y)) - 3;
  const ix1 = Math.max(...iconPts.map((p) => p.x)) + 3;
  const iy1 = Math.max(...iconPts.map((p) => p.y)) + 3;
  // Cap width so we don't eat into Shell "S" — look for gap
  const hist = new Array(W).fill(0);
  for (const p of iconPts) hist[p.x]++;
  let iconMaxX = ix0;
  let gap = 0;
  for (let x = ix0; x <= ix1 + 10; x++) {
    if (hist[x] === 0) {
      gap++;
      if (gap >= 3 && iconMaxX > ix0 + 10) break;
    } else {
      gap = 0;
      iconMaxX = x;
    }
  }
  const iconLeft = Math.max(0, ix0);
  const iconTop = Math.max(0, iy0);
  const iconW = Math.min(40, iconMaxX - iconLeft + 4);
  const iconH = iy1 - iconTop;
  console.log("icon box", { iconLeft, iconTop, iconW, iconH, iconMaxX });
  const iconBg = sampleBg(data, W, C, 20, 140, 35, 150);
  buf = await paintRect(buf, iconLeft, iconTop, iconW, iconH, iconBg);
  const elW = Math.min(28, iconW - 2);
  const elH = Math.min(20, iconH - 2);
  const el = await makeEl(elW, elH);
  buf = await sharp(buf)
    .composite([
      {
        input: el,
        left: iconLeft + Math.round((iconW - elW) / 2),
        top: iconTop + Math.round((iconH - elH) / 2),
      },
    ])
    .png()
    .toBuffer();
}

// Also replace "Use Devin's Machine" if present (mint panel text)
const { data: d2, info: i2 } = await sharp(
  path.join(BACKUP, "bento-mobile03.png")
)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
// Find dark text on teal panel — look for very dark pixels in teal region
// Skip if regen already handled on a different asset; check live backup phrase area
await sharp(buf)
  .extract({ left: 20, top: 40, width: 350, height: 160 })
  .png()
  .toFile("scripts/_mob-verify.png");

await sharp(buf).toFile(path.join(OUT, "bento-mobile03.png"));
console.log("wrote bento-mobile03.png");
