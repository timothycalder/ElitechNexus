import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const s = h.indexOf('<header id="site-header">');
const e = h.indexOf("</header>", s);
const hdr = h.slice(s, e + 9);

console.log("Pricing li?", /data-id="pricing"/.test(hdr));
console.log("button-contact?", hdr.includes("site-header__button-contact"));
console.log("Login href?", /button-transparent[^>]*href="\/login"/.test(hdr));
console.log("Login text?", hdr.includes(">Login<") || hdr.includes("<span>Login</span>"));

const bl = hdr.indexOf("site-header__button-list");
console.log("--- button-list ---");
console.log(hdr.slice(bl, bl + 1200));

const m = h.match(/<style id="elitechnexus-toolbar-css">[\s\S]*?<\/style>/);
if (m) {
  console.log("--- toolbar css ---");
  console.log(m[0].slice(0, 1200));
}

// Check if Contact/Login might be hidden
const hideRules = [...h.matchAll(/#site-header__button-(contact|transparent|cta|list)[^,{]*\{[^}]+\}/g)];
console.log("--- hide-ish rules ---");
for (const r of hideRules.slice(0, 20)) console.log(r[0]);
