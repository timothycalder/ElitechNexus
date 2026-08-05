/**
 * Clean plate: replace hex molecule ONLY with transparent EL; keep Elitechnexus word.
 */
import fs from "fs";
import sharp from "sharp";

const CLEAN =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/hero_layer_0_clean.png";
const DEST = "public/assets/images/home-hero/hero_layer_0.png";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const V = 48;

const W = 1052;
const H = 1024;

const plate = await sharp(CLEAN)
  .resize(W, H, { fit: "cover" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const data = Buffer.from(plate.data);

const pts = [];
for (let y = 200; y < 340; y++) {
  for (let x = 40; x < 200; x++) {
    const i = (y * W + x) * 4;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    if (g > 100 && b > 80 && (g > r + 20 || b > r + 20) && g + b > 200) {
      pts.push({ x, y });
    }
  }
}

let minX = Math.min(...pts.map((p) => p.x)) - 6;
let minY = Math.min(...pts.map((p) => p.y)) - 6;
let maxX = Math.max(...pts.map((p) => p.x)) + 6;
let maxY = Math.max(...pts.map((p) => p.y)) + 6;
// Never spill into the Elitechnexus word (starts ~ right of molecule)
maxX = Math.min(maxX, 175);
minX = Math.max(0, minX);
minY = Math.max(0, minY);
maxY = Math.min(H - 1, maxY);
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
console.log("molecule-only slot", { minX, minY, bw, bh, n: pts.length });

// Per-row plate fill
for (let y = minY; y <= maxY; y++) {
  const sx = Math.max(8, minX - 16);
  const si = (y * W + sx) * 4;
  const r = data[si],
    g = data[si + 1],
    b = data[si + 2];
  for (let x = minX; x <= maxX; x++) {
    const i = (y * W + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
}

const base = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .png()
  .toBuffer();

// EL sized to fit molecule slot tightly — transparent, no plate
const el = await sharp(fs.readFileSync(LOGO))
  .resize(bw - 4, bh - 8, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
const meta = await sharp(el).metadata();
const left = minX + Math.round((bw - meta.width) / 2);
const top = minY + Math.round((bh - meta.height) / 2);

const tmp = DEST + ".tmp.png";
await sharp(base)
  .composite([{ input: el, left, top }])
  .png()
  .toFile(tmp);
fs.copyFileSync(tmp, DEST);
fs.unlinkSync(tmp);

await sharp(DEST)
  .extract({ left: 20, top: 150, width: 520, height: 230 })
  .png()
  .toFile("public/assets/images/home-hero/_logo-fix-preview.png");

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
fs.writeFileSync("public/index.html", html);
console.log("done", { left, top, v: V });
