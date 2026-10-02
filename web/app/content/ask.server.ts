/**
 * Projektwissen für den Chat „Frag Achim“.
 * Wird beim Build aus denselben Daten erzeugt wie die Projektseiten (Sanity bzw. Platzhalter)
 * – neue Projekte kennt der Chat also automatisch nach dem nächsten Build.
 */
import type { Locale } from "~/i18n/config";
import { isSanityConfigured, sanityFetch } from "~/lib/sanity/client.server";
import { askProjectsQuery } from "~/lib/sanity/queries";
import { fallbackProjects } from "./fallback/projects";
import type { AskProject } from "./types";

type LocaleValue = Partial<Record<Locale, string>> | null | undefined;

type RawAskProject = {
  slug: string;
  year: number;
  client?: string | null;
  title?: LocaleValue;
  category?: LocaleValue;
  industry?: LocaleValue;
  description?: LocaleValue;
  askKeywords?: string[] | null;
};

const text = (value: LocaleValue, locale: Locale) => value?.[locale] || value?.de || "";

/** Die ersten Sätze einer Beschreibung – kurz genug für eine Chat-Antwort. */
export function summarize(value: string, maxSentences = 2, maxLength = 320): string {
  const sentences = value
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?]+[.!?]+(\s|$)/g) ?? [value];
  let result = "";
  for (const sentence of sentences.slice(0, maxSentences)) {
    if (result && (result + sentence).length > maxLength) break;
    result += sentence;
  }
  return result.trim();
}

function toAskProject(raw: RawAskProject): AskProject {
  const entry = (locale: Locale) => ({
    title: text(raw.title, locale),
    category: text(raw.category, locale),
    industry: text(raw.industry, locale) || undefined,
    summary: summarize(text(raw.description, locale)),
  });
  return {
    slug: raw.slug,
    year: raw.year,
    client: raw.client ?? undefined,
    keywords: raw.askKeywords ?? [],
    de: entry("de"),
    en: entry("en"),
  };
}

export async function getAskProjects(): Promise<AskProject[]> {
  if (!isSanityConfigured) return fallbackProjects.map(toAskProject);
  return ((await sanityFetch<RawAskProject[]>(askProjectsQuery)) ?? []).map(toAskProject);
}
