/**
 * Remake hero-proof 0–4 so each photo clearly matches its title.
 * Uses fresh Unsplash sources (not the mismatched proof-pool).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const POOL = "public/assets/images/unique/proof-pool";
const V = 50;

fs.mkdirSync(POOL, { recursive: true });

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

async function proofCard(src, dest, w, h, title, sub) {
  const photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.9, saturation: 0.98 })
    .sharpen()
    .png()
    .toBuffer();

  // Keep title/subtitle fully inside badge — shorter copy, more padding
  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="30%" stop-color="#071018" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.9"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="28" y="${h - 128}" width="${Math.min(w - 56, 580)}" height="92" rx="16"
      fill="rgba(8,16,28,0.82)" stroke="rgba(110,220,200,0.5)"/>
    <text x="48" y="${h - 88}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="48" y="${h - 58}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(sub)}</text>
  </svg>`);

  let out = await sharp(photo)
    .composite([{ input: ov, left: 0, top: 0 }])
    .png()
    .toBuffer();

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

  await sharp(out).png().toFile(dest);
  await sharp(out).webp({ quality: 88 }).toFile(dest.replace(/\.png$/, ".webp"));
  console.log("proof", path.basename(dest));
}

// Local service photos already match each field (verified).
// Prefer these over Unsplash so titles never drift from the picture again.
const cards = [
  {
    src: "public/assets/images/services/ai.png",
    out: "hero-proof-0.png",
    title: "AI & Machine Learning",
    sub: "Models, pipelines, and product delivery",
    ribbon: "AI & ML",
  },
  {
    src: "public/assets/images/services/fullstack.png",
    out: "hero-proof-1.png",
    title: "Full Stack careers",
    sub: "Build, ship, and present portfolio proof",
    ribbon: "Full Stack",
  },
  {
    src: "public/assets/images/services/security.png",
    out: "hero-proof-2.png",
    title: "Data & Security",
    sub: "Analytics, protection, and trusted systems",
    ribbon: "Data & Security",
  },
  {
    src: "public/assets/images/services/mentor.png",
    out: "hero-proof-3.png",
    title: "Coaching & mentors",
    sub: "Senior review that raises your level",
    ribbon: "Coaching",
  },
  {
    src: "public/assets/images/services/interview.png",
    out: "hero-proof-4.png",
    title: "Interview coaching",
    sub: "Mock interviews until you are ready",
    ribbon: "Interview Coach",
  },
];

const W = 900;
const H = 560;

for (const c of cards) {
  if (!fs.existsSync(c.src)) throw new Error("missing " + c.src);
  const out = path.join(HERO, c.out);
  await proofCard(c.src, out, W, H, c.title, c.sub);

  const idx = c.out.match(/hero-proof-(\d)/)[1];
  fs.copyFileSync(out, path.join(HERO, `hero-steps-${idx}-thumb.png`));
  fs.copyFileSync(
    out.replace(/\.png$/, ".webp"),
    path.join(HERO, `hero-steps-${idx}-thumb.webp`)
  );
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /\/assets\/images\/home-hero\/hero-proof-([0-4])\.(png|webp)(?:\?v=\d+)?/g,
  `/assets/images/home-hero/hero-proof-$1.$2?v=${V}`
);

// Align floating ribbon labels with card themes
const ribbons = cards.map((c) => c.ribbon);
const ribbonRe =
  /(<div id="home-hero__thumbnails-wrapper">)([\s\S]*?)(<\/div>\s*<!-- <div id="home-hero__thumbnails-bottom")/;
html = html.replace(ribbonRe, (full, a, mid, b) => {
  let i = 0;
  const next = mid.replace(
    /(<div class="home-hero__thumbnails-item-text">[\s\S]*?<div>)([^<]*)(<\/div>)/g,
    (m, pre, _old, post) => {
      const label = ribbons[i++] ?? _old;
      return `${pre}${label}${post}`;
    }
  );
  return a + next + b;
});

fs.writeFileSync("public/index.html", html);
console.log("done v=", V);
