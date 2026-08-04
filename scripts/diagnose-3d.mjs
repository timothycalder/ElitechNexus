import fs from "fs";

const html = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/index.html",
  "utf8"
);
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

console.log("HIDE_UI=!0", js.includes("HIDE_UI=!0"));
console.log(
  "bases",
  [...html.matchAll(/<base[^>]*>/g)].map((m) => m[0])
);
console.log("head snippet:\n", html.slice(html.indexOf("<head>"), html.indexOf("<head>") + 900));

const p = html.indexOf('id="preloader"');
console.log("preloader:\n", html.slice(Math.max(0, p - 40), p + 220));

const c = html.indexOf('id="canvas"');
console.log("canvas:\n", html.slice(Math.max(0, c - 40), c + 100));

const ids = [...js.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map((m) => m[1]);
console.log("getElementById", [...new Set(ids)]);

console.log(
  "unsupported msgs",
  [...js.matchAll(/Not supported[^"']{0,50}/g)].map((m) => m[0])
);

// Check if preloader needs svg children
console.log("preloader has svg?", /id="preloader"[\s\S]{0,300}svg/.test(html));

// Font item / typekit
console.log("typekit in html", html.includes("typekit"));
console.log("neue-haas in js", js.includes("neue-haas"));
