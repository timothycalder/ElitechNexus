/**
 * Replace Devin molecule SVGs in .home-use-cases__card-logo
 * with Elitechnexus EL mark (inherits white fill; square keeps theme color).
 */
import fs from "fs";
import path from "path";

/** Compact EL mark — fill inherits from .o-icon { fill: white } */
const EL_SVG = `<svg viewBox="0 0 120 72" aria-hidden="true" focusable="false">
  <g transform="skewX(-12) translate(10,0)">
    <rect x="8" y="12" width="42" height="10" rx="2"></rect>
    <rect x="8" y="31" width="34" height="10" rx="2"></rect>
    <rect x="8" y="50" width="42" height="10" rx="2"></rect>
    <rect x="58" y="12" width="12" height="48" rx="2"></rect>
    <rect x="58" y="50" width="42" height="10" rx="2"></rect>
  </g>
</svg>`;

const EL_ICON = `<div class="o-icon elitechnexus-logo-wrap">${EL_SVG}</div>`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

/**
 * Replace SVG inside each home-use-cases__card-logo block.
 * Pattern: home-use-cases__card-logo"> <div class="o-icon"> <svg ...> ... </svg> </div>
 */
function patch(html) {
  const re =
    /(home-use-cases__card-logo">\s*)<div class="o-icon">\s*<svg[\s\S]*?<\/svg>\s*<\/div>/g;
  let count = 0;
  const next = html.replace(re, (_, prefix) => {
    count++;
    return prefix + EL_ICON;
  });
  return { next, count };
}

const CSS = `<style id="elitechnexus-usecase-logo-css">
/* EL mark in use-case card squares — white on themed tile */
.home-use-cases__card-logo .o-icon.elitechnexus-logo-wrap{
  width: calc(var(--size, 1em) * 1.35) !important;
  height: calc(var(--size, 1em) * 0.85) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  line-height: 0 !important;
}
.home-use-cases__card-logo .o-icon.elitechnexus-logo-wrap svg{
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  overflow: visible !important;
}
.home-use-cases__card-logo .o-icon.elitechnexus-logo-wrap svg *{
  fill: var(--color-white, #fff) !important;
}
</style>`;

let total = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes("home-use-cases__card-logo")) continue;

  const { next, count } = patch(h);
  h = next;
  total += count;

  if (h.includes("elitechnexus-usecase-logo-css")) {
    h = h.replace(
      /<style id="elitechnexus-usecase-logo-css">[\s\S]*?<\/style>/,
      CSS
    );
  } else {
    h = h.replace("</head>", CSS + "</head>");
  }

  fs.writeFileSync(f, h);
  console.log(f, "replaced", count);
}

console.log("total logos replaced", total);
