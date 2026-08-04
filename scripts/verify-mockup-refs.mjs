import fs from "fs";

for (const f of [
  "public/index.html",
  "public/customers/bilt/index.html",
  "public/customers/gumroad/index.html",
  "public/customers/crossmint/index.html",
  "public/customers/linktree/index.html",
  "public/enterprise/index.html",
]) {
  const h = fs.readFileSync(f, "utf8");
  const m =
    h.match(
      /assets\/images\/(?:use-cases|bento|integration|enterprise-slide|case-studies)[^"'\\\s>]*/g
    ) || [];
  console.log("\n" + f);
  console.log([...new Set(m)].join("\n"));
}
