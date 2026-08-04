import fs from "fs";

const chunk = fs.readFileSync("scripts/_bento-chunk.html", "utf8");
const i = chunk.indexOf('id="home-bento__item-03"');
const j = chunk.indexOf('id="home-integrat', i);
console.log(chunk.slice(i, j > i ? j : i + 2000));

let h = fs.readFileSync("public/index.html", "utf8");
const V = 28;

// Fix remaining broken img fallbacks after bento03 source
h = h.replace(
  /(<source srcset="\/assets\/images\/bento03\.png\?v=\d+" media="\(min-width: 768px\)">\s*<img src=")(=\d+)(" alt="visual">\s*<\/picture>\s*<img id="home-bento__item-03-hover")/,
  `$1/assets/images/bento-mobile03.png?v=${V}$3`
);

// Mobile wrapper for item-03: currently has bento03 source + broken img
h = h.replace(
  /(home-bento__item-image-main-wrapper-mobile">\s*<picture>\s*<source srcset=")\/assets\/images\/bento03\.png\?v=\d+(" media="\(min-width: 768px\)">\s*<img src=")(=\d+)(" alt="visual">)/,
  `$1/assets/images/bento-mobile03.png?v=${V}$2/assets/images/bento-mobile03.png?v=${V}$4`
);

const still = [...h.matchAll(/(?:src|srcset)="=\d+"/g)];
console.log("still broken", still.map((m) => m[0]));

fs.writeFileSync("public/index.html", h);

const k = h.indexOf("Compliant Global");
console.log("--- after ---");
console.log(h.slice(k - 700, k + 450));
