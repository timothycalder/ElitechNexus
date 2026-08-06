/**
 * Meet Our People — professional nav, larger cards, 10 real Unsplash portraits
 * (natural photos of Asian professionals; not AI-generated).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const POOL = "public/assets/images/people";
const V = 80;
fs.mkdirSync(POOL, { recursive: true });

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest), (fs.statSync(dest).size / 1024).toFixed(0) + "kb");
}

async function portrait(src, dest) {
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90 })
    .toFile(dest);
  console.log("portrait", path.basename(dest));
}

/** Real Unsplash photographs tagged/shown as Asian professionals */
const people = [
  {
    file: "p1.jpg",
    url: "https://images.unsplash.com/photo-1544168190-79c17527004f?auto=format&fit=crop&w=900&q=85",
    quote:
      "Elitechnexus helped me rebuild my resume around real proof, then matched me with mock interviews until I was ready. I landed a full-time Full Stack role within weeks.",
    name: "Ana Reyes",
    role: "Full Stack Engineer · Placed",
  },
  {
    file: "p2.jpg",
    url: "https://images.unsplash.com/photo-1720501828093-c792c10e3f0b?auto=format&fit=crop&w=900&q=85",
    quote:
      "As a mentor, I review delivery before it ships to clients. The coaching loop is practical — not fluff — and candidates leave interviews with clearer answers and stronger confidence.",
    name: "Miguel Santos",
    role: "Senior Mentor · Coaching",
  },
  {
    file: "p3.jpg",
    url: "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?auto=format&fit=crop&w=900&q=85",
    quote:
      "I needed paid project work while aiming for a long-term role. Elitechnexus connected me to delivery support, proposal help, and a review system that kept clients trusting my output.",
    name: "Isabella Cruz",
    role: "Contract Engineer · Projects",
  },
  {
    file: "p4.jpg",
    url: "https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?auto=format&fit=crop&w=900&q=85",
    quote:
      "From our Philippines HQ into US teams, the path felt real: skills proof first, then interviews, then placement. No fake promises — just structured support.",
    name: "Carlo Mendoza",
    role: "Cloud Engineer · Philippines → US",
  },
  {
    file: "p5.jpg",
    url: "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?auto=format&fit=crop&w=900&q=85",
    quote:
      "The daily application rhythm and interview practice changed everything. I stopped guessing what hiring managers wanted and started showing proof of what I can ship.",
    name: "Jasmine Lim",
    role: "QA Automation · Placed",
  },
  {
    file: "p6.jpg",
    url: "https://images.unsplash.com/photo-1701980889802-55ff39e2e973?auto=format&fit=crop&w=900&q=85",
    quote:
      "I came in with strong backend skills but weak interview stories. Elitechnexus turned my projects into clear narratives — and the offers followed.",
    name: "Paolo Garcia",
    role: "Backend Engineer · Placed",
  },
  {
    file: "p7.jpg",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85",
    quote:
      "Between mentoring juniors and shipping client work, the community kept me accountable. Side income became steady project income.",
    name: "Andrea Villanueva",
    role: "Product Engineer · Projects",
  },
  {
    file: "p8.jpg",
    url: "https://images.unsplash.com/photo-1543132220-3ec99c6094dc?auto=format&fit=crop&w=900&q=85",
    quote:
      "DevOps interviews are tough. Practice rounds with real feedback helped me explain systems calmly — I moved into a remote US role from Manila.",
    name: "Kenji Nakamura",
    role: "DevOps Engineer · Remote US",
  },
  {
    file: "p9.jpg",
    url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=85",
    quote:
      "Portfolio polish and proof-first coaching made my data work visible. Recruiters finally understood the impact behind my notebooks and pipelines.",
    name: "Patricia Ong",
    role: "Data Engineer · Placed",
  },
  {
    file: "p10.jpg",
    url: "https://images.unsplash.com/photo-1720501827999-43d3fb5075f6?auto=format&fit=crop&w=900&q=85",
    quote:
      "I balanced freelance apps with full-time search. Elitechnexus gave me structure — proposals, reviews, and interview reps — until both tracks paid off.",
    name: "Rico Dela Cruz",
    role: "Mobile Engineer · Freelance + FT",
  },
];

for (const p of people) {
  const raw = path.join(POOL, "raw-" + p.file);
  await download(p.url, raw);
  await portrait(raw, path.join(POOL, p.file));
}

const arrowPrev = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;
const arrowNext = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;

const cardsHtml = people
  .map(
    (p, i) => `
    <article class="elite-people__card" data-idx="${i}">
      <div class="elite-people__card-copy">
        <div class="elite-people__quote-mark" aria-hidden="true">“</div>
        <p class="elite-people__quote">${p.quote}</p>
        <div class="elite-people__person">
          <strong>${p.name}</strong>
          <span>${p.role}</span>
        </div>
      </div>
      <div class="elite-people__card-photo">
        <img src="/assets/images/people/${p.file}?v=${V}" alt="${p.name}" width="360" height="450" loading="lazy">
      </div>
    </article>`
  )
  .join("\n");

const sectionInner = `
    <div class="elite-people__header">
      <div class="elite-people__heading">
        <h2 id="home-bento__title">Meet Our <span class="o-text-gradient">People</span></h2>
        <div class="elite-people__nav" role="group" aria-label="Carousel controls">
          <button type="button" class="elite-people__btn" data-people-prev aria-label="Previous person">${arrowPrev}</button>
          <button type="button" class="elite-people__btn" data-people-next aria-label="Next person">${arrowNext}</button>
        </div>
      </div>
      <p id="home-bento__subtitle" class="elite-people__intro">
        At Elitechnexus, we grow careers with proof first — full-time jobs, paid projects, and coaching that raises your level.
        Engineers and mentors across our Philippines network turn skills into stable roles and trusted delivery. Here’s what some of them say.
      </p>
    </div>
    <div class="elite-people__track-wrap">
      <div class="elite-people__track" id="elite-people-track">
        ${cardsHtml}
      </div>
    </div>
    <div class="elite-people__progress" aria-hidden="true">
      <div class="elite-people__progress-bar" id="elite-people-progress"></div>
    </div>
    <p class="elite-people__cta-row">
      <a class="elite-people__cta" href="/login#login">Join Elitechnexus</a>
      <a class="elite-people__cta elite-people__cta--ghost" href="https://calendly.com/elitech-nexus/30min" target="_blank" rel="noopener noreferrer">Book a meeting</a>
    </p>`;

const css = `<style id="elitechnexus-meet-people-css">
.elite-people-section{
  padding: clamp(3.25rem, 7vw, 6rem) 0 !important;
  background: linear-gradient(180deg, rgba(8,16,28,0.2), rgba(8,16,28,0.55));
}
.elite-people__header{ max-width: 980px; margin-bottom: 2rem; }
.elite-people__heading{
  display:flex; align-items:center; justify-content:space-between; gap:1.25rem; flex-wrap:wrap;
}
.elite-people__heading h2{
  margin:0; font-size: clamp(2rem, 4.4vw, 3.1rem); line-height:1.12; color:#fff; letter-spacing:-0.02em;
}
.elite-people__nav{
  display:inline-flex; align-items:center; gap:0;
  padding:0.28rem;
  border-radius:14px;
  border:1px solid rgba(159,217,255,0.28);
  background: linear-gradient(180deg, rgba(18,32,48,0.95), rgba(10,20,34,0.92));
  box-shadow: 0 10px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
}
.elite-people__btn{
  width:2.85rem; height:2.85rem; border-radius:10px;
  border:0; margin:0; padding:0;
  display:inline-flex; align-items:center; justify-content:center;
  background: transparent; color:#d7eef8;
  cursor:pointer; transition: background .18s ease, color .18s ease, transform .18s ease;
}
.elite-people__btn + .elite-people__btn{
  border-left:1px solid rgba(255,255,255,0.1);
  margin-left:0.15rem; padding-left:0.15rem;
}
.elite-people__btn:hover{
  background: rgba(110,220,200,0.16); color:#fff;
}
.elite-people__btn:active{ transform: scale(0.96); }
.elite-people__btn:focus-visible{
  outline:2px solid rgba(110,220,200,0.7); outline-offset:2px;
}
.elite-people__btn svg{ display:block; }
.elite-people__intro{
  margin:1.15rem 0 0; max-width:48rem; color:rgba(220,235,245,0.86);
  font-size: clamp(1.05rem, 1.5vw, 1.18rem); line-height:1.6;
}
.elite-people__track-wrap{ overflow:hidden; margin-top:1.75rem; }
.elite-people__track{
  display:flex; gap:1.35rem; overflow-x:auto; scroll-snap-type:x mandatory;
  scroll-behavior:smooth; padding-bottom:0.65rem;
  -webkit-overflow-scrolling:touch; scrollbar-width:none;
}
.elite-people__track::-webkit-scrollbar{ display:none; }
.elite-people__card{
  flex:0 0 min(92vw, 740px); scroll-snap-align:start;
  display:grid; grid-template-columns: 1.2fr 1fr;
  min-height: 380px; border-radius:22px; overflow:hidden;
  background:#0b1624; border:1px solid rgba(110,220,200,0.2);
  box-shadow: 0 22px 48px rgba(0,0,0,0.32);
}
.elite-people__card-copy{
  padding: clamp(1.5rem, 2.4vw, 2.15rem);
  display:flex; flex-direction:column; justify-content:space-between; gap:1rem;
  background: linear-gradient(160deg, #0d1a2a 0%, #101f31 100%);
}
.elite-people__quote-mark{
  font-size:3.2rem; line-height:0.85; color:rgba(110,220,200,0.78); font-family:Georgia,serif;
}
.elite-people__quote{
  margin:0.15rem 0 0; color:rgba(235,245,250,0.95);
  font-size: clamp(1.08rem, 1.55vw, 1.28rem); line-height:1.55;
}
.elite-people__person strong{
  display:block; color:#fff;
  font-size: clamp(1.12rem, 1.5vw, 1.28rem); font-weight:700; letter-spacing:-0.01em;
}
.elite-people__person span{
  display:block; margin-top:0.28rem;
  color:rgba(180,210,220,0.88); font-size: clamp(0.95rem, 1.2vw, 1.05rem);
}
.elite-people__card-photo{ position:relative; min-height:100%; background:#0a1420; }
.elite-people__card-photo img{
  width:100%; height:100%; object-fit:cover; display:block;
}
.elite-people__progress{
  margin-top:1.15rem; height:5px; border-radius:99px; background:rgba(255,255,255,0.1); overflow:hidden;
}
.elite-people__progress-bar{
  height:100%; width:12%; border-radius:99px;
  background: linear-gradient(90deg, #6edcc8, #4aa8ff);
  transition: width 0.25s ease;
}
.elite-people__cta-row{ display:flex; flex-wrap:wrap; gap:0.85rem; margin-top:1.65rem; }
.elite-people__cta{
  display:inline-flex; align-items:center; justify-content:center;
  padding:0.85rem 1.35rem; border-radius:999px; text-decoration:none; font-weight:650;
  background:#9fd9ff; color:#072033; font-size:1.02rem;
}
.elite-people__cta--ghost{
  background:transparent; color:#e8fff8; border:1px solid rgba(255,255,255,0.28);
}
@media (max-width:820px){
  .elite-people__card{ grid-template-columns:1fr; flex-basis:min(94vw, 520px); min-height:0; }
  .elite-people__card-photo{ min-height:260px; }
  .elite-people__btn{ width:2.65rem; height:2.65rem; }
}
</style>`;

let html = fs.readFileSync("public/index.html", "utf8");

// Replace CSS block
html = html.replace(
  /<style id="elitechnexus-meet-people-css">[\s\S]*?<\/style>/,
  css
);

// Replace section body inside #home-bento (after stub, before closing containers)
const secStart = html.indexOf('<div id="home-bento"');
const secEnd = html.indexOf('<div id="home-integration"');
if (secStart < 0 || secEnd < 0) throw new Error("section bounds missing");

const before = html.slice(0, secStart);
const after = html.slice(secEnd);

// Keep bento stub that lives just before people header — locate stub inside old section
const oldSec = html.slice(secStart, secEnd);
const stubMatch = oldSec.match(
  /<!-- home-bento js stubs[\s\S]*?<\/div>\s*<\/div>\s*/
);
const stub = stubMatch ? stubMatch[0] : `<!-- home-bento js stubs (required by hoisted HomeBento; keep hidden) -->
<div class="home-bento__item" id="elite-bento-js-stub" aria-hidden="true">
  <div id="home-bento__item-image-main-wrapper-dot"></div>
  <div id="home-bento__item-01-visual-wrapper">
    <button type="button" id="home-bento__item-01-visual-button-success" data-id="success" tabindex="-1"></button>
  </div>
</div>
`;

const newSection = `<div id="home-bento" class="o-section elite-people-section">
  <div class="o-container">
${stub}
${sectionInner}
  </div>
</div>
`;

html = before + newSection + after;

// Ensure JS still present
if (!html.includes('id="elitechnexus-meet-people-js"')) {
  const js = `<script id="elitechnexus-meet-people-js">
(function(){
  var track = document.getElementById("elite-people-track");
  var bar = document.getElementById("elite-people-progress");
  if (!track) return;
  var cards = track.querySelectorAll(".elite-people__card");
  function update(){
    var max = track.scrollWidth - track.clientWidth;
    var p = max > 0 ? track.scrollLeft / max : 0;
    if (bar) bar.style.width = Math.max(10, Math.min(100, p * 100 + 10)) + "%";
  }
  function step(dir){
    var card = cards[0];
    var w = card ? card.getBoundingClientRect().width + 22 : 520;
    track.scrollBy({ left: dir * w, behavior: "smooth" });
  }
  document.querySelectorAll("[data-people-prev]").forEach(function(b){
    b.addEventListener("click", function(){ step(-1); });
  });
  document.querySelectorAll("[data-people-next]").forEach(function(b){
    b.addEventListener("click", function(){ step(1); });
  });
  track.addEventListener("scroll", update, { passive:true });
  update();
})();
</script>`;
  html = html.replace("</body>", js + "\n</body>");
} else {
  // bump step gap for larger cards
  html = html.replace(
    /var w = card \? card\.getBoundingClientRect\(\)\.width \+ 18 : 400;/,
    "var w = card ? card.getBoundingClientRect().width + 22 : 520;"
  );
  html = html.replace(
    /Math\.max\(18, Math\.min\(100, p \* 100 \+ 18\)\)/,
    "Math.max(10, Math.min(100, p * 100 + 10))"
  );
}

fs.writeFileSync("public/index.html", html);
console.log("updated meet-people: 10 cards, professional nav, larger layout");
