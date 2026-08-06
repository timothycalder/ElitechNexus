import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const title = h.indexOf("Ready for jobs");
const slides = h.indexOf('id="home-integration__slides"');
console.log("title", title, "slides", slides);

// Find nearest id= before first cards-column after title
const chunk = h.slice(title - 500, title + 800);
console.log(chunk.replace(/\s+/g, " ").slice(0, 900));

const col = h.indexOf("home-integration__cards-column", title);
console.log("\nfirst column at", col);
console.log(h.slice(col - 200, col + 80).replace(/\s+/g, " "));
