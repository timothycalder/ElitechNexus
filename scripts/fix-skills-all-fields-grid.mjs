/**
 * Skills tab: show ALL major skill fields in a grid (not one cropped AI photo).
 * Also fix panel mapping: Skills / Jobs / Coach / Fields.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SVC = "public/assets/images/services";
const HERO = "public/assets/images/home-hero";
const UNIQUE = "public/assets/images/unique";
const V = 42;

fs.mkdirSync(UNIQUE, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function photoPanel(src, dest, w, h, title, subtitle) {
  const photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="40%" stop-color="#071018" stop-opacity="0"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.78"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="20" y="${h - 92}" width="${Math.min(w - 40, 480)}" height="64" rx="14" fill="rgba(8,16,28,0.72)" stroke="rgba(110,220,200,0.35)"/>
    <text x="36" y="${h - 56}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700">${esc(title)}</text>
    <text x="36" y="${h - 34}" fill="rgba(200,230,220,0.88)" font-family="Arial,Helvetica,sans-serif" font-size="13">${esc(subtitle)}</text>
  </svg>`);
  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("panel", path.basename(dest));
}

/**
 * Multi-skill grid. cols x rows, each cell labeled.
 * Uses local service images + optional extra file paths.
 */
async function skillsGrid(dest, w, h, cells) {
  const cols = 2;
  const rows = Math.ceil(cells.length / cols);
  const gap = 10;
  const outer = 12;
  const cellW = Math.floor((w - outer * 2 - gap * (cols - 1)) / cols);
  const cellH = Math.floor((h - outer * 2 - gap * (rows - 1)) / rows);
  const textX = Math.max(28, Math.round(cellW * 0.1));
  const textY = cellH - 26;
  const fontSize = Math.max(14, Math.min(18, Math.round(cellW * 0.055)));
  const parts = [];

  for (let i = 0; i < cells.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = outer + col * (cellW + gap);
    const top = outer + row * (cellH + gap);
    const { src, label } = cells[i];

    const img = await sharp(src)
      .resize(cellW, cellH, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();

    const grad = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="35%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.82"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" rx="12" ry="12" fill="url(#g)"/>
    </svg>`);

    let cell = await sharp(img).composite([{ input: grad, left: 0, top: 0 }]).png().toBuffer();
    cell = await sharp(cell)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${cellW}" height="${cellH}"><rect width="100%" height="100%" rx="14" ry="14" fill="#fff"/></svg>`
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    // Label AFTER round so corners don't clip letters
    const labelSvg = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <text x="${textX}" y="${textY}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700">${esc(label)}</text>
    </svg>`);
    cell = await sharp(cell).composite([{ input: labelSvg, left: 0, top: 0 }]).png().toBuffer();
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

  const tmp = dest + ".tmp.png";
  await sharp(bg).composite(parts).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("skills-grid", path.basename(dest), `${w}x${h}`, cells.map((c) => c.label).join(", "));
}

// Dedicated Data photo (not used in masonry IR set)
const dataSrc = path.join(UNIQUE, "skill-data.jpg");
await download(
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=82",
  dataSrc
);

const skillCells = [
  { src: path.join(SVC, "ai.png"), label: "AI & ML" },
  { src: path.join(SVC, "fullstack.png"), label: "Full Stack" },
  { src: dataSrc, label: "Data" },
  { src: path.join(SVC, "security.png"), label: "Security" },
  { src: path.join(SVC, "fde.png"), label: "Cloud & DevOps" },
  { src: path.join(SVC, "skills.png"), label: "Platform Skills" },
];

// Match the services card box (near-square) so cover/contain won't crop to one tile
const DESK = { w: 630, h: 630 };
const MOB = { w: 550, h: 520 };

await skillsGrid(path.join(HERO, "hero-steps-1.png"), DESK.w, DESK.h, skillCells);
await skillsGrid(path.join(HERO, "hero-steps-1-mobile.png"), MOB.w, MOB.h, skillCells);

// Jobs / Coach / Fields — correct mapping for nav order Skills, Jobs, Coach, Fields
await photoPanel(
  path.join(SVC, "jobs.png"),
  path.join(HERO, "hero-steps-2.png"),
  DESK.w,
  DESK.h,
  "Jobs & placement",
  "Full-time roles with coaching support"
);
await photoPanel(
  path.join(SVC, "jobs.png"),
  path.join(HERO, "hero-steps-2-mobile.png"),
  MOB.w,
  MOB.h,
  "Jobs & placement",
  "Full-time roles with coaching support"
);

await photoPanel(
  path.join(SVC, "mentor.png"),
  path.join(HERO, "hero-steps-3.png"),
  DESK.w,
  DESK.h,
  "Mentors & coaching",
  "Senior review, teaching, and interview prep"
);
await photoPanel(
  path.join(SVC, "mentor.png"),
  path.join(HERO, "hero-steps-3-mobile.png"),
  MOB.w,
  MOB.h,
  "Mentors & coaching",
  "Senior review, teaching, and interview prep"
);

await photoPanel(
  path.join(SVC, "interview.png"),
  path.join(HERO, "hero-steps-4.png"),
  DESK.w,
  DESK.h,
  "Fields & delivery",
  "Interview-ready specialists across every stack"
);
await photoPanel(
  path.join(SVC, "interview.png"),
  path.join(HERO, "hero-steps-4-mobile.png"),
  MOB.w,
  MOB.h,
  "Fields & delivery",
  "Interview-ready specialists across every stack"
);

let html = fs.readFileSync("public/index.html", "utf8");

// Keep full grid visible — never cover-crop the Skills collage
const css = `<style id="elitechnexus-skills-grid-css">
#home-hero__flow-visual-right-box .home-hero__flow-visual-right-item img{
  object-fit:contain !important;
  object-position:center !important;
  background:#0b1524 !important;
}
#home-hero__flow-visual-right-box .home-hero__flow-visual-right-item picture{
  background:#0b1524 !important;
}
</style>`;

if (html.includes('id="elitechnexus-skills-grid-css"')) {
  html = html.replace(/<style id="elitechnexus-skills-grid-css">[\s\S]*?<\/style>/, css);
} else {
  html = html.replace("</head>", `${css}</head>`);
}

html = html.replace(/hero-steps-([1-4])(-mobile)?\.png(?:\?v=\d+)?/g, `hero-steps-$1$2.png?v=${V}`);

// Alts reflect content
html = html.replace(/alt="Skill fields"/g, 'alt="All skill fields"');
html = html.replace(/alt="Skills workspace"/g, 'alt="Jobs & placement"');
html = html.replace(/alt="Coaching workspace"/g, 'alt="Mentors & coaching"');
html = html.replace(/alt="Jobs workspace"/g, 'alt="Fields & delivery"');

fs.writeFileSync("public/index.html", html);
console.log("done v=", V);
