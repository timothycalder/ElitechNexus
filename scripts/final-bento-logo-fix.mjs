import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = "public/assets/images";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function write(svg, file, w, h) {
  const buf = await sharp(Buffer.from(svg)).resize(w, h).png().toBuffer();
  await fs.promises.writeFile(file, buf);
  console.log("wrote", file);
}

// Phone mockup — clean, no ghosts, structured type
await write(
  `<?xml version="1.0"?>
<svg width="638" height="892" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#071525"/>
      <stop offset="55%" stop-color="#0a2236"/>
      <stop offset="100%" stop-color="#0e3c4a"/>
    </linearGradient>
  </defs>
  <rect width="638" height="892" fill="url(#bg)"/>
  <circle cx="100" cy="780" r="200" fill="#1a6b78" opacity="0.28"/>

  <text x="28" y="42" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="600" fill="#fff">9:41</text>
  <rect x="270" y="18" width="98" height="28" rx="14" fill="#000"/>
  <rect x="540" y="30" width="22" height="12" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
  <rect x="543" y="33" width="14" height="6" rx="1" fill="#fff"/>

  <text x="48" y="210" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="600" fill="#fff">${esc(
    "Hey there! I'm"
  )}</text>
  <text x="48" y="262" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#5eead4">${esc(
    "Elitechnexus"
  )}</text>
  <text x="48" y="314" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="600" fill="#fff">${esc(
    "and I'm a software engineer."
  )}</text>
  <text x="48" y="368" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#93a9bd">${esc(
    "Enter a coding task below to get started."
  )}</text>

  <rect x="36" y="720" width="566" height="100" rx="20" fill="#0a1624" stroke="#1c3348"/>
  <text x="60" y="778" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#7b92a8">${esc(
    "Give Elitechnexus a task to work on..."
  )}</text>
</svg>`,
  path.join(OUT, "bento02.png"),
  638,
  892
);

await write(
  `<?xml version="1.0"?>
<svg width="554" height="540" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#071525"/>
      <stop offset="100%" stop-color="#0e3c4a"/>
    </linearGradient>
  </defs>
  <rect width="554" height="540" fill="url(#bg)"/>
  <text x="24" y="36" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="600" fill="#fff">9:41</text>
  <rect x="228" y="14" width="90" height="26" rx="13" fill="#000"/>

  <text x="40" y="130" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="600" fill="#fff">${esc(
    "Hey there! I'm"
  )}</text>
  <text x="40" y="172" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#5eead4">${esc(
    "Elitechnexus"
  )}</text>
  <text x="40" y="214" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="600" fill="#fff">${esc(
    "and I'm a software engineer."
  )}</text>
  <text x="40" y="262" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#93a9bd">${esc(
    "Enter a coding task below to get started."
  )}</text>

  <rect x="28" y="410" width="498" height="80" rx="16" fill="#0a1624" stroke="#1c3348"/>
  <text x="48" y="456" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#7b92a8">${esc(
    "Give Elitechnexus a task..."
  )}</text>
</svg>`,
  path.join(OUT, "bento-mobile02.png"),
  554,
  540
);

// Add knowledge — clean, matches original structure
await write(
  `<?xml version="1.0"?>
<svg width="1288" height="722" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c1c30"/>
      <stop offset="100%" stop-color="#123a48"/>
    </linearGradient>
  </defs>
  <rect width="1288" height="722" fill="url(#bg)"/>

  <rect x="64" y="72" width="72" height="72" rx="16" fill="#163247"/>
  <path d="M100 94c-11 0-20 9-20 20 0 8 4 14 10 17v8h20v-8c6-3 10-9 10-17 0-11-9-20-20-20z" fill="none" stroke="#5eead4" stroke-width="3"/>
  <line x1="90" y1="147" x2="110" y2="147" stroke="#5eead4" stroke-width="3" stroke-linecap="round"/>

  <text x="160" y="108" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="600" fill="#fff">${esc(
    "Add knowledge"
  )}</text>
  <text x="160" y="148" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#a8bbcc">${esc(
    "Would you like Elitechnexus to remember this?"
  )}</text>

  <rect x="64" y="220" width="1160" height="420" rx="28" fill="#0d2436" opacity="0.9"/>
  <g font-family="Consolas, 'Courier New', monospace" font-size="30" fill="#5eead4">
    <text x="110" y="300">${esc("- The repo is cloned in ~/my_project_backend")}</text>
    <text x="110" y="370">${esc("- The main branch name is 'master'")}</text>
    <text x="110" y="440">${esc("- Run poetry install before you start")}</text>
    <text x="110" y="510">${esc("- Run ./lint.sh to check lint before making commits")}</text>
  </g>
</svg>`,
  path.join(OUT, "bento01.png"),
  1288,
  722
);

await write(
  `<?xml version="1.0"?>
<svg width="612" height="590" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c1c30"/>
      <stop offset="100%" stop-color="#123a48"/>
    </linearGradient>
  </defs>
  <rect width="612" height="590" fill="url(#bg)"/>
  <rect x="36" y="36" width="52" height="52" rx="12" fill="#163247"/>
  <path d="M62 50c-7 0-12 5-12 12 0 5 3 8 6 10v6h12v-6c3-2 6-5 6-10 0-7-5-12-12-12z" fill="none" stroke="#5eead4" stroke-width="2.5"/>
  <text x="104" y="58" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="600" fill="#fff">${esc(
    "Add knowledge"
  )}</text>
  <text x="104" y="86" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#a8bbcc">${esc(
    "Would you like Elitechnexus"
  )}</text>
  <text x="104" y="108" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#a8bbcc">${esc(
    "to remember this?"
  )}</text>

  <rect x="36" y="140" width="360" height="48" rx="10" fill="#0a1624" stroke="#1c3348"/>
  <text x="52" y="170" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#7b92a8">${esc(
    "When working in the backend repo"
  )}</text>
  <rect x="410" y="140" width="48" height="48" rx="10" fill="#163247"/>
  <text x="424" y="172" font-size="22" fill="#fff">×</text>
  <rect x="470" y="140" width="48" height="48" rx="10" fill="#5eead4"/>
  <text x="484" y="172" font-size="22" fill="#0b1a2e">✓</text>

  <rect x="36" y="220" width="540" height="320" rx="20" fill="#0d2436" opacity="0.92"/>
  <g font-family="Consolas, monospace" font-size="16" fill="#5eead4">
    <text x="60" y="270">${esc("- The repo is cloned in ~/my_project_backend")}</text>
    <text x="60" y="320">${esc("- The main branch name is 'master'")}</text>
    <text x="60" y="370">${esc("- Run poetry install before you start")}</text>
    <text x="60" y="420">${esc("- Run ./lint.sh to check lint before commits")}</text>
  </g>
</svg>`,
  path.join(OUT, "bento-mobile01.png"),
  612,
  590
);

// Point header logo to SVG (true transparency, no black plate)
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

  // img src for logo → svg
  h = h.replace(
    /src="\/assets\/images\/elitechnexus-logo-transparent\.png(?:\?v=\d+)?"/g,
    'src="/assets/images/elitechnexus-logo.svg?v=14"'
  );
  // CSS background-image for menu logo
  h = h.replace(
    /url\('\/assets\/images\/elitechnexus-logo-transparent\.png\?v=\d+'\)/g,
    "url('/assets/images/elitechnexus-logo.svg?v=14')"
  );
  // bento cache
  for (const name of [
    "bento01.png",
    "bento02.png",
    "bento-mobile01.png",
    "bento-mobile02.png",
  ]) {
    h = h.replace(
      new RegExp(`(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
      `$1?v=14`
    );
  }

  // ensure logo wrap has no black fill
  if (!h.includes("elitechnexus-logo-no-black")) {
    const extra = `<style id="elitechnexus-logo-no-black">
#site-header__logo, #site-header__logo .o-icon, #site-header__logo img,
#site-menu__logo {
  background: transparent !important;
  background-color: transparent !important;
}
#site-header__logo img.elitechnexus-logo {
  background: transparent !important;
  filter: none !important;
}
#site-menu__logo {
  background-image: url('/assets/images/elitechnexus-logo.svg?v=14') !important;
  background-color: transparent !important;
}
</style>`;
    h = h.replace("</head>", extra + "</head>");
  }

  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
  }
}
console.log("html updated", n);
