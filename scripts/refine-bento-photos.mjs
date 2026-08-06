/**
 * Soften bento photos: replace high-five / weak matches with serious professional scenes.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "public/assets/images";
const POOL = path.join(DIR, "unique/bento-match-v1");
const V = 65;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function photoCard(src, dest, w, h, title, sub, phone = false) {
  let photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.9, saturation: 0.95 })
    .png()
    .toBuffer();

  const badgeW = Math.min(w - 40, phone ? w - 48 : Math.floor(w * 0.92));
  const badgeH = phone ? 78 : Math.max(72, Math.round(h * 0.16));
  const badgeX = 20;
  const badgeY = h - badgeH - 20;
  const titleSize = phone ? 18 : Math.max(15, Math.min(22, Math.round(w * 0.065)));
  const subSize = phone ? 12 : Math.max(11, Math.min(14, Math.round(w * 0.04)));

  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="30%" stop-color="#071018" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="14"
      fill="rgba(8,16,28,0.86)" stroke="rgba(110,220,200,0.45)"/>
    <text x="${badgeX + 16}" y="${badgeY + Math.round(badgeH * 0.42)}" fill="#E8FFF8"
      font-family="Arial,Helvetica,sans-serif" font-size="${titleSize}" font-weight="700">${esc(title)}</text>
    <text x="${badgeX + 16}" y="${badgeY + Math.round(badgeH * 0.72)}" fill="rgba(200,230,220,0.92)"
      font-family="Arial,Helvetica,sans-serif" font-size="${subSize}">${esc(sub)}</text>
  </svg>`);

  let out = await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
  const radius = phone ? 28 : 18;
  out = await sharp(out)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${w}" height="${h}"><rect width="100%" height="100%" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  await sharp(out).png().toFile(dest);
  console.log("wrote", path.basename(dest));
}

// Serious client / delivery meeting
await download(
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=85",
  path.join(POOL, "projects2.jpg")
);
// Professional portrait suitable for job placement (confident candidate)
await download(
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1400&q=85",
  path.join(POOL, "jobs2.jpg")
);

await photoCard(
  path.join(POOL, "jobs2.jpg"),
  path.join(DIR, "bento-mobile01.png"),
  612,
  590,
  "Full-time job support",
  "Resume, interviews, and placement prep",
  true
);
await photoCard(
  path.join(POOL, "jobs2.jpg"),
  path.join(DIR, "card01.png"),
  266,
  460,
  "Full-time jobs",
  "Resume · interviews · offers",
  false
);

await photoCard(
  path.join(POOL, "projects2.jpg"),
  path.join(DIR, "bento-mobile02.png"),
  554,
  540,
  "Project & delivery",
  "Proposals, clients, and shipped work",
  true
);
await photoCard(
  path.join(POOL, "projects2.jpg"),
  path.join(DIR, "card02-line.png"),
  264,
  466,
  "Projects",
  "Delivery that clients trust",
  false
);

let html = fs.readFileSync("public/index.html", "utf8");
for (const f of [
  "card01.png",
  "bento-mobile01.png",
  "card02-line.png",
  "bento-mobile02.png",
]) {
  html = html.replace(
    new RegExp(`(/assets/images/${f.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
    `$1?v=${V}`
  );
}
fs.writeFileSync("public/index.html", html);
console.log("bumped", V);
