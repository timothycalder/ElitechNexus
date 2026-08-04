import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf("home-hero__flow-visual-right-nav");
console.log(h.slice(i, i + 700).replace(/\s+/g, " "));
console.log("---");
console.log("size css ok", h.includes("flow-visual-right-nav .o-icon.elitechnexus-logo-wrap"));
console.log("width44", (h.match(/width="44"/g) || []).length);
const j = h.indexOf("flow-visual-chat-item-image");
console.log(h.slice(j, j + 350).replace(/\s+/g, " "));
