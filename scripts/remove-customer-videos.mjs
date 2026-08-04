/**
 * Remove customer collaboration videos — keep still images only (like Bilt).
 * - Strip Vimeo/YouTube play buttons
 * - Replace <video> blocks with <img>
 * - Extract first frame from gumroad video.mp4 when possible
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const customers = ["bilt", "ramp", "gumroad", "nubank", "crossmint", "linktree"];

function extractGumroadFrame() {
  const mp4 = "public/assets/images/case-studies/gumroad/video.mp4";
  const out = "public/assets/images/case-studies/gumroad/img-from-video.png";
  if (!fs.existsSync(mp4)) {
    console.log("no gumroad mp4");
    return null;
  }
  // Prefer ffmpeg
  try {
    execSync(
      `ffmpeg -y -ss 0.5 -i "${mp4}" -frames:v 1 -q:v 2 "${out}"`,
      { stdio: "pipe" }
    );
    if (fs.existsSync(out)) {
      console.log("extracted frame via ffmpeg", out);
      return "/assets/images/case-studies/gumroad/img-from-video.png?v=1";
    }
  } catch (e) {
    console.log("ffmpeg failed:", e.message?.slice(0, 200));
  }
  // Fallback: use existing cover or img1
  if (fs.existsSync("public/assets/images/case-studies/gumroad/cover.webp")) {
    return "/assets/images/case-studies/gumroad/cover.webp";
  }
  if (fs.existsSync("public/assets/images/case-studies/gumroad/img1.png")) {
    return "/assets/images/case-studies/gumroad/img1.png?v=8";
  }
  return null;
}

function stripPlayControls(html) {
  let h = html;
  // Remove Vimeo play button
  h = h.replace(
    /<button id="vimeo-preview__play-button">[\s\S]*?<\/button>/g,
    ""
  );
  // Remove YouTube play link
  h = h.replace(
    /<a id="youtube-preview__play-button"[^>]*>[\s\S]*?<\/a>/g,
    ""
  );
  // Remove data-code (Vimeo id) so SPA can't mount player
  h = h.replace(
    /(<div id="case-study__video")\s+data-code="[^"]*"/g,
    "$1"
  );
  // Replace any <video>...</video> with image
  h = h.replace(/<video[\s\S]*?<\/video>/gi, (block) => {
    const src =
      (block.match(/src="([^"]+\.mp4)"/i) || [])[1] ||
      "";
    // Prefer extracted still; else cover next to path
    let img = "/assets/images/case-studies/gumroad/img-from-video.png?v=1";
    if (src.includes("gumroad")) {
      // keep
    } else if (src) {
      img = src.replace(/\.mp4.*/i, "-poster.png");
    }
    // If extracted file missing, use cover
    if (
      img.includes("img-from-video") &&
      !fs.existsSync("public/assets/images/case-studies/gumroad/img-from-video.png")
    ) {
      img = "/assets/images/case-studies/gumroad/cover.webp";
    }
    return `<img src="${img}" alt="Collaboration still" style="width:100%;height:auto;display:block;border-radius:0.75rem;">`;
  });
  return h;
}

// Also hide play UI via CSS globally on customer pages (belt + suspenders)
const HIDE_CSS = `<style id="elitechnexus-no-video-css">
#vimeo-preview__play-button,
#youtube-preview__play-button,
#case-study__video video,
.case-study video {
  display: none !important;
  pointer-events: none !important;
}
#vimeo-preview__image-wrapper {
  cursor: default !important;
}
#case-study__video[data-code] {
  /* neutralize vimeo hook */
}
#case-study__video {
  pointer-events: none;
}
#case-study__video img {
  pointer-events: auto;
}
</style>`;

const frameSrc = extractGumroadFrame();
console.log("gumroad still:", frameSrc);

let n = 0;
for (const page of customers) {
  const file = `public/customers/${page}/index.html`;
  let h = fs.readFileSync(file, "utf8");
  const before = h;
  h = stripPlayControls(h);

  // If gumroad still extracted, ensure any leftover video src refs become img
  if (frameSrc && page === "gumroad") {
    h = h.replace(
      /src="\/assets\/images\/case-studies\/gumroad\/video\.mp4"/g,
      `src="${frameSrc}"`
    );
  }

  const cssRe = /<style id="elitechnexus-no-video-css">[\s\S]*?<\/style>/;
  if (cssRe.test(h)) h = h.replace(cssRe, HIDE_CSS);
  else h = h.replace("</head>", HIDE_CSS + "</head>");

  if (h !== before || true) {
    fs.writeFileSync(file, h);
    n++;
    const hasPlay =
      h.includes("vimeo-preview__play-button") ||
      h.includes("youtube-preview__play-button");
    const hasVideo = /<video[\s\S]*?<\/video>/i.test(h);
    console.log(page, { hasPlay, hasVideo, dataCode: /data-code=/.test(h) });
  }
}

// customers index + homepage: hide any play overlays if present
for (const file of ["public/customers/index.html", "public/index.html"]) {
  if (!fs.existsSync(file)) continue;
  let h = fs.readFileSync(file, "utf8");
  const cssRe = /<style id="elitechnexus-no-video-css">[\s\S]*?<\/style>/;
  if (cssRe.test(h)) h = h.replace(cssRe, HIDE_CSS);
  else h = h.replace("</head>", HIDE_CSS + "</head>");
  h = stripPlayControls(h);
  fs.writeFileSync(file, h);
  console.log("patched", file);
}

console.log("done", n);
