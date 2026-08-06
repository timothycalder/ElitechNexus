import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const checks = [
  "home-bento",
  "home-integration",
  "elite-people-track",
  "Meet Our",
  "</html>",
  "elitechnexus-jotform-chatbot",
];
for (const c of checks) console.log(c, h.includes(c));
const open = (h.match(/<div\b/g) || []).length;
const close = (h.match(/<\/div>/g) || []).length;
console.log("div open/close", open, close, "diff", open - close);
