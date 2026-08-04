import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC =
  "C:\\Users\\AI ML Engineer\\.cursor\\projects\\d-Company-Website-ElitechNexus\\assets";
const DEST = "public/assets/images";
const BACKUP = path.join(DEST, "_backup-devin-mockups");

const MAP = [
  ["integration02-el2.png", "integration02.png"],
  ["bilt-img1-el.png", "case-studies/bilt/img1.webp"],
  ["bilt-img2-el.png", "case-studies/bilt/img2.webp"],
  ["crossmint-img1-el.png", "case-studies/crossmint/img1.webp"],
  ["crossmint-img2-el.png", "case-studies/crossmint/img2.webp"],
  ["gumroad-img1-el.png", "case-studies/gumroad/img1.webp"],
  ["linktree-img2-el.png", "case-studies/linktree/img2.webp"],
  ["linktree-img3-el.png", "case-studies/linktree/img3.webp"],
  ["linktree-img4-el.png", "case-studies/linktree/img4.webp"],
];

if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });

for (const [srcName, destRel] of MAP) {
  const src = path.join(SRC, srcName);
  const dest = path.join(DEST, destRel);
  if (!fs.existsSync(src)) {
    console.error("missing src", srcName);
    continue;
  }
  if (!fs.existsSync(dest)) {
    console.error("missing dest", destRel);
    continue;
  }

  const bak = path.join(BACKUP, destRel.replaceAll("/", "_").replaceAll("\\", "_"));
  if (!fs.existsSync(bak)) fs.copyFileSync(dest, bak);

  const meta = await sharp(dest).metadata();
  const isWebp = dest.toLowerCase().endsWith(".webp");
  const tmp = dest + ".tmp";

  let pipe = sharp(src).resize(meta.width, meta.height, {
    fit: "cover",
    position: "centre",
  });
  if (isWebp) pipe = pipe.webp({ quality: 88 });
  else pipe = pipe.png();

  await pipe.toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("installed", destRel, `${meta.width}x${meta.height}`);
}

// cache-bust HTML refs for case studies + integration02
const names = [
  "integration02.png",
  "case-studies/bilt/img1.webp",
  "case-studies/bilt/img2.webp",
  "case-studies/crossmint/img1.webp",
  "case-studies/crossmint/img2.webp",
  "case-studies/gumroad/img1.webp",
  "case-studies/linktree/img2.webp",
  "case-studies/linktree/img3.webp",
  "case-studies/linktree/img4.webp",
];

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

let touched = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(/assets/images/${escaped})(?:\\?v=\\d+)?`, "g");
    h = h.replace(re, `$1?v=8`);
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    touched++;
    console.log("cache-bust", f);
  }
}
console.log("html touched", touched);
