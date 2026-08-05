/**
 * Replace stacked hero layers 0–2 with career-prep photos
 * (interview questions / resume / cover letter).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = "public/assets/images/career-prep";
const HERO = "public/assets/images/home-hero";
const V = 32;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function makeLayer(src, dest, title, subtitle, opts = {}) {
  const W = 1052;
  const H = 1024;
  const leaveChatSpace = !!opts.leaveChatSpace;

  // Upscale small source with cover crop
  const photo = await sharp(src)
    .resize(W, H, {
      fit: "cover",
      position: opts.position || "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({ brightness: 0.9, saturation: 0.98 })
    .sharpen()
    .png()
    .toBuffer();

  const gradientStops = leaveChatSpace
    ? `<stop offset="0%" stop-color="#071018" stop-opacity="0.6"/>
       <stop offset="22%" stop-color="#071018" stop-opacity="0.2"/>
       <stop offset="52%" stop-color="#071018" stop-opacity="0.25"/>
       <stop offset="100%" stop-color="#071018" stop-opacity="0.9"/>`
    : `<stop offset="30%" stop-color="#071018" stop-opacity="0.1"/>
       <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>`;

  const brandTop = leaveChatSpace
    ? `<text x="${W / 2}" y="52" text-anchor="middle" fill="rgba(180,210,230,0.8)"
         font-family="Arial,Helvetica,sans-serif" font-size="17">Build more with Elitechnexus</text>
       <line x1="200" y1="72" x2="${W - 200}" y2="72" stroke="rgba(120,160,190,0.35)" stroke-width="1"/>
       <text x="${W / 2}" y="120" text-anchor="middle" fill="#F2FFFB"
         font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="700">Elitechnexus</text>`
    : "";

  const badgeY = leaveChatSpace ? H - 300 : H - 130;
  const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${gradientStops}</linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    ${brandTop}
    <rect x="36" y="${badgeY}" width="${Math.min(W - 72, 680)}" height="86" rx="16"
      fill="rgba(8,16,28,0.8)" stroke="rgba(110,220,200,0.5)"/>
    <text x="56" y="${badgeY + 36}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${badgeY + 64}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(subtitle)}</text>
  </svg>`);

  const tmp = dest + ".tmp.png";
  await sharp(photo)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .png()
    .toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  const m = await sharp(dest).metadata();
  console.log("wrote", path.basename(dest), m.width + "x" + m.height);
}

const interview = path.join(SRC, "interview-questions.png");
const resume = path.join(SRC, "write-resume.png");
const cover = path.join(SRC, "write-cover-letter.png");

for (const f of [interview, resume, cover]) {
  if (!fs.existsSync(f)) throw new Error("missing " + f);
  const m = await sharp(f).metadata();
  console.log("src", path.basename(f), m.width + "x" + m.height);
}

// 1 → interview questions (front card)
await makeLayer(
  interview,
  path.join(HERO, "hero_layer_0.png"),
  "Most common interview questions",
  "Practice answers with mentors until you sound confident",
  { leaveChatSpace: true }
);

// 2 → resume
await makeLayer(
  resume,
  path.join(HERO, "hero_layer_1.png"),
  "How to write a resume",
  "Clear achievements, stronger keywords, better first impression"
);

// 3 → cover letter
await makeLayer(
  cover,
  path.join(HERO, "hero_layer_2.png"),
  "How to write a cover letter",
  "Tell your story so employers and clients trust your proof"
);

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /Your mentor reviewed the portfolio and interview plan\./g,
  "Let's prep interview answers, your resume, and your cover letter."
);
html = html.replace(
  /Ready when you are — jobs, projects, or coaching\./g,
  "Ready when you are — interviews, applications, or coaching."
);
html = html.replace(
  /Let's prep interview answers, your resume, and your cover letter\./g,
  "Let's prep interview answers, your resume, and your cover letter."
);
html = html.replace(
  /hero_layer_([012])\.png(?:\?v=\d+)?/g,
  `hero_layer_$1.png?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("HTML updated v=" + V);
