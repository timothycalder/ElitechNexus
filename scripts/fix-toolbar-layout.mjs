/**
 * Toolbar: taller (match original), Contact+Login+Get started on the right, remove Wiki.
 */
import fs from "fs";
import path from "path";

const CONTACT_BTN = `<a id="site-header__button-contact" href="/contact"> <div id="site-header__button-contact-inner"> <span>Contact</span> </div> </a> `;

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
#site-header__button-list{
  display: flex !important;
  margin-left: auto !important;
  align-items: center !important;
  gap: clamp(0.85rem, 1.5vw, 1.35rem) !important;
}
#site-header__button-contact{
  position: relative;
  display: inline-flex;
  align-items: center;
  color: currentColor;
  text-decoration: none;
  font: inherit;
  line-height: 1;
  white-space: nowrap;
}
#site-header__button-contact:hover{
  opacity: 0.85;
}
#site-header__button-transparent{
  margin-right: 0 !important;
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
#site-header__logo .o-icon.elitechnexus-logo-wrap{
  width: calc(var(--icon-size, 2rem) * 1.65) !important;
  height: calc(var(--icon-size, 2rem) * 1.05) !important;
}
</style>`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

function patchHeader(html) {
  let h = html;

  // Remove Wiki dropdown item (precise: only deepwiki href in dropdown box)
  h = h.replace(
    /<li>\s*<a class="site-header__nav-list-dropdown-box-item-inner-wrapper" href="\/deepwiki">[\s\S]*?<\/a>\s*<\/li>/g,
    ""
  );

  // Remove Wiki side nav item in list-02
  h = h.replace(
    /<li class="site-header__nav-item">\s*<a href="\/deepwiki">\s*<div class="site-header__nav-item-inner-wrapper">[\s\S]*?<\/div>\s*<\/a>\s*<\/li>/g,
    ""
  );

  // Remove Contact from dropdown / list-02 (will live in button-list)
  h = h.replace(
    /<li>\s*<a class="site-header__nav-list-dropdown-box-item-inner-wrapper" href="\/contact">[\s\S]*?<\/a>\s*<\/li>/g,
    ""
  );
  h = h.replace(
    /<li class="site-header__nav-item">\s*<a href="\/contact">\s*<div class="site-header__nav-item-inner-wrapper">[\s\S]*?<\/div>\s*<\/a>\s*<\/li>/g,
    ""
  );

  // Mobile menu: remove Wiki
  h = h.replace(
    /<li>\s*<a href="\/deepwiki">\s*<span>Wiki<\/span>[\s\S]*?<\/a>\s*<\/li>/g,
    ""
  );

  // Ensure Contact is first in button-list (right cluster)
  if (!h.includes('id="site-header__button-contact"')) {
    h = h.replace(
      /(<div id="site-header__button-list">\s*)/,
      `$1${CONTACT_BTN}`
    );
  }

  // If Contact still only in mobile menu as separate — keep mobile Contact
  // Ensure mobile nav-02 has Contact (and not Wiki)
  if (h.includes('id="site-menu__nav-02"')) {
    h = h.replace(
      /<ul id="site-menu__nav-02">[\s\S]*?<\/ul>/,
      `<ul id="site-menu__nav-02"> <li> <a href="/contact"> <span>Contact</span> </a> </li> </ul>`
    );
  }

  // Inject / replace toolbar CSS
  if (h.includes('id="elitechnexus-toolbar-css"')) {
    h = h.replace(
      /<style id="elitechnexus-toolbar-css">[\s\S]*?<\/style>/,
      TOOLBAR_CSS
    );
  } else {
    h = h.replace("</head>", TOOLBAR_CSS + "</head>");
  }

  // Update fullnav — drop deepwiki from forced set (optional keep for bookmarks)
  if (h.includes('id="elitechnexus-fullnav-fix"')) {
    h = h.replace(
      /var FULL = \{[^}]*\}/,
      "var FULL = { contact: 1, login: 1 }"
    );
  }

  return h;
}

let n = 0;
for (const f of walk("public")) {
  const before = fs.readFileSync(f, "utf8");
  if (!before.includes('id="site-header"')) continue;
  const after = patchHeader(before);
  if (after !== before) {
    fs.writeFileSync(f, after);
    n++;
    console.log("updated", f);
  }
}
console.log("files", n);

// Verify homepage
const h = fs.readFileSync("public/index.html", "utf8");
const headerEnd = h.indexOf('<div id="vimeo-overlay"');
const header = h.slice(h.indexOf('<header id="site-header">'), headerEnd);
console.log("Wiki in header?", /Wiki|deepwiki/i.test(header));
console.log("button-contact?", header.includes("site-header__button-contact"));
console.log("Login?", header.includes("site-header__button-transparent"));
console.log("Get started?", header.includes("Get started"));
console.log("toolbar css?", h.includes("elitechnexus-toolbar-css"));
console.log("list-02 still has items?", /nav-list-02[\s\S]{0,200}Contact|nav-list-02[\s\S]{0,200}Wiki/.test(header));
