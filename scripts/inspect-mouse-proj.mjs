import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);
const i = js.indexOf("updateMouseProj(e){");
console.log(js.slice(i, i + 700));
console.log("\n--- SoftBody.update ---");
const u = js.indexOf("update(e){const t=math.clamp(e,.011111111111111112", js.indexOf("class SoftBody{"));
console.log(js.slice(u, u + 900));
