import fs from "fs";
import path from "path";
import sharp from "sharp";

const SVC = "public/assets/images/services";
const OUT = "public/assets/images";
const V = 24;

async function cover(src, w, h, dest) {
  const tmp = dest + ".tmp.png";
  const srcPath = path.join(SVC, src.endsWith(".png") ? src : `${src}.png`);
  await sharp(srcPath)
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("wrote", dest);
}

const map = [
  ["integration01.png", "mentor", 1636, 756],
  ["integration02.png", "fde", 1636, 756],
  ["integration03.png", "jobs", 1636, 756],
  ["home-integration-mobile-1.png", "interview", 750, 1200],
  ["home-integration-mobile-2.png", "ai", 750, 1200],
  ["home-integration-mobile-3.png", "security", 750, 1200],
];

// detect actual mobile sizes
for (const name of ["home-integration-mobile-1.png", "home-integration-mobile-2.png", "home-integration-mobile-3.png", "integration02.png", "integration03.png"]) {
  const p = path.join(OUT, name);
  if (fs.existsSync(p)) {
    const m = await sharp(p).metadata();
    console.log("size", name, m.width + "x" + m.height);
  }
}

await cover("mentor", 1636, 756, path.join(OUT, "integration01.png"));
const i2 = await sharp(path.join(OUT, "integration02.png")).metadata();
const i3 = await sharp(path.join(OUT, "integration03.png")).metadata();
await cover("fde", i2.width, i2.height, path.join(OUT, "integration02.png"));
await cover("jobs", i3.width, i3.height, path.join(OUT, "integration03.png"));

for (const name of ["home-integration-mobile-1.png", "home-integration-mobile-2.png", "home-integration-mobile-3.png"]) {
  const p = path.join(OUT, name);
  const m = await sharp(p).metadata();
  const key = name.includes("1") ? "interview" : name.includes("2") ? "ai" : "security";
  await cover(key, m.width, m.height, p);
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/integration0([123])\.png(?:\?v=\d+)?/g, `integration0$1.png?v=${V}`);
html = html.replace(/home-integration-mobile-([123])\.png(?:\?v=\d+)?/g, `home-integration-mobile-$1.png?v=${V}`);
fs.writeFileSync("public/index.html", html);
console.log("cache busted");
