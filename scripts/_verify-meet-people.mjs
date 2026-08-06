import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
console.log("meet people", h.includes("Meet Our"));
console.log("old bento items", /home-bento__item-01/.test(h));
console.log("track", h.includes("elite-people-track"));
console.log("css", h.includes("elitechnexus-meet-people-css"));
console.log("js", h.includes("elitechnexus-meet-people-js"));
const a = h.indexOf('id="home-bento"');
console.log(h.slice(a, a + 400).replace(/\s+/g, " "));
