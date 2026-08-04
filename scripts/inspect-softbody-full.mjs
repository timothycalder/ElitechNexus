import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);

const start = js.indexOf("class SoftBody{");
const end = js.indexOf("const softBody=new SoftBody", start);
console.log(js.slice(start, end));

console.log("\n\n==== visuals.hasInitialized ====");
const h = js.indexOf("hasInitialized");
let idx = 0;
let n = 0;
while ((idx = js.indexOf("hasInitialized", idx)) >= 0 && n < 15) {
  console.log(js.slice(idx - 40, idx + 80));
  idx += 14;
  n++;
}
