import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf("site-header__nav-list-dropdown-box");
console.log("idx", i);
console.log(h.slice(i, i + 2500));
