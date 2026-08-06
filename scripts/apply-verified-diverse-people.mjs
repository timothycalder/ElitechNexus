/**
 * Apply ONLY visually verified real stock portraits to female Meet Our People cards.
 * Jasmine + Olivia → European professionals (new filenames for cache bust).
 * Mix: young EU, mature, Black professionals, varied office/outdoor backgrounds.
 * Unique once. Similar professional attire + portrait framing.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const V = 94;
const POOL = "public/assets/images/people/verify-pool";

async function faceHash(f) {
  const buf = await sharp(f)
    .resize(72, 72, { fit: "cover", position: "attention" })
    .raw()
    .toBuffer();
  return crypto.createHash("md5").update(buf).digest("hex");
}

async function writePeople(src, dest) {
  if (!fs.existsSync(src)) throw new Error("missing src " + src);
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .sharpen({ sigma: 0.4 })
    .jpeg({ quality: 91, mozjpeg: true })
    .toFile(dest);
  console.log("→", path.basename(dest), "←", path.basename(src));
}

// Verified picks (checked with vision):
const assign = {
  // Jasmine Lim — European, white blouse, office
  "p5-jasmine.jpg": "d.jpg",
  // Olivia Hart — European, white blazer, city outdoor (different person)
  "p12-olivia.jpg": "f.jpg",
  // Ana Reyes — mature professional, office
  "p1.jpg": "j.jpg",
  // Isabella Cruz — Black professional, pink blazer, whiteboard
  "p3.jpg": "e.jpg",
  // Andrea Villanueva — European, beige blazer, outdoor green bg
  "p7.jpg": "k.jpg",
  // Patricia Ong — Black professional, grey blazer, bright office
  "p9.jpg": "m.jpg",
  // Emma Collins — Black professional, blue shirt + tie, office
  "p14.jpg": "l.jpg",
};

const usedHashes = new Set();
for (const [destName, srcName] of Object.entries(assign)) {
  const src = path.join(POOL, srcName);
  const h = await faceHash(src);
  if (usedHashes.has(h)) throw new Error("duplicate source " + srcName);
  usedHashes.add(h);
  const dest = path.join("public/assets/images/people", destName);
  await writePeople(src, dest);
  if (destName === "p5-jasmine.jpg") {
    await writePeople(src, "public/assets/images/people/p5.jpg");
  }
  if (destName === "p12-olivia.jpg") {
    await writePeople(src, "public/assets/images/people/p12.jpg");
  }
}

// Audit all 15 people cards for uniqueness
const checkFiles = [];
for (let i = 1; i <= 15; i++) {
  if (i === 5) checkFiles.push("public/assets/images/people/p5-jasmine.jpg");
  else if (i === 12) checkFiles.push("public/assets/images/people/p12-olivia.jpg");
  else checkFiles.push(`public/assets/images/people/p${i}.jpg`);
}
const byHash = new Map();
for (const f of checkFiles) {
  const h = await faceHash(f);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(path.basename(f));
}
const dups = [...byHash.values()].filter((a) => a.length > 1);
if (dups.length) {
  console.error("UNIQUE FAIL", dups);
  process.exitCode = 1;
} else {
  console.log("UNIQUE OK —", byHash.size, "distinct people");
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /(\/assets\/images\/people\/p\d+(?:-[a-z]+)?\.jpg)(?:\?v=\d+)?/g,
  `$1?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("done v=" + V);
