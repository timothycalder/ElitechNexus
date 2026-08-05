/**
 * Enforce one photo → one homepage section (no visual repeats).
 *
 * Exclusive pools:
 *   masonry     → income-routes/01-18 (unchanged)
 *   flow panels → services/* only (Fields collage + Skills/Jobs/Coach)
 *   support     → NEW unique Unsplash set (not in IR list)
 *   proofs      → NEW unique Unsplash set
 *   layers      → dark plate + 2 user unique photos (no service reuse)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const SVC = "public/assets/images/services";
const SUP = "public/assets/images/income-routes/support";
const UNIQUE = "public/assets/images/unique";
const ASSETS =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const V = 40;

fs.mkdirSync(SUP, { recursive: true });
fs.mkdirSync(UNIQUE, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function findAsset(partial) {
  const hit = fs.readdirSync(ASSETS).find((f) => f.includes(partial));
  if (!hit) throw new Error("missing asset " + partial);
  return path.join(ASSETS, hit);
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
    console.log("keep", dest);
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function coverJpg(src, dest, w, h) {
  const tmp = dest + ".tmp.jpg";
  await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
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
    <rect x="20" y="${h - 92}" width="${Math.min(w - 40, 460)}" height="64" rx="14" fill="rgba(8,16,28,0.72)" stroke="rgba(110,220,200,0.35)"/>
    <text x="36" y="${h - 56}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700">${esc(title)}</text>
    <text x="36" y="${h - 34}" fill="rgba(200,230,220,0.88)" font-family="Arial,Helvetica,sans-serif" font-size="13">${esc(subtitle)}</text>
  </svg>`);
  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("panel", path.basename(dest));
}

async function fieldsGrid(dest, w, h, keys, labels) {
  const gap = 10;
  const outer = 10;
  const cellW = Math.floor((w - outer * 2 - gap) / 2);
  const cellH = Math.floor((h - outer * 2 - gap) / 2);
  const textX = Math.max(36, Math.round(cellW * 0.11));
  const textY = cellH - 28;
  const fontSize = Math.max(15, Math.min(18, Math.round(cellW * 0.055)));
  const parts = [];

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const left = outer + col * (cellW + gap);
    const top = outer + row * (cellH + gap);
    const img = await sharp(path.join(SVC, `${keys[i]}.png`))
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
    const label = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <text x="${textX}" y="${textY}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700">${esc(labels[i])}</text>
    </svg>`);
    cell = await sharp(cell).composite([{ input: label, left: 0, top: 0 }]).png().toBuffer();
    parts.push({ input: cell, left, top });
  }

  const bg = await sharp({
    create: { width: w, height: h, channels: 4, background: { r: 11, g: 21, b: 36, alpha: 1 } },
  })
    .png()
    .toBuffer();
  const tmp = dest + ".tmp.png";
  await sharp(bg).composite(parts).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("fields", path.basename(dest));
}

async function proofCard(src, dest, w, h, title, sub) {
  const photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 0.97 })
    .png()
    .toBuffer();
  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="35%" stop-color="#071018" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.86"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${h - 120}" width="${Math.min(w - 72, 640)}" height="82" rx="16" fill="rgba(8,16,28,0.8)" stroke="rgba(110,220,200,0.45)"/>
    <text x="56" y="${h - 86}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="700">${esc(title)}</text>
    <text x="56" y="${h - 60}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif" font-size="14">${esc(sub)}</text>
  </svg>`);
  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  await sharp(dest).webp({ quality: 86 }).toFile(dest.replace(/\.png$/, ".webp"));
  console.log("proof", path.basename(dest));
}

// --- NEW exclusive Unsplash pools (none of these are in IR 01-18) ---
const SUPPORT_URLS = [
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=82", // learning
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=82", // client meeting
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=82", // task board
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=82", // community
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=900&q=82", // celebrate progress
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=82", // online learning
  "https://images.unsplash.com/photo-1552960562-daf630e9278b?auto=format&fit=crop&w=900&q=82", // mentor review junior
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=82", // team handshake desk
];

const PROOF_URLS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=82",
];

const supportMeta = [
  ["Job Interview Support", "Mock interviews, answer preparation, and live backup for full-time roles."],
  ["Mentor Review System", "Senior people review your work, guide decisions, and help you avoid mistakes."],
  ["Routine Task Support", "Offload repetitive work so you can focus on learning and interviews."],
  ["Tools & Devices", "Practical tools, setup guidance, and the working environment you need."],
  ["Market & Growth Training", "Job demand, project demand, income paths, and staying stable after you get work."],
  ["Resume Review & Polish", "Sharper profile, stronger keywords, and a better first impression."],
  ["Proposal Writing", "Proposals that explain value, reduce risk, and increase replies."],
  ["Daily Job & Project Applications", "Consistent targeting for full-time jobs, freelance, and paid tasks."],
];

const proofMeta = [
  ["AI & Machine Learning", "Specialists who ship models into products"],
  ["Full Stack careers", "Portfolio proof, interviews, and placement"],
  ["Data & Security", "Practical skills employers actually hire for"],
  ["Coaching & mentors", "Senior review that raises your level"],
  ["Interview coaching", "Mock interviews until you are ready"],
];

// 1) Download exclusive support + proof sources
const supportSrcDir = path.join(UNIQUE, "support-pool");
const proofSrcDir = path.join(UNIQUE, "proof-pool");
fs.mkdirSync(supportSrcDir, { recursive: true });
fs.mkdirSync(proofSrcDir, { recursive: true });

for (let i = 0; i < SUPPORT_URLS.length; i++) {
  const dest = path.join(supportSrcDir, `${String(i + 1).padStart(2, "0")}.jpg`);
  await download(SUPPORT_URLS[i], dest);
  await coverJpg(dest, path.join(SUP, `${String(i + 1).padStart(2, "0")}.jpg`), 720, 480);
}
for (let i = 0; i < PROOF_URLS.length; i++) {
  const dest = path.join(proofSrcDir, `${String(i + 1).padStart(2, "0")}.jpg`);
  await download(PROOF_URLS[i], dest);
  await proofCard(
    dest,
    path.join(HERO, `hero-proof-${i}.png`),
    900,
    560,
    proofMeta[i][0],
    proofMeta[i][1]
  );
}

// 2) Flow panels: services ONLY (each key used once across desktop panels)
// Fields collage: ai, fullstack, security, interview
// Skills panel: skills
// Coach panel: mentor
// Jobs panel: jobs
// Unused: fde (kept in reserve, not shown elsewhere as full photo)
const fieldKeys = ["ai", "fullstack", "security", "interview"];
const fieldLabels = ["AI & ML", "Full Stack", "Security", "Coaching"];
await fieldsGrid(path.join(HERO, "hero-steps-1.png"), 630, 404, fieldKeys, fieldLabels);
await fieldsGrid(path.join(HERO, "hero-steps-1-mobile.png"), 550, 320, fieldKeys, fieldLabels);

await photoPanel(
  path.join(SVC, "skills.png"),
  path.join(HERO, "hero-steps-2.png"),
  630,
  404,
  "Skills that hire",
  "Marketable skills packaged with proof"
);
await photoPanel(
  path.join(SVC, "skills.png"),
  path.join(HERO, "hero-steps-2-mobile.png"),
  550,
  320,
  "Skills that hire",
  "Marketable skills packaged with proof"
);

await photoPanel(
  path.join(SVC, "mentor.png"),
  path.join(HERO, "hero-steps-3.png"),
  630,
  404,
  "Mentors & instructors",
  "Senior review, teaching, and delivery coaching"
);
await photoPanel(
  path.join(SVC, "mentor.png"),
  path.join(HERO, "hero-steps-3-mobile.png"),
  550,
  320,
  "Mentors & instructors",
  "Senior review, teaching, and delivery coaching"
);

await photoPanel(
  path.join(SVC, "jobs.png"),
  path.join(HERO, "hero-steps-4.png"),
  630,
  404,
  "Jobs & interview coaching",
  "Full-time roles, mock interviews, placement support"
);
await photoPanel(
  path.join(SVC, "jobs.png"),
  path.join(HERO, "hero-steps-4-mobile.png"),
  550,
  320,
  "Jobs & interview coaching",
  "Full-time roles, mock interviews, placement support"
);

// 3) Layers: keep dark plate for 0; user photos for 1/2 (not services)
const user1 = path.join(UNIQUE, "user-collab-1.jpg");
const user2 = path.join(UNIQUE, "user-collab-2.jpg");
await sharp(findAsset("image-c1e4aeed")).jpeg({ quality: 92 }).toFile(user1);
await sharp(findAsset("image-bf811370")).jpeg({ quality: 92 }).toFile(user2);

// Restore dark plate for layer 0 if photo crept back
const clean =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/hero_layer_0_clean.png";
if (fs.existsSync(clean)) {
  const plate = await sharp(clean).resize(1052, 1024, { fit: "cover" }).png().toBuffer();
  // EL logo if available
  const logoPng = "public/assets/images/elitechnexus-logo.png";
  let out = plate;
  if (fs.existsSync(logoPng)) {
    const mark = await sharp(logoPng).resize(110, 110).png().toBuffer();
    // dark cover over old hex slot then logo
    const cover = await sharp({
      create: { width: 125, height: 140, channels: 4, background: { r: 16, g: 27, b: 44, alpha: 1 } },
    })
      .png()
      .toBuffer();
    out = await sharp(plate)
      .composite([
        { input: cover, left: 50, top: 200 },
        { input: mark, left: 55, top: 215 },
      ])
      .png()
      .toBuffer();
  }
  await sharp(out).toFile(path.join(HERO, "hero_layer_0.png"));
  console.log("layer0 dark plate restored");
}

await photoPanel(
  user1,
  path.join(HERO, "hero_layer_1.png"),
  1052,
  1024,
  "How to write a resume",
  "Clear achievements, stronger keywords, better first impression"
);
await photoPanel(
  user2,
  path.join(HERO, "hero_layer_2.png"),
  1052,
  1024,
  "How to write a cover letter",
  "Tell your story so employers and clients trust your proof"
);

// 4) Update HTML support grid + cache bust
let html = fs.readFileSync("public/index.html", "utf8");
const items = supportMeta
  .map(([title, blurb], i) => {
    const n = String(i + 1).padStart(2, "0");
    return `      <li class="elite-fields__item">
        <div class="elite-fields__item-media">
          <img src="/assets/images/income-routes/support/${n}.jpg?v=${V}" alt="${title}" loading="lazy">
        </div>
        <strong>${title}</strong>
        <span>${blurb}</span>
      </li>`;
  })
  .join("\n");

html = html.replace(
  /<ul class="elite-fields__grid"[^>]*>[\s\S]*?<\/ul>/,
  `<ul class="elite-fields__grid" aria-label="Support services">\n${items}\n    </ul>`
);

html = html.replace(/hero_layer_([012])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/hero-proof-([0-4])\.(png|webp)(?:\?v=\d+)?/g, `hero-proof-$1.$2?v=${V}`);
html = html.replace(/hero-steps-([1-4])(-mobile)?\.png(?:\?v=\d+)?/g, `hero-steps-$1$2.png?v=${V}`);
html = html.replace(/income-routes\/support\/(\d+)\.jpg(?:\?v=\d+)?/g, `income-routes/support/$1.jpg?v=${V}`);
// leave masonry versions alone unless missing
html = html.replace(/income-routes\/(\d+)\.jpg(?:\?v=\d+)?/g, `income-routes/$1.jpg?v=${V}`);

fs.writeFileSync("public/index.html", html);

console.log(`
DONE v=${V}
Exclusive map:
  IR 01-18          → Ready-for-jobs masonry only
  services (7)      → Fields collage + Skills/Coach/Jobs panels only
  NEW support pool  → Support grid only
  NEW proof pool    → Thumbnail strip only
  dark plate        → hero_layer_0 (chat overlay)
  user photos       → hero_layer_1 / hero_layer_2
`);
