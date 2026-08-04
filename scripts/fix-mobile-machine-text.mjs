/**
 * On current bento-mobile03: replace "Use Devin's Machine" → "Use Elitechnexus Machine"
 * without touching the Shell EL logo / title we already fixed.
 */
import fs from "fs";
import sharp from "sharp";

const FILE = "public/assets/images/bento-mobile03.png";
const GREEN = { r: 107, g: 236, b: 205, alpha: 255 };

const { data, info } = await sharp(FILE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const C = 4;

function isMint(i) {
  const r = data[i],
    g = data[i + 1],
    b = data[i + 2];
  return g > 180 && g > r + 40 && g > b + 20 && r < 180;
}

// Find first mint band (the green panel)
let firstY = -1;
for (let y = 90; y < 220; y++) {
  let c = 0;
  for (let x = 100; x < 560; x++) if (isMint((y * W + x) * C)) c++;
  if (c > 40) {
    firstY = y;
    break;
  }
}
if (firstY < 0) {
  console.log("no mint band");
  process.exit(0);
}
let lastY = firstY;
for (let y = firstY; y < 220; y++) {
  let c = 0;
  for (let x = 100; x < 560; x++) if (isMint((y * W + x) * C)) c++;
  if (c < 30) break;
  lastY = y;
  if (lastY - firstY > 75) break;
}
let minX = W,
  maxX = 0;
for (let y = firstY; y <= lastY; y++) {
  for (let x = 100; x < W; x++) {
    if (isMint((y * W + x) * C)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }
}
console.log("mint band", { minX, maxX, minY: firstY, maxY: lastY });

const left = minX + 4;
const top = firstY + 3;
const width = Math.min(maxX - 4, minX + 420) - left;
const height = lastY - 3 - top;
const patch = await sharp({
  create: { width, height, channels: 4, background: GREEN },
})
  .png()
  .toBuffer();

const textY = Math.round((firstY + lastY) / 2 + 5);
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${info.height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${minX + 18}" y="${textY}"
    font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="22" font-weight="600" fill="#0b1a14">Use Elitechnexus Machine</text>
</svg>`;
const textBuf = await sharp(Buffer.from(svg)).png().toBuffer();

let buf = await sharp(FILE).ensureAlpha().png().toBuffer();
buf = await sharp(buf)
  .composite([
    { input: patch, left, top },
    { input: textBuf, left: 0, top: 0 },
  ])
  .png()
  .toBuffer();

await sharp(buf).toFile(FILE);
await sharp(buf)
  .extract({ left: 20, top: 40, width: 400, height: 160 })
  .png()
  .toFile("scripts/_mob-final.png");
console.log("patched Use Elitechnexus Machine");
