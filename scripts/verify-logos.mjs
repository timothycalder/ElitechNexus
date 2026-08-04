import fs from "fs";
import path from "path";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "visual-3d") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

for (const f of walk("public")) {
  const t = fs.readFileSync(f, "utf8");
  const left = (t.match(/viewBox="0 0 44 50"/g) || []).length;
  const el = (t.match(/elitechnexus-logo/g) || []).length;
  if (left || el) console.log(path.relative("public", f), "remaining44=", left, "elLogo=", el);
}

// Check if any brand hexagon paths remain
const home = fs.readFileSync("public/index.html", "utf8");
console.log("has 2A6DCE brand path?", home.includes('fill: #2A6DCE'));
console.log("header sample:", home.includes('elitechnexus-logo-transparent.png'));
