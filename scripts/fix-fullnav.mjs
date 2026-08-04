/**
 * Fix nav: SPA router only knows home/enterprise/pricing/customers/case-study.
 * About/Careers/Blog/Contact/etc. were getting preventDefault + failed route match.
 * Inject capture-phase click handler so those paths do a normal full page load.
 */
import fs from "fs";
import path from "path";

const SCRIPT = `<script id="elitechnexus-fullnav-fix">
(function () {
  var FULL = {
    about: 1, careers: 1, blog: 1, contact: 1,
    docs: 1, login: 1, deepwiki: 1
  };
  function pathOf(href) {
    try {
      var u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return null;
      return u.pathname.replace(/^\\/|\\/$/g, "");
    } catch (e) { return null; }
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    var p = pathOf(a.href);
    if (p && FULL[p]) {
      // Stop SPA handler on the <a>; allow real browser navigation.
      e.stopImmediatePropagation();
    }
  }, true);

  // If SPA already pushed a dead URL (no matching page), hard-navigate once.
  function recover() {
    var p = (location.pathname || "/").replace(/^\\/|\\/$/g, "");
    if (!FULL[p]) return;
    var page = document.querySelector("#pages-container > .page");
    // On dedicated HTML files the page id matches the slug and is the only .page
    // On homepage SPA after failed fetch, .page may be missing or still "home"
    if (document.getElementById(p)) return;
    // Failed SPA transition: reload so server HTML loads properly
    if (!document.documentElement.dataset.elFullnavRetry) {
      document.documentElement.dataset.elFullnavRetry = "1";
      location.replace(location.pathname + location.search + location.hash);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(recover, 50); });
  } else {
    setTimeout(recover, 50);
  }
})();
</script>`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (h.includes('id="elitechnexus-fullnav-fix"')) {
    h = h.replace(
      /<script id="elitechnexus-fullnav-fix">[\s\S]*?<\/script>/,
      SCRIPT
    );
  } else {
    // Early in <head> so it binds before SPA attaches click handlers
    if (h.includes("</head>")) {
      h = h.replace("</head>", SCRIPT + "</head>");
    } else {
      continue;
    }
  }
  fs.writeFileSync(f, h);
  n++;
}
console.log("patched", n, "html files");
