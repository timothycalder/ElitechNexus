import fs from "fs";

const h = fs.readFileSync("public/customers/ramp/index.html", "utf8");
const imgs = [...h.matchAll(/(?:src|srcset)="([^"]+)"/gi)].map((m) => m[1]);
console.log([...new Set(imgs)].filter((s) => /\.(png|webp|jpg|jpeg)/i.test(s)).join("\n"));

// also customers index cards for ramp/nubank/crossmint
const c = fs.readFileSync("public/customers/index.html", "utf8");
const hits = [...c.matchAll(/case-studies\/(ramp|nubank|crossmint)\/[^"'\s?]+/gi)].map((m) => m[0]);
console.log("customers cards:", [...new Set(hits)]);
