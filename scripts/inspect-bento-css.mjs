import fs from "fs";

const css = fs.readFileSync("public/_astro/_caseStudy_.C5ufd_-D.css", "utf8");

const keys = [
  "#home-bento__item-01",
  "#home-bento__item-02",
  "#home-bento__item-03",
  ".home-bento__item-text",
  ".home-bento__item-title",
  ".home-bento__item-subtitle",
  ".home-bento__item-inner",
  "home-bento__item-image-main",
];

for (const k of keys) {
  let idx = 0;
  let n = 0;
  while ((idx = css.indexOf(k, idx)) !== -1 && n < 3) {
    console.log("\n---", k, "at", idx, "---");
    console.log(css.slice(idx, idx + 500));
    idx += k.length;
    n++;
  }
}
