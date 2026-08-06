/**
 * Replace Cloud & DevOps (Earth) + Platform Skills (PCB) with career/engineering photos.
 * Rebuilds skills collage hero-steps-1 (+ mobile/thumb).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const SVC = "public/assets/images/services";
const POOL = "public/assets/images/unique/skills-fit-v1";
const V = 71;

fs.mkdirSync(POOL, { recursive: true });

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

    let cell = await sharp(src)
      .resize(cellW, cellH, { fit: "cover", position: "centre" })
      .modulate({ brightness: 0.9, saturation: 0.96 })
      .png()
      .toBuffer();

    const grad = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="35%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.82"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" rx="12" ry="12" fill="url(#g)"/>
    </svg>`);

    cell = await sharp(cell).composite([{ input: grad, left: 0, top: 0 }]).png().toBuffer();
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

  await sharp(bg).composite(parts).png().toFile(dest);
  console.log("grid", path.basename(dest));
}

// Career / engineering photos (not Earth / not PCB)
const cloudSrc = path.join(POOL, "cloud-devops.jpg"); // monitoring / deploy workstation
const platformSrc = path.join(POOL, "platform-skills.jpg"); // engineers collaborating / tools
const securitySrc = path.join(POOL, "security-fit.jpg"); // secure systems review (replace weak cafe)

await download(
  "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=85",
  cloudSrc
); // kubernetes/cloud console vibe
await download(
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
  platformSrc
); // team collaborating on laptops
await download(
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85",
  securitySrc
); // cybersecurity / lock laptop

const dataSrc = path.join("public/assets/images/unique", "skill-data.jpg");
if (!fs.existsSync(dataSrc)) {
  await download(
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=82",
    dataSrc
  );
}

const skillCells = [
  { src: path.join(SVC, "ai.png"), label: "AI & ML" },
  { src: path.join(SVC, "fullstack.png"), label: "Full Stack" },
  { src: dataSrc, label: "Data" },
  { src: securitySrc, label: "Security" },
  { src: cloudSrc, label: "Cloud & DevOps" },
  { src: platformSrc, label: "Platform Skills" },
];

const DESK = { w: 630, h: 630 };
const MOB = { w: 550, h: 520 };

for (const f of ["hero-steps-1.png", "hero-steps-1-mobile.png", "hero-steps-1-thumb.png"]) {
  const p = path.join(HERO, f);
  if (fs.existsSync(p)) {
    const bak = p + ".earth-pcb.bak";
    if (!fs.existsSync(bak)) fs.copyFileSync(p, bak);
  }
}

await skillsGrid(path.join(HERO, "hero-steps-1.png"), DESK.w, DESK.h, skillCells);
await skillsGrid(path.join(HERO, "hero-steps-1-mobile.png"), MOB.w, MOB.h, skillCells);

// Thumb: crop bottom row focus or shrink full grid
await sharp(path.join(HERO, "hero-steps-1.png"))
  .resize(320, 240, { fit: "cover", position: "centre" })
  .png()
  .toFile(path.join(HERO, "hero-steps-1-thumb.png"));

// Also overwrite services fde/skills so other panels don't revive Earth/PCB
await sharp(cloudSrc)
  .resize(900, 560, { fit: "cover" })
  .png()
  .toFile(path.join(SVC, "fde.png"));
await sharp(platformSrc)
  .resize(900, 560, { fit: "cover" })
  .png()
  .toFile(path.join(SVC, "skills.png"));
await sharp(securitySrc)
  .resize(900, 560, { fit: "cover" })
  .png()
  .toFile(path.join(SVC, "security.png"));
console.log("updated services fde/skills/security sources");

let html = fs.readFileSync("public/index.html", "utf8");
for (const f of [
  "hero-steps-1.png",
  "hero-steps-1-mobile.png",
  "hero-steps-1-thumb.png",
]) {
  html = html.replace(
    new RegExp(`(/assets/images/home-hero/${f.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
    `$1?v=${V}`
  );
}
fs.writeFileSync("public/index.html", html);
console.log("cache v=" + V);
