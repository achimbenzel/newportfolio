/**
 * Wissen für den Chat „Frag Achim“ aus dem Content-Layer.
 * Wird beim Build aus denselben Daten erzeugt wie die Seiten selbst (Sanity bzw. Platzhalter)
 * – was auf der Website steht, kennt der Chat also automatisch nach dem nächsten Build.
 *
 * Neue Inhaltsart, die der Chat kennen soll? → hier ergänzen (Typ in content/types.ts),
 * Verarbeitung in features/ask/content.ts. Anleitung: docs/09-ask-widget.md
 */
import { serviceSlugs } from "~/config/services";
import type { Locale } from "~/i18n/config";
import { sanityFetch } from "~/lib/sanity/client.server";
import { askProjectsQuery } from "~/lib/sanity/queries";
import { fallbackProjects } from "./fallback/projects";
import { usesSanityProjects } from "./project-slugs.server";
import { getService } from "./services.server";
import type { AskContent, AskProject, AskService, Service } from "./types";

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
  if (!(await usesSanityProjects())) return fallbackProjects.map(toAskProject);
  return ((await sanityFetch<RawAskProject[]>(askProjectsQuery)) ?? []).map(toAskProject);
}

/** Leistungsseiten: Einleitung (gekürzt) + Titel der Ablauf-Schritte, je Sprache. */
export async function getAskServices(): Promise<AskService[]> {
  const entry = (service: Service) => ({
    title: service.title,
    intro: summarize(service.intro, 3, 420),
    steps: service.process.map((step) => step.title).filter(Boolean),
  });
  return Promise.all(
    serviceSlugs.map(async (slug) => {
      const [de, en] = await Promise.all([getService("de", slug), getService("en", slug)]);
      return { slug, de: entry(de), en: entry(en) };
    }),
  );
}

export async function getAskContent(): Promise<AskContent> {
  const [projects, services] = await Promise.all([getAskProjects(), getAskServices()]);
  return { projects, services };
}
