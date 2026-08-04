import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
console.log("len", h.length);
console.log("has site-header", h.includes("site-header"));
console.log("has dropdown-box", h.includes("nav-list-dropdown-box"));
console.log("has site-menu", h.includes("site-menu"));
console.log("has Get started", h.includes("Get started"));
console.log("has deepwiki", h.includes("/deepwiki"));

const start = h.indexOf('id="site-header"');
console.log("header start", start);
console.log(h.slice(start, start + 5000));
