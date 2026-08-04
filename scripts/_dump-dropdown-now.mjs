import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const a = h.indexOf('id="site-header__nav-list-dropdown-box"');
const b = h.indexOf('id="site-header__button-list"');
console.log(h.slice(a, b));

console.log("\n\n===== MENU =====");
const m = h.indexOf('id="site-menu__nav-02"');
console.log(h.slice(m, m + 800));
