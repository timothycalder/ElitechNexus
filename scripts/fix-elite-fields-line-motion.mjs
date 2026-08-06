/**
 * Keep the cyan hex-line glow moving through #elite-fields.
 *
 * Root cause: Page.update zeros bgVisual.moveRatio every frame; only HomeHero
 * turns it back on. After the hero leaves the viewport (common once the tall
 * support photo grid is on screen), moveRatio stays 0 and the line freezes.
 */
import fs from "fs";

const PATH = "public/_astro/hoisted.Dadqo-kW.js";
let js = fs.readFileSync(PATH, "utf8");

const MARKER = "/*elite-fields-line-keepalive*/";
if (js.includes(MARKER)) {
  console.log("already patched");
  process.exit(0);
}

const needle = "bgVisual.moveRatio=0,bgVisual.counterOffsetY=0";
const idx = js.indexOf(needle);
if (idx < 0) {
  console.error("needle not found — hoisted bundle may have changed");
  process.exit(1);
}

const replacement =
  MARKER +
  'bgVisual.moveRatio=(function(){try{var e=document.getElementById("elite-fields");if(!e)return 0;var t=e.getBoundingClientRect(),n=window.innerHeight||1;return t.bottom>n*0.05&&t.top<n*0.95?1:0}catch(r){return 0}})(),bgVisual.counterOffsetY=0';

js = js.slice(0, idx) + replacement + js.slice(idx + needle.length);
fs.writeFileSync(PATH, js);
console.log("patched", PATH, "at", idx);

// Also lower elite-fields stacking so canvas glow is not buried under opaque stacking contexts
let html = fs.readFileSync("public/index.html", "utf8");
if (!html.includes("elitechnexus-fields-line-css")) {
  const css = `<style id="elitechnexus-fields-line-css">
/* Let the WebGL cyan line show in gutters around the support grid */
#elite-fields{
  z-index:1 !important;
  background:transparent !important;
}
#elite-fields > .o-container{
  z-index:1 !important;
}
#canvas{
  z-index:0 !important;
}
</style>`;
  html = html.replace(
    '<style id="elitechnexus-fields-css">',
    css + '<style id="elitechnexus-fields-css">'
  );
  fs.writeFileSync("public/index.html", html);
  console.log("added elitechnexus-fields-line-css");
} else {
  console.log("fields-line css already present");
}
