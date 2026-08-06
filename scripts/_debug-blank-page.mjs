import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");

const open = (h.match(/<div\b/gi) || []).length;
const close = (h.match(/<\/div>/gi) || []).length;
console.log("div open/close/diff", open, close, open - close);

// critical ids
for (const id of [
  "ui",
  "viewport-wrapper",
  "pages-container",
  "home",
  "home-bento",
  "home-integration",
  "home-hero",
  "site-footer",
  "elite-people-track",
]) {
  console.log(id, h.includes(`id="${id}"`));
}

// Check for broken script/style tags around meet people
const i = h.indexOf("elite-people-section");
console.log("\n--- around meet people ---");
console.log(h.slice(i - 100, i + 200).replace(/\s+/g, " "));

const j = h.indexOf("elitechnexus-meet-people-js");
console.log("\njs present", j >= 0);
if (j >= 0) console.log(h.slice(j, j + 120).replace(/\s+/g, " "));

// unclosed style?
const styles = (h.match(/<style\b/gi) || []).length;
const stylesEnd = (h.match(/<\/style>/gi) || []).length;
console.log("style open/close", styles, stylesEnd);

const scripts = (h.match(/<script\b/gi) || []).length;
const scriptsEnd = (h.match(/<\/script>/gi) || []).length;
console.log("script open/close", scripts, scriptsEnd);

// canvas covering?
console.log("canvas", h.includes('<canvas id="canvas"'));
console.log("body classes snippet", h.slice(h.indexOf("<body"), h.indexOf("<body") + 80));
