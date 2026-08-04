import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
let idx = 0;
let n = 0;
while ((idx = h.indexOf("flow-visual-chat-item", idx)) >= 0 && n < 4) {
  console.log("\n#", n, h.slice(idx, idx + 400).replace(/\s+/g, " "));
  idx++;
  n++;
}
