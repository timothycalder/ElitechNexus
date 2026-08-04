/**
 * Clean rebrand of gumroad Slack still:
 * - Re-extract frame
 * - Replace Devin APP avatar + name + status (response header only)
 * - Replace blue @Devin mention in Sahil's message
 */
import fs from "fs";
import sharp from "sharp";
import { execFileSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

const MP4 = "public/assets/images/case-studies/gumroad/video.mp4";
const STILL = "public/assets/images/case-studies/gumroad/img-from-video.png";
const LOGO = "public/assets/images/elitechnexus-logo.svg";

execFileSync(
  ffmpegPath,
  ["-y", "-ss", "0.4", "-i", MP4, "-frames:v", "1", "-update", "1", STILL],
  { stdio: "pipe" }
);

const { data, info } = await sharp(STILL).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
const ch = info.channels;
const px = (x, y) => {
  const i = (y * w + x) * ch;
  return [data[i], data[i + 1], data[i + 2]];
};

const isMoleculeBlue = (r, g, b) =>
  b > 190 && g > 140 && r < 140 && b - r > 50 && g - r > 30;

const blues = [];
for (let y = 250; y < 360; y++) {
  for (let x = 90; x < 180; x++) {
    const [r, g, b] = px(x, y);
    if (isMoleculeBlue(r, g, b)) blues.push({ x, y });
  }
}

let best = null;
for (const seed of blues) {
  let c = 0,
    minX = seed.x,
    minY = seed.y,
    maxX = seed.x,
    maxY = seed.y;
  for (const p of blues) {
    if (Math.abs(p.x - seed.x) < 22 && Math.abs(p.y - seed.y) < 22) {
      c++;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }
  if (!best || c > best.c) best = { c, minX, minY, maxX, maxY };
}
const cx = Math.round((best.minX + best.maxX) / 2);
const cy = Math.round((best.minY + best.maxY) / 2);
const box = { left: cx - 18, top: cy - 18, width: 36, height: 36 };
console.log("avatar", box, "cluster", best.c);

// Slack mention blue (~#1264A3)
const isMentionBlue = (r, g, b) =>
  r > 10 && r < 80 && g > 80 && g < 150 && b > 140 && b < 220 && b > g && g > r;

const mentionPixels = [];
for (let y = 160; y < box.top - 20; y++) {
  for (let x = 140; x < 320; x++) {
    const [r, g, b] = px(x, y);
    if (isMentionBlue(r, g, b)) mentionPixels.push({ x, y });
  }
}
console.log("mention blues", mentionPixels.length);

let mentionBox = null;
if (mentionPixels.length > 30) {
  let minX = Infinity,
    minY = Infinity,
    maxX = 0,
    maxY = 0;
  for (const p of mentionPixels) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  // @Devin is short — take leftmost cluster width ~55-70
  mentionBox = {
    left: Math.max(0, minX - 2),
    top: Math.max(0, minY - 3),
    width: Math.min(95, maxX - minX + 8),
    height: Math.min(22, maxY - minY + 8),
  };
  // If detection spanned whole line, clamp width for @Devin only
  if (mentionBox.width > 90) mentionBox.width = 58;
  console.log("mentionBox", mentionBox);
}

const composites = [];

const white = async (width, height) =>
  sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .png()
    .toBuffer();

// Avatar
composites.push({ input: await white(box.width, box.height), left: box.left, top: box.top });
composites.push({
  input: await sharp(LOGO)
    .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer(),
  left: box.left + 2,
  top: box.top + 2,
});

// Name
const nameLeft = box.left + box.width + 10;
const nameTop = box.top + 4;
composites.push({ input: await white(128, 22), left: nameLeft, top: nameTop });
composites.push({
  input: await sharp(
    Buffer.from(`<svg width="130" height="22" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="16" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#1d1c1d">Elitechnexus</text>
    </svg>`)
  )
    .png()
    .toBuffer(),
  left: nameLeft,
  top: nameTop,
});

// Status
const statusTop = nameTop + 24;
composites.push({
  input: await white(Math.min(760, w - nameLeft - 8), 18),
  left: nameLeft,
  top: statusTop,
});
composites.push({
  input: await sharp(
    Buffer.from(`<svg width="760" height="18" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="13" font-family="Arial, Helvetica, sans-serif" font-size="12" font-style="italic" fill="#616061">Elitechnexus is running, you can send messages in this thread! Messages starting with 'aside' will be ignored. (open webapp)</text>
    </svg>`)
  )
    .png()
    .toBuffer(),
  left: nameLeft,
  top: statusTop,
});

// @Devin mention
if (mentionBox) {
  composites.push({
    input: await white(Math.max(mentionBox.width, 100), Math.max(mentionBox.height, 18)),
    left: mentionBox.left,
    top: mentionBox.top,
  });
  composites.push({
    input: await sharp(
      Buffer.from(`<svg width="110" height="18" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="13" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600" fill="#1264A3">@Elitechnexus</text>
      </svg>`)
    )
      .png()
      .toBuffer(),
    left: mentionBox.left,
    top: mentionBox.top,
  });
}

const tmp = STILL + ".tmp.png";
await sharp(STILL).composite(composites).png().toFile(tmp);
fs.renameSync(tmp, STILL);

let html = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
html = html.replace(/img-from-video\.png\?v=\d+/g, "img-from-video.png?v=5");
fs.writeFileSync("public/customers/gumroad/index.html", html);
console.log("done patches", composites.length);
