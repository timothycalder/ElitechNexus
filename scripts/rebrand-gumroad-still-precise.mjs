/**
 * Precise Devin→Elitechnexus rebrand on gumroad Slack still.
 * Reset from video frame first, then patch only the avatar + name areas.
 */
import fs from "fs";
import sharp from "sharp";
import { execFileSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

const MP4 = "public/assets/images/case-studies/gumroad/video.mp4";
const STILL = "public/assets/images/case-studies/gumroad/img-from-video.png";
const LOGO = "public/assets/images/elitechnexus-logo.svg";

// Re-extract clean frame
execFileSync(
  ffmpegPath,
  ["-y", "-ss", "0.4", "-i", MP4, "-frames:v", "1", "-update", "1", STILL],
  { stdio: "pipe" }
);
console.log("re-extracted frame");

const { data, info } = await sharp(STILL).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
const ch = info.channels;

function px(x, y) {
  const i = (y * w + x) * ch;
  return [data[i], data[i + 1], data[i + 2]];
}

function isMoleculeBlue(r, g, b) {
  // Devin molecule: cyan-blue dots
  return b > 190 && g > 140 && r < 140 && b - r > 50 && g - r > 30 && b > g - 20;
}

// Collect blue pixels, then find densest ~40x40 window (avatar size)
const blues = [];
for (let y = 100; y < 500; y++) {
  for (let x = 60; x < 250; x++) {
    const [r, g, b] = px(x, y);
    if (isMoleculeBlue(r, g, b)) blues.push({ x, y });
  }
}
console.log("blue count", blues.length);

let best = null;
const WIN = 44;
for (const seed of blues) {
  let c = 0;
  let minX = seed.x,
    minY = seed.y,
    maxX = seed.x,
    maxY = seed.y;
  for (const p of blues) {
    if (Math.abs(p.x - seed.x) < WIN / 2 && Math.abs(p.y - seed.y) < WIN / 2) {
      c++;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }
  if (!best || c > best.c) best = { c, minX, minY, maxX, maxY, cx: seed.x, cy: seed.y };
}
console.log("best cluster", best);

if (!best || best.c < 15) {
  console.error("could not find Devin logo cluster reliably");
  process.exit(1);
}

const pad = 3;
const cx = Math.round((best.minX + best.maxX) / 2);
const cy = Math.round((best.minY + best.maxY) / 2);
const avatar = 36;
const box = {
  left: Math.max(0, cx - Math.floor(avatar / 2)),
  top: Math.max(0, cy - Math.floor(avatar / 2)),
  width: avatar,
  height: avatar,
};
console.log("avatar box", box);

const composites = [];

// White patch over molecule
composites.push({
  input: await sharp({
    create: {
      width: box.width,
      height: box.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .png()
    .toBuffer(),
  left: box.left,
  top: box.top,
});

const logoSize = Math.min(box.width, box.height) - 2;
composites.push({
  input: await sharp(LOGO)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer(),
  left: box.left + 1,
  top: box.top + 1,
});

// Name "Devin" sits to the right of avatar, same vertical center-ish
const nameLeft = box.left + box.width + 10;
const nameTop = box.top + Math.max(0, Math.floor(box.height / 2) - 14);
composites.push({
  input: await sharp({
    create: {
      width: 130,
      height: 22,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .png()
    .toBuffer(),
  left: nameLeft,
  top: nameTop,
});
composites.push({
  input: await sharp(
    Buffer.from(`<svg width="140" height="22" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="16" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#1d1c1d">Elitechnexus</text>
    </svg>`)
  )
    .png()
    .toBuffer(),
  left: nameLeft,
  top: nameTop,
});

// Status line under name (italic gray) — cover "Devin is running..."
const statusTop = nameTop + 22;
composites.push({
  input: await sharp({
    create: {
      width: Math.min(780, w - nameLeft - 10),
      height: 18,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .png()
    .toBuffer(),
  left: nameLeft,
  top: statusTop,
});
composites.push({
  input: await sharp(
    Buffer.from(`<svg width="780" height="18" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="13" font-family="Arial, Helvetica, sans-serif" font-size="12" font-style="italic" fill="#616061">Elitechnexus is running, you can send messages in this thread! Messages starting with 'aside' will be ignored. (open webapp)</text>
    </svg>`)
  )
    .png()
    .toBuffer(),
  left: nameLeft,
  top: statusTop,
});

// Find "@Devin" in Sahil message — look above avatar for message text
let atHit = null;
for (let y = Math.max(120, box.top - 120); y < box.top - 10; y++) {
  for (let x = box.left; x < box.left + 120; x++) {
    const [r, g, b] = px(x, y);
    if (r < 35 && g < 35 && b < 35) {
      // likely text; check horizontal run ~45px (length of @Devin)
      let dark = 0;
      for (let dx = 0; dx < 48; dx++) {
        const [rr, gg, bb] = px(Math.min(w - 1, x + dx), y);
        if (rr < 45 && gg < 45 && bb < 45) dark++;
      }
      if (dark > 20) {
        atHit = { x, y };
        break;
      }
    }
  }
  if (atHit) break;
}
console.log("atHit", atHit);

if (atHit) {
  const left = Math.max(0, atHit.x - 1);
  const top = Math.max(0, atHit.y - 13);
  composites.push({
    input: await sharp({
      create: {
        width: 100,
        height: 18,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .png()
      .toBuffer(),
    left,
    top,
  });
  composites.push({
    input: await sharp(
      Buffer.from(`<svg width="110" height="18" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="13" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#1d1c1d">@Elitechnexus</text>
      </svg>`)
    )
      .png()
      .toBuffer(),
    left,
    top,
  });
}

const tmp = STILL + ".tmp.png";
await sharp(STILL).composite(composites).png().toFile(tmp);
fs.renameSync(tmp, STILL);
console.log("patched", STILL, "with", composites.length, "layers");

// Update gumroad html cache buster
let html = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
html = html.replace(
  /img-from-video\.png\?v=\d+/g,
  "img-from-video.png?v=4"
);
fs.writeFileSync("public/customers/gumroad/index.html", html);
