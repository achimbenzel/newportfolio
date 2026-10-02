/**
 * Unbeantwortete Fragen sammeln (optional) – damit der Chat mit echten Fragen besser wird.
 *
 * - AUS, solange askConfig.logEndpoint null ist. Einschalten erst, wenn der kleine Dienst
 *   (deploy/ask-log) läuft UND die Datenschutzerklärung den Abschnitt dazu enthält
 *   (docs/06-datenschutz.md).
 * - Geht nur an den EIGENEN Server, keine Dritten. Gesendet werden nur: Frage (E-Mail-Adressen,
 *   Telefonnummern und Links unkenntlich gemacht), Sprache, Art der Antwort. Keine IP, keine ID.
 * - Auswerten: npm run ask:report -- <Pfad zur ask-log.jsonl>
 */
import type { Locale } from "~/i18n/config";
import { askConfig } from "./config";

/** Persönliche Angaben unkenntlich machen, bevor etwas den Browser verlässt */
export function maskPersonalData(text: string): string {
  return text
    .replace(/\b[\w.+-]+@[\w-]+(\.[\w-]+)+\b/g, "[email]")
    .replace(/\b(https?:\/\/|www\.)\S+/gi, "[link]")
    .replace(/\+?\d[\d\s/().-]{5,}\d/g, "[nummer]")
    .slice(0, 300);
}

export function logUnanswered(question: string, lang: Locale, kind: string) {
  const endpoint = askConfig.logEndpoint;
  if (!endpoint || typeof window === "undefined") return;
  const body = JSON.stringify({ q: maskPersonalData(question), lang, kind });
  try {
    const sent = navigator.sendBeacon?.(endpoint, new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Protokollieren ist Nebensache – Fehler nie an den Besucher weitergeben
  }
}
