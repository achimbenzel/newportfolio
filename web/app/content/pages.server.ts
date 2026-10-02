/**
 * Liste ALLER Seiten der Website. Grundlage für Prerendering, Sitemap und llms.txt.
 * Neue Seite? → hier eintragen (und in app/routes.ts), sonst wird sie nicht gebaut.
 */
// ⚠️ Wird von react-router.config.ts geladen → nur RELATIVE Imports, keine "~/"-Aliase.
import { serviceSlugs } from "../config/services";
import { locales } from "../i18n/config";
import { getProjectSlugs } from "./project-slugs.server";

export type SitePage = {
  /** Pfad OHNE Sprache, z. B. "/work" */
  path: string;
  /** false = noindex & nicht in der Sitemap (z. B. Rechtliches) */
  indexable: boolean;
};

export async function getSitePages(): Promise<SitePage[]> {
  const projectSlugs = await getProjectSlugs();
  return [
    { path: "/", indexable: true },
    { path: "/work", indexable: true },
    ...projectSlugs.map((slug) => ({ path: `/work/${slug}`, indexable: true })),
    ...serviceSlugs.map((slug) => ({ path: `/${slug}`, indexable: true })),
    { path: "/about", indexable: true },
    { path: "/contact", indexable: true },
    { path: "/imprint", indexable: false },
    { path: "/privacy", indexable: false },
  ];
}

export function withLocale(locale: string, path: string): string {
  return path === "/" ? `/${locale}/` : `/${locale}${path}`;
}

/** Alle URLs, die beim Build als HTML/Datei erzeugt werden. */
export async function getPrerenderPaths(): Promise<string[]> {
  const pages = await getSitePages();
  return [
    "/",
    ...locales.flatMap((locale) => pages.map((page) => withLocale(locale, page.path))),
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
  ];
}
