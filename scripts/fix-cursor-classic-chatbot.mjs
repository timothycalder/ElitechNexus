/**
 * Professional classic arrow cursors (no circle overlay).
 * Chatbot (Jotform) keeps normal system cursor — site cursor never covers it.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.resolve("public");
const cursorDir = path.join(root, "assets", "cursors");
fs.mkdirSync(cursorDir, { recursive: true });

async function pngFromSvg(name, svg, size = 32) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(cursorDir, name));
  console.log("wrote", name);
}

// Classic arrow — white fill, soft dark edge (readable on light + dark UI)
const defaultSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M5 2 L5 24.5 L10.8 18.9 L15.6 29.2 L19.2 27.6 L14.2 16.9 L22.5 16.9 Z"
    fill="#0b1624" opacity="0.22"/>
  <path d="M4 1.2 L4 25.2 L10.6 18.8 L15.8 30 L19.8 28.2 L14.4 16.6 L24 16.6 Z"
    fill="#f4f8fb" stroke="#1c2a38" stroke-width="1.15" stroke-linejoin="round"/>
  <path d="M5.6 3.4 L5.6 21.6 L10.2 17 L14.8 26.8 L17 25.8 L12.3 15.6 L20.6 15.6 Z"
    fill="#ffffff"/>
</svg>`;

// Classic pointer hand — professional, not circular
const pointerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M11 3.5 V14.2 L9.2 12.6 C8.5 12 7.4 12.1 6.9 12.8 C6.4 13.5 6.6 14.5 7.3 15 L13.2 20.2 V27.5 C13.2 28.3 13.9 29 14.7 29 H21.2 C22 29 22.7 28.3 22.7 27.5 V16.8 L24.8 15.2 C25.5 14.7 25.7 13.7 25.2 13 C24.7 12.3 23.7 12.1 23 12.6 L22.7 12.8 V7.2 C22.7 6.4 22 5.7 21.2 5.7 C20.4 5.7 19.7 6.4 19.7 7.2 V12.2 H18.5 V4.8 C18.5 4 17.8 3.3 17 3.3 C16.2 3.3 15.5 4 15.5 4.8 V12.2 H14.3 V3.5 C14.3 2.7 13.6 2 12.8 2 C12 2 11.3 2.7 11.3 3.5"
    fill="#f4f8fb" stroke="#1c2a38" stroke-width="1.1" stroke-linejoin="round"/>
</svg>`;

// Subtle open-hand / move for carousel (still arrow-family, not a ring)
const dragSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M5 2 L5 24.5 L10.8 18.9 L15.6 29.2 L19.2 27.6 L14.2 16.9 L22.5 16.9 Z"
    fill="#0b1624" opacity="0.18"/>
  <path d="M4 1.2 L4 25.2 L10.6 18.8 L15.8 30 L19.8 28.2 L14.4 16.6 L24 16.6 Z"
    fill="#eef6fa" stroke="#1c2a38" stroke-width="1.15" stroke-linejoin="round"/>
  <path d="M8.5 27.5 H23.5 M11 25 L8.5 27.5 L11 30 M21 25 L23.5 27.5 L21 30"
    fill="none" stroke="#2a9d8f" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const draggingSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M4 1.2 L4 25.2 L10.6 18.8 L15.8 30 L19.8 28.2 L14.4 16.6 L24 16.6 Z"
    fill="#dfeaf2" stroke="#1c2a38" stroke-width="1.15" stroke-linejoin="round"/>
  <path d="M7.5 27.5 H24.5" stroke="#2a9d8f" stroke-width="2" stroke-linecap="round"/>
</svg>`;

await pngFromSvg("elite-default.png", defaultSvg);
await pngFromSvg("elite-pointer.png", pointerSvg);
await pngFromSvg("elite-drag.png", dragSvg);
await pngFromSvg("elite-dragging.png", draggingSvg);

const css = `<style id="elitechnexus-cursor-css">
/* Classic professional arrow cursor (no circle overlay) */
@media (pointer: fine) {
  html, body, #ui, #viewport-wrapper, #pages-container, .page, canvas {
    cursor: url("/assets/cursors/elite-default.png") 4 2, auto;
  }
  a, button, [role="button"], input[type="submit"], input[type="button"],
  label[for], .elite-people__cta, #site-header__button-cta,
  #site-header__button-contact, #site-header__button-transparent,
  #site-menu a, .site-header__nav-item a, #site-header__button-menu,
  .elite-people__btn, .elite-people__btn * {
    cursor: url("/assets/cursors/elite-pointer.png") 6 1, pointer;
  }
  .elite-people__track,
  .elite-people__track .elite-people__card,
  .elite-people__track .elite-people__card-copy,
  .elite-people__track .elite-people__card-photo,
  .elite-people__track img {
    cursor: url("/assets/cursors/elite-drag.png") 4 2, grab;
  }
  .elite-people__track.is-dragging,
  .elite-people__track.is-dragging * {
    cursor: url("/assets/cursors/elite-dragging.png") 4 2, grabbing;
  }
  .elite-people__btn,
  .elite-people__btn * {
    cursor: url("/assets/cursors/elite-pointer.png") 6 1, pointer;
  }
  input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),
  textarea, select, [contenteditable="true"] {
    cursor: text;
  }

  /* Chatbot / Jotform: never cover with site cursor — use normal system cursor */
  iframe[src*="jotform"],
  iframe[src*="jotfor.ms"],
  [id*="jotform"],
  [id*="JotForm"],
  [class*="jotform"],
  [class*="JotForm"],
  [id*="agent-"],
  [class*="agent-"],
  [class*="AgentWidget"],
  [class*="jfAgent"],
  jotform-agent,
  #elite-cursor {
    cursor: auto !important;
  }
  iframe[src*="jotform"] *,
  iframe[src*="jotfor.ms"] *,
  [id*="jotform"] *,
  [class*="jotform"] *,
  [id*="agent-"] *,
  [class*="jfAgent"] * {
    cursor: auto !important;
  }
}
/* Hide legacy circle cursor if any leftover node exists */
#elite-cursor { display: none !important; }
</style>`;

const js = `<script id="elitechnexus-cursor-js">
(function () {
  // Remove legacy circle cursor overlay (was covering chatbot)
  document.documentElement.classList.remove("elite-cursor-on");
  var legacy = document.getElementById("elite-cursor");
  if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);

  // When chatbot UI is hovered/focused, force normal cursor on page chrome nearby
  function isChatbotNode(node) {
    if (!node || node === document || node === window) return false;
    if (node.nodeType !== 1) node = node.parentElement;
    if (!node || !node.closest) return false;
    return !!(
      node.closest('iframe[src*="jotform"], iframe[src*="jotfor.ms"], [id*="jotform"], [id*="JotForm"], [class*="jotform"], [class*="JotForm"], [id*="agent-"], [class*="jfAgent"], [class*="AgentWidget"], jotform-agent')
    );
  }

  document.addEventListener("pointerover", function (e) {
    if (isChatbotNode(e.target)) {
      document.documentElement.classList.add("elite-chatbot-active");
    } else {
      document.documentElement.classList.remove("elite-chatbot-active");
    }
  }, true);
})();
</script>`;

// Extra CSS when chatbot active — restore auto cursor site-wide briefly isn't needed;
// selectors above are enough. Keep class hook for safety:
const cssExtra = `
html.elite-chatbot-active,
html.elite-chatbot-active * {
  cursor: auto !important;
}
`;

const cssFull = css.replace("</style>", cssExtra + "</style>");

function patchFile(filePath, isHome) {
  let h = fs.readFileSync(filePath, "utf8");

  if (h.includes('id="elitechnexus-cursor-css"')) {
    h = h.replace(/<style id="elitechnexus-cursor-css">[\s\S]*?<\/style>/, cssFull);
  } else if (h.includes("</head>")) {
    h = h.replace("</head>", cssFull + "</head>");
  }

  if (h.includes('id="elitechnexus-cursor-js"')) {
    h = h.replace(/<script id="elitechnexus-cursor-js">[\s\S]*?<\/script>/, js);
  } else if (h.includes("</body>")) {
    h = h.replace("</body>", js + "</body>");
  }

  h = h.replace(/<style id="elitechnexus-cursor-ring-css">[\s\S]*?<\/style>/g, "");

  if (isHome) {
    h = h.replace(
      /src="\/_astro\/hoisted\.Dadqo-kW\.js\?v=\d+"/,
      'src="/_astro/hoisted.Dadqo-kW.js?v=86"'
    );
  }

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
