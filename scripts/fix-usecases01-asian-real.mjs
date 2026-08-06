/**
 * Replace Full-time careers use-case photo with realistic Asian woman meeting scene.
 * One-use only — new face not used elsewhere on the site.
 */
import fs from "fs";
import sharp from "sharp";

const V = 92;
const SRC =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/use-cases01-asian-real-v2.png";
const DEST = "public/assets/images/use-cases01.png";
const DEST_MOBILE = "public/assets/images/use-cases-mobile01.png";

if (!fs.existsSync(SRC)) throw new Error("missing " + SRC);

const bak = DEST + ".pre-asian.bak";
if (fs.existsSync(DEST) && !fs.existsSync(bak)) fs.copyFileSync(DEST, bak);

const meta = await sharp(DEST).metadata();
const w = meta.width || 1350;
const h = meta.height || 744;

await sharp(SRC)
  .resize(w, h, { fit: "cover", position: "centre" })
  .sharpen({ sigma: 0.55 })
  .modulate({ brightness: 1.01, saturation: 0.98 })
  .png({ quality: 92 })
  .toFile(DEST + ".tmp.png");
fs.renameSync(DEST + ".tmp.png", DEST);
console.log("wrote", DEST, w + "x" + h);

// Mobile crop of same unique scene (still one source family, but same slide — OK)
if (fs.existsSync(DEST_MOBILE)) {
  const mbak = DEST_MOBILE + ".pre-asian.bak";
  if (!fs.existsSync(mbak)) fs.copyFileSync(DEST_MOBILE, mbak);
  const mm = await sharp(DEST_MOBILE).metadata();
  await sharp(SRC)
    .resize(mm.width || 550, mm.height || 520, {
      fit: "cover",
      position: "attention",
    })
    .sharpen({ sigma: 0.55 })
    .png()
    .toFile(DEST_MOBILE + ".tmp.png");
  fs.renameSync(DEST_MOBILE + ".tmp.png", DEST_MOBILE);
  console.log("wrote", DEST_MOBILE);
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /(\/assets\/images\/use-cases01\.png)(?:\?v=\d+)?/g,
  `$1?v=${V}`
);
html = html.replace(
  /(\/assets\/images\/use-cases-mobile01\.png)(?:\?v=\d+)?/g,
  `$1?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("cache v=" + V);
