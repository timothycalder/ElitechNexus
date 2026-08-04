/**
 * Build a clean EL-only logo (no black background) and use it site-wide.
 */
import fs from "fs";
import path from "path";
import { Jimp } from "jimp";

const USER_SRC =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_87ea9c22-b00f-49b2-bb02-50909a0562cf-fdc2afab-23ae-4194-aafc-b6e38487f229.png";

const OUT_DIR = "public/assets/images";
const OUT_MAIN = path.join(OUT_DIR, "elitechnexus-logo.png");
const OUT_TRANS = path.join(OUT_DIR, "elitechnexus-logo-transparent.png");

// Fresh copy from user upload
fs.copyFileSync(USER_SRC, OUT_MAIN);
console.log("restored source logo");

const img = await Jimp.read(OUT_MAIN);
const w = img.bitmap.width;
const h = img.bitmap.height;
console.log("source size", w, h);

// Knock out dark / black background; keep colored EL strokes
let minX = w,
  minY = h,
  maxX = 0,
  maxY = 0,
  kept = 0;

img.scan(0, 0, w, h, function (x, y, idx) {
  const r = this.bitmap.data[idx];
  const g = this.bitmap.data[idx + 1];
  const b = this.bitmap.data[idx + 2];
  const a = this.bitmap.data[idx + 3];

  // Background: near-black OR already transparent
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const isBg = a < 10 || (lum < 35 && r < 45 && g < 45 && b < 45);

  if (isBg) {
    this.bitmap.data[idx] = 0;
    this.bitmap.data[idx + 1] = 0;
    this.bitmap.data[idx + 2] = 0;
    this.bitmap.data[idx + 3] = 0;
    return;
  }

  kept++;
  if (x < minX) minX = x;
  if (y < minY) minY = y;
  if (x > maxX) maxX = x;
  if (y > maxY) maxY = y;
});

console.log("kept logo pixels", kept, "bbox", minX, minY, maxX, maxY);

// Crop tightly around EL with small padding
const pad = 12;
const cx = Math.max(0, minX - pad);
const cy = Math.max(0, minY - pad);
const cw = Math.min(w - cx, maxX - minX + 1 + pad * 2);
const ch = Math.min(h - cy, maxY - minY + 1 + pad * 2);
img.crop({ x: cx, y: cy, w: cw, h: ch });

await img.write(OUT_TRANS);
await img.write(OUT_MAIN); // main asset also transparent (EL only)
console.log("wrote transparent cropped EL", cw, "x", ch);

// Update all HTML refs to transparent + cache bust, remove black-bg favicon uses of full canvas
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "visual-3d") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

const logoUrl = "/assets/images/elitechnexus-logo-transparent.png?v=5";
const style = `<style id="elitechnexus-logo-css">
.elitechnexus-logo-wrap{display:inline-flex!important;align-items:center;justify-content:center;line-height:0;width:auto!important;height:auto!important;background:transparent!important}
.elitechnexus-logo{display:block!important;width:100%!important;height:auto!important;max-height:100%!important;object-fit:contain!important;background:transparent!important}
#site-header__logo .o-icon.elitechnexus-logo-wrap{width:var(--icon-size, 2rem)!important;height:auto!important;background:transparent!important}
#site-header__logo .elitechnexus-logo{width:100%!important;height:auto!important}
#home-hero__caption .o-icon.elitechnexus-logo-wrap{width:1.5em!important;height:1.5em!important;background:transparent!important}
#site-menu__logo{
  background-image:url('${logoUrl}')!important;
  background-size:contain!important;
  background-repeat:no-repeat!important;
  background-position:left center!important;
  background-color:transparent!important;
}
</style>`;

for (const file of walk("public")) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(
    /\/assets\/images\/elitechnexus-logo(?:-transparent)?\.png(?:\?v=\d+)?/g,
    logoUrl.replace(/^\//, "/")
  );
  // fix double path if any
  html = html.replaceAll(
    "/assets/images//assets/images/elitechnexus-logo-transparent.png?v=5",
    "/assets/images/elitechnexus-logo-transparent.png?v=5"
  );
  html = html.replace(
    /src="\/assets\/images\/elitechnexus-logo-transparent\.png\?v=\d+"/g,
    `src="${logoUrl}"`
  );
  html = html.replace(
    /<style id="elitechnexus-logo-css">[\s\S]*?<\/style>/,
    style
  );
  // og/twitter can keep logo; use transparent too
  html = html.replace(
    /content="\/assets\/images\/elitechnexus-logo[^"]*"/g,
    `content="${logoUrl}"`
  );
  fs.writeFileSync(file, html, "utf8");
}
console.log("HTML updated to EL-only transparent logo");

// Rebuild favicons from transparent cropped (on dark tabs EL still visible)
const sizes = [
  ["public/icon.png", 256],
  ["public/apple-icon.png", 180],
  ["public/icon-32.png", 32],
];
for (const [file, size] of sizes) {
  const i = await Jimp.read(OUT_TRANS);
  // place on transparent canvas
  const canvas = new Jimp({ width: size, height: size, color: 0x00000000 });
  i.contain({ w: size, h: size });
  const ox = Math.floor((size - i.bitmap.width) / 2);
  const oy = Math.floor((size - i.bitmap.height) / 2);
  canvas.composite(i, Math.max(0, ox), Math.max(0, oy));
  await canvas.write(file);
  console.log("favicon", file);
}

console.log("done — EL only, no background");
