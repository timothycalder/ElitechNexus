import fs from "fs";

for (const page of ["bilt", "ramp", "gumroad", "nubank", "crossmint", "linktree"]) {
  const h = fs.readFileSync(`public/customers/${page}/index.html`, "utf8");
  const i = h.indexOf('id="case-study__video"');
  const j = h.indexOf('id="case-study__right"', i);
  console.log("\n====", page, "====");
  console.log(h.slice(i, j > i ? j : i + 900).replace(/\s+/g, " "));
}
