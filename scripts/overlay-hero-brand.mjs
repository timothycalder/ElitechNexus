import fs from "fs";

const path = "public/index.html";
let html = fs.readFileSync(path, "utf8");

const needle =
  '<div id="home-hero__main-visual-wrapper"> <div id="home-hero__main-visual-text">';
const overlays =
  '<div id="home-hero__main-visual-wrapper"> <div id="home-hero__brand-tagline" aria-hidden="true">Build more with Elitechnexus</div> <div id="home-hero__brand-name" aria-hidden="true">Elitechnexus</div> <div id="home-hero__main-visual-text">';

if (!html.includes('id="home-hero__brand-name"')) {
  if (!html.includes(needle)) {
    console.error("insert point not found");
    process.exit(1);
  }
  html = html.replace(needle, overlays);
  console.log("overlays inserted");
} else {
  console.log("overlays already present");
}

if (!html.includes("elitechnexus-hero-brand")) {
  const css = `<style id="elitechnexus-hero-brand">
#home-hero__brand-tagline{position:absolute;left:5.5%;top:7%;width:72%;height:6.5%;display:flex;align-items:center;padding-left:0.2em;font-size:.92em;font-weight:500;color:rgba(170,195,220,.92);background:#0c1624;z-index:3;pointer-events:none}
#home-hero__brand-name{position:absolute;left:17.8%;top:16.8%;width:58%;height:13%;display:flex;align-items:center;padding-left:0.15em;font-size:2.1em;font-weight:700;color:#fff;line-height:1;background:#101b2c;z-index:3;pointer-events:none;letter-spacing:-0.01em}
@media (max-width:939.98px){#home-hero__brand-name{font-size:1.75em}}
@media (max-width:359.98px){#home-hero__brand-name{font-size:1.45em}}
</style>`;
  html = html.replace("<head>", `<head>${css}`);
  console.log("styles inserted");
}

fs.writeFileSync(path, html, "utf8");
console.log("ok");
