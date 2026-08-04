import fs from "fs";

let h = fs.readFileSync("public/index.html", "utf8");
console.log(
  "overlays gone",
  !h.includes("home-hero__brand-name") && !h.includes("elitechnexus-hero-brand")
);
console.log("chat Elitechnexus", h.includes("Give Elitechnexus a task"));
h = h.replace(/hero_layer_0\.png(\?v=\d+)?/g, "hero_layer_0.png?v=3");
fs.writeFileSync("public/index.html", h);
console.log("cache busted");
