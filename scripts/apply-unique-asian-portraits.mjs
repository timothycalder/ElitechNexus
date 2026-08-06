/**
 * Apply 6 uniquely generated Asian portraits — one destination each.
 * Keep asianWomanSmile ONLY on hero_layer_3.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const V = 90;
const ASSETS =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const HERO = "public/assets/images/home-hero";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function faceHash(f) {
  const buf = await sharp(f)
    .resize(72, 72, { fit: "cover", position: "attention" })
    .raw()
    .toBuffer();
  return crypto.createHash("md5").update(buf).digest("hex");
}

async function peopleJpg(src, dest) {
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 91, mozjpeg: true })
    .toFile(dest);
  console.log("people", path.basename(dest));
}

async function makeLayer(src, dest, title, subtitle, position = "attention") {
  const W = 1052;
  const H = 1024;
  const photo = await sharp(src)
    .resize(W, H, { fit: "cover", position, kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 0.98, saturation: 1.01 })
    .sharpen({ sigma: 0.45 })
    .png()
    .toBuffer();
  const badgeY = H - 130;
  const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="42%" stop-color="#071018" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${badgeY}" width="700" height="86" rx="16"
      fill="rgba(8,16,28,0.82)" stroke="rgba(110,220,200,0.5)"/>
    <text x="56" y="${badgeY + 36}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${badgeY + 64}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(subtitle)}</text>
  </svg>`);
  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: overlay, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  await sharp(dest).webp({ quality: 82 }).toFile(dest.replace(/\.png$/i, ".webp"));
  console.log("layer", path.basename(dest));
}

const map = {
  p3: path.join(ASSETS, "uniq-asian-p3.png"),
  p5: path.join(ASSETS, "uniq-asian-p5.png"),
  p7: path.join(ASSETS, "uniq-asian-p7.png"),
  p9: path.join(ASSETS, "uniq-asian-p9.png"),
  p12: path.join(ASSETS, "uniq-asian-p12.png"),
};
for (const [name, src] of Object.entries(map)) {
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  await peopleJpg(src, `public/assets/images/people/${name}.jpg`);
}

await makeLayer(
  path.join(ASSETS, "uniq-asian-hero2.png"),
  path.join(HERO, "hero_layer_2.png"),
  "How to write a cover letter",
  "Tell your story so employers and clients trust your proof",
  "attention"
);

// smile remains ONLY on layer 3 — rebuild from verified source to be sure
await makeLayer(
  "public/assets/images/career-prep/real-v2/asianWomanSmile.jpg",
  path.join(HERO, "hero_layer_3.png"),
  "Mock interviews that stick",
  "Live practice with feedback until your answers land",
  "north"
);

// career-prep copies must not reuse smile or people faces
await sharp(path.join(ASSETS, "uniq-asian-p5.png"))
  .resize(1200, 1200, { fit: "cover", position: "attention" })
  .png()
  .toFile("public/assets/images/career-prep/write-cover-letter.png");
// wait — p5 people already uses this. UNIQUE RULE: career-prep cannot reuse p5.
// Use leftover pool / regenerate assignment: write-cover uses hero2 source? hero2 is layer.
// Better: leave write-cover from a source NOT used on live homepage faces.
// hero_layer_2 uses uniq-asian-hero2 — don't reuse.
// people use p3,p5,p7,p9,p12 gens.
// So write-cover and interview-questions need OTHER images — keep previous unique stock
// that aren't on people/hero, OR skip rewriting them if already unique.

// Revert career-prep to unique non-people sources already on disk that aren't smile:
// skills currently asianWomanMeeting — keep
// write-cover was asianWomanPortrait — OK if not on people
// interview-questions was w_glasses — OK if not on people

await sharp("public/assets/images/career-prep/real-v2/asianWomanPortrait.jpg")
  .resize(1200, 1200, { fit: "cover", position: "attention" })
  .png()
  .toFile("public/assets/images/career-prep/write-cover-letter.png");
await sharp("public/assets/images/unique/once-pool/w_glasses.jpg")
  .resize(1200, 1200, { fit: "cover", position: "attention" })
  .png()
  .toFile("public/assets/images/career-prep/interview-questions.png");

// Audit LIVE faces only (homepage visible)
const live = [
  ...[1, 2, 3, 4].map((i) => path.join(HERO, `hero_layer_${i}.png`)),
  ...Array.from({ length: 15 }, (_, i) => `public/assets/images/people/p${i + 1}.jpg`),
];
const byHash = new Map();
for (const f of live) {
  if (!fs.existsSync(f)) continue;
  const h = await faceHash(f);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(path.basename(f));
}
const collisions = [...byHash.entries()].filter(([, a]) => a.length > 1);
if (collisions.length) {
  console.error("UNIQUE FAIL", collisions);
  process.exitCode = 1;
} else {
  console.log("UNIQUE OK", byHash.size, "distinct among hero+people");
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/(\/assets\/images\/people\/p\d+\.jpg)(?:\?v=\d+)?/g, `$1?v=${V}`);
html = html.replace(
  /src="\/_astro\/hoisted\.Dadqo-kW\.js(?:\?v=\d+)?"/,
  `src="/_astro/hoisted.Dadqo-kW.js?v=${V}"`
);
fs.writeFileSync("public/index.html", html);
console.log("done v=" + V);
