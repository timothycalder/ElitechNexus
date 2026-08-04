import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

function around(needle, pad = 300) {
  let idx = 0;
  let n = 0;
  while ((idx = js.indexOf(needle, idx)) >= 0 && n < 6) {
    console.log("\n===", needle, "@", idx, "===");
    console.log(js.slice(Math.max(0, idx - pad), idx + pad));
    idx += needle.length;
    n++;
  }
}

around('MODEL_PATH+"POINTS"');
around('MODEL_PATH+"TERRAIN"');
around('MODEL_PATH+"SOLID"');
around("class AboutPage");
around("class WebPage");
around("class MainVisual");
