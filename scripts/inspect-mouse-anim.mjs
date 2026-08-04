import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

function around(needle, pad = 600) {
  const idx = js.indexOf(needle);
  console.log("\n###", needle, idx);
  if (idx >= 0) console.log(js.slice(idx, idx + pad));
}

around("fakeInitialMouseInteraction");
around("updateMouseProj");
around("preSolveMouse");
around("needsFakeMouseInteractive");
around("class SoftBodyTets");
