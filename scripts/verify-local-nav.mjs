import fs from "fs";
import http from "http";

const h = fs.readFileSync("public/index.html", "utf8");
console.log("deepwiki.com left:", (h.match(/deepwiki\.com/g) || []).length);

const labels = ["About us", "Careers", "Blog", "Contact", "Docs", "DeepWiki", "Login"];
for (const L of labels) {
  const re = new RegExp(`href="([^"]+)"[^>]*>[\\s\\S]{0,500}?${L}`, "g");
  const ms = [...h.matchAll(re)].map((m) => m[1]);
  console.log(L.padEnd(12), [...new Set(ms)]);
}

// Contact us / Docs side links
for (const L of ["Contact us", "Docs"]) {
  const re = new RegExp(`href="([^"]+)"[^>]*>[\\s\\S]{0,300}?${L}`, "g");
  console.log(L.padEnd(12), [...new Set([...h.matchAll(re)].map((m) => m[1]))]);
}

const paths = ["/about", "/careers", "/blog", "/contact", "/docs", "/deepwiki", "/login"];
let done = 0;
for (const p of paths) {
  http
    .get("http://127.0.0.1:3010" + p, (res) => {
      console.log("GET", p, res.statusCode);
      if (++done === paths.length) process.exit(0);
    })
    .on("error", (e) => {
      console.log("GET", p, "ERR", e.message);
      if (++done === paths.length) process.exit(0);
    });
}
