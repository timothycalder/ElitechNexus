import { Jimp, loadFont } from "jimp";
import { copyFileSync, existsSync } from "fs";

const orig = "public/assets/images/home-hero/hero_layer_0.orig.png";
const out = "public/assets/images/home-hero/hero_layer_0.png";
if (!existsSync(orig)) copyFileSync(out, orig);

const img = await Jimp.read(orig);

// Solid covers matching card background
const bgTop = 0xff0e1828;
const bgName = 0xff101b2c;

function cover(x, y, w, h, color) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      if (px >= 0 && py >= 0 && px < img.bitmap.width && py < img.bitmap.height) {
        img.setPixelColor(color, px, py);
      }
    }
  }
}

// Top slogan region
cover(30, 78, 780, 42, bgTop);
// Main Devin name region (y~248-306)
cover(140, 248, 760, 58, bgName);

// Print with built-in bitmap fonts
const fontSm = await loadFont("node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt").catch(() => null);
const fontLg = await loadFont("node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt").catch(() => null);

// Try common jimp v1 / v0 font paths
async function tryFont(paths) {
  for (const p of paths) {
    try {
      return await loadFont(p);
    } catch {}
  }
  return null;
}

const small = await tryFont([
  "node_modules/jimp/fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt",
  "node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt",
]);
const large = await tryFont([
  "node_modules/jimp/fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt",
  "node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt",
]);

console.log("fonts", !!small, !!large);

if (small) {
  await img.print({ font: small, x: 42, y: 90, text: "Build more with Elitechnexus" });
}
if (large) {
  await img.print({ font: large, x: 150, y: 260, text: "Elitechnexus" });
}

await img.write(out);
console.log("wrote", out);
