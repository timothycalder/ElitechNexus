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

let filesTouched = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;

  h = h.replace(
    /\/assets\/images\/home-hero\/hero-steps-([0-4])-thumb\.webp/g,
    "/assets/images/home-hero/hero-steps-$1-thumb.png?v=7"
  );

  if (h.includes("elitechnexus-logo-css")) {
    h = h.replace(
      /elitechnexus-logo-transparent\.png\?v=\d+/g,
      "elitechnexus-logo-transparent.png?v=7"
    );
    h = h.replace(
      /#site-header__logo \.o-icon\.elitechnexus-logo-wrap\{[\s\S]*?\}/,
      `#site-header__logo .o-icon.elitechnexus-logo-wrap{
  width:calc(var(--icon-size, 2rem) * 1.85)!important;
  height:calc(var(--icon-size, 2rem) * 1.15)!important;
}`
    );
  }

  if (h !== before) {
    fs.writeFileSync(f, h);
    filesTouched++;
    console.log("updated", f);
  }
}

console.log("filesTouched", filesTouched);

const idx = fs.readFileSync("public/index.html", "utf8");
const m = idx.match(/hero-steps-[0-4]-thumb[^"'\\\s>]*/g) || [];
console.log("thumb refs", [...new Set(m)]);
 console.log(
  "header logo css",
  (idx.match(/#site-header__logo \.o-icon\.elitechnexus-logo-wrap\{[\s\S]*?\}/) || [
    "",
  ])[0]
);
