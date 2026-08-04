import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const a = h.indexOf("site-header__nav-list-dropdown-box");
const end = h.indexOf("</ul>", a);
const box = h.slice(a, end + 5);
console.log("--- DROPDOWN ---");
for (const label of ["About us", "Careers", "Blog", "Docs", "Wiki", "DeepWiki", "Contact", "Get started"]) {
  console.log(label, box.includes(label) || h.includes(`>${label}<`) ? "PRESENT" : "gone");
}
// list remaining spans in dropdown
const spans = [...box.matchAll(/<span>([^<]+)<\/span>/g)].map((m) => m[1]);
console.log("dropdown labels:", spans);

const menu = h.slice(h.indexOf("site-menu__nav-02"), h.indexOf("site-menu__nav-02") + 1200);
console.log("\n--- MENU 02 labels ---");
console.log([...menu.matchAll(/<span>([^<]+)<\/span>/g)].map((m) => m[1]));

const c = fs.readFileSync("public/contact/index.html", "utf8");
console.log("\n--- CONTACT ---");
for (const s of [
  "elite-contact__strip",
  "+1 (339) 365-7217",
  "steven.miller@elitechnexus.com",
  "Philippines",
  "Phone",
  "Email",
  "Address",
  "Send us a message",
  "Get started",
]) {
  console.log(s, c.includes(s) ? "OK" : "MISSING");
}

// leftover about links in header?
const header = h.slice(h.indexOf("site-header"), h.indexOf("viewport-wrapper"));
console.log("\nheader still has /about?", header.includes('href="/about"'));
console.log("header still has /careers?", header.includes('href="/careers"'));
console.log("header still has /blog?", header.includes('href="/blog"'));
console.log("header still has /docs?", header.includes('href="/docs"'));
console.log("header has /deepwiki?", header.includes('href="/deepwiki"'));
console.log("header has Get started?", header.includes("Get started"));
