/**
 * Gumroad media layout fix:
 * - FIRST part (case-study cover): user's pink abstract still WITHOUT Play video button
 * - SECOND part (content): user's Slack collaboration still (natural screenshot)
 * Also strip play buttons on all customer pages.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMG1 =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-8fbb5e35-d87c-479e-ac35-0a79ee643c0b.png";
const IMG2 =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-8dc1d31e-0e95-442d-bf5f-6f3bf6cf1cf2.png";

const OUT_DIR = "public/assets/images/case-studies/gumroad";
const COVER_OUT = path.join(OUT_DIR, "cover-still.png");
const COLLAB_OUT = path.join(OUT_DIR, "collaboration-still.png");

async function removePlayButton(src, dest) {
  const img = sharp(src);
  const meta = await img.metadata();
  const w = meta.width;
  const h = meta.height;
  console.log("cover source", w, h);

  // Sample colors from edges (away from center button) to rebuild a clean center patch
  const { data, info } = await sharp(src)
    .resize(Math.min(w, 1200), null, { withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rw = info.width;
  const rh = info.height;
  const ch = info.channels;

  // Average color from four corners
  const sample = (x, y) => {
    const i = (y * rw + x) * ch;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const pts = [
    sample(20, 20),
    sample(rw - 21, 20),
    sample(20, rh - 21),
    sample(rw - 21, rh - 21),
    sample(Math.floor(rw / 4), Math.floor(rh / 2)),
    sample(Math.floor((3 * rw) / 4), Math.floor(rh / 2)),
  ];
  const avg = [0, 0, 0];
  for (const p of pts) {
    avg[0] += p[0];
    avg[1] += p[1];
    avg[2] += p[2];
  }
  avg[0] = Math.round(avg[0] / pts.length);
  avg[1] = Math.round(avg[1] / pts.length);
  avg[2] = Math.round(avg[2] / pts.length);

  // Soft radial-ish patch over center button area
  const patchW = Math.round(w * 0.42);
  const patchH = Math.round(h * 0.28);
  const left = Math.round((w - patchW) / 2);
  const top = Math.round((h - patchH) / 2);

  // Create blurred crop of surrounding area as natural fill
  const blurFill = await sharp(src)
    .extract({
      left: Math.max(0, left - 40),
      top: Math.max(0, top - 40),
      width: Math.min(w - Math.max(0, left - 40), patchW + 80),
      height: Math.min(h - Math.max(0, top - 40), patchH + 80),
    })
    .blur(28)
    .resize(patchW, patchH, { fit: "cover" })
    .png()
    .toBuffer();

  const solid = await sharp({
    create: {
      width: patchW,
      height: patchH,
      channels: 4,
      background: { r: avg[0], g: avg[1], b: avg[2], alpha: 180 },
    },
  })
    .png()
    .toBuffer();

  await sharp(src)
    .composite([
      { input: blurFill, left, top },
      { input: solid, left, top, blend: "over" },
    ])
    .png()
    .toFile(dest);

  // Also write webp cover
  await sharp(dest).webp({ quality: 88 }).toFile(path.join(OUT_DIR, "cover.webp"));
  console.log("wrote cover without play button", dest);
}

async function prepareCollab(src, dest) {
  // Use user's Slack screenshot as-is (already shows Elitechnexus branding)
  await sharp(src).png().toFile(dest);
  console.log("wrote collaboration still", dest);
}

await removePlayButton(IMG2, COVER_OUT);
await prepareCollab(IMG1, COLLAB_OUT);

// --- Update gumroad HTML ---
let html = fs.readFileSync("public/customers/gumroad/index.html", "utf8");

// First part: cover still (no play button)
html = html.replace(
  /(<div id="vimeo-preview__image-wrapper">\s*<img\s+src=")[^"]+("\s+alt="[^"]*")/,
  `$1/assets/images/case-studies/gumroad/cover-still.png?v=10$2`
);

// Remove any leftover play buttons in this page
html = html.replace(/<button id="vimeo-preview__play-button">[\s\S]*?<\/button>/g, "");
html = html.replace(/<a id="youtube-preview__play-button"[^>]*>[\s\S]*?<\/a>/g, "");
html = html.replace(/(<div id="case-study__video")\s+data-code="[^"]*"/g, "$1");

// Second part: collaboration still in content (replace previous img-from-video block)
html = html.replace(
  /<img src="\/assets\/images\/case-studies\/gumroad\/img-from-video\.png\?v=\d+"[^>]*>/g,
  `<img src="/assets/images/case-studies/gumroad/collaboration-still.png?v=10" alt="Elitechnexus collaboration" style="width:100%;height:auto;display:block;border-radius:0.75rem;">`
);

// If no content collab image yet, insert after first content paragraph block near img1
if (!html.includes("collaboration-still.png")) {
  html = html.replace(
    /(<p><img src="\/assets\/images\/case-studies\/gumroad\/img1\.png[^"]*"[^>]*><\/p>)/,
    `<p><img src="/assets/images/case-studies/gumroad/collaboration-still.png?v=10" alt="Elitechnexus collaboration" style="width:100%;height:auto;display:block;border-radius:0.75rem;"></p>$1`
  );
}

const NO_VIDEO_CSS = `<style id="elitechnexus-no-video-css">
#vimeo-preview__play-button,
#youtube-preview__play-button,
#case-study__video video,
.case-study video,
#icon-preview + button,
a[id*="play-button"],
button[id*="play-button"]{
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
}
#vimeo-preview__image-wrapper{ cursor: default !important; }
#case-study__video{ pointer-events: none; }
#case-study__video img{ pointer-events: auto; width: 100%; height: auto; display: block; border-radius: 0.75rem; }
</style>`;

html = html.replace(/<style id="elitechnexus-no-video-css">[\s\S]*?<\/style>/, NO_VIDEO_CSS);
fs.writeFileSync("public/customers/gumroad/index.html", html);

// Strip play buttons on ALL customer pages + ensure CSS
function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

let n = 0;
for (const f of walk("public/customers")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  h = h.replace(/<button id="vimeo-preview__play-button">[\s\S]*?<\/button>/g, "");
  h = h.replace(/<a id="youtube-preview__play-button"[^>]*>[\s\S]*?<\/a>/g, "");
  h = h.replace(/(<div id="case-study__video")\s+data-code="[^"]*"/g, "$1");
  if (/elitechnexus-no-video-css/.test(h)) {
    h = h.replace(/<style id="elitechnexus-no-video-css">[\s\S]*?<\/style>/, NO_VIDEO_CSS);
  } else {
    h = h.replace("</head>", NO_VIDEO_CSS + "</head>");
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
  }
}
console.log("customer pages updated", n);

// Verify gumroad
const g = fs.readFileSync("public/customers/gumroad/index.html", "utf8");
console.log({
  cover: g.includes("cover-still.png"),
  collab: g.includes("collaboration-still.png"),
  playBtn:
    /<(button|a)[^>]*(vimeo|youtube)-preview__play-button/.test(
      g.replace(/<style id="elitechnexus-no-video-css">[\s\S]*?<\/style>/, "")
    ),
  videoTag: /<video/i.test(g),
});
