import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
// Extract flow left header and chat texts
for (const key of [
  "home-hero__flow-visual-left-header",
  "flow-visual-chat-item-text",
  "home-hero__flow-visual-right-header",
  "hero_layer_",
  "hero-steps-",
]) {
  const i = h.indexOf(key);
  console.log("\n==", key, i);
  if (i >= 0) console.log(h.slice(i, i + 280).replace(/\s+/g, " "));
}
