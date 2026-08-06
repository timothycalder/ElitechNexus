/**
 * Fix blank homepage: HomeBento JS crashes without old bento DOM nodes.
 * Inject hidden stubs + harden JS null checks + force UI visible.
 */
import fs from "fs";

const STUB = `
<!-- home-bento js stubs (required by hoisted HomeBento; keep hidden) -->
<div class="home-bento__item" id="elite-bento-js-stub" aria-hidden="true">
  <div id="home-bento__item-image-main-wrapper-dot"></div>
  <div id="home-bento__item-01-visual-wrapper">
    <button type="button" id="home-bento__item-01-visual-button-success" data-id="success" tabindex="-1"></button>
  </div>
</div>
`;

const FORCE_CSS = `<style id="elitechnexus-force-visible-css">
#elite-bento-js-stub{
  position:absolute !important;
  width:1px !important; height:1px !important;
  overflow:hidden !important; opacity:0 !important;
  pointer-events:none !important; clip:rect(0 0 0 0) !important;
}
#ui, #viewport-wrapper, #pages-container, #home, .page {
  opacity: 1 !important;
  visibility: visible !important;
}
#preloader {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
#canvas {
  pointer-events: none !important;
}
.elite-people-section, #home-bento.elite-people-section {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 2 !important;
}
</style>`;

let html = fs.readFileSync("public/index.html", "utf8");

if (!html.includes("elite-bento-js-stub")) {
  html = html.replace(
    /(<div id="home-bento"[^>]*>\s*<div class="o-container">)/,
    `$1${STUB}`
  );
  console.log("injected bento stubs");
} else {
  console.log("stubs already present");
}

if (html.includes("elitechnexus-force-visible-css")) {
  html = html.replace(
    /<style id="elitechnexus-force-visible-css">[\s\S]*?<\/style>/,
    FORCE_CSS
  );
} else {
  html = html.replace("</head>", FORCE_CSS + "</head>");
}
fs.writeFileSync("public/index.html", html);

// Patch hoisted JS HomeBento to tolerate missing nodes
const jsPath = "public/_astro/hoisted.Dadqo-kW.js";
let js = fs.readFileSync(jsPath, "utf8");
const bak = jsPath + ".pre-bento-nullfix.bak";
if (!fs.existsSync(bak)) fs.copyFileSync(jsPath, bak);

const old =
  'this.dotButton.addEventListener("click",()=>{this.dotButton.closest(".home-bento__item").classList.toggle("is-active")}),this.visual1State="",this.domVisual1=this.domContainerEl.querySelector("#home-bento__item-01-visual-wrapper"),this.domContainerEl.querySelector("#home-bento__item-01-visual-button-success").addEventListener("click",this._onVisual1BtnClick.bind(this))}';
const neu =
  'this.dotButton&&this.dotButton.addEventListener("click",()=>{const _i=this.dotButton.closest(".home-bento__item");_i&&_i.classList.toggle("is-active")}),this.visual1State="",this.domVisual1=this.domContainerEl.querySelector("#home-bento__item-01-visual-wrapper");const _vs=this.domContainerEl.querySelector("#home-bento__item-01-visual-button-success");_vs&&_vs.addEventListener("click",this._onVisual1BtnClick.bind(this))}';

if (js.includes(old)) {
  js = js.replace(old, neu);
  console.log("patched HomeBento preInit null-guards");
} else if (js.includes("this.dotButton&&this.dotButton.addEventListener")) {
  console.log("HomeBento already patched");
} else {
  console.log("WARN: exact HomeBento string not found — stubs should still fix crash");
}

const oldShow =
  'onPageShow(){this._resetVisual1Btns(),this.dotButton.closest(".home-bento__item").classList.remove("is-active")}';
const neuShow =
  'onPageShow(){this._resetVisual1Btns();if(this.dotButton){const _i=this.dotButton.closest(".home-bento__item");_i&&_i.classList.remove("is-active")}}';
if (js.includes(oldShow)) {
  js = js.replace(oldShow, neuShow);
  console.log("patched HomeBento onPageShow");
}

fs.writeFileSync(jsPath, js);
console.log("done");
