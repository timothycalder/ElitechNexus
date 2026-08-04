import fs from "fs";
const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);
for (const needle of [
  "visuals.preInit",
  "Visuals.preInit",
  "new Visuals",
  "visuals=",
  "const visuals",
  "visuals.preInit(",
  "app.preInit",
  "initEngine",
]) {
  const idx = js.indexOf(needle);
  console.log(needle, idx);
  if (idx >= 0) console.log(js.slice(idx - 100, idx + 200), "\n---");
}
