import fs from "fs";

const h = fs.readFileSync("public/index.html.restored", "utf8");
const sol = h.indexOf("<h2>The Solution: Custom ETL Migration Devin</h2>");
const vp = h.indexOf('id="viewport-wrapper"');
console.log("solution", sol, "viewport", vp, "gap", vp - sol);

// Find markers between solution and viewport
const mid = h.slice(sol, vp);
console.log("mid length", mid.length);
console.log("h2 in mid", [...mid.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m => m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()));
console.log("h3 in mid", [...mid.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map(m => m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).slice(0,20));

// Last 500 chars before viewport
console.log("before viewport:\n", mid.slice(-800).replace(/\s+/g," "));

// First paragraph-ish after solution heading
console.log("\nsolution start:\n", mid.slice(0, 500).replace(/\s+/g," "));

// Look for Results heading variants
for (const s of ["Results", "The Result", "Impact", "Outcome", "Conclusion", "Key takeaways", "12x", "engineering hours"]) {
  console.log(s, mid.includes(s));
}
