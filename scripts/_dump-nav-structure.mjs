import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const s = h.indexOf('<nav id="site-header__nav">');
const e = h.indexOf('<div id="site-menu">', s);
const nav = h.slice(s, e);

// Pretty-ish: strip tags to structure markers
let out = nav
  .replace(/>([^<]{0,40})</g, (m, t) => {
    const x = t.trim();
    return x ? `>[TEXT:${x}]<` : "><";
  })
  .replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>")
  .replace(/\s+/g, " ");

// Extract open/close of key ids
const keys = [
  "site-header__nav",
  "site-header__nav-list-01",
  "site-header__nav-list-02",
  "site-header__nav-list-dropdown",
  "site-header__button-list",
  "site-header__button-contact",
  "site-header__button-transparent",
  "site-header__button-cta",
];

for (const k of keys) {
  const i = nav.indexOf(`id="${k}"`);
  console.log(k, i);
}

console.log("\n--- truncated nav structure ---");
console.log(
  nav
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 3500)
);

// Check original CSS that might hide button-list
const cssFiles = fs
  .readdirSync("public/_astro")
  .filter((f) => f.endsWith(".css"));
for (const f of cssFiles) {
  const c = fs.readFileSync(`public/_astro/${f}`, "utf8");
  if (c.includes("button-list") || c.includes("button-transparent") || c.includes("button-cta") || c.includes("button-contact")) {
    const idx = c.indexOf("#site-header__button-list");
    if (idx >= 0) console.log("\nCSS", f, "button-list:", c.slice(idx, idx + 300));
    const idx2 = c.indexOf("#site-header__button-transparent");
    if (idx2 >= 0) console.log("transparent:", c.slice(idx2, idx2 + 250));
    const idx3 = c.indexOf("#site-header__button-cta");
    if (idx3 >= 0) console.log("cta:", c.slice(idx3, idx3 + 250));
  }
}
