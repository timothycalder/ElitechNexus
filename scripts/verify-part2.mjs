import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");

const title = h.match(/id="home-hero__title">[\s\S]*?<\/h1>/)[0];
const sub = h.match(/id="home-hero__subtitle">[\s\S]*?<\/p>/)[0];
console.log("TITLE:\n", title);
console.log("SUB:\n", sub);

const header = h.match(/How US Enterprises[^<]+/)[0];
console.log("HEADER:\n", header);

const metrics = h.match(/<div class="table">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0];
console.log("METRICS:\n", metrics.replace(/\s+/g, " "));

const ov = h.match(/<h2>Overview<\/h2>\s*<p>[\s\S]*?<\/p>/)[0];
console.log("OVERVIEW:\n", ov);

// Remaining Nubank in early case panel?
const vp = h.indexOf('id="viewport-wrapper"');
const early = h.slice(0, vp).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
console.log("\nStill Nubank in early panel?", /Nubank/.test(early));
console.log("Early panel snippet after Overview:", early.slice(early.indexOf("Overview"), early.indexOf("Overview") + 600));
