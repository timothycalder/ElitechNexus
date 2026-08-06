/**
 * Rebuild Plan panel: rename tab → Fields, 2x2 full-bleed photos (no FDE).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SVC = "public/assets/images/services";
const HERO = "public/assets/images/home-hero";
const V = 35;

const keys = ["ai", "fullstack", "security", "interview"]; // no FDE
const labels = ["AI & ML", "Full Stack", "Security", "Coaching"];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function grid2x2(w, h) {
  const gap = 10;
  const outer = 10;
  const cellW = Math.floor((w - outer * 2 - gap) / 2);
  const cellH = Math.floor((h - outer * 2 - gap) / 2);
  const parts = [];
  const textX = Math.max(36, Math.round(cellW * 0.11));
  const textY = cellH - 28;
  const fontSize = Math.max(15, Math.min(18, Math.round(cellW * 0.055)));

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const left = outer + col * (cellW + gap);
    const top = outer + row * (cellH + gap);

    const img = await sharp(path.join(SVC, `${keys[i]}.png`))
      .resize(cellW, cellH, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();

    const overlay = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="35%" stop-color="#000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#071018" stop-opacity="0.82"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="12" ry="12" fill="url(#g)"/>
    </svg>`);

    const cell = await sharp(img)
      .composite([{ input: overlay, left: 0, top: 0 }])
      .png()
      .toBuffer();

    // Round first, then draw labels ON TOP so corner mask cannot clip letters
    const rounded = await sharp(cell)
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

    const labelSvg = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <text x="${textX}" y="${textY}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700">${esc(labels[i])}</text>
    </svg>`);

    const labeled = await sharp(rounded)
      .composite([{ input: labelSvg, left: 0, top: 0 }])
      .png()
      .toBuffer();

    parts.push({ input: labeled, left, top });
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
  console.log("wrote", dest, (await sharp(dest).metadata()).width + "x" + (await sharp(dest).metadata()).height);
}

// Full panel size (match Jobs panel height so it fills the box)
await write(await grid2x2(630, 404), path.join(HERO, "hero-steps-1.png"));
await write(await grid2x2(550, 320), path.join(HERO, "hero-steps-1-mobile.png"));

// Rename Plan → Fields in nav
let html = fs.readFileSync("public/index.html", "utf8");
const navStart = html.indexOf('id="home-hero__flow-visual-right-nav"');
const navEnd = html.indexOf('id="home-hero__flow-visual-right-box"', navStart);
if (navStart > 0 && navEnd > navStart) {
  let nav = html.slice(navStart, navEnd);
  const before = nav;
  nav = nav.replace(/>Plan<\/div>/, ">Fields</div>");
  if (nav === before) {
    // try other patterns
    nav = nav.replace(/>Planner<\/div>/, ">Fields</div>");
  }
  html = html.slice(0, navStart) + nav + html.slice(navEnd);
  console.log("nav updated", nav.includes(">Fields</div>"));
} else console.warn("nav not found");

// alt text for first picture item
html = html.replace(/alt="Mentor plan"/g, 'alt="Skill fields"');
html = html.replace(/alt="Planner"/g, 'alt="Skill fields"');

html = html.replace(/hero-steps-1(-mobile)?\.png(?:\?v=\d+)?/g, `hero-steps-1$1.png?v=${V}`);

// Ensure Fields panel never cover-crops baked labels
const fieldsCss = `<style id="elitechnexus-fields-labels-css">
#home-hero__flow-visual-right-box .home-hero__flow-visual-right-item:first-child img{
  object-fit:contain !important;
  object-position:center !important;
  background:#0b1524 !important;
}
#home-hero__flow-visual-right-box .home-hero__flow-visual-right-item:first-child picture{
  background:#0b1524 !important;
}
</style>`;
if (html.includes('id="elitechnexus-fields-labels-css"')) {
  html = html.replace(/<style id="elitechnexus-fields-labels-css">[\s\S]*?<\/style>/, fieldsCss);
} else {
  html = html.replace("</head>", `${fieldsCss}</head>`);
}

fs.writeFileSync("public/index.html", html);
console.log("done v=", V);
