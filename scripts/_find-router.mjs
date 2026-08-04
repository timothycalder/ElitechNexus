import fs from "fs";

const js = fs.readFileSync("public/_astro/hoisted.Dadqo-kW.js", "utf8");

for (const key of [
  "routeManager",
  "class Route",
  "preventDefault",
  "pushState",
  "data-id",
  "pages-container",
  "/about",
  "about",
  "careers",
  "external",
  "location.href",
  "window.location",
]) {
  const i = js.indexOf(key);
  console.log(key, i);
}

// Find routeManager definition area
let idx = 0;
let n = 0;
while ((idx = js.indexOf("routeManager", idx)) !== -1 && n < 15) {
  console.log("\n--- routeManager @", idx, "---");
  console.log(js.slice(idx, idx + 400));
  idx += 12;
  n++;
}
