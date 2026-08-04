import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const start = h.indexOf('id="home-hero__flow-visual-left"');
const end = h.indexOf('id="home-hero__flow-visual-right"', start);
const left = h.slice(start, end);
console.log(
  left
    .replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]")
    .replace(/\s+/g, " ")
    .slice(0, 2000)
);
console.log("\nlogos in left", (left.match(/elitechnexus-logo/g) || []).length);
