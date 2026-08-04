import fs from "fs";
import path from "path";
import sharp from "sharp";

const srcDir =
  "C:\\Users\\AI ML Engineer\\.cursor\\projects\\d-Company-Website-ElitechNexus\\assets";
const destDir = "public/assets/images/home-hero";
const backupDir = path.join(destDir, "_backup-devin-thumbs");

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const ids = [0, 1, 2, 3, 4];

for (const id of ids) {
  const src = path.join(srcDir, `hero-steps-${id}-thumb-el.png`);
  const oldWebp = path.join(destDir, `hero-steps-${id}-thumb.webp`);
  const outPng = path.join(destDir, `hero-steps-${id}-thumb.png`);
  const outWebp = path.join(destDir, `hero-steps-${id}-thumb-el.webp`);
  const backup = path.join(backupDir, `hero-steps-${id}-thumb.webp`);

  if (!fs.existsSync(src)) {
    console.error("missing", src);
    continue;
  }

  if (fs.existsSync(oldWebp) && !fs.existsSync(backup)) {
    try {
      fs.copyFileSync(oldWebp, backup);
    } catch (e) {
      console.warn("backup skip", e.message);
    }
  }

  let w = 750,
    h = 497;
  try {
    const meta = await sharp(oldWebp).metadata();
    if (meta.width) w = meta.width;
    if (meta.height) h = meta.height;
  } catch {}

  await sharp(src).resize(w, h, { fit: "cover" }).png().toFile(outPng);
  await sharp(src)
    .resize(w, h, { fit: "cover" })
    .webp({ quality: 88 })
    .toFile(outWebp);

  // Try overwrite original webp; if locked, HTML will point to -el.webp / .png
  try {
    fs.copyFileSync(outWebp, oldWebp);
    console.log("overwrote", oldWebp);
  } catch (e) {
    console.warn("could not overwrite webp (locked?):", e.message);
  }

  console.log("wrote", outPng, outWebp, `${w}x${h}`);
}

console.log("done");
