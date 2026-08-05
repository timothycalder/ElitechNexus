/**
 * Deduplicate footer contact across pages:
 * - CTA band keeps location + short pitch + single Contact us link (no email/phone)
 * - Hide legacy white contact strip (#site-footer__bottom)
 * - Dark legal footer is the single source for email + phone
 */
import fs from "fs";
import path from "path";

const ROOT = "public";
const EMAIL = "steven.miller@elitechnexus.com";
const PHONE = "+1 (339) 365-7217";
const PHONE_TEL = "+13393657217";

const CONTACT_CSS = `<style id="elitechnexus-footer-contact-css">
  /* Hide legacy duplicate contact strip */
  #site-footer__bottom { display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }

  /* Breathing room after CTA once the duplicate strip is gone */
  #site-footer__top {
    padding-bottom: 2.5rem;
  }

  /* CTA band: location + pitch + Contact us — show on ALL pages (not only enterprise) */
  #site-footer__top-right-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  #site-footer__top-right-subtitle {
    max-width: 28rem;
    line-height: 1.55;
    margin-top: 0 !important;
  }
  /* Original theme hides .is-enterprise title/link on non-enterprise pages */
  #site-footer .site-footer__top-right-title.is-enterprise,
  #site-footer .site-footer__top-right-link.is-enterprise {
    display: inline-block !important;
  }
  #site-footer .site-footer__top-right-link.is-enterprise {
    align-self: flex-start;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    margin-top: 0.25rem !important;
  }

  /* Legal footer = single source of contact truth */
  #elite-legal-footer {
    margin-top: 0;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .elite-legal-footer__email,
  .elite-legal-footer__phone {
    display: block;
    margin: 0.35rem 0 0;
    font-size: 0.95rem;
    letter-spacing: 0.01em;
    color: rgba(255,255,255,0.88);
    text-decoration: none;
  }
  .elite-legal-footer__email:hover,
  .elite-legal-footer__phone:hover {
    color: #7dd3fc;
  }
  .elite-legal-footer__copy {
    margin-top: 1.1rem;
    opacity: 0.72;
    font-size: 0.82rem;
  }
  .elite-legal-footer__socials {
    margin-top: 1.15rem;
  }
</style>`;

const TOP_RIGHT = `<div id="site-footer__top-right"> <div id="site-footer__top-right-wrapper"> <h4 class="site-footer__top-right-title is-enterprise">Based in the Philippines</h4> <p id="site-footer__top-right-subtitle">Full-time jobs, paid projects, and side income — with proof first. Reach our team anytime.</p> <a class="site-footer__top-right-link is-enterprise" href="/contact">Contact us</a> </div> </div>`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name === "index.html") out.push(p);
  }
  return out;
}

/** Find end index (after closing tag) of an element starting at openIdx pointing at '<' of the open tag. */
function findElementEnd(html, openIdx) {
  const tagMatch = html.slice(openIdx).match(/^<([a-zA-Z0-9-]+)/);
  if (!tagMatch) return -1;
  const tag = tagMatch[1];
  let i = openIdx;
  let depth = 0;
  const openRe = new RegExp(`<${tag}(\\s|>)`, "gi");
  const closeRe = new RegExp(`</${tag}>`, "gi");
  // Scan forward with a simple tokenizer for this tag
  while (i < html.length) {
    openRe.lastIndex = i;
    closeRe.lastIndex = i;
    const o = openRe.exec(html);
    const c = closeRe.exec(html);
    if (!c) return -1;
    if (o && o.index < c.index) {
      depth++;
      i = o.index + 1;
    } else {
      depth--;
      i = c.index + c[0].length;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function replaceElementById(html, id, replacement) {
  const needle = `id="${id}"`;
  const idIdx = html.indexOf(needle);
  if (idIdx < 0) return { html, changed: false };
  const openIdx = html.lastIndexOf("<", idIdx);
  const end = findElementEnd(html, openIdx);
  if (end < 0) return { html, changed: false };
  return {
    html: html.slice(0, openIdx) + replacement + html.slice(end),
    changed: true,
  };
}

function patch(html) {
  if (!html.includes('id="site-footer"')) return null;

  let next = html;
  let changed = false;

  if (next.includes('id="site-footer__top-right"')) {
    const r = replaceElementById(next, "site-footer__top-right", TOP_RIGHT);
    if (r.changed) {
      next = r.html;
      changed = true;
    }
  }

  if (next.includes('id="site-footer__bottom"')) {
    const r = replaceElementById(
      next,
      "site-footer__bottom",
      `<div id="site-footer__bottom" style="display:none!important" aria-hidden="true"></div>`
    );
    if (r.changed) {
      next = r.html;
      changed = true;
    }
  }

  // Clean legal footer labels (email + phone once, no "Email:" / "Phone:" prefixes)
  if (next.includes("elite-legal-footer__email")) {
    const before = next;
    next = next.replace(
      /<a class="elite-legal-footer__email"[^>]*>[\s\S]*?<\/a>/,
      `<a class="elite-legal-footer__email" href="mailto:${EMAIL}">${EMAIL}</a>`
    );
    next = next.replace(
      /<a class="elite-legal-footer__phone"[^>]*>[\s\S]*?<\/a>/,
      `<a class="elite-legal-footer__phone" href="tel:${PHONE_TEL}">${PHONE}</a>`
    );
    if (next !== before) changed = true;
  }

  if (next.includes('id="elitechnexus-footer-contact-css"')) {
    const before = next;
    next = next.replace(
      /<style id="elitechnexus-footer-contact-css">[\s\S]*?<\/style>/,
      CONTACT_CSS
    );
    if (next !== before) changed = true;
  } else if (next.includes("</head>")) {
    next = next.replace("</head>", `${CONTACT_CSS}</head>`);
    changed = true;
  }

  return changed ? next : null;
}

const files = walk(ROOT);
let n = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const out = patch(html);
  if (out) {
    fs.writeFileSync(file, out);
    n++;
    console.log("patched", file);
  }
}
console.log(`Done. Updated ${n} pages.`);
