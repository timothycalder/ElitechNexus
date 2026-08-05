import fs from "fs";
import path from "path";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

const from =
  "Full-time jobs, paid projects, and global engineering talent — with proof first.";
const to =
  "Full-time jobs, paid projects, and side income — with proof first.";

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes(from)) continue;
  fs.writeFileSync(f, h.split(from).join(to));
  n++;
  console.log(f);
}
console.log("done", n);
