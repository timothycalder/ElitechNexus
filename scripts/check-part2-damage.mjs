import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

const h2s = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) =>
  m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
);
console.log("All h2 count", h2s.length);
console.log(h2s.slice(0, 40));

// Check critical home sections still exist
for (const id of [
  "home-hero",
  "home-use-cases",
  "home-bento",
  "home-integration",
  "home-cta",
  "site-footer",
  "viewport-wrapper",
  "pages-container",
]) {
  console.log(id, h.includes(`id="${id}"`) || h.includes(`id='${id}'`));
}

// Check tag balance roughly
const open = (h.match(/<div\b/g) || []).length;
const close = (h.match(/<\/div>/g) || []).length;
console.log("div open/close", open, close, "diff", open - close);

const p = h.indexOf("The Solution: An Army");
const u = h.indexOf('id="home-use-cases__title"');
console.log("between solution and use-cases chars:", u - p);
console.log(h.slice(p, Math.min(p + 500, u + 100)).replace(/\s+/g, " ").slice(0, 700));

// Was Results section deleted?
console.log("has Results?", /The Results|Results<\/h2>/.test(h));
console.log("has Decision?", h.includes("The Decision"));
console.log("file length", h.length);
