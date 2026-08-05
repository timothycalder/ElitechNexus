/**
 * Inject Elitechnexus black legal/contact footer (Zippia-style layout, brand-fit).
 * Social icons present; href="#" placeholders until real links are provided.
 */
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

const CSS = `<style id="elitechnexus-legal-footer-css">
#elite-legal-footer{
  background:#070b14;
  color:#e8eef8;
  padding:clamp(2.5rem,5vw,3.75rem) 0 clamp(2rem,4vw,2.75rem);
  border-top:1px solid rgba(120,180,220,.12);
  position:relative;
  z-index:5;
}
#elite-legal-footer .elite-legal-footer__grid{
  display:grid;
  grid-template-columns:1.4fr 1fr 1fr 1fr;
  gap:clamp(1.5rem,3vw,2.75rem);
  align-items:start;
}
@media (max-width:960px){
  #elite-legal-footer .elite-legal-footer__grid{
    grid-template-columns:1fr 1fr;
  }
}
@media (max-width:640px){
  #elite-legal-footer .elite-legal-footer__grid{
    grid-template-columns:1fr;
  }
}
#elite-legal-footer .elite-legal-footer__brand-row{
  display:flex;
  align-items:center;
  gap:.75rem;
  margin-bottom:1rem;
}
#elite-legal-footer .elite-legal-footer__logo{
  width:2.25rem;
  height:2.25rem;
  object-fit:contain;
  display:block;
}
#elite-legal-footer .elite-legal-footer__brand-name{
  font-size:1.05rem;
  font-weight:650;
  letter-spacing:.01em;
  color:#fff;
}
#elite-legal-footer .elite-legal-footer__email,
#elite-legal-footer .elite-legal-footer__phone{
  display:block;
  color:rgba(232,238,248,.78);
  text-decoration:none;
  font-size:.92rem;
  line-height:1.55;
}
#elite-legal-footer .elite-legal-footer__email:hover,
#elite-legal-footer .elite-legal-footer__phone:hover{
  color:#7ee0d0;
}
#elite-legal-footer .elite-legal-footer__copy{
  margin:.85rem 0 1.15rem;
  color:rgba(232,238,248,.48);
  font-size:.8rem;
}
#elite-legal-footer .elite-legal-footer__socials{
  display:flex;
  flex-wrap:wrap;
  gap:.55rem;
}
#elite-legal-footer .elite-social{
  width:2.15rem;
  height:2.15rem;
  border-radius:.55rem;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.04);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  color:#e8eef8;
  text-decoration:none;
  transition:background .2s ease,border-color .2s ease,color .2s ease,transform .2s ease;
}
#elite-legal-footer .elite-social:hover{
  background:rgba(90,220,200,.14);
  border-color:rgba(90,220,200,.45);
  color:#9af0e2;
  transform:translateY(-1px);
}
#elite-legal-footer .elite-social svg{
  width:1.05rem;
  height:1.05rem;
  fill:currentColor;
}
#elite-legal-footer .elite-legal-footer__col-title{
  margin:0 0 .85rem;
  font-size:.95rem;
  font-weight:650;
  color:#fff;
}
#elite-legal-footer .elite-legal-footer__links{
  list-style:none;
  margin:0;
  padding:0;
  display:grid;
  gap:.55rem;
}
#elite-legal-footer .elite-legal-footer__links a{
  color:rgba(232,238,248,.72);
  text-decoration:none;
  font-size:.9rem;
}
#elite-legal-footer .elite-legal-footer__links a:hover{
  color:#7ee0d0;
}
#elite-legal-footer .elite-legal-footer__tagline-wrap{
  text-align:left;
}
#elite-legal-footer .elite-legal-footer__badge{
  width:5.5rem;
  height:5.5rem;
  border-radius:50%;
  background:radial-gradient(circle at 35% 30%,rgba(110,230,210,.35),rgba(20,40,70,.9) 55%,#0a1524);
  border:1px solid rgba(120,200,220,.25);
  display:flex;
  align-items:center;
  justify-content:center;
  margin-bottom:.85rem;
}
#elite-legal-footer .elite-legal-footer__badge img{
  width:2.6rem;
  height:2.6rem;
  object-fit:contain;
}
#elite-legal-footer .elite-legal-footer__tagline-name{
  font-weight:700;
  font-size:1.05rem;
  color:#fff;
  margin:0 0 .2rem;
}
#elite-legal-footer .elite-legal-footer__tagline{
  margin:0;
  color:rgba(232,238,248,.55);
  font-size:.88rem;
  line-height:1.4;
}
</style>`;

const ICONS = {
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 9.5H3.7V20h2.8V9.5zM5.1 4C4.1 4 3.3 4.8 3.3 5.8S4.1 7.6 5.1 7.6 6.9 6.8 6.9 5.8 6.1 4 5.1 4zM20.3 20h-2.8v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H10.8V9.5h2.7v1.4h.1c.4-.7 1.3-1.5 2.7-1.5 2.9 0 3.4 1.9 3.4 4.4V20z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C18.5 5.2 12 5.2 12 5.2s-6.5 0-8.8.5c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 2.3.5 8.8.5 8.8.5s6.5 0 8.8-.5c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7zM9.8 15.5v-6.6l6 3.3-6 3.3z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.2 3H21l-6.5 7.4L22 21h-6.2l-4.9-6.4L5.4 21H2.6l7-8L2 3h6.3l4.4 5.8L18.2 3zm-1.1 16.2h1.7L7 4.7H5.2l11.9 14.5z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 2.8A4.2 4.2 0 1 1 7.8 12 4.2 4.2 0 0 1 12 7.8zm0 2A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zM17.4 6.4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 8.2a6.4 6.4 0 0 1-4-1.5v7.2a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 1 0 2 2.8V3h2.8a6.4 6.4 0 0 0 4 3.8v1.4z"/></svg>`,
  discord: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.3 5.2A16.5 16.5 0 0 0 15.2 4l-.3.6c1.5.4 2.3.9 2.3.9s-2.2-1.2-5.2-1.2-5.2 1.2-5.2 1.2 1-.6 2.5-.9L9 4A16.5 16.5 0 0 0 4.7 5.2C2.5 8.5 1.9 11.7 2.1 14.9c1.6 1.2 3.2 1.9 3.2 1.9l.7-1c-.8-.3-1.5-.7-2.1-1.2 1.6 1.2 3.8 2 6.1 2.1 2.3-.1 4.5-.9 6.1-2.1-.6.5-1.3.9-2.1 1.2l.7 1s1.6-.7 3.2-1.9c.2-3.2-.4-6.4-2.6-9.7zM9.3 13.5c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6zm5.4 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6z"/></svg>`,
};

function social(name, label) {
  return `<a class="elite-social" href="#" data-social="${name}" aria-label="${label} (link coming soon)" title="${label} — link coming soon" onclick="return false;">${ICONS[name]}</a>`;
}

const HTML = `<div id="elite-legal-footer" aria-label="Site contact and links">
  <div class="o-container">
    <div class="elite-legal-footer__grid">
      <div class="elite-legal-footer__col elite-legal-footer__col--brand">
        <div class="elite-legal-footer__brand-row">
          <img class="elite-legal-footer__logo" src="/assets/images/elitechnexus-logo.svg?v=14" alt="Elitechnexus">
          <span class="elite-legal-footer__brand-name">Elitechnexus LLC</span>
        </div>
        <a class="elite-legal-footer__email" href="mailto:steven.miller@elitechnexus.com">steven.miller@elitechnexus.com</a>
        <a class="elite-legal-footer__phone" href="tel:+13393657217">+1 (339) 365-7217</a>
        <p class="elite-legal-footer__copy">Copyright © ${new Date().getFullYear()} Elitechnexus LLC. Based in the Philippines.</p>
        <div class="elite-legal-footer__socials">
          ${social("facebook", "Facebook")}
          ${social("linkedin", "LinkedIn")}
          ${social("youtube", "YouTube")}
          ${social("x", "X")}
          ${social("instagram", "Instagram")}
          ${social("tiktok", "TikTok")}
          ${social("discord", "Discord")}
        </div>
      </div>
      <div class="elite-legal-footer__col">
        <h4 class="elite-legal-footer__col-title">Elitechnexus</h4>
        <ul class="elite-legal-footer__links">
          <li><a href="/about">About us</a></li>
          <li><a href="/enterprise">Enterprise</a></li>
          <li><a href="/customers">Customers</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/contact">Contact us</a></li>
        </ul>
      </div>
      <div class="elite-legal-footer__col">
        <h4 class="elite-legal-footer__col-title">Careers &amp; Jobs</h4>
        <ul class="elite-legal-footer__links">
          <li><a href="/careers">Careers</a></li>
          <li><a href="/login">Full-time jobs</a></li>
          <li><a href="/login">Paid projects</a></li>
          <li><a href="/login">Interview coaching</a></li>
          <li><a href="/docs">Learning &amp; docs</a></li>
        </ul>
      </div>
      <div class="elite-legal-footer__col elite-legal-footer__tagline-wrap">
        <div class="elite-legal-footer__badge" aria-hidden="true">
          <img src="/assets/images/elitechnexus-logo.svg?v=14" alt="">
        </div>
        <p class="elite-legal-footer__tagline-name">Elitechnexus</p>
        <p class="elite-legal-footer__tagline">jobs, projects &amp; income — with proof first</p>
      </div>
    </div>
  </div>
</div>`;

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes('id="site-footer"')) continue;
  const before = h;

  if (h.includes("elitechnexus-legal-footer-css")) {
    h = h.replace(
      /<style id="elitechnexus-legal-footer-css">[\s\S]*?<\/style>/,
      CSS
    );
  } else {
    h = h.replace("</head>", CSS + "\n</head>");
  }

  // Remove previous inject if re-running (balanced from open tag to matching close of root)
  if (h.includes('id="elite-legal-footer"')) {
    const start = h.indexOf('<div id="elite-legal-footer"');
    if (start >= 0) {
      let depth = 0;
      let i = start;
      while (i < h.length) {
        if (h.startsWith("<div", i)) {
          depth++;
          i = h.indexOf(">", i) + 1;
          continue;
        }
        if (h.startsWith("</div>", i)) {
          depth--;
          i += 6;
          if (depth === 0) {
            h = h.slice(0, start) + h.slice(i);
            break;
          }
          continue;
        }
        i++;
      }
    }
  }

  // Insert after site-footer block (before scroll-indicator if present)
  if (h.includes('id="scroll-indicator"')) {
    h = h.replace(/(<div id="scroll-indicator")/, HTML + "\n$1");
  } else if (h.includes("</body>")) {
    h = h.replace("</body>", HTML + "\n</body>");
  }

  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
    console.log("updated", f);
  }
}
console.log("done", n);
