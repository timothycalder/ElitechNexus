import fs from "fs";

const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";
let js = fs.readFileSync(jsPath, "utf8");

const matches = [...js.matchAll(/footerVisualRatio/g)];
console.log("footerVisualRatio count", matches.length);
for (const m of matches.slice(0, 12)) {
  console.log("---", m.index);
  console.log(js.slice(m.index - 60, m.index + 120));
}
