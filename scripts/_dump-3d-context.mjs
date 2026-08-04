import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf("visual-3d-frame");
console.log(h.slice(i - 800, i + 600));

console.log("\n\n--- also search home-cta structure ---");
const j = h.indexOf('id="home-cta"');
console.log(h.slice(j, j + 500));
const k = h.indexOf("visual-3d");
// find wrapper ids near iframe
const before = h.slice(Math.max(0, i - 2000), i);
const ids = [...before.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
console.log("ids before iframe:", ids.slice(-15));
