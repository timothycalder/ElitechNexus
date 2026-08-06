/**
 * Replace Devin molecule next to Planner tab in hero_layer_1 with Elitechnexus EL.
 */
import fs from "fs";
import sharp from "sharp";

const SRC = "public/assets/images/home-hero/hero_layer_1.png";
const BAK = "public/assets/images/home-hero/hero_layer_1.pre-el.png";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const DEST = SRC;
const V = 11;

// Prefer backup if present (clean molecule)
if (fs.existsSync(BAK)) {
  fs.copyFileSync(BAK, SRC);
}

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

function isMoleculePixel(r, g, b, a) {
  if (a < 160) return false;
  // Bright cyan/teal molecule dots
  return g > 140 && b > 110 && g > r + 15 && b > r + 5 && g + b > 280;
}

// Planner tab is on the right side of the tab row
const y0 = Math.floor(H * 0.04);
const y1 = Math.floor(H * 0.16);
const x0 = Math.floor(W * 0.45);
const x1 = Math.floor(W * 0.78);

const pts = [];
for (let y = y0; y <= y1; y++) {
  for (let x = x0; x <= x1; x++) {
    const i = (y * W + x) * 4;
    if (isMoleculePixel(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
  }
}
console.log("molecule pts", pts.length);

if (pts.length < 20) {
  console.error("molecule not found");
  process.exit(1);
}

// Densest cluster = molecule (not "Planner" text)
const hist = {};
for (const p of pts) {
  const k = `${Math.floor(p.x / 5)},${Math.floor(p.y / 5)}`;
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
const cx = bx * 5 + 2;
const cy = by * 5 + 2;

// Molecule is roughly 28-36px; take only nearby points
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

const pad = 4;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad);
maxY = Math.min(H - 1, maxY + pad);
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
console.log("bbox", { minX, minY, maxX, maxY, bw, bh, cx, cy });

// Sample chrome background (left of molecule, away from text)
const sx = Math.max(0, minX - 8);
const sy = Math.floor((minY + maxY) / 2);
const si = (sy * W + sx) * 4;
const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

const cover = await sharp({
  create: { width: bw, height: bh, channels: 4, background: bg },
})
  .png()
  .toBuffer();

// Natural EL mark: no dark plate — transparent over chrome like original molecule
const iconW = Math.max(22, Math.min(34, Math.round(bw * 0.95)));
const el = await sharp(fs.readFileSync(LOGO))
  .resize(iconW, Math.round(iconW * 0.62), {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .ensureAlpha()
  .png()
  .toBuffer();

const meta = await sharp(el).metadata();
const left = minX + Math.round((bw - meta.width) / 2);
const top = minY + Math.round((bh - meta.height) / 2);

await sharp(SRC)
  .composite([
    { input: cover, left: minX, top: minY },
    { input: el, left: Math.max(0, left), top: Math.max(0, top) },
  ])
  .png()
  .toFile(DEST + ".tmp");

fs.copyFileSync(DEST + ".tmp", DEST);
fs.unlinkSync(DEST + ".tmp");

// Preview crop
await sharp(DEST)
  .extract({
    left: Math.max(0, minX - 20),
    top: Math.max(0, minY - 15),
    width: Math.min(W - minX + 20, bw + 160),
    height: Math.min(H - minY + 15, bh + 40),
  })
  .png()
  .toFile("public/assets/images/home-hero/_planner-el-preview.png");

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_1\.png(?:\?v=\d+)?/g, `hero_layer_1.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("patched hero_layer_1, cache v=", V);
