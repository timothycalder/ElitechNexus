import fs from "fs";

const js = fs.readFileSync("public/_astro/hoisted.Dadqo-kW.js", "utf8");

const routeStart = js.indexOf("class Route{");
console.log(js.slice(routeStart, routeStart + 2000));

console.log("\n\n===== pageList =====");
let idx = 0;
let n = 0;
while ((idx = js.indexOf("pageList", idx)) !== -1 && n < 20) {
  console.log("\n@", idx, js.slice(idx, idx + 500));
  idx += 8;
  n++;
}

console.log("\n\n===== path: patterns =====");
idx = 0;
n = 0;
while ((idx = js.indexOf("path:", idx)) !== -1 && n < 40) {
  const slice = js.slice(idx, idx + 80);
  if (/path:\s*[`'"]/.test(slice) || /path:\s*[a-z]/.test(slice)) {
    console.log(slice);
    n++;
  }
  idx += 5;
}
