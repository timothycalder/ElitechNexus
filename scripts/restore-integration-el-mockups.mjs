/**
 * Restore original Elitechnexus-branded GitHub / Linear / Slack integration mockups
 * (stock photos were incorrectly swapped in earlier).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const DEST = "public/assets/images";
const V = 41;

const MAP = [
  ["integration01-el.png", "integration01.png"],
  ["integration02-el.png", "integration02.png"],
  ["integration03-el.png", "integration03.png"],
  ["home-integration-mobile-1-el.png", "home-integration-mobile-1.png"],
  ["home-integration-mobile-2-el.png", "home-integration-mobile-2.png"],
  ["home-integration-mobile-3-el.png", "home-integration-mobile-3.png"],
];

for (const [srcName, destRel] of MAP) {
  const src = path.join(SRC, srcName);
  const dest = path.join(DEST, destRel);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  if (!fs.existsSync(dest)) throw new Error("missing dest " + dest);

  const meta = await sharp(dest).metadata();
  // Prefer native EL mockup size if close; otherwise fit to current slot
  const srcMeta = await sharp(src).metadata();
  const w = meta.width || srcMeta.width;
  const h = meta.height || srcMeta.height;

  const tmp = dest + ".restore.tmp.png";
  await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("restored", destRel, `${w}x${h}`);
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /\/assets\/images\/integration0([123])\.png(?:\?v=\d+)?/g,
  `/assets/images/integration0$1.png?v=${V}`
);
html = html.replace(
  /\/assets\/images\/home-integration-mobile-([123])\.png(?:\?v=\d+)?/g,
  `/assets/images/home-integration-mobile-$1.png?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("cache v=", V);
