import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf('id="elite-legal-footer"');
const j = h.indexOf("elitechnexus-legal-footer-css");
console.log("legal footer html idx", i);
console.log("legal footer css idx", j);

if (i >= 0) {
  // context around placement
  console.log("\n--- before ---");
  console.log(h.slice(Math.max(0, i - 300), i).replace(/\s+/g, " "));
  console.log("\n--- start ---");
  console.log(h.slice(i, i + 200).replace(/\s+/g, " "));
  console.log("\n--- after end ---");
  // find end of legal footer roughly
  const after = h.slice(i, i + 8000);
  const scroll = after.indexOf("scroll-indicator");
  const preloader = after.indexOf("preloader");
  console.log("scroll-indicator offset from legal", scroll);
  console.log("snippet near scroll:", after.slice(Math.max(0, scroll - 80), scroll + 80).replace(/\s+/g, " "));
}

// Check if inside viewport-wrapper / pages-container
const vw = h.indexOf('id="viewport-wrapper"');
const pc = h.indexOf('id="pages-container"');
const sf = h.indexOf('id="site-footer"');
console.log("\nviewport", vw, "pages", pc, "site-footer", sf, "legal", i);
console.log("legal after site-footer?", i > sf);
console.log("legal after viewport?", i > vw);

// Is legal inside closed body structure?
const bodyClose = h.lastIndexOf("</body>");
console.log("legal before </body>?", i < bodyClose && i > 0);

// Check CSS for display none or height 0
const css = h.match(/<style id="elitechnexus-legal-footer-css">[\s\S]*?<\/style>/);
console.log("\ncss present", !!css);
if (css) console.log(css[0].slice(0, 400));
