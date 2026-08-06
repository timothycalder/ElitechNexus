/**
 * Replace hero_layer_1/2 with exclusive photos not used elsewhere.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const POOL = "public/assets/images/unique/exclusive-v3";
const V = 61;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 4000) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`dl ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function layerCard(src, dest, title, sub) {
  const W = 1052,
    H = 1024;
  const photo = await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 0.98 })
    .png()
    .toBuffer();
  const badgeY = H - 130;
  const ov = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="30%" stop-color="#071018" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${badgeY}" width="${Math.min(W - 72, 680)}" height="86" rx="16"
      fill="rgba(8,16,28,0.8)" stroke="rgba(110,220,200,0.5)"/>
    <text x="56" y="${badgeY + 36}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${badgeY + 64}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(sub)}</text>
  </svg>`);
  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("layer", path.basename(dest));
}

const layer1 = path.join(POOL, "layer-1.jpg");
const layer2 = path.join(POOL, "layer-2.jpg");
await download(
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=82",
  layer1
);
await download(
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=82",
  layer2
);

await layerCard(layer1, path.join(HERO, "hero_layer_1.png"), "How to write a resume", "Clear achievements, stronger keywords, better first impression");
await layerCard(layer2, path.join(HERO, "hero_layer_2.png"), "How to write a cover letter", "Tell your story so employers and clients trust your proof");

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([12])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
// also bump other hero caches from v60 to 61 for consistency
html = html.replace(/hero-proof-([0-4])\.(png|webp)\?v=60/g, `hero-proof-$1.$2?v=${V}`);
html = html.replace(/hero-steps-([1-4])(-mobile)?\.png\?v=60/g, `hero-steps-$1$2.png?v=${V}`);
html = html.replace(/hero_layer_([034])\.png\?v=60/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/income-routes\/support\/(\d+)\.jpg\?v=60/g, `income-routes/support/$1.jpg?v=${V}`);
fs.writeFileSync("public/index.html", html);
console.log("done layers 1-2 v=", V);
