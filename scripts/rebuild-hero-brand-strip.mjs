/**
 * Rebuild brand strip on hero_layer_0:
 * wipe logo+name region with true plate gradient, redraw EL (transparent) + Elitechnexus text.
 */
import fs from "fs";
import sharp from "sharp";

const DEST = "public/assets/images/home-hero/hero_layer_0.png";
const LOGO_SVG = "public/assets/images/elitechnexus-logo.svg";
const V = 46;

const { data, info } = await sharp(DEST)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const buf = Buffer.from(data);

// Brand strip covering logo + "Elitechnexus" word
const minX = 40;
const maxX = 520;
const minY = 190;
const maxY = 350;

// Fill each row from LEFT margin sample (true plate, no white text)
for (let y = minY; y <= maxY; y++) {
  // Blend left and far-right samples for horizontal continuity
  const leftX = 18;
  const rightX = Math.min(W - 20, 900);
  const li = (y * W + leftX) * 4;
  const ri = (y * W + rightX) * 4;
  const lr = buf[li],
    lg = buf[li + 1],
    lb = buf[li + 2];
  const rr = buf[ri],
    rg = buf[ri + 1],
    rb = buf[ri + 2];

  for (let x = minX; x <= maxX; x++) {
    const t = (x - minX) / (maxX - minX);
    // Bias toward left sample (brand lives on left; far right may be darker)
    const u = t * 0.35;
    const i = (y * W + x) * 4;
    buf[i] = Math.round(lr * (1 - u) + rr * u);
    buf[i + 1] = Math.round(lg * (1 - u) + rg * u);
    buf[i + 2] = Math.round(lb * (1 - u) + rb * u);
    buf[i + 3] = 255;
  }
}

const base = await sharp(buf, {
  raw: { width: W, height: H, channels: 4 },
})
  .png()
  .toBuffer();

const el = await sharp(fs.readFileSync(LOGO_SVG))
  .resize(112, 68, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

// Match original typography position roughly
const nameSvg = Buffer.from(`<svg width="400" height="80" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="52" fill="#F2FFFB" font-family="Arial,Helvetica,sans-serif"
    font-size="40" font-weight="700">Elitechnexus</text>
</svg>`);

const tmp = DEST + ".tmp.png";
await sharp(base)
  .composite([
    { input: el, left: 52, top: 236 },
    { input: nameSvg, left: 175, top: 228 },
  ])
  .png()
  .toFile(tmp);
fs.copyFileSync(tmp, DEST);
fs.unlinkSync(tmp);

await sharp(DEST)
  .extract({ left: 20, top: 150, width: 560, height: 240 })
  .png()
  .toFile("public/assets/images/home-hero/_logo-fix-preview.png");

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_0\.png(?:\?v=\d+)?/g, `hero_layer_0.png?v=${V}`);
fs.writeFileSync("public/index.html", html);
console.log("brand strip rebuilt v=", V);
