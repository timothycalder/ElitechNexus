import fs from "fs";
import path from "path";

const root = "D:/Company Website(ElitechNexus)/public/visual-3d";
const indexPath = path.join(root, "index.html");
const jsPath = path.join(root, "_astro/hoisted.DFPcBL_D.js");

let html = fs.readFileSync(indexPath, "utf8");

// Normalize bases: single base for asset resolution under /visual-3d/
html = html.replace(/<base[^>]*>/g, "");

const bootStyles = `
    <base href="/visual-3d/">
    <style id="real-model-boot">
      /* Local stand-ins so Lusion FontItem finishes without Typekit hang */
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 400; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 500; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial Black"), local("Arial"); font-weight: 700; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 700; font-style: italic; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 400; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 400; font-style: italic; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 700; font-style: normal; }

      html, body { margin: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
      #canvas {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 1 !important;
        display: block !important;
      }
      /* Keep chrome out of the way; canvas stays visible */
      #ui { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }
      #site-header, #site-menu, #site-footer, #tickets-overlay, #cookies-overlay { display: none !important; }
      #preloader { z-index: 20; }
    </style>
`;

if (html.includes("<head>")) {
  html = html.replace("<head>", `<head>${bootStyles}`);
} else {
  throw new Error("no <head>");
}

// Ensure script/css paths are relative under /visual-3d/
html = html
  .replaceAll('href="/_astro/', 'href="./_astro/')
  .replaceAll('src="/_astro/', 'src="./_astro/')
  .replaceAll('href="./_astro/', 'href="./_astro/')
  .replaceAll('src="./_astro/', 'src="./_astro/');

fs.writeFileSync(indexPath, html, "utf8");
console.log("HTML prepared");

// Patch FontItem to resolve quickly if local fonts already match
let js = fs.readFileSync(jsPath, "utf8");

// Force HIDE_UI on
js = js.replaceAll("HIDE_UI=!1", "HIDE_UI=!0");
if (!js.includes("HIDE_UI=!0")) {
  console.warn("HIDE_UI pattern not found as expected");
}

// Speed up font polling interval (refInterval / interval)
// FontItem uses t.interval||20 and this.refInterval - make completion faster by
// shortening the compare loop: after first tick, if still stuck, force complete.
// Safer patch: change default interval from 20 to 10 and reduce wait by forcing
// onLoad after ~1s via wrapping - hard in minified code.
// Instead patch: this.refTextWidth=this._getTextWidth(...) to set refTextWidth to a sentinel
// that will differ immediately... actually FontItem waits until width CHANGES from ref font.
// With local @font-face mapped to Arial, measuring neue-haas vs monospace should differ immediately
// on first poll if browser applies the family. Good.

// Also force SKIP_ANIMATION optional for faster show
js = js.replace("SKIP_ANIMATION=!1", "SKIP_ANIMATION=!0");

fs.writeFileSync(jsPath, js, "utf8");
console.log("JS patched HIDE_UI/SKIP_ANIMATION");

// Update 3d.html shortcut
fs.writeFileSync(
  "D:/Company Website(ElitechNexus)/public/3d.html",
  `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=/visual-3d/"/><title>Real 3D Model</title></head><body style="background:#000;color:#aaa;font-family:sans-serif;padding:2rem">Loading real DDD model… <a href="/visual-3d/" style="color:#6cf">open</a></body></html>`,
  "utf8"
);
console.log("done");
