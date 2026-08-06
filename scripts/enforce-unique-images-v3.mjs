/**
 * Enforce one-image-one-place across homepage visuals.
 * Regenerates proof strip, support grid, skills grid, and flow panels
 * from exclusive Unsplash sources (no shared stock photos).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const SVC = "public/assets/images/services";
const SUP = "public/assets/images/income-routes/support";
const POOL = "public/assets/images/unique/exclusive-v3";
const V = 60;

fs.mkdirSync(POOL, { recursive: true });
fs.mkdirSync(SUP, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 4000) {
    console.log("keep", path.basename(dest));
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`dl ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function coverJpg(src, dest, w, h) {
  await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.96, saturation: 1.02 })
    .jpeg({ quality: 88 })
    .toFile(dest);
}

async function proofCard(src, dest, w, h, title, sub) {
  const photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.9, saturation: 0.98 })
    .sharpen()
    .png()
    .toBuffer();
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
  let out = await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();
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

async function photoPanel(src, dest, w, h, title, sub) {
  const photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 0.98 })
    .png()
    .toBuffer();
  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="40%" stop-color="#071018" stop-opacity="0"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.78"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="20" y="${h - 92}" width="${Math.min(w - 40, 480)}" height="64" rx="14"
      fill="rgba(8,16,28,0.72)" stroke="rgba(110,220,200,0.35)"/>
    <text x="36" y="${h - 56}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="20" font-weight="700">${esc(title)}</text>
    <text x="36" y="${h - 34}" fill="rgba(200,230,220,0.88)" font-family="Arial,Helvetica,sans-serif"
      font-size="13">${esc(sub)}</text>
  </svg>`);
  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("panel", path.basename(dest));
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
    const labelSvg = Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
      <text x="${textX}" y="${textY}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700">${esc(label)}</text>
    </svg>`);
    cell = await sharp(cell).composite([{ input: labelSvg, left: 0, top: 0 }]).png().toBuffer();
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
  console.log("skills-grid", path.basename(dest));
}

// Exclusive pools — each URL used exactly once across the homepage
const URLS = {
  // Skills grid (6)
  skill_ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=82",
  skill_fs: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=82",
  skill_data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=82",
  skill_sec: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=82",
  skill_cloud: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=82",
  skill_plat: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=82",

  // Flow panels Jobs / Coach / Fields (3) — NOT the old interview/mentor stock
  panel_jobs: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=82",
  panel_coach: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82",
  panel_fields: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=82",

  // Proof strip (5)
  proof0: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=82",
  proof1: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=82",
  proof2: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=82",
  proof3: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=82",
  proof4: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=82",

  // Support grid (8) — all different from proof/skills/panels
  sup01: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=82",
  // wait - that portrait was bad before. Use meeting:
  // Actually redefine below
};

// Fix support URLs carefully (distinct scenes)
Object.assign(URLS, {
  // Job interview support — different interview-like meeting (not services/interview)
  sup01: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=82",
  // Mentor review — teaching whiteboard (not mentor tablet stock)
  // but panel_coach uses sticky notes workshop - use different:
  sup02: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=82",
  // Routine tasks
  sup03: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=900&q=82",
  // Tools & devices
  sup04: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=82",
  // Market training
  // avoid panel_coach photo-1552664730 - use classroom
  // Wait: skill_cloud is earth from space. Use:
  // Actually check duplicates in URLS object carefully after assign

  // Market & growth
  // Use: presentation hall different
  // photo-1540575467063 was conference audience - use:
});

Object.assign(URLS, {
  // Market training - speaker on stage (unique)
  // Skip if conflicting
});

// Rebuild URLS cleanly as ordered exclusive list
const EXCLUSIVE = [
  // Skills 6
  ["skill-ai.jpg", "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=82"],
  ["skill-fullstack.jpg", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=82"],
  ["skill-data.jpg", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=82"],
  ["skill-security.jpg", "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=82"],
  ["skill-cloud.jpg", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=82"],
  ["skill-platform.jpg", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=82"],
  // Flow panels 3
  ["panel-jobs.jpg", "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=82"],
  ["panel-coach.jpg", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=82"],
  ["panel-fields.jpg", "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=82"],
  // Proof 5
  ["proof-0.jpg", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=82"],
  ["proof-1.jpg", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=82"],
  ["proof-2.jpg", "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=82"],
  ["proof-3.jpg", "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=82"],
  ["proof-4.jpg", "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=82"],
  // Support 8
  ["sup-01.jpg", "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=82"],
  ["sup-02.jpg", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=82"],
  ["sup-03.jpg", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=82"],
  ["sup-04.jpg", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=82"],
  ["sup-05.jpg", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=82"],
  ["sup-06.jpg", "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=82"],
  ["sup-07.jpg", "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=82"],
  ["sup-08.jpg", "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=82"],
  // Hero layers 3–4 (replace old mock-interview / portfolio that may overlap)
  ["layer-3.jpg", "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=82"],
  ["layer-4.jpg", "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=82"],
];

// Validate unique URLs
const urlSet = new Set();
for (const [, u] of EXCLUSIVE) {
  if (urlSet.has(u)) throw new Error("duplicate URL " + u);
  urlSet.add(u);
}

const files = {};
for (const [name, url] of EXCLUSIVE) {
  const dest = path.join(POOL, name);
  await download(url, dest);
  files[name] = dest;
}

// --- Skills grid (exclusive) ---
const skillCells = [
  { src: files["skill-ai.jpg"], label: "AI & ML" },
  { src: files["skill-fullstack.jpg"], label: "Full Stack" },
  { src: files["skill-data.jpg"], label: "Data" },
  { src: files["skill-security.jpg"], label: "Security" },
  { src: files["skill-cloud.jpg"], label: "Cloud & DevOps" },
  { src: files["skill-platform.jpg"], label: "Platform Skills" },
];
await skillsGrid(path.join(HERO, "hero-steps-1.png"), 630, 630, skillCells);
await skillsGrid(path.join(HERO, "hero-steps-1-mobile.png"), 550, 520, skillCells);

// --- Flow panels ---
await photoPanel(files["panel-jobs.jpg"], path.join(HERO, "hero-steps-2.png"), 630, 630, "Jobs & placement", "Full-time roles with coaching support");
await photoPanel(files["panel-jobs.jpg"], path.join(HERO, "hero-steps-2-mobile.png"), 550, 520, "Jobs & placement", "Full-time roles with coaching support");
await photoPanel(files["panel-coach.jpg"], path.join(HERO, "hero-steps-3.png"), 630, 630, "Mentors & coaching", "Senior review, teaching, and interview prep");
await photoPanel(files["panel-coach.jpg"], path.join(HERO, "hero-steps-3-mobile.png"), 550, 520, "Mentors & coaching", "Senior review, teaching, and interview prep");
await photoPanel(files["panel-fields.jpg"], path.join(HERO, "hero-steps-4.png"), 630, 630, "Fields & delivery", "Interview-ready specialists across every stack");
await photoPanel(files["panel-fields.jpg"], path.join(HERO, "hero-steps-4-mobile.png"), 550, 520, "Fields & delivery", "Interview-ready specialists across every stack");

// --- Proof strip ---
const proofs = [
  ["proof-0.jpg", "hero-proof-0.png", "AI & Machine Learning", "Models, pipelines, and product delivery"],
  ["proof-1.jpg", "hero-proof-1.png", "Full Stack careers", "Build, ship, and present portfolio proof"],
  ["proof-2.jpg", "hero-proof-2.png", "Data & Security", "Analytics, protection, and trusted systems"],
  ["proof-3.jpg", "hero-proof-3.png", "Coaching & mentors", "Senior review that raises your level"],
  ["proof-4.jpg", "hero-proof-4.png", "Fields & delivery", "Interview-ready specialists across every stack"],
];
for (const [srcName, outName, title, sub] of proofs) {
  const out = path.join(HERO, outName);
  await proofCard(files[srcName], out, 900, 560, title, sub);
  const idx = outName.match(/hero-proof-(\d)/)[1];
  fs.copyFileSync(out, path.join(HERO, `hero-steps-${idx}-thumb.png`));
  fs.copyFileSync(out.replace(/\.png$/, ".webp"), path.join(HERO, `hero-steps-${idx}-thumb.webp`));
}

// --- Support grid ---
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
for (let i = 0; i < 8; i++) {
  const n = String(i + 1).padStart(2, "0");
  await coverJpg(files[`sup-${n}.jpg`], path.join(SUP, `${n}.jpg`), 720, 480);
  console.log("support", n);
}

// --- Hero layers 3–4 (keep 0 brand plate; keep 1–2 if unique — replace 3–4) ---
async function layerCard(src, dest, title, sub) {
  const W = 1052,
    H = 1024;
  const photo = await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 0.98 })
    .png()
    .toBuffer();
  const badgeY = H - 130;
  const ov = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="30%" stop-color="#071018" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${badgeY}" width="${Math.min(W - 72, 680)}" height="86" rx="16"
      fill="rgba(8,16,28,0.8)" stroke="rgba(110,220,200,0.5)"/>
    <text x="56" y="${badgeY + 36}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${badgeY + 64}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(sub)}</text>
  </svg>`);
  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("layer", path.basename(dest));
}
await layerCard(files["layer-3.jpg"], path.join(HERO, "hero_layer_3.png"), "Mock interviews that stick", "Live practice with feedback until your answers land");
await layerCard(files["layer-4.jpg"], path.join(HERO, "hero_layer_4.png"), "Portfolio that proves skill", "Package projects so employers and clients trust your work");

// Also stop using services/*.png as visible sources — overwrite services with exclusive skill crops
// so any leftover references can't resurrect old interview/mentor/fde repeats
const svcMap = [
  ["ai.png", "skill-ai.jpg"],
  ["fullstack.png", "skill-fullstack.jpg"],
  ["security.png", "skill-security.jpg"],
  ["fde.png", "skill-cloud.jpg"],
  ["skills.png", "skill-platform.jpg"],
  ["jobs.png", "panel-jobs.jpg"],
  ["mentor.png", "panel-coach.jpg"],
  ["interview.png", "panel-fields.jpg"],
];
for (const [svc, src] of svcMap) {
  await sharp(files[src]).resize(1200, 800, { fit: "cover" }).png().toFile(path.join(SVC, svc));
  console.log("svc sync", svc);
}

// HTML cache bump + support markup
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
html = html.replace(/hero-proof-([0-4])\.(png|webp)(?:\?v=\d+)?/g, `hero-proof-$1.$2?v=${V}`);
html = html.replace(/hero-steps-([1-4])(-mobile)?\.png(?:\?v=\d+)?/g, `hero-steps-$1$2.png?v=${V}`);
html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/income-routes\/support\/(\d+)\.jpg(?:\?v=\d+)?/g, `income-routes/support/$1.jpg?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("DONE exclusive images v=", V);
