/**
 * Install user's preferred hero photos (already titled) as layers 1–3.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const ASSETS =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const V = 63;
const W = 1052;
const H = 1024;

const map = [
  {
    id: "d7886666",
    out: "hero_layer_1.png",
    label: "resume",
  },
  {
    id: "73d58087",
    out: "hero_layer_2.png",
    label: "cover letter",
  },
  {
    id: "ddbe7fba",
    out: "hero_layer_3.png",
    label: "mock interviews",
  },
];

function findSrc(id) {
  const files = fs.readdirSync(ASSETS);
  const hit = files.find((f) => f.includes(id));
  if (!hit) throw new Error("missing " + id);
  return path.join(ASSETS, hit);
}

async function install(src, dest) {
  let buf = await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  buf = await sharp(buf)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${W}" height="${H}"><rect width="100%" height="100%" rx="18" ry="18" fill="#fff"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const bak = dest.replace(/\.png$/, ".user-pref.bak.png");
  if (fs.existsSync(dest) && !fs.existsSync(bak)) fs.copyFileSync(dest, bak);

  await sharp(buf).png().toFile(dest);
  await sharp(buf).webp({ quality: 90 }).toFile(dest.replace(/\.png$/, ".webp"));
  console.log("ok", path.basename(dest), "from", path.basename(src));
}

for (const m of map) {
  const src = findSrc(m.id);
  await install(src, path.join(HERO, m.out));
}

let html = fs.readFileSync("public/index.html", "utf8");
for (const n of [1, 2, 3]) {
  html = html.replace(
    new RegExp(
      `/assets/images/home-hero/hero_layer_${n}\\.(png|webp)\\?v=\\d+`,
      "g"
    ),
    `/assets/images/home-hero/hero_layer_${n}.$1?v=${V}`
  );
}
fs.writeFileSync("public/index.html", html);
console.log("cache bump v=" + V);
