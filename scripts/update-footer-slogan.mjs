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
#site-footer__top-left-title .elite-footer-line{
  font-size:1em;
  color:#0a0a0a !important;
  background:none !important;
  -webkit-background-clip:unset !important;
  background-clip:unset !important;
  -webkit-text-fill-color:#0a0a0a !important;
}
#site-footer__top-left-title .elite-footer-brand.o-text-gradient,
#site-footer__top-left-title .o-text-gradient.elite-footer-brand{
  font-size:1.32em;
  line-height:1.12;
  display:inline-block;
  margin-top:0.08em;
  overflow:visible !important;
  padding-bottom:0.06em;
}
</style>`;

const NEW =
  '<span class="elite-footer-line">Let\'s Build Together with</span><br><span class="o-text-gradient elite-footer-brand">Elitechnexus LLC!</span>';

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes("site-footer__top-left-title")) continue;
  const before = h;

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
