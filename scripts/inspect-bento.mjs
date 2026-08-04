import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf('id="home-bento"');
const j = h.indexOf('id="home-integration"');
const chunk = h.slice(i, j > i ? j : i + 80000);

fs.writeFileSync("scripts/_bento-chunk.html", chunk);
console.log("chunk length", chunk.length);

// Extract item blocks roughly
for (const id of ["01", "02", "03"]) {
  const re = new RegExp(
    `home-bento__item-${id}[\\s\\S]{0,2500}`,
    "i"
  );
  const m = chunk.match(re);
  console.log("\n==== ITEM", id, "====");
  console.log(m ? m[0].replace(/></g, ">\n<").slice(0, 1800) : "not found");
}

// Logo CSS
const css = h.match(/<style id="elitechnexus-logo-css">[\s\S]*?<\/style>/);
console.log("\n==== LOGO CSS ====");
console.log(css ? css[0] : "none");

// Find bento text content
const texts = [
  "Deep Technical",
  "Seamless Communication",
  "Compliant Global",
  "Every developer",
  "English",
  "Philippines",
  "Code on the go",
  "learns your",
];
for (const t of texts) {
  const idx = chunk.indexOf(t);
  console.log(t, idx === -1 ? "MISSING" : chunk.slice(Math.max(0, idx - 120), idx + 160).replace(/\s+/g, " "));
}
