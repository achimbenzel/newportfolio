// ⚠️ Wird (indirekt) von react-router.config.ts geladen → nur RELATIVE Imports, keine "~/"-Aliase.
import { isSanityConfigured, sanityFetch } from "../lib/sanity/client.server";
import { projectSlugsQuery } from "../lib/sanity/queries";
import { fallbackProjects } from "./fallback/projects";

/** Alle Projekt-Slugs (für Prerendering, Sitemap & Navigation). */
export async function getProjectSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return fallbackProjects.map((p) => p.slug);
  return (await sanityFetch<string[]>(projectSlugsQuery)) ?? [];
}
