import fs from "fs";

const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";
let js = fs.readFileSync(jsPath, "utf8");

const cls = js.indexOf("class HomeHeroSection");
if (cls < 0) throw new Error("HomeHeroSection missing");

// There are two update methods; the second overwrites the stub and crashes.
// Replace the full update(e){...} that follows our stub.
const stub = "init(){this.hasInit=!0}update(){return}";
const stubAt = js.indexOf(stub, cls);
if (stubAt < 0) throw new Error("stub not found");

const secondUpdate = js.indexOf("update(e){if(!this.hasInit)return;", stubAt);
if (secondUpdate < 0) throw new Error("second update not found");

// Find end of this update method: next method at same class level.
// Look for "}play(){" or "}pause(){" or "}destroy" or "const homeHeroSection"
const endMarkers = [
  "}play(){",
  "}pause(){",
  "}destroy(){",
  "}show(){",
  "}hide(){",
];
let end = -1;
let used = "";
for (const m of endMarkers) {
  const at = js.indexOf(m, secondUpdate);
  if (at > 0 && (end < 0 || at < end)) {
    end = at;
    used = m;
  }
}
const homeHeroConst = js.indexOf("const homeHeroSection=new HomeHeroSection", secondUpdate);
if (homeHeroConst > 0 && (end < 0 || homeHeroConst < end)) {
  // class ends just before const — find last } before const
  end = js.lastIndexOf("}", homeHeroConst);
  used = "before const homeHeroSection";
}

if (end < 0) throw new Error("could not find end of second update");

console.log("second update from", secondUpdate, "to", end, "via", used);
console.log("preview end:", js.slice(end, end + 80));

// Replace second update with no-op (keep leading } from previous method)
 // secondUpdate points at "update(e){..."
const before = js.slice(0, secondUpdate);
const after = js.slice(end); // starts with "}play" or similar OR "}" before const

// If end is the closing brace of update itself (before const), after should start at that }
// We want: update(e){return} + rest starting at methods after update
let rest;
if (used === "before const homeHeroSection") {
  // end is the } closing update; keep from that } onward... actually lastIndexOf } is update's close
  // so we replace update...} with update(e){return}
  rest = js.slice(end); // starts with }
  js = before + "update(e){return" + rest;
} else {
  // end starts with "}play(){" — the } closes update
  rest = js.slice(end);
  js = before + "update(e){return" + rest;
}

fs.writeFileSync(jsPath, js, "utf8");
console.log("neutralized second HomeHeroSection.update");

// Keep soft-body continuously animated (otherwise it settles after ~1.5s fake nudge)
js = fs.readFileSync(jsPath, "utf8");
const fakeFrom =
  "this.needsFakeMouseInteractive=!1,visuals.startTime>=1&&this.prevStartTime<1?this.needsFakeMouseInteractive=!0:visuals.startTime>=1.5&&this.prevStartTime<1.5&&(this.needsFakeMouseInteractive=!0)";
const fakeTo =
  "this.needsFakeMouseInteractive=visuals.startTime>0.2"; // continuous subtle interaction while visible

if (!js.includes(fakeFrom)) {
  console.warn("fake interaction pattern not found — dumping nearby");
  const k = js.indexOf("needsFakeMouseInteractive=!1,visuals.startTime");
  console.log(js.slice(k, k + 220));
} else {
  js = js.replace(fakeFrom, fakeTo);
  fs.writeFileSync(jsPath, js, "utf8");
  console.log("enabled continuous soft-body motion");
}

console.log(
  "second full update still present?",
  js.includes("update(e){if(!this.hasInit)return;siteHeader.isTransparent")
);
