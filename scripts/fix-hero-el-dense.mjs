/**
 * Make Shell-tab EL denser, complete, and color-matched to "Shell" text.
 */
import fs from "fs";
import sharp from "sharp";

const BAK = "public/assets/images/home-hero/hero_layer_2.pre-el.png";
const DEST = "public/assets/images/home-hero/hero_layer_2.png";
const V = 14;

fs.copyFileSync(BAK, DEST);

const { data, info } = await sharp(DEST).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

// Sample active "Shell" text cyan (bright letters, not molecule)
function sampleShellCyan() {
  // "Shell" starts ~x=128-160, y~95
  const colors = [];
  for (let y = 90; y <= 110; y++) {
    for (let x = 135; x <= 175; x++) {
      const i = (y * W + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];
      if (a > 200 && g > 180 && b > 160 && g + b > 380) colors.push([r, g, b]);
    }
  }
  if (!colors.length) return { r: 126, g: 240, b: 224 };
  let sr = 0,
    sg = 0,
    sb = 0;
  for (const [r, g, b] of colors) {
    sr += r;
    sg += g;
    sb += b;
  }
  const n = colors.length;
  return { r: Math.round(sr / n), g: Math.round(sg / n), b: Math.round(sb / n) };
}

const shellCyan = sampleShellCyan();
const hex = `#${[shellCyan.r, shellCyan.g, shellCyan.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
console.log("Shell cyan", shellCyan, hex);

function isMol(r, g, b, a) {
  return a > 140 && g > 130 && b > 100 && g > r + 12 && b > r + 3 && g + b > 260;
}

const pts = [];
for (let y = 78; y <= 128; y++) {
  for (let x = 78; x <= 128; x++) {
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
const cx = bx * 3 + 1,
  cy = by * 3 + 1;
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
minX = Math.max(0, minX - 7);
minY = Math.max(0, minY - 7);
maxX = Math.min(124, maxX + 7);
maxY = Math.min(H - 1, maxY + 7);
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;

const si = (Math.floor((minY + maxY) / 2) * W + Math.max(0, minX - 8)) * 4;
const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };
const cover = await sharp({
  create: { width: bw, height: bh, channels: 4, background: bg },
})
  .png()
  .toBuffer();

/**
 * Dense small-size EL: thick bars, full L foot, slight italic via shear,
 * solid Shell-matched fill — reads clearly at ~30px.
 */
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
  <g transform="translate(16,14) skewX(-9)" fill="${hex}">
    <!-- E — thick triple bars -->
    <rect x="0" y="0" width="70" height="18" rx="3"/>
    <rect x="0" y="40" width="58" height="18" rx="3"/>
    <rect x="0" y="80" width="70" height="18" rx="3"/>
    <!-- L — full stem + foot -->
    <rect x="90" y="0" width="20" height="98" rx="3"/>
    <rect x="90" y="80" width="70" height="18" rx="3"/>
  </g>
</svg>`;

const hi = await sharp(Buffer.from(iconSvg)).png().toBuffer();
const targetW = 34;
const targetH = Math.round(targetW * (120 / 200));
const el = await sharp(hi)
  .resize(targetW, targetH, {
    fit: "fill",
    kernel: sharp.kernel.lanczos3,
  })
  .ensureAlpha()
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
  .extract({ left: minX - 6, top: minY - 6, width: 170, height: 48 })
  .png()
  .toFile("public/assets/images/home-hero/_shell-el-preview.png");

// Same for layer_1 Planner
const BAK1 = "public/assets/images/home-hero/hero_layer_1.pre-el.png";
const DEST1 = "public/assets/images/home-hero/hero_layer_1.png";
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
const cx1 = bx1 * 3 + 1,
  cy1 = by1 * 3 + 1;
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
a -= 7;
b -= 7;
c = Math.min(a + 44, c + 7);
d += 7;
const bw1 = c - a + 1,
  bh1 = d - b + 1;
const si1 = (Math.floor((b + d) / 2) * W1 + Math.max(0, a - 8)) * 4;
const bg1 = { r: d1[si1], g: d1[si1 + 1], b: d1[si1 + 2], alpha: 255 };
const cover1 = await sharp({
  create: { width: bw1, height: bh1, channels: 4, background: bg1 },
})
  .png()
  .toBuffer();
const el1 = await sharp(hi)
  .resize(targetW, targetH, { fit: "fill", kernel: sharp.kernel.lanczos3 })
  .ensureAlpha()
  .png()
  .toBuffer();
const m1 = await sharp(el1).metadata();
const tmp1 = DEST1 + ".tmp.png";
await sharp(DEST1)
  .composite([
    { input: cover1, left: a, top: b },
    {
      input: el1,
      left: a + Math.round((bw1 - m1.width) / 2),
      top: b + Math.round((bh1 - m1.height) / 2),
    },
  ])
  .png()
  .toFile(tmp1);
fs.copyFileSync(tmp1, DEST1);
fs.unlinkSync(tmp1);

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_2\.png(?:\?v=\d+)?/g, `hero_layer_2.png?v=${V}`);
html = html.replace(/hero_layer_1\.png(?:\?v=\d+)?/g, `hero_layer_1.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("done", { minX, minY, bw, bh, targetW, targetH, v: V });
