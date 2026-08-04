import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
console.log(
  "thumbs",
  [...new Set(h.match(/hero-steps-[0-4]-thumb[^"'\\\s>]*/g) || [])]
);
console.log(
  "header",
  (h.match(/#site-header__logo \.o-icon\.elitechnexus-logo-wrap\{[\s\S]*?\}/) || [
    "",
  ])[0]
);
console.log("has Devin?", /Devin/i.test(h));
