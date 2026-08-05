/**
 * Replace remaining Devin molecule icons in hero images with Elitechnexus EL logo.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const LOGO = "public/assets/images/elitechnexus-logo.svg";
const V = 8;

const TARGETS = [
  "public/assets/images/home-hero/hero_layer_1.png",
  "public/assets/images/home-hero/hero_layer_2.png",
  "public/assets/images/home-hero/hero-steps-1.png",
  "public/assets/images/home-hero/hero-steps-1-mobile.png",
  "public/assets/images/home-hero/hero-steps-2.png",
  "public/assets/images/home-hero/hero-steps-2-mobile.png",
  "public/assets/images/home-hero/hero-steps-3.png",
  "public/assets/images/home-hero/hero-steps-3-mobile.png",
  "public/assets/images/home-hero/hero-steps-4.png",
  "public/assets/images/home-hero/hero-steps-4-mobile.png",
  "public/assets/images/home-hero/hero-steps-0-thumb.png",
  "public/assets/images/home-hero/hero-steps-1-thumb.png",
  "public/assets/images/home-hero/hero-steps-2-thumb.png",
  "public/assets/images/home-hero/hero-steps-3-thumb.png",
  "public/assets/images/home-hero/hero-steps-4-thumb.png",
  "public/assets/images/bento03.png",
  "public/assets/images/bento-mobile03.png",
  "public/assets/images/bento-hover03.png",
];

async function makeEl(size) {
  return sharp(fs.readFileSync(LOGO))
    .resize(size, Math.round(size * 0.6), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

function isTeal(r, g, b, a) {
  if (a < 160) return false;
  // Devin molecule: bright teal/cyan dots
  return g > 130 && b > 100 && g >= r - 5 && (g + b) / 2 > r + 25 && (r + g + b) / 3 > 100;
}

function findBlobs(data, W, H, x0, x1, y0, y1) {
  const key = (x, y) => y * W + x;
  const pts = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (isTeal(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
    }
  }
  if (!pts.length) return [];

  const set = new Set(pts.map((p) => key(p.x, p.y)));
  const visited = new Set();
  const blobs = [];

  for (const p of pts) {
    const k0 = key(p.x, p.y);
    if (visited.has(k0)) continue;
    const q = [p];
    visited.add(k0);
    let minX = p.x,
      minY = p.y,
      maxX = p.x,
      maxY = p.y,
      n = 0;
    while (q.length) {
      const { x, y } = q.pop();
      n++;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ]) {
        const nx = x + dx,
          ny = y + dy;
        const k = key(nx, ny);
        if (!set.has(k) || visited.has(k)) continue;
        visited.add(k);
        q.push({ x: nx, y: ny });
      }
    }
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    blobs.push({ minX, minY, maxX, maxY, w, h, n });
  }
  return blobs;
}

/** Molecule-like: compact cluster of teal dots in tab row */
function pickMolecule(blobs) {
  return blobs
    .filter((b) => b.n >= 20 && b.n < 2500 && b.w >= 8 && b.w <= 90 && b.h >= 8 && b.h <= 90 && b.w / b.h < 2.2 && b.h / b.w < 2.2)
    .sort((a, b) => a.minX - b.minX);
}

async function patchFile(file) {
  if (!fs.existsSync(file)) {
    console.warn("skip missing", file);
    return false;
  }
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Search top tab strip + a bit below for Shell icon / watermark logos
  const bands = [
    [0, Math.min(W - 1, Math.floor(W * 0.45)), 0, Math.min(H - 1, Math.floor(H * 0.28))],
    [0, Math.min(W - 1, Math.floor(W * 0.35)), 0, Math.min(H - 1, Math.floor(H * 0.55))],
  ];

  let molecules = [];
  for (const [x0, x1, y0, y1] of bands) {
    molecules = pickMolecule(findBlobs(data, W, H, x0, x1, y0, y1));
    if (molecules.length) break;
  }

  if (!molecules.length) {
    console.log("no molecule:", path.basename(file), `${W}x${H}`);
    return false;
  }

  // Merge nearby blobs into one molecule region (dots of same icon)
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const b of molecules.slice(0, 12)) {
    // only leftmost cluster group
    if (b.minX > molecules[0].minX + 70) continue;
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(H - 1, maxY + pad);
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  // Sample background near patch for cover color
  const sx = Math.min(W - 1, maxX + 8);
  const sy = Math.min(H - 1, Math.floor((minY + maxY) / 2));
  const si = (sy * W + sx) * 4;
  const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

  const cover = await sharp({
    create: { width: bw, height: bh, channels: 4, background: bg },
  })
    .png()
    .toBuffer();

  const elSize = Math.max(bw, Math.round(bh * 1.4));
  const el = await makeEl(elSize);
  const elMeta = await sharp(el).metadata();
  const elW = elMeta.width;
  const elH = elMeta.height;
  const left = minX + Math.round((bw - elW) / 2);
  const top = minY + Math.round((bh - elH) / 2);

  const out = await sharp(file)
    .composite([
      { input: cover, left: minX, top: minY },
      { input: el, left: Math.max(0, left), top: Math.max(0, top) },
    ])
    .png()
    .toBuffer();

  // backup once
  const bak = file.replace(/(\.\w+)$/, ".pre-el$1");
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
  fs.writeFileSync(file, out);
  console.log("patched", path.basename(file), `@${minX},${minY} ${bw}x${bh}`);
  return true;
}

let n = 0;
for (const f of TARGETS) {
  if (await patchFile(f)) n++;
}

// Cache-bust HTML refs
let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_1\.png(?:\?v=\d+)?/g, `hero_layer_1.png?v=${V}`);
html = html.replace(/hero_layer_2\.png(?:\?v=\d+)?/g, `hero_layer_2.png?v=${V}`);
html = html.replace(/hero-steps-([1-4])\.png(?:\?v=\d+)?/g, `hero-steps-$1.png?v=${V}`);
html = html.replace(/hero-steps-([1-4])-mobile\.png(?:\?v=\d+)?/g, `hero-steps-$1-mobile.png?v=${V}`);
html = html.replace(/hero-steps-([0-4])-thumb\.png(?:\?v=\d+)?/g, `hero-steps-$1-thumb.png?v=${V}`);
html = html.replace(/bento03\.png(?:\?v=\d+)?/g, `bento03.png?v=${V}`);
html = html.replace(/bento-mobile03\.png(?:\?v=\d+)?/g, `bento-mobile03.png?v=${V}`);
html = html.replace(/bento-hover03\.png(?:\?v=\d+)?/g, `bento-hover03.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("done patched", n);
