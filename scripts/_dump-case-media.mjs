import fs from "fs";

function dumpMedia(page) {
  const h = fs.readFileSync(`public/customers/${page}/index.html`, "utf8");
  // find case-study image/video related chunks
  const imgs = [...h.matchAll(/src="(\/assets\/images\/case-studies\/[^"]+)"/g)].map((m) => m[1]);
  const mediaTags = [...h.matchAll(/<(img|video|source|figure)[^>]{0,200}/gi)].map((m) =>
    m[0].replace(/\s+/g, " ").slice(0, 180)
  );
  console.log("\n===", page, "===");
  console.log("case-study assets:", imgs);
  console.log("media tags sample:", mediaTags.slice(0, 15));
  // look for case-study__visual or similar
  const keys = ["case-study__media", "case-study__video", "case-study__image", "case-study__cover", "video", "img1", "cover"];
  for (const k of keys) {
    const i = h.indexOf(k);
    if (i >= 0) console.log("found", k, "at", i, h.slice(i, i + 160).replace(/\s+/g, " "));
  }
}

for (const p of ["bilt", "gumroad", "linktree", "ramp", "nubank", "crossmint"]) dumpMedia(p);
