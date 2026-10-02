import { data, isRouteErrorResponse } from "react-router";
import { defaultLocale, isLocale, type Locale } from "~/i18n/config";

/** Für Loader: gültige Sprache aus der URL oder 404. */
export function requireLocale(value: string | undefined): Locale {
  if (!isLocale(value)) throw data(null, { status: 404 });
  return value;
}

/** Für meta(): nie werfen, im Zweifel Standardsprache. */
export function localeOr(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Letztes URL-Segment ohne ".data"-Endung (Routen, die mehrere Pfade bedienen). */
export function lastSegment(url: string): string {
  return (
    new URL(url).pathname
      .replace(/\.data$/, "")
      .split("/")
      .filter(Boolean)
      .pop() ?? ""
  );
}

/** Kürzt Text für Meta-Descriptions auf ~160 Zeichen an einer Wortgrenze. */
export function excerpt(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))} …`;
}

/**
 * Ist der Fehler ein „Seite gibt es nicht“?
 * Die Website ist komplett vorgerendert. Wird eine unbekannte URL aufgerufen, liefert
 * der Server die SPA-Fallback-Datei aus – React Router findet dann keine vorgerenderten
 * Daten und wirft „No result found for routeId …“. Für uns ist das ein 404.
 * (Bei Client-Navigation kommt dagegen eine normale 404-Antwort der .data-Datei.)
 */
export function isNotFoundError(error: unknown): boolean {
  if (isRouteErrorResponse(error)) return error.status === 404;
  return error instanceof Error && error.message.startsWith("No result found for routeId");
}
