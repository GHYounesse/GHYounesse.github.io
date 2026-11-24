// Minimal static file server for a built site: `node mocks/static-server.mjs <dir> <port>`.
// Mirrors how Nginx serves the site (directory index, no SPA fallback) without needing Nginx locally.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

export function serve(dir, port, host = "127.0.0.1") {
  const base = path.resolve(dir);
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
      let file = path.join(base, pathname);
      if (!file.startsWith(base)) throw Object.assign(new Error("outside root"), { code: "ENOENT" });
      if ((await stat(file).catch(() => null))?.isDirectory()) file = path.join(file, "index.html");

      const body = await readFile(file);
      const ext = path.extname(file);
      const immutable = pathname.startsWith("/_astro/");
      res.writeHead(200, {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
      });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}

const [dir, port] = process.argv.slice(2);
if (dir && port) {
  await serve(dir, Number(port));
  console.log(`[static] ${dir} on http://127.0.0.1:${port}`);
}
