import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

console.log("hero update stub?", js.includes("init(){this.hasInit=!0}update(){return}"));
console.log("syncDom refs", [...js.matchAll(/syncDom/g)].length);

const i = js.indexOf("class HomeHeroSection");
const chunk = js.slice(i, i + 3500);
console.log(chunk.slice(0, 2000));
console.log("\n...\n");
console.log(chunk.slice(2000));
