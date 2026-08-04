import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

function around(needle, pad = 500) {
  const idx = js.indexOf(needle);
  console.log("\n###", needle, idx);
  if (idx >= 0) console.log(js.slice(idx - 100, idx + pad));
}

around("hasFakeAnimationBeenTriggered");
around("interactiveRatio");
around("class SoftBody{");
around("softBody.update");
around("function loop");
around("requestAnimationFrame");
