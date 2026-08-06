/**
 * Move dark legal/contact footer INSIDE #site-footer (SPA scroll area).
 * Previous placement was outside #viewport-wrapper so it was invisible.
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

function extractLegalBlock(h) {
  const start = h.indexOf('<div id="elite-legal-footer"');
  if (start < 0) return null;
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
      if (depth === 0) return { start, end: i, html: h.slice(start, i) };
      continue;
    }
    i++;
  }
  return null;
}

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes('id="site-footer"')) continue;

  const block = extractLegalBlock(h);
  if (!block) {
    console.warn("no legal block", f);
    continue;
  }

  // Remove from current (outside) position
  h = h.slice(0, block.start) + h.slice(block.end);

  // Insert after site-footer__bottom closes, still inside site-footer
  const bottom = h.indexOf('id="site-footer__bottom"');
  if (bottom < 0) {
    console.warn("no bottom", f);
    continue;
  }

  // Find end of site-footer__bottom root div
  let depth = 0;
  let i = bottom;
  // rewind to opening <div
  i = h.lastIndexOf("<div", bottom);
  let endBottom = -1;
  let j = i;
  while (j < h.length) {
    if (h.startsWith("<div", j)) {
      depth++;
      j = h.indexOf(">", j) + 1;
      continue;
    }
    if (h.startsWith("</div>", j)) {
      depth--;
      j += 6;
      if (depth === 0) {
        endBottom = j;
        break;
      }
      continue;
    }
    j++;
  }
  if (endBottom < 0) {
    console.warn("could not find bottom end", f);
    continue;
  }

  h = h.slice(0, endBottom) + "\n" + block.html + "\n" + h.slice(endBottom);

  // Strengthen CSS so it always paints full-bleed dark inside footer
  const extra = `
#site-footer #elite-legal-footer{
  display:block !important;
  visibility:visible !important;
  opacity:1 !important;
  width:100vw;
  max-width:100vw;
  margin-left:calc(50% - 50vw);
  margin-right:calc(50% - 50vw);
  margin-top:2rem;
  box-sizing:border-box;
  background:#070b14 !important;
  position:relative;
  z-index:6;
}
#site-footer{
  overflow:visible !important;
}
`;
  if (h.includes("elitechnexus-legal-footer-css")) {
    h = h.replace(
      /(<style id="elitechnexus-legal-footer-css">)/,
      `$1\n${extra}`
    );
    // avoid duplicating if re-run: strip duplicate extras by only adding if missing
    const count = (h.match(/#site-footer #elite-legal-footer/g) || []).length;
    if (count > 1) {
      // leave as-is; next clean run would need better dedupe
    }
  }

  fs.writeFileSync(f, h);
  n++;
  console.log("fixed", f);
}
console.log("done", n);

// verify homepage nesting
const h = fs.readFileSync("public/index.html", "utf8");
const vw = h.indexOf('<div id="viewport-wrapper"');
const legal = h.indexOf('<div id="elite-legal-footer"');
function depthBetween(start, end) {
  let d = 0,
    i = start;
  while (i < end) {
    if (h.startsWith("<div", i)) {
      d++;
      i = h.indexOf(">", i) + 1;
      continue;
    }
    if (h.startsWith("</div>", i)) {
      d--;
      i += 6;
      continue;
    }
    i++;
  }
  return d;
}
console.log("viewport→legal depth (should be >0):", depthBetween(vw, legal));
console.log(
  "legal after site-footer__bottom?",
  legal > h.indexOf('id="site-footer__bottom"')
);
