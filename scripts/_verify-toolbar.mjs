import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const a = h.indexOf('<header id="site-header">');
const b = h.indexOf('<div id="vimeo-overlay"', a);
const header = h.slice(a, b);
for (const s of ["Home", "Enterprise", "Pricing", "Customers", "Contact", "Login", "Get started", "Wiki"]) {
  console.log(s, header.includes(s) || header.includes(`>${s}<`) ? "yes" : "no");
}
const bl = header.indexOf("site-header__button-list");
console.log("\n--- button list ---");
console.log(header.slice(bl, bl + 900).replace(/\s+/g, " "));
console.log("\n--- toolbar css snippet ---");
const c = h.indexOf("elitechnexus-toolbar-css");
console.log(h.slice(c, c + 400));
