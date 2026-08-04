import fs from "fs";
const html = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/index.html",
  "utf8"
);
for (const id of [
  "page-transition",
  "pages-container",
  "preloader",
  "preloader-text",
  "preloader-logo",
  "scroll-indicator",
  "scroll-indicator-bar",
  "canvas",
  "ui",
]) {
  console.log(id, html.includes(`id="${id}"`));
}

// Check how pages-container is used
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);
const i = js.indexOf('getElementById("pages-container")');
const j = js.indexOf("getElementById('pages-container')");
const idx = i >= 0 ? i : j;
console.log("pages-container usage idx", idx);
if (idx >= 0) console.log(js.slice(idx - 80, idx + 200));

const k = js.indexOf("preloader-text");
console.log("preloader-text context", js.slice(k - 60, k + 180));
