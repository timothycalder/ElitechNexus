import fs from "fs";
const css = fs.readFileSync("public/_astro/_caseStudy_.C5ufd_-D.css", "utf8");

// dump all rules mentioning item-01 and item-text/title/subtitle
const re = /#[\w-]*home-bento[\w#-]*item-01[\w#.\s:>[\]="'*-]*\{[^}]*\}/g;
const matches = css.match(re) || [];
console.log("item-01 rules", matches.length);
for (const m of matches) console.log(m.slice(0, 350), "\n");

console.log("\n==== title absolute contexts ====");
let idx = 0;
while ((idx = css.indexOf("home-bento__item-title{position:absolute", idx)) !== -1) {
  console.log(css.slice(idx - 120, idx + 120));
  idx += 10;
}

console.log("\n==== item-01 text ====");
idx = 0;
while ((idx = css.indexOf("#home-bento__item-01", idx)) !== -1) {
  const slice = css.slice(idx, idx + 280);
  if (slice.includes("item-text") || slice.includes("item-title") || slice.includes("item-subtitle")) {
    console.log(slice, "\n---");
  }
  idx += 20;
}

// o-icon / site-header logo backgrounds
for (const k of ["#site-header__logo", ".o-icon{", "#site-header__logo .o-icon"]) {
  idx = css.indexOf(k);
  console.log("\n", k, idx);
  if (idx >= 0) console.log(css.slice(idx, idx + 400));
}
