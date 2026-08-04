/**
 * Rebuild site header from archive with precise surgery (no greedy li regex).
 * Keep: Home, Enterprise, Pricing, Customers, Contact, Wiki, Login, Get started
 * Remove: About us, Careers, Blog, Docs
 */
import fs from "fs";
import path from "path";

const EMAIL = "steven.miller@elitechnexus.com";
const LOGO = `<div class="o-icon elitechnexus-logo-wrap"><img src="/assets/images/elitechnexus-logo.svg?v=14" alt="Elitechnexus" class="elitechnexus-logo"/></div>`;
const ARROW = `<div class="o-icon"> <svg viewBox="0 0 16 16"> <line x1="3.692" y1="10.386" x2="8.289" y2="5.789"></line> <polyline points="3.404,5.494 8.577,5.494 8.577,10.68 "></polyline> </svg> </div>`;

const archive = fs.readFileSync("scripts/_archive-home.html", "utf8");
const hs = archive.indexOf('<header id="site-header">');
const he = archive.indexOf('<div id="vimeo-overlay"', hs);
let header = archive.slice(hs, he);

// 1) Logo
header = header.replace(
  /(<a id="site-header__logo" href="\/">)\s*<div class="o-icon">[\s\S]*?<\/div>\s*(<\/a>)/,
  `$1 ${LOGO} $2`
);

// 2) Dropdown box ONLY — Contact + Wiki
const ddItem = (href, label) =>
  `<li> <a class="site-header__nav-list-dropdown-box-item-inner-wrapper" href="${href}"> ${ARROW} <span>${label}</span> ${ARROW} </a> </li>`;
header = header.replace(
  /<ul id="site-header__nav-list-dropdown-box">[\s\S]*?<\/ul>/,
  `<ul id="site-header__nav-list-dropdown-box"> ${ddItem("/contact", "Contact us")} ${ddItem("/deepwiki", "Wiki")} </ul>`
);

// 3) Replace secondary list items after dropdown (About/Careers/...) with Contact + Wiki only
// These are sibling <li class="site-header__nav-item"> WITHOUT data-id, after the dropdown closes
const sideItem = (href, label) =>
  `<li class="site-header__nav-item"> <a href="${href}"> <div class="site-header__nav-item-inner-wrapper"> ${ARROW} <span>${label}</span> ${ARROW} </div> </a> </li>`;

// Cut from end of dropdown container to start of button-list
header = header.replace(
  /(id="site-header__nav-list-dropdown-box-container">\s*<ul id="site-header__nav-list-dropdown-box">[\s\S]*?<\/ul>\s*<\/div>\s*<\/div>)([\s\S]*?)(<div id="site-header__button-list")/,
  `$1 ${sideItem("/contact", "Contact")} ${sideItem("/deepwiki", "Wiki")} $3`
);

// 4) Buttons
header = header.replace(
  /(id="site-header__button-transparent"[^>]*href=")[^"]+(")/,
  `$1/login$2`
);
header = header.replace(
  /(id="site-header__button-cta"[^>]*href=")[^"]+(")/,
  `$1mailto:${EMAIL}$2`
);
header = header.replace(/target="_blank"(?=[^>]*id="site-header__button-transparent")/g, "");
// remove target=_blank from login if present on the tag
header = header.replace(
  /(<a id="site-header__button-transparent")([^>]*)(href="\/login")/,
  '$1 href="/login"'
);

// 5) Mobile menu nav-01 keep as-is (Home/Enterprise/Pricing/Customers)
// Mobile menu nav-02 → Contact + Wiki only
header = header.replace(
  /<ul id="site-menu__nav-02">[\s\S]*?<\/ul>/,
  `<ul id="site-menu__nav-02"> <li> <a href="/contact"> <span>Contact</span> <span>${ARROW}</span> </a> </li> <li> <a href="/deepwiki"> <span>Wiki</span> <span>${ARROW}</span> </a> </li> </ul>`
);

// 6) Mobile CTAs
header = header.replace(
  /(id="site-menu__btn-1"[^>]*href=")[^"]+(")/,
  `$1mailto:${EMAIL}$2`
);
header = header.replace(/(id="site-menu__btn-2"[^>]*href=")[^"]+(")/, `$1/login$2`);

// 7) site-menu logo if it's an empty div with background — CSS already handles elitechnexus

fs.writeFileSync("scripts/_rebuilt-header.html", header);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
assert(header.includes('data-id="home"'), "missing Home");
assert(header.includes('data-id="enterprise"'), "missing Enterprise");
assert(header.includes('data-id="pricing"'), "missing Pricing");
assert(header.includes('data-id="customers"'), "missing Customers");
assert(header.includes(">Wiki<"), "missing Wiki");
assert(header.includes("Contact"), "missing Contact");
assert(header.includes("Get started"), "missing Get started");
assert(!header.includes(">About us<"), "About us still present");
assert(!header.includes(">Careers<"), "Careers still present");
assert(!header.includes(">Blog<"), "Blog still present");
assert(!header.includes(">Docs<"), "Docs still present");
console.log("header OK", header.length);

const FULLNAV = `<script id="elitechnexus-fullnav-fix">
(function () {
  var FULL = { contact: 1, deepwiki: 1, login: 1 };
  function pathOf(href) {
    try {
      var u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return null;
      return u.pathname.replace(/^\\/|\\/$/g, "");
    } catch (e) { return null; }
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    var p = pathOf(a.href);
    if (p && FULL[p]) e.stopImmediatePropagation();
  }, true);
})();
</script>`;

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
  const open = h.indexOf('<header id="site-header">');
  const open2 = open >= 0 ? open : h.lastIndexOf("<header", h.indexOf('id="site-header"'));
  const vimeo = h.indexOf('<div id="vimeo-overlay"', open2 >= 0 ? open2 : 0);
  if (open2 < 0 || vimeo < 0) {
    console.log("skip", f);
    continue;
  }
  h = h.slice(0, open2) + header + " " + h.slice(vimeo);
  if (h.includes('id="elitechnexus-fullnav-fix"')) {
    h = h.replace(/<script id="elitechnexus-fullnav-fix">[\s\S]*?<\/script>/, FULLNAV);
  } else {
    h = h.replace("</head>", FULLNAV + "</head>");
  }
  fs.writeFileSync(f, h);
  n++;
}
console.log("applied to", n, "files");
