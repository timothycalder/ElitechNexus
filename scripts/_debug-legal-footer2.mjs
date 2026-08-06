import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Find what wraps site-footer and where legal sits in the DOM tree
const sf = h.indexOf('<div id="site-footer"');
const legal = h.indexOf('<div id="elite-legal-footer"');
const scroll = h.indexOf('<div id="scroll-indicator"');
const vw = h.indexOf('<div id="viewport-wrapper"');

console.log({ vw, sf, legal, scroll });

// Count open/close divs between viewport and legal to see nesting
function depthBetween(start, end) {
  let d = 0;
  let i = start;
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

console.log("net depth viewport→site-footer", depthBetween(vw, sf));
console.log("net depth site-footer→legal", depthBetween(sf, legal));
console.log("net depth viewport→legal", depthBetween(vw, legal));

// Show 500 chars before legal with div tags only
const before = h.slice(legal - 500, legal);
const tags = before.match(/<\/?div[^>]*>/g) || [];
console.log("\nlast 20 tags before legal:");
console.log(tags.slice(-20).join("\n"));

// CSS on viewport
const cssMatch = h.match(/#viewport-wrapper[\s\S]{0,800}/);
console.log("\nviewport css sample:\n", cssMatch && cssMatch[0].slice(0, 600));

// elite overrides at line 291
const o = h.indexOf("#viewport-wrapper,\n#pages-container");
console.log("\noverride:\n", h.slice(o, o + 200));
