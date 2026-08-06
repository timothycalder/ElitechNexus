/**
 * Replace unnatural Features & Capabilities bento with
 * a "Meet Our People" carousel inspired by HCLTech careers,
 * adapted to Elitechnexus (jobs / projects / coaching).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const POOL = "public/assets/images/people";
const V = 73;
fs.mkdirSync(POOL, { recursive: true });

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 20000) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

async function portrait(src, dest) {
  let buf = await sharp(src)
    .resize(640, 800, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toBuffer();
  await sharp(buf).toFile(dest);
  console.log("portrait", path.basename(dest));
}

const people = [
  {
    file: "p1.jpg",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85",
    quote:
      "Elitechnexus helped me rewrite my resume around real proof, then matched me with mock interviews until I was ready. I landed a full-time Full Stack role within weeks.",
    name: "Maya R.",
    role: "Full Stack Engineer · Placed",
  },
  {
    file: "p2.jpg",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85",
    quote:
      "As a mentor, I review delivery before it ships to clients. The coaching loop is practical — not fluff — and candidates leave interviews with clearer answers and stronger confidence.",
    name: "Daniel K.",
    role: "Senior Mentor · Coaching",
  },
  {
    file: "p3.jpg",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=85",
    quote:
      "I needed paid project work while aiming for a long-term role. Elitechnexus connected me to delivery support, proposal help, and a review system that kept clients trusting my output.",
    name: "Sofia L.",
    role: "Contract Engineer · Projects",
  },
  {
    file: "p4.jpg",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=85",
    quote:
      "From the Philippines HQ bridge into US teams, the path felt real: skills proof first, then interviews, then placement. No fake promises — just structured support.",
    name: "James T.",
    role: "Cloud Engineer · Philippines → US",
  },
];

for (const p of people) {
  const raw = path.join(POOL, "raw-" + p.file);
  await download(p.url, raw);
  await portrait(raw, path.join(POOL, p.file));
}

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
        <img src="/assets/images/people/${p.file}?v=${V}" alt="${p.name}" loading="lazy">
      </div>
    </article>`
  )
  .join("\n");

const sectionHtml = `<div id="home-bento" class="o-section elite-people-section">
  <div class="o-container">
    <div class="elite-people__header">
      <div class="elite-people__heading">
        <h2 id="home-bento__title">Meet Our <span class="o-text-gradient">People</span></h2>
        <div class="elite-people__nav" aria-label="Carousel controls">
          <button type="button" class="elite-people__btn" data-people-prev aria-label="Previous">‹</button>
          <button type="button" class="elite-people__btn" data-people-next aria-label="Next">›</button>
        </div>
      </div>
      <p id="home-bento__subtitle" class="elite-people__intro">
        At Elitechnexus, we grow careers with proof first — full-time jobs, paid projects, and coaching that raises your level.
        Every day, engineers and mentors across our network turn skills into stable roles and trusted delivery. Here’s what some of them say.
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
    </p>
  </div>
</div>`;

const css = `<style id="elitechnexus-meet-people-css">
.elite-people-section{
  padding: clamp(3rem, 6vw, 5.5rem) 0 !important;
  background: linear-gradient(180deg, rgba(8,16,28,0.2), rgba(8,16,28,0.55));
}
.elite-people__header{ max-width: 920px; margin-bottom: 1.75rem; }
.elite-people__heading{
  display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;
}
.elite-people__heading h2{
  margin:0; font-size: clamp(1.8rem, 4vw, 2.75rem); line-height:1.15; color:#fff;
}
.elite-people__nav{ display:flex; gap:0.5rem; }
.elite-people__btn{
  width:2.4rem; height:2.4rem; border-radius:999px;
  border:1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.06); color:#e8fff8;
  font-size:1.35rem; line-height:1; cursor:pointer;
}
.elite-people__btn:hover{ background:rgba(110,220,200,0.18); }
.elite-people__intro{
  margin:1rem 0 0; max-width:44rem; color:rgba(220,235,245,0.82);
  font-size:1.02rem; line-height:1.55;
}
.elite-people__track-wrap{ overflow:hidden; margin-top:1.5rem; }
.elite-people__track{
  display:flex; gap:1.1rem; overflow-x:auto; scroll-snap-type:x mandatory;
  scroll-behavior:smooth; padding-bottom:0.5rem;
  -webkit-overflow-scrolling:touch; scrollbar-width:none;
}
.elite-people__track::-webkit-scrollbar{ display:none; }
.elite-people__card{
  flex:0 0 min(86vw, 560px); scroll-snap-align:start;
  display:grid; grid-template-columns: 1.15fr 0.95fr;
  min-height: 280px; border-radius:18px; overflow:hidden;
  background:#0b1624; border:1px solid rgba(110,220,200,0.18);
  box-shadow: 0 18px 40px rgba(0,0,0,0.28);
}
.elite-people__card-copy{
  padding:1.35rem 1.35rem 1.2rem; display:flex; flex-direction:column; justify-content:space-between;
  background: linear-gradient(160deg, #0d1a2a 0%, #101f31 100%);
}
.elite-people__quote-mark{
  font-size:2.6rem; line-height:1; color:rgba(110,220,200,0.75); font-family:Georgia,serif;
}
.elite-people__quote{
  margin:0.35rem 0 1rem; color:rgba(235,245,250,0.92);
  font-size:0.98rem; line-height:1.5;
}
.elite-people__person strong{ display:block; color:#fff; font-size:0.98rem; }
.elite-people__person span{ color:rgba(180,210,220,0.8); font-size:0.86rem; }
.elite-people__card-photo{ position:relative; min-height:100%; }
.elite-people__card-photo img{
  width:100%; height:100%; object-fit:cover; display:block;
}
.elite-people__progress{
  margin-top:1rem; height:4px; border-radius:99px; background:rgba(255,255,255,0.1); overflow:hidden;
}
.elite-people__progress-bar{
  height:100%; width:25%; border-radius:99px;
  background: linear-gradient(90deg, #6edcc8, #4aa8ff);
  transition: width 0.25s ease;
}
.elite-people__cta-row{ display:flex; flex-wrap:wrap; gap:0.75rem; margin-top:1.4rem; }
.elite-people__cta{
  display:inline-flex; align-items:center; justify-content:center;
  padding:0.75rem 1.2rem; border-radius:999px; text-decoration:none; font-weight:650;
  background:#9fd9ff; color:#072033;
}
.elite-people__cta--ghost{
  background:transparent; color:#e8fff8; border:1px solid rgba(255,255,255,0.28);
}
@media (max-width:720px){
  .elite-people__card{ grid-template-columns:1fr; flex-basis:min(92vw, 420px); }
  .elite-people__card-photo{ min-height:210px; }
}
</style>`;

const js = `<script id="elitechnexus-meet-people-js">
(function(){
  var track = document.getElementById("elite-people-track");
  var bar = document.getElementById("elite-people-progress");
  if (!track) return;
  var cards = track.querySelectorAll(".elite-people__card");
  function update(){
    var max = track.scrollWidth - track.clientWidth;
    var p = max > 0 ? track.scrollLeft / max : 0;
    if (bar) bar.style.width = Math.max(18, Math.min(100, p * 100 + 18)) + "%";
  }
  function step(dir){
    var card = cards[0];
    var w = card ? card.getBoundingClientRect().width + 18 : 400;
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

let html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf('<div id="home-bento"');
const end = html.indexOf('<div id="home-integration"');
if (start < 0 || end < 0) throw new Error("bento bounds missing");

html = html.slice(0, start) + sectionHtml + "\n" + html.slice(end);

if (html.includes("elitechnexus-meet-people-css")) {
  html = html.replace(
    /<style id="elitechnexus-meet-people-css">[\s\S]*?<\/style>/,
    css
  );
} else {
  html = html.replace("</head>", css + "</head>");
}

if (html.includes("elitechnexus-meet-people-js")) {
  html = html.replace(
    /<script id="elitechnexus-meet-people-js">[\s\S]*?<\/script>/,
    js
  );
} else {
  html = html.replace("</body>", js + "</body>");
}

// Hide leftover bento mockup CSS conflicts if any
html = html.replace(
  /#home-bento__item-01[\s\S]*?<\/style>/,
  (m) => (m.includes("elitechnexus-bento-hide") ? m : m)
);

fs.writeFileSync("public/index.html", html);
console.log("replaced home-bento with Meet Our People");
console.log("people photos in", POOL);
