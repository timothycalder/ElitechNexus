import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

function around(needle, pad = 250) {
  let idx = 0;
  let n = 0;
  while ((idx = js.indexOf(needle, idx)) >= 0 && n < 8) {
    console.log("\n===", needle, "@", idx, "===");
    console.log(js.slice(Math.max(0, idx - pad), idx + pad));
    idx += needle.length;
    n++;
  }
}

around("softBody.preInit");
around("SoftBody");
around("new SoftBody");
around('path="/"');
around("class HomePage");
around("TERRAIN.buf");
