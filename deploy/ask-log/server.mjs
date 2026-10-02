/**
 * Kleiner Dienst für den Chat „Frag Achim“: speichert unbeantwortete Fragen anonym,
 * damit die Wissensbasis mit echten Fragen besser wird. Keine Abhängigkeiten (nur Node).
 *
 *   POST /api/ask-log   { q: string, lang: "de" | "en", kind: string }  → 204
 *
 * Gespeichert wird je Zeile (JSON): Datum (ohne Uhrzeit), Sprache, Art der Antwort, Frage.
 * KEINE IP-Adresse, keine Kennung, keine Cookies. Die Webseite macht E-Mail-Adressen,
 * Telefonnummern und Links schon vor dem Senden unkenntlich (web/app/features/ask/log.ts).
 *
 * Datei:   LOG_FILE (Standard /data/ask-log.jsonl)
 * Auswerten: npm run ask:report -- <Pfad zur Datei>
 * Löschen:  Datei regelmäßig leeren (Speicherdauer in der Datenschutzerklärung angeben).
 */
import { appendFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname } from "node:path";

const PORT = Number(process.env.PORT ?? 3001);
const LOG_FILE = process.env.LOG_FILE ?? "/data/ask-log.jsonl";
const MAX_BODY = 2048;
const KINDS = new Set(["fallback", "unsure", "offTopic"]);
/** Schutz vor Spam: höchstens so viele Einträge pro Minute (gesamt, ohne IP) */
const MAX_PER_MINUTE = 60;

let windowStart = Date.now();
let count = 0;

await mkdir(dirname(LOG_FILE), { recursive: true });

const server = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/api/ask-log") {
    res.writeHead(404).end();
    return;
  }
  let body = "";
  let tooLarge = false;
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > MAX_BODY) tooLarge = true;
  });
  req.on("end", async () => {
    if (tooLarge) return res.writeHead(413).end();
    if (Date.now() - windowStart > 60_000) {
      windowStart = Date.now();
      count = 0;
    }
    if (++count > MAX_PER_MINUTE) return res.writeHead(429).end();
    try {
      const { q, lang, kind } = JSON.parse(body);
      const valid =
        typeof q === "string" &&
        q.trim().length > 0 &&
        q.length <= 300 &&
        (lang === "de" || lang === "en") &&
        KINDS.has(kind);
      if (!valid) return res.writeHead(400).end();
      const entry = { date: new Date().toISOString().slice(0, 10), lang, kind, q: q.trim() };
      await appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`);
      res.writeHead(204).end();
    } catch {
      res.writeHead(400).end();
    }
  });
});

server.listen(PORT, () => console.log(`ask-log läuft auf Port ${PORT} → ${LOG_FILE}`));
