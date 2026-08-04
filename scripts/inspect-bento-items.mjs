import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");

const i1 = h.indexOf('id="home-bento__item-01"');
const i2 = h.indexOf('id="home-bento__item-02"');
const i3 = h.indexOf('id="home-bento__item-03"');
const iEnd = h.indexOf('id="home-integration"', i3);

function show(label, start, end) {
  const chunk = h.slice(start, end);
  // pull text-related bits
  const textBlocks = [...chunk.matchAll(/<(h2|h3|p|div)[^>]*class="[^"]*(?:title|subtitle|headline)[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi)];
  console.log("\n====", label, "====");
  for (const m of textBlocks) {
    console.log(m[0].replace(/\s+/g, " ").slice(0, 300));
  }
  // also any home-bento__item-text region
  const t = chunk.match(/home-bento__item-text">([\s\S]*?)<\/div>\s*<div class="home-bento__item-image-main-wrapper-mobile"/);
  if (t) console.log("ITEM TEXT:", t[1].replace(/\s+/g, " "));
  else {
    // item 01 structure may differ
    const t2 = chunk.match(/class="home-bento__item-title">([\s\S]*?)<\/h3>/);
    console.log("TITLE ONLY:", t2?.[1].replace(/\s+/g, " "));
    // nearby after title
    if (t2) {
      const after = chunk.slice(chunk.indexOf(t2[0]) + t2[0].length, chunk.indexOf(t2[0]) + t2[0].length + 200);
      console.log("AFTER TITLE:", after.replace(/\s+/g, " "));
    }
  }
}

show("01", i1, i2);
show("02", i2, i3);
show("03", i3, iEnd);

// Workspace/tools - maybe use-cases or integration slides
const w = h.indexOf("Workspace");
console.log("\nWorkspace context:", h.slice(w - 100, w + 200).replace(/<svg[\s\S]*?<\/svg>/gi,"[SVG]").replace(/\s+/g," "));
