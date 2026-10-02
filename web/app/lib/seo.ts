import type { MetaDescriptor } from "react-router";
import { site } from "~/config/site";
import { defaultLocale, getDictionary, localeMeta, locales, type Locale } from "~/i18n";

/**
 * SEO-Helfer: Jede Seite baut ihre <head>-Tags über `pageMeta()`.
 * Damit hat JEDE Seite automatisch Title, Description, Canonical, hreflang,
 * Open Graph & Twitter Card – einheitlich und vollständig.
 */
export type PageMetaInput = {
  locale: Locale;
  /** Pfad OHNE Sprache, z. B. "/" oder "/work/gute-stube" */
  path: string;
  /** Seitentitel ohne Markenname – der wird automatisch angehängt. Leer = Startseite. */
  title?: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  /** Strukturierte Daten (schema.org) – siehe jsonLd-Helfer unten */
  jsonLd?: Record<string, unknown>[];
};

export function absoluteUrl(pathname: string): string {
  return `${site.url}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

export function localizedUrl(locale: Locale, path: string): string {
  return absoluteUrl(path === "/" ? `/${locale}/` : `/${locale}${path}`);
}

export function pageMeta(input: PageMetaInput): MetaDescriptor[] {
  const t = getDictionary(input.locale);
  const title = input.title ? `${input.title} – ${site.name}` : t.meta.siteTitle;
  const description = input.description ?? t.meta.siteDescription;
  const url = localizedUrl(input.locale, input.path);
  const image = input.image
    ? absoluteUrl(input.image)
    : site.defaultOgImage
      ? absoluteUrl(site.defaultOgImage)
      : null;

  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    ...locales.map((l) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: l,
      href: localizedUrl(l, input.path),
    })),
    {
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: localizedUrl(defaultLocale, input.path),
    },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:site_name", content: site.name },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:locale", content: localeMeta[input.locale].ogLocale },
    ...locales
      .filter((l) => l !== input.locale)
      .map((l) => ({ property: "og:locale:alternate", content: localeMeta[l].ogLocale })),
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  if (image) {
    tags.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
  }
  if (input.noindex) {
    tags.push({ name: "robots", content: "noindex, follow" });
  }
  for (const data of input.jsonLd ?? []) {
    tags.push({ "script:ld+json": data });
  }
  return tags;
}

/* ── Strukturierte Daten (schema.org) ─────────────────────────────── */

const personId = `${site.url}/#person`;
const websiteId = `${site.url}/#website`;

export function personJsonLd(locale: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: site.name,
    url: localizedUrl(locale, "/"),
    email: `mailto:${site.email}`,
    jobTitle: locale === "de" ? "Freiberuflicher Designer" : "Freelance Designer",
    address: { "@type": "PostalAddress", addressLocality: "Mainz", addressCountry: "DE" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Hochschule Mainz" },
    knowsAbout: [
      "Branding",
      "Logo Design",
      "Graphic Design",
      "Motion Design",
      "3D",
      "Music Visuals",
      "Social Media Content",
      "Sound Design",
    ],
    sameAs: site.socials.map((s) => s.url),
  };
}

export function websiteJsonLd(locale: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: site.name,
    url: localizedUrl(locale, "/"),
    inLanguage: locale,
    publisher: { "@id": personId },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function creativeWorkJsonLd(input: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  year?: number;
  image?: string | null;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.name,
    description: input.description,
    url: localizedUrl(input.locale, input.path),
    inLanguage: input.locale,
    dateCreated: input.year ? String(input.year) : undefined,
    image: input.image ? absoluteUrl(input.image) : undefined,
    creator: { "@id": personId },
  };
}
