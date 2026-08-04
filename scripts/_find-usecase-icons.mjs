import fs from "fs";
import path from "path";

const h = fs.readFileSync("public/index.html", "utf8");
console.log("Application development", h.includes("Application development"));
console.log("Frontend bugs", h.includes("Frontend bugs"));

const start = h.indexOf('id="home-use-cases"');
console.log("start", start);
console.log(h.slice(start, start + 1500));

// list image files mentioning use / case / card
function walk(d, a = []) {
  if (!fs.existsSync(d)) return a;
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else a.push(f.replace(/\\/g, "/"));
  }
  return a;
}
const imgs = walk("public/assets/images").filter((f) =>
  /use|case|card|icon|logo/i.test(f)
);
console.log("\nrelevant images:");
imgs.forEach((f) => console.log(f));
