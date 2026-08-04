import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Header structure snippet
const a = h.indexOf('<header id="site-header">');
const b = h.indexOf('<div id="vimeo-overlay"', a);
console.log(h.slice(a, Math.min(a + 4500, b)));

console.log("\n\n===== CSS mentions site-header =====");
const cssFiles = [
  "public/_astro/_caseStudy_.C5ufd_-D.css",
];
for (const f of cssFiles) {
  const c = fs.readFileSync(f, "utf8");
  for (const key of [
    "#site-header",
    "site-header__nav",
    "site-header__container",
    "site-header__button",
    "--header",
    "nav-list-02",
  ]) {
    let i = 0, n = 0;
    while ((i = c.indexOf(key, i)) !== -1 && n < 3) {
      console.log("\n", f, key, "@", i);
      console.log(c.slice(Math.max(0, i - 40), i + 280));
      i += key.length;
      n++;
    }
  }
}
