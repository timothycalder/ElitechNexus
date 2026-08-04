import fs from "fs";
import path from "path";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules" || n === "login") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;

  // Nav Login button → login tab (not signup)
  h = h.replace(
    /(<a\b[^>]*\bid="site-header__button-transparent"[^>]*\bhref=")\/login(?:#register)?(")/g,
    "$1/login#login$2"
  );
  // Also handle href before id attribute order
  h = h.replace(
    /(<a\b[^>]*\bhref=")\/login(?:#register)?("[^>]*\bid="site-header__button-transparent")/g,
    "$1/login#login$2"
  );

  // Any plain text Login links in standalone headers (contact page etc.)
  h = h.replace(
    /(<a\b[^>]*\bhref=")\/login(?:#register)?("[^>]*>\s*Login\s*<\/a>)/gi,
    "$1/login#login$2"
  );

  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
    console.log("updated", f);
  }
}

// Verify homepage
const home = fs.readFileSync("public/index.html", "utf8");
const m = home.match(/id="site-header__button-transparent"[^>]{0,120}/);
console.log("home login btn:", m && m[0]);
console.log("done", n);
