import fs from "fs";
import path from "path";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

for (const f of walk("public")) {
  const h = fs.readFileSync(f, "utf8");
  const m = h.match(/(?:src|srcset)="=\d+"/g);
  if (m) console.log(f, m);
}
console.log("scan done");
