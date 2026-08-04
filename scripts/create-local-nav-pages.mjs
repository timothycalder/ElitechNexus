/**

 * Create local About / Careers / Blog / Contact / Docs / Login / DeepWiki pages

 * and rewire nav links away from mailto / deepwiki.com.

 */

import fs from "fs";

import path from "path";



const EMAIL = "steven.miller@elitechnexus.com";

const PHONE = "+1 (339) 365-7217";

const PHONE_TEL = "+13393657217";

const TEMPLATE = "public/pricing/index.html";



const PAGES = {

  about: {

    title: "About us | Elitechnexus",

    description:

      "Elitechnexus is a global engineering bridge — Philippines HQ connecting Asia & Europe talent into US tech with proof-first placement.",

    heading: `About <span class="o-text-gradient">Elitechnexus</span>`,

    caption: "Who we are",

    body: `

      <p class="elite-page__lead">Elitechnexus LLC helps people and companies turn skills into full-time jobs, paid projects, and lasting income — connecting global talent into the US tech market with proof, preparation, and placement.</p>

      <div class="elite-page__grid">

        <div class="elite-page__card">

          <h3>Proof first</h3>

          <p>Every candidate builds evidence through live coding, architecture design, and algorithmic screening before employers commit.</p>

        </div>

        <div class="elite-page__card">

          <h3>Philippines HQ</h3>

          <p>From our Philippines headquarters we run compliant onboarding, payroll frameworks, and cross-border placement for full-time and project work.</p>

        </div>

        <div class="elite-page__card">

          <h3>Who we serve</h3>

          <p>Engineers seeking US-facing roles and companies that need vetted global talent without the usual hiring friction.</p>

        </div>

      </div>

      <p class="elite-page__cta-row"><a class="elite-page__btn" href="mailto:${EMAIL}">Contact us</a></p>

    `,

  },

  careers: {

    title: "Careers | Elitechnexus",

    description:

      "Join Elitechnexus — build the bridge between global engineering talent and US tech companies.",

    heading: `Build with <span class="o-text-gradient">us</span>`,

    caption: "Careers",

    body: `

      <p class="elite-page__lead">We're growing a team across recruiting, operations, and engineering. If you care about proof-first placement and global opportunity, we'd like to hear from you.</p>

      <div class="elite-page__grid">

        <div class="elite-page__card">

          <h3>Open roles</h3>

          <ul class="elite-page__list">

            <li>Talent Partner (Remote / Philippines)</li>

            <li>Client Success Manager</li>

            <li>Technical Screener</li>

          </ul>

          <p>Roles are rolling — send your résumé and a short note.</p>

        </div>

        <div class="elite-page__card">

          <h3>Get placed instead</h3>

          <p>Looking for a full-time role or paid project through Elitechnexus? Tell us about your skills and timeline — we'll guide you through proof-first prep.</p>

        </div>

      </div>

      <p class="elite-page__cta-row"><a class="elite-page__btn" href="mailto:${EMAIL}?subject=Careers%20%2F%20Placement">Apply or get placed</a></p>

    `,

  },

  blog: {

    title: "Blog | Elitechnexus",

    description:

      "Notes on global engineering talent, proof-first hiring, and placement into the US tech market.",

    heading: `Notes from the <span class="o-text-gradient">bridge</span>`,

    caption: "Blog",

    body: `

      <p class="elite-page__lead">Short reads on hiring, preparation, and building careers across borders.</p>

      <div class="elite-page__grid">

        <a class="elite-page__card elite-page__card--link" href="/customers">

          <h3>Customer stories</h3>

          <p>See how teams work with Elitechnexus talent on real engineering programs.</p>

        </a>

        <div class="elite-page__card">

          <h3>Proof before the offer</h3>

          <p>Why live coding, architecture reviews, and screening beat résumé-only pipelines.</p>

        </div>

        <div class="elite-page__card">

          <h3>Working across time zones</h3>

          <p>How we keep communication clear between Asia, Europe, and US engineering teams.</p>

        </div>

      </div>

      <p class="elite-page__cta-row"><a class="elite-page__btn" href="/customers">Browse customers</a></p>

    `,

  },

  contact: {

    title: "Contact | Elitechnexus",

    description:

      "Contact Elitechnexus — Philippines HQ. Email steven.miller@elitechnexus.com or call +1 (339) 365-7217.",

    heading: `Let's <span class="o-text-gradient">talk</span>`,

    caption: "Contact",

    body: `

      <p class="elite-page__lead">Whether you're hiring or looking for your next role, reach out — we'll respond with next steps.</p>

      <div class="elite-page__grid">

        <div class="elite-page__card">

          <h3>Email</h3>

          <p><a href="mailto:${EMAIL}">${EMAIL}</a></p>

        </div>

        <div class="elite-page__card">

          <h3>Phone</h3>

          <p><a href="tel:${PHONE_TEL}">${PHONE}</a></p>

        </div>

        <div class="elite-page__card">

          <h3>Headquarters</h3>

          <p>Elitechnexus LLC<br>Philippines</p>

        </div>

      </div>

      <div class="elite-page__grid">

        <a class="elite-page__card elite-page__card--link" href="mailto:${EMAIL}?subject=Hiring%20inquiry">

          <h3>I'm hiring</h3>

          <p>Tell us about roles, timelines, and the skills you need.</p>

        </a>

        <a class="elite-page__card elite-page__card--link" href="mailto:${EMAIL}?subject=Talent%20inquiry">

          <h3>I'm talent</h3>

          <p>Share your background and what kind of work you're targeting.</p>

        </a>

      </div>

    `,

  },

  docs: {

    title: "Docs | Elitechnexus",

    description:

      "How Elitechnexus works — engagement types, proof-first process, and what to expect.",

    heading: `How we <span class="o-text-gradient">work</span>`,

    caption: "Docs",

    body: `

      <p class="elite-page__lead">A lightweight guide to engagements with Elitechnexus — not a product API, a clear process overview.</p>

      <div class="elite-page__grid">

        <div class="elite-page__card">

          <h3>1. Scope</h3>

          <p>Full-time placement or paid project teams. We align on skills, seniority, and communication needs first.</p>

        </div>

        <div class="elite-page__card">

          <h3>2. Proof</h3>

          <p>Candidates complete technical vetting — live coding, architecture, and screening — so employers see evidence early.</p>

        </div>

        <div class="elite-page__card">

          <h3>3. Place</h3>

          <p>We support interviews, compliant onboarding, and ongoing communication so both sides stay aligned.</p>

        </div>

      </div>

      <p class="elite-page__cta-row">

        <a class="elite-page__btn" href="/enterprise">Enterprise</a>

        <a class="elite-page__btn elite-page__btn--ghost" href="/contact">Contact</a>

      </p>

    `,

  },

  deepwiki: {

    title: "DeepWiki | Elitechnexus",

    description:

      "Elitechnexus knowledge hub — process FAQs and placement guidance.",

    heading: `Knowledge <span class="o-text-gradient">hub</span>`,

    caption: "DeepWiki",

    body: `

      <p class="elite-page__lead">Quick answers about Elitechnexus placement, proof-first prep, and working with our team.</p>

      <div class="elite-page__grid">

        <div class="elite-page__card">

          <h3>What is proof-first?</h3>

          <p>We prioritize demonstrated skill — coding, design, and screening — over résumé claims alone.</p>

        </div>

        <div class="elite-page__card">

          <h3>Where is Elitechnexus based?</h3>

          <p>Headquarters in the Philippines, placing talent into US-facing engineering work globally.</p>

        </div>

        <div class="elite-page__card">

          <h3>Need more detail?</h3>

          <p>See <a href="/docs">Docs</a> for the engagement process, or <a href="/contact">Contact</a> us directly.</p>

        </div>

      </div>

    `,

  },

  login: {

    title: "Login | Elitechnexus",

    description: "Elitechnexus client and talent portal — request access.",

    heading: `Portal <span class="o-text-gradient">access</span>`,

    caption: "Login",

    body: `

      <p class="elite-page__lead">The Elitechnexus client and talent portal is coming soon. Request access and we'll follow up.</p>

      <div class="elite-page__grid">

        <div class="elite-page__card">

          <h3>Clients</h3>

          <p>Track candidates, interviews, and project teams in one place.</p>

        </div>

        <div class="elite-page__card">

          <h3>Talent</h3>

          <p>Manage your profile, proof tasks, and placement status.</p>

        </div>

      </div>

      <p class="elite-page__cta-row"><a class="elite-page__btn" href="mailto:${EMAIL}?subject=Portal%20access%20request">Request access</a></p>

    `,

  },

};



const PAGE_CSS = `

<style id="elitechnexus-simple-page-css">

.elite-page {

  padding: clamp(6rem, 12vw, 9rem) 0 clamp(4rem, 8vw, 6rem);

  color: #d7e3ef;

}

.elite-page__caption {

  font-size: clamp(0.75rem, 1.1vw, 0.9rem);

  letter-spacing: 0.08em;

  text-transform: uppercase;

  color: #7b92a8;

  margin: 0 0 0.75rem;

}

.elite-page__title {

  font-size: clamp(2.2rem, 5vw, 3.6rem);

  line-height: 1.1;

  font-weight: 600;

  color: #f2f6fb;

  margin: 0 0 1.25rem;

}

.elite-page__lead {

  font-size: clamp(1.05rem, 1.6vw, 1.25rem);

  line-height: 1.55;

  color: #a8bbcc;

  max-width: 52ch;

  margin: 0 0 2.5rem;

}

.elite-page__grid {

  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));

  gap: 1.25rem;

  margin: 0 0 2.5rem;

}

.elite-page__card {

  background: rgba(18, 32, 52, 0.85);

  border: 1px solid rgba(93, 120, 150, 0.25);

  border-radius: 1rem;

  padding: 1.35rem 1.4rem;

}

.elite-page__card h3 {

  margin: 0 0 0.65rem;

  color: #f2f6fb;

  font-size: 1.15rem;

}

.elite-page__card p,

.elite-page__card li {

  margin: 0;

  color: #a8bbcc;

  line-height: 1.5;

}

.elite-page__card a { color: #5eead4; }

.elite-page__card--link {

  text-decoration: none;

  transition: border-color 0.2s ease, transform 0.2s ease;

}

.elite-page__card--link:hover {

  border-color: rgba(94, 234, 212, 0.45);

  transform: translateY(-2px);

}

.elite-page__list {

  margin: 0 0 0.85rem;

  padding-left: 1.1rem;

  color: #a8bbcc;

}

.elite-page__list li { margin-bottom: 0.35rem; }

.elite-page__cta-row {

  display: flex;

  flex-wrap: wrap;

  gap: 0.85rem;

  margin: 0;

}

.elite-page__btn {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding: 0.85rem 1.4rem;

  border-radius: 999px;

  background: #e8eef8;

  color: #0b1a2e !important;

  text-decoration: none;

  font-weight: 600;

}

.elite-page__btn--ghost {

  background: transparent;

  color: #d7e3ef !important;

  border: 1px solid rgba(215, 227, 239, 0.35);

}

</style>`;



function makePageHtml(slug, cfg) {

  return `<div id="${slug}" class="page">

  <section class="elite-page o-section">

    <div class="o-container">

      <h5 class="elite-page__caption">${cfg.caption}</h5>

      <h1 class="elite-page__title">${cfg.heading}</h1>

      ${cfg.body}

    </div>

  </section>

</div>`;

}



function replaceBetween(html, startMarker, endMarker, replacement) {

  const start = html.indexOf(startMarker);

  if (start < 0) throw new Error("start not found: " + startMarker);

  const end = html.indexOf(endMarker, start + startMarker.length);

  if (end < 0) throw new Error("end not found: " + endMarker);

  return html.slice(0, start) + replacement + html.slice(end);

}



const template = fs.readFileSync(TEMPLATE, "utf8");



for (const [slug, cfg] of Object.entries(PAGES)) {

  let html = template;



  // Inject page CSS once before </head>

  if (!html.includes("elitechnexus-simple-page-css")) {

    html = html.replace("</head>", `${PAGE_CSS}</head>`);

  }



  // Meta

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${cfg.title}</title>`);

  html = html.replace(

    /<meta name="description" content="[^"]*">/,

    `<meta name="description" content="${cfg.description.replace(/"/g, "&quot;")}">`

  );

  html = html.replace(

    /<meta property="og:title" content="[^"]*">/,

    `<meta property="og:title" content="${cfg.caption}">`

  );

  html = html.replace(

    /<meta property="og:description" content="[^"]*">/,

    `<meta property="og:description" content="${cfg.description.replace(/"/g, "&quot;")}">`

  );

  html = html.replace(

    /<meta name="twitter:title" content="[^"]*">/,

    `<meta name="twitter:title" content="${cfg.caption}">`

  );

  html = html.replace(

    /<meta name="twitter:description" content="[^"]*">/,

    `<meta name="twitter:description" content="${cfg.description.replace(/"/g, "&quot;")}">`

  );

  html = html.replace(

    /<link rel="canonical" href="[^"]*">/,

    `<link rel="canonical" href="/${slug}/">`

  );



  // Replace pricing page block with new page

  // Find: <div id="pricing" class="page"> ... </div> before site-footer

  const pageStart = html.indexOf('<div id="pricing" class="page">');

  if (pageStart < 0) throw new Error("pricing page block missing");

  const footerStart = html.indexOf('<div id="site-footer"', pageStart);

  if (footerStart < 0) throw new Error("footer missing");

  // Walk back to include only the page div — footer is sibling inside pages-container

  html =

    html.slice(0, pageStart) +

    makePageHtml(slug, cfg) +

    " " +

    html.slice(footerStart);



  const outDir = path.join("public", slug);

  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, "index.html");

  fs.writeFileSync(outFile, html);

  console.log("wrote", outFile);

}



/** Rewire nav/footer links sitewide */

function walk(d, a = []) {

  for (const n of fs.readdirSync(d)) {

    if (n === "visual-3d" || n === "node_modules") continue;

    const f = path.join(d, n);

    if (fs.statSync(f).isDirectory()) walk(f, a);

    else if (n.endsWith(".html")) a.push(f);

  }

  return a;

}



const LINK_MAP = [

  // Order matters: more specific first

  {

    // About us dropdown / labels

    re: /(<a[^>]*class="site-header__nav-list-dropdown-box-item-inner-wrapper"[^>]*href=")mailto:[^"]+("[^>]*>[\s\S]*?>About us<)/g,

    to: `$1/about$2`,

  },

];



// Safer explicit replacements using known anchor text patterns in minified HTML

const REPLACEMENTS = [

  // Dropdown items with mailto before label text nearby — use targeted string replaces

  [

    `href="mailto:${EMAIL}" target="_blank"> <div class="o-icon"> <svg viewBox="0 0 16 16"> <line x1="3.692" y1="10.386" x2="8.289" y2="5.789"></line> <polyline points="3.409`,

    // too fragile — use label-based approach below

  ],

];



function rewireFile(file) {

  let h = fs.readFileSync(file, "utf8");

  const before = h;



  // Map by visible label using regex that captures href of the enclosing <a>

  const labelToPath = {

    "About us": "/about",

    Careers: "/careers",

    Blog: "/blog",

    Contact: "/contact",

    "Contact us": "/contact",

    Docs: "/docs",

    DeepWiki: "/deepwiki",

    Login: "/login",

  };



  // Replace <a ... href="OLD" ...> ... LABEL patterns for header dropdown & side links

  for (const [label, dest] of Object.entries(labelToPath)) {

    // Pattern: <a ... href="..." ...> ... >LABEL<  (label in a div or plain)

    const re = new RegExp(

      `(<a\\b[^>]*\\bhref=")([^"]+)("[^>]*>\\s*(?:<[^>]+>\\s*)*${label.replace(

        /[.*+?^${}()|[\]\\]/g,

        "\\$&"

      )}\\s*<)`,

      "g"

    );

    h = h.replace(re, (full, p1, href, p3) => {

      // Only rewrite mailto or external deepwiki / old archives — keep local paths

      if (

        href.startsWith("mailto:") ||

        href.includes("deepwiki.com") ||

        href.includes("lusion.co") ||

        href.includes("devin.ai") ||

        href.includes("cognition")

      ) {

        return p1 + dest + p3.replace(/ target="_blank"/, "");

      }

      if (href === dest) return full;

      // If it's already a non-mailto http external for these labels, rewrite

      if (/^https?:\/\//.test(href)) return p1 + dest + p3.replace(/ target="_blank"/, "");

      return full;

    });

  }



  // Login button specifically (#site-header__button-transparent)

  h = h.replace(
    /(<a[^>]*id="site-header__button-transparent"[^>]*href=")[^"]+(")/g,
    "$1/login$2"
  );

  // Get started stays mailto (CTA) — user didn't ask to change that to a page



  // DeepWiki any leftover

  h = h.replace(/href="https?:\/\/deepwiki\.com\/?"/g, 'href="/deepwiki"');

  h = h.replace(/href="https?:\/\/www\.deepwiki\.com\/?"/g, 'href="/deepwiki"');



  // Remove target=_blank from our new internal nav links

  for (const dest of Object.values(labelToPath)) {

    const re = new RegExp(

      `(<a\\b[^>]*href="${dest}"[^>]*)\\s+target="_blank"`,

      "g"

    );

    h = h.replace(re, "$1");

  }



  if (h !== before) {

    fs.writeFileSync(file, h);

    return true;

  }

  return false;

}



let n = 0;

for (const f of walk("public")) {

  if (rewireFile(f)) {

    console.log("rewired", f);

    n++;

  }

}

console.log("rewired files", n);



// Verify a few links on homepage

const home = fs.readFileSync("public/index.html", "utf8");

for (const label of ["About us", "Careers", "Blog", "Contact", "Docs", "DeepWiki", "Login"]) {

  const re = new RegExp(

    `href="([^"]+)"[^>]*>[\\s\\S]{0,400}?${label}`,

    "i"

  );

  const m = home.match(re);

  console.log(label.padEnd(12), m ? m[1] : "NOT FOUND");

}


