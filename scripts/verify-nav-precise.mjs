import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Extract dropdown box items
const drop = h.match(
  /id="site-header__nav-list-dropdown-box"[\s\S]*?<\/ul>/
)?.[0];
if (drop) {
  const items = [
    ...drop.matchAll(
      /href="([^"]+)"[\s\S]*?<div class="site-header__nav-list-dropdown-box-item-text">([^<]+)</g
    ),
  ];
  console.log("DROPDOWN:");
  for (const m of items) console.log(" ", m[2], "->", m[1]);
}

// Side list 02 text links
const list02 = h.match(/id="site-header__nav-list-02"[\s\S]*?<\/ul>\s*<div id="site-header__button/)?.[0];
if (list02) {
  const items = [
    ...list02.matchAll(/<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<div>([^<]+)<\/div>/g),
  ];
  console.log("LIST-02:");
  for (const m of items) console.log(" ", m[2], "->", m[1]);
}

const login = h.match(
  /id="site-header__button-transparent"[^>]*href="([^"]+)"/
);
console.log("LOGIN BTN ->", login?.[1]);

const cta = h.match(/id="site-header__button-cta"[^>]*href="([^"]+)"/);
console.log("GET STARTED ->", cta?.[1]);

// Spot-check about page content
const about = fs.readFileSync("public/about/index.html", "utf8");
console.log("about has elite-page:", about.includes("elite-page"));
console.log("about title:", (about.match(/<title>([^<]+)</) || [])[1]);
