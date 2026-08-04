import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

const idx = js.indexOf("class CameraControls");
console.log(js.slice(idx, idx + 1800));
console.log("\n\n=== visuals update ===");
const v = js.indexOf("class Visuals");
console.log(js.slice(v, v + 2200));
