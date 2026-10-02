import type { ServiceSlug } from "~/config/services";
import { isLocale, type Locale } from "~/i18n/config";

/**
 * ALLE internen URLs werden hier gebaut – nie Pfade als String in Komponenten
 * zusammensetzen. So bleibt eine URL-Änderung eine Ein-Zeilen-Änderung.
 */
export const paths = {
  home: (l: Locale) => `/${l}/`,
  work: (l: Locale) => `/${l}/work`,
  project: (l: Locale, slug: string) => `/${l}/work/${slug}`,
  service: (l: Locale, slug: ServiceSlug) => `/${l}/${slug}`,
  about: (l: Locale) => `/${l}/about`,
  contact: (l: Locale) => `/${l}/contact`,
  imprint: (l: Locale) => `/${l}/imprint`,
  privacy: (l: Locale) => `/${l}/privacy`,
} as const;

/** Entfernt das Sprachpräfix: "/de/work" → "/work", "/de/" → "/" */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) return pathname || "/";
  const tail = rest.join("/");
  return tail ? `/${tail}` : "/";
}

/** Gleiche Seite in anderer Sprache: ("/de/work", "en") → "/en/work" */
export function switchLocale(pathname: string, target: Locale): string {
  const rest = stripLocale(pathname);
  return rest === "/" ? `/${target}/` : `/${target}${rest}`;
}
