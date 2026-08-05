/**
 * Precise re-patch: restore oversized patches, then replace only small
 * Devin molecule icons in the tab row with a compact EL mark.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const LOGO = "public/assets/images/elitechnexus-logo.svg";
const V = 9;

const FILES = [
  "public/assets/images/home-hero/hero_layer_1.png",
  "public/assets/images/home-hero/hero_layer_2.png",
  "public/assets/images/home-hero/hero-steps-1.png",
  "public/assets/images/home-hero/hero-steps-1-mobile.png",
  "public/assets/images/home-hero/hero-steps-2.png",
  "public/assets/images/home-hero/hero-steps-2-mobile.png",
  "public/assets/images/home-hero/hero-steps-3.png",
  "public/assets/images/home-hero/hero-steps-3-mobile.png",
  "public/assets/images/home-hero/hero-steps-4-mobile.png",
  "public/assets/images/home-hero/hero-steps-0-thumb.png",
  "public/assets/images/home-hero/hero-steps-1-thumb.png",
  "public/assets/images/home-hero/hero-steps-2-thumb.png",
  "public/assets/images/home-hero/hero-steps-3-thumb.png",
  "public/assets/images/home-hero/hero-steps-4-thumb.png",
  "public/assets/images/bento03.png",
  "public/assets/images/bento-mobile03.png",
];

// Restore backups first
for (const f of FILES) {
  const bak = f.replace(/(\.\w+)$/, ".pre-el$1");
  if (fs.existsSync(bak)) {
    fs.copyFileSync(bak, f);
    console.log("restored", path.basename(f));
  }
}

async function makeEl(w) {
  return sharp(fs.readFileSync(LOGO))
    .resize(w, Math.round(w * 0.62), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

function isMoleculePixel(r, g, b, a) {
  if (a < 180) return false;
  // Bright cyan/teal dots of Devin molecule (not gray UI chrome)
  return g > 150 && b > 120 && g > r + 20 && b > r + 10 && g + b > 300;
}

async function patchFile(file) {
  if (!fs.existsSync(file)) return false;
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Tab row only — top ~12% of image, left half
  const y0 = Math.floor(H * 0.02);
  const y1 = Math.floor(H * 0.18);
  const x0 = Math.floor(W * 0.02);
  const x1 = Math.floor(W * 0.28);

  const pts = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (isMoleculePixel(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
    }
  }
  if (pts.length < 15) {
    console.log("no molecule band:", path.basename(file), "pts", pts.length);
    return false;
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  let bw = maxX - minX + 1;
  let bh = maxY - minY + 1;

  // Reject if detection spanned too tall/wide (grabbed Shell text etc.)
  if (bw > 70 || bh > 50 || bw * bh > 2800) {
    // Keep only densest leftmost 40x40 window of teal pixels
    const hist = {};
    for (const p of pts) {
      const bx = Math.floor(p.x / 8);
      const by = Math.floor(p.y / 8);
      const k = `${bx},${by}`;
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
    if (!best) return false;
    const [bx, by] = best.split(",").map(Number);
    const cx = bx * 8 + 4;
    const cy = by * 8 + 4;
    minX = Math.max(x0, cx - 18);
    minY = Math.max(y0, cy - 16);
    maxX = Math.min(x1, cx + 18);
    maxY = Math.min(y1, cy + 16);
    bw = maxX - minX + 1;
    bh = maxY - minY + 1;
  }

  const pad = 3;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(H - 1, maxY + pad);
  bw = maxX - minX + 1;
  bh = maxY - minY + 1;

  // Background sample to the right of icon
  const sx = Math.min(W - 1, maxX + 6);
  const sy = Math.min(H - 1, Math.floor((minY + maxY) / 2));
  const si = (sy * W + sx) * 4;
  const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

  const cover = await sharp({
    create: { width: bw, height: bh, channels: 4, background: bg },
  })
    .png()
    .toBuffer();

  const elW = Math.max(18, Math.min(42, bw + 4));
  const el = await makeEl(elW);
  const meta = await sharp(el).metadata();
  const left = minX + Math.round((bw - meta.width) / 2);
  const top = minY + Math.round((bh - meta.height) / 2);

  const out = await sharp(file)
    .composite([
      { input: cover, left: minX, top: minY },
      { input: el, left: Math.max(0, left), top: Math.max(0, top) },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(file, out);
  console.log("patched", path.basename(file), `${bw}x${bh} @${minX},${minY}`);
  return true;
}

let n = 0;
for (const f of FILES) {
  if (await patchFile(f)) n++;
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_1\.png(?:\?v=\d+)?/g, `hero_layer_1.png?v=${V}`);
html = html.replace(/hero_layer_2\.png(?:\?v=\d+)?/g, `hero_layer_2.png?v=${V}`);
html = html.replace(/hero-steps-([1-4])\.png(?:\?v=\d+)?/g, `hero-steps-$1.png?v=${V}`);
html = html.replace(/hero-steps-([1-4])-mobile\.png(?:\?v=\d+)?/g, `hero-steps-$1-mobile.png?v=${V}`);
html = html.replace(/hero-steps-([0-4])-thumb\.png(?:\?v=\d+)?/g, `hero-steps-$1-thumb.png?v=${V}`);
html = html.replace(/bento03\.png(?:\?v=\d+)?/g, `bento03.png?v=${V}`);
html = html.replace(/bento-mobile03\.png(?:\?v=\d+)?/g, `bento-mobile03.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("done", n);
