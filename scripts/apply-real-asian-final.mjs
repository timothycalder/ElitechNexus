/**
 * Final apply: use only verified real photos (Asian woman smile + real office collabs).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const V = 85;

const asianWoman = "public/assets/images/career-prep/real-v2/asianWomanSmile.jpg";
const asianMan = "public/assets/images/career-prep/probe/a.jpg";
const team = "public/assets/images/career-prep/real-v2/teamCollab.jpg";
const coding = "public/assets/images/career-prep/final-pick/col3.jpg";
const cowork = "public/assets/images/career-prep/real-v2/coworking.jpg";

for (const p of [asianWoman, asianMan, team, coding]) {
  if (!fs.existsSync(p)) throw new Error("missing " + p);
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function makeLayer(src, dest, title, subtitle, position = "attention") {
  const W = 1052,
    H = 1024;
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
  console.log("wrote", path.basename(dest));
}

async function serviceCover(src, dest, position = "attention") {
  await sharp(src).resize(1200, 1200, { fit: "cover", position }).png().toFile(dest);
  console.log("service", path.basename(dest));
}

// Hero stacked cards — realistic photos; Asian woman on face cards
await makeLayer(
  team,
  path.join(HERO, "hero_layer_1.png"),
  "How to write a resume",
  "Clear achievements, stronger keywords, better first impression",
  "centre"
);
await makeLayer(
  asianWoman,
  path.join(HERO, "hero_layer_2.png"),
  "How to write a cover letter",
  "Tell your story so employers and clients trust your proof",
  "attention"
);
await makeLayer(
  asianWoman,
  path.join(HERO, "hero_layer_3.png"),
  "Mock interviews that stick",
  "Live practice with feedback until your answers land",
  "north"
);
await makeLayer(
  coding,
  path.join(HERO, "hero_layer_4.png"),
  "Portfolio that proves skill",
  "Package projects so employers and clients trust your work",
  "centre"
);

// Services that previously showed AI Caucasian office scenes
await serviceCover(team, "public/assets/images/services/interview.png", "centre");
await serviceCover(coding, "public/assets/images/services/jobs.png", "centre");
await serviceCover(cowork, "public/assets/images/services/mentor.png", "centre");
await serviceCover(asianWoman, "public/assets/images/services/skills.png", "attention");

// Career-prep sources
await sharp(team).png().toFile("public/assets/images/career-prep/write-resume.png");
await sharp(asianWoman).png().toFile("public/assets/images/career-prep/write-cover-letter.png");
await sharp(asianWoman).png().toFile("public/assets/images/career-prep/interview-questions.png");

// Meet Our People — female slots get verified Asian woman; keep variety with Asian man
const people = {
  p1: asianMan,
  p3: asianWoman,
  p5: asianWoman,
  p7: asianWoman,
  p9: asianWoman,
  p12: asianWoman,
};
for (const [name, src] of Object.entries(people)) {
  const dest = path.join("public/assets/images/people", name + ".jpg");
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90 })
    .toFile(dest);
  console.log("people", name);
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
html = html.replace(/(\/assets\/images\/people\/p\d+\.jpg)\?v=\d+/g, `$1?v=${V}`);
html = html.replace(
  /src="\/_astro\/hoisted\.Dadqo-kW\.js\?v=\d+"/,
  `src="/_astro/hoisted.Dadqo-kW.js?v=${V}"`
);
fs.writeFileSync("public/index.html", html);

for (const n of [1, 2, 3]) {
  await sharp(path.join(HERO, `hero_layer_${n}.png`))
    .resize(380)
    .jpeg({ quality: 78 })
    .toFile(path.join(HERO, `_final_l${n}.jpg`));
}
console.log("done v=", V);
