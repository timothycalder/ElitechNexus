import { chromium } from "playwright";

const url = "http://127.0.0.1:3011/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);

async function sample() {
  return page.evaluate(() => {
    const c = document.querySelector("#canvas");
    if (!c) return null;
    const ctx = c.getContext("webgl2") || c.getContext("webgl");
    // can't easily read pixels from webgl without preserveDrawingBuffer
    // compare toDataURL of a 2d copy via drawImage if possible
    try {
      const tmp = document.createElement("canvas");
      tmp.width = 64;
      tmp.height = 64;
      const tctx = tmp.getContext("2d");
      tctx.drawImage(c, 0, 0, 64, 64);
      return tmp.toDataURL().slice(0, 200) + ":" + tmp.toDataURL().length;
    } catch (e) {
      return "err:" + e.message;
    }
  });
}

const samples = [];
for (let i = 0; i < 6; i++) {
  await page.mouse.move(400 + i * 80, 300 + (i % 2) * 40);
  await page.waitForTimeout(1000);
  samples.push(await sample());
}

const unique = new Set(samples.filter(Boolean));
console.log("samples", samples.length, "unique", unique.size);
console.log("errors", errors.slice(0, 15));
await page.screenshot({
  path: "D:/Company Website(ElitechNexus)/public/visual-3d/preview-real.png",
});
await browser.close();
process.exit(errors.some((e) => e.includes("TypeError")) ? 1 : 0);
