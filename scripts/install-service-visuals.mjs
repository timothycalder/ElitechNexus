/**
 * Replace code-heavy hero-steps + use-case visuals with professional service imagery.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const OUT = "public/assets/images";
const HERO = path.join(OUT, "home-hero");
const SVC = path.join(OUT, "services");
const V = 23;

fs.mkdirSync(SVC, { recursive: true });

const files = {
  ai: "svc-ai-ml.png",
  fullstack: "svc-fullstack.png",
  security: "svc-security.png",
  fde: "svc-fde.png",
  interview: "svc-interview.png",
  mentor: "svc-mentor.png",
  jobs: "svc-jobs.png",
  skills: "svc-skills.png",
};

for (const [k, name] of Object.entries(files)) {
  const src = path.join(SRC, name);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  await sharp(src).png().toFile(path.join(SVC, `${k}.png`));
  console.log("copied", k);
}

async function photoPanel(srcKey, w, h, title, subtitle) {
  const photo = await sharp(path.join(SVC, `${srcKey}.png`))
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#071018" stop-opacity="0.15"/>
        <stop offset="55%" stop-color="#071018" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" rx="18" ry="18"/>
    <rect x="16" y="${h - 78}" width="${Math.min(w - 32, 420)}" height="54" rx="12" fill="rgba(8,16,28,0.72)" stroke="rgba(110,220,200,0.35)"/>
    <text x="30" y="${h - 48}" fill="#E8FFF8" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">${escapeXml(title)}</text>
    <text x="30" y="${h - 28}" fill="rgba(200,230,220,0.85)" font-family="Arial, Helvetica, sans-serif" font-size="12">${escapeXml(subtitle)}</text>
  </svg>`);

  return sharp(photo)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Planner panel: clean service roadmap (not code) */
async function plannerPanel(w, h) {
  const rows = [
    ["01", "Match skills — AI, ML, Full Stack, Data, Security"],
    ["02", "Build portfolio proof with mentor review"],
    ["03", "Polish resume & daily job applications"],
    ["04", "Run mock interviews with live coaching"],
    ["05", "Ship paid projects & stay career-stable"],
  ];
  const rowH = Math.min(34, Math.floor((h - 28) / rows.length));
  const items = rows
    .map(([n, t], i) => {
      const y = 18 + i * rowH;
      const active = i === 0;
      return `
      <rect x="14" y="${y}" width="${w - 28}" height="${rowH - 6}" rx="10" fill="${active ? "rgba(70,190,170,0.16)" : "rgba(255,255,255,0.04)"}" stroke="${active ? "rgba(110,220,200,0.45)" : "rgba(255,255,255,0.06)"}"/>
      <text x="28" y="${y + rowH * 0.62}" fill="${active ? "#7EE0D0" : "rgba(180,210,230,0.55)"}" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700">${n}</text>
      <text x="58" y="${y + rowH * 0.62}" fill="${active ? "#F2FFFB" : "rgba(220,235,245,0.82)"}" font-family="Arial, Helvetica, sans-serif" font-size="13">${escapeXml(t)}</text>`;
    })
    .join("");

  const svg = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" rx="18" ry="18" fill="#0B1524"/>
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="17" ry="17" fill="none" stroke="rgba(120,180,220,0.18)"/>
    ${items}
  </svg>`);
  return sharp(svg).png().toBuffer();
}

async function writePng(buf, dest) {
  const tmp = dest + ".tmp.png";
  await sharp(buf).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("wrote", dest);
}

// --- Desktop hero-steps ---
await writePng(await plannerPanel(630, 204), path.join(HERO, "hero-steps-1.png"));
await writePng(
  await photoPanel("ai", 630, 344, "AI & Machine Learning", "Professional developers for models, pipelines & products"),
  path.join(HERO, "hero-steps-2.png")
);
await writePng(
  await photoPanel("mentor", 630, 630, "Mentors & instructors", "Senior review, teaching, and delivery coaching"),
  path.join(HERO, "hero-steps-3.png")
);
await writePng(
  await photoPanel("jobs", 630, 404, "Jobs & interview coaching", "Full-time roles, mock interviews, placement support"),
  path.join(HERO, "hero-steps-4.png")
);

// --- Mobile ---
await writePng(await plannerPanel(550, 197), path.join(HERO, "hero-steps-1-mobile.png"));
await writePng(
  await photoPanel("fullstack", 550, 253, "Full Stack delivery", "Build and ship with experienced engineers"),
  path.join(HERO, "hero-steps-2-mobile.png")
);
await writePng(
  await photoPanel("interview", 550, 250, "Interview coaching", "Practice, confidence, live backup"),
  path.join(HERO, "hero-steps-3-mobile.png")
);
await writePng(
  await photoPanel("security", 550, 249, "Data & Security", "Protect systems while you grow your career"),
  path.join(HERO, "hero-steps-4-mobile.png")
);

// --- Thumbs (750x497) for slider ---
const thumbs = [
  ["hero-steps-0-thumb.png", "skills", "Skills that hire", "AI · ML · Full Stack · Data · Security · FDE"],
  ["hero-steps-1-thumb.png", "fde", "Forward Deployed Engineering", "On-site clarity. Client-ready delivery."],
  ["hero-steps-2-thumb.png", "ai", "AI & Machine Learning", "Real specialists, not tool demos."],
  ["hero-steps-3-thumb.png", "mentor", "Teaching & mentors", "Senior people who raise your level."],
  ["hero-steps-4-thumb.png", "interview", "Interview & jobs", "Coaching that gets you hired."],
];
for (const [name, key, title, sub] of thumbs) {
  await writePng(await photoPanel(key, 750, 497, title, sub), path.join(HERO, name));
  // also webp variants if referenced
  const webp = name.replace(/\.png$/, ".webp");
  await sharp(path.join(HERO, name)).webp({ quality: 88 }).toFile(path.join(HERO, webp));
  console.log("webp", webp);
}

// --- Use-case cards ---
async function useCaseCard(srcKey, w, h) {
  return sharp(path.join(SVC, `${srcKey}.png`))
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

await writePng(await useCaseCard("interview", 1350, 744), path.join(OUT, "use-cases01.png"));
await writePng(await useCaseCard("fde", 1350, 744), path.join(OUT, "use-cases02.png"));
await writePng(await useCaseCard("mentor", 1350, 744), path.join(OUT, "use-cases03.png"));
await writePng(await useCaseCard("jobs", 406, 622), path.join(OUT, "use-cases-mobile01.png"));
await writePng(await useCaseCard("fullstack", 406, 622), path.join(OUT, "use-cases-mobile02.png"));
await writePng(await useCaseCard("ai", 406, 622), path.join(OUT, "use-cases-mobile03.png"));

// --- Update use-case card titles in HTML to match professional services ---
let html = fs.readFileSync("public/index.html", "utf8");

const cardReplacements = [
  // slide titles if still old routes - keep structure, sharpen language
  [
    '<h3 class="o-slider__slide-title">Full-time job route</h3>',
    '<h3 class="o-slider__slide-title">Full-time careers</h3>',
  ],
  [
    '<h3 class="o-slider__slide-title">Freelance project route</h3>',
    '<h3 class="o-slider__slide-title">Client project delivery</h3>',
  ],
  [
    '<h3 class="o-slider__slide-title">Side-income route</h3>',
    '<h3 class="o-slider__slide-title">Skills &amp; coaching track</h3>',
  ],
];

// Card block titles inside use-cases (Partner income etc.) - find exact strings
const more = [
  ["Partner income", "Enterprise talent"],
  [
    "Use your network to introduce hiring needs, local businesses, clients, or developers and earn through successful connections.",
    "Deploy vetted AI, ML, Full Stack, Data, Security, and Forward Deployed engineers into real client work.",
  ],
  ["Side-income route", "Interview &amp; job coaching"],
  [
    "Small practical tasks, learning plans, and repeatable routines for students, seniors, and ordinary people who want extra income.",
    "Mock interviews, resume polish, mentor review, and daily targeting for full-time roles.",
  ],
  ["Freelance project support", "Project &amp; delivery support"],
  [
    "Proposal writing, client matching, delivery support, task outsourcing, and review systems for paid project work.",
    "Proposal writing, senior review, and delivery coaching so paid projects ship cleanly.",
  ],
  ["I am junior, but the market requires senior level.", "Junior title. Senior-ready proof."],
  [
    "We close the gap by helping you build proof, practice interviews, get senior review, and show employers that you can deliver real work even if your title is still junior.",
    "We close the gap with portfolio proof, interview practice, senior review, and instructors who coach you to deliver like a pro.",
  ],
];

for (const [a, b] of [...cardReplacements, ...more]) {
  if (html.includes(a)) {
    html = html.split(a).join(b);
    console.log("copy:", b.slice(0, 48));
  } else console.warn("copy miss:", a.slice(0, 48));
}

// Cache bust hero-steps + use-cases
html = html.replace(/hero-steps-([0-4])(-mobile)?\.(png|webp)(?:\?v=\d+)?/g, `hero-steps-$1$2.$3?v=${V}`);
html = html.replace(/use-cases(0[1-3]|-mobile0[1-3])\.png(?:\?v=\d+)?/g, `use-cases$1.png?v=${V}`);

// Nav labels in services panel
html = html.replace(
  /(<div id="home-hero__flow-visual-right-nav">)([\s\S]*?)(<\/div>\s*<div id="home-hero__flow-visual-right-box")/,
  (full, a, mid, c) => {
    let m = mid;
    m = m.replace(/>Shell<\/div>/, ">Skills</div>");
    m = m.replace(/>Browser<\/div>/, ">Jobs</div>");
    m = m.replace(/>Editor<\/div>/, ">Coach</div>");
    m = m.replace(/>Planner<\/div>/, ">Plan</div>");
    return a + m + c;
  }
);

fs.writeFileSync("public/index.html", html);
console.log("html updated v=", V);
console.log("done");
