import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push("console: " + msg.text());
});

await page.goto("http://127.0.0.1:3010/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const ui = document.getElementById("ui");
  const home = document.getElementById("home");
  const bento = document.getElementById("home-bento");
  const canvas = document.getElementById("canvas");
  const body = document.body;
  return {
    title: document.title,
    bodyTextLen: (body.innerText || "").trim().length,
    bodyTextSample: (body.innerText || "").trim().slice(0, 200),
    uiDisplay: ui ? getComputedStyle(ui).display : null,
    uiOpacity: ui ? getComputedStyle(ui).opacity : null,
    uiVisibility: ui ? getComputedStyle(ui).visibility : null,
    homeExists: !!home,
    homeDisplay: home ? getComputedStyle(home).display : null,
    bentoExists: !!bento,
    canvasW: canvas ? canvas.width : null,
    canvasH: canvas ? canvas.height : null,
    preloader: !!document.getElementById("preloader"),
    preloaderDisplay: document.getElementById("preloader")
      ? getComputedStyle(document.getElementById("preloader")).display
      : null,
  };
});

await page.screenshot({ path: "public/_debug-blank.png", fullPage: false });
fs.writeFileSync("public/_debug-blank.json", JSON.stringify({ info, errors: errors.slice(0, 30) }, null, 2));
console.log(JSON.stringify({ info, errors: errors.slice(0, 20) }, null, 2));
await browser.close();
