import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const res = await fetch("https://incomeremotely.com/");
const html = await res.text();
fs.writeFileSync("scripts/_ir-page.html", html);

const imgs = [
  ...html.matchAll(
    /(?:src|srcset|data-src)=["']([^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)/gi
  ),
].map((m) => m[1].split(/\s+/)[0]);

const abs = [...new Set(imgs)].map((u) => {
  if (u.startsWith("http")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("/")) return "https://incomeremotely.com" + u;
  return "https://incomeremotely.com/" + u;
});

console.log(abs.join("\n"));
console.log("count", abs.length);
fs.writeFileSync("scripts/_ir-imgs.txt", abs.join("\n"));

// Also look for unsplash or common CDN patterns in inline styles
const bg = [...html.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/['"]/g, ""));
console.log("\nbg urls", bg.slice(0, 30));
