/**
 * Force footer CTA (title + subtitle + Contact us) visible on every page.
 */
import fs from "fs";
import path from "path";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "visual-3d") continue;
      walk(p, out);
    } else if (name === "index.html") out.push(p);
  }
  return out;
}

const SHOW_CSS = `
  /* CTA band: location + pitch + Contact us — show on ALL pages */
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
`;

let n = 0;
for (const file of walk("public")) {
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes('id="elitechnexus-footer-contact-css"')) continue;

  const before = html;
  // Replace the CTA band rules inside the style block
  html = html.replace(
    /\/\* CTA band:[\s\S]*?#site-footer \.site-footer__top-right-link\.is-enterprise \{[\s\S]*?\}\n/,
    SHOW_CSS
  );

  // Fallback: inject display rules if pattern missed
  if (
    html === before &&
    !html.includes(
      "#site-footer .site-footer__top-right-title.is-enterprise,\n  #site-footer .site-footer__top-right-link.is-enterprise"
    )
  ) {
    html = html.replace(
      /(#site-footer \.site-footer__top-right-link\.is-enterprise \{)/,
      `#site-footer .site-footer__top-right-title.is-enterprise,\n  #site-footer .site-footer__top-right-link.is-enterprise {\n    display: inline-block !important;\n  }\n  $1`
    );
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    n++;
    console.log("updated", file);
  }
}
console.log("pages", n);
