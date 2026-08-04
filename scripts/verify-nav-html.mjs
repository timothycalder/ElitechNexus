import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const marker = 'id="home-hero__flow-visual-right-nav"';
const i = h.indexOf(marker);
console.log("body nav at", i);
console.log(h.slice(i, i + 900).replace(/\s+/g, " "));
