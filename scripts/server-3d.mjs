import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "visual-3d"
);
const PORT = Number(process.env.PORT_3D || 3011);
const HOST = process.env.HOST || "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".buf": "application/octet-stream",
  ".bin": "application/octet-stream",
  ".webmanifest": "application/manifest+json",
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent((reqPath || "/").split("?")[0].split("#")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

async function tryFile(filePath) {
  try {
    const st = await fs.stat(filePath);
    if (st.isFile()) return filePath;
  } catch {}
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    let filePath = safeJoin(ROOT, req.url || "/");
    if (!filePath) {
      res.writeHead(400);
      res.end("Bad path");
      return;
    }
    let found = await tryFile(filePath);
    if (!found) found = await tryFile(path.join(filePath, "index.html"));
    if (!found && !path.extname(filePath)) found = await tryFile(filePath + ".html");

    const ext = path.extname(filePath).toLowerCase();
    const isAssetExt = [
      ".buf",
      ".bin",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".mp4",
      ".webm",
      ".js",
      ".css",
      ".woff",
      ".woff2",
      ".json",
      ".svg",
      ".ico",
    ].includes(ext);

    // Only SPA-fallback for navigations (no file extension), never for assets
    if (!found && !isAssetExt) {
      found = await tryFile(path.join(ROOT, "index.html"));
    }
    if (!found) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 " + (req.url || ""));
      return;
    }
    const foundExt = path.extname(found).toLowerCase();
    const data = await fs.readFile(found);
    res.writeHead(200, {
      "Content-Type": TYPES[foundExt] || "application/octet-stream",
      "Content-Length": data.length,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Real DDD 3D models from: ${ROOT}`);
  console.log(`Open: http://localhost:${PORT}/`);
});
