import fs from "fs";
const h = fs.readFileSync("public/contact/index.html", "utf8");
const a = h.indexOf('<div id="contact"');
const b = h.indexOf('<div id="site-footer"');
const body = h.slice(a, b);
console.log(body.slice(0, 2500));
console.log("\n...\n");
console.log(body.slice(-800));
// ensure script present
console.log("\nmailto script?", body.includes("mailto:steven.miller"));
console.log("form submit handler?", body.includes("elite-contact-form"));
