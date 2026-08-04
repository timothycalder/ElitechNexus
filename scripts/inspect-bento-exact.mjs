import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");

for (const id of ["home-bento__item-01", "home-bento__item-02", "home-bento__item-03"]) {
  const i = h.indexOf(`id="${id}"`);
  const next = h.indexOf('class="home-bento__item"', i + 10);
  const end = next > i ? next : i + 2500;
  const chunk = h.slice(i, end);
  const title = chunk.match(/home-bento__item-title">([\s\S]*?)<\/h3>/);
  const sub = chunk.match(/home-bento__item-subtitle">([\s\S]*?)<\/p>/);
  console.log("\n", id);
  console.log("TITLE:", title?.[1].replace(/\s+/g, " "));
  console.log("SUB:", sub?.[1]?.replace(/\s+/g, " ") ?? "(none)");
}

// Section headline
const hl = h.match(/id="home-bento__title">([\s\S]*?)<\/h2>/);
const hs = h.match(/id="home-bento__subtitle">([\s\S]*?)<\/p>/);
console.log("\nSECTION TITLE:", hl?.[1].replace(/\s+/g, " "));
console.log("SECTION SUB:", hs?.[1].replace(/\s+/g, " "));

// Integration section title (tools)
const it = h.match(/id="home-integration__title">([\s\S]*?)<\/h2>/);
console.log("\nINTEGRATION:", it?.[1].replace(/\s+/g, " "));

// Footer bottom-left exact
const fl = h.match(/id="site-footer__bottom-left">([\s\S]*?)<\/div>\s*<div id="site-footer__bottom-right"/);
console.log("\nFOOTER LEFT RAW:", fl?.[1].replace(/\s+/g, " ").slice(0, 400));
