import fs from "fs";

for (const page of ["ramp", "gumroad", "bilt", "nubank"]) {
  const h = fs.readFileSync(`public/customers/${page}/index.html`, "utf8");
  console.log("\n", page);
  console.log("play btn?", h.includes("vimeo-preview__play-button"), h.includes("youtube-preview__play-button"));
  console.log("video tag?", /<video[\s\S]*?<\/video>/i.test(h));
  console.log("data-code?", /data-code=/.test(h));
  const i = h.indexOf("play-button");
  if (i >= 0) console.log(h.slice(i - 40, i + 200).replace(/\s+/g, " "));
  // no-video css?
  console.log("css?", h.includes("elitechnexus-no-video-css"));
}
