/**
 * Remove the visual-3d section (iframe + full-viewport section) sitewide.
 */
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

const SECTION_RE =
  /<section\b[^>]*\bid="visual-3d-section"[^>]*>[\s\S]*?<\/section>\s*/gi;
const IFRAME_RE =
  /<iframe\b[^>]*\bid="visual-3d-frame"[^>]*>\s*<\/iframe>\s*/gi;

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes("visual-3d")) continue;
  const before = h;
  h = h.replace(SECTION_RE, "");
  h = h.replace(IFRAME_RE, "");
  // leftover comments / CSS hooks if any
  h = h.replace(/\/\*\s*visual-3d[\s\S]*?\*\//gi, "");
  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
    console.log("removed 3d from", f);
  }
}
console.log("files updated", n);

// verify homepage
const home = fs.readFileSync("public/index.html", "utf8");
console.log("still has visual-3d?", home.includes("visual-3d"));
console.log("footer still present?", home.includes('id="site-footer"'));
