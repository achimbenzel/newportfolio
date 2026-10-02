/**
 * Feste Leistungsbereiche. Die Slugs bestimmen die URLs (/de/branding …) und
 * die Navigation – daher im Code statt im CMS. Texte dazu kommen aus dem
 * Content-Layer (Sanity), Kurz-Labels aus i18n.
 */
export const serviceSlugs = ["branding", "motion-design", "music-visuals"] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === "string" && (serviceSlugs as readonly string[]).includes(value);
}
