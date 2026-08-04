import fs from "fs";

const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";
let js = fs.readFileSync(jsPath, "utf8");

// After neutralized init, updates may still touch missing meshes.
// Soft-disable HomeHeroSection.update by making early return when no ufxMeshTop
const needle =
  "this.hasInit=!0}resize(e,t){this.scrollCtaBarHeight=this.domScrollCtaBar.getBoundingClientRect().height";
if (js.includes(needle)) {
  js = js.replace(
    needle,
    "this.hasInit=!0}update(){return}resize(e,t){if(!this.domScrollCtaBar)return;this.scrollCtaBarHeight=this.domScrollCtaBar.getBoundingClientRect().height"
  );
  console.log("HomeHeroSection.update short-circuited");
} else {
  console.log("resize pattern not found; trying alternate");
  // Find HomeHeroSection class end area
  const i = js.indexOf("class HomeHeroSection");
  const u = js.indexOf("update(e){", i);
  console.log("first update after HomeHero", u - i);
  console.log(js.slice(u, u + 120));
}

fs.writeFileSync(jsPath, js, "utf8");
