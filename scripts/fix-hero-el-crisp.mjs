/**
 * hero_layer_2 Shell tab: fully erase Devin molecule, place complete crisp EL.
 */
import fs from "fs";
import sharp from "sharp";

const BAK = "public/assets/images/home-hero/hero_layer_2.pre-el.png";
const DEST = "public/assets/images/home-hero/hero_layer_2.png";
const V = 13;

fs.copyFileSync(BAK, DEST);

const { data, info } = await sharp(DEST).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;

function isMol(r, g, b, a) {
  return a > 140 && g > 130 && b > 100 && g > r + 12 && b > r + 3 && g + b > 260;
}

// Broader scan so we don't miss outer molecule dots
const pts = [];
for (let y = 78; y <= 128; y++) {
  for (let x = 78; x <= 130; x++) {
    const i = (y * W + x) * 4;
    if (isMol(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
  }
}

const hist = {};
for (const p of pts) {
  const k = `${Math.floor(p.x / 3)},${Math.floor(p.y / 3)}`;
  hist[k] = (hist[k] || 0) + 1;
}
let best = null,
  bestN = 0;
for (const [k, n] of Object.entries(hist)) {
  if (n > bestN) {
    bestN = n;
    best = k;
  }
}
const [bx, by] = best.split(",").map(Number);
const cx = bx * 3 + 1;
const cy = by * 3 + 1;

// Take ALL molecule pixels near center (radius large enough for full hex cluster)
const near = pts.filter((p) => Math.hypot(p.x - cx, p.y - cy) < 28);
let minX = Infinity,
  minY = Infinity,
  maxX = -Infinity,
  maxY = -Infinity;
for (const p of near) {
  minX = Math.min(minX, p.x);
  minY = Math.min(minY, p.y);
  maxX = Math.max(maxX, p.x);
  maxY = Math.max(maxY, p.y);
}

// Generous pad; hard-stop before Shell text (~x=128+)
minX = Math.max(0, minX - 6);
minY = Math.max(0, minY - 6);
maxX = Math.min(124, maxX + 6);
maxY = Math.min(info.height - 1, maxY + 6);
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
console.log("erase", { minX, minY, maxX, maxY, bw, bh, near: near.length });

// Average background from several samples left of icon
const samples = [
  [minX - 8, Math.floor((minY + maxY) / 2)],
  [minX - 4, minY - 2],
  [minX - 4, maxY + 2],
];
let sr = 0,
  sg = 0,
  sb = 0,
  sn = 0;
for (const [x, y] of samples) {
  const xx = Math.max(0, Math.min(W - 1, x));
  const yy = Math.max(0, Math.min(info.height - 1, y));
  const i = (yy * W + xx) * 4;
  sr += data[i];
  sg += data[i + 1];
  sb += data[i + 2];
  sn++;
}
const bg = { r: Math.round(sr / sn), g: Math.round(sg / sn), b: Math.round(sb / sn), alpha: 255 };

const cover = await sharp({
  create: { width: bw, height: bh, channels: 4, background: bg },
})
  .png()
  .toBuffer();

/**
 * Draw EL as raster via SVG — no skew (skew caused incomplete look at small sizes).
 * Slight italic via transform matrix instead, with padding in viewBox.
 * Color matches active Shell cyan.
 */
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="0 0 160 100">
  <defs>
    <linearGradient id="g" x1="0" y1="100" x2="160" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5EEAD4"/>
      <stop offset="0.5" stop-color="#7EF0E0"/>
      <stop offset="1" stop-color="#67E8F9"/>
    </linearGradient>
  </defs>
  <!-- padded, slightly italic EL — full letters visible -->
  <g transform="translate(18,12) skewX(-8)" fill="url(#g)">
    <rect x="0" y="0" width="48" height="12" rx="2.5"/>
    <rect x="0" y="28" width="40" height="12" rx="2.5"/>
    <rect x="0" y="56" width="48" height="12" rx="2.5"/>
    <rect x="62" y="0" width="14" height="68" rx="2.5"/>
    <rect x="62" y="56" width="48" height="12" rx="2.5"/>
  </g>
</svg>`;

const hi = await sharp(Buffer.from(iconSvg)).png().toBuffer();

// Target size: fill most of molecule slot while staying clear of Shell text
const targetW = Math.min(36, bw - 6);
const targetH = Math.round(targetW * (100 / 160));
const el = await sharp(hi)
  .resize(targetW, targetH, {
    fit: "contain",
    kernel: sharp.kernel.lanczos3,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const meta = await sharp(el).metadata();
const left = minX + Math.round((bw - meta.width) / 2);
const top = minY + Math.round((bh - meta.height) / 2);

const tmp = DEST + ".tmp.png";
await sharp(DEST)
  .composite([
    { input: cover, left: minX, top: minY },
    { input: el, left: Math.max(0, left), top: Math.max(0, top) },
  ])
  .png()
  .toFile(tmp);
fs.copyFileSync(tmp, DEST);
fs.unlinkSync(tmp);

await sharp(DEST)
  .extract({
    left: Math.max(0, minX - 8),
    top: Math.max(0, minY - 8),
    width: 180,
    height: 48,
  })
  .png()
  .toFile("public/assets/images/home-hero/_shell-el-preview.png");

// Also re-patch Planner on layer_1 with same technique
const BAK1 = "public/assets/images/home-hero/hero_layer_1.pre-el.png";
const DEST1 = "public/assets/images/home-hero/hero_layer_1.png";
if (fs.existsSync(BAK1)) {
  fs.copyFileSync(BAK1, DEST1);
  const raw1 = await sharp(DEST1).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const d1 = raw1.data;
  const W1 = raw1.info.width;
  const pts1 = [];
  for (let y = 78; y <= 128; y++) {
    for (let x = 560; x <= 640; x++) {
      const i = (y * W1 + x) * 4;
      if (isMol(d1[i], d1[i + 1], d1[i + 2], d1[i + 3])) pts1.push({ x, y });
    }
  }
  const hist1 = {};
  for (const p of pts1) {
    const k = `${Math.floor(p.x / 3)},${Math.floor(p.y / 3)}`;
    hist1[k] = (hist1[k] || 0) + 1;
  }
  let b1 = null,
    n1 = 0;
  for (const [k, n] of Object.entries(hist1)) {
    if (n > n1) {
      n1 = n;
      b1 = k;
    }
  }
  const [bx1, by1] = b1.split(",").map(Number);
  const cx1 = bx1 * 3 + 1;
  const cy1 = by1 * 3 + 1;
  const near1 = pts1.filter((p) => Math.hypot(p.x - cx1, p.y - cy1) < 28);
  let a = Infinity,
    b = Infinity,
    c = -Infinity,
    d = -Infinity;
  for (const p of near1) {
    a = Math.min(a, p.x);
    b = Math.min(b, p.y);
    c = Math.max(c, p.x);
    d = Math.max(d, p.y);
  }
  a = Math.max(0, a - 6);
  b = Math.max(0, b - 6);
  c = Math.min(W1 - 1, c + 6);
  d = Math.min(raw1.info.height - 1, d + 6);
  // don't cover Planner text — stop early if needed
  c = Math.min(c, a + 42);
  const bw1 = c - a + 1;
  const bh1 = d - b + 1;
  const si1 = (Math.floor((b + d) / 2) * W1 + Math.max(0, a - 6)) * 4;
  const bg1 = { r: d1[si1], g: d1[si1 + 1], b: d1[si1 + 2], alpha: 255 };
  const cover1 = await sharp({
    create: { width: bw1, height: bh1, channels: 4, background: bg1 },
  })
    .png()
    .toBuffer();
  const tw1 = Math.min(36, bw1 - 6);
  const th1 = Math.round(tw1 * (100 / 160));
  const el1 = await sharp(hi)
    .resize(tw1, th1, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const m1 = await sharp(el1).metadata();
  const l1 = a + Math.round((bw1 - m1.width) / 2);
  const t1 = b + Math.round((bh1 - m1.height) / 2);
  const tmp1 = DEST1 + ".tmp.png";
  await sharp(DEST1)
    .composite([
      { input: cover1, left: a, top: b },
      { input: el1, left: l1, top: t1 },
    ])
    .png()
    .toFile(tmp1);
  fs.copyFileSync(tmp1, DEST1);
  fs.unlinkSync(tmp1);
  console.log("layer1 planner ok", { a, b, bw1, bh1 });
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_2\.png(?:\?v=\d+)?/g, `hero_layer_2.png?v=${V}`);
html = html.replace(/hero_layer_1\.png(?:\?v=\d+)?/g, `hero_layer_1.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("done v=", V);
