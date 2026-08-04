import fs from "fs";
import path from "path";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else a.push(f);
  }
  return a;
}

const files = walk("public/customers").filter((f) => f.endsWith(".html"));
for (const f of files) {
  const h = fs.readFileSync(f, "utf8");
  const videos = [...h.matchAll(/<video[\s\S]*?<\/video>/gi)];
  const sources = [...h.matchAll(/\.mp4|\.webm|video\//gi)];
  const posters = [...h.matchAll(/poster="([^"]+)"/gi)];
  console.log("\n==", f);
  console.log("video blocks:", videos.length);
  videos.forEach((v, i) => console.log("  V" + i, v[0].slice(0, 300).replace(/\s+/g, " ")));
  console.log("media refs:", sources.length, posters.map((p) => p[1]));
}

// list case-study media assets
const assetsRoot = "public/assets/images/case-studies";
if (fs.existsSync(assetsRoot)) {
  for (const dir of fs.readdirSync(assetsRoot)) {
    const p = path.join(assetsRoot, dir);
    if (!fs.statSync(p).isDirectory()) continue;
    const files = fs.readdirSync(p);
    console.log("\nassets", dir, files);
  }
}
