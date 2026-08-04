/**
 * Fix bento text layout + transparent logo (no black plate).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const BACKUP = "public/assets/images/_backup-devin-mockups";
const OUT = "public/assets/images";
const LOGO_SRC = "public/assets/images/elitechnexus-logo.png";
const LOGO_OUT = "public/assets/images/elitechnexus-logo-transparent.png";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Knock out black/near-black → true transparency, then tight-crop */
async function fixLogo() {
  const src = fs.existsSync(LOGO_SRC) ? LOGO_SRC : LOGO_OUT;
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    // treat dark plate as transparent; keep cyan/blue letters
    const isDark = r < 45 && g < 45 && b < 45;
    const isCyanBlue = b > 80 && (g > 60 || b > r + 30);
    if (isDark && !isCyanBlue) {
      data[i + 3] = 0;
    }
  }

  let img = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });

  // trim empty edges
  const trimmed = await img.trim({ threshold: 10 }).png().toBuffer();
  await fs.promises.writeFile(LOGO_OUT, trimmed);

  // also write favicon-sized copies without black plate
  const meta = await sharp(trimmed).metadata();
  console.log("logo fixed", meta.width, "x", meta.height);
}

/**
 * Restore original Devin bento art, then paint clean Elitechnexus text
 * into the known text regions so layout matches the original composition.
 */
async function fixBento01() {
  const w = 1288,
    h = 722;
  const base = await sharp(path.join(BACKUP, "bento01.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  // Cover only the "Would you like Devin..." line (below Add knowledge)
  const overlay = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="148" y="108" width="980" height="48" fill="#152a3f"/>
  <text x="155" y="140"
    font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="28" font-weight="400" fill="#b8c9da">${esc(
      "Would you like Elitechnexus to remember this?"
    )}</text>
</svg>`);

  const out = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento01.png"), out);
  console.log("bento01 restored+patched");
}

async function fixBentoMobile01() {
  const w = 612,
    h = 590;
  const base = await sharp(path.join(BACKUP, "bento-mobile01.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="96" y="62" width="480" height="55" fill="#152a3f"/>
  <text x="104" y="86"
    font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="18" fill="#b8c9da">${esc("Would you like Elitechnexus")}</text>
  <text x="104" y="108"
    font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="18" fill="#b8c9da">${esc("to remember this?")}</text>
</svg>`);

  const out = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento-mobile01.png"), out);
  console.log("bento-mobile01 restored+patched");
}

async function fixBento02() {
  // Original phone composition — keep structure, replace Devin with fitted Elitechnexus
  const w = 638,
    h = 892;
  const base = await sharp(path.join(BACKUP, "bento02.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  // Cover greeting + placeholder regions (match original text blocks)
  const overlay = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1b2e"/>
      <stop offset="100%" stop-color="#0c2a38"/>
    </linearGradient>
  </defs>
  <!-- cover original greeting block tightly -->
  <rect x="36" y="168" width="560" height="200" fill="url(#g)"/>
  <!-- cover placeholder -->
  <rect x="52" y="718" width="520" height="50" fill="#0a1520"/>

  <text x="48" y="210" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="32" font-weight="600" fill="#ffffff">${esc("Hey there! I'm")}</text>
  <text x="48" y="258" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="32" font-weight="700" fill="#5eead4">${esc("Elitechnexus")}</text>
  <text x="48" y="306" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="30" font-weight="600" fill="#ffffff">${esc(
      "and I'm a software engineer."
    )}</text>
  <text x="48" y="350" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="16" font-weight="400" fill="#8fa3b8">${esc(
      "Enter a coding task below to get started."
    )}</text>

  <text x="64" y="750" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="16" fill="#6b8298">${esc("Give Elitechnexus a task...")}</text>
</svg>`);

  const out = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento02.png"), out);
  console.log("bento02 restored+patched");
}

async function fixBentoMobile02() {
  const w = 554,
    h = 540;
  const base = await sharp(path.join(BACKUP, "bento-mobile02.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1b2e"/>
      <stop offset="100%" stop-color="#0c2a38"/>
    </linearGradient>
  </defs>
  <rect x="28" y="100" width="500" height="180" fill="url(#g)"/>
  <rect x="40" y="420" width="460" height="40" fill="#0a1520"/>

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
  <text x="52" y="446" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="14" fill="#6b8298">${esc("Give Elitechnexus a task...")}</text>
</svg>`);

  const out = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento-mobile02.png"), out);
  console.log("bento-mobile02 restored+patched");
}

async function fixBento03() {
  const w = 1288,
    h = 628;
  const base = await sharp(path.join(BACKUP, "bento03.png"))
    .resize(w, h)
    .png()
    .toBuffer();
  const logo = await sharp(LOGO_OUT)
    .resize(34, 34, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="48" y="30" width="420" height="48" fill="#12263a"/>
  <rect x="52" y="98" width="40" height="40" rx="6" fill="#163047"/>
  <text x="58" y="62" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="30" font-weight="600" fill="#fff">${esc(
      "Elitechnexus Workspace"
    )}</text>
</svg>`);

  const out = await sharp(base)
    .composite([
      { input: overlay, top: 0, left: 0 },
      { input: logo, top: 101, left: 55 },
    ])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento03.png"), out);
  console.log("bento03 restored+patched");
}

async function fixBentoMobile03() {
  const w = 610,
    h = 494;
  const base = await sharp(path.join(BACKUP, "bento-mobile03.png"))
    .resize(w, h)
    .png()
    .toBuffer();

  const overlay = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="28" y="18" width="380" height="40" fill="#12263a"/>
  <rect x="90" y="82" width="340" height="42" rx="8" fill="#6ee7b7"/>
  <text x="40" y="46" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="22" font-weight="600" fill="#fff">${esc(
      "Elitechnexus Workspace"
    )}</text>
  <text x="108" y="110" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="16" font-weight="700" fill="#0b1a2e">${esc(
      "Use Elitechnexus Machine"
    )}</text>
</svg>`);

  const out = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento-mobile03.png"), out);
  console.log("bento-mobile03 restored+patched");
}

async function fixHover() {
  const w = 1288,
    h = 628;
  const base = await sharp(path.join(BACKUP, "bento-hover03.png"))
    .resize(w, h)
    .png()
    .toBuffer();
  const overlay = Buffer.from(`<?xml version="1.0"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="390" y="175" width="500" height="58" rx="10" fill="#6ee7b7"/>
  <text x="430" y="212" font-family="Segoe UI, Helvetica, Arial, sans-serif"
    font-size="26" font-weight="700" fill="#0b1a2e">${esc(
      "Use Elitechnexus Machine"
    )}</text>
</svg>`);
  const out = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(OUT, "bento-hover03.png"), out);
  console.log("bento-hover03 restored+patched");
}

/** CSS overrides: fix item-01 text stack + constrain item-02 copy away from phone */
const LAYOUT_CSS = `<style id="elitechnexus-bento-layout-css">
/* Item 01: keep title + subtitle together at top (like original Devin card) */
@media (min-width: 940px) {
  #home-bento__item-01 .home-bento__item-text {
    position: absolute !important;
    top: 8% !important;
    left: 10% !important;
    right: 18% !important;
    z-index: 3 !important;
    padding: 0 !important;
  }
  #home-bento__item-01 .home-bento__item-title {
    position: static !important;
    top: auto !important;
    left: auto !important;
  }
  #home-bento__item-01 .home-bento__item-subtitle {
    margin-top: 0.85em !important;
    max-width: 34ch !important;
    line-height: 1.45 !important;
  }
}

/* Item 02: keep copy on the left; don't spill over the phone art */
@media (min-width: 940px) {
  #home-bento__item-02 .home-bento__item-text {
    position: absolute !important;
    top: 32% !important;
    left: 10% !important;
    width: 42% !important;
    max-width: 42% !important;
    z-index: 3 !important;
    padding: 0 !important;
  }
  #home-bento__item-02 .home-bento__item-subtitle {
    margin-top: 0.85em !important;
    line-height: 1.45 !important;
  }
  #home-bento__item-02 .home-bento__item-image-main-wrapper {
    width: 38% !important;
    z-index: 1 !important;
  }
  #home-bento__item-02 .home-bento__item-image-main-wrapper img {
    object-fit: contain !important;
    object-position: right bottom !important;
  }
}

/* Item 03: keep text block clean at top-left */
@media (min-width: 940px) {
  #home-bento__item-03 .home-bento__item-text {
    max-width: 48% !important;
    z-index: 3 !important;
  }
  #home-bento__item-03 .home-bento__item-subtitle {
    line-height: 1.45 !important;
  }
}

/* Logo: never show a black plate behind EL */
#site-header__logo .o-icon.elitechnexus-logo-wrap,
#site-header__logo .elitechnexus-logo,
.o-icon.elitechnexus-logo-wrap,
.elitechnexus-logo {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}
#site-header__logo .elitechnexus-logo {
  mix-blend-mode: normal !important;
}
</style>`;

function patchHtml() {
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

  let n = 0;
  for (const f of walk("public")) {
    let h = fs.readFileSync(f, "utf8");
    const before = h;

    // bump logo + bento cache
    h = h.replace(
      /elitechnexus-logo-transparent\.png\?v=\d+/g,
      "elitechnexus-logo-transparent.png?v=12"
    );
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
        `$1?v=12`
      );
    }

    // inject / replace layout css
    if (h.includes("elitechnexus-bento-layout-css")) {
      h = h.replace(
        /<style id="elitechnexus-bento-layout-css">[\s\S]*?<\/style>/,
        LAYOUT_CSS
      );
    } else if (h.includes("</head>")) {
      h = h.replace("</head>", LAYOUT_CSS + "</head>");
    }

    // also force transparent in logo css block
    h = h.replace(
      /#site-header__logo \.o-icon\.elitechnexus-logo-wrap\{[\s\S]*?\}/,
      `#site-header__logo .o-icon.elitechnexus-logo-wrap{
  width:calc(var(--icon-size, 2rem) * 1.85)!important;
  height:calc(var(--icon-size, 2rem) * 1.15)!important;
  background:transparent!important;
}`
    );

    if (h !== before) {
      fs.writeFileSync(f, h);
      n++;
      console.log("patched html", f);
    }
  }
  console.log("html files", n);
}

await fixLogo();
await fixBento01();
await fixBentoMobile01();
await fixBento02();
await fixBentoMobile02();
await fixBento03();
await fixBentoMobile03();
await fixHover();
patchHtml();
