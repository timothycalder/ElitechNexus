/**
 * 1) Fix hero_layer_0: remove black/dark EL plate, composite transparent SVG logo
 * 2) Add hero_layer_3 + hero_layer_4 (5 stacked main visuals)
 * 3) Patch HTML + JS carousel for 5 cards
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO = "public/assets/images/home-hero";
const UNIQUE = "public/assets/images/unique";
const LOGO_SVG = "public/assets/images/elitechnexus-logo.svg";
const V = 44;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 3000) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

/** Paint transparent EL mark onto plate-colored cover matching local bg */
async function transparentEl(w, h) {
  // Render SVG large with true alpha, then fit
  return sharp(fs.readFileSync(LOGO_SVG))
    .resize(w, h, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function fixLayer0Logo() {
  const dest = path.join(HERO, "hero_layer_0.png");
  const { data, info } = await sharp(dest)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Locate dark plate / black logo block in brand zone
  let minX = 9999,
    minY = 9999,
    maxX = 0,
    maxY = 0,
    n = 0;
  for (let y = 190; y < 360; y++) {
    for (let x = 40; x < 250; x++) {
      const i = (y * W + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (r < 40 && g < 50 && b < 70) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        n++;
      }
    }
  }

  // Fallback to known slot from earlier enforce script
  if (n < 80) {
    minX = 50;
    minY = 200;
    maxX = 174;
    maxY = 339;
    console.log("using fallback logo slot");
  } else {
    // pad a bit
    minX = Math.max(0, minX - 4);
    minY = Math.max(0, minY - 4);
    maxX = Math.min(W - 1, maxX + 4);
    maxY = Math.min(H - 1, maxY + 4);
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  // Sample surrounding plate blue (right of logo, same row)
  const sx = Math.min(W - 1, maxX + 30);
  const sy = Math.round((minY + maxY) / 2);
  const si = (sy * W + sx) * 4;
  const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };
  console.log("logo slot", { minX, minY, bw, bh, n, bg });

  const cover = await sharp({
    create: { width: bw, height: bh, channels: 4, background: bg },
  })
    .png()
    .toBuffer();

  // EL mark sized to slot — letters only, no plate
  const markW = Math.round(bw * 0.92);
  const markH = Math.round(bh * 0.72);
  const el = await transparentEl(markW, markH);
  const meta = await sharp(el).metadata();
  const left = minX + Math.round((bw - meta.width) / 2);
  const top = minY + Math.round((bh - meta.height) / 2);

  const tmp = dest + ".tmp.png";
  await sharp(dest)
    .composite([
      { input: cover, left: minX, top: minY },
      { input: el, left, top },
    ])
    .png()
    .toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("fixed layer0 logo (transparent EL)");
}

async function photoPanel(src, dest, title, subtitle) {
  const W = 1052;
  const H = 1024;
  const photo = await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 0.98 })
    .png()
    .toBuffer();

  const badgeY = H - 130;
  const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="30%" stop-color="#071018" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#071018" stop-opacity="0.88"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="36" y="${badgeY}" width="${Math.min(W - 72, 680)}" height="86" rx="16"
      fill="rgba(8,16,28,0.8)" stroke="rgba(110,220,200,0.5)"/>
    <text x="56" y="${badgeY + 36}" fill="#E8FFF8" font-family="Arial,Helvetica,sans-serif"
      font-size="26" font-weight="700">${esc(title)}</text>
    <text x="56" y="${badgeY + 64}" fill="rgba(200,230,220,0.92)" font-family="Arial,Helvetica,sans-serif"
      font-size="15">${esc(subtitle)}</text>
  </svg>`);

  const tmp = dest + ".tmp.png";
  await sharp(photo).composite([{ input: overlay, left: 0, top: 0 }]).png().toFile(tmp);
  fs.copyFileSync(tmp, dest);
  fs.unlinkSync(tmp);
  console.log("panel", path.basename(dest));
}

async function makeExtraLayers() {
  fs.mkdirSync(UNIQUE, { recursive: true });
  const mockInterview = path.join(UNIQUE, "hero-mock-interview.jpg");
  const portfolio = path.join(UNIQUE, "hero-portfolio.jpg");

  // Distinct Unsplash photos (not used in IR/support pools previously for hero)
  await download(
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=82",
    mockInterview
  );
  await download(
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=82",
    portfolio
  );

  await photoPanel(
    mockInterview,
    path.join(HERO, "hero_layer_3.png"),
    "Mock interviews that stick",
    "Live practice with feedback until your answers land"
  );
  await photoPanel(
    portfolio,
    path.join(HERO, "hero_layer_4.png"),
    "Portfolio that proves skill",
    "Package projects so employers and clients trust your work"
  );
}

function wireHtmlFive() {
  let html = fs.readFileSync("public/index.html", "utf8");

  // Insert layer 3 + 4 after layer 2 if missing
  if (!html.includes("hero_layer_3.png")) {
    const layer2Block =
      /(<div id="home-hero__main-visual-2" class="home-hero__main-visual-item">[\s\S]*?<\/div>\s*<\/div>)/;
    const extra = `$1 <div id="home-hero__main-visual-3" class="home-hero__main-visual-item"> <div class="home-hero__main-visual-item-inner"> <div class="o-rimlight"></div> <img src="/assets/images/home-hero/hero_layer_3.png?v=${V}"> </div> </div> <div id="home-hero__main-visual-4" class="home-hero__main-visual-item"> <div class="home-hero__main-visual-item-inner"> <div class="o-rimlight"></div> <img src="/assets/images/home-hero/hero_layer_4.png?v=${V}"> </div> </div>`;
    if (!layer2Block.test(html)) throw new Error("could not find main-visual-2 block");
    html = html.replace(layer2Block, extra);
    console.log("inserted main-visual-3 and 4");
  }

  html = html.replace(/hero_layer_([0-4])\.png(?:\?v=\d+)?/g, `hero_layer_$1.png?v=${V}`);
  fs.writeFileSync("public/index.html", html);
  console.log("html layers cache v=", V);
}

function patchJsCarousel() {
  const jsPath = "public/_astro/hoisted.Dadqo-kW.js";
  let js = fs.readFileSync(jsPath, "utf8");

  // Click wrap: was 3 cards
  const beforeClick = "this.mainVisualTargetIndexVal=i+math.loop(e-i,0,3)%3";
  const afterClick = "this.mainVisualTargetIndexVal=i+math.loop(e-i,0,5)%5";
  if (!js.includes(beforeClick) && !js.includes(afterClick)) {
    throw new Error("click carousel pattern not found");
  }
  if (js.includes(beforeClick)) {
    js = js.replace(beforeClick, afterClick);
    console.log("patched click %5");
  }

  // Relative loop range for stacking: -.5 .. N-0.5
  const beforeLoop = "math.loop(S-this.mainVisualIndexVal,-.5,2.5)";
  const afterLoop = "math.loop(S-this.mainVisualIndexVal,-.5,4.5)";
  if (js.includes(beforeLoop)) {
    js = js.replace(beforeLoop, afterLoop);
    console.log("patched loop 4.5");
  } else if (!js.includes(afterLoop)) {
    throw new Error("loop range pattern not found");
  }

  // Stagger entrance used last index 2
  const beforeStagger = "math.fit(homePage.time,.15*(2-S),1+.15*(2-S),0,1,ease.quadOut)";
  const afterStagger = "math.fit(homePage.time,.15*(4-S),1+.15*(4-S),0,1,ease.quadOut)";
  if (js.includes(beforeStagger)) {
    js = js.replace(beforeStagger, afterStagger);
    console.log("patched stagger 4");
  }

  // Edge fade used 2.25/2.5 for 3-card wrap — extend for 5
  js = js.replace(
    "math.fit(E,2.25,2.5,1,0)*math.fit(E,1,2,1,Math.max(b._focusRatio*.75,.5))*math.fit(E,-.5,-.25,0,1)",
    "math.fit(E,4.25,4.5,1,0)*math.fit(E,1,2,1,Math.max(b._focusRatio*.75,.5))*math.fit(E,-.5,-.25,0,1)"
  );
  js = js.replace(
    "math.fit(E,2,2.5,0,5,ease.cubicIn)",
    "math.fit(E,4,4.5,0,5,ease.cubicIn)"
  );

  // z-index base: keep cards ordered with more headroom
  js = js.replace("b.style.zIndex=6-Math.floor(E*2)", "b.style.zIndex=10-Math.floor(E*2)");

  fs.writeFileSync(jsPath, js);

  // Bust JS cache in HTML
  let html = fs.readFileSync("public/index.html", "utf8");
  html = html.replace(
    /hoisted\.Dadqo-kW\.js(?:\?v=[^"']*)?/g,
    "hoisted.Dadqo-kW.js?v=hero5"
  );
  fs.writeFileSync("public/index.html", html);
  console.log("js carousel patched for 5 cards");
}

await fixLayer0Logo();
await makeExtraLayers();
wireHtmlFive();
patchJsCarousel();
console.log("done");
