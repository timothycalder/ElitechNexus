/**
 * Replace hero thumbnail strip (above "Jobs, projects, and income")
 * with IncomeRemotely professional photos. Rename files to bust caches.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const IR = "public/assets/images/income-routes";
const SVC = "public/assets/images/services";
const HERO = "public/assets/images/home-hero";
const V = 31;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function card(src, w, h, title, subtitle) {
  const photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 0.95 })
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="40%" stop-color="#071018" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
      </linearGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6EDCC8" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#6EDCC8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="0" y="0" width="100%" height="3" fill="url(#edge)"/>
    <rect x="28" y="${h - 118}" width="${Math.min(w - 56, 520)}" height="78" rx="14"
      fill="rgba(8,16,28,0.78)" stroke="rgba(110,220,200,0.45)"/>
    <text x="48" y="${h - 76}" fill="#F2FFFB" font-family="Arial,Helvetica,sans-serif"
      font-size="28" font-weight="700">${esc(title)}</text>
    <text x="48" y="${h - 48}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(subtitle)}</text>
  </svg>`);

  let out = await sharp(photo)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .png()
    .toBuffer();

  // Soft round corners to match old card feel
  out = await sharp(out)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${w}" height="${h}"><rect width="100%" height="100%" rx="18" ry="18" fill="#fff"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  return out;
}

const W = 900;
const H = 560;

const cards = [
  {
    out: "hero-proof-0.png",
    src: path.join(SVC, "ai.png"),
    title: "AI & Machine Learning",
    subtitle: "Specialists who ship models into products",
  },
  {
    out: "hero-proof-1.png",
    src: path.join(SVC, "jobs.png"),
    title: "Full Stack careers",
    subtitle: "Portfolio proof, interviews, and placement",
  },
  {
    out: "hero-proof-2.png",
    src: path.join(SVC, "security.png"),
    title: "Data & Security",
    subtitle: "Practical skills employers actually hire for",
  },
  {
    out: "hero-proof-3.png",
    src: path.join(SVC, "mentor.png"),
    title: "Coaching & mentors",
    subtitle: "Senior review that raises your level",
  },
  {
    out: "hero-proof-4.png",
    src: path.join(IR, "05.jpg"),
    title: "Interview coaching",
    subtitle: "Mock interviews until you are ready",
  },
];

for (const c of cards) {
  if (!fs.existsSync(c.src)) {
    // fallback to income-routes if service missing
    const alt = path.join(IR, "15.jpg");
    console.warn("missing", c.src, "→", alt);
    c.src = alt;
  }
  const buf = await card(c.src, W, H, c.title, c.subtitle);
  const dest = path.join(HERO, c.out);
  await sharp(buf).png().toFile(dest);
  const webp = dest.replace(/\.png$/, ".webp");
  await sharp(dest).webp({ quality: 88 }).toFile(webp);

  // Also overwrite legacy thumb names so any stale refs still look new
  const idx = c.out.match(/hero-proof-(\d)/)[1];
  const legacyPng = path.join(HERO, `hero-steps-${idx}-thumb.png`);
  const legacyWebp = path.join(HERO, `hero-steps-${idx}-thumb.webp`);
  fs.copyFileSync(dest, legacyPng);
  fs.copyFileSync(webp, legacyWebp);

  const m = await sharp(dest).metadata();
  console.log("wrote", c.out, m.width + "x" + m.height);
}

let html = fs.readFileSync("public/index.html", "utf8");
// Point HTML at new filenames (also refresh if already renamed)
html = html.replace(
  /\/assets\/images\/home-hero\/hero-steps-([0-4])-thumb\.(png|webp)(?:\?v=\d+)?/g,
  `/assets/images/home-hero/hero-proof-$1.$2?v=${V}`
);
html = html.replace(
  /\/assets\/images\/home-hero\/hero-proof-([0-4])\.(png|webp)(?:\?v=\d+)?/g,
  `/assets/images/home-hero/hero-proof-$1.$2?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("HTML updated to hero-proof-*?v=" + V);
