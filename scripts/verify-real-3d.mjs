import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:3011/";
const out = "D:/Company Website(ElitechNexus)/public/visual-3d/preview-real.png";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const reqs = [];
const status404 = [];

page.on("pageerror", (e) => errors.push("PAGE " + String(e)));
page.on("console", (msg) => {
  if (["error", "warning"].includes(msg.type())) errors.push(msg.type().toUpperCase() + " " + msg.text());
});
page.on("response", (res) => {
  const u = res.url();
  if (!u.includes("127.0.0.1") && !u.includes("localhost")) return;
  const short = u.replace(/^https?:\/\/[^/]+/, "");
  if (short.includes("/assets/") || short.includes("/_astro/")) {
    reqs.push(res.status() + " " + short);
    if (res.status() === 404) status404.push(short);
  }
});

await page.goto(url, { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
await page.waitForTimeout(5000);

// simulate scroll through experience
for (let i = 0; i < 20; i++) {
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(300);
}
await page.waitForTimeout(3000);
await page.screenshot({ path: out });

console.log("404s:", status404);
console.log(
  "models:",
  reqs.filter((r) => r.includes("/models/") || r.includes(".buf"))
);
console.log("errors:", errors.slice(0, 25));
console.log("screenshot", out);
await browser.close();
