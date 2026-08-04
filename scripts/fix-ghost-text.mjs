import fs from "fs";
import path from "path";
import sharp from "sharp";

const BACKUP = "public/assets/images/_backup-devin-mockups";
const OUT = "public/assets/images";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sample(file, x, y) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const i = (Math.floor(y) * info.width + Math.floor(x)) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}

function rgb([r, g, b]) {
  return `rgb(${r},${g},${b})`;
}

async function patchBento01() {
  const src = path.join(BACKUP, "bento01.png");
  const w = 1288,
    h = 722;
  const base = await sharp(src).resize(w, h).png().toBuffer();
  // sample around subtitle area
  const c = await sample(src, 400, 130);
  console.log("bento01 sample", c);

  const svg = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="140" y="100" width="1000" height="60" fill="${rgb(c)}"/>
  <text x="155" y="140"
    font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="28" font-weight="400" fill="#b8c9da">${esc(
      "Would you like Elitechnexus to remember this?"
    )}</text>
</svg>`);

  await sharp(base)
    .composite([{ input: svg }])
    .png()
    .toFile(path.join(OUT, "bento01.png"));
}

async function patchBentoMobile01() {
  const src = path.join(BACKUP, "bento-mobile01.png");
  const w = 612,
    h = 590;
  const base = await sharp(src).resize(w, h).png().toBuffer();
  const c = await sample(src, 250, 85);
  const svg = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="90" y="55" width="500" height="65" fill="${rgb(c)}"/>
  <text x="104" y="86" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="18" fill="#b8c9da">${esc("Would you like Elitechnexus")}</text>
  <text x="104" y="110" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="18" fill="#b8c9da">${esc("to remember this?")}</text>
</svg>`);
  await sharp(base)
    .composite([{ input: svg }])
    .png()
    .toFile(path.join(OUT, "bento-mobile01.png"));
}

async function patchBento02() {
  const src = path.join(BACKUP, "bento02.png");
  const w = 638,
    h = 892;
  const base = await sharp(src).resize(w, h).png().toBuffer();
  const c1 = await sample(src, 200, 220);
  const c2 = await sample(src, 200, 340);
  const c3 = await sample(src, 200, 740);
  console.log("bento02 samples", c1, c2, c3);

  // Cover full greeting zone + subtitle + placeholder so no ghost Devin remains
  const svg = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="160" width="580" height="230" fill="${rgb(c1)}"/>
  <rect x="40" y="700" width="540" height="70" fill="${rgb(c3)}"/>

  <text x="48" y="210" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="32" font-weight="600" fill="#ffffff">${esc("Hey there! I'm")}</text>
  <text x="48" y="258" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="32" font-weight="700" fill="#5eead4">${esc("Elitechnexus")}</text>
  <text x="48" y="306" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="30" font-weight="600" fill="#ffffff">${esc(
      "and I'm a software engineer."
    )}</text>
  <text x="48" y="350" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="16" fill="#8fa3b8">${esc(
      "Enter a coding task below to get started."
    )}</text>

  <text x="64" y="742" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="16" fill="#6b8298">${esc("Give Elitechnexus a task...")}</text>
</svg>`);

  await sharp(base)
    .composite([{ input: svg }])
    .png()
    .toFile(path.join(OUT, "bento02.png"));
}

async function patchBentoMobile02() {
  const src = path.join(BACKUP, "bento-mobile02.png");
  const w = 554,
    h = 540;
  const base = await sharp(src).resize(w, h).png().toBuffer();
  const c1 = await sample(src, 180, 160);
  const c3 = await sample(src, 180, 430);

  const svg = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="24" y="95" width="510" height="200" fill="${rgb(c1)}"/>
  <rect x="32" y="400" width="490" height="60" fill="${rgb(c3)}"/>

  <text x="40" y="140" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="26" font-weight="600" fill="#fff">${esc("Hey there! I'm")}</text>
  <text x="40" y="178" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="26" font-weight="700" fill="#5eead4">${esc("Elitechnexus")}</text>
  <text x="40" y="216" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="24" font-weight="600" fill="#fff">${esc(
      "and I'm a software engineer."
    )}</text>
  <text x="40" y="258" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="14" fill="#8fa3b8">${esc(
      "Enter a coding task below to get started."
    )}</text>
  <text x="52" y="436" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="14" fill="#6b8298">${esc("Give Elitechnexus a task...")}</text>
</svg>`);

  await sharp(base)
    .composite([{ input: svg }])
    .png()
    .toFile(path.join(OUT, "bento-mobile02.png"));
}

/**
 * Rebuild logo from source with aggressive black removal + transparent canvas,
 * then export with no black matte.
 */
async function fixLogoAgain() {
  const candidates = [
    "public/assets/images/elitechnexus-logo.png",
    "public/assets/images/elitechnexus-logo-transparent.png",
  ];
  const src = candidates.find((f) => fs.existsSync(f));
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2],
      a = data[i + 3];
    const lum = (r + g + b) / 3;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    // Keep saturated cyan/blue pixels; drop dark plate
    if (lum < 55 && chroma < 40) {
      data[i + 3] = 0;
    } else if (lum < 30) {
      data[i + 3] = 0;
    } else if (a < 30) {
      data[i + 3] = 0;
    }
  }

  const buf = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 5 })
    .png()
    .toBuffer();

  await fs.promises.writeFile(
    "public/assets/images/elitechnexus-logo-transparent.png",
    buf
  );
  const m = await sharp(buf).metadata();
  console.log("logo", m.width, m.height);
}

await fixLogoAgain();
await patchBento01();
await patchBentoMobile01();
await patchBento02();
await patchBentoMobile02();

// bump cache to v=13
function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  h = h.replace(
    /elitechnexus-logo-transparent\.png\?v=\d+/g,
    "elitechnexus-logo-transparent.png?v=13"
  );
  h = h.replace(/bento(01|02|03|-hover03|-mobile01|-mobile02|-mobile03)\.png\?v=\d+/g, "bento$1.png?v=13");
  // fix regex - do individually
  for (const name of [
    "bento01.png",
    "bento02.png",
    "bento03.png",
    "bento-hover03.png",
    "bento-mobile01.png",
    "bento-mobile02.png",
    "bento-mobile03.png",
  ]) {
    h = h.replace(
      new RegExp(`(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
      `$1?v=13`
    );
  }
  if (h !== before) fs.writeFileSync(f, h);
}
console.log("done");
