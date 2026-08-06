import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf('id="home-hero__flow-visual-right-nav"');
console.log(h.slice(i, i + 1500));
