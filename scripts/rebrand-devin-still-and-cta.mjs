/**
 * 1) Rebrand gumroad Slack still: Devin → Elitechnexus (logo + name)
 * 2) Point all Get started CTAs → /login
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const STILL = "public/assets/images/case-studies/gumroad/img-from-video.png";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const OUT = "public/assets/images/case-studies/gumroad/img-from-video.png";

async function rebrandStill() {
  if (!fs.existsSync(STILL)) {
    console.log("still missing");
    return;
  }
  const img = sharp(STILL);
  const meta = await img.metadata();
  const { width, height } = meta;
  console.log("still size", width, height);

  // Raw for scanning
  const { data, info } = await sharp(STILL)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  function px(x, y) {
    const i = (y * w + x) * ch;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  }

  // Find Devin molecule logo: cluster of bright cyan/blue pixels on white
  // Typical RGB for Devin molecule: blue-ish ~ (80-160, 140-220, 220-255)
  const logoCandidates = [];
  for (let y = 80; y < Math.min(h, 700); y += 2) {
    for (let x = 40; x < Math.min(w, 200); x += 2) {
      const [r, g, b] = px(x, y);
      const isCyanBlue =
        b > 180 && g > 120 && g < 230 && r < 160 && b > r + 40 && g > r + 20;
      if (isCyanBlue) logoCandidates.push({ x, y });
    }
  }
  console.log("cyan logo pixels", logoCandidates.length);

  let logoBox = null;
  if (logoCandidates.length > 20) {
    let minX = Infinity,
      minY = Infinity,
      maxX = 0,
      maxY = 0;
    for (const p of logoCandidates) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    // expand a bit
    minX = Math.max(0, minX - 4);
    minY = Math.max(0, minY - 4);
    maxX = Math.min(w - 1, maxX + 4);
    maxY = Math.min(h - 1, maxY + 4);
    logoBox = { minX, minY, maxX, maxY, size: maxX - minX };
    console.log("logoBox", logoBox);
  }

  // Find dark text regions near logo for "Devin" — scan right of logo for black text on white
  // We'll cover a known-ish band: name + status line
  const composites = [];

  // White cover patches for text replacements (approximate from typical Slack layout)
  // Prefer measured logoBox to place EL logo + text
  if (logoBox) {
    const logoSize = Math.max(28, Math.min(48, logoBox.maxX - logoBox.minX + 8));
    const logoPng = await sharp(LOGO)
      .resize(logoSize, logoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    // Cover old molecule with white then place EL
    const coverW = Math.max(logoSize + 4, logoBox.maxX - logoBox.minX + 10);
    const coverH = Math.max(logoSize + 4, logoBox.maxY - logoBox.minY + 10);
    const white = await sharp({
      create: {
        width: coverW,
        height: coverH,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .png()
      .toBuffer();

    composites.push({ input: white, left: logoBox.minX - 2, top: logoBox.minY - 2 });
    composites.push({
      input: logoPng,
      left: logoBox.minX,
      top: logoBox.minY,
    });

    // Cover "Devin" name to the right of logo (short word)
    const nameLeft = logoBox.maxX + 8;
    const nameTop = logoBox.minY - 2;
    const nameCover = await sharp({
      create: {
        width: 70,
        height: 22,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .png()
      .toBuffer();
    composites.push({ input: nameCover, left: nameLeft, top: nameTop });

    const nameSvg = Buffer.from(`
      <svg width="160" height="24" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="17" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#1d1c1d">Elitechnexus</text>
      </svg>`);
    const nameImg = await sharp(nameSvg).png().toBuffer();
    composites.push({ input: nameImg, left: nameLeft, top: nameTop });

    // Cover status line "Devin is running..." under the name
    const statusTop = nameTop + 22;
    const statusCover = await sharp({
      create: {
        width: Math.min(720, w - nameLeft - 20),
        height: 20,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .png()
      .toBuffer();
    composites.push({ input: statusCover, left: nameLeft, top: statusTop });

    const statusSvg = Buffer.from(`
      <svg width="720" height="20" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="14" font-family="Arial, Helvetica, sans-serif" font-size="12" font-style="italic" fill="#616061">Elitechnexus is running, you can send messages in this thread! Messages starting with 'aside' will be ignored. (open webapp)</text>
      </svg>`);
    const statusImg = await sharp(statusSvg).png().toBuffer();
    composites.push({ input: statusImg, left: nameLeft, top: statusTop });
  }

  // Replace "@Devin" in Sahil's message — scan for dark text near top message area
  // Heuristic: cover a small region where @Devin typically sits after "Sahil" message start
  // Search for consecutive dark pixels forming short word after @
  // Simpler: cover common message body area for "@Devin " → "@Elitechnexus "
  // Find light-red is not needed; find black text "@" patterns by scanning mid area
  let atDevin = null;
  for (let y = 140; y < 320; y++) {
    for (let x = 80; x < 400; x++) {
      const [r, g, b] = px(x, y);
      // nearly black
      if (r < 40 && g < 40 && b < 40) {
        // check if this could be start of @Devin by looking at a run
        // sample rightward for text density
        let dark = 0;
        for (let dx = 0; dx < 50; dx++) {
          const [rr, gg, bb] = px(x + dx, y);
          if (rr < 50 && gg < 50 && bb < 50) dark++;
        }
        if (dark > 18) {
          atDevin = { x, y };
          break;
        }
      }
    }
    if (atDevin) break;
  }
  console.log("atDevin approx", atDevin);

  if (atDevin) {
    // Cover "@Devin" (~55px wide)
    const cover = await sharp({
      create: {
        width: 95,
        height: 18,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .png()
      .toBuffer();
    composites.push({
      input: cover,
      left: Math.max(0, atDevin.x - 2),
      top: Math.max(0, atDevin.y - 12),
    });
    const atSvg = Buffer.from(`
      <svg width="110" height="18" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="13" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#1d1c1d">@Elitechnexus</text>
      </svg>`);
    composites.push({
      input: await sharp(atSvg).png().toBuffer(),
      left: Math.max(0, atDevin.x - 2),
      top: Math.max(0, atDevin.y - 12),
    });
  }

  // Broader text replace: any remaining "Devin" visible as dark glyphs is hard;
  // also paint over APP badge area if needed — leave APP

  const tmp = "public/assets/images/case-studies/gumroad/_still-rebrand-tmp.png";
  await sharp(STILL).composite(composites).png().toFile(tmp);
  fs.renameSync(tmp, OUT);

  // Also write webp-friendly copy used as cover if referenced
  await sharp(OUT).webp({ quality: 90 }).toFile("public/assets/images/case-studies/gumroad/cover-elite.webp");

  console.log("rebranded still written", OUT, composites.length, "patches");
}

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

function fixGetStarted(html) {
  let h = html;
  const ids = [
    "site-header__button-cta",
    "site-footer__top-left-button",
    "site-menu__btn-1",
  ];
  for (const id of ids) {
    h = h.replace(
      new RegExp(`(<a[^>]*id="${id}"[^>]*href=")[^"]*(")`, "g"),
      "$1/login$2"
    );
    h = h.replace(
      new RegExp(`(<a[^>]*id="${id}"[^>]*?)\\s+target="_blank"`, "g"),
      "$1"
    );
  }
  h = h.replace(
    /(<a class="top__cta"[^>]*href=")[^"]*(")/g,
    "$1/login$2"
  );
  h = h.replace(
    /href="mailto:steven\.miller@elitechnexus\.com"([^>]*>\s*<span>Get started<\/span>)/g,
    'href="/login"$1'
  );
  return h;
}

function ensureLoginInFullnav(html) {
  // login already in FULL set typically
  return html;
}

await rebrandStill();

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  h = fixGetStarted(h);
  // bump gumroad still cache buster
  h = h.replace(
    /\/assets\/images\/case-studies\/gumroad\/img-from-video\.png\?v=\d+/g,
    "/assets/images/case-studies/gumroad/img-from-video.png?v=3"
  );
  h = h.replace(
    /src="\/assets\/images\/case-studies\/gumroad\/img-from-video\.png"/g,
    'src="/assets/images/case-studies/gumroad/img-from-video.png?v=3"'
  );
  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
  }
}
console.log("html files updated", n);

// verify CTA on homepage
const home = fs.readFileSync("public/index.html", "utf8");
const cta = home.match(/id="site-header__button-cta"[^>]*/);
const foot = home.match(/id="site-footer__top-left-button"[^>]*/);
console.log({ cta: cta?.[0], foot: foot?.[0] });
