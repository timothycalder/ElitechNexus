import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Find hero title/subtitle
const titleIdx = h.indexOf('id="home-hero__title"');
console.log("--- HERO TITLE AREA ---");
console.log(h.slice(titleIdx, titleIdx + 800).replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]").replace(/\s+/g, " "));

const subIdx = h.indexOf("home-hero__subtitle");
console.log("\n--- SUB ---");
console.log(h.slice(subIdx, subIdx + 500).replace(/\s+/g, " "));

// Case study / Nubank overview at top
const how = h.indexOf("How ");
console.log("\n--- early How ---");
console.log(h.slice(0, 2500).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 1500));

// Find metrics / case study section on home
for (const key of [
  "home-hero__copy",
  "nubank",
  "12x",
  "20x",
  "home-customers",
  "case-study",
  "home-quote",
  "refactor",
]) {
  const i = h.toLowerCase().indexOf(key.toLowerCase());
  console.log(key, i);
}
