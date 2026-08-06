/**
 * Fix misplaced EL logos in hero demo images.
 * 1) Restore .pre-el backups (removes bad EL pasted over terminal/editor text)
 * 2) Replace only real Devin molecule tab icons with a compact natural EL mark
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const LOGO = "public/assets/images/elitechnexus-logo.svg";
const V = 10;

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

// Content panels that should NEVER get a logo overlay (shell/editor body only)
const RESTORE_ONLY = new Set([
  "public/assets/images/home-hero/hero-steps-1.png",
  "public/assets/images/home-hero/hero-steps-1-mobile.png",
  "public/assets/images/home-hero/hero-steps-2.png",
  "public/assets/images/home-hero/hero-steps-2-mobile.png",
  "public/assets/images/home-hero/hero-steps-3.png",
  "public/assets/images/home-hero/hero-steps-3-mobile.png",
  "public/assets/images/home-hero/hero-steps-4-mobile.png",
]);

for (const f of FILES) {
  const bak = f.replace(/(\.\w+)$/, ".pre-el$1");
  if (fs.existsSync(bak)) {
    fs.copyFileSync(bak, f);
    console.log("restored", path.basename(f));
  }
}

async function makeElMark(size) {
  // Soft rounded plate + EL so it reads as a UI icon, not a sticker
  const plate = Math.round(size);
  const elW = Math.round(size * 0.78);
  const el = await sharp(fs.readFileSync(LOGO))
    .resize(elW, Math.round(elW * 0.62), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
  const elMeta = await sharp(el).metadata();
  const left = Math.round((plate - elMeta.width) / 2);
  const top = Math.round((plate - elMeta.height) / 2);
  return sharp({
    create: {
      width: plate,
      height: plate,
      channels: 4,
      background: { r: 14, g: 36, b: 48, alpha: 230 },
    },
  })
    .composite([{ input: el, left: Math.max(0, left), top: Math.max(0, top) }])
    .png()
    .toBuffer();
}

function isMoleculePixel(r, g, b, a) {
  if (a < 180) return false;
  return g > 150 && b > 120 && g > r + 20 && b > r + 10 && g + b > 300;
}

async function patchTabIcon(file) {
  if (RESTORE_ONLY.has(file) || !fs.existsSync(file)) return false;

  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Only the tab chrome band (top), left area — avoids terminal cyan text
  const y0 = Math.floor(H * 0.01);
  const y1 = Math.floor(H * 0.12);
  const x0 = Math.floor(W * 0.01);
  const x1 = Math.floor(W * 0.22);

  const pts = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (isMoleculePixel(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
    }
  }
  if (pts.length < 20) {
    console.log("no tab molecule:", path.basename(file), "pts", pts.length);
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

  // Cluster to densest molecule blob (avoid Shell text cyan)
  const hist = {};
  for (const p of pts) {
    const k = `${Math.floor(p.x / 6)},${Math.floor(p.y / 6)}`;
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
  const cx = bx * 6 + 3;
  const cy = by * 6 + 3;
  const half = 14;
  minX = Math.max(x0, cx - half);
  minY = Math.max(y0, cy - half);
  maxX = Math.min(x1, cx + half);
  maxY = Math.min(y1, cy + half);

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(H - 1, maxY + pad);
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  // Sample chrome background near icon
  const sx = Math.min(W - 1, maxX + 8);
  const sy = Math.min(H - 1, Math.floor((minY + maxY) / 2));
  const si = (sy * W + sx) * 4;
  const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

  const cover = await sharp({
    create: { width: bw, height: bh, channels: 4, background: bg },
  })
    .png()
    .toBuffer();

  const iconSize = Math.max(16, Math.min(28, Math.round(Math.min(bw, bh) * 0.95)));
  const el = await makeElMark(iconSize);
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
  console.log("tab icon patched", path.basename(file), `${iconSize}px @${minX},${minY}`);
  return true;
}

let n = 0;
for (const f of FILES) {
  if (await patchTabIcon(f)) n++;
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

console.log("done tab patches", n, "cache v=", V);
