import fs from "fs";

const htmlPath = "D:/Company Website(ElitechNexus)/public/visual-3d/index.html";
const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";

let html = fs.readFileSync(htmlPath, "utf8");
let js = fs.readFileSync(jsPath, "utf8");

// 1) CSS: kill video/hero stripe space; keep only WebGL canvas + 3D
const bootStyle = `<style id="real-model-boot">
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 400; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 500; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial Black"), local("Arial"); font-weight: 700; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 700; font-style: italic; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 400; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 400; font-style: italic; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 700; font-style: normal; }

      html, body { margin: 0; background: #000; width: 100%; height: 100%; overflow: hidden !important; }

      #canvas {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 1 !important;
        display: block !important;
      }

      /* Remove video / hero stripe space completely */
      #home-hero-section,
      #home-hero__stripes,
      #home-hero__top,
      #home-hero__middle,
      #home-hero__bottom,
      #home-hero__cta-bar,
      #home-text-image-section,
      #home-speakers-section,
      #home-video-trailer-section,
      #home-topics-section,
      #home-tickets-section,
      #cookies-overlay,
      #tickets-overlay,
      #site-header,
      #site-menu,
      #site-footer,
      #scroll-indicator,
      #preloader {
        display: none !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      /* Keep page shell but no layout space from HTML content */
      #ui, #pages-container, .page {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }
    </style>`;

if (html.includes('id="real-model-boot"')) {
  html = html.replace(/<style id="real-model-boot">[\s\S]*?<\/style>/, bootStyle);
} else {
  html = html.replace("<head>", `<head>${bootStyle}`);
}

fs.writeFileSync(htmlPath, html, "utf8");
console.log("HTML: hero/video space hidden");

// 2) JS: skip HomeHeroSection video meshes / force faded out
// Make fadeOutRatio always 1 so hero video overlays never show
js = js.replace(
  "u_fadeOutRatio:{value:0}",
  "u_fadeOutRatio:{value:1}"
);

// Disable homeHeroSection.preInit body start by short-circuiting after assignment of domContainer if possible.
// Safer: no-op the video-related UfxMesh creation by making hasInit skip.
// Replace HomeHeroSection.init mesh creation with empty init
const heroInitStart = js.indexOf("}init(){const e=(t,i=0)=>new UfxMesh({refDom:t,uniforms:Object.assign({u_yPadding:{value:i}},this.sharedUniforms,blueNoise.sharedUniforms)");
if (heroInitStart >= 0) {
  // Find this specific HomeHeroSection init - look for IS_TOP define nearby
  const marker = "this.ufxMeshTop.material.defines.IS_TOP=1";
  const m = js.indexOf(marker);
  if (m > 0) {
    // Walk back to "init(){const e=(t,i=0)=>new UfxMesh"
    const initAt = js.lastIndexOf("init(){const e=(t,i=0)=>new UfxMesh", m);
    const endAt = js.indexOf("this.hasInit=!0}", m);
    if (initAt > 0 && endAt > initAt) {
      const old = js.slice(initAt, endAt + "this.hasInit=!0}".length);
      js =
        js.slice(0, initAt) +
        "init(){this.hasInit=!0}" +
        js.slice(endAt + "this.hasInit=!0}".length);
      console.log("HomeHeroSection.init neutralized, old len", old.length);
    }
  }
}

// Hide UI by default so only canvas/3D shows
js = js.replaceAll("HIDE_UI=!1", "HIDE_UI=!0");
if (!js.includes("HIDE_UI=!0")) {
  // if already !0 ok
  console.log("HIDE_UI state", js.includes("HIDE_UI=!0"));
}

fs.writeFileSync(jsPath, js, "utf8");
console.log("JS updated; HIDE_UI", js.includes("HIDE_UI=!0"));
