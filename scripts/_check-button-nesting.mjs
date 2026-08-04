import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const s = h.indexOf('<header id="site-header">');
const e = h.indexOf("</header>", s);
const hdr = h.slice(s, e + 9);

const i02 = hdr.indexOf('id="site-header__nav-list-02"');
const ib = hdr.indexOf('id="site-header__button-list"');
const close02 = hdr.indexOf("</ul>", i02);
console.log({
  navList02At: i02,
  buttonListAt: ib,
  firstUlCloseAfter02: close02,
  buttonInside02: i02 >= 0 && ib > i02 && (close02 < 0 || ib < close02),
});

// Show nesting around button-list
console.log("--- context ---");
console.log(hdr.slice(Math.max(0, ib - 200), ib + 100).replace(/\s+/g, " "));
console.log("--- after button-list ---");
const ibEnd = hdr.indexOf("</div>", ib);
console.log(hdr.slice(ib, ib + 80));
console.log(hdr.slice(ibEnd, ibEnd + 120).replace(/\s+/g, " "));
