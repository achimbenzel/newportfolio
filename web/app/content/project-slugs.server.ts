// ⚠️ Wird (indirekt) von react-router.config.ts geladen → nur RELATIVE Imports, keine "~/"-Aliase.
import { isSanityConfigured, sanityFetch } from "../lib/sanity/client.server";
import { projectSlugsQuery } from "../lib/sanity/queries";
import { fallbackProjects } from "./fallback/projects";

/** Kurzer Zwischenspeicher: beim Build nur eine Abfrage, im Dev-Server trotzdem aktuell */
const CACHE_MS = 10_000;
let cache: { at: number; slugs: Promise<string[]> } | null = null;

/** Projekt-Slugs aus Sanity. */
function fetchSanitySlugs(): Promise<string[]> {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    cache = {
      at: Date.now(),
      slugs: sanityFetch<string[]>(projectSlugsQuery).then((slugs) => slugs ?? []),
    };
  }
  return cache.slugs;
}

/**
 * Woher kommen die Projekte?
 * - Sanity, sobald es verbunden ist UND mindestens ein Projekt veröffentlicht wurde.
 * - Sonst die Platzhalter aus ./fallback – so läuft der Build auch direkt nach dem
 *   Verbinden mit einem noch leeren Sanity-Projekt (React Router braucht beim
 *   Vorrendern mindestens eine Projektseite).
 */
export async function usesSanityProjects(): Promise<boolean> {
  if (!isSanityConfigured) return false;
  return (await fetchSanitySlugs()).length > 0;
}

/** Alle Projekt-Slugs (für Prerendering, Sitemap & Navigation). */
export async function getProjectSlugs(): Promise<string[]> {
  if (!(await usesSanityProjects())) return fallbackProjects.map((p) => p.slug);
  return fetchSanitySlugs();
}
