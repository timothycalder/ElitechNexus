import fs from "fs";

const css = fs.readFileSync("public/_astro/_caseStudy_.C5ufd_-D.css", "utf8");
const keys = [
  "home-use-cases__card-logo",
  "home-use-cases__card",
  "use-cases__card-logo",
];
for (const k of keys) {
  let idx = 0;
  let n = 0;
  while ((idx = css.indexOf(k, idx)) !== -1 && n < 8) {
    console.log("\n---", k, "at", idx, "---");
    console.log(css.slice(Math.max(0, idx - 80), idx + 350));
    idx += k.length;
    n++;
  }
}

// Also look for color vars near cards
const m = css.match(/home-use-cases__card[^}]{0,500}/g);
if (m) {
  console.log("\n=== matches", m.length);
  m.slice(0, 15).forEach((x, i) => console.log(i, x.slice(0, 300)));
}
