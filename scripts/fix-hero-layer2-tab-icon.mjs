/**
 * Clean hero_layer_2 Shell-tab Devin molecule → natural EL icon only.
 */
import fs from "fs";
import sharp from "sharp";

const SRC = "public/assets/images/home-hero/hero_layer_2.pre-el.png";
const DEST = "public/assets/images/home-hero/hero_layer_2.png";
const LOGO = "public/assets/images/elitechnexus-logo.svg";

// Exact molecule region (left of "Shell" label)
const minX = 89;
const minY = 87;
const maxX = 118;
const maxY = 119;
const pad = 3;
const left = minX - pad;
const top = minY - pad;
const bw = maxX - minX + 1 + pad * 2;
const bh = maxY - minY + 1 + pad * 2;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const sx = Math.min(W - 1, maxX + 10);
const sy = Math.floor((minY + maxY) / 2);
const si = (sy * W + sx) * 4;
const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

const cover = await sharp({
  create: { width: bw, height: bh, channels: 4, background: bg },
})
  .png()
  .toBuffer();

const icon = 26;
const elBuf = await sharp(fs.readFileSync(LOGO))
  .resize(Math.round(icon * 0.9), Math.round(icon * 0.55), {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .ensureAlpha()
  .png()
  .toBuffer();

const mark = await sharp({
  create: {
    width: icon,
    height: icon,
    channels: 4,
    background: { r: bg.r, g: bg.g, b: bg.b, alpha: 255 },
  },
})
  .composite([
    {
      input: elBuf,
      left: Math.round((icon - Math.round(icon * 0.9)) / 2),
      top: Math.round((icon - Math.round(icon * 0.55)) / 2),
    },
  ])
  .png()
  .toBuffer();

const meta = await sharp(mark).metadata();
const ox = left + Math.round((bw - meta.width) / 2);
const oy = top + Math.round((bh - meta.height) / 2);

await sharp(SRC)
  .composite([
    { input: cover, left, top },
    { input: mark, left: ox, top: oy },
  ])
  .png()
  .toFile(DEST);

console.log("hero_layer_2 cleaned", { left, top, bw, bh, ox, oy });
