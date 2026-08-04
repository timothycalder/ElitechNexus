import fs from "fs";
import path from "path";

const archive = fs.readFileSync("scripts/_archive-home.html", "utf8");
const start = archive.indexOf('<header id="site-header">');
const end = archive.indexOf('<div id="vimeo-overlay"', start);
if (start < 0 || end < 0) throw new Error("archive header bounds missing");
let header = archive.slice(start, end);

const EMAIL = "steven.miller@elitechnexus.com";
const LOGO = `<div class="o-icon elitechnexus-logo-wrap"><img src="/assets/images/elitechnexus-logo.svg?v=14" alt="Elitechnexus" class="elitechnexus-logo"/></div>`;

// Replace Devin logo icon block in header logo link
header = header.replace(
  /(<a id="site-header__logo" href="\/">)\s*<div class="o-icon">[\s\S]*?<\/div>\s*(<\/a>)/,
  `$1 ${LOGO} $2`
);

// Replace site-menu logo if present
header = header.replace(
  /id="site-menu__logo"[^>]*>/,
  (m) => m
);

// Wire Get started / login already may point to app.devin.ai — fix CTAs
header = header.replace(
  /href="https?:\/\/[^"]*app\.devin\.ai[^"]*"/g,
  `href="mailto:${EMAIL}"`
);
header = header.replace(
  /href="https?:\/\/[^"]*devin\.ai[^"]*"/g,
  `href="mailto:${EMAIL}"`
);

// External about/careers/blog/docs/contact/deepwiki → local or remove
function removeLiByLabel(html, label) {
  const re = new RegExp(
    `<li[^>]*>\\s*<a[^>]*>[\\s\\S]*?<span>${label}<\\/span>[\\s\\S]*?<\\/a>\\s*<\\/li>`,
    "gi"
  );
  return html.replace(re, "");
}

// Safer remove: only within known containers by rewriting dropdown list
function rebuildDropdown(html) {
  const arrow = `<div class="o-icon"> <svg viewBox="0 0 16 16"> <line x1="3.692" y1="10.386" x2="8.289" y2="5.789"></line> <polyline points="3.404,5.494 8.577,5.494 8.577,10.68 "></polyline> </svg> </div>`;
  const item = (href, label) =>
    `<li> <a class="site-header__nav-list-dropdown-box-item-inner-wrapper" href="${href}"> ${arrow} <span>${label}</span> ${arrow} </a> </li>`;

  const newBox = `<ul id="site-header__nav-list-dropdown-box"> ${item("/contact", "Contact us")} ${item("/deepwiki", "Wiki")} </ul>`;

  html = html.replace(
    /<ul id="site-header__nav-list-dropdown-box">[\s\S]*?<\/ul>/,
    newBox
  );

  // Secondary visible list items inside nav-list-02 (not dropdown) — keep Contact + Wiki only
  // Match each <li class="site-header__nav-item"> without data-id that links to about etc.
  // Replace the whole block of non-data-id items after dropdown
  const list02Start = html.indexOf('id="site-header__nav-list-02"');
  if (list02Start >= 0) {
    const buttonList = html.indexOf('id="site-header__button-list"', list02Start);
    if (buttonList > list02Start) {
      const before = html.slice(0, list02Start);
      const after = html.slice(buttonList);
      // Keep dropdown structure from original list-02 opening through dropdown container, then only Contact/Wiki items
      const chunk = html.slice(list02Start, buttonList);
      const dropStart = chunk.indexOf('id="site-header__nav-list-dropdown"');
      let rebuilt;
      if (dropStart >= 0) {
        // from start of list-02 through end of dropdown container
        const dropContainerEnd = chunk.indexOf(
          "</div> </div> </div>",
          dropStart
        );
        // Find closing of dropdown-box-container more carefully
        const afterDropBox = chunk.indexOf(
          "</ul> </div> </div>",
          dropStart
        );
        const keep =
          afterDropBox >= 0
            ? chunk.slice(0, afterDropBox + "</ul> </div> </div>".length)
            : chunk.slice(0, chunk.indexOf("</ul>") + 5);

        // Ensure dropdown box already replaced
        const keepFixed = keep.replace(
          /<ul id="site-header__nav-list-dropdown-box">[\s\S]*?<\/ul>/,
          newBox
        );

        const sideItem = (href, label) =>
          `<li class="site-header__nav-item"> <a href="${href}"> <div class="site-header__nav-item-inner-wrapper"> ${arrow} <span>${label}</span> ${arrow} </div> </a> </li>`;

        rebuilt =
          `<ul id="site-header__nav-list-02"> ` +
          keepFixed.replace(/^id="site-header__nav-list-02"[^>]*>/, "").replace(
            /^/,
            ""
          );
        // keepFixed may still start with id=...
        let dropPart = keepFixed;
        if (!dropPart.trimStart().startsWith("<ul") && dropPart.includes("site-header__nav-list-dropdown")) {
          // dropPart is from id="site-header__nav-list-dropdown"...
          dropPart = `<div id="site-header__nav-list-dropdown"` + dropPart.split('id="site-header__nav-list-dropdown"')[1];
        }
        rebuilt = `<ul id="site-header__nav-list-02"> <div id="site-header__nav-list-dropdown"${dropPart.split('id="site-header__nav-list-dropdown"')[1] || ""} ${sideItem("/contact", "Contact")} ${sideItem("/deepwiki", "Wiki")} </ul> `;
        // This is getting messy — do a cleaner approach below
      }
    }
  }
  return html;
}

// Cleaner approach: surgically edit archive header
function cleanHeader(src) {
  let h = src;

  // Logo
  h = h.replace(
    /(<a id="site-header__logo" href="\/">)\s*<div class="o-icon">[\s\S]*?<\/div>\s*(<\/a>)/,
    `$1 ${LOGO} $2`
  );

  // CTA mailto
  h = h.replace(
    /(id="site-header__button-cta"[^>]*href=")[^"]+(")/,
    `$1mailto:${EMAIL}$2`
  );
  h = h.replace(
    /(id="site-menu__btn-1"[^>]*href=")[^"]+(")/,
    `$1mailto:${EMAIL}$2`
  );

  // Login → /login
  h = h.replace(
    /(id="site-header__button-transparent"[^>]*href=")[^"]+(")/,
    `$1/login$2`
  );
  h = h.replace(/(id="site-menu__btn-2"[^>]*href=")[^"]+(")/, `$1/login$2`);

  // Dropdown box: only Contact + Wiki
  const arrow = `<div class="o-icon"> <svg viewBox="0 0 16 16"> <line x1="3.692" y1="10.386" x2="8.289" y2="5.789"></line> <polyline points="3.404,5.494 8.577,5.494 8.577,10.68 "></polyline> </svg> </div>`;
  const ddItem = (href, label) =>
    `<li> <a class="site-header__nav-list-dropdown-box-item-inner-wrapper" href="${href}"> ${arrow} <span>${label}</span> ${arrow} </a> </li>`;
  h = h.replace(
    /<ul id="site-header__nav-list-dropdown-box">[\s\S]*?<\/ul>/,
    `<ul id="site-header__nav-list-dropdown-box"> ${ddItem("/contact", "Contact us")} ${ddItem("/deepwiki", "Wiki")} </ul>`
  );

  // Remove side nav items (About us, Careers, Blog, Contact, Docs, DeepWiki) then re-add Contact + Wiki
  // These are <li class="site-header__nav-item"> without data-id after the dropdown
  h = h.replace(
    /<li class="site-header__nav-item">\s*<a href="[^"]*">\s*<div class="site-header__nav-item-inner-wrapper">[\s\S]*?<span>(?:About us|Careers|Blog|Contact|Docs|DeepWiki|Contact us)<\/span>[\s\S]*?<\/div>\s*<\/a>\s*<\/li>/g,
    ""
  );

  const sideItem = (href, label) =>
    `<li class="site-header__nav-item"> <a href="${href}"> <div class="site-header__nav-item-inner-wrapper"> ${arrow} <span>${label}</span> ${arrow} </div> </a> </li>`;

  h = h.replace(
    /(<\/div>\s*<\/div>\s*)(<\/ul>\s*<div id="site-header__button-list")/,
    `$1 ${sideItem("/contact", "Contact")} ${sideItem("/deepwiki", "Wiki")} $2`
  );

  // Mobile site-menu__nav-02: remove unwanted, keep contact + wiki
  // Find site-menu__nav-02 list
  h = h.replace(
    /<ul id="site-menu__nav-02">[\s\S]*?<\/ul>/,
    `<ul id="site-menu__nav-02"> <li> <a href="/contact"> <span>Contact</span> <span>${arrow}</span> </a> </li> <li> <a href="/deepwiki"> <span>Wiki</span> <span>${arrow}</span> </a> </li> </ul>`
  );

  // site-menu logo background if any — leave CSS overrides

  // Fix any leftover cognition/devin external links in menu
  h = h.replace(/href="https?:\/\/[^"]*cognition[^"]*"/gi, 'href="/contact"');
  h = h.replace(/href="https?:\/\/[^"]*deepwiki\.com[^"]*"/gi, 'href="/deepwiki"');

  return h;
}

header = cleanHeader(header);
fs.writeFileSync("scripts/_rebuilt-header.html", header);
console.log("header length", header.length);
console.log("has Home", header.includes(">Home<"));
console.log("has Enterprise", header.includes("Enterprise"));
console.log("has About", header.includes("About"));
console.log("has Careers", header.includes("Careers"));
console.log("has Blog", header.includes(">Blog<"));
console.log("has Docs", header.includes(">Docs<"));
console.log("has Wiki", header.includes(">Wiki<"));
console.log("has Contact", header.includes("Contact"));
console.log("has Get started", header.includes("Get started"));
console.log("has deepwiki href", header.includes('/deepwiki"'));
console.log("has elitechnexus logo", header.includes("elitechnexus-logo"));

// preview dropdown
const d = header.indexOf("nav-list-dropdown-box");
console.log(header.slice(d, d + 900));
