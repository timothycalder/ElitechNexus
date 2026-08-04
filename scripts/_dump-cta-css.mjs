import fs from "fs";
const c = fs.readFileSync("public/_astro/_caseStudy_.C5ufd_-D.css", "utf8");
const i = c.indexOf("#site-header__button-cta");
console.log(c.slice(i, i + 600));
const j = c.indexOf("--gutter:");
console.log("\ngutter defs:");
let idx = 0, n = 0;
while ((idx = c.indexOf("--gutter", idx)) !== -1 && n < 8) {
  console.log(c.slice(idx, idx + 80));
  idx += 8; n++;
}
