/**
 * Professional Elitechnexus cursor (minimal agency style) + people photo hover motion.
 */
import fs from "fs";
import path from "path";

const root = path.resolve("public");

const cursorCss = `<style id="elitechnexus-cursor-css">
/* Minimal professional cursor — soft ring + tip (not neon/gaming) */
@media (pointer: fine) {
  html.elite-cursor-on,
  html.elite-cursor-on * {
    cursor: none !important;
  }
  html.elite-cursor-on input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),
  html.elite-cursor-on textarea,
  html.elite-cursor-on select,
  html.elite-cursor-on [contenteditable="true"] {
    cursor: text !important;
  }
}
#elite-cursor {
  position: fixed;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  pointer-events: none;
  z-index: 2147483646;
  opacity: 0;
  mix-blend-mode: normal;
  will-change: transform;
  transition: opacity 0.2s ease;
}
html.elite-cursor-on #elite-cursor { opacity: 1; }
#elite-cursor__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(232, 246, 255, 0.55);
  box-shadow:
    0 0 0 1px rgba(11, 22, 36, 0.25),
    0 4px 16px rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.03);
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.28s ease,
    background 0.28s ease,
    box-shadow 0.28s ease;
}
#elite-cursor__dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  background: #e8f6ff;
  box-shadow: 0 0 0 1px rgba(11, 22, 36, 0.35);
  transition: transform 0.22s ease, background 0.22s ease, width 0.22s ease, height 0.22s ease, margin 0.22s ease;
}
#elite-cursor.is-hover #elite-cursor__ring {
  transform: scale(1.35);
  border-color: rgba(110, 220, 200, 0.85);
  background: rgba(110, 220, 200, 0.1);
  box-shadow: 0 0 0 1px rgba(11, 22, 36, 0.2), 0 6px 20px rgba(74, 168, 255, 0.15);
}
#elite-cursor.is-hover #elite-cursor__dot {
  background: #6edcc8;
  transform: scale(1.15);
}
#elite-cursor.is-media #elite-cursor__ring {
  transform: scale(1.55);
  border-color: rgba(159, 217, 255, 0.9);
  background: rgba(15, 28, 44, 0.28);
}
#elite-cursor.is-media #elite-cursor__dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  background: #9fd9ff;
}
#elite-cursor.is-down #elite-cursor__ring {
  transform: scale(0.82);
  background: rgba(110, 220, 200, 0.16);
}
#elite-cursor.is-drag #elite-cursor__ring {
  transform: scale(1.2);
  border-color: rgba(110, 220, 200, 0.75);
  border-style: dashed;
}
@media (prefers-reduced-motion: reduce) {
  #elite-cursor__ring,
  #elite-cursor__dot { transition: none; }
}
</style>`;

const cursorJs = `<script id="elitechnexus-cursor-js">
(function () {
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var html = document.documentElement;
  html.classList.add("elite-cursor-on");

  var el = document.createElement("div");
  el.id = "elite-cursor";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div id="elite-cursor__ring"></div><div id="elite-cursor__dot"></div>';
  document.body.appendChild(el);

  var x = window.innerWidth / 2, y = window.innerHeight / 2;
  var tx = x, ty = y;
  var raf = 0;

  function frame() {
    raf = 0;
    if (reduced) {
      el.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      return;
    }
    tx += (x - tx) * 0.22;
    ty += (y - ty) * 0.22;
    el.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
    if (Math.abs(x - tx) > 0.05 || Math.abs(y - ty) > 0.05) {
      raf = requestAnimationFrame(frame);
    }
  }

  function askFrame() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", function (e) {
    x = e.clientX;
    y = e.clientY;
    askFrame();
    var t = e.target;
    var hover = !!(t && t.closest && t.closest("a,button,[role=button],.elite-people__btn,.elite-people__cta,#site-header__button-menu"));
    var media = !!(t && t.closest && t.closest(".elite-people__card-photo, .elite-people__card-photo img"));
    var dragZone = !!(t && t.closest && t.closest(".elite-people__track")) && !hover;
    el.classList.toggle("is-hover", hover);
    el.classList.toggle("is-media", media && !hover);
    el.classList.toggle("is-drag", dragZone && !media);
  }, { passive: true });

  window.addEventListener("pointerdown", function () { el.classList.add("is-down"); });
  window.addEventListener("pointerup", function () { el.classList.remove("is-down"); });
  document.addEventListener("mouseleave", function () { el.style.opacity = "0"; });
  document.addEventListener("mouseenter", function () { el.style.opacity = "1"; });
})();
</script>`;

const photoHoverCss = `
.elite-people__card{
  transition: transform .5s cubic-bezier(0.22, 1, 0.36, 1), border-color .45s ease, box-shadow .5s ease;
}
.elite-people__card:hover{
  transform: translateY(-5px);
  border-color: rgba(110,220,200,0.42);
  box-shadow: 0 28px 56px rgba(0,0,0,0.38), 0 0 0 1px rgba(110,220,200,0.12);
}
.elite-people__track.is-dragging .elite-people__card,
.elite-people__track.is-dragging .elite-people__card:hover{
  transform: none;
  transition: none;
}
.elite-people__card-photo{
  position:relative; min-height:100%; background:#0a1420;
  overflow:hidden;
}
.elite-people__card-photo::before{
  content:"";
  position:absolute; inset:0; z-index:1; pointer-events:none;
  background: linear-gradient(180deg, rgba(8,16,28,0) 45%, rgba(8,16,28,0.55) 100%);
  opacity:0.55;
  transition: opacity .5s ease;
}
.elite-people__card-photo::after{
  content:"";
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background:
    linear-gradient(135deg, rgba(110,220,200,0.22), transparent 42%, rgba(74,168,255,0.18)),
    radial-gradient(circle at 70% 30%, rgba(159,217,255,0.2), transparent 55%);
  opacity:0;
  transition: opacity .55s ease;
  mix-blend-mode: soft-light;
}
.elite-people__card:hover .elite-people__card-photo::before{ opacity:0.25; }
.elite-people__card:hover .elite-people__card-photo::after{ opacity:1; }
.elite-people__card-photo img{
  width:100%; height:100%; object-fit:cover; display:block;
  -webkit-user-drag:none; user-select:none;
  transform: scale(1.001);
  transition: transform .9s cubic-bezier(0.22, 1, 0.36, 1), filter .5s ease;
  will-change: transform;
}
.elite-people__card:hover .elite-people__card-photo img{
  transform: scale(1.08);
  filter: brightness(1.05) saturate(1.06) contrast(1.02);
}
.elite-people__track.is-dragging .elite-people__card-photo img{
  transition: none;
}
@media (prefers-reduced-motion: reduce){
  .elite-people__card,
  .elite-people__card-photo img,
  .elite-people__card-photo::before,
  .elite-people__card-photo::after{ transition: none; }
  .elite-people__card:hover{ transform: none; }
  .elite-people__card:hover .elite-people__card-photo img{ transform: none; filter: none; }
}
`;

function patchHome(html) {
  // Replace photo block styles inside meet-people css
  html = html.replace(
    /\.elite-people__card-photo\{ position:relative; min-height:100%; background:#0a1420; \}\s*\.elite-people__card-photo img\{[^}]+\}/,
    photoHoverCss.trim()
  );

  // Ensure card base still has transition if not already replaced into card rule
  if (!html.includes(".elite-people__card:hover{")) {
    html = html.replace(
      /\.elite-people__card\{\s*flex:0 0 min\(92vw, 740px\);[^}]+\}/,
      (m) =>
        m.replace(
          /box-shadow:[^;]+;/,
          "box-shadow: 0 22px 48px rgba(0,0,0,0.32);\n  transition: transform .5s cubic-bezier(0.22, 1, 0.36, 1), border-color .45s ease, box-shadow .5s ease;"
        ) +
        "\n" +
        photoHoverCss
    );
  }

  html = html.replace(
    /src="\/_astro\/hoisted\.Dadqo-kW\.js\?v=\d+"/,
    'src="/_astro/hoisted.Dadqo-kW.js?v=79"'
  );
  return html;
}

function injectCursor(html) {
  if (html.includes('id="elitechnexus-cursor-css"')) {
    html = html.replace(/<style id="elitechnexus-cursor-css">[\s\S]*?<\/style>/, cursorCss);
  } else if (html.includes("</head>")) {
    html = html.replace("</head>", cursorCss + "</head>");
  }

  if (html.includes('id="elitechnexus-cursor-js"')) {
    html = html.replace(/<script id="elitechnexus-cursor-js">[\s\S]*?<\/script>/, cursorJs);
  } else if (html.includes("</body>")) {
    html = html.replace("</body>", cursorJs + "</body>");
  }

  // Remove old ring leftover if any
  html = html.replace(/<style id="elitechnexus-cursor-ring-css">[\s\S]*?<\/style>/g, "");
  return html;
}

const homePath = path.join(root, "index.html");
let home = fs.readFileSync(homePath, "utf8");
home = patchHome(home);
home = injectCursor(home);
fs.writeFileSync(homePath, home);
console.log("home updated");

// Verify photo hover landed
if (!home.includes(".elite-people__card:hover .elite-people__card-photo img")) {
  console.warn("WARN: photo hover CSS may not have matched — forcing append into meet-people css");
  home = fs.readFileSync(homePath, "utf8");
  home = home.replace(
    "</style><style id=\"elitechnexus-force-visible-css\">",
    photoHoverCss + "\n</style><style id=\"elitechnexus-force-visible-css\">"
  );
  // That would break if meet-people css doesn't end that way — check
  fs.writeFileSync(homePath, home);
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "_astro" || ent.name === "assets" || ent.name === "visual-3d") continue;
      walk(p);
    } else if (ent.name === "index.html" && p !== homePath) {
      let h = fs.readFileSync(p, "utf8");
      h = injectCursor(h);
      fs.writeFileSync(p, h);
      console.log("cursor ->", path.relative(root, p));
    }
  }
}
walk(root);

// Final check
const check = fs.readFileSync(homePath, "utf8");
console.log("has hover zoom:", check.includes("scale(1.08)"));
console.log("has elite-cursor-on:", check.includes("elite-cursor-on"));
console.log("has cursor js:", check.includes('id="elitechnexus-cursor-js"'));
console.log("old png cursor css gone:", !check.includes("elite-default.png"));
