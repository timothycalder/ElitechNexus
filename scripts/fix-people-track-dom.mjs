/**
 * Fix Meet Our People freeze: premature </div> closed the track after card 9,
 * leaving cards 10–14 outside and unbalancing the page DOM (scroll/UI lock).
 * Also harden drag so pointer capture cannot stick.
 */
import fs from "fs";

const path = "public/index.html";
let html = fs.readFileSync(path, "utf8");

// Remove premature track close after card idx 9 (before card 10)
const broken = `        <img src="/assets/images/people/p10.jpg?v=82" alt="Rico Dela Cruz" width="360" height="450" loading="lazy">
      </div>
    </article>
      </div>


    <article class="elite-people__card" data-idx="10">`;

const fixed = `        <img src="/assets/images/people/p10.jpg?v=82" alt="Rico Dela Cruz" width="360" height="450" loading="lazy">
      </div>
    </article>

    <article class="elite-people__card" data-idx="10">`;

if (!html.includes(broken)) {
  // Try without exact whitespace / version
  const alt = html.match(
    /p10\.jpg\?v=\d+"[\s\S]*?<\/article>\s*<\/div>\s*<article class="elite-people__card" data-idx="10">/
  );
  if (!alt) {
    console.error("Could not find premature track close pattern");
    process.exit(1);
  }
  html = html.replace(
    alt[0],
    alt[0].replace(/<\/article>\s*<\/div>\s*<article/, "</article>\n\n    <article")
  );
  console.log("Fixed via regex fallback");
} else {
  html = html.replace(broken, fixed);
  console.log("Fixed premature track close");
}

const saferJs = `<script id="elitechnexus-meet-people-js">
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

  var dragging = false;
  var moved = false;
  var startX = 0;
  var startLeft = 0;

  function onMove(e){
    if (!dragging) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startLeft - dx;
  }

  function endDrag(){
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    if (moved && cards[0]) {
      var gap = 22;
      var w = cards[0].getBoundingClientRect().width + gap;
      var idx = Math.round(track.scrollLeft / w);
      track.scrollTo({ left: idx * w, behavior: "smooth" });
    }
    update();
  }

  track.addEventListener("pointerdown", function(e){
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest("a,button")) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.classList.add("is-dragging");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  });

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

html = html.replace(
  /<script id="elitechnexus-meet-people-js">[\s\S]*?<\/script>/,
  saferJs
);

// Bump main module cache (avoid PowerShell $ corruption — literal replace)
html = html.replace(
  /src="\/_astro\/hoisted\.Dadqo-kW\.js\?v=\d+"/,
  'src="/_astro/hoisted.Dadqo-kW.js?v=76"'
);

fs.writeFileSync(path, html);

// Verify balance
const start = html.indexOf('id="home-bento"');
const end = html.indexOf('id="home-integration"');
const sec = html.slice(start, end);
const open = (sec.match(/<div\b/g) || []).length;
const close = (sec.match(/<\/div>/g) || []).length;
const cardsInTrack = (sec.match(/elite-people__card/g) || []).length;
console.log("bento div open=", open, "close=", close, "delta=", open - close);
console.log("cards in section=", cardsInTrack);
console.log("module", html.match(/hoisted\.Dadqo-kW\.js\?v=\d+/)[0]);
