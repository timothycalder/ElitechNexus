/**
 * Replace all Devin hexagonal SVG logos with Elitechnexus EL logo.
 * Also generate favicon / icon sizes and update meta icons.
 */
import fs from "fs";
import path from "path";
import { Jimp } from "jimp";

const ROOT = "public";
const LOGO_SRC = "public/assets/images/elitechnexus-logo.png";
const LOGO_URL = "/assets/images/elitechnexus-logo.png";
const LOGO_TRANS = "public/assets/images/elitechnexus-logo-transparent.png";
const LOGO_TRANS_URL = "/assets/images/elitechnexus-logo-transparent.png";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "visual-3d" || name === "node_modules") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

// --- 1) Make transparent logo (knock out near-black bg) ---
const logo = await Jimp.read(LOGO_SRC);
logo.scan(0, 0, logo.bitmap.width, logo.bitmap.height, function (x, y, idx) {
  const r = this.bitmap.data[idx];
  const g = this.bitmap.data[idx + 1];
  const b = this.bitmap.data[idx + 2];
  // black / near-black -> transparent
  if (r < 28 && g < 28 && b < 28) {
    this.bitmap.data[idx + 3] = 0;
  }
});
await logo.write(LOGO_TRANS);
console.log("wrote transparent logo");

// Favicon / app icons
async function writeSized(file, size) {
  const img = await Jimp.read(LOGO_SRC);
  // keep black bg for favicon clarity on browser tabs
  img.resize({ w: size, h: size });
  await img.write(file);
  console.log("wrote", file, size);
}

await writeSized("public/icon.png", 256);
await writeSized("public/apple-icon.png", 180);
await writeSized("public/favicon.ico".replace(".ico", "-32.png"), 32);
// Many browsers accept png favicon via link; also overwrite common paths if present
for (const p of [
  "public/favicon-32x32.png",
  "public/favicon-16x16.png",
  "public/assets/images/favicon.png",
]) {
  // skip missing dirs
}

const fav32 = await Jimp.read(LOGO_SRC);
fav32.resize({ w: 32, h: 32 });
await fav32.write("public/icon-32.png");

// --- 2) Replace inline Devin SVG logos in HTML ---
// Pattern: <div class="o-icon"> <svg viewBox="0 0 44 50" ...>...</svg> </div>
// Only the brand mark uses 44x50 viewBox with fill #2A6DCE / multi-path hexagon.

const svgBrandRe =
  /<div class="o-icon">\s*<svg viewBox="0 0 44 50"[\s\S]*?<\/svg>\s*<\/div>/g;

const imgReplacement = `<div class="o-icon elitechnexus-logo-wrap"><img src="${LOGO_TRANS_URL}" alt="Elitechnexus" class="elitechnexus-logo" width="44" height="44"/></div>`;

const styleBlock = `<style id="elitechnexus-logo-css">
.elitechnexus-logo-wrap{display:inline-flex;align-items:center;justify-content:center;line-height:0}
.elitechnexus-logo{display:block;width:1.65em;height:auto;max-height:2em;object-fit:contain}
#site-header__logo .elitechnexus-logo{width:2rem;height:auto}
#home-hero__caption .elitechnexus-logo{width:1.35em;height:auto}
</style>`;

let totalSvg = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  const matches = html.match(svgBrandRe) || [];
  totalSvg += matches.length;
  html = html.replace(svgBrandRe, imgReplacement);

  if (!html.includes("elitechnexus-logo-css")) {
    html = html.replace("<head>", `<head>${styleBlock}`);
  }

  // Point common icon links at our logo
  html = html.replace(
    /href="\/(?:apple-)?icon\.png"/g,
    'href="/assets/images/elitechnexus-logo.png"'
  );
  html = html.replace(
    /href="\/favicon\.ico"/g,
    'href="/assets/images/elitechnexus-logo.png"'
  );
  // og:image / twitter:image if they point to local assets — leave remote; add local if missing content
  html = html.replace(
    /(<meta property="og:image"[^>]*content=")[^"]*(")/,
    `$1${LOGO_URL}$2`
  );
  html = html.replace(
    /(<meta name="twitter:image"[^>]*content=")[^"]*(")/,
    `$1${LOGO_URL}$2`
  );

  if (html !== before || matches.length) {
    fs.writeFileSync(file, html, "utf8");
    console.log(path.relative(ROOT, file), "svg logos replaced:", matches.length);
  }
}

console.log("total svg logos replaced:", totalSvg);

// --- 3) Update hero card face to use EL logo (regenerate branding strip) ---
// Composite: start from orig, cover hexagon+Devin area, draw EL logo + Elitechnexus text via jimp print if possible
// Prefer using already-clean Elitechnexus hero and swap hexagon region with EL logo image.

const heroOut = "public/assets/images/home-hero/hero_layer_0.png";
const heroClean =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/hero_layer_0_clean.png";

if (fs.existsSync(heroClean)) {
  const hero = await Jimp.read(heroClean);
  const mark = await Jimp.read(LOGO_TRANS);
  // Place EL mark roughly where hexagon sat (left of name)
  // hero_layer is 1052x1024; logo/name around y~200-320, x~60-200 for icon
  mark.resize({ w: 110, h: 110 });
  // Cover old hexagon area with bg sample
  const bg = 0xff101b2c;
  for (let y = 200; y < 340; y++) {
    for (let x = 50; x < 200; x++) {
      if (x < hero.bitmap.width && y < hero.bitmap.height) {
        // only overwrite if not too far into text — conservative cover for icon slot
        if (x < 175) hero.setPixelColor(bg, x, y);
      }
    }
  }
  hero.composite(mark, 55, 215);
  hero.resize({ w: 1052, h: 1024 });
  await hero.write(heroOut);
  console.log("hero layer updated with EL logo");
}

console.log("done");
