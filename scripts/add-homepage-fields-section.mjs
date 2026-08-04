/**
 * Homepage talent network section — professional layout, wider side margins, richer content
 */
import fs from "fs";

const CSS = `<style id="elitechnexus-fields-css">
.elite-fields{
  --ef-muted:#9bb0c4;
  --ef-soft:#7b92a8;
  --ef-line:rgba(120,150,180,.22);
  --ef-accent:#5eead4;
  --ef-ink:#f2f6fb;
  position:relative;
  z-index:2;
  width:100%;
  /* White-space margins: left + right of the whole block */
  padding:clamp(4rem,9vw,6.5rem) clamp(1.75rem,12vw,9rem);
  color:#e8f0f8;
  overflow:visible;
}
.elite-fields::before{
  content:"";
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 50% 45% at 12% 20%, rgba(56,189,248,.07), transparent 62%),
    radial-gradient(ellipse 40% 40% at 88% 75%, rgba(94,234,212,.06), transparent 58%);
}
.elite-fields > .o-container{
  position:relative;
  z-index:1;
  width:100%;
  max-width:1080px !important;
  margin-left:auto !important;
  margin-right:auto !important;
  padding-left:0 !important;
  padding-right:0 !important;
  box-sizing:border-box;
}
.elite-fields__intro{
  display:grid;
  grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);
  gap:clamp(1.75rem,4vw,3.5rem);
  align-items:end;
  margin-bottom:clamp(2.25rem,4.5vw,3.25rem);
  padding-bottom:clamp(1.75rem,3vw,2.35rem);
  border-bottom:1px solid var(--ef-line);
}
.elite-fields__eyebrow{
  margin:0 0 .75rem;
  font-size:clamp(.7rem,.95vw,.8rem);
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--ef-soft);
  font-weight:650;
}
.elite-fields__title{
  margin:0 0 1rem;
  font-size:clamp(1.85rem,3.8vw,2.85rem);
  line-height:1.12;
  font-weight:650;
  color:var(--ef-ink);
  max-width:16ch;
}
.elite-fields__lead{
  margin:0;
  max-width:48ch;
  color:var(--ef-muted);
  font-size:clamp(1.02rem,1.45vw,1.14rem);
  line-height:1.6;
}
.elite-fields__aside{
  margin:0;
  color:var(--ef-muted);
  font-size:.98rem;
  line-height:1.55;
}
.elite-fields__aside strong{
  display:block;
  color:var(--ef-ink);
  font-size:1.02rem;
  font-weight:650;
  margin-bottom:.45rem;
}
.elite-fields__aside p{margin:0 0 .85rem;}
.elite-fields__aside p:last-child{margin-bottom:0;}
.elite-fields__process{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:clamp(1rem,2.5vw,1.75rem);
  list-style:none;
  margin:0 0 clamp(2.25rem,4.5vw,3.25rem);
  padding:0;
}
.elite-fields__process li{
  border-top:1px solid var(--ef-line);
  padding-top:1rem;
}
.elite-fields__process .ef-step{
  display:block;
  margin-bottom:.4rem;
  font-size:.72rem;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ef-accent);
  font-weight:650;
}
.elite-fields__process strong{
  display:block;
  margin-bottom:.4rem;
  color:var(--ef-ink);
  font-size:1.05rem;
  font-weight:650;
}
.elite-fields__process span{
  display:block;
  color:var(--ef-muted);
  font-size:.92rem;
  line-height:1.45;
}
.elite-fields__section-label{
  margin:0 0 1rem;
  font-size:.72rem;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ef-soft);
  font-weight:650;
}
.elite-fields__grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:clamp(1rem,2vw,1.35rem) clamp(.9rem,1.8vw,1.25rem);
  list-style:none;
  margin:0 0 clamp(2.25rem,4.5vw,3.25rem);
  padding:0;
}
.elite-fields__item{
  border-top:1px solid var(--ef-line);
  padding:1.05rem 0 .2rem;
}
.elite-fields__item strong{
  display:block;
  margin:0 0 .4rem;
  font-size:1.02rem;
  font-weight:650;
  color:var(--ef-ink);
}
.elite-fields__item span{
  display:block;
  color:var(--ef-muted);
  font-size:.9rem;
  line-height:1.45;
}
.elite-fields__engage{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:clamp(1rem,2.5vw,1.75rem);
  list-style:none;
  margin:0 0 clamp(1.75rem,3.5vw,2.5rem);
  padding:clamp(1.5rem,3vw,2rem) 0 0;
  border-top:1px solid var(--ef-line);
}
.elite-fields__engage li{
  min-width:0;
}
.elite-fields__engage strong{
  display:block;
  margin:0 0 .4rem;
  color:var(--ef-ink);
  font-size:1.05rem;
  font-weight:650;
}
.elite-fields__engage span{
  display:block;
  color:var(--ef-muted);
  font-size:.92rem;
  line-height:1.45;
}
.elite-fields__note{
  margin:0;
  color:var(--ef-soft);
  font-size:.95rem;
  line-height:1.55;
  max-width:62ch;
}
.elite-fields__note a{
  color:var(--ef-accent);
  text-decoration:none;
  font-weight:650;
}
.elite-fields__note a:hover{text-decoration:underline;}
@media (max-width:980px){
  .elite-fields__intro{grid-template-columns:1fr;align-items:start;}
  .elite-fields__title{max-width:none;}
  .elite-fields__grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .elite-fields__process,.elite-fields__engage{grid-template-columns:1fr;}
}
@media (max-width:560px){
  .elite-fields{padding-left:1.25rem;padding-right:1.25rem;}
  .elite-fields__grid{grid-template-columns:1fr;}
}
</style>`;

const SECTION = `<div id="elite-fields" class="elite-fields o-section">
  <div class="o-container">
    <div class="elite-fields__intro">
      <div>
        <p class="elite-fields__eyebrow">Our talent network</p>
        <h2 class="elite-fields__title">Engineers across <span class="o-text-gradient">every specialty</span></h2>
        <p class="elite-fields__lead">Elitechnexus maintains a deep bench of vetted developers spanning product, platform, data, and infrastructure — so US and global teams can hire the right expertise without stretching one person across every problem.</p>
      </div>
      <aside class="elite-fields__aside">
        <strong>Built for real delivery</strong>
        <p>Every engineer is screened for production experience, communication clarity, and ownership — not just résumé keywords.</p>
        <p>We place talent into full-time roles, paid project work, and blended squads that already understand modern shipping standards.</p>
      </aside>
    </div>

    <p class="elite-fields__section-label">How we match talent</p>
    <ol class="elite-fields__process" aria-label="How Elitechnexus matches talent">
      <li>
        <span class="ef-step">01 — Scope</span>
        <strong>Clarify the work</strong>
        <span>Stack, seniority, timezone overlap, and delivery goals — so we never force a generic “full-stack” fit.</span>
      </li>
      <li>
        <span class="ef-step">02 — Vet</span>
        <strong>Validate proof</strong>
        <span>Portfolio review, technical screening, and reference checks focused on shipped outcomes and collaboration quality.</span>
      </li>
      <li>
        <span class="ef-step">03 — Place</span>
        <strong>Start with confidence</strong>
        <span>Introductions, onboarding support, and ongoing check-ins so both the team and the engineer succeed past week one.</span>
      </li>
    </ol>

    <p class="elite-fields__section-label">Specialties in the network</p>
    <ul class="elite-fields__grid" aria-label="Engineering fields">
      <li class="elite-fields__item">
        <strong>Frontend &amp; Full-stack</strong>
        <span>React, Next.js, TypeScript, design systems, and polished web product delivery</span>
      </li>
      <li class="elite-fields__item">
        <strong>Backend &amp; APIs</strong>
        <span>Distributed systems, services, databases, and reliable platform foundations</span>
      </li>
      <li class="elite-fields__item">
        <strong>Mobile</strong>
        <span>iOS, Android, and cross-platform apps built for App Store–ready production quality</span>
      </li>
      <li class="elite-fields__item">
        <strong>Cloud &amp; DevOps</strong>
        <span>AWS, Azure, GCP, CI/CD, observability, and scalable infrastructure</span>
      </li>
      <li class="elite-fields__item">
        <strong>Data &amp; AI/ML</strong>
        <span>Analytics pipelines, model integration, applied ML, and data platform work</span>
      </li>
      <li class="elite-fields__item">
        <strong>QA &amp; Automation</strong>
        <span>Test strategy, coverage systems, and release confidence for fast-moving teams</span>
      </li>
      <li class="elite-fields__item">
        <strong>Security &amp; Compliance</strong>
        <span>Secure engineering practices for regulated products and enterprise environments</span>
      </li>
      <li class="elite-fields__item">
        <strong>Product &amp; UX Engineering</strong>
        <span>Accessibility, interaction quality, and engineering that respects product craft</span>
      </li>
    </ul>

    <p class="elite-fields__section-label">Ways to work with us</p>
    <ul class="elite-fields__engage" aria-label="Engagement models">
      <li>
        <strong>Full-time placement</strong>
        <span>Long-term hires for core product teams who need durable ownership and clear communication across timezones.</span>
      </li>
      <li>
        <strong>Paid project delivery</strong>
        <span>Scoped engagements for migrations, feature builds, stabilizations, and deadline-critical engineering work.</span>
      </li>
      <li>
        <strong>Blended squads</strong>
        <span>Specialists who operate as one unit — frontend, backend, QA, and DevOps — without the hiring lag of building in-house.</span>
      </li>
    </ul>

    <p class="elite-fields__note">Whether you need one specialist or a ready squad, we match proven talent to the work — not the other way around. Based in the Philippines, serving teams worldwide. <a href="/contact">Talk to us about your stack</a></p>
  </div>
</div> `;

const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");

const cssRe = /<style id="elitechnexus-fields-css">[\s\S]*?<\/style>/;
if (cssRe.test(html)) html = html.replace(cssRe, CSS);
else html = html.replace("</head>", CSS + "</head>");

const anchor = '<div id="home-use-cases"';
const start = html.indexOf('<div id="elite-fields"');
const end = html.indexOf(anchor);
if (end < 0) {
  console.error("home-use-cases not found");
  process.exit(1);
}
if (start >= 0 && start < end) {
  html = html.slice(0, start) + SECTION + html.slice(end);
} else {
  html = html.slice(0, end) + SECTION + html.slice(end);
}

fs.writeFileSync(file, html);
console.log("fields section upgraded", {
  hasSection: html.includes('id="elite-fields"'),
  hasProcess: html.includes("elite-fields__process"),
  hasEngage: html.includes("elite-fields__engage"),
  beforeUseCases: html.indexOf("elite-fields") < html.indexOf("home-use-cases"),
});
