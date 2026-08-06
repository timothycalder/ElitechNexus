/**
 * Remake bento feature visuals so each image matches its title.
 * Replaces leftover Cursor-agent UI mockups with professional career photos.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "public/assets/images";
const POOL = path.join(DIR, "unique/bento-match-v1");
const V = 64;

fs.mkdirSync(POOL, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 8000) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function photoCard(src, dest, w, h, title, sub, { phone = false } = {}) {
  const bak = dest + ".pre-match.bak";
  if (fs.existsSync(dest) && !fs.existsSync(bak)) fs.copyFileSync(dest, bak);

  let photo = await sharp(src)
    .resize(w, h, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.9, saturation: 0.95 })
    .png()
    .toBuffer();

  const badgeW = Math.min(w - 40, phone ? w - 48 : Math.floor(w * 0.92));
  const badgeH = phone ? 78 : Math.max(72, Math.round(h * 0.16));
  const badgeX = 20;
  const badgeY = h - badgeH - 20;
  const titleSize = phone ? 18 : Math.max(15, Math.min(22, Math.round(w * 0.065)));
  const subSize = phone ? 12 : Math.max(11, Math.min(14, Math.round(w * 0.04)));

  const ov = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="30%" stop-color="#071018" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="14"
      fill="rgba(8,16,28,0.86)" stroke="rgba(110,220,200,0.45)"/>
    <text x="${badgeX + 16}" y="${badgeY + Math.round(badgeH * 0.42)}" fill="#E8FFF8"
      font-family="Arial,Helvetica,sans-serif" font-size="${titleSize}" font-weight="700">${esc(title)}</text>
    <text x="${badgeX + 16}" y="${badgeY + Math.round(badgeH * 0.72)}" fill="rgba(200,230,220,0.92)"
      font-family="Arial,Helvetica,sans-serif" font-size="${subSize}">${esc(sub)}</text>
  </svg>`);

  let out = await sharp(photo).composite([{ input: ov, left: 0, top: 0 }]).png().toBuffer();

  const radius = phone ? 28 : 18;
  out = await sharp(out)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${w}" height="${h}"><rect width="100%" height="100%" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  await sharp(out).png().toFile(dest);
  console.log("wrote", path.basename(dest), w + "x" + h);
}

// Exclusive Unsplash sources — career / delivery / coaching (not AI agent UI)
const sources = {
  jobs:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85", // hiring interview table
  projects:
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=85", // team client delivery meeting
  coaching:
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=85", // mentor coaching conversation
};

await download(sources.jobs, path.join(POOL, "jobs.jpg"));
await download(sources.projects, path.join(POOL, "projects.jpg"));
await download(sources.coaching, path.join(POOL, "coaching.jpg"));

// --- 01 Full-time job support ---
await photoCard(
  path.join(POOL, "jobs.jpg"),
  path.join(DIR, "bento-mobile01.png"),
  612,
  590,
  "Full-time job support",
  "Resume, interviews, and placement prep",
  { phone: true }
);
await photoCard(
  path.join(POOL, "jobs.jpg"),
  path.join(DIR, "card01.png"),
  266,
  460,
  "Full-time jobs",
  "Resume · interviews · offers",
  { phone: false }
);

// --- 02 Project & delivery support ---
await photoCard(
  path.join(POOL, "projects.jpg"),
  path.join(DIR, "bento-mobile02.png"),
  554,
  540,
  "Project & delivery",
  "Proposals, clients, and shipped work",
  { phone: true }
);
await photoCard(
  path.join(POOL, "projects.jpg"),
  path.join(DIR, "card02-line.png"),
  264,
  466,
  "Projects",
  "Delivery that clients trust",
  { phone: false }
);

// --- 03 Interview & job coaching ---
await photoCard(
  path.join(POOL, "coaching.jpg"),
  path.join(DIR, "bento-mobile03.png"),
  610,
  494,
  "Interview coaching",
  "Practice until answers land",
  { phone: true }
);
await photoCard(
  path.join(POOL, "coaching.jpg"),
  path.join(DIR, "card03-line.png"),
  266,
  540,
  "Coaching",
  "Senior review & mock interviews",
  { phone: false }
);
await photoCard(
  path.join(POOL, "coaching.jpg"),
  path.join(DIR, "bento-hover03.png"),
  1288,
  628,
  "Interview & job coaching",
  "Live practice with senior feedback",
  { phone: false }
);

// Fix item-03 subtitle (was about side income — mismatched)
let html = fs.readFileSync("public/index.html", "utf8");
const oldSub =
  "Small practical tasks, learning plans, and repeatable routines for engineers and builders who want extra income — without giving up the path to full-time opportunity.";
const newSub =
  "Mock interviews, answer frameworks, senior feedback, and confidence building — so you walk into real interviews ready to win the role.";
if (html.includes(oldSub)) {
  html = html.replace(oldSub, newSub);
  console.log("fixed item-03 subtitle copy");
} else {
  console.log("item-03 subtitle already changed or not found");
}

// Bump cache versions for replaced assets
const bumps = [
  ["card01.png", V],
  ["bento-mobile01.png", V],
  ["card02-line.png", V],
  ["bento-mobile02.png", V],
  ["card03-line.png", V],
  ["bento-mobile03.png", V],
  ["bento-hover03.png", V],
];
for (const [file, ver] of bumps) {
  const re = new RegExp(`(/assets/images/${file.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g");
  html = html.replace(re, `$1?v=${ver}`);
}

// Make photo cards fill nicely (contain was for old line art / phone mockups)
if (!html.includes("elitechnexus-bento-photo-fit")) {
  html = html.replace(
    "</head>",
    `<style id="elitechnexus-bento-photo-fit">
#home-bento__item-01 .home-bento__item-image-main-wrapper img,
#home-bento__item-02 .home-bento__item-image-main-wrapper img,
#home-bento__item-03 .home-bento__item-image-main-wrapper img,
#home-bento img[src*="bento-mobile"],
#home-bento img[src*="card0"],
#home-bento img[src*="bento-hover03"]{
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 18px !important;
}
#home-bento__item-02 .home-bento__item-image-main-wrapper{
  width: 42% !important;
}
</style></head>`
  );
}

fs.writeFileSync("public/index.html", html);
console.log("done cache v=" + V);
