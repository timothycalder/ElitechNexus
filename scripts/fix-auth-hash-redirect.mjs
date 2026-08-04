/**
 * If someone lands on /#/register or /#/login (broken SPA hash),
 * send them to the real standalone /login page.
 */
import fs from "fs";
import path from "path";

const REDIRECT = `<script id="elitechnexus-auth-hash-redirect">
(function () {
  var h = (location.hash || "").toLowerCase();
  if (h === "#/register" || h === "#register" || h === "#/login" || h === "#login") {
    location.replace("/login" + (h.indexOf("login") >= 0 ? "#login" : "#register"));
  }
})();
</script>`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules" || n === "login") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const re = /<script id="elitechnexus-auth-hash-redirect">[\s\S]*?<\/script>/;
  if (re.test(h)) h = h.replace(re, REDIRECT);
  else h = h.replace("</head>", REDIRECT + "</head>");
  fs.writeFileSync(f, h);
  n++;
}
console.log("patched", n);
