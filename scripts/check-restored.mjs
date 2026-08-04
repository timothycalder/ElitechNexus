import fs from "fs";

const restored = fs.readFileSync("public/index.html.restored", "utf8");
console.log("restored len", restored.length);
console.log("home-hero", restored.includes('id="home-hero"'));
console.log("viewport", restored.includes("viewport-wrapper"));
console.log("Problem", restored.includes("The Problem"));
console.log("use-cases", restored.includes("home-use-cases"));
console.log("visual-3d", restored.includes("visual-3d"));

// Peek Solution section end - what comes after Solution heading before next h2 in CASE STUDY only
const sol = restored.indexOf("<h2>The Solution: Custom ETL Migration Devin</h2>");
console.log("solution idx", sol);
// Find Results or similar within next 15k
const slice = restored.slice(sol, sol + 20000);
const h2s = [...slice.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
);
console.log("h2s near solution:", h2s.slice(0, 15));
