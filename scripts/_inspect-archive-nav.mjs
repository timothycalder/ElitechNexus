import fs from "fs";

const archive = fs.readFileSync("scripts/_archive-home.html", "utf8");
const hs = archive.indexOf('<header id="site-header">');
const he = archive.indexOf('<div id="vimeo-overlay"', hs);
const header = archive.slice(hs, he);

const a = header.indexOf('id="site-header__nav-list-01"');
const b = header.indexOf("</ul>", a);
console.log("ARCHIVE LIST 01:");
console.log(header.slice(a, b + 5));

console.log("\n\nARCHIVE LIST 02 snippet:");
const c = header.indexOf('id="site-header__nav-list-02"');
console.log(header.slice(c, c + 2500));
