import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC =
  "C:\\Users\\AI ML Engineer\\.cursor\\projects\\d-Company-Website-ElitechNexus\\assets";
const DEST = "public/assets/images";

const MAP = [
  ["bilt-img1-el.png", "case-studies/bilt/img1"],
  ["bilt-img2-el.png", "case-studies/bilt/img2"],
  ["crossmint-img1-el.png", "case-studies/crossmint/img1"],
  ["crossmint-img2-el.png", "case-studies/crossmint/img2"],
  ["gumroad-img1-el.png", "case-studies/gumroad/img1"],
  ["linktree-img2-el.png", "case-studies/linktree/img2"],
  ["linktree-img3-el.png", "case-studies/linktree/img3"],
  ["linktree-img4-el.png", "case-studies/linktree/img4"],
];

for (const [srcName, base] of MAP) {
  const src = path.join(SRC, srcName);
  const webp = path.join(DEST, base + ".webp");
  const pngOut = path.join(DEST, base + ".png");
  if (!fs.existsSync(src)) {
    console.error("missing", srcName);
    continue;
  }
  let w = 1600,
    h = 900;
  if (fs.existsSync(webp)) {
    const m = await sharp(webp).metadata();
    w = m.width;
    h = m.height;
  }
  await sharp(src).resize(w, h, { fit: "cover", position: "centre" }).png().toFile(pngOut);
  console.log("wrote", pngOut, `${w}x${h}`);
}

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

const swaps = [
  ["case-studies/bilt/img1.webp", "case-studies/bilt/img1.png?v=8"],
  ["case-studies/bilt/img2.webp", "case-studies/bilt/img2.png?v=8"],
  ["case-studies/crossmint/img1.webp", "case-studies/crossmint/img1.png?v=8"],
  ["case-studies/crossmint/img2.webp", "case-studies/crossmint/img2.png?v=8"],
  ["case-studies/gumroad/img1.webp", "case-studies/gumroad/img1.png?v=8"],
  ["case-studies/linktree/img2.webp", "case-studies/linktree/img2.png?v=8"],
  ["case-studies/linktree/img3.webp", "case-studies/linktree/img3.png?v=8"],
  ["case-studies/linktree/img4.webp", "case-studies/linktree/img4.png?v=8"],
];

let touched = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const [from, to] of swaps) {
    h = h.split(`/assets/images/${from}`).join(`/assets/images/${to}`);
    // avoid double ?v=
    h = h.replace(/\?v=8\?v=\d+/g, "?v=8");
  }
  // also bump integration02 if not already
  h = h.replace(
    /\/assets\/images\/integration02\.png(?:\?v=\d+)?/g,
    "/assets/images/integration02.png?v=8"
  );
  if (h !== before) {
    fs.writeFileSync(f, h);
    touched++;
    console.log("updated", f);
  }
}
console.log("html touched", touched);
