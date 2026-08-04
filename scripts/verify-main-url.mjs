import fs from "fs";
import http from "http";

const h = fs.readFileSync("public/index.html", "utf8");
const i = h.indexOf("visual-3d-frame");
console.log(h.slice(i, i + 140));
console.log(fs.readFileSync("public/visual-3d/index.html", "utf8").match(/base href="[^"]+"/)?.[0]);
console.log("3011 in home", (h.match(/3011/g) || []).length);

function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on("error", (e) => resolve(String(e.message)));
  });
}

console.log("home", await get("http://127.0.0.1:3010/"));
console.log("visual", await get("http://127.0.0.1:3010/visual-3d/"));
console.log("model", await get("http://127.0.0.1:3010/visual-3d/assets/models/POINTS.buf"));
console.log("3011", await get("http://127.0.0.1:3011/"));
