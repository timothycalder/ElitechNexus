import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

// Strip tags to see text mentions of places / company
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");

for (const word of [
  "Francisco",
  "California",
  "United States",
  "USA",
  "America",
  "Philippines",
  "based",
  "headquarter",
  "office",
  "Cognition",
  "Labs",
  "Careers",
  "Blog",
]) {
  const idx = text.indexOf(word);
  if (idx >= 0) {
    console.log(word, "->", text.slice(Math.max(0, idx - 50), idx + 80));
  } else {
    console.log(word, "NOT FOUND in visible text");
  }
}

// Nav links text
const navMatches = [...html.matchAll(/<a[^>]*>([^<]{0,80})<\/a>/g)]
  .map((m) => m[1].trim())
  .filter((t) => /cognition|devin|career|blog|contact|about|enterprise/i.test(t));
console.log("\nnav-ish links", [...new Set(navMatches)].slice(0, 40));
