import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

// Extract header nav links
const navStart = h.indexOf('id="site-header__nav"');
const navEnd = h.indexOf("</nav>", navStart);
console.log("--- HEADER NAV ---");
console.log(h.slice(navStart, navEnd + 6).replace(/><div/g, ">\n<div").replace(/><a/g, ">\n<a").replace(/><li/g, ">\n<li").slice(0, 4000));

console.log("\n--- FOOTER/MENU links sample ---");
for (const path of ["/about", "/careers", "/blog", "/contact", "/docs", "/login", "/deepwiki"]) {
  const re = new RegExp(`href="${path}"`, "g");
  const count = (h.match(re) || []).length;
  console.log(path, "count", count);
}

// Check if pages exist
import path from "path";
for (const p of ["about", "careers", "blog", "contact", "docs", "login", "deepwiki", "enterprise"]) {
  const f = `public/${p}/index.html`;
  console.log(f, fs.existsSync(f) ? "EXISTS " + fs.statSync(f).size : "MISSING");
}
