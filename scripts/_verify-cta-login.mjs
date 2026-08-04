import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
console.log("cta", (h.match(/id="site-header__button-cta"[^>]*/) || [])[0]);
console.log("foot", (h.match(/id="site-footer__top-left-button"[^>]*/) || [])[0]);
console.log("menu", (h.match(/id="site-menu__btn-1"[^>]*/) || [])[0]);
console.log("contact", (fs.readFileSync("public/contact/index.html","utf8").match(/class="top__cta"[^>]*/) || [])[0]);
