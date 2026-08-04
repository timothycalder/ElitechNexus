import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Dropdown box
const a = h.indexOf("site-header__nav-list-dropdown-box");
console.log("--- DROPDOWN ---");
console.log(h.slice(a, a + 3500));

console.log("\n--- HEADER BUTTONS ---");
const b = h.indexOf("site-header__button");
console.log(h.slice(b - 100, b + 800));

console.log("\n--- SITE MENU links ---");
const c = h.indexOf("site-menu__");
// find about careers blog docs deepwiki
for (const label of ["About us", "Careers", "Blog", "Contact", "Docs", "DeepWiki", "Get started", "Wiki"]) {
  let i = 0, n = 0;
  while ((i = h.indexOf(label, i)) !== -1 && n < 8) {
    console.log(label, "@", i, JSON.stringify(h.slice(Math.max(0,i-80), i+40).replace(/\s+/g," ")));
    i += label.length;
    n++;
  }
}

console.log("\n--- FOOTER ---");
const f = h.indexOf("site-footer");
console.log(h.slice(f, f + 2000).replace(/\s+/g, " ").slice(0, 1500));
