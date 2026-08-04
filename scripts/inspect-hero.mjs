import fs from "fs";

const htmlPath = "D:/Company Website(ElitechNexus)/public/visual-3d/index.html";
const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";

let html = fs.readFileSync(htmlPath, "utf8");
let js = fs.readFileSync(jsPath, "utf8");

console.log("home-hero-section", html.includes('id="home-hero-section"'));
console.log("JUMP_SECTION", js.match(/JUMP_SECTION="[^"]*"/)?.[0]);
console.log("JUMP_OFFSET", js.match(/JUMP_OFFSET=[^,;]+/)?.[0]);

// Show hero markup snippet
const i = html.indexOf('id="home-hero-section"');
console.log(html.slice(Math.max(0, i - 80), i + 400));
