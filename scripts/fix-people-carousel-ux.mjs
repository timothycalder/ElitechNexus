/**
 * Meet Our People UX: side arrow buttons + mouse drag scroll
 */
import fs from "fs";

const arrowPrev = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;
const arrowNext = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;

const css = `<style id="elitechnexus-meet-people-css">
.elite-people-section{
  padding: clamp(3.25rem, 7vw, 6rem) 0 !important;
  background: linear-gradient(180deg, rgba(8,16,28,0.2), rgba(8,16,28,0.55));
}
.elite-people__header{ max-width: 980px; margin-bottom: 2rem; }
.elite-people__heading{
  display:flex; align-items:center; justify-content:flex-start; gap:1.25rem; flex-wrap:wrap;
}
.elite-people__heading h2{
  margin:0; font-size: clamp(2rem, 4.4vw, 3.1rem); line-height:1.12; color:#fff; letter-spacing:-0.02em;
}
.elite-people__intro{
  margin:1.15rem 0 0; max-width:48rem; color:rgba(220,235,245,0.86);
  font-size: clamp(1.05rem, 1.5vw, 1.18rem); line-height:1.6;
}
.elite-people__stage{
  position:relative;
  margin-top:1.75rem;
  padding: 0 clamp(2.75rem, 4vw, 3.5rem);
}
.elite-people__track-wrap{
  overflow:hidden;
}
.elite-people__track{
  display:flex; gap:1.35rem; overflow-x:auto; scroll-snap-type:x mandatory;
  scroll-behavior:smooth; padding-bottom:0.65rem;
  -webkit-overflow-scrolling:touch; scrollbar-width:none;
  cursor: grab; user-select:none;
  touch-action: pan-y;
}
.elite-people__track.is-dragging{
  cursor: grabbing;
  scroll-behavior:auto;
  scroll-snap-type:none;
}
.elite-people__track.is-dragging .elite-people__card,
.elite-people__track.is-dragging img{
  pointer-events:none;
}
.elite-people__track::-webkit-scrollbar{ display:none; }
.elite-people__btn{
  position:absolute; top:50%; transform:translateY(-55%);
  z-index:3;
  width:3.1rem; height:3.1rem; border-radius:999px;
  border:1px solid rgba(159,217,255,0.32);
  margin:0; padding:0;
  display:inline-flex; align-items:center; justify-content:center;
  background: linear-gradient(180deg, rgba(22,36,54,0.96), rgba(12,22,36,0.94));
  color:#e8f6ff;
  box-shadow: 0 12px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
  cursor:pointer;
  transition: background .18s ease, color .18s ease, border-color .18s ease, transform .18s ease, box-shadow .18s ease;
}
.elite-people__btn--prev{ left:0; }
.elite-people__btn--next{ right:0; }
.elite-people__btn:hover{
  background: rgba(110,220,200,0.2); color:#fff;
  border-color: rgba(110,220,200,0.55);
  box-shadow: 0 14px 32px rgba(0,0,0,0.4);
}
.elite-people__btn:active{ transform:translateY(-55%) scale(0.96); }
.elite-people__btn:focus-visible{
  outline:2px solid rgba(110,220,200,0.75); outline-offset:3px;
}
.elite-people__btn svg{ display:block; }
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
  -webkit-user-drag:none; user-select:none;
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
  .elite-people__stage{ padding: 0 2.4rem; }
  .elite-people__card{ grid-template-columns:1fr; flex-basis:min(94vw, 520px); min-height:0; }
  .elite-people__card-photo{ min-height:260px; }
  .elite-people__btn{ width:2.7rem; height:2.7rem; }
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

  // Pointer drag / swipe (mouse + touch)
  var dragging = false;
  var moved = false;
  var startX = 0;
  var startLeft = 0;
  var pointerId = null;

  track.addEventListener("pointerdown", function(e){
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest("a,button")) return;
    dragging = true;
    moved = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.classList.add("is-dragging");
    try { track.setPointerCapture(pointerId); } catch (err) {}
  });

  track.addEventListener("pointermove", function(e){
    if (!dragging) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startLeft - dx;
  });

  function endDrag(e){
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    try {
      if (pointerId != null) track.releasePointerCapture(pointerId);
    } catch (err) {}
    pointerId = null;
    // Snap to nearest card after drag
    if (moved && cards[0]) {
      var gap = 22;
      var w = cards[0].getBoundingClientRect().width + gap;
      var idx = Math.round(track.scrollLeft / w);
      track.scrollTo({ left: idx * w, behavior: "smooth" });
    }
    update();
  }

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("pointerleave", function(e){
    if (dragging && e.pointerId === pointerId) endDrag(e);
  });

  // Prevent accidental click-through after a drag
  track.addEventListener("click", function(e){
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);

  track.addEventListener("scroll", update, { passive:true });
  update();
})();
</script>`;

let html = fs.readFileSync("public/index.html", "utf8");

html = html.replace(
  /<style id="elitechnexus-meet-people-css">[\s\S]*?<\/style>/,
  css
);

html = html.replace(
  /<script id="elitechnexus-meet-people-js">[\s\S]*?<\/script>/,
  js
);

// Remove nav from heading
html = html.replace(
  /\s*<div class="elite-people__nav"[^>]*>[\s\S]*?<\/div>\s*(?=<\/div>\s*<p id="home-bento__subtitle")/,
  "\n      "
);

// Wrap track with stage + side buttons
if (!html.includes("elite-people__stage")) {
  html = html.replace(
    /<div class="elite-people__track-wrap">\s*<div class="elite-people__track" id="elite-people-track">/,
    `<div class="elite-people__stage">
      <button type="button" class="elite-people__btn elite-people__btn--prev" data-people-prev aria-label="Previous person">${arrowPrev}</button>
      <button type="button" class="elite-people__btn elite-people__btn--next" data-people-next aria-label="Next person">${arrowNext}</button>
      <div class="elite-people__track-wrap">
      <div class="elite-people__track" id="elite-people-track">`
  );

  // Close stage after track-wrap closes (before progress)
  html = html.replace(
    /(<\/div>\s*<\/div>\s*)(<div class="elite-people__progress")/,
    `$1</div>\n    $2`
  );
}

fs.writeFileSync("public/index.html", html);
console.log("meet-people: side arrows + drag scroll applied");
