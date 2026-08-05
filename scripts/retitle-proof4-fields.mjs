/**
 * Retitle hero-proof-4: Interview coaching → Fields & delivery
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const SRC = "public/assets/images/services/interview.png";
const V = 53;
const W = 900;
const H = 560;
const title = "Fields & delivery";
const sub = "Interview-ready specialists across every stack";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const photo = await sharp(SRC)
  .resize(W, H, { fit: "cover", position: "centre" })
  .modulate({ brightness: 0.9, saturation: 0.98 })
  .sharpen()
  .png()
  .toBuffer();

const ov = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="30%" stop-color="#071018" stop-opacity="0.05"/>
    <stop offset="100%" stop-color="#071018" stop-opacity="0.9"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="28" y="${H - 128}" width="${Math.min(W - 56, 580)}" height="92" rx="16"
    fill="rgba(8,16,28,0.82)" stroke="rgba(110,220,200,0.5)"/>
  <text x="48" y="${H - 88}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
    font-size="26" font-weight="700">${esc(title)}</text>
  <text x="48" y="${H - 58}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
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
        `<svg width="${W}" height="${H}"><rect width="100%" height="100%" rx="18" ry="18" fill="#fff"/></svg>`
      ),
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();

const dest = path.join(HERO, "hero-proof-4.png");
await sharp(out).png().toFile(dest);
await sharp(out).webp({ quality: 88 }).toFile(dest.replace(/\.png$/, ".webp"));
fs.copyFileSync(dest, path.join(HERO, "hero-steps-4-thumb.png"));
fs.copyFileSync(dest.replace(/\.png$/, ".webp"), path.join(HERO, "hero-steps-4-thumb.webp"));

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /\/assets\/images\/home-hero\/hero-proof-4\.(png|webp)(?:\?v=\d+)?/g,
  `/assets/images/home-hero/hero-proof-4.$1?v=${V}`
);
// Ribbon under the card
html = html.replace(
  /(<div class="home-hero__thumbnails-item">[\s\S]*?hero-proof-4\.png[\s\S]*?<div class="home-hero__thumbnails-item-text">[\s\S]*?<div>)([^<]*)(<\/div>)/,
  `$1Fields$3`
);
// Broader fallback: last thumbnails-item-text div label
const ribbonRe =
  /(<div id="home-hero__thumbnails-wrapper">)([\s\S]*?)(<\/div>\s*<!-- <div id="home-hero__thumbnails-bottom")/;
html = html.replace(ribbonRe, (full, a, mid, b) => {
  const labels = ["AI & ML", "Full Stack", "Data & Security", "Coaching", "Fields"];
  let i = 0;
  const next = mid.replace(
    /(<div class="home-hero__thumbnails-item-text">[\s\S]*?<div>)([^<]*)(<\/div>)/g,
    (m, pre, _old, post) => `${pre}${labels[i++] ?? _old}${post}`
  );
  return a + next + b;
});

fs.writeFileSync("public/index.html", html);
console.log("retitled hero-proof-4 → Fields & delivery v=", V);
