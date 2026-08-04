import fs from "fs";

const jsPath =
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js";
let js = fs.readFileSync(jsPath, "utf8");

const start = js.indexOf(
  '_loadFunc(e,t,i){let r=e.split(","),s=[];for(let d=0;d<r.length;d++)s.push(r[d].trim());'
);
if (start < 0) {
  console.error("FontItem _loadFunc not found");
  process.exit(1);
}

const endMarker =
  "_onLoaderLoad(e,t){this.content=t,e(t)}_onLoaderLoading(e,t){e.dispatch(t.loaded/t.total)}}FontItem";
const end = js.indexOf(endMarker, start);
if (end < 0) {
  console.error("FontItem end not found");
  // try shorter
  const alt = js.indexOf("_onLoaderLoad(e,t){this.content=t,e(t)}", start);
  console.log("alt", alt, js.slice(alt, alt + 120));
  process.exit(1);
}

const original = js.slice(start, end);
console.log("Found FontItem loader length", original.length);

const replacement =
  "_loadFunc(e,t,i){try{i&&i.dispatch&&i.dispatch(1)}catch(n){}t&&t();}";
js = js.slice(0, start) + replacement + js.slice(end);
fs.writeFileSync(jsPath, js, "utf8");
console.log("Patched FontItem OK");
