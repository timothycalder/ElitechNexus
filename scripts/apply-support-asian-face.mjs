/**
 * Apply Asian-face coaching revision to live site images that still show the old Unsplash woman.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const V_SUPPORT = 87;
const V_ROUTE = 87;

const asianClose =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/coaching-asian-realistic.png";
const asianWide =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/support-01-asian-realistic.png";

function backup(p) {
  const bak = p + ".pre-asian.bak";
  if (fs.existsSync(p) && !fs.existsSync(bak)) fs.copyFileSync(p, bak);
}

async function replaceJpeg(src, dest, { w, h, position = "attention" } = {}) {
  backup(dest);
  let pipeline = sharp(src);
  if (w && h) pipeline = pipeline.resize(w, h, { fit: "cover", position });
  await pipeline
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(dest);
  console.log("wrote", dest);
}

// Close crop used on income route card 13
const meta13 = await sharp("public/assets/images/income-routes/13.jpg").metadata();
await replaceJpeg(asianClose, "public/assets/images/income-routes/13.jpg", {
  w: meta13.width,
  h: meta13.height,
  position: "attention",
});

// Also keep coaching pool in sync (already done earlier, refresh again)
await replaceJpeg(asianClose, "public/assets/images/unique/bento-match-v1/coaching.jpg", {
  w: 1200,
  h: 1500,
  position: "attention",
});

// Wide two-person support card — prefer new wide gen if present, else close crop
const wideSrc = fs.existsSync(asianWide) ? asianWide : asianClose;
if (fs.existsSync("public/assets/images/income-routes/support/01.jpg")) {
  const m = await sharp("public/assets/images/income-routes/support/01.jpg").metadata();
  await replaceJpeg(wideSrc, "public/assets/images/income-routes/support/01.jpg", {
    w: m.width,
    h: m.height,
    position: "centre",
  });
}

for (const p of [
  "public/assets/images/unique/exclusive-v3/sup-01.jpg",
  "public/assets/images/unique/support-pool/01.jpg",
  "public/assets/images/income-routes/support-bak/01.jpg",
]) {
  if (!fs.existsSync(p)) continue;
  const m = await sharp(p).metadata();
  await replaceJpeg(wideSrc, p, { w: m.width, h: m.height, position: "centre" });
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /(\/assets\/images\/income-routes\/support\/01\.jpg)(?:\?v=\d+)?/g,
  `$1?v=${V_SUPPORT}`
);
html = html.replace(
  /(\/assets\/images\/income-routes\/13\.jpg)(?:\?v=\d+)?/g,
  `$1?v=${V_ROUTE}`
);
fs.writeFileSync("public/index.html", html);
console.log("html cache bumped support=01 v=" + V_SUPPORT + " route/13 v=" + V_ROUTE);

// Verify refs
const h = fs.readFileSync("public/index.html", "utf8");
for (const needle of [
  "income-routes/support/01.jpg",
  "income-routes/13.jpg",
]) {
  const m = [...h.matchAll(new RegExp(needle.replace(".", "\\.") + "(?:\\?v=\\d+)?", "g"))];
  console.log(needle, m.map((x) => x[0]));
}
