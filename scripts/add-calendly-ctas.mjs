/**
 * Wire Calendly meeting link into natural booking CTAs sitewide.
 * Keep /contact for email/phone form pages; use Calendly where people book a call.
 */
import fs from "fs";
import path from "path";

const CALENDLY = "https://calendly.com/elitech-nexus/30min";
const ROOT = "public";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "visual-3d" || name === "node_modules") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function updateHtml(html, file) {
  let n = 0;
  const before = html;

  // Homepage / fields: "Book a free interview"
  html = html.replace(
    /(<a\b[^>]*href=")\/contact("[^>]*>\s*Book a free interview\s*<\/a>)/gi,
    `$1${CALENDLY}$2`
  );
  if (html !== before) n++;

  // home-cta button
  const before2 = html;
  html = html.replace(
    /(<a\b[^>]*id="home-cta__button"[^>]*href=")[^"]+(")/i,
    `$1${CALENDLY}$2`
  );
  html = html.replace(
    /(<a\b[^>]*href=")[^"]+("[^>]*id="home-cta__button")/i,
    `$1${CALENDLY}$2`
  );
  if (html !== before2) n++;

  // Ensure Book a free interview spans get calendly + new tab
  const before3 = html;
  html = html.replace(
    /<a([^>]*)>\s*Book a free interview\s*<\/a>/gi,
    (m, attrs) => {
      let a = attrs;
      if (!/href=/i.test(a)) a += ` href="${CALENDLY}"`;
      else a = a.replace(/href="[^"]*"/i, `href="${CALENDLY}"`);
      if (!/target=/i.test(a)) a += ` target="_blank" rel="noopener noreferrer"`;
      return `<a${a}>Book a free interview</a>`;
    }
  );
  if (html !== before3) n++;

  // Footer CTA band "Contact us" → Book a meeting (Calendly)
  const before4 = html;
  html = html.replace(
    /(<a class="site-footer__top-right-link[^"]*"[^>]*href=")[^"]+(">\s*)Contact us(\s*<\/a>)/gi,
    `$1${CALENDLY}$2Book a meeting$3`
  );
  if (html !== before4) n++;

  // Also if Contact us already calendly text still wrong
  html = html.replace(
    /(<a class="site-footer__top-right-link[^"]*"[^>]*href=")\/contact(")/gi,
    `$1${CALENDLY}$2`
  );

  // Enterprise header Contact us button
  const before5 = html;
  html = html.replace(
    /(<div id="enterprise-bento__header-buttons">\s*<a[^>]*href=")[^"]+("[^>]*>\s*<span>)Contact us(<\/span>)/i,
    `$1${CALENDLY}$2Book a meeting$3`
  );
  if (html !== before5) n++;

  // Add target=_blank to calendly links missing it
  html = html.replace(
    /href="(https:\/\/calendly\.com\/elitech-nexus\/30min)"(?![^>]*target=)/gi,
    `href="$1" target="_blank" rel="noopener noreferrer"`
  );

  return { html, n, changed: html !== before || n > 0 };
}

const files = walk(ROOT);
let touched = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const { html, changed } = updateHtml(raw, file);
  if (changed && html !== raw) {
    fs.writeFileSync(file, html);
    touched++;
    console.log("updated", path.relative(ROOT, file));
  }
}

// Contact page: add a clear Schedule CTA near the top
const contactPath = path.join(ROOT, "contact/index.html");
if (fs.existsSync(contactPath)) {
  let c = fs.readFileSync(contactPath, "utf8");
  if (!c.includes("calendly.com/elitech-nexus/30min")) {
    // Prefer inserting next to Get started / hero actions
    if (c.includes('class="top__cta"')) {
      c = c.replace(
        /(<a class="top__cta"[^>]*>[\s\S]*?<\/a>)/,
        `$1\n      <a class="top__cta top__cta--calendly" href="${CALENDLY}" target="_blank" rel="noopener noreferrer">Book a meeting</a>`
      );
    } else if (c.includes("<h1")) {
      c = c.replace(
        /(<h1[\s\S]*?<\/h1>)/,
        `$1\n      <p class="calendly-cta"><a href="${CALENDLY}" target="_blank" rel="noopener noreferrer">Book a 30-minute meeting</a></p>`
      );
    }
    if (!c.includes("elitechnexus-calendly-cta-css")) {
      c = c.replace(
        "</head>",
        `<style id="elitechnexus-calendly-cta-css">
.top__cta--calendly{
  margin-left: 0.75rem;
  background: transparent !important;
  border: 1px solid rgba(255,255,255,0.35);
}
.calendly-cta{margin-top:1rem}
.calendly-cta a{
  display:inline-flex;align-items:center;gap:0.4rem;
  padding:0.7rem 1.1rem;border-radius:999px;
  background:#0b1c2c;color:#e8fff8;text-decoration:none;font-weight:600;
}
.calendly-cta a:hover{opacity:0.9}
.strip__calendly{
  display:block;margin-top:0.75rem;font-weight:600;
  color:inherit;text-decoration:underline;
}
</style></head>`
      );
    }
    // Add under phone strip as well
    if (c.includes("Contact us over phone") && !c.includes("strip__calendly")) {
      c = c.replace(
        /(<p class="strip__hint">Contact us over phone<\/p>)/,
        `$1\n        <a class="strip__calendly" href="${CALENDLY}" target="_blank" rel="noopener noreferrer">Or book a 30-min meeting</a>`
      );
    }
    fs.writeFileSync(contactPath, c);
    console.log("updated contact page with Calendly CTA");
    touched++;
  } else {
    console.log("contact already has Calendly");
  }
}

// Login page: secondary contact → also offer schedule
const loginPath = path.join(ROOT, "login/index.html");
if (fs.existsSync(loginPath)) {
  let l = fs.readFileSync(loginPath, "utf8");
  if (!l.includes("calendly.com/elitech-nexus/30min")) {
    l = l.replace(
      /(<a href="\/contact">Contact Elitechnexus<\/a>)/,
      `$1\n          <a href="${CALENDLY}" target="_blank" rel="noopener noreferrer">Book a meeting</a>`
    );
    fs.writeFileSync(loginPath, l);
    console.log("updated login page with Book a meeting");
    touched++;
  }
}

console.log("done, files touched:", touched);
console.log("calendly:", CALENDLY);
