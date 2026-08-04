/**
 * Contact / Login / Get started were inside #site-header__nav-list-02,
 * which is display:none — so they vanished. Move button-list out as a
 * sibling of the nav lists so it stays visible on the right.
 */
import fs from "fs";
import path from "path";

const TOOLBAR_CSS = `<style id="elitechnexus-toolbar-css">
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
  display: flex !important;
  width: 100% !important;
}
#site-header__nav-bg:before,
#site-header__nav-bg:after{
  border-radius: 999px !important;
}
/* Hide "View more" cluster only — NOT the right-side buttons */
#site-header__nav-list-02{
  display: none !important;
}
#site-header__nav-list-01 > li[data-id="pricing"],
#site-menu__nav-01 > li[data-id="pricing"]{
  display: none !important;
}
/* Right cluster: Contact · Login · Get started — always visible */
#site-header__button-list{
  display: flex !important;
  margin-left: auto !important;
  align-items: center !important;
  gap: clamp(0.85rem, 1.5vw, 1.35rem) !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 6 !important;
  flex-shrink: 0 !important;
}
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
#site-header__button-contact:hover{ opacity: 0.85 !important; }
#site-header__button-transparent{
  display: inline-flex !important;
  margin-right: 0 !important;
  visibility: visible !important;
  opacity: 1 !important;
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

const LOGIN_BTN = `<a id="site-header__button-transparent" href="/login#login"> <div id="site-header__button-transparent-inner-wrapper"> <span>Login</span> </div> </a> `;

const CTA_BTN = `<a id="site-header__button-cta" href="mailto:steven.miller@elitechnexus.com"> <span>Get started</span> </a> `;

const BUTTON_LIST = `<div id="site-header__button-list"> ${CONTACT_BTN}${LOGIN_BTN}${CTA_BTN}<div id="site-header__button-menu"></div> </div>`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

function extractButtonList(html) {
  const start = html.indexOf('<div id="site-header__button-list"');
  if (start < 0) return { html, block: BUTTON_LIST };
  // Find matching close of this div (simple depth walk)
  let i = start;
  let depth = 0;
  let end = -1;
  while (i < html.length) {
    if (html.startsWith("<div", i)) {
      depth++;
      i = html.indexOf(">", i) + 1;
      continue;
    }
    if (html.startsWith("</div>", i)) {
      depth--;
      i += 6;
      if (depth === 0) {
        end = i;
        break;
      }
      continue;
    }
    i++;
  }
  if (end < 0) return { html, block: BUTTON_LIST };
  let block = html.slice(start, end);
  // Ensure Contact exists
  if (!block.includes("site-header__button-contact")) {
    block = block.replace(
      /(<div id="site-header__button-list"[^>]*>\s*)/,
      `$1${CONTACT_BTN}`
    );
  }
  // Ensure login href
  block = block.replace(
    /(<a id="site-header__button-transparent"[^>]*href=")[^"]+(")/,
    "$1/login#login$2"
  );
  block = block.replace(
    /(<a id="site-header__button-transparent"[^>]*?)\s+target="_blank"/,
    "$1"
  );
  const next = html.slice(0, start) + html.slice(end);
  return { html: next, block };
}

function fixHeader(html) {
  let h = html;

  // Pull button-list out (wherever it is)
  const extracted = extractButtonList(h);
  h = extracted.html;
  let buttonList = extracted.block;

  // Clean broken leftovers inside nav-list-02: ensure it closes, then inject button-list after it
  // Pattern: <ul id="site-header__nav-list-02"> ... (may miss </ul>) then </nav> or site-menu
  const list02 = h.indexOf('<ul id="site-header__nav-list-02"');
  if (list02 >= 0) {
    // Find where nav ends (site-menu or </nav>)
    const menu = h.indexOf('<div id="site-menu"', list02);
    const navClose = h.indexOf("</nav>", list02);
    const cutAt = menu >= 0 && (navClose < 0 || menu < navClose) ? menu : navClose;
    if (cutAt > list02) {
      // Replace entire list-02 region with empty hidden ul + button list
      // Keep a stub list-02 for any JS that queries it
      const stub =
        `<ul id="site-header__nav-list-02" aria-hidden="true"></ul> ${buttonList} `;
      // Find start of list-02 and replace through cutAt (exclusive)
      // But don't eat </nav> or site-menu
      h = h.slice(0, list02) + stub + h.slice(cutAt);
      // If we landed before </nav> but left a stray </nav> duplicate issues — OK
      // If cutAt was site-menu, we may have removed </nav> — restore if needed
      if (menu >= 0 && cutAt === menu) {
        // Ensure </nav> exists before site-menu
        const beforeMenu = h.indexOf('<div id="site-menu"');
        const before = h.slice(Math.max(0, beforeMenu - 30), beforeMenu);
        if (!before.includes("</nav>")) {
          h = h.slice(0, beforeMenu) + "</nav> " + h.slice(beforeMenu);
        }
      }
    }
  } else {
    // No list-02 — inject button-list before site-menu / </nav>
    const menu = h.indexOf('<div id="site-menu"');
    const navClose = h.indexOf("</nav>");
    const at = menu >= 0 && (navClose < 0 || menu < navClose) ? menu : navClose;
    if (at > 0 && !h.includes('id="site-header__button-list"')) {
      h = h.slice(0, at) + buttonList + " " + h.slice(at);
    }
  }

  // If button-list still missing somehow
  if (!h.includes('id="site-header__button-list"')) {
    const navClose = h.indexOf("</nav>");
    if (navClose > 0) h = h.slice(0, navClose) + buttonList + " " + h.slice(navClose);
  }

  // Mobile menu: Contact + Login kept
  if (!/site-menu__nav-02[\s\S]{0,500}href="\/contact"/.test(h)) {
    h = h.replace(
      /<ul id="site-menu__nav-02">[\s\S]*?<\/ul>/,
      `<ul id="site-menu__nav-02"> <li> <a href="/contact"> <span>Contact</span> </a> </li> </ul>`
    );
  }

  // CSS
  const re = /<style id="elitechnexus-toolbar-css">[\s\S]*?<\/style>/;
  if (re.test(h)) h = h.replace(re, TOOLBAR_CSS);
  else h = h.replace("</head>", TOOLBAR_CSS + "</head>");

  return h;
}

let n = 0;
for (const f of walk("public")) {
  const before = fs.readFileSync(f, "utf8");
  const after = fixHeader(before);
  if (after !== before) {
    fs.writeFileSync(f, after);
    n++;
    console.log("updated", f);
  }
}
console.log("done", n);

// Verify homepage
const h = fs.readFileSync("public/index.html", "utf8");
const navS = h.indexOf('<nav id="site-header__nav">');
const navE = h.indexOf('<div id="site-menu">', navS);
const nav = h.slice(navS, navE);
const i02 = nav.indexOf('id="site-header__nav-list-02"');
const ib = nav.indexOf('id="site-header__button-list"');
const close02 = nav.indexOf("</ul>", i02);
console.log({
  buttonAfterList02Close: ib > close02,
  hasContact: nav.includes("site-header__button-contact"),
  hasLogin: /href="\/login"/.test(nav),
  hasCta: nav.includes("site-header__button-cta"),
  snippet: nav
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/\s+/g, " ")
    .slice(nav.indexOf("nav-list-01") - 20, nav.indexOf("site-menu") > 0 ? undefined : undefined)
    .slice(0, 900),
});
