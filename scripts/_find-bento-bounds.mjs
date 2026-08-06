import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const a = h.indexOf('id="home-bento"');
const b = h.indexOf('id="home-integration"');
console.log({ a, b, len: b - a });
// find section start more carefully - look for opening div of home-bento
let start = h.lastIndexOf("<div", a);
// better: find '<div id="home-bento"'
start = h.indexOf('<div id="home-bento"');
if (start < 0) start = h.indexOf("id=\"home-bento\"");
console.log("start", start);
console.log(h.slice(start, start + 500).replace(/\s+/g, " "));
console.log("--- before integration ---");
console.log(h.slice(b - 300, b + 60).replace(/\s+/g, " "));

// Also check if home-bento is nested - find matching end
// Look for home-bento title text
const t = h.indexOf("home-bento__title");
console.log("title idx", t, h.slice(t, t + 200).replace(/\s+/g, " "));
