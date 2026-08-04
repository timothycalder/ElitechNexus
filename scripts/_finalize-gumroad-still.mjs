import fs from "fs";

const still = "public/assets/images/case-studies/gumroad/img-from-video.png";
console.log("still exists", fs.existsSync(still), fs.existsSync(still) && fs.statSync(still).size);

let h = fs.readFileSync("public/customers/gumroad/index.html", "utf8");

// Ensure body video replacement uses the extracted still
h = h.replace(
  /<img src="\/assets\/images\/case-studies\/gumroad\/(?:img-from-video\.png\?v=1|cover\.webp)"[^>]*>/g,
  '<img src="/assets/images/case-studies/gumroad/img-from-video.png?v=2" alt="Gumroad collaboration" style="width:100%;height:auto;display:block;border-radius:0.75rem;">'
);

// Also if any remaining video.mp4 refs
h = h.replace(
  /\/assets\/images\/case-studies\/gumroad\/video\.mp4/g,
  "/assets/images/case-studies/gumroad/img-from-video.png?v=2"
);

// Upgrade header cover to the video still for consistency (optional - user said remain image from first video frame)
// Keep cover.webp in header OR swap to still - swapping makes the hero match the collaboration scene
h = h.replace(
  'src="assets/images/case-studies/gumroad/cover.webp"',
  'src="/assets/images/case-studies/gumroad/img-from-video.png?v=2"'
);

fs.writeFileSync("public/customers/gumroad/index.html", h);

const body = h.replace(/<style id="elitechnexus-no-video-css">[\s\S]*?<\/style>/, "");
console.log({
  hasVideo: /<video/i.test(body),
  hasMp4: body.includes("video.mp4"),
  hasStill: body.includes("img-from-video.png"),
  hasPlayBtn: /<(button|a)[^>]*(vimeo|youtube)-preview__play-button/.test(body),
});
