/**
 * Final pass: Shell-tab EL using site logo SVG, Shell-cyan tint, full letters.
 */
import fs from "fs";
import sharp from "sharp";

const BAK = "public/assets/images/home-hero/hero_layer_2.pre-el.png";
const DEST = "public/assets/images/home-hero/hero_layer_2.png";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const V = 16;

fs.copyFileSync(BAK, DEST);

const { data, info } = await sharp(DEST).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

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
minX = Math.max(0, minX - 6);
minY = Math.max(0, minY - 6);
maxX = Math.min(124, maxX + 6);
maxY = Math.min(H - 1, maxY + 6);
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;

const si = (Math.floor((minY + maxY) / 2) * W + Math.max(0, minX - 8)) * 4;
const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };
const cover = await sharp({
  create: { width: bw, height: bh, channels: 4, background: bg },
})
  .png()
  .toBuffer();

// Sample Shell text color
let sr = 0,
  sg = 0,
  sb = 0,
  sn = 0;
for (let y = 92; y <= 108; y++) {
  for (let x = 140; x <= 170; x++) {
    const i = (y * W + x) * 4;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    if (data[i + 3] > 200 && g > 180 && b > 150) {
      sr += r;
      sg += g;
      sb += b;
      sn++;
    }
  }
}
const shell = sn
  ? { r: Math.round(sr / sn), g: Math.round(sg / sn), b: Math.round(sb / sn) }
  : { r: 76, g: 251, b: 212 };

// Render official logo large, then tint to Shell cyan, then fit
const hi = await sharp(fs.readFileSync(LOGO))
  .resize(240, 144, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// Recolor non-transparent pixels to Shell cyan (keep alpha)
const buf = Buffer.from(hi.data);
for (let i = 0; i < buf.length; i += 4) {
  if (buf[i + 3] > 20) {
    const a = buf[i + 3] / 255;
    // preserve soft edges via alpha; solid cyan body
    buf[i] = shell.r;
    buf[i + 1] = shell.g;
    buf[i + 2] = shell.b;
    buf[i + 3] = Math.min(255, Math.round(buf[i + 3] * (0.85 + 0.15 * a)));
  }
}

const tinted = await sharp(buf, {
  raw: { width: hi.info.width, height: hi.info.height, channels: 4 },
})
  .png()
  .toBuffer();

// Fit width-first into slot (logo is wide); height follows
const targetW = Math.min(bw - 2, 38);
const targetH = Math.round(targetW * (72 / 120));
const el = await sharp(tinted)
  .resize(targetW, targetH, {
    fit: "fill",
    kernel: sharp.kernel.lanczos3,
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
  .extract({ left: Math.max(0, minX - 8), top: Math.max(0, minY - 8), width: 180, height: 52 })
  .png()
  .toFile("public/assets/images/home-hero/_shell-el-preview.png");

// layer 1 planner — same logo treatment
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
let bkey = null,
  bn = 0;
for (const [k, n] of Object.entries(hist1)) {
  if (n > bn) {
    bn = n;
    bkey = k;
  }
}
const [bx1, by1] = bkey.split(",").map(Number);
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
a -= 6;
b -= 6;
c = Math.min(a + 44, c + 6);
d += 6;
const bw1 = c - a + 1,
  bh1 = d - b + 1;
const si1 = (Math.floor((b + d) / 2) * W1 + Math.max(0, a - 8)) * 4;
const bg1 = { r: d1[si1], g: d1[si1 + 1], b: d1[si1 + 2], alpha: 255 };
const cover1 = await sharp({
  create: { width: bw1, height: bh1, channels: 4, background: bg1 },
})
  .png()
  .toBuffer();
const tw1 = Math.min(bw1 - 2, 38);
const th1 = Math.round(tw1 * (72 / 120));
const el1 = await sharp(tinted)
  .resize(tw1, th1, { fit: "fill", kernel: sharp.kernel.lanczos3 })
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

console.log("done", { shell, bw, bh, targetW, targetH, v: V });
