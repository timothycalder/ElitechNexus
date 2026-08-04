import { Jimp } from "jimp";
import fs from "fs";

const src =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/hero_el_nobg.png";
const out = "public/assets/images/home-hero/hero_layer_0.png";

const img = await Jimp.read(src);
img.resize({ w: 1052, h: 1024 });
await img.write(out);
console.log("hero updated");

let h = fs.readFileSync("public/index.html", "utf8");
h = h.replace(/hero_layer_0\.png(?:\?v=\d+)?/g, "hero_layer_0.png?v=6");
fs.writeFileSync("public/index.html", h);
console.log("index hero cache busted");
