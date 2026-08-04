import fs from "fs";
import path from "path";

const ROOT = "public";

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

for (const f of walk(ROOT)) {
  let t = fs.readFileSync(f, "utf8");
  const before = t;

  // Restore caption lead-in if we over-expanded it
  t = t.replace(/>Built by Elitechnexus, Philippines ·</g, ">Built by<");

  // Original pattern: logo + company name text → company + location
  // </div> Elitechnexus</span>  (inside caption after icon)
  t = t.replace(
    /(id="home-hero__caption"[\s\S]*?<\/div>)\s*Elitechnexus<\/span>/,
    `$1 Elitechnexus, Philippines</span>`
  );
  // idempotent
  t = t.replace(
    /Elitechnexus, Philippines, Philippines<\/span>/g,
    "Elitechnexus, Philippines</span>"
  );

  if (t !== before) {
    fs.writeFileSync(f, t, "utf8");
    console.log("fixed", f);
  }
}

const h = fs.readFileSync("public/index.html", "utf8");
const start = h.indexOf('id="home-hero__caption"');
const end = h.indexOf('id="home-hero__title"');
let chunk = h.slice(start, end);
chunk = chunk.replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]");
console.log(chunk.replace(/\s+/g, " "));
