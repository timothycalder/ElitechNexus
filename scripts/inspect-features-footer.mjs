import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Find feature / bento / workspace / tools sections
for (const key of [
  "home-bento",
  "Workspace",
  "tools",
  "home-integration",
  "Code on the go",
  "bento",
  "site-footer",
]) {
  const i = h.indexOf(key);
  console.log(key, i);
}

function dump(idOrText, len = 1500) {
  const i = h.indexOf(idOrText);
  if (i < 0) return console.log("missing", idOrText);
  let chunk = h.slice(i, i + len).replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]");
  console.log("\n===", idOrText, "===\n", chunk.replace(/\s+/g, " ").slice(0, len));
}

dump('id="home-bento"');
dump("home-bento__item-title");
dump('id="site-footer"');

// Extract all bento titles/subtitles
const titles = [...h.matchAll(/class="home-bento__item-title">([^<]+)</g)].map((m) => m[1]);
const subs = [...h.matchAll(/class="home-bento__item-subtitle">([\s\S]*?)<\/p>/g)].map((m) =>
  m[1].replace(/<br\s*\/?>/g, " ").replace(/\s+/g, " ").trim()
);
console.log("\nbento titles:", titles);
console.log("bento subs:", subs);

// Footer text
const fi = h.indexOf('id="site-footer"');
const footerText = h
  .slice(fi, fi + 4000)
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");
console.log("\nFOOTER TEXT:\n", footerText.slice(0, 1200));
