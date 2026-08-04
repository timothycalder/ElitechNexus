import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const navMatch = h.match(/id="site-header__nav"[\s\S]*?<\/nav>/);
if (!navMatch) {
  console.log("nav not found");
  process.exit(1);
}
const nav = navMatch[0];
const links = [...nav.matchAll(/<a([^>]*)>[\s\S]*?<div>([^<]+)<\/div>/g)];
console.log("NAV LINKS:");
for (const m of links) {
  const href = (m[1].match(/href="([^"]+)"/) || [])[1] || "";
  const target = (m[1].match(/target="([^"]+)"/) || [])[1] || "";
  console.log(String(m[2]).padEnd(14), href, target ? `target=${target}` : "");
}

// Also menu / mobile nav if any
const menuLinks = [...h.matchAll(/site-menu[\s\S]{0,80}href="([^"]+)"[\s\S]{0,120}>([^<]{0,40})</g)];
console.log("\nmenu-ish samples", menuLinks.slice(0, 20));

const ext = [...new Set([...h.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))];
console.log("\nEXTERNAL HREFS:");
for (const u of ext) console.log(u);
