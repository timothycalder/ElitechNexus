import fs from "fs";

const jsPath = "public/_astro/hoisted.Dadqo-kW.js";
let js = fs.readFileSync(jsPath, "utf8");
if (!js.includes("RIGHT_NAV_ORDERS=[3,0,2,1]")) {
  if (js.includes("RIGHT_NAV_ORDERS=[0,1,2,3]")) {
    console.log("already patched");
  } else {
    console.error("unexpected RIGHT_NAV_ORDERS");
    process.exit(1);
  }
} else {
  js = js.replace("RIGHT_NAV_ORDERS=[3,0,2,1]", "RIGHT_NAV_ORDERS=[0,1,2,3]");
  fs.writeFileSync(jsPath, js);
  console.log("patched RIGHT_NAV_ORDERS -> [0,1,2,3]");
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /hoisted\.Dadqo-kW\.js(?:\?v=[^"']*)?/g,
  "hoisted.Dadqo-kW.js?v=nav43"
);
fs.writeFileSync("public/index.html", html);
const ref = html.match(/hoisted\.Dadqo-kW\.js[^"']*/);
console.log("script ref", ref && ref[0]);
