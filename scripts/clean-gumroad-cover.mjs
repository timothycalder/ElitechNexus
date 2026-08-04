/**
 * Clean gumroad cover: remove center Play-video scar, keep natural abstract look.
 * Then confirm HTML: cover-still in first part, collaboration-still in second part.
 */
import fs from "fs";
import sharp from "sharp";

const IMG2 =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-8dc1d31e-0e95-442d-bf5f-6f3bf6cf1cf2.png";
const COVER = "public/assets/images/case-studies/gumroad/cover-still.png";

const meta = await sharp(IMG2).metadata();
const w = meta.width;
const h = meta.height;

// Full-image heavy blur as natural filler for center
const fullBlur = await sharp(IMG2).blur(40).png().toBuffer();

// Center region size matching the play button area
const patchW = Math.round(w * 0.38);
const patchH = Math.round(h * 0.22);
const left = Math.round((w - patchW) / 2);
const top = Math.round((h - patchH) / 2);

const centerBlur = await sharp(fullBlur)
  .extract({ left, top, width: patchW, height: patchH })
  .png()
  .toBuffer();

// Soft feathered oval mask so edges blend
const maskSvg = Buffer.from(`
<svg width="${patchW}" height="${patchH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="white" stop-opacity="1"/>
      <stop offset="70%" stop-color="white" stop-opacity="1"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`);

const masked = await sharp(centerBlur)
  .composite([{ input: await sharp(maskSvg).png().toBuffer(), blend: "dest-in" }])
  .png()
  .toBuffer();

await sharp(IMG2)
  .composite([{ input: masked, left, top }])
  .png()
  .toFile(COVER);

await sharp(COVER).webp({ quality: 90 }).toFile("public/assets/images/case-studies/gumroad/cover.webp");

// Bump cache
let html = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
html = html.replace(/cover-still\.png\?v=\d+/g, "cover-still.png?v=11");
html = html.replace(/collaboration-still\.png\?v=\d+/g, "collaboration-still.png?v=11");
fs.writeFileSync("public/customers/gumroad/index.html", html);

console.log("clean cover written", w, h);
