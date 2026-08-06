/**
 * Replace duplicate-face portraits so every Meet Our People card is unique.
 * Duplicates found:
 * - p3 & p5 same woman (1581065178*)
 * - p4 & p8 same man (1543132220*)
 * - p2 & p10 same man (1720501828*)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const POOL = "public/assets/images/people";
const V = 82;
fs.mkdirSync(POOL, { recursive: true });

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest), (fs.statSync(dest).size / 1024).toFixed(0) + "kb");
}

async function portrait(src, dest) {
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90 })
    .toFile(dest);
  console.log("portrait", path.basename(dest));
}

/** Distinct people — NOT from the same Unsplash shoot as existing cards */
const replacements = [
  {
    file: "p5.jpg",
    // Asian woman (different from p3's blazer shoot)
    url: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=900&q=85",
  },
  {
    file: "p8.jpg",
    // Asian man outdoor — different from p4 suit shoot
    url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=85",
  },
  {
    file: "p10.jpg",
    // Asian man curly/blue backdrop — different from p2 window shoot
    url: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&w=900&q=85",
  },
];

for (const p of replacements) {
  const raw = path.join(POOL, "raw-" + p.file);
  await download(p.url, raw);
  await portrait(raw, path.join(POOL, p.file));
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /(\/assets\/images\/people\/p\d+\.jpg)\?v=\d+/g,
  `$1?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("replaced duplicate faces; cache v=" + V);
