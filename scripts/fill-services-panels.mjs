/**
 * Make all Elitechnexus Services panel images fill the card (same full size).
 * Fixes "cut" / empty blue space under shorter hero-steps images.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SVC = "public/assets/images/services";
const HERO = "public/assets/images/home-hero";
const V = 28;

const DESK = { w: 630, h: 630 }; // match original tallest (editor) so box fills
const MOB = { w: 550, h: 420 };

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function photoFill(srcKey, w, h, title, subtitle) {
  const photo = await sharp(path.join(SVC, `${srcKey}.png`))
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="40%" stop-color="#071018" stop-opacity="0"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.78"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="20" y="${h - 92}" width="${Math.min(w - 40, 460)}" height="64" rx="14" fill="rgba(8,16,28,0.72)" stroke="rgba(110,220,200,0.35)"/>
    <text x="36" y="${h - 56}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700">${esc(title)}</text>
    <text x="36" y="${h - 34}" fill="rgba(200,230,220,0.88)" font-family="Arial,Helvetica,sans-serif" font-size="13">${esc(subtitle)}</text>
  </svg>`);

  return sharp(photo)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function fieldsGrid(w, h) {
  const keys = ["ai", "fullstack", "security", "interview"];
  const labels = ["AI & ML", "Full Stack", "Security", "Coaching"];
  const gap = 10;
  const cellW = Math.floor((w - gap * 3) / 2);
  const cellH = Math.floor((h - gap * 3) / 2);
  const parts = [];

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const left = gap + col * (cellW + gap);
    const top = gap + row * (cellH + gap);

    const img = await sharp(path.join(SVC, `${keys[i]}.png`))
      .resize(cellW, cellH, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();

    const label = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="40%" stop-color="#000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#071018" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="16" y="${cellH - 18}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="700">${esc(labels[i])}</text>
    </svg>`);

    let cell = await sharp(img)
      .composite([{ input: label, left: 0, top: 0 }])
      .png()
      .toBuffer();

    cell = await sharp(cell)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${cellW}" height="${cellH}"><rect width="100%" height="100%" rx="16" ry="16" fill="#fff"/></svg>`
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    parts.push({ input: cell, left, top });
  }

  const bg = await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { r: 11, g: 21, b: 36, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  return sharp(bg).composite(parts).png().toBuffer();
}

async function write(buf, dest) {
  const tmp = dest + ".tmp.png";
  await sharp(buf).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  const m = await sharp(dest).metadata();
  console.log("wrote", path.basename(dest), m.width + "x" + m.height);
}

// Desktop — all 630x630
await write(await fieldsGrid(DESK.w, DESK.h), path.join(HERO, "hero-steps-1.png"));
await write(
  await photoFill("ai", DESK.w, DESK.h, "AI & Machine Learning", "Professional developers for models, pipelines & products"),
  path.join(HERO, "hero-steps-2.png")
);
await write(
  await photoFill("mentor", DESK.w, DESK.h, "Mentors & instructors", "Senior review, teaching, and delivery coaching"),
  path.join(HERO, "hero-steps-3.png")
);
await write(
  await photoFill("jobs", DESK.w, DESK.h, "Jobs & interview coaching", "Full-time roles, mock interviews, placement support"),
  path.join(HERO, "hero-steps-4.png")
);

// Mobile — same aspect fill
await write(await fieldsGrid(MOB.w, MOB.h), path.join(HERO, "hero-steps-1-mobile.png"));
await write(
  await photoFill("fullstack", MOB.w, MOB.h, "Full Stack delivery", "Build and ship with experienced engineers"),
  path.join(HERO, "hero-steps-2-mobile.png")
);
await write(
  await photoFill("interview", MOB.w, MOB.h, "Interview coaching", "Practice, confidence, live backup"),
  path.join(HERO, "hero-steps-3-mobile.png")
);
await write(
  await photoFill("security", MOB.w, MOB.h, "Data & Security", "Protect systems while you grow your career"),
  path.join(HERO, "hero-steps-4-mobile.png")
);

const CSS = `<style id="elitechnexus-services-fill-css">
#home-hero__flow-visual-right-box{
  position:relative !important;
  overflow:hidden !important;
}
#home-hero__flow-visual-right-box .home-hero__flow-visual-right-item{
  width:100% !important;
  height:100% !important;
}
#home-hero__flow-visual-right-box picture{
  display:block !important;
  width:100% !important;
  height:100% !important;
}
#home-hero__flow-visual-right-box img{
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  object-position:center !important;
  display:block !important;
}
</style>`;

let html = fs.readFileSync("public/index.html", "utf8");
if (html.includes("elitechnexus-services-fill-css")) {
  html = html.replace(
    /<style id="elitechnexus-services-fill-css">[\s\S]*?<\/style>/,
    CSS
  );
} else {
  html = html.replace("</head>", CSS + "\n</head>");
}

html = html.replace(
  /hero-steps-([1-4])(-mobile)?\.png(?:\?v=\d+)?/g,
  `hero-steps-$1$2.png?v=${V}`
);

fs.writeFileSync("public/index.html", html);
console.log("done v=", V);
