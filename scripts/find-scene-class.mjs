import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);
const idx = js.indexOf("softBody.preInit(),innerPart.preInit()");
console.log(js.slice(idx - 1200, idx + 800));
