/**
 * Replace remaining original coding-tool hero_layer_1/2 (+ thumbs)
 * with full professional service imagery (IncomeRemotely style).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SVC = "public/assets/images/services";
const IR = "public/assets/images/income-routes";
const HERO = "public/assets/images/home-hero";
const V = 29;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function fullScene(srcPath, w, h, title, subtitle) {
  const photo = await sharp(srcPath)
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="35%" stop-color="#071018" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.82"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${h - 120}" width="${Math.min(w - 72, 560)}" height="78" rx="16" fill="rgba(8,16,28,0.75)" stroke="rgba(110,220,200,0.4)"/>
    <text x="56" y="${h - 76}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${h - 48}" fill="rgba(200,230,220,0.9)" font-family="Arial,Helvetica,sans-serif" font-size="15">${esc(subtitle)}</text>
  </svg>`);

  return sharp(photo)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function dualPanel(w, h) {
  // Left: coaching chat vibe photo, Right: jobs photo — professional split replacing Next.js mock
  const gap = 18;
  const panelW = Math.floor((w - gap * 3) / 2);
  const panelH = h - gap * 2;
  const leftSrc = path.join(SVC, "interview.png");
  const rightSrc = path.join(SVC, "jobs.png");

  async function panel(src, title, lines) {
    const base = await sharp(src)
      .resize(panelW, panelH, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    const ov = Buffer.from(`<svg width="${panelW}" height="${panelH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="25%" stop-color="#071018" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="22" y="42" fill="#F2FFFB" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="700">${esc(title)}</text>
      ${lines
        .map(
          (t, i) =>
            `<text x="22" y="${80 + i * 28}" fill="rgba(210,235,245,0.9)" font-family="Arial,Helvetica,sans-serif" font-size="14">${esc(t)}</text>`
        )
        .join("")}
    </svg>`);
    let p = await sharp(base)
      .composite([{ input: ov, left: 0, top: 0 }])
      .png()
      .toBuffer();
    p = await sharp(p)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${panelW}" height="${panelH}"><rect width="100%" height="100%" rx="22" ry="22" fill="#fff"/></svg>`
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();
    return p;
  }

  const left = await panel(leftSrc, "Career coaching", [
    "Resume polish & portfolio proof",
    "Mock interviews with mentors",
    "Daily job targeting support",
  ]);
  const right = await panel(rightSrc, "Jobs & placement", [
    "Full-time roles & paid projects",
    "AI · ML · Full Stack · Security",
    "Proof first. Opportunity next.",
  ]);

  const bg = await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { r: 8, g: 16, b: 28, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  return sharp(bg)
    .composite([
      { input: left, left: gap, top: gap },
      { input: right, left: gap * 2 + panelW, top: gap },
    ])
    .png()
    .toBuffer();
}

async function write(buf, dest) {
  const tmp = dest + ".tmp.png";
  await sharp(buf).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  const m = await sharp(dest).metadata();
  console.log("wrote", path.basename(dest), m.width + "x" + m.height);
}

const W = 1052,
  H = 1024;

// layer_1 was Planner code list → mentor / fields scene
await write(
  await fullScene(
    path.join(SVC, "mentor.png"),
    W,
    H,
    "Mentors & instructors",
    "Senior review that raises juniors to delivery-ready professionals"
  ),
  path.join(HERO, "hero_layer_1.png")
);

// layer_2 was Shell terminal → dual professional panels (replaces Next.js workspace look)
await write(await dualPanel(W, H), path.join(HERO, "hero_layer_2.png"));

// Thumbs used in scroll strip
const thumbs = [
  ["hero-steps-0-thumb.png", path.join(SVC, "skills.png"), "Skills that hire", "AI · ML · Full Stack · Data · Security"],
  ["hero-steps-1-thumb.png", path.join(SVC, "ai.png"), "AI & Machine Learning", "Real specialists for real products"],
  ["hero-steps-2-thumb.png", path.join(SVC, "jobs.png"), "Jobs & placement", "Full-time roles with coaching support"],
  ["hero-steps-3-thumb.png", path.join(SVC, "mentor.png"), "Teaching & mentors", "Senior people who raise your level"],
  ["hero-steps-4-thumb.png", path.join(SVC, "interview.png"), "Interview coaching", "Practice until you are ready"],
];

for (const [name, src, title, sub] of thumbs) {
  const buf = await fullScene(src, 750, 497, title, sub);
  await write(buf, path.join(HERO, name));
  await sharp(path.join(HERO, name))
    .webp({ quality: 88 })
    .toFile(path.join(HERO, name.replace(/\.png$/, ".webp")));
}

// Keep hero_layer_0 brand plate (HTML chat overlays it) — only bump cache if referenced
let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([12])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/hero-steps-([0-4])-thumb\.(png|webp)(?:\?v=\d+)?/g, `hero-steps-$1-thumb.$2?v=${V}`);
fs.writeFileSync("public/index.html", html);
console.log("cache bumped v=", V);
