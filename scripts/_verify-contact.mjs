import fs from "fs";

const h = fs.readFileSync("public/contact/index.html", "utf8");
const checks = [
  "elitechnexus-contact-css",
  "elite-contact-form",
  "Send us a message",
  "Get in Touch",
  "steven.miller@elitechnexus.com",
  "+1 (339) 365-7217",
  "Philippines",
  'id="site-footer"',
  'id="site-header"',
  "Quick Response",
];
for (const c of checks) {
  console.log(c, h.includes(c) ? "OK" : "MISSING");
}
const start = h.indexOf('<div id="contact"');
const footer = h.indexOf('<div id="site-footer"');
console.log("contact block length", footer - start);
console.log("has duplicate contact?", h.split('<div id="contact"').length - 1);
console.log("has contact css once?", h.split('id="elitechnexus-contact-css"').length - 1);

// Extract a readable snippet of form
const a = h.indexOf("elite-contact__form-title");
console.log(h.slice(a, a + 200));
