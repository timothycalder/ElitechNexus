import fs from "fs";

const h = fs.readFileSync("public/contact/index.html", "utf8");
const a = h.indexOf('id="elitechnexus-simple-page-css"');
const b = h.indexOf("</style>", a);
console.log("---CSS---");
console.log(h.slice(a, b + 8));
const c = h.indexOf('id="contact"');
const d = h.indexOf('id="site-footer"', c);
console.log("---BODY---");
console.log(h.slice(c, d));
