/**
 * Sprach-Konfiguration. Jede URL beginnt mit dem Sprachkürzel: /de/…, /en/…
 * Beide Sprachen verwenden DIESELBEN Slugs (z. B. /de/work und /en/work),
 * damit der Sprachwechsel immer 1:1 funktioniert.
 */
export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

export const localeMeta: Record<Locale, { label: string; name: string; ogLocale: string }> = {
  de: { label: "DE", name: "Deutsch", ogLocale: "de_DE" },
  en: { label: "EN", name: "English", ogLocale: "en_US" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Liest die Sprache aus einem Pfad wie "/en/work" – Fallback: Standardsprache. */
export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : defaultLocale;
}
