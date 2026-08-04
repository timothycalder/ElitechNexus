import fs from "fs";

const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";
let js = fs.readFileSync(jsPath, "utf8");

const from =
  "this.needsFakeMouseInteractive=(Math.floor(visuals.startTime/0.85)!==Math.floor(this.prevStartTime/0.85)),this.interactiveRatio=math.saturate(this.interactiveRatio+t*10),softBodyTets.updateMouseProj(t),this.needsFakeMouseInteractive&&(softBodyTets.fakeInitialMouseInteraction(t,this.interactivePattern),this.interactivePattern=(this.interactivePattern+1)%2),softBodyTets.preSolveMouse(t,this.interactiveRatio),this.needsFakeMouseInteractive&&(this.needsFakeMouseInteractive=!1),this.prevStartTime=visuals.startTime;";

// Continuous ambient orbit forces every frame (works even when mouse is still).
// preSolveMouse only applies when mouseProj != mouseProjPrev, so we drive both.
const to =
  "this.interactiveRatio=1,softBodyTets.updateMouseProj(t),(()=>{const st=visuals.startTime,a=st*1.35,b=st*1.05,px=Math.sin(a)*.55,py=Math.cos(b)*.4,qx=Math.sin(a+.2)*.55,qy=Math.cos(b+.2)*.4;softBodyTets.mouseProjPrev.set(px+input.mouseXY.x*.15,py+input.mouseXY.y*.15,0),softBodyTets.mouseProj.set(qx+input.mouseXY.x*.15,qy+input.mouseXY.y*.15,0),softBodyTets.mouseVel.subVectors(softBodyTets.mouseProj,softBodyTets.mouseProjPrev).multiplyScalar(1.25/t)})(),softBodyTets.preSolveMouse(t,1),this.prevStartTime=visuals.startTime;";

if (!js.includes(from)) {
  console.error("SoftBody interaction block not found");
  const k = js.indexOf("needsFakeMouseInteractive=");
  console.log(js.slice(k, k + 350));
  process.exit(1);
}

js = js.replace(from, to);
fs.writeFileSync(jsPath, js, "utf8");
console.log("Continuous idle SoftBody animation enabled");
console.log("old pulse gone?", !js.includes("Math.floor(visuals.startTime/0.85)"));
