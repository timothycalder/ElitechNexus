import fs from "fs";
import path from "path";

let header = fs.readFileSync("scripts/_rebuilt-header.html", "utf8");

// Remove any remaining About/Careers/Blog/Docs list items anywhere in header
for (const label of ["About us", "Careers", "Blog", "Docs"]) {
  const re = new RegExp(
    `<li[^>]*>\\s*<a[^>]*>[\\s\\S]*?<span>${label}<\\/span>[\\s\\S]*?<\\/a>\\s*<\\/li>`,
    "gi"
  );
  header = header.replace(re, "");
}

// Also remove DeepWiki label leftovers if any (we want Wiki)
header = header.replace(/>DeepWiki</g, ">Wiki<");

fs.writeFileSync("scripts/_rebuilt-header.html", header);

for (const label of ["About us", "Careers", "Blog", "Docs", "Wiki", "Contact", "Get started", "Home"]) {
  console.log(label, header.includes(`>${label}<`) || header.includes(`>${label}</`) ? "yes" : "no");
}

// Apply header to all public HTML pages (except visual-3d)
function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

const FULLNAV = `<script id="elitechnexus-fullnav-fix">
(function () {
  var FULL = { contact: 1, deepwiki: 1, login: 1 };
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
    if (p && FULL[p]) e.stopImmediatePropagation();
  }, true);
})();
</script>`;

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const hs = h.indexOf('<header id="site-header">');
  // damaged pages may have lost opening tag format
  let he = h.indexOf('<div id="vimeo-overlay"', hs >= 0 ? hs : 0);
  if (hs < 0) {
    // try alternate
    const alt = h.indexOf('id="site-header"');
    if (alt < 0) {
      console.log("skip no header", f);
      continue;
    }
    // find preceding <header
    const open = h.lastIndexOf("<header", alt);
    if (open < 0) {
      console.log("skip broken header", f);
      continue;
    }
    if (he < 0) he = h.indexOf('<div id="vimeo-overlay"', open);
    if (he < 0) {
      console.log("skip no vimeo", f);
      continue;
    }
    h = h.slice(0, open) + header + " " + h.slice(he);
  } else {
    if (he < 0) {
      console.log("skip no vimeo after header", f);
      continue;
    }
    h = h.slice(0, hs) + header + " " + h.slice(he);
  }

  // Ensure fullnav script
  if (h.includes('id="elitechnexus-fullnav-fix"')) {
    h = h.replace(/<script id="elitechnexus-fullnav-fix">[\s\S]*?<\/script>/, FULLNAV);
  } else {
    h = h.replace("</head>", FULLNAV + "</head>");
  }

  fs.writeFileSync(f, h);
  n++;
  console.log("restored header", f);
}
console.log("done", n);
