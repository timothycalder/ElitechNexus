import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);
const i = js.indexOf("homeHeroSection");
console.log(js.slice(i - 250, i + 120));
