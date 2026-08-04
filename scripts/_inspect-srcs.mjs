import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf("Compliant Global");
console.log(h.slice(i - 900, i + 500));
console.log("--- broken ---");
let idx = 0,
  c = 0;
while ((idx = h.indexOf('="=', idx)) !== -1 && c < 10) {
  console.log("at", idx, JSON.stringify(h.slice(idx - 60, idx + 25)));
  idx++;
  c++;
}
