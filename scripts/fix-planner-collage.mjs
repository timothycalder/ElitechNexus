import fs from "fs";
import path from "path";
import sharp from "sharp";

const SVC = "public/assets/images/services";
const HERO = "public/assets/images/home-hero";

async function collageStrip(w, h, keys, labels) {
  const gap = 8;
  const n = keys.length;
  const cellW = Math.floor((w - gap * (n + 1)) / n);
  const cellH = h - gap * 2;
  const parts = [];
  for (let i = 0; i < n; i++) {
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
      <text x="10" y="${cellH - 14}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="700">${String(labels[i]).replace(/&/g,"&amp;")}</text>
    </svg>`);
    const cell = await sharp(img)
      .composite([{ input: label, left: 0, top: 0 }])
      .png()
      .toBuffer();
    parts.push({ input: cell, left: gap + i * (cellW + gap), top: gap });
  }
  const bg = await sharp({
    create: { width: w, height: h, channels: 4, background: { r: 11, g: 21, b: 36, alpha: 1 } },
  })
    .png()
    .toBuffer();
  return sharp(bg).composite(parts).png().toBuffer();
}

const keys = ["ai", "fullstack", "security", "fde", "interview"];
const labels = ["AI & ML", "Full Stack", "Security", "FDE", "Coaching"];

for (const [file, w, h] of [
  ["hero-steps-1.png", 630, 204],
  ["hero-steps-1-mobile.png", 550, 197],
]) {
  const buf = await collageStrip(w, h, keys, labels);
  const dest = path.join(HERO, file);
  const tmp = dest + ".tmp.png";
  await sharp(buf).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("collage", file);
}

// Update engage track copy in elite-fields
let html = fs.readFileSync("public/index.html", "utf8");
const reps = [
  ["Freelance project track", "Client delivery track"],
  [
    "Proposal writing, client matching, delivery support, and review systems so paid project work becomes repeatable.",
    "Full Stack, AI/ML, Data, and Security delivery with mentor review so client work ships cleanly.",
  ],
  ["Side income &amp; partners", "Teaching &amp; coaching"],
  [
    "Small tasks, learning plans, and network introductions for students, seniors, and builders who want extra income.",
    "Instructors, interview coaching, and mentor systems that raise juniors to delivery-ready professionals.",
  ],
  [
    "Three practical paths to start earning: full-time employment support, freelance project matching, and side-income routines. Pick the route that fits your situation — you do not need to be perfect before you start.",
    "Three practical paths with Elitechnexus professionals: full-time careers, client project delivery, and skills coaching across AI, ML, Full Stack, Data, Security, and Forward Deployed Engineering.",
  ],
];
for (const [a, b] of reps) {
  if (html.includes(a)) {
    html = html.split(a).join(b);
    console.log("ok", b.slice(0, 40));
  } else console.warn("miss", a.slice(0, 40));
}
fs.writeFileSync("public/index.html", html);

// Find integration card titles
const i = html.indexOf("home-integration");
if (i > 0) {
  const chunk = html.slice(i, i + 8000);
  const titles = [...chunk.matchAll(/home-integration__card-title[^>]*>[\s\S]*?<span>([^<]+)</g)].map((m) => m[1]);
  console.log("integration titles", titles);
}
