import fs from "fs";
import path from "path";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

const V = 28;
let fixedFiles = 0;

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;

  // Broken patterns from bad cache-bust (path stripped)
  h = h.replace(
    /srcset="=(\d+)"(\s+media="\(min-width: 768px\)")/g,
    `srcset="/assets/images/bento03.png?v=${V}"$2`
  );
  // Mobile picture blocks near item-03 — fix remaining =N srcs carefully by context

  // Generic broken src="=N" / srcset="=N" near bento item 03 hover
  // First pass: count
  const broken = [...h.matchAll(/(?:src|srcset)="=\d+"/g)];
  if (!broken.length && h === before) continue;

  // Use surrounding context: if near bento-hover03 or Collaborate, assign correctly
  // Safer approach: fix picture tags that lost bento03 / bento-mobile03

  // Desktop source + img that are broken and followed by hover03
  h = h.replace(
    /<source srcset="=\d+" media="\(min-width: 768px\)">\s*<img src="=\d+" alt="visual">\s*<img id="home-bento__item-03-hover"/g,
    `<source srcset="/assets/images/bento03.png?v=${V}" media="(min-width: 768px)"> <img src="/assets/images/bento03.png?v=${V}" alt="visual"> <img id="home-bento__item-03-hover"`
  );

  // Mobile wrapper broken pair
  h = h.replace(
    /home-bento__item-image-main-wrapper-mobile">\s*<picture>\s*<source srcset="=\d+" media="\(min-width: 768px\)">\s*<img src="=\d+" alt="visual">/g,
    `home-bento__item-image-main-wrapper-mobile"> <picture> <source srcset="/assets/images/bento-mobile03.png?v=${V}" media="(min-width: 768px)"> <img src="/assets/images/bento-mobile03.png?v=${V}" alt="visual">`
  );

  // Any remaining broken =N for this page — report
  const still = [...h.matchAll(/(?:src|srcset)="=\d+"/g)];
  if (still.length) {
    console.log("still broken in", f, still.map((m) => m[0]));
    // Fallback: if only bento03 context left, replace all =N with bento03
    // Better: look at _bento-chunk for intended paths
  }

  // Also ensure normal paths get v=28
  h = h.replace(
    /\/assets\/images\/bento03\.png(?:\?v=\d+)?/g,
    `/assets/images/bento03.png?v=${V}`
  );
  h = h.replace(
    /\/assets\/images\/bento-mobile03\.png(?:\?v=\d+)?/g,
    `/assets/images/bento-mobile03.png?v=${V}`
  );

  if (h !== before) {
    fs.writeFileSync(f, h);
    fixedFiles++;
    console.log("fixed", f);
  }
}

console.log("files fixed", fixedFiles);
