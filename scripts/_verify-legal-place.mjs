import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const legal = h.indexOf('<div id="elite-legal-footer"');
console.log(h.slice(legal - 120, legal + 180).replace(/\s+/g, " "));
console.log("\ncss site-footer #elite", h.includes("#site-footer #elite-legal-footer"));
// count duplicate CSS rules
console.log("rule count", (h.match(/#site-footer #elite-legal-footer/g) || []).length);
