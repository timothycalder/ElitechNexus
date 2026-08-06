/**
 * Enforce one-photo-one-use across homepage live assets.
 * The same asianWomanSmile was wrongly reused on p3/p5/p7/p9/p12 + career-prep + hero layers.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const V = 89;
const POOL = "public/assets/images/unique/once-pool";
const HERO = "public/assets/images/home-hero";
fs.mkdirSync(POOL, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function faceHash(f) {
  const buf = await sharp(f)
    .resize(72, 72, { fit: "cover", position: "attention" })
    .raw()
    .toBuffer();
  return crypto.createHash("md5").update(buf).digest("hex");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 30000) {
    console.log("keep", path.basename(dest));
    return dest;
  }
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25000) throw new Error(`too small ${buf.length}`);
  fs.writeFileSync(dest, buf);
  const m = await sharp(dest).metadata();
  console.log("dl", path.basename(dest), `${m.width}x${m.height}`);
  return dest;
}

async function makeLayer(src, dest, title, subtitle, position = "attention") {
  const W = 1052;
  const H = 1024;
  const bak = dest + ".pre-unique.bak";
  if (fs.existsSync(dest) && !fs.existsSync(bak)) fs.copyFileSync(dest, bak);

  const photo = await sharp(src)
    .resize(W, H, { fit: "cover", position, kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 0.97, saturation: 1.02 })
    .sharpen({ sigma: 0.5 })
    .png()
    .toBuffer();

  const badgeY = H - 130;
  const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="42%" stop-color="#071018" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${badgeY}" width="700" height="86" rx="16"
      fill="rgba(8,16,28,0.82)" stroke="rgba(110,220,200,0.5)"/>
    <text x="56" y="${badgeY + 36}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${badgeY + 64}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(subtitle)}</text>
  </svg>`);

  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: overlay, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  await sharp(dest).webp({ quality: 82 }).toFile(dest.replace(/\.png$/i, ".webp"));
  console.log("layer", path.basename(dest), "←", path.basename(src));
}

async function peopleJpg(src, dest) {
  const bak = dest + ".pre-unique.bak";
  if (fs.existsSync(dest) && !fs.existsSync(bak)) fs.copyFileSync(dest, bak);
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dest);
  console.log("people", path.basename(dest), "←", path.basename(src));
}

async function coverPng(src, dest, w = 1200, h = 1200) {
  const bak = dest + ".pre-unique.bak";
  if (fs.existsSync(dest) && !fs.existsSync(bak)) fs.copyFileSync(dest, bak);
  await sharp(src).resize(w, h, { fit: "cover", position: "attention" }).png().toFile(dest);
  console.log("cover", path.basename(dest), "←", path.basename(src));
}

// Distinct stock URLs — each person / scene used at most once on the site
const downloads = {
  // Asian professional women (different people)
  w_smile:
    "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?auto=format&fit=crop&w=1400&q=85",
  w_blazer:
    "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=1400",
  w_laptop:
    "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1400",
  w_meeting:
    "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1400",
  w_glasses:
    "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1400",
  w_curl:
    "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1400",
  w_office:
    "https://images.pexels.com/photos/789822/pexels-photo-789822.jpeg?auto=compress&cs=tinysrgb&w=1400",
  w_window:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=85",
  w_soft:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1400&q=85",
  w_studio:
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1400&q=85",
  // Men / collab scenes (unique)
  m_probe: null, // local
  collab_team: null,
  collab_code: null,
  collab_cowork: null,
};

const local = {};

// Prefer already-verified local files first (guaranteed different hashes from audit)
const preferLocal = {
  w_smile: "public/assets/images/career-prep/real-v2/asianWomanSmile.jpg",
  w_blazer: "public/assets/images/career-prep/real-v2/asianWomanPortrait.jpg",
  w_laptop: "public/assets/images/career-prep/real-v2/asianWomanLaptop.jpg",
  w_meeting: "public/assets/images/career-prep/real-v2/asianWomanMeeting.jpg",
  w_office: "public/assets/images/career-prep/realistic-raw/asian-pro-office.jpg",
  w_pro: "public/assets/images/career-prep/realistic-raw/asian-pro-portrait.jpg",
  w_softlocal: "public/assets/images/career-prep/realistic-raw/asian-smile.jpg",
  m_probe: "public/assets/images/career-prep/probe/a.jpg",
  collab_team: "public/assets/images/career-prep/real-v2/teamCollab.jpg",
  collab_code: "public/assets/images/career-prep/final-pick/col3.jpg",
  collab_cowork: "public/assets/images/career-prep/real-v2/coworking.jpg",
  collab_board: "public/assets/images/career-prep/real-v2/whiteboard.jpg",
  collab_review: "public/assets/images/career-prep/real-v2/reviewWork.jpg",
};

for (const [k, p] of Object.entries(preferLocal)) {
  if (p && fs.existsSync(p) && fs.statSync(p).size > 20000) {
    local[k] = p;
    console.log("local", k, path.basename(p));
  }
}

// Fill gaps + add more unique women via download
for (const [k, url] of Object.entries(downloads)) {
  if (!url || local[k]) continue;
  try {
    local[k] = await download(url, path.join(POOL, k + ".jpg"));
  } catch (e) {
    console.warn("skip", k, e.message);
  }
}

// Extra unique women if we still need slots
const extras = [
  [
    "w_extra1",
    "https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=1400",
  ],
  [
    "w_extra2",
    "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=1400&q=85",
  ],
  [
    "w_extra3",
    "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1400",
  ],
  [
    "w_extra4",
    "https://images.pexels.com/photos/1987301/pexels-photo-1987301.jpeg?auto=compress&cs=tinysrgb&w=1400",
  ],
  [
    "w_extra5",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1400&q=85",
  ],
];
for (const [k, url] of extras) {
  if (local[k]) continue;
  try {
    local[k] = await download(url, path.join(POOL, k + ".jpg"));
  } catch (e) {
    console.warn("skip", k, e.message);
  }
}

// Deduplicate pool by face hash — keep first of each unique face
const uniqueKeys = [];
const seen = new Set();
for (const [k, p] of Object.entries(local)) {
  try {
    const h = await faceHash(p);
    if (seen.has(h)) {
      console.log("drop duplicate source", k, "matches earlier");
      delete local[k];
      continue;
    }
    seen.add(h);
    uniqueKeys.push(k);
  } catch (e) {
    console.warn("bad source", k, e.message);
    delete local[k];
  }
}
console.log("unique sources:", uniqueKeys.length, uniqueKeys.join(", "));

function take(key) {
  const p = local[key];
  if (!p) throw new Error("missing unique source: " + key);
  delete local[key];
  return p;
}

function takeFirst(...keys) {
  for (const key of keys) {
    if (local[key]) return take(key);
  }
  throw new Error("missing unique sources: " + keys.join(", "));
}

function takeAny(prefix = "w_") {
  const key = Object.keys(local).find((k) => k.startsWith(prefix));
  if (!key) throw new Error("no remaining source for " + prefix);
  return take(key);
}

// ——— ONE SOURCE → ONE LIVE DESTINATION ———
// Hero layers (smile face ONLY on layer 3 — nowhere else)
await makeLayer(
  takeFirst("collab_team", "collab_cowork", "collab_board"),
  path.join(HERO, "hero_layer_1.png"),
  "How to write a resume",
  "Clear achievements, stronger keywords, better first impression",
  "centre"
);
await makeLayer(
  takeFirst("w_laptop", "w_office", "w_meeting"),
  path.join(HERO, "hero_layer_2.png"),
  "How to write a cover letter",
  "Tell your story so employers and clients trust your proof",
  "attention"
);
await makeLayer(
  take("w_smile"),
  path.join(HERO, "hero_layer_3.png"),
  "Mock interviews that stick",
  "Live practice with feedback until your answers land",
  "north"
);
await makeLayer(
  takeFirst("collab_code", "collab_review", "collab_board"),
  path.join(HERO, "hero_layer_4.png"),
  "Portfolio that proves skill",
  "Package projects so employers and clients trust your work",
  "centre"
);

// Services — each different, none reuse hero faces
await coverPng(takeFirst("collab_cowork", "collab_board", "collab_review"), "public/assets/images/services/mentor.png");
await coverPng(takeFirst("collab_board", "collab_review"), "public/assets/images/services/interview.png");
await coverPng(takeFirst("collab_review", "collab_board"), "public/assets/images/services/jobs.png");
await coverPng(takeFirst("w_meeting", "w_office", "w_blazer"), "public/assets/images/services/skills.png");

// Career-prep source files — must also be unique (were copies of smile)
await coverPng(takeFirst("w_blazer", "w_pro", "w_softlocal"), "public/assets/images/career-prep/write-cover-letter.png");
await coverPng(takeFirst("w_glasses", "w_curl", "w_window", "w_soft"), "public/assets/images/career-prep/interview-questions.png");

// Meet Our People female slots — FIVE different women (was same smile x5)
const peopleWomen = ["p3", "p5", "p7", "p9", "p12"];
for (const name of peopleWomen) {
  await peopleJpg(takeAny("w_"), path.join("public/assets/images/people", name + ".jpg"));
}

// p1 was asian man probe — keep unique man if still available
if (local.m_probe) {
  await peopleJpg(take("m_probe"), "public/assets/images/people/p1.jpg");
}

// ——— AUDIT live homepage images for face collisions ———
const live = [];
for (let i = 1; i <= 4; i++) live.push(path.join(HERO, `hero_layer_${i}.png`));
for (let i = 1; i <= 15; i++) live.push(`public/assets/images/people/p${i}.jpg`);
for (const s of ["mentor", "interview", "jobs", "skills"]) {
  live.push(`public/assets/images/services/${s}.png`);
}
// Keep write-resume unique vs hero_layer_1 (was same teamCollab copy)
if (Object.keys(local).some((k) => k.startsWith("collab_") || k.startsWith("w_"))) {
  const src = Object.keys(local).find((k) => k.startsWith("collab_"))
    ? takeAny("collab_")
    : takeAny("w_");
  await coverPng(src, "public/assets/images/career-prep/write-resume.png");
}

live.push(
  "public/assets/images/career-prep/write-cover-letter.png",
  "public/assets/images/career-prep/interview-questions.png",
  "public/assets/images/career-prep/write-resume.png"
);

const byHash = new Map();
for (const f of live) {
  if (!fs.existsSync(f)) continue;
  const h = await faceHash(f);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(f);
}
const collisions = [...byHash.entries()].filter(([, arr]) => arr.length > 1);
if (collisions.length) {
  console.error("\nUNIQUE-CHECK FAILED:");
  for (const [h, arr] of collisions) {
    console.error(h.slice(0, 10), arr.map((x) => path.basename(x)).join(" | "));
  }
  process.exitCode = 1;
} else {
  console.log("\nUNIQUE-CHECK OK —", byHash.size, "distinct faces/scenes among live assets");
}

// Cache bust
let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/(\/assets\/images\/people\/p\d+\.jpg)(?:\?v=\d+)?/g, `$1?v=${V}`);
html = html.replace(
  /src="\/_astro\/hoisted\.Dadqo-kW\.js(?:\?v=\d+)?"/,
  `src="/_astro/hoisted.Dadqo-kW.js?v=${V}"`
);
fs.writeFileSync("public/index.html", html);
console.log("done v=" + V);
