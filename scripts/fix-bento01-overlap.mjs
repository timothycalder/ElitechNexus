/**

 * Rebuild bento01 so the HTML "Use when / When working in the backend repo"

 * overlay sits in empty space ABOVE the knowledge bullets (no overlap).

 */

import fs from "fs";

import path from "path";

import sharp from "sharp";



const OUT = "public/assets/images";

const BACKUP = "public/assets/images/_backup-devin-mockups";

const CACHE = 23;



function esc(s) {

  return String(s)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;");

}



async function writeSvgPng(svg, outPath, w, h) {

  await sharp(Buffer.from(svg), { density: 144 })

    .resize(w, h)

    .png()

    .toFile(outPath);

  console.log("wrote", outPath);

}



// Desktop: leave top of knowledge card empty for #home-bento__item-01-visual-wrapper

await writeSvgPng(

  `<?xml version="1.0" encoding="UTF-8"?>

<svg width="1288" height="722" xmlns="http://www.w3.org/2000/svg">

  <defs>

    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">

      <stop offset="0%" stop-color="#1c2a44"/>

      <stop offset="100%" stop-color="#243a52"/>

    </linearGradient>

  </defs>

  <rect width="1288" height="722" rx="28" fill="url(#bg)"/>



  <!-- lightbulb tile -->

  <rect x="64" y="56" width="72" height="72" rx="16" fill="#243552"/>

  <path d="M100 78c-11 0-20 9-20 20 0 8 4 14 10 17v8h20v-8c6-3 10-9 10-17 0-11-9-20-20-20z"

    fill="none" stroke="#5eead4" stroke-width="3"/>

  <line x1="90" y1="131" x2="110" y2="131" stroke="#5eead4" stroke-width="3" stroke-linecap="round"/>



  <text x="160" y="92" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"

    font-size="42" font-weight="600" fill="#F2F6FB">${esc("Add knowledge")}</text>

  <text x="160" y="132" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"

    font-size="26" font-weight="400" fill="#A8BBCC">${esc(

      "Would you like Elitechnexus to remember this?"

    )}</text>



  <!-- Knowledge panel: TOP ~90px reserved for HTML "Use when" + textbox overlay -->

  <rect x="48" y="200" width="1192" height="470" rx="28" fill="#152338" opacity="0.92"/>



  <!-- spacer zone (no text) — overlay lands here -->

  <!-- bullets start BELOW the overlay row -->

  <g font-family="Consolas, 'Courier New', monospace" font-size="28" fill="#5EEAD4">

    <text x="100" y="340">${esc("- The repo is cloned in ~/my_project_backend")}</text>

    <text x="100" y="410">${esc("- The main branch name is 'master'")}</text>

    <text x="100" y="480">${esc("- Run poetry install before you start")}</text>

    <text x="100" y="550">${esc("- Run ./lint.sh to check lint before making commits")}</text>

  </g>

</svg>`,

  path.join(OUT, "bento01.png"),

  1288,

  722

);



// Mobile: input is Baked into image; no HTML overlay on mobile wrapper.

// Keep single clean input row ABOVE the list (no duplicate).

await writeSvgPng(

  `<?xml version="1.0" encoding="UTF-8"?>

<svg width="612" height="590" xmlns="http://www.w3.org/2000/svg">

  <defs>

    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">

      <stop offset="0%" stop-color="#1c2a44"/>

      <stop offset="100%" stop-color="#243a52"/>

    </linearGradient>

  </defs>

  <rect width="612" height="590" rx="24" fill="url(#bg)"/>



  <rect x="36" y="32" width="52" height="52" rx="12" fill="#243552"/>

  <path d="M62 46c-7 0-12 5-12 12 0 5 3 8 6 10v6h12v-6c3-2 6-5 6-10 0-7-5-12-12-12z"

    fill="none" stroke="#5eead4" stroke-width="2.5"/>

  <line x1="56" y1="78" x2="68" y2="78" stroke="#5eead4" stroke-width="2.5" stroke-linecap="round"/>



  <text x="104" y="54" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"

    font-size="26" font-weight="600" fill="#F2F6FB">${esc("Add knowledge")}</text>

  <text x="104" y="82" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"

    font-size="16" fill="#A8BBCC">${esc("Would you like Elitechnexus")}</text>

  <text x="104" y="104" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"

    font-size="16" fill="#A8BBCC">${esc("to remember this?")}</text>



  <!-- Single input row (not duplicated with list) -->

  <text x="36" y="148" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"

    font-size="14" fill="#6583A4">${esc("Use when")}</text>

  <rect x="110" y="128" width="340" height="40" rx="10" fill="#32486C"/>

  <text x="124" y="154" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"

    font-size="14" fill="#D3E3F6">${esc("When working in the backend repo")}</text>

  <rect x="462" y="128" width="40" height="40" rx="10" fill="#243552"/>

  <text x="474" y="155" font-size="20" fill="#fff">×</text>

  <rect x="512" y="128" width="40" height="40" rx="10" fill="#5EEAD4"/>

  <text x="524" y="155" font-size="20" fill="#0B1A2E">✓</text>



  <rect x="36" y="190" width="540" height="360" rx="20" fill="#152338" opacity="0.92"/>

  <g font-family="Consolas, monospace" font-size="15" fill="#5EEAD4">

    <text x="56" y="240">${esc("- The repo is cloned in ~/my_project_backend")}</text>

    <text x="56" y="290">${esc("- The main branch name is 'master'")}</text>

    <text x="56" y="340">${esc("- Run poetry install before you start")}</text>

    <text x="56" y="390">${esc("- Run ./lint.sh to check lint before commits")}</text>

  </g>

</svg>`,

  path.join(OUT, "bento-mobile01.png"),

  612,

  590

);



// Also nudge desktop overlay slightly higher via CSS so it stays in the spacer band

function walk(d, a = []) {

  for (const n of fs.readdirSync(d)) {

    if (n === "visual-3d") continue;

    const f = path.join(d, n);

    if (fs.statSync(f).isDirectory()) walk(f, a);

    else if (n.endsWith(".html")) a.push(f);

  }

  return a;

}



const CSS_ID = "elitechnexus-bento01-overlay-css";

const CSS = `<style id="${CSS_ID}">

/* Keep "Use when" + textbox in the empty band above knowledge bullets */

@media (min-width: 940px) {

  #home-bento__item-01-visual-wrapper {

    top: 5.4vw !important;

    z-index: 5 !important;

  }

}

@media (min-width: 940px) and (max-width: 1439.98px) {

  #home-bento__item-01-visual-wrapper {

    top: 6.8vw !important;

  }

}

</style>`;



for (const f of walk("public")) {

  let h = fs.readFileSync(f, "utf8");

  const before = h;

  h = h.replace(

    new RegExp(`(/assets/images/bento01\\.png)(?:\\?v=\\d+)?`, "g"),

    `$1?v=${CACHE}`

  );

  h = h.replace(

    new RegExp(`(/assets/images/bento-mobile01\\.png)(?:\\?v=\\d+)?`, "g"),

    `$1?v=${CACHE}`

  );

  if (h.includes(`id="${CSS_ID}"`)) {

    h = h.replace(

      new RegExp(`<style id="${CSS_ID}">[\\s\\S]*?</style>`),

      CSS

    );

  } else if (h.includes("</head>")) {

    h = h.replace("</head>", `${CSS}</head>`);

  }

  if (h !== before) {

    fs.writeFileSync(f, h);

    console.log("updated", f);

  }

}


