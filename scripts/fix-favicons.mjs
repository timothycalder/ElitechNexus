/**
 * Ensure every page uses the Elitechnexus company logo as favicon
 * (browser tab icon) — fix Contact/Login missing /favicon.svg.
 */
import fs from "fs";
import path from "path";

const ICON_BLOCK = `<!-- Elitechnexus favicon -->
<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
<link rel="icon" href="/assets/images/elitechnexus-logo-transparent.png?v=14" type="image/png" sizes="32x32">
<link rel="icon" href="/assets/images/elitechnexus-logo-transparent.png?v=14" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/images/elitechnexus-logo-transparent.png?v=14" type="image/png" sizes="180x180">
`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
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

  // Remove existing favicon / apple-touch icon links
  h = h.replace(/<!--\s*Elitechnexus favicon\s*-->\s*/gi, "");
  h = h.replace(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>\s*/gi, "");
  h = h.replace(/<link[^>]*rel=["']apple-touch-icon["'][^>]*>\s*/gi, "");

  if (h.includes("</head>")) {
    h = h.replace("</head>", ICON_BLOCK + "</head>");
  } else if (h.includes("<head>")) {
    h = h.replace("<head>", "<head>\n" + ICON_BLOCK);
  } else {
    console.warn("no head:", f);
    continue;
  }

  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
    console.log("updated", f);
  }
}
console.log("done", n, "favicon.svg exists", fs.existsSync("public/favicon.svg"));
