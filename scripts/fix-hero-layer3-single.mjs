/**
 * Replace hero_layer_3 double-exposure photo with one clear interview image.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const OUT = path.join(HERO, "hero_layer_3.png");
const POOL = "public/assets/images/unique/hero-layer3-fix";
const V = 62;

fs.mkdirSync(POOL, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest), fs.statSync(dest).size);
}

// Single clear interview / video coaching scene (not double-exposure)
const SRC =
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1400&q=85";
const raw = path.join(POOL, "interview-single.jpg");
await download(SRC, raw);

const meta = await sharp(OUT).metadata();
const w = meta.width || 1024;
const h = meta.height || 1024;

const title = "Mock interviews that stick";
const sub = "Live practice with feedback until your answers land";

const photo = await sharp(raw)
  .resize(w, h, { fit: "cover", position: "centre" })
  .modulate({ brightness: 0.88, saturation: 0.92 })
  .png()
  .toBuffer();

const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="35%" stop-color="#071018" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="28" y="${h - 128}" width="${Math.min(w - 56, 560)}" height="92" rx="16"
    fill="rgba(8,16,28,0.82)" stroke="rgba(110,220,200,0.45)"/>
  <text x="48" y="${h - 88}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
    font-size="26" font-weight="700">${esc(title)}</text>
  <text x="48" y="${h - 58}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
    font-size="15">${esc(sub)}</text>
</svg>`);

let out = await sharp(photo)
  .composite([{ input: ov, left: 0, top: 0 }])
  .png()
  .toBuffer();

out = await sharp(out)
  .composite([
    {
      input: Buffer.from(
        `<svg width="${w}" height="${h}"><rect width="100%" height="100%" rx="18" ry="18" fill="#fff"/></svg>`
      ),
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();

// backup old
const bak = path.join(HERO, "hero_layer_3.double-exposure.bak.png");
if (!fs.existsSync(bak) && fs.existsSync(OUT)) fs.copyFileSync(OUT, bak);

await sharp(out).png().toFile(OUT);
await sharp(out).webp({ quality: 88 }).toFile(OUT.replace(/\.png$/, ".webp"));
console.log("wrote", OUT, w, "x", h);

// bump cache on homepage refs
const htmlPath = "public/index.html";
let html = fs.readFileSync(htmlPath, "utf8");
html = html.replace(
  /\/assets\/images\/home-hero\/hero_layer_3\.(png|webp)\?v=\d+/g,
  `/assets/images/home-hero/hero_layer_3.$1?v=${V}`
);
fs.writeFileSync(htmlPath, html);
console.log("cache bump v=" + V);
