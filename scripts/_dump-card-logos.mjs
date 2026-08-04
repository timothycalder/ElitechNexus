import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Extract each card-logo block
let idx = 0;
let n = 0;
while ((idx = h.indexOf("home-use-cases__card-logo", idx)) !== -1 && n < 5) {
  console.log("\n===== CARD LOGO", n, "at", idx, "=====");
  console.log(h.slice(idx, idx + 1200));
  idx += 20;
  n++;
}

// CSS for card colors
for (const id of [
  "home-use-cases__card",
  "card-logo",
  "use-cases__card",
]) {
  const i = h.indexOf(id);
  // search in linked css? might be in astro css
}
