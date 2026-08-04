/**
 * Remove Pricing from nav (desktop + mobile).
 * Keep Contact + Login on the right and make them clearly visible.
 */
import fs from "fs";
import path from "path";

const TOOLBAR_CSS = `<style id="elitechnexus-toolbar-css">
/* Match original Devin toolbar height / breathing room */
#site-header{
  --site-header-nav-padding: calc(var(--gutter) * .85) !important;
  --icon-size: calc(var(--space-l) * 1.15) !important;
}
@media (max-width: 939.98px){
  #site-header{
    --icon-size: calc(var(--space-m) * 1.25) !important;
    --site-header-nav-padding: calc(var(--gutter) * .55) !important;
  }
}
#site-header__nav{
  min-height: 3.85rem !important;
  align-items: center !important;
}
#site-header__nav-bg:before,
#site-header__nav-bg:after{
  border-radius: 999px !important;
}
/* Hide middle "View more" cluster — Contact lives on the right now */
#site-header__nav-list-02{
  display: none !important;
}
/* Hide Pricing everywhere in the header / mobile menu */
#site-header__nav-list-01 > li[data-id="pricing"],
#site-menu__nav-01 > li[data-id="pricing"]{
  display: none !important;
}
#site-header__button-list{
  display: flex !important;
  margin-left: auto !important;
  align-items: center !important;
  gap: clamp(0.85rem, 1.5vw, 1.35rem) !important;
  visibility: visible !important;
  opacity: 1 !important;
  z-index: 5 !important;
}
/* Contact — always visible text link on the right */
#site-header__button-contact{
  position: relative;
  display: inline-flex !important;
  align-items: center;
  color: currentColor;
  text-decoration: none;
  font: inherit;
  font-weight: 550;
  line-height: 1;
  white-space: nowrap;
  visibility: visible !important;
  opacity: 1 !important;
}
#site-header__button-contact-inner,
#site-header__button-contact span{
  display: inline !important;
  visibility: visible !important;
  opacity: 1 !important;
}
#site-header__button-contact:hover{
  opacity: 0.85 !important;
}
/* Login — keep visible next to Contact */
#site-header__button-transparent{
  display: inline-flex !important;
  margin-right: 0 !important;
  visibility: visible !important;
  opacity: 1 !important;
}
#site-header__button-transparent span{
  display: inline !important;
}
#site-header__button-cta{
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.78em 1.35em !important;
  min-height: 2.55em !important;
  border-radius: 999px !important;
  line-height: 1 !important;
}
</style>`;

const CONTACT_BTN = `<a id="site-header__button-contact" href="/contact"> <div id="site-header__button-contact-inner"> <span>Contact</span> </div> </a> `;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

function removePricingLi(html) {
  // Desktop pill: <li ... data-id="pricing">...</li>
  let h = html.replace(
    /<li class="site-header__nav-item" data-id="pricing">\s*<a href="\/pricing">[\s\S]*?<\/a>\s*<\/li>/g,
    ""
  );
  // Mobile menu: <li data-id="pricing">...</li>
  h = h.replace(
    /<li data-id="pricing">\s*<a href="\/pricing">[\s\S]*?<\/a>\s*<\/li>/g,
    ""
  );
  // Footer / stray Pricing nav links that look like primary nav (keep page content alone)
  return h;
}

function ensureContactLogin(html) {
  let h = html;
  // Ensure Contact button exists before Login
  if (!h.includes('id="site-header__button-contact"')) {
    h = h.replace(
      /(<div id="site-header__button-list">\s*)/,
      `$1${CONTACT_BTN}`
    );
  }
  // Ensure Login points to /login
  h = h.replace(
    /(<a id="site-header__button-transparent"[^>]*href=")[^"]+(")/g,
    '$1/login$2'
  );
  h = h.replace(
    /(<a id="site-header__button-transparent"[^>]*?)\s+target="_blank"/g,
    "$1"
  );
  // Mobile: keep Contact in nav-02, Login in menu btn
  if (!/site-menu__nav-02[\s\S]{0,400}href="\/contact"/.test(h)) {
    h = h.replace(
      /<ul id="site-menu__nav-02">[\s\S]*?<\/ul>/,
      `<ul id="site-menu__nav-02"> <li> <a href="/contact"> <span>Contact</span> </a> </li> </ul>`
    );
  }
  // Remove Wiki from mobile secondary if present
  h = h.replace(
    /<li>\s*<a href="\/deepwiki">\s*<span>Wiki<\/span>[\s\S]*?<\/a>\s*<\/li>/g,
    ""
  );
  return h;
}

function injectToolbarCss(html) {
  const re = /<style id="elitechnexus-toolbar-css">[\s\S]*?<\/style>/;
  if (re.test(html)) return html.replace(re, TOOLBAR_CSS);
  return html.replace("</head>", TOOLBAR_CSS + "</head>");
}

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  h = removePricingLi(h);
  h = ensureContactLogin(h);
  h = injectToolbarCss(h);
  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
    console.log("updated", f);
  }
}
console.log("done", n);

const hdrStart = fs.readFileSync("public/index.html", "utf8");
const s = hdrStart.indexOf('<header id="site-header">');
const e = hdrStart.indexOf("</header>", s);
const hdr = hdrStart.slice(s, e);
console.log({
  pricingGone: !/data-id="pricing"/.test(hdr),
  hasContact: hdr.includes("site-header__button-contact"),
  hasLogin: /button-transparent[^>]*href="\/login"/.test(hdr),
  hasGetStarted: hdr.includes("site-header__button-cta"),
  leftNav: (hdr.match(/nav-list-01[\s\S]*?<\/ul>/) || [""])[0]
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim(),
});
