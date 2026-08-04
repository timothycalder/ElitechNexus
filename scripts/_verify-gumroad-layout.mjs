import fs from "fs";
const h = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
const i = h.indexOf('id="case-study__video"');
console.log("COVER SECTION:", h.slice(i, i + 350).replace(/\s+/g, " "));
console.log("\nCOLLAB:", (h.match(/collaboration-still[^"]*/) || [])[0]);
console.log("IMG1:", (h.match(/gumroad\/img1[^"]*/) || [])[0]);
