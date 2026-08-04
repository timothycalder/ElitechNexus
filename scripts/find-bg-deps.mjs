import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

function around(needle, pad = 400) {
  const idx = js.indexOf(needle);
  console.log("\n###", needle, idx);
  if (idx >= 0) console.log(js.slice(idx, idx + pad));
}

around("class Bg");
around("bg.preInit");
around('MODEL_PATH+"web');
around("lightField.init");
around("class LightField");
around("TEXTURE_PATH+");
around("AUDIO_PATH+");
