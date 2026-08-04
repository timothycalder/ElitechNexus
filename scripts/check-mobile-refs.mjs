import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
for (const name of [
  "home-integration-mobile-1.png",
  "home-integration-mobile-2.png",
  "home-integration-mobile-3.png",
  "card01.png",
  "card02-line.png",
  "card03-line.png",
]) {
  const i = h.indexOf(name);
  console.log(name, i === -1 ? "NOT FOUND" : h.slice(i, i + name.length + 10));
}
