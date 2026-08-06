/**
 * Replace AI/stock hero + services people photos with verified real photos
 * featuring Asian professional women (Pexels + good Unsplash).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const SRC = "public/assets/images/career-prep/real-v2";
const SERVICES = "public/assets/images/services";
const V = 84;

fs.mkdirSync(SRC, { recursive: true });

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
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
  // Reject tiny / html error pages
  if (buf.length < 20000) throw new Error(`too small ${buf.length} ${url}`);
  fs.writeFileSync(dest, buf);
  const m = await sharp(dest).metadata();
  console.log("dl", path.basename(dest), m.width + "x" + m.height, (buf.length / 1024).toFixed(0) + "kb");
  return dest;
}

async function makeLayer(src, dest, title, subtitle, position = "attention") {
  const W = 1052;
  const H = 1024;
  const photo = await sharp(src)
    .resize(W, H, { fit: "cover", position, kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 0.97, saturation: 1.01 })
    .sharpen({ sigma: 0.55 })
    .png()
    .toBuffer();

  const badgeY = H - 130;
  const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="40%" stop-color="#071018" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${badgeY}" width="${Math.min(W - 72, 700)}" height="86" rx="16"
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
  console.log("layer", path.basename(dest));
}

async function coverService(src, dest, position = "attention") {
  // Keep roughly square-ish service card look
  const meta = await sharp(src).metadata();
  const side = 1200;
  await sharp(src)
    .resize(side, side, { fit: "cover", position })
    .jpeg({ quality: 88 })
    .toFile(dest.replace(/\.png$/i, ".jpg.tmp"));
  // write as png for existing refs
  await sharp(dest.replace(/\.png$/i, ".jpg.tmp")).png().toFile(dest);
  fs.unlinkSync(dest.replace(/\.png$/i, ".jpg.tmp"));
  console.log("service", path.basename(dest));
}

// Verified real photos — Asian women + realistic office (Pexels + working Unsplash)
const shots = {
  // Beautiful Asian woman portrait (clear face) — mock interview hero
  asianWomanPortrait:
    "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=1600",
  // Asian woman working at laptop — cover letter / resume vibe
  asianWomanLaptop:
    "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1600",
  // Asian woman in meeting / discussion
  asianWomanMeeting:
    "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1600",
  // Team collaboration around table (real office)
  teamCollab:
    "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600",
  // Whiteboard / coaching style meeting
  whiteboard:
    "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1600",
  // Two professionals reviewing work (tablet/docs energy)
  reviewWork:
    "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600",
  // Confirmed good Unsplash Asian woman (probe b)
  asianWomanSmile:
    "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=85",
  // Diverse team coworking
  coworking:
    "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

const local = {};
for (const [k, url] of Object.entries(shots)) {
  const dest = path.join(SRC, k + ".jpg");
  try {
    await download(url, dest);
    local[k] = dest;
  } catch (e) {
    console.warn("skip", k, e.message);
  }
}

if (!local.asianWomanSmile && !local.asianWomanPortrait) {
  throw new Error("No Asian woman portrait downloaded");
}

const portrait = local.asianWomanPortrait || local.asianWomanSmile;
const laptop = local.asianWomanLaptop || local.asianWomanMeeting || portrait;
const meeting = local.asianWomanMeeting || local.reviewWork || laptop;
const collab = local.teamCollab || local.coworking || local.reviewWork || meeting;
const board = local.whiteboard || collab;
const review = local.reviewWork || meeting;

// Hero stacked cards
await makeLayer(
  review,
  path.join(HERO, "hero_layer_1.png"),
  "How to write a resume",
  "Clear achievements, stronger keywords, better first impression",
  "centre"
);
await makeLayer(
  laptop,
  path.join(HERO, "hero_layer_2.png"),
  "How to write a cover letter",
  "Tell your story so employers and clients trust your proof",
  "attention"
);
await makeLayer(
  portrait,
  path.join(HERO, "hero_layer_3.png"),
  "Mock interviews that stick",
  "Live practice with feedback until your answers land",
  "attention"
);
await makeLayer(
  collab,
  path.join(HERO, "hero_layer_4.png"),
  "Portfolio that proves skill",
  "Package projects so employers and clients trust your work",
  "centre"
);

// Services cards that still show AI/stock Caucasian scenes
const serviceMap = [
  ["interview.png", meeting, "attention"],
  ["jobs.png", collab, "centre"],
  ["mentor.png", board, "centre"],
  ["skills.png", laptop, "attention"],
];
for (const [name, src, pos] of serviceMap) {
  const dest = path.join(SERVICES, name);
  if (!fs.existsSync(dest) || !src) continue;
  const bak = dest + ".ai-look.bak";
  if (!fs.existsSync(bak)) fs.copyFileSync(dest, bak);
  await coverService(src, dest, pos);
}

// Refresh career-prep sources
await sharp(review).png().toFile("public/assets/images/career-prep/write-resume.png");
await sharp(laptop).png().toFile("public/assets/images/career-prep/write-cover-letter.png");
await sharp(portrait).png().toFile("public/assets/images/career-prep/interview-questions.png");

// Fix Meet Our People cards that used remapped/wrong Unsplash faces
const PEOPLE = "public/assets/images/people";
const peopleFixes = [
  // p3 was AI-looking (blank watch) — use verified Asian woman smile
  ["p3.jpg", local.asianWomanSmile || portrait],
  // p7 was wrong Caucasian orange-wall — use beautiful Asian portrait
  ["p7.jpg", portrait],
  // p5 if needed
  ["p5.jpg", local.asianWomanMeeting || portrait],
  ["p9.jpg", laptop],
  ["p12.jpg", local.asianWomanSmile || portrait],
];
for (const [name, src] of peopleFixes) {
  if (!src) continue;
  const dest = path.join(PEOPLE, name);
  if (!fs.existsSync(dest)) continue;
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90 })
    .toFile(dest);
  console.log("people", name);
}

// HTML cache bump
let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/(\/assets\/images\/people\/p\d+\.jpg)\?v=\d+/g, `$1?v=${V}`);
html = html.replace(
  /src="\/_astro\/hoisted\.Dadqo-kW\.js\?v=\d+"/,
  `src="/_astro/hoisted.Dadqo-kW.js?v=${V}"`
);
fs.writeFileSync("public/index.html", html);

// Preview thumbs for verification
for (const n of [1, 2, 3]) {
  await sharp(path.join(HERO, `hero_layer_${n}.png`))
    .resize(360)
    .jpeg({ quality: 75 })
    .toFile(path.join(HERO, `_verify_l${n}.jpg`));
}
console.log("done v=", V);
