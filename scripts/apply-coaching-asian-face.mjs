/**
 * Replace coaching photo with Asian-face revision and rebuild bento 03 assets.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "public/assets/images";
const POOL = path.join(DIR, "unique/bento-match-v1");
const SRC_PNG =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/coaching-asian-realistic.png";
const V = 87;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function photoCard(src, dest, w, h, title, sub, { phone = false } = {}) {
  const bak = dest + ".pre-asian.bak";
  if (fs.existsSync(dest) && !fs.existsSync(bak)) fs.copyFileSync(dest, bak);

  let photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "attention" })
    .modulate({ brightness: 1.02, saturation: 0.98 })
    .sharpen({ sigma: 0.7 })
    .png()
    .toBuffer();

  const badgeW = Math.min(w - 40, phone ? w - 48 : Math.floor(w * 0.92));
  const badgeH = phone ? 78 : Math.max(72, Math.round(h * 0.14));
  const badgeX = phone ? 20 : 28;
  const badgeY = h - badgeH - (phone ? 20 : 24);
  const titleSize = phone
    ? 18
    : Math.max(15, Math.min(28, Math.round(w * 0.035)));
  const subSize = phone ? 12 : Math.max(11, Math.min(16, Math.round(w * 0.02)));

  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="30%" stop-color="#071018" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="14"
      fill="rgba(8,16,28,0.86)" stroke="rgba(110,220,200,0.45)"/>
    <text x="${badgeX + 16}" y="${badgeY + Math.round(badgeH * 0.42)}" fill="#E8FFF8"
      font-family="Arial,Helvetica,sans-serif" font-size="${titleSize}" font-weight="700">${esc(title)}</text>
    <text x="${badgeX + 16}" y="${badgeY + Math.round(badgeH * 0.72)}" fill="rgba(200,230,220,0.92)"
      font-family="Arial,Helvetica,sans-serif" font-size="${subSize}">${esc(sub)}</text>
  </svg>`);

  let out = await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
  const radius = phone ? 28 : 22;
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
  console.log("wrote", path.basename(dest), w + "x" + h);
}

if (!fs.existsSync(SRC_PNG)) {
  throw new Error("missing generated source: " + SRC_PNG);
}

fs.mkdirSync(POOL, { recursive: true });
const coachingJpg = path.join(POOL, "coaching.jpg");
if (fs.existsSync(coachingJpg) && !fs.existsSync(coachingJpg + ".pre-asian.bak")) {
  fs.copyFileSync(coachingJpg, coachingJpg + ".pre-asian.bak");
}

await sharp(SRC_PNG)
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(coachingJpg);
console.log("updated coaching.jpg");

await sharp(SRC_PNG)
  .png()
  .toFile(path.join(POOL, "coaching-asian.png"));

await photoCard(
  coachingJpg,
  path.join(DIR, "bento03.png"),
  900,
  700,
  "Interview & job coaching",
  "Practice until answers land"
);
await photoCard(
  coachingJpg,
  path.join(DIR, "bento-mobile03.png"),
  610,
  494,
  "Interview coaching",
  "Practice until answers land",
  { phone: true }
);
await photoCard(
  coachingJpg,
  path.join(DIR, "card03-line.png"),
  266,
  540,
  "Coaching",
  "Senior review & mock interviews"
);
await photoCard(
  coachingJpg,
  path.join(DIR, "bento-hover03.png"),
  1288,
  628,
  "Interview & job coaching",
  "Live practice with senior feedback"
);

let html = fs.readFileSync("public/index.html", "utf8");
const files = ["bento03.png", "bento-mobile03.png", "card03-line.png", "bento-hover03.png"];
for (const f of files) {
  const before = html;
  html = html.replace(
    new RegExp(`(/assets/images/${f.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
    `$1?v=${V}`
  );
  console.log(f, before === html ? "not in html" : "bumped");
}
fs.writeFileSync("public/index.html", html);

// Where else might the old coaching face appear?
const hits = [];
for (const root of ["public"]) {
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules" || ent.name === ".git") continue;
        walk(p);
      } else if (/\.(html|js|css|mjs)$/i.test(ent.name)) {
        const t = fs.readFileSync(p, "utf8");
        if (t.includes("bento03") || t.includes("card03-line") || t.includes("bento-mobile03")) {
          hits.push(p);
        }
      }
    }
  };
  walk(root);
}
console.log("refs:", hits.join(", ") || "(none)");
console.log("done v=" + V);
