import fs from "fs";

const h = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
const i = h.indexOf('id="case-study__video"');
const j = h.indexOf('id="case-study__right"', i);
console.log(h.slice(i, j > i ? j : i + 1200).replace(/\s+/g, " "));
console.log("\n--- content imgs ---");
const imgs = [...h.matchAll(/case-studies\/gumroad\/[^"'\s]+/g)].map((m) => m[0]);
console.log([...new Set(imgs)]);
