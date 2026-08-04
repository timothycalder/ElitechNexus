import fs from "fs";
import path from "path";

const OLD = "steven.miller@elitechnexus.com";
const NEW = "steven.miller@elitechnexus.com";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules" || n === ".git") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (/\.(html|mjs|js|md|json|txt)$/i.test(n)) a.push(f);
  }
  return a;
}

let total = 0;
for (const f of walk(".")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes(OLD)) continue;
  const c = h.split(OLD).length - 1;
  fs.writeFileSync(f, h.split(OLD).join(NEW));
  total += c;
  console.log(`${c}x ${f}`);
}
console.log("total replacements", total);

// verify
let left = 0;
for (const f of walk("public")) {
  const h = fs.readFileSync(f, "utf8");
  const c = h.split(OLD).length - 1;
  if (c) {
    left += c;
    console.log("REMAINING", c, f);
  }
}
console.log("remaining old email in public:", left);
console.log(
  "new email count in public/index.html:",
  (fs.readFileSync("public/index.html", "utf8").split(NEW).length - 1)
);
