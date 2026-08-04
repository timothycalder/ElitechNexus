import fs from "fs";

const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";
let js = fs.readFileSync(jsPath, "utf8");

const heroFrom =
  'this.video.src=settings.VIDEO_PATH+"home_hero.mp4",this.video.load(),this.videoTexture=this.sharedUniforms.u_texture.value=new VideoTexture(this.video),this.videoTexture.minFilter=LinearFilter';
const heroTo =
  'this.isVideoLoaded=!0,this.videoTexture=this.sharedUniforms.u_texture.value=new DataTexture(new Uint8Array([20,16,28,255]),1,1),this.videoTexture.needsUpdate=!0,this.videoTexture.minFilter=LinearFilter';

const trailerFrom =
  'this.video.src=settings.VIDEO_PATH+"videoTrailer.mp4",this.video.load(),this.videoTexture=new VideoTexture(this.video)';
const trailerTo =
  'this.isVideoLoaded=!0,this.videoTexture=new DataTexture(new Uint8Array([20,16,28,255]),1,1),this.videoTexture.needsUpdate=!0';

if (!js.includes(heroFrom)) {
  console.error("hero video pattern not found");
  process.exit(1);
}
if (!js.includes(trailerFrom)) {
  console.error("trailer video pattern not found");
  process.exit(1);
}

js = js.replace(heroFrom, heroTo).replace(trailerFrom, trailerTo);
fs.writeFileSync(jsPath, js, "utf8");
console.log("JS video loads disabled");

for (const v of [
  "D:/Company Website(ElitechNexus)/public/visual-3d/assets/videos/home_hero.mp4",
  "D:/Company Website(ElitechNexus)/public/visual-3d/assets/videos/videoTrailer.mp4",
]) {
  if (fs.existsSync(v)) {
    fs.unlinkSync(v);
    console.log("deleted", v.split("/").pop());
  }
}

console.log(
  "remaining mp4 refs:",
  (js.match(/\.mp4/g) || []).length,
  "home_hero left?",
  js.includes("home_hero.mp4"),
  "trailer left?",
  js.includes("videoTrailer.mp4")
);
