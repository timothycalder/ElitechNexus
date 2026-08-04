import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const PORT = Number(process.env.PORT || 3010);
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
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".buf": "application/octet-stream",
  ".bin": "application/octet-stream",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split("?")[0].split("#")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

async function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
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
    let urlPath = req.url || "/";

    let filePath = safeJoin(ROOT, urlPath);
    if (!filePath) return send(res, 400, "Bad path");

    let found = await tryFile(filePath);
    if (!found) {
      // directory -> index.html
      found = await tryFile(path.join(filePath, "index.html"));
    }
    if (!found && !path.extname(filePath)) {
      found = await tryFile(filePath + ".html");
    }
    if (!found) {
      return send(res, 404, "404 — the requested path could not be found:\n" + urlPath);
    }

    const ext = path.extname(found).toLowerCase();
    const type = TYPES[ext] || "application/octet-stream";
    const data = await fs.readFile(found);
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": data.length,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(data);
  } catch (err) {
    console.error(err);
    send(res, 500, "Server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT}`);
  console.log(`Open http://localhost:${PORT}/`);
});
