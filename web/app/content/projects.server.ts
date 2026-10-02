/**
 * Projekte – Content-Zugriff. Routen holen Projektdaten AUSSCHLIESSLICH hier.
 * Quelle: Sanity (wenn konfiguriert), sonst Platzhalter aus ./fallback.
 */
import type { Locale } from "~/i18n/config";
import { isSanityConfigured, sanityFetch } from "~/lib/sanity/client.server";
import { localImage, type SanityImageInput } from "~/lib/sanity/media.server";
import { featuredProjectsQuery, projectQuery, projectsQuery } from "~/lib/sanity/queries";
import { fallbackProjects, type FallbackProject } from "./fallback/projects";
import { pick } from "~/lib/l10n";
import type { Project, ProjectBlock, ProjectSummary } from "./types";

/* ── Sanity-Rohdaten → Domänen-Typen ─────────────────────────────── */

type RawSummary = Omit<ProjectSummary, "cover"> & { cover?: SanityImageInput | null };
type RawBlock = { _type: string; _key: string } & Record<string, unknown>;
type RawProject = RawSummary &
  Omit<Project, "cover" | "content" | "software"> & {
    software?: string[] | null;
    content?: RawBlock[] | null;
  };

async function toSummary(raw: RawSummary): Promise<ProjectSummary> {
  return {
    slug: raw.slug,
    title: raw.title,
    category: raw.category ?? "",
    year: raw.year,
    color: raw.color ?? null,
    cover: await localImage(raw.cover, { widths: [640, 1280], fallbackAlt: raw.title }),
  };
}

async function toBlock(raw: RawBlock): Promise<ProjectBlock | null> {
  switch (raw._type) {
    case "imageBlock": {
      const image = await localImage(raw.image as SanityImageInput);
      return image
        ? { type: "image", key: raw._key, image, caption: (raw.caption as string) ?? undefined }
        : null;
    }
    case "imageGrid": {
      const images = await Promise.all(
        ((raw.images as SanityImageInput[]) ?? []).map((img) =>
          localImage(img, { widths: [640, 1280] }),
        ),
      );
      return { type: "imageGrid", key: raw._key, images: images.filter((i) => i !== null) };
    }
    case "textBlock":
      return {
        type: "text",
        key: raw._key,
        heading: (raw.heading as string) ?? undefined,
        body: (raw.body as string) ?? "",
        align: raw.align === "center" ? "center" : "left",
      };
    case "videoEmbed":
      return {
        type: "video",
        key: raw._key,
        provider: raw.provider === "youtube" ? "youtube" : "vimeo",
        videoId: String(raw.videoId ?? ""),
        title: String(raw.title ?? ""),
      };
    default:
      return null;
  }
}

/* ── Platzhalter → Domänen-Typen ─────────────────────────────────── */

function fallbackSummary(p: FallbackProject, locale: Locale): ProjectSummary {
  return {
    slug: p.slug,
    title: pick(p.title, locale),
    category: pick(p.category, locale),
    year: p.year,
    color: p.color,
    cover: null,
  };
}

function fallbackProject(p: FallbackProject, locale: Locale): Project {
  return {
    ...fallbackSummary(p, locale),
    client: p.client,
    scope: pick(p.scope, locale),
    industry: p.industry ? pick(p.industry, locale) : undefined,
    software: p.software,
    description: pick(p.description, locale),
    content: [],
  };
}

/* ── Öffentliche API ─────────────────────────────────────────────── */

export async function getProjects(locale: Locale): Promise<ProjectSummary[]> {
  if (!isSanityConfigured) return fallbackProjects.map((p) => fallbackSummary(p, locale));
  const raw = (await sanityFetch<RawSummary[]>(projectsQuery, { locale })) ?? [];
  return Promise.all(raw.map(toSummary));
}

/** Projekte mit „Auf der Startseite zeigen“ – aktuell nicht eingebunden (Startseite zeigt vorerst nur den Chat). */
export async function getFeaturedProjects(locale: Locale, limit = 3): Promise<ProjectSummary[]> {
  if (!isSanityConfigured) {
    return fallbackProjects
      .filter((p) => p.featured)
      .slice(0, limit)
      .map((p) => fallbackSummary(p, locale));
  }
  const raw = (await sanityFetch<RawSummary[]>(featuredProjectsQuery, { locale, limit })) ?? [];
  return Promise.all(raw.map(toSummary));
}

export async function getProject(locale: Locale, slug: string): Promise<Project | null> {
  if (!isSanityConfigured) {
    const p = fallbackProjects.find((item) => item.slug === slug);
    return p ? fallbackProject(p, locale) : null;
  }
  const raw = await sanityFetch<RawProject | null>(projectQuery, { locale, slug });
  if (!raw) return null;
  const [summary, blocks] = await Promise.all([
    toSummary(raw),
    Promise.all((raw.content ?? []).map(toBlock)),
  ]);
  return {
    ...summary,
    client: raw.client ?? undefined,
    scope: raw.scope ?? undefined,
    industry: raw.industry ?? undefined,
    software: raw.software ?? [],
    description: raw.description ?? "",
    seo: raw.seo,
    content: blocks.filter((b) => b !== null),
  };
}

export { getProjectSlugs } from "./project-slugs.server";
