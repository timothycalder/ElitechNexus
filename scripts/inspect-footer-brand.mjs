import fs from "fs";

const html = fs.readFileSync("public/index.html", "utf8");

// Footer block
const i = html.indexOf("site-footer");
console.log("--- footer snippet ---");
console.log(html.slice(i, i + 2500).replace(/\s+/g, " ").slice(0, 2000));

// Header / brand text
const j = html.indexOf("site-header");
console.log("\n--- header ---");
console.log(html.slice(j, j + 1500).replace(/\s+/g, " ").slice(0, 1200));

// Find application-name / aria / alt with Devin
for (const re of [
  /alt="[^"]*Devin[^"]*"/gi,
  /aria-label="[^"]*"/gi,
  /application-name[^>]*>/gi,
  /Cognition[^<]{0,40}/g,
]) {
  const m = html.match(re);
  if (m) console.log("\n", re, m.slice(0, 10));
}

// Unique cognition/devin URLs
const urls = [...html.matchAll(/https?:\/\/[^"'>\s]+/g)].map((x) => x[0]);
const brandUrls = [...new Set(urls.filter((u) => /devin|cognition/i.test(u)))];
console.log("\nbrand urls", brandUrls);
