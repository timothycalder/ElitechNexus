import fs from "fs";
import { Jimp } from "jimp";
import path from "path";

const htmlPath = "public/index.html";
let html = fs.readFileSync(htmlPath, "utf8");

// Remove black-box overlay styles
html = html.replace(/<style id="elitechnexus-hero-brand">[\s\S]*?<\/style>/, "");

// Remove overlay elements
html = html.replace(
  /<div id="home-hero__brand-tagline"[^>]*>[\s\S]*?<\/div>\s*/g,
  ""
);
html = html.replace(
  /<div id="home-hero__brand-name"[^>]*>[\s\S]*?<\/div>\s*/g,
  ""
);

fs.writeFileSync(htmlPath, html, "utf8");
console.log("removed overlays", !html.includes("home-hero__brand-name"));

// Install clean generated asset as hero_layer_0.png at original size
const generatedCandidates = [
  path.resolve(
    "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/hero_layer_0_clean.png"
  ),
  path.resolve(
    "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/hero_layer_0_elitechnexus.png"
  ),
];

const orig = "public/assets/images/home-hero/hero_layer_0.orig.png";
const out = "public/assets/images/home-hero/hero_layer_0.png";
const origImg = await Jimp.read(orig);
const { width, height } = origImg.bitmap;
console.log("target size", width, height);

let srcPath = generatedCandidates.find((p) => fs.existsSync(p));
if (!srcPath) {
  console.error("generated image missing");
  process.exit(1);
}
console.log("using", srcPath);

const gen = await Jimp.read(srcPath);
gen.resize({ w: width, h: height });
await gen.write(out);
console.log("wrote", out);
