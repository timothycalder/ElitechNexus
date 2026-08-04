import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:3010/visual-3d/";
const out = process.argv[3] || "D:/Company Website(ElitechNexus)/public/visual-3d/preview.png";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("requestfailed", (req) => errors.push("FAIL " + req.url() + " " + req.failure()?.errorText));
page.on("response", (res) => {
  if (res.status() >= 400) errors.push(res.status() + " " + res.url());
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: out, fullPage: false });
console.log("screenshot", out);
console.log("errors", errors);
await browser.close();
process.exit(errors.length ? 1 : 0);
