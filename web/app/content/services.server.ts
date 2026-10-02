/**
 * Leistungen – Content-Zugriff. Sanity-Dokument „service“ hat Vorrang,
 * fehlt es (oder ist Sanity nicht verbunden), greifen die Platzhalter.
 */
import type { ServiceSlug } from "~/config/services";
import type { Locale } from "~/i18n/config";
import { sanityFetch } from "~/lib/sanity/client.server";
import { serviceQuery } from "~/lib/sanity/queries";
import { fallbackServices } from "./fallback/services";
import { pick } from "~/lib/l10n";
import type { Service } from "./types";

export async function getService(locale: Locale, slug: ServiceSlug): Promise<Service> {
  const fromCms = await sanityFetch<Omit<Service, "slug"> | null>(serviceQuery, { locale, slug });
  if (fromCms?.title) return { slug, ...fromCms, process: fromCms.process ?? [] };

  const fallback = fallbackServices[slug];
  return {
    slug,
    title: pick(fallback.title, locale),
    intro: pick(fallback.intro, locale),
    process: fallback.process.map((step) => ({
      title: pick(step.title, locale),
      text: pick(step.text, locale),
    })),
  };
}
