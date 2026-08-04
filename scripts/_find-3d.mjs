import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
for (const s of [
  "visual-3d",
  'id="canvas"',
  "three",
  "WebGL",
  "hoisted",
  "script src",
]) {
  console.log(s, h.includes(s), h.indexOf(s));
}

// list script tags
const scripts = [...h.matchAll(/<script[^>]*>/g)].map((m) => m[0]);
console.log("\nscripts:", scripts.slice(0, 30));

// canvas tags
const canvases = [...h.matchAll(/<canvas[^>]*>/g)].map((m) => m[0]);
console.log("\ncanvases:", canvases);
