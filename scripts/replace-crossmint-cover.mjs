/**
 * Replace Crossmint cover (logo overlay) with the clean canyon still.
 * Fits landscape source into existing portrait cover / og sizes.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-8bfea786-1e5a-4fb5-abb4-9c0d6941bb0d.png";

const DIR = "public/assets/images/case-studies/crossmint";
const COVER = path.join(DIR, "cover.webp");
const OG = path.join(DIR, "ogimage.jpg");
const STILL = path.join(DIR, "cover-still.png");
const V = "9";

const w = 718;
const h = 900;
const tmpWebp = path.join(DIR, "cover.tmp.webp");
const tmpOg = path.join(DIR, "ogimage.tmp.jpg");

await sharp(SRC)
  .resize(w, h, { fit: "cover", position: "centre" })
  .png()
  .toFile(STILL);

await sharp(STILL).webp({ quality: 90 }).toFile(tmpWebp);
fs.copyFileSync(tmpWebp, COVER);
fs.unlinkSync(tmpWebp);

await sharp(SRC)
  .resize(600, 315, { fit: "cover", position: "centre" })
  .jpeg({ quality: 88 })
  .toFile(tmpOg);
fs.copyFileSync(tmpOg, OG);
fs.unlinkSync(tmpOg);

function bump(file, patterns) {
  let html = fs.readFileSync(file, "utf8");
  let n = 0;
  for (const [re, rep] of patterns) {
    const next = html.replace(re, (...args) => {
      n++;
      return typeof rep === "function" ? rep(...args) : rep;
    });
    html = next;
  }
  fs.writeFileSync(file, html);
  return n;
}

const coverRe = /assets\/images\/case-studies\/crossmint\/cover\.webp(?:\?v=\d+)?/g;
const coverRep = `assets/images/case-studies/crossmint/cover.webp?v=${V}`;
const ogRe = /assets\/images\/case-studies\/crossmint\/ogimage\.jpg(?:\?v=\d+)?/g;
const ogRep = `assets/images/case-studies/crossmint/ogimage.jpg?v=${V}`;

const cs = bump("public/customers/crossmint/index.html", [
  [coverRe, coverRep],
  [ogRe, ogRep],
]);
const list = bump("public/customers/index.html", [
  [coverRe, coverRep],
]);

const outMeta = await sharp(COVER).metadata();
console.log(`cover ${outMeta.width}x${outMeta.height} webp`);
console.log(`updated crossmint page refs: ${cs}, customers index: ${list}, v=${V}`);
