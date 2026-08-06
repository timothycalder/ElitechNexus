/**
 * Force-fix Jasmine (p5) and Olivia (p12) with brand-new unique Asian portraits
 * using NEW filenames so browser cache cannot keep serving the old orange-wall duplicate.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const ASSETS =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const V = 91;

const jasmineSrc = path.join(ASSETS, "people-jasmine-unique.png");
const oliviaSrc = path.join(ASSETS, "people-olivia-unique.png");

const jasmineDest = "public/assets/images/people/p5-jasmine.jpg";
const oliviaDest = "public/assets/images/people/p12-olivia.jpg";

async function faceHash(f) {
  const buf = await sharp(f)
    .resize(72, 72, { fit: "cover", position: "attention" })
    .raw()
    .toBuffer();
  return crypto.createHash("md5").update(buf).digest("hex");
}

await sharp(jasmineSrc)
  .resize(720, 900, { fit: "cover", position: "attention" })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(jasmineDest);

await sharp(oliviaSrc)
  .resize(720, 900, { fit: "cover", position: "attention" })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(oliviaDest);

// Also overwrite p5.jpg / p12.jpg for any leftover refs
await sharp(jasmineSrc)
  .resize(720, 900, { fit: "cover", position: "attention" })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile("public/assets/images/people/p5.jpg");
await sharp(oliviaSrc)
  .resize(720, 900, { fit: "cover", position: "attention" })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile("public/assets/images/people/p12.jpg");

const h5 = await faceHash(jasmineDest);
const h12 = await faceHash(oliviaDest);
console.log("jasmine", h5.slice(0, 12));
console.log("olivia ", h12.slice(0, 12));
if (h5 === h12) throw new Error("still same face!");

let html = fs.readFileSync("public/index.html", "utf8");

// Point Jasmine Lim card specifically at new file
html = html.replace(
  /(<strong>Jasmine Lim<\/strong>[\s\S]*?<img src=")\/assets\/images\/people\/p5\.jpg(?:\?v=\d+)?(")/,
  `$1/assets/images/people/p5-jasmine.jpg?v=${V}$2`
);
// Point Olivia Hart card specifically at new file
html = html.replace(
  /(<strong>Olivia Hart<\/strong>[\s\S]*?<img src=")\/assets\/images\/people\/p12\.jpg(?:\?v=\d+)?(")/,
  `$1/assets/images/people/p12-olivia.jpg?v=${V}$2`
);

// Fallback: any remaining p5/p12 refs
html = html.replace(
  /\/assets\/images\/people\/p5\.jpg(?:\?v=\d+)?/g,
  `/assets/images/people/p5-jasmine.jpg?v=${V}`
);
html = html.replace(
  /\/assets\/images\/people\/p12\.jpg(?:\?v=\d+)?/g,
  `/assets/images/people/p12-olivia.jpg?v=${V}`
);

// Bump all people cache
html = html.replace(
  /(\/assets\/images\/people\/p\d+(?:-[a-z]+)?\.jpg)(?:\?v=\d+)?/g,
  `$1?v=${V}`
);

fs.writeFileSync("public/index.html", html);

// Verify HTML
const h = fs.readFileSync("public/index.html", "utf8");
const jIdx = h.indexOf("Jasmine Lim");
const oIdx = h.indexOf("Olivia Hart");
console.log("Jasmine img context:", h.slice(jIdx, jIdx + 280).replace(/\s+/g, " "));
console.log("Olivia img context:", h.slice(oIdx, oIdx + 280).replace(/\s+/g, " "));

// Uniqueness vs other people
const others = [];
for (let i = 1; i <= 15; i++) {
  if (i === 5 || i === 12) continue;
  const f = `public/assets/images/people/p${i}.jpg`;
  if (fs.existsSync(f)) others.push(f);
}
others.push(jasmineDest, oliviaDest);
const map = new Map();
for (const f of others) {
  const hash = await faceHash(f);
  if (!map.has(hash)) map.set(hash, []);
  map.get(hash).push(path.basename(f));
}
const dups = [...map.values()].filter((a) => a.length > 1);
console.log(dups.length ? "DUPS " + JSON.stringify(dups) : "all people faces unique");
console.log("done v=" + V);
