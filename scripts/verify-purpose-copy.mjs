import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const checks = [
  "home-hero__subtitle",
  "home-hero__copy-end-title",
  "home-hero__copy-end-subtitle",
  "home-use-cases__subtitle",
  "home-bento__subtitle",
  "home-cta__caption",
  "proof first",
  "full-time",
  "paid project",
];
for (const c of checks) {
  const i = h.toLowerCase().indexOf(c.toLowerCase());
  console.log(c, i < 0 ? "NO" : "OK");
  if (i >= 0) console.log(" ", h.slice(i, i + 160).replace(/\s+/g, " "));
}

// Footer company line
const fi = h.indexOf("Elitechnexus LLC");
console.log("\nfooter", fi < 0 ? "NO" : h.slice(fi, fi + 280).replace(/\s+/g, " "));
