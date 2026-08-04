import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Visible text around Nubank / 12x / metrics near start of body content
const textStart = h.indexOf("How Nubank");
const alt = h.indexOf("How ");
console.log("How Nubank", textStart);
// After rebrand it might be different
const howElite = h.search(/How [^<]{0,80}/);
console.log("first How match", howElite, h.slice(howElite, howElite + 120));

// Extract early article-like content (before viewport)
const vp = h.indexOf('id="viewport-wrapper"');
const early = h.slice(0, vp);
const earlyText = early.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<svg[\s\S]*?<\/svg>/gi,"[SVG]").replace(/<[^>]+>/g," ").replace(/\s+/g," ");
console.log("\nEARLY TEXT:\n", earlyText.slice(0, 2500));

// Find metric DOM structure
const m12 = h.indexOf("12x");
console.log("\n12x context HTML:\n", h.slice(m12 - 300, m12 + 400).replace(/<svg[\s\S]*?<\/svg>/gi,"[SVG]").replace(/\s+/g," "));

const m20 = h.indexOf("20x");
console.log("\n20x context HTML:\n", h.slice(m20 - 300, m20 + 400).replace(/<svg[\s\S]*?<\/svg>/gi,"[SVG]").replace(/\s+/g," "));
