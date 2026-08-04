import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC =
  "C:\\Users\\AI ML Engineer\\.cursor\\projects\\d-Company-Website-ElitechNexus\\assets";
const DEST = "public/assets/images";
const BACKUP = path.join(DEST, "_backup-devin-mockups");

const MAP = [
  ["use-cases01-el.png", "use-cases01.png"],
  ["use-cases02-el.png", "use-cases02.png"],
  ["use-cases03-el.png", "use-cases03.png"],
  ["use-cases-mobile01-el.png", "use-cases-mobile01.png"],
  ["use-cases-mobile02-el.png", "use-cases-mobile02.png"],
  ["use-cases-mobile03-el.png", "use-cases-mobile03.png"],
  ["bento01-el.png", "bento01.png"],
  ["bento02-el.png", "bento02.png"],
  ["bento03-el.png", "bento03.png"],
  ["bento-hover03-el.png", "bento-hover03.png"],
  ["bento-mobile01-el.png", "bento-mobile01.png"],
  ["bento-mobile02-el.png", "bento-mobile02.png"],
  ["bento-mobile03-el.png", "bento-mobile03.png"],
  ["card01-el.png", "card01.png"],
  ["card02-line-el.png", "card02-line.png"],
  ["card03-line-el.png", "card03-line.png"],
  ["integration01-el.png", "integration01.png"],
  ["integration02-el.png", "integration02.png"],
  ["integration03-el.png", "integration03.png"],
  ["home-integration-mobile-1-el.png", "home-integration-mobile-1.png"],
  ["home-integration-mobile-2-el.png", "home-integration-mobile-2.png"],
  ["home-integration-mobile-3-el.png", "home-integration-mobile-3.png"],
  ["enterprise-slide01-el.png", "enterprise-slide01.png"],
  ["enterprise-slide02-el.png", "enterprise-slide02.png"],
  ["enterprise-slide03-el.png", "enterprise-slide03.png"],
  ["enterprise-slide-mobile02-el.png", "enterprise-slide-mobile02.png"],
  ["enterprise-slide-mobile03-el.png", "enterprise-slide-mobile03.png"],
];

if (!fs.existsSync(BACKUP)) fs.mkdirSync(BACKUP, { recursive: true });

const missing = [];
const installed = [];
const failed = [];

for (const [srcName, destRel] of MAP) {
  const src = path.join(SRC, srcName);
  const dest = path.join(DEST, destRel);
  if (!fs.existsSync(src)) {
    missing.push(srcName);
    continue;
  }
  if (!fs.existsSync(dest)) {
    missing.push("DEST missing " + destRel);
    continue;
  }

  const bak = path.join(BACKUP, destRel.replaceAll("/", "_"));
  if (!fs.existsSync(bak)) {
    try {
      fs.copyFileSync(dest, bak);
    } catch (e) {
      console.warn("backup fail", destRel, e.message);
    }
  }

  const meta = await sharp(dest).metadata();
  const tmp = dest + ".el.tmp.png";
  try {
    await sharp(src)
      .resize(meta.width, meta.height, { fit: "cover", position: "centre" })
      .png()
      .toFile(tmp);

    try {
      fs.copyFileSync(tmp, dest);
      fs.unlinkSync(tmp);
      installed.push(destRel);
    } catch (e) {
      // locked: keep sidecar and we'll point HTML at it
      const side = dest.replace(/\.png$/i, "-el.png");
      fs.copyFileSync(tmp, side);
      fs.unlinkSync(tmp);
      failed.push({ destRel, side: path.basename(side), err: e.message });
      console.warn("overwrite locked, wrote", side);
    }
  } catch (e) {
    failed.push({ destRel, err: e.message });
    console.error("process fail", destRel, e.message);
  }
}

console.log("installed", installed.length, installed);
console.log("missing", missing);
console.log("locked/failed", failed);
