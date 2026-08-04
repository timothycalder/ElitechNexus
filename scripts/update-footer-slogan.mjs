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

const CSS = `<style id="elitechnexus-footer-slogan-css">
#site-footer__top-left-title{
  font-size:calc(var(--h1) * 0.62) !important;
  line-height:1.18 !important;
  overflow:visible !important;
}
#site-footer__top-left-title .o-text-gradient{
  overflow:visible !important;
  display:inline-block;
  padding-bottom:0.06em;
}
#site-footer__top-left-title .elite-footer-line{
  font-size:1em;
}
#site-footer__top-left-title .elite-footer-brand{
  font-size:1.32em;
  line-height:1.12;
  display:inline-block;
  margin-top:0.08em;
}
</style>`;

const NEW =
  '<span class="o-text-gradient"><span class="elite-footer-line">Let\'s Build Together with</span><br><span class="elite-footer-brand">Elitechnexus LLC!</span></span>';

// Match any previous slogan variants inside the footer title span
const sloganRe =
  /<span class="o-text-gradient">[\s\S]*?Elitechnexus LLC!?<\/span>(?:\s*<\/span>)?/;

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes("site-footer__top-left-title")) continue;
  const before = h;

  // Replace the gradient slogan block inside the footer title
  h = h.replace(
    /(<h3 id="site-footer__top-left-title">)[\s\S]*?(<\/h3>)/,
    `$1${NEW}$2`
  );

  if (h.includes("elitechnexus-footer-slogan-css")) {
    h = h.replace(
      /<style id="elitechnexus-footer-slogan-css">[\s\S]*?<\/style>/,
      CSS
    );
  } else {
    h = h.replace("</head>", CSS + "</head>");
  }

  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
    console.log("updated", f);
  }
}
console.log("done", n);
