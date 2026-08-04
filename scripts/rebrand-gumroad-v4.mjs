/**
 * Final clean pass: avatar/name/status + @Devin at y≈214 (below Sahil header)
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

const white = (width, height) =>
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

const composites = [];
const box = { left: 120, top: 285, width: 36, height: 36 };

composites.push({ input: await white(box.width, box.height), left: box.left, top: box.top });
composites.push({
  input: await sharp(LOGO)
    .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer(),
  left: box.left + 2,
  top: box.top + 2,
});

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

composites.push({ input: await white(760, 18), left: nameLeft, top: nameTop + 24 });
composites.push({
  input: await sharp(
    Buffer.from(`<svg width="760" height="18" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="13" font-family="Arial, Helvetica, sans-serif" font-size="12" font-style="italic" fill="#616061">Elitechnexus is running, you can send messages in this thread! Messages starting with 'aside' will be ignored. (open webapp)</text>
    </svg>`)
  )
    .png()
    .toBuffer(),
  left: nameLeft,
  top: nameTop + 24,
});

// @Devin mention — below Sahil header (bands showed it ~y 210-225)
const mention = { left: 163, top: 214, width: 58, height: 16 };
composites.push({
  input: await white(mention.width, mention.height),
  left: mention.left,
  top: mention.top,
});
composites.push({
  input: await sharp(
    Buffer.from(`<svg width="110" height="16" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600" fill="#1264A3">@Elitechnexus</text>
    </svg>`)
  )
    .png()
    .toBuffer(),
  left: mention.left,
  top: mention.top,
});

const tmp = STILL + ".tmp.png";
await sharp(STILL).composite(composites).png().toFile(tmp);
fs.renameSync(tmp, STILL);

let html = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
html = html.replace(/img-from-video\.png\?v=\d+/g, "img-from-video.png?v=8");
fs.writeFileSync("public/customers/gumroad/index.html", html);

// verify crop of message line
await sharp(STILL)
  .extract({ left: 140, top: 165, width: 450, height: 80 })
  .png()
  .toFile("scripts/_verify-msg.png");
console.log("done");
