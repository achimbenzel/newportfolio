import type { Locale } from "../i18n/config";

/** Zweisprachiger Wert, wie er auch in Sanity gespeichert wird ({ de, en }). */
export type L10n<T = string> = Record<Locale, T>;

export function pick<T>(value: L10n<T>, locale: Locale): T {
  return value[locale] ?? value.de;
}
