import fs from "fs";

for (const page of ["ramp", "gumroad", "nubank", "crossmint", "bilt", "linktree"]) {
  const h = fs.readFileSync(`public/customers/${page}/index.html`, "utf8");
  // strip our css for accurate check
  const body = h.replace(/<style id="elitechnexus-no-video-css">[\s\S]*?<\/style>/, "");
  const vimeoBtn = /<button[^>]*id="vimeo-preview__play-button"[\s\S]*?<\/button>/.test(body);
  const ytBtn = /<a[^>]*id="youtube-preview__play-button"[\s\S]*?<\/a>/.test(body);
  const dataCode = /id="case-study__video"[^>]*data-code=/.test(body);
  const video = /<video[\s\S]*?<\/video>/i.test(body);
  const mp4 = body.includes("video.mp4");
  console.log(page, { vimeoBtn, ytBtn, dataCode, video, mp4 });
}
