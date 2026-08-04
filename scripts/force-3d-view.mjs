import fs from "fs";

const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";
let js = fs.readFileSync(jsPath, "utf8");

const from =
  "properties.footerVisualRatio=math.saturate(-a/(properties.viewportHeight-o.height-siteHeader.containerHeight-1))";
const to = "properties.footerVisualRatio=1";

if (!js.includes(from)) {
  console.error("assignment pattern not found");
  process.exit(1);
}

js = js.replace(from, to);
fs.writeFileSync(jsPath, js, "utf8");
console.log("Forced footerVisualRatio=1 (3D model always visible)");
console.log("still has old?", js.includes(from));
