import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://archive-devin-ai.lusion.co";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public");

const SEED_PATHS = [
  "/",
  "/enterprise",
  "/enterprise/",
  "/pricing",
  "/pricing/",
  "/customers",
  "/customers/",
  "/customers/nubank",
  "/customers/nubank/",
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/assets/images/enterprise/enterprise-features-icons.png",
  "/assets/textures/LDR_RGB1_0.png",
  "/assets/fonts/IBMPlexMono-Regular.woff2",
];

const queue = new Set(SEED_PATHS);
const seen = new Set();
const failed = [];

function toLocalPath(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.endsWith("/")) p += "index.html";
  else if (!path.extname(p) && !p.includes(".")) {
    // pretty routes like /pricing -> /pricing/index.html
    p = `${p}/index.html`;
  }
  return path.join(OUT, p.replace(/^\//, "").replace(/\//g, path.sep));
}

function absolutize(ref, fromPath) {
  try {
    if (
      !ref ||
      ref.startsWith("data:") ||
      ref.startsWith("blob:") ||
      ref.startsWith("mailto:") ||
      ref.startsWith("javascript:") ||
      ref.startsWith("https://use.typekit.net")
    ) {
      return null;
    }
    // Skip false positives from minified JS / CSS relative crumbs
    if (ref.includes("iVBORw0KGgo")) return null;
    if (ref.length < 4) return null;
    if (ref.startsWith("/_astro/") && !/\.[a-zA-Z0-9]+$/.test(ref.split("?")[0])) return null;
    if (ref.startsWith("//")) ref = `https:${ref}`;
    const baseUrl = new URL(fromPath, BASE);
    const abs = new URL(ref, baseUrl);
    if (abs.origin !== new URL(BASE).origin) return null;
    // Reject tiny/_astro junk after resolution
    if (abs.pathname.startsWith("/_astro/") && !/\.[a-zA-Z0-9]+$/.test(abs.pathname)) return null;
    if (abs.pathname.split("/").filter(Boolean).every((p) => p.length <= 2) && abs.pathname.startsWith("/_astro")) {
      return null;
    }
    return abs.pathname + abs.search;
  } catch {
    return null;
  }
}

function extractRefs(text, fromPath, contentType = "") {
  const refs = new Set();
  const patterns = [
    /(?:href|src|poster|data-src)=["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    /["'](\/_astro\/[^"']+)["']/g,
    /["'](\/assets\/[^"']+)["']/g,
    /["'](assets\/(?:images|models|textures|audios)\/[^"']+)["']/g,
    /(?:srcset)=["']([^"']+)["']/gi,
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      const raw = m[1];
      if (raw.includes(",")) {
        // srcset
        for (const part of raw.split(",")) {
          const u = part.trim().split(/\s+/)[0];
          const abs = absolutize(u, fromPath);
          if (abs) refs.add(abs.split("?")[0]);
        }
      } else {
        const abs = absolutize(raw.startsWith("assets/") ? `/${raw}` : raw, fromPath);
        if (abs) refs.add(abs.split("?")[0]);
      }
    }
  }

  // From JS Settings path concatenations: settings.IMAGE_PATH+"foo.png"
  if (contentType.includes("javascript") || fromPath.endsWith(".js")) {
    const concatRe =
      /settings\.(MODEL|IMAGE|TEXTURE|AUDIO)_PATH\s*\+\s*["'`]([^"'`]+)["'`]/g;
    let m;
    while ((m = concatRe.exec(text))) {
      const dir = {
        MODEL: "models",
        IMAGE: "images",
        TEXTURE: "textures",
        AUDIO: "audios",
      }[m[1]];
      refs.add(`/assets/${dir}/${m[2]}`);
    }
    const fileRe =
      /["'`]((?:assets\/)?(?:images|models|textures|audios|fonts)\/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]+)["'`]/g;
    while ((m = fileRe.exec(text))) {
      const p = m[1].startsWith("/") ? m[1] : `/${m[1]}`;
      refs.add(p);
    }
  }

  // CSS local url() refs under /assets
  if (contentType.includes("css") || fromPath.endsWith(".css")) {
    const cssRe = /url\(\s*["']?(\/?assets\/[^"')]+)["']?\s*\)/g;
    let m;
    while ((m = cssRe.exec(text))) {
      const p = m[1].startsWith("/") ? m[1] : `/${m[1]}`;
      refs.add(p);
    }
  }

  return [...refs];
}

async function download(urlPath) {
  const clean = urlPath.split("?")[0];
  if (seen.has(clean)) return;
  seen.add(clean);

  const url = `${BASE}${clean}`;
  const localPath = toLocalPath(clean);

  process.stdout.write(`GET ${clean}\n`);

  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DevinArchiveMirror/1.0)",
        Accept: "*/*",
      },
      redirect: "follow",
    });
  } catch (err) {
    failed.push({ path: clean, error: String(err) });
    return;
  }

  if (!res.ok) {
    // soft-fail speculative .buf probes
    if (res.status === 404) return;
    failed.push({ path: clean, error: `HTTP ${res.status}` });
    return;
  }

  await fs.mkdir(path.dirname(localPath), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(localPath, buf);

  const ctype = res.headers.get("content-type") || "";
  const isText =
    ctype.includes("text/") ||
    ctype.includes("javascript") ||
    ctype.includes("json") ||
    ctype.includes("xml") ||
    clean.endsWith(".html") ||
    clean.endsWith(".js") ||
    clean.endsWith(".css") ||
    clean.endsWith(".svg") ||
    !path.extname(clean);

  if (!isText) return;

  let text = buf.toString("utf8");

  // Rewrite absolute archive host to local root-relative
  text = text
    .replaceAll("https://archive-devin-ai.lusion.co/", "/")
    .replaceAll("https://archive-devin-ai.lusion.co", "");

  // For pretty routes saved as .../index.html already handled by path
  if (clean.endsWith(".html") || !path.extname(clean) || ctype.includes("text/html")) {
    await fs.writeFile(localPath, text, "utf8");
  } else if (clean.endsWith(".js") || clean.endsWith(".css") || ctype.includes("javascript") || ctype.includes("css")) {
    await fs.writeFile(localPath, text, "utf8");
  }

  for (const ref of extractRefs(text, clean, ctype)) {
    if (!seen.has(ref.split("?")[0])) queue.add(ref.split("?")[0]);
  }

  // Also queue directory-style page variants
  if (!path.extname(clean) && !clean.endsWith("/")) {
    queue.add(`${clean}/`);
  }
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  while (queue.size > 0) {
    const batch = [...queue];
    queue.clear();
    // concurrency 6
    const size = 6;
    for (let i = 0; i < batch.length; i += size) {
      const slice = batch.slice(i, i + size);
      await Promise.all(slice.map(download));
    }
  }

  // Write a small mirror report
  const report = {
    downloaded: [...seen].sort(),
    failed,
    count: seen.size,
  };
  await fs.writeFile(path.join(ROOT, "mirror-report.json"), JSON.stringify(report, null, 2));
  console.log(`\nDone. ${seen.size} paths attempted. Failures: ${failed.length}`);
  if (failed.length) console.log(failed.slice(0, 20));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
