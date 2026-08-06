import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf('<div id="elite-legal-footer"');
console.log(h.slice(i, i + 1800).replace(/\s+/g, " ").slice(0, 1500));
console.log("\nicons:", (h.slice(i).match(/data-social="/g) || []).length);
