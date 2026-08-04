import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

const re = /footerVisualRatio\s*=/g;
let m;
while ((m = re.exec(js))) {
  console.log("---", m.index);
  console.log(js.slice(m.index - 100, m.index + 150));
}
