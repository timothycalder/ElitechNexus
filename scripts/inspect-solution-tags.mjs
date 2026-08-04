import fs from "fs";
const h = fs.readFileSync("public/index.html.restored", "utf8");
const sol = h.indexOf("<h2>The Solution: Custom ETL Migration Devin</h2>");
const vp = h.indexOf('id="viewport-wrapper"');
const mid = h.slice(sol, vp);

// Tokenize top-level-ish tags after h2
const tags = [...mid.matchAll(/<\/?(h2|p|div|blockquote|ul|ol|span|a|b)\b[^>]*>/gi)].slice(0, 40);
let depth = 0;
console.log(mid.slice(0, 2000));
console.log("\n--- tag flow ---");
for (const t of [...mid.matchAll(/<(h2|p|div|blockquote|ul|ol)(\s[^>]*)?>|<\/(h2|p|div|blockquote|ul|ol)>/gi)].slice(0, 50)) {
  console.log(t[0].slice(0, 80));
}
