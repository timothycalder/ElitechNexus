/**
 * Unique local-only assignment (no downloads).
 * Masonry: IR 01-18
 * Layers: 2 user photos + mentor
 * Support: interview, jobs, ai, fullstack, security, skills, fde + leftover unique file
 *   WAIT - that's 7 services + need 8. mentor used in layer.
 *   Services total 8: mentor(layer), interview, jobs, ai, fullstack, security, skills, fde = 7 for support... need 8th.
 *   8th: use old support file that we'll treat as dedicated, OR duplicate-free career-prep upscaled.
 *
 * Better support = all 7 remaining services + career-prep write-cover as 8th
 * Proofs = CANNOT use same services — rebuild proofs from IR? No, masonry.
 *
 * So proofs must be removed from services usage:
 * Option: proofs use the 5 OLD support jpgs (physically different files from IR)
 * even if similar Unsplash — better than same file. User asked no repeat —
 * old support hashes differ from IR.
 *
 * FINAL local-only:
 * layers: user1, user2, mentor.png
 * support: interview, jobs, ai, fullstack, security, skills, fde, and skills? only 7 left
 *   services: ai,fde,fullstack,interview,jobs,mentor,security,skills = 8
 *   mentor → layer2
 *   remaining 7 for support → need 1 more: unique/from career-prep or old support/01
 * proofs: old support 01-05 (different files) as full-bleed cards
 * thumbs sync from proofs
 * masonry: IR 01-18 unchanged
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ASSETS =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const SUP = "public/assets/images/income-routes/support";
const SVC = "public/assets/images/services";
const HERO = "public/assets/images/home-hero";
const UNIQUE = "public/assets/images/unique";
const OLD_SUP_BAK = "public/assets/images/income-routes/support-bak";
const V = 33;

fs.mkdirSync(UNIQUE, { recursive: true });

function findAsset(partial) {
  const hit = fs.readdirSync(ASSETS).find((f) => f.includes(partial));
  if (!hit) throw new Error("missing " + partial);
  return path.join(ASSETS, hit);
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function coverJpg(src, dest, w, h) {
  await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 88 })
    .toFile(dest);
}

async function layerPng(src, dest, w, h, title, subtitle, leaveChatSpace = false) {
  const photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.9, saturation: 0.97 })
    .png()
    .toBuffer();

  const g = leaveChatSpace
    ? `<stop offset="0%" stop-color="#071018" stop-opacity="0.55"/><stop offset="25%" stop-color="#071018" stop-opacity="0.15"/><stop offset="55%" stop-color="#071018" stop-opacity="0.25"/><stop offset="100%" stop-color="#071018" stop-opacity="0.9"/>`
    : `<stop offset="35%" stop-color="#071018" stop-opacity="0.08"/><stop offset="100%" stop-color="#071018" stop-opacity="0.86"/>`;

  const brand = leaveChatSpace
    ? `<text x="${w / 2}" y="52" text-anchor="middle" fill="rgba(180,210,230,0.8)" font-family="Arial,Helvetica,sans-serif" font-size="17">Build more with Elitechnexus</text>
       <line x1="200" y1="72" x2="${w - 200}" y2="72" stroke="rgba(120,160,190,0.35)"/>
       <text x="${w / 2}" y="120" text-anchor="middle" fill="#F2FFFB" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="700">Elitechnexus</text>`
    : "";

  const by = leaveChatSpace ? h - 300 : h - 120;
  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">${g}</linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    ${brand}
    <rect x="36" y="${by}" width="${Math.min(w - 72, 640)}" height="82" rx="16" fill="rgba(8,16,28,0.8)" stroke="rgba(110,220,200,0.45)"/>
    <text x="56" y="${by + 34}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="700">${esc(title)}</text>
    <text x="56" y="${by + 60}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif" font-size="14">${esc(subtitle)}</text>
  </svg>`);

  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("wrote", path.basename(dest), "←", path.basename(src));
}

// Backup current support (for proofs) once
if (!fs.existsSync(OLD_SUP_BAK)) {
  fs.mkdirSync(OLD_SUP_BAK, { recursive: true });
  for (const f of fs.readdirSync(SUP)) {
    if (f.endsWith(".jpg")) fs.copyFileSync(path.join(SUP, f), path.join(OLD_SUP_BAK, f));
  }
  console.log("backed up old support → support-bak");
}

const user1 = path.join(UNIQUE, "user-collab-1.jpg");
const user2 = path.join(UNIQUE, "user-collab-2.jpg");
await sharp(findAsset("image-c1e4aeed")).jpeg({ quality: 92 }).toFile(user1);
await sharp(findAsset("image-bf811370")).jpeg({ quality: 92 }).toFile(user2);

// Layers: 2 user + mentor
await layerPng(user1, path.join(HERO, "hero_layer_0.png"), 1052, 1024, "Most common interview questions", "Practice answers with mentors until you sound confident", true);
await layerPng(user2, path.join(HERO, "hero_layer_1.png"), 1052, 1024, "How to write a resume", "Clear achievements, stronger keywords, better first impression");
await layerPng(path.join(SVC, "mentor.png"), path.join(HERO, "hero_layer_2.png"), 1052, 1024, "How to write a cover letter", "Tell your story so employers and clients trust your proof");

// Support: 7 remaining services + old support bak 08 as 8th unique file
const supportPlan = [
  ["01.jpg", path.join(SVC, "interview.png")],
  ["02.jpg", path.join(SVC, "jobs.png")],
  ["03.jpg", path.join(SVC, "ai.png")],
  ["04.jpg", path.join(SVC, "fullstack.png")],
  ["05.jpg", path.join(SVC, "security.png")],
  ["06.jpg", path.join(SVC, "skills.png")],
  ["07.jpg", path.join(SVC, "fde.png")],
  ["08.jpg", path.join(OLD_SUP_BAK, "08.jpg")],
];

for (const [name, src] of supportPlan) {
  await coverJpg(src, path.join(SUP, name), 720, 480);
  console.log("support", name, "←", path.basename(src));
}

// Proofs: old support bak 01-05 (not used in new support except 08)
const proofPlan = [
  ["hero-proof-0.png", "01.jpg", "AI & Machine Learning", "Specialists who ship models into products"],
  ["hero-proof-1.png", "02.jpg", "Full Stack careers", "Portfolio proof, interviews, and placement"],
  ["hero-proof-2.png", "03.jpg", "Data & Security", "Practical skills employers actually hire for"],
  ["hero-proof-3.png", "04.jpg", "Coaching & mentors", "Senior review that raises your level"],
  ["hero-proof-4.png", "05.jpg", "Interview coaching", "Mock interviews until you are ready"],
];

for (const [out, bak, title, sub] of proofPlan) {
  const src = path.join(OLD_SUP_BAK, bak);
  await layerPng(src, path.join(HERO, out), 900, 560, title, sub);
  await sharp(path.join(HERO, out)).webp({ quality: 86 }).toFile(path.join(HERO, out.replace(/\.png$/, ".webp")));
  const idx = out.match(/(\d)/)[1];
  fs.copyFileSync(path.join(HERO, out), path.join(HERO, `hero-steps-${idx}-thumb.png`));
}

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

let html = fs.readFileSync("public/index.html", "utf8");
const items = supportMeta
  .map(([title, blurb], i) => {
    const n = String(i + 1).padStart(2, "0");
    return `      <li class="elite-fields__item">
        <div class="elite-fields__item-media">
          <img src="/assets/images/income-routes/support/${n}.jpg?v=${V}" alt="" loading="lazy">
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
html = html.replace(/hero-steps-([0-4])-thumb\.(png|webp)(?:\?v=\d+)?/g, `hero-steps-$1-thumb.$2?v=${V}`);
html = html.replace(/income-routes\/support\/(\d+)\.jpg(?:\?v=\d+)?/g, `income-routes/support/$1.jpg?v=${V}`);
html = html.replace(/income-routes\/(\d+)\.jpg(?:\?v=\d+)?/g, `income-routes/$1.jpg?v=${V}`);
fs.writeFileSync("public/index.html", html);

console.log("\nAssignment:");
console.log("IR 01-18 → Ready for jobs masonry (once each)");
console.log("user-collab-1/2 → hero_layer_0/1");
console.log("mentor.png → hero_layer_2");
console.log("7 services + bak/08 → support 01-08");
console.log("bak 01-05 → hero-proof 0-4");
console.log("done v=" + V);
