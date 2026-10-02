/**
 * Lokale Vorschau des statischen Builds (`npm run preview`).
 * Verhält sich wie der spätere nginx-Server (deploy/nginx.conf):
 *  - "/" → 301 auf "/de/"
 *  - /pfad → /pfad/index.html
 *  - unbekannt → 404 mit SPA-Fallback (zeigt die 404-Seite der App)
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../build/client");
const port = Number(process.env.PORT ?? 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".data": "text/x-script",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFile(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidates = [join(root, safe), join(root, safe, "index.html")];
  return candidates.find(
    (file) => file.startsWith(root) && existsSync(file) && statSync(file).isFile(),
  );
}

if (!existsSync(root)) {
  console.error("Kein Build gefunden – zuerst `npm run build` ausführen.");
  process.exit(1);
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (pathname === "/") {
    res.writeHead(301, { Location: "/de/" }).end();
    return;
  }
  const file = resolveFile(pathname);
  if (file) {
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
    return;
  }
  const fallback = join(root, "__spa-fallback.html");
  res.writeHead(404, { "Content-Type": types[".html"] });
  createReadStream(fallback).pipe(res);
}).listen(port, () => {
  console.log(`Vorschau: http://localhost:${port}/de/`);
});
