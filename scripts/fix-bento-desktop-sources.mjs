/**
 * Fix bento desktop sources: bento01/02/03.png still showed old AI mockups.
 * Also hard-hide the Add-knowledge HTML overlay on item 01.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "public/assets/images";
const POOL = path.join(DIR, "unique/bento-match-v1");
const V = 70;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 20000) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function photoCard(src, dest, w, h, title, sub) {
  const bak = dest + ".old-mockup.bak";
  if (fs.existsSync(dest) && !fs.existsSync(bak)) fs.copyFileSync(dest, bak);

  let photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.9, saturation: 0.95 })
    .png()
    .toBuffer();

  const badgeH = Math.max(78, Math.round(h * 0.14));
  const badgeY = h - badgeH - 24;
  const titleSize = Math.max(18, Math.min(28, Math.round(w * 0.035)));
  const subSize = Math.max(13, Math.min(16, Math.round(w * 0.02)));

  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="35%" stop-color="#071018" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.9"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="28" y="${badgeY}" width="${Math.min(w - 56, 520)}" height="${badgeH}" rx="16"
      fill="rgba(8,16,28,0.86)" stroke="rgba(110,220,200,0.45)"/>
    <text x="48" y="${badgeY + Math.round(badgeH * 0.42)}" fill="#E8FFF8"
      font-family="Arial,Helvetica,sans-serif" font-size="${titleSize}" font-weight="700">${esc(title)}</text>
    <text x="48" y="${badgeY + Math.round(badgeH * 0.72)}" fill="rgba(200,230,220,0.92)"
      font-family="Arial,Helvetica,sans-serif" font-size="${subSize}">${esc(sub)}</text>
  </svg>`);

  let out = await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
  out = await sharp(out)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${w}" height="${h}"><rect width="100%" height="100%" rx="22" ry="22" fill="#fff"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  await sharp(out).png().toFile(dest);
  console.log("wrote", path.basename(dest), w + "x" + h);
}

// Prefer already-downloaded good sources; refresh if missing
const jobsSrc = path.join(POOL, "jobs2.jpg");
const projectsSrc = path.join(POOL, "projects2.jpg");
const coachingSrc = path.join(POOL, "coaching.jpg");

await download(
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1600&q=85",
  jobsSrc
);
await download(
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=85",
  projectsSrc
);
await download(
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=85",
  coachingSrc
);

// Desktop picture sources (these were the leftover mockups)
await photoCard(jobsSrc, path.join(DIR, "bento01.png"), 900, 700, "Full-time job support", "Resume, interviews, and placement prep");
await photoCard(projectsSrc, path.join(DIR, "bento02.png"), 900, 700, "Project & delivery", "Proposals, clients, and shipped work");
await photoCard(coachingSrc, path.join(DIR, "bento03.png"), 900, 700, "Interview & job coaching", "Practice until answers land");

// Keep mobile/card/hover in sync too
await photoCard(jobsSrc, path.join(DIR, "bento-mobile01.png"), 612, 590, "Full-time job support", "Resume, interviews, and placement prep");
await photoCard(projectsSrc, path.join(DIR, "bento-mobile02.png"), 554, 540, "Project & delivery", "Proposals, clients, and shipped work");
await photoCard(coachingSrc, path.join(DIR, "bento-mobile03.png"), 610, 494, "Interview coaching", "Practice until answers land");
await photoCard(jobsSrc, path.join(DIR, "card01.png"), 266, 460, "Full-time jobs", "Resume · interviews · offers");
await photoCard(projectsSrc, path.join(DIR, "card02-line.png"), 264, 466, "Projects", "Delivery that clients trust");
await photoCard(coachingSrc, path.join(DIR, "card03-line.png"), 266, 540, "Coaching", "Senior review & mock interviews");
await photoCard(coachingSrc, path.join(DIR, "bento-hover03.png"), 1288, 628, "Interview & job coaching", "Live practice with senior feedback");

let html = fs.readFileSync("public/index.html", "utf8");

// Bump all related cache versions
const files = [
  "bento01.png",
  "bento02.png",
  "bento03.png",
  "bento-mobile01.png",
  "bento-mobile02.png",
  "bento-mobile03.png",
  "bento-hover03.png",
  "card01.png",
  "card02-line.png",
  "card03-line.png",
];
for (const f of files) {
  html = html.replace(
    new RegExp(`(/assets/images/${f.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
    `$1?v=${V}`
  );
}

// Hard-hide Add knowledge HTML overlay + fail/success buttons
const hideCss = `<style id="elitechnexus-bento-hide-mockups">
#home-bento__item-01-visual-wrapper,
#home-bento__item-01-visual-label,
#home-bento__item-01-visual-textbox,
#home-bento__item-01-visual-button-pulse,
#home-bento__item-01-visual-button-success,
#home-bento__item-01-visual-button-fail,
#home-bento__item-image-main-wrapper-dot,
#home-bento__item-03-hover {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}
#home-bento__item-01 .home-bento__item-image-main-wrapper img,
#home-bento__item-02 .home-bento__item-image-main-wrapper img,
#home-bento__item-03 .home-bento__item-image-main-wrapper img,
#home-bento picture img {
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 18px !important;
  max-width: 100% !important;
}
#home-bento__item-02 .home-bento__item-image-main-wrapper {
  width: 46% !important;
}
</style>`;

if (html.includes("elitechnexus-bento-hide-mockups")) {
  html = html.replace(
    /<style id="elitechnexus-bento-hide-mockups">[\s\S]*?<\/style>/,
    hideCss
  );
} else {
  html = html.replace("</head>", hideCss + "</head>");
}

fs.writeFileSync("public/index.html", html);
console.log("done v=" + V);
