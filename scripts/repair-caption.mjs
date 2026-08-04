import fs from "fs";
import path from "path";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

for (const f of walk("public")) {
  let t = fs.readFileSync(f, "utf8");
  const before = t;
  t = t.replace(/Built by<\/\/span>/g, "Built by</span>");
  t = t.replace(/Built by Elitechnexus, Philippines ·<\/span>/g, "Built by</span>");
  // Ensure logo label includes location
  t = t.replace(
    /(id="home-hero__caption"[\s\S]*?o-icon">[\s\S]*?<\/div>)\s*Elitechnexus(?!, Philippines)</,
    "$1 Elitechnexus, Philippines<"
  );
  t = t.replace(/Elitechnexus, Philippines, Philippines/g, "Elitechnexus, Philippines");
  if (t !== before) {
    fs.writeFileSync(f, t, "utf8");
    console.log("repaired", f);
  }
}

const h = fs.readFileSync("public/index.html", "utf8");
const m = h.match(/id="home-hero__caption">([\s\S]*?)<h1/);
const c = (m?.[1] || "").replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]");
console.log(c.replace(/\s+/g, " "));
console.log("broken?", /Built by<\/\//.test(h));
