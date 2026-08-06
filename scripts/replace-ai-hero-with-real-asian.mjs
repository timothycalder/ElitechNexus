/**
 * Replace AI-looking hero people photos with real Unsplash photographs.
 * Prioritize Asian professional women (PH-aligned) in realistic office scenes.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const SRC = "public/assets/images/career-prep";
const RAW = path.join(SRC, "realistic-raw");
const V = 83;

fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(SRC, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  const m = await sharp(dest).metadata();
  console.log("dl", path.basename(dest), m.width + "x" + m.height, ((fs.statSync(dest).size / 1024) | 0) + "kb");
}

async function makeLayer(src, dest, title, subtitle, position = "attention") {
  const W = 1052;
  const H = 1024;
  const photo = await sharp(src)
    .resize(W, H, { fit: "cover", position, kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 0.96, saturation: 1.02 })
    .sharpen({ sigma: 0.6 })
    .png()
    .toBuffer();

  const badgeY = H - 130;
  const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="35%" stop-color="#071018" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.86"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${badgeY}" width="${Math.min(W - 72, 680)}" height="86" rx="16"
      fill="rgba(8,16,28,0.8)" stroke="rgba(110,220,200,0.5)"/>
    <text x="56" y="${badgeY + 36}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${badgeY + 64}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(subtitle)}</text>
  </svg>`);

  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: overlay, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);

  // Also write webp sibling if exists pattern is used
  const webp = dest.replace(/\.png$/i, ".webp");
  await sharp(dest).webp({ quality: 82 }).toFile(webp);
  console.log("wrote", path.basename(dest), "+", path.basename(webp));
}

// Real camera photos (Unsplash) — Asian women + realistic office collaboration
const shots = [
  {
    // Asian woman + colleague reviewing work on screens (desk collab)
    key: "collab-desk",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=85",
    file: "collab-desk.jpg",
  },
  {
    // Beautiful Asian professional woman (clear face) — interview / career
    key: "asian-pro-1",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=85",
    file: "asian-pro-portrait.jpg",
  },
  {
    // Asian woman professional standing / office reality
    key: "asian-pro-2",
    url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1600&q=85",
    file: "asian-pro-office.jpg",
  },
  {
    // Team at whiteboard / coaching (real meeting energy)
    key: "whiteboard",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=85",
    file: "whiteboard-team.jpg",
  },
  {
    // Two professionals in meeting (realistic handshake/desk)
    key: "meeting",
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=85",
    file: "meeting-desk.jpg",
  },
  {
    // Asian woman smiling portrait (natural)
    key: "asian-smile",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1600&q=85",
    file: "asian-smile.jpg",
  },
];

for (const s of shots) {
  await download(s.url, path.join(RAW, s.file));
}

// Save career-prep sources (used by other scripts)
fs.copyFileSync(path.join(RAW, "meeting-desk.jpg"), path.join(SRC, "write-resume.png"));
fs.copyFileSync(path.join(RAW, "asian-pro-office.jpg"), path.join(SRC, "write-cover-letter.png"));
fs.copyFileSync(path.join(RAW, "asian-pro-portrait.jpg"), path.join(SRC, "interview-questions.png"));
// sharp will accept jpg bytes even with .png extension when reading — convert properly:
await sharp(path.join(RAW, "meeting-desk.jpg")).png().toFile(path.join(SRC, "write-resume.png"));
await sharp(path.join(RAW, "asian-pro-office.jpg")).png().toFile(path.join(SRC, "write-cover-letter.png"));
await sharp(path.join(RAW, "asian-pro-portrait.jpg")).png().toFile(path.join(SRC, "interview-questions.png"));

// Backup current AI layers once
for (const n of [1, 2, 3]) {
  const p = path.join(HERO, `hero_layer_${n}.png`);
  const bak = path.join(HERO, `hero_layer_${n}.ai-look.bak.png`);
  if (fs.existsSync(p) && !fs.existsSync(bak)) {
    fs.copyFileSync(p, bak);
    console.log("backup", path.basename(bak));
  }
}

// Layer 1 — resume: realistic meeting / desk collab (people working together)
await makeLayer(
  path.join(RAW, "meeting-desk.jpg"),
  path.join(HERO, "hero_layer_1.png"),
  "How to write a resume",
  "Clear achievements, stronger keywords, better first impression",
  "centre"
);

// Layer 2 — cover letter: Asian professional woman in real office
await makeLayer(
  path.join(RAW, "asian-pro-office.jpg"),
  path.join(HERO, "hero_layer_2.png"),
  "How to write a cover letter",
  "Tell your story so employers and clients trust your proof",
  "attention"
);

// Layer 3 — mock interview: beautiful Asian woman portrait (natural photo)
await makeLayer(
  path.join(RAW, "asian-pro-portrait.jpg"),
  path.join(HERO, "hero_layer_3.png"),
  "Mock interviews that stick",
  "Live practice with feedback until your answers land",
  "attention"
);

// Also refresh layer 4 portfolio with real team collab (not AI)
const L4 = path.join(HERO, "hero_layer_4.png");
if (fs.existsSync(L4)) {
  const bak4 = path.join(HERO, "hero_layer_4.ai-look.bak.png");
  if (!fs.existsSync(bak4)) fs.copyFileSync(L4, bak4);
  await makeLayer(
    path.join(RAW, "collab-desk.jpg"),
    L4,
    "Portfolio that proves skill",
    "Package projects so employers and clients trust your work",
    "centre"
  );
}

// Bump HTML cache bust
let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(
  /src="\/_astro\/hoisted\.Dadqo-kW\.js\?v=\d+"/,
  `src="/_astro/hoisted.Dadqo-kW.js?v=${V}"`
);
fs.writeFileSync("public/index.html", html);
console.log("html cache v=", V);
console.log("done — real Unsplash photos with Asian professional women");
