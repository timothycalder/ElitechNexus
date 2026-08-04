import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
let idx = 0;
let n = 0;
while ((idx = h.indexOf("home-use-cases__card-logo", idx)) !== -1 && n < 3) {
  console.log("\n===== LOGO", n, "=====");
  console.log(h.slice(idx, idx + 450));
  idx += 30;
  n++;
}

// Ensure no molecule viewBox 18 20 remains inside card-logo
const logos = [...h.matchAll(/home-use-cases__card-logo">[\s\S]*?<\/div>\s*<\/div>/g)];
console.log("\nlogo blocks", logos.length);
for (const m of logos.slice(0, 3)) {
  console.log("has molecule 18 20?", m[0].includes('viewBox="0 0 18 20"'));
  console.log("has EL?", m[0].includes("elitechnexus-logo-wrap"));
  console.log("has skewX EL?", m[0].includes("skewX(-12)"));
}

console.log("css injected?", h.includes("elitechnexus-usecase-logo-css"));
