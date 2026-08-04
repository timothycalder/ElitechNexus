import fs from "fs";

const js = fs.readFileSync("public/_astro/hoisted.Dadqo-kW.js", "utf8");

// Extract RouteManager class
const start = js.indexOf("class RouteManager");
console.log("RouteManager at", start);
console.log(js.slice(start, start + 3500));

console.log("\n\n===== addPath registrations near page setup =====");
// Find addPath calls
let idx = 0;
let n = 0;
while ((idx = js.indexOf(".addPath(", idx)) !== -1 && n < 40) {
  console.log(js.slice(Math.max(0, idx - 80), idx + 120));
  idx += 8;
  n++;
}

console.log("\n\n===== click / anchor handling =====");
const clickIdx = js.indexOf("addEventListener(\"click\"");
console.log("first click", clickIdx);
// search for href click intercept
for (const pat of [
  'closest("a")',
  "closest('a')",
  "tagName===\"A\"",
  'tagName=="A"',
  "preventDefault()",
  "history.pushState",
  "popstate",
]) {
  let i = 0,
    c = 0;
  while ((i = js.indexOf(pat, i)) !== -1 && c < 5) {
    if (i > 580000 && i < 620000) {
      console.log("\n", pat, "@", i);
      console.log(js.slice(i - 100, i + 250));
    }
    i += pat.length;
    c++;
  }
}
