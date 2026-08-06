/**
 * Site-wide Elitechnexus branded cursors (PNG) — visible over dark photos.
 * Removes grab/grabbing (system grab vanishes on people images).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.resolve("public");
const cursorDir = path.join(root, "assets", "cursors");
fs.mkdirSync(cursorDir, { recursive: true });

async function pngFromSvg(name, svg, size = 32) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(cursorDir, name));
}

const defaultSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M4 2 L4 26 L11.2 18.8 L16.8 30 L20.2 28.4 L14.4 16.8 L24 16.8 Z"
    fill="#0b1624" stroke="#6edcc8" stroke-width="1.75" stroke-linejoin="round"/>
  <path d="M5.4 4.4 L5.4 22.2 L10.6 17 L15.8 26.8 L17.8 25.9 L12.5 15.8 L21 15.8 Z"
    fill="#9fd9ff" opacity="0.4"/>
</svg>`;

const pointerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M9 2 L9 21 L12.4 17.5 L16 27 L19.4 25.7 L15.7 16 L21 16 Z"
    fill="#0b1624" stroke="#6edcc8" stroke-width="1.75" stroke-linejoin="round"/>
  <circle cx="23" cy="9" r="4.4" fill="rgba(11,22,36,0.85)" stroke="#4aa8ff" stroke-width="1.5"/>
  <circle cx="23" cy="9" r="1.7" fill="#6edcc8"/>
</svg>`;

const dragSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12" fill="#0b1624" stroke="#6edcc8" stroke-width="1.75"/>
  <path d="M7.5 16 H24.5" stroke="#9fd9ff" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M10 12.8 L6.8 16 L10 19.2 M22 12.8 L25.2 16 L22 19.2"
    fill="none" stroke="#6edcc8" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const draggingSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12.5" fill="#102033" stroke="#6edcc8" stroke-width="1.9"/>
  <circle cx="16" cy="16" r="4.2" fill="#6edcc8"/>
  <path d="M6.5 16 H11.5 M20.5 16 H25.5" stroke="#9fd9ff" stroke-width="2.1" stroke-linecap="round"/>
</svg>`;

await pngFromSvg("elite-default.png", defaultSvg);
await pngFromSvg("elite-pointer.png", pointerSvg);
await pngFromSvg("elite-drag.png", dragSvg);
await pngFromSvg("elite-dragging.png", draggingSvg);
console.log("cursors refreshed");

const css = `<style id="elitechnexus-cursor-css">
/* Elitechnexus branded cursors (mint/navy) — stay visible on dark photos */
@media (pointer: fine) {
  html, body, #ui, #viewport-wrapper, #pages-container, .page, canvas {
    cursor: url("/assets/cursors/elite-default.png") 4 2, auto !important;
  }
  a, button, [role="button"], input[type="submit"], input[type="button"],
  label[for], .elite-people__cta, #site-header__button-cta,
  #site-header__button-contact, #site-header__button-transparent,
  #site-menu a, .site-header__nav-item a, #site-header__button-menu,
  .elite-people__btn, .elite-people__btn * {
    cursor: url("/assets/cursors/elite-pointer.png") 6 2, pointer !important;
  }
  .elite-people__track,
  .elite-people__track .elite-people__card,
  .elite-people__track .elite-people__card-copy,
  .elite-people__track .elite-people__card-photo,
  .elite-people__track img {
    cursor: url("/assets/cursors/elite-drag.png") 16 16, grab !important;
  }
  .elite-people__track.is-dragging,
  .elite-people__track.is-dragging * {
    cursor: url("/assets/cursors/elite-dragging.png") 16 16, grabbing !important;
  }
  .elite-people__track .elite-people__btn,
  .elite-people__track .elite-people__btn * {
    cursor: url("/assets/cursors/elite-pointer.png") 6 2, pointer !important;
  }
  input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),
  textarea, select, [contenteditable="true"] {
    cursor: text !important;
  }
}
</style>`;

function patchFile(filePath, isHome) {
  let h = fs.readFileSync(filePath, "utf8");

  if (isHome) {
    h = h.replace(/cursor:\s*grab;\s*user-select:none;/, "user-select:none;");
    h = h.replace(
      /\.elite-people__track\.is-dragging\{\s*cursor:\s*grabbing;\s*/g,
      ".elite-people__track.is-dragging{\n  "
    );
    // Remove leftover button cursor:pointer conflict is overridden by !important above
    h = h.replace(
      /src="\/_astro\/hoisted\.Dadqo-kW\.js\?v=\d+"/,
      'src="/_astro/hoisted.Dadqo-kW.js?v=78"'
    );
  }

  if (h.includes('id="elitechnexus-cursor-css"')) {
    h = h.replace(/<style id="elitechnexus-cursor-css">[\s\S]*?<\/style>/, css);
  } else if (h.includes("</head>")) {
    h = h.replace("</head>", css + "</head>");
  }

  // Remove previous ring JS if present
  h = h.replace(/<script id="elitechnexus-cursor-js">[\s\S]*?<\/script>/, "");
  h = h.replace(/<style id="elitechnexus-cursor-ring-css">[\s\S]*?<\/style>/g, "");

  fs.writeFileSync(filePath, h);
}

const home = path.join(root, "index.html");
patchFile(home, true);
console.log("patched index.html");

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "_astro" || ent.name === "assets" || ent.name === "visual-3d") continue;
      walk(p);
    } else if (ent.name === "index.html" && p !== home) {
      patchFile(p, false);
      console.log("cursor ->", path.relative(root, p));
    }
  }
}
walk(root);
console.log("done");
