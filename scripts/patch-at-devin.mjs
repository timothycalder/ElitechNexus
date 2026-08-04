import fs from "fs";
import sharp from "sharp";

const STILL = "public/assets/images/case-studies/gumroad/img-from-video.png";

const { data, info } = await sharp(STILL).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const ch = info.channels;
const px = (x, y) => {
  const i = (y * w + x) * ch;
  return [data[i], data[i + 1], data[i + 2]];
};

// Find "@Devin" — blue OR dark text starting with dense short run in Sahil message band
let hit = null;
for (let y = 175; y < 240; y++) {
  for (let x = 150; x < 280; x++) {
    const [r, g, b] = px(x, y);
    const blueish = b > 140 && g > 70 && r < 100 && b > r + 40;
    const dark = r < 50 && g < 50 && b < 50;
    if (!blueish && !dark) continue;
    let score = 0;
    for (let dx = 0; dx < 52; dx++) {
      const [rr, gg, bb] = px(x + dx, y);
      if (
        (bb > 140 && gg > 70 && rr < 100 && bb > rr + 40) ||
        (rr < 55 && gg < 55 && bb < 55)
      )
        score++;
    }
    // @Devin ~45-55px at 13px font
    if (score > 28 && score < 52) {
      hit = { x, y, score };
      break;
    }
  }
  if (hit) break;
}
console.log("hit", hit);

if (!hit) {
  // fallback known region from prior analysis
  hit = { x: 164, y: 210 };
  console.log("using fallback", hit);
}

const left = hit.x - 1;
const top = hit.y - 13;
const cover = await sharp({
  create: {
    width: 100,
    height: 18,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 255 },
  },
}).png().toBuffer();
const label = await sharp(
  Buffer.from(`<svg width="110" height="18" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="13" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600" fill="#1264A3">@Elitechnexus</text>
  </svg>`)
)
  .png()
  .toBuffer();

const tmp = STILL + ".tmp.png";
await sharp(STILL)
  .composite([
    { input: cover, left, top },
    { input: label, left, top },
  ])
  .png()
  .toFile(tmp);
fs.renameSync(tmp, STILL);

let html = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
html = html.replace(/img-from-video\.png\?v=\d+/g, "img-from-video.png?v=6");
fs.writeFileSync("public/customers/gumroad/index.html", html);
console.log("patched @Devin at", left, top);
