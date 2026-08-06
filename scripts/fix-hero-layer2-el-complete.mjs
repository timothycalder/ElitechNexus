/**
 * Fix hero_layer_2 Shell-tab icon: complete, sharp Elitechnexus EL
 * (previous patch looked clipped / unfinished).
 */
import fs from "fs";
import sharp from "sharp";

const BAK = "public/assets/images/home-hero/hero_layer_2.pre-el.png";
const DEST = "public/assets/images/home-hero/hero_layer_2.png";
const V = 12;

fs.copyFileSync(BAK, DEST);

const { data, info } = await sharp(DEST).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

function isMol(r, g, b, a) {
  return a > 160 && g > 140 && b > 110 && g > r + 15 && b > r + 5 && g + b > 280;
}

// Shell tab icon — left of "Shell" label
const y0 = 75,
  y1 = 125,
  x0 = 75,
  x1 = 145;
const pts = [];
for (let y = y0; y <= y1; y++) {
  for (let x = x0; x <= x1; x++) {
    const i = (y * W + x) * 4;
    if (isMol(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
  }
}

const hist = {};
for (const p of pts) {
  const k = `${Math.floor(p.x / 4)},${Math.floor(p.y / 4)}`;
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
const cx = bx * 4 + 2;
const cy = by * 4 + 2;
const near = pts.filter((p) => Math.hypot(p.x - cx, p.y - cy) < 22);

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

// Cover full molecule footprint + small pad (don't eat into "Shell" text)
const pad = 5;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, Math.min(maxX + pad, 125)); // hard stop before Shell letters
maxY = Math.min(H - 1, maxY + pad);
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
console.log("cover", { minX, minY, bw, bh, pts: near.length });

const sx = Math.max(0, minX - 6);
const sy = Math.floor((minY + maxY) / 2);
const si = (sy * W + sx) * 4;
const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

const cover = await sharp({
  create: { width: bw, height: bh, channels: 4, background: bg },
})
  .png()
  .toBuffer();

/**
 * Compact EL icon SVG tuned for small UI chrome:
 * - tighter viewBox so full EL is visible
 * - solid bright cyan matching active Shell tab (~#7ef0e0)
 * - extra padding so letters aren't clipped
 */
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="64" height="40">
  <g transform="skewX(-10) translate(4,0)" fill="#7EF0E0">
    <!-- E -->
    <rect x="4" y="6" width="22" height="5.5" rx="1.2"/>
    <rect x="4" y="17" width="18" height="5.5" rx="1.2"/>
    <rect x="4" y="28" width="22" height="5.5" rx="1.2"/>
    <!-- L -->
    <rect x="30" y="6" width="6.5" height="27.5" rx="1.2"/>
    <rect x="30" y="28" width="22" height="5.5" rx="1.2"/>
  </g>
</svg>`;

// Render at 4× then downscale for crisp edges
const hiW = Math.max(96, bw * 4);
const hiH = Math.round(hiW * (40 / 64));
const hi = await sharp(Buffer.from(iconSvg))
  .resize(hiW, hiH, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

// Fit inside cover with breathing room
const targetW = Math.max(24, Math.min(bw - 4, 34));
const targetH = Math.round(targetW * (40 / 64));
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
    left: Math.max(0, minX - 12),
    top: Math.max(0, minY - 10),
    width: Math.min(W - minX + 12, 200),
    height: Math.min(H - minY + 10, 50),
  })
  .png()
  .toFile("public/assets/images/home-hero/_shell-el-preview.png");

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_2\.png(?:\?v=\d+)?/g, `hero_layer_2.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("done", { targetW, targetH, left, top, v: V });
