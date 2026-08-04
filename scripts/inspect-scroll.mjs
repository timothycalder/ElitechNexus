import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

function around(needle, pad = 350) {
  let idx = 0;
  let n = 0;
  while ((idx = js.indexOf(needle, idx)) >= 0 && n < 4) {
    console.log("\n===", needle, "@", idx);
    console.log(js.slice(idx - 80, idx + pad));
    idx += needle.length;
    n++;
  }
}

around("scrollManager.");
around("JUMP_OFFSET");
around("scrollTo");
around("heroTexts");
around("softBody.interactive");
