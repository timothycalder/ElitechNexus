import fs from "fs";
import { Jimp } from "jimp";

const h = fs.readFileSync("public/index.html", "utf8");
const refs = [...h.matchAll(/elitechnexus-logo[^\s"'<>]*/g)].map((m) => m[0]);
console.log("unique refs", [...new Set(refs)]);

const img = await Jimp.read("public/assets/images/elitechnexus-logo-transparent.png");
let opaque = 0,
  clear = 0;
img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
  if (this.bitmap.data[idx + 3] < 10) clear++;
  else opaque++;
});
console.log("png", img.bitmap.width, "x", img.bitmap.height, "clear", clear, "opaque", opaque);
const c = img.getPixelColor(0, 0);
console.log(
  "corner rgba",
  (c >>> 24) & 255,
  (c >>> 16) & 255,
  (c >>> 8) & 255,
  c & 255
);

// Fix any leftover non-v5 refs
import path from "path";
function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}
const want = "/assets/images/elitechnexus-logo-transparent.png?v=5";
for (const f of walk("public")) {
  let t = fs.readFileSync(f, "utf8");
  const b = t;
  t = t.replace(
    /\/assets\/images\/elitechnexus-logo(?:-transparent)?\.png(?:\?v=\d+)?/g,
    want
  );
  if (t !== b) {
    fs.writeFileSync(f, t);
    console.log("fixed refs", f);
  }
}
