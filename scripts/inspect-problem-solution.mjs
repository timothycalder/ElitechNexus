import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Find Problem / Solution headings and following paragraphs in early panel
const vp = h.indexOf('id="viewport-wrapper"');
const early = h.slice(0, vp);

function dumpAround(label) {
  const i = early.indexOf(label);
  if (i < 0) {
    console.log(label, "NOT FOUND");
    return;
  }
  console.log("\n===", label, "===");
  console.log(early.slice(i, i + 1200).replace(/\s+/g, " "));
}

dumpAround("<h2>The Problem</h2>");
dumpAround("<h2>The Solution");
dumpAround("The Decision");
dumpAround("The Solution:");

// Also list all h2 in early panel
const h2s = [...early.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
);
console.log("\nAll h2:", h2s);
