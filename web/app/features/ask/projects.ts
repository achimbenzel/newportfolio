/**
 * Macht aus den Projekten (Sanity bzw. Platzhalter) automatisch Chat-Themen:
 *
 * - pro Projekt ein Thema   „Erzähl mir von Gute Stube“  → Kurzbeschreibung + Link
 * - pro Branche ein Thema   „Hast du was für Gastronomie gemacht?“ → passende Projekte
 * - Projektliste            „Welche Kunden hattest du?“ → siehe answerLocally (Thema „work“)
 *
 * Erkannt wird ein Projekt an Titel, Kunde und den Stichwörtern aus Sanity („Stichwörter für
 * Frag Achim“). Hier muss man nichts pflegen – neue Projekte kommen mit dem nächsten Build.
 */
import type { AskProject } from "~/content/types";
import type { Locale } from "~/i18n/config";
import type { Topic } from "./knowledge";

/** Wörter aus Titeln, die zu allgemein sind, um ein Projekt zu erkennen */
const STOPWORDS = new Set([
  "gute",
  "guter",
  "gutes",
  "good",
  "great",
  "neue",
  "neuer",
  "neues",
  "new",
  "the",
  "und",
  "and",
  "der",
  "die",
  "das",
  "design",
  "designs",
  "studio",
  "brand",
  "branding",
  "logo",
  "logos",
  "projekt",
  "project",
  "agentur",
  "agency",
]);

const words = (value: string) =>
  value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word));

const unique = <T>(items: T[]) => [...new Set(items)];

export const projectTopicId = (slug: string) => `project:${slug}`;

const link = (project: AskProject, lang: Locale) =>
  `[${project[lang].title}]({base}/work/${project.slug})`;

/** „A, B und C“ bzw. „A, B and C“ */
function joinList(items: string[], lang: Locale): string {
  if (items.length <= 1) return items.join("");
  const and = lang === "de" ? " und " : " and ";
  return `${items.slice(0, -1).join(", ")}${and}${items.at(-1)}`;
}

/** Projektliste für die Antwort auf „Welche Projekte/Kunden …?“ */
export function projectList(projects: AskProject[], lang: Locale, max = 5): string {
  return joinList(
    projects.slice(0, max).map((p) => `${link(p, lang)} (${p[lang].category}, ${p.year})`),
    lang,
  );
}

function projectAnswer(project: AskProject, lang: Locale): string {
  const { title, category, summary } = project[lang];
  const intro = `${title} (${category}, ${project.year})`;
  return lang === "de"
    ? `${intro}: ${summary} Mehr dazu auf der [Projektseite]({base}/work/${project.slug}).`
    : `${intro}: ${summary} More on the [project page]({base}/work/${project.slug}).`;
}

export function buildProjectTopics(projects: AskProject[]): Topic[] {
  const result: Topic[] = projects.map((project) => {
    const names = unique(
      [project.de.title, project.en.title, project.client ?? ""].filter(Boolean),
    );
    return {
      id: projectTopicId(project.slug),
      keywords: unique([...names, ...names.flatMap(words), ...project.keywords]),
      followUps: ["work", "contact", "price"],
      de: {
        label: project.de.title,
        q: `Erzähl mir von ${project.de.title}`,
        a: projectAnswer(project, "de"),
      },
      en: {
        label: project.en.title,
        q: `Tell me about ${project.en.title}`,
        a: projectAnswer(project, "en"),
      },
    };
  });

  // Branchen: „Hast du schon was für Gastronomie gemacht?“
  const industries = new Map<string, { de: string; en: string; projects: AskProject[] }>();
  for (const project of projects) {
    if (!project.de.industry) continue;
    const key = project.de.industry.toLowerCase();
    const group = industries.get(key) ?? {
      de: project.de.industry,
      en: project.en.industry ?? project.de.industry,
      projects: [],
    };
    group.projects.push(project);
    industries.set(key, group);
  }
  for (const [key, group] of industries) {
    result.push({
      id: `industry:${key}`,
      keywords: unique([group.de, group.en]),
      followUps: [...group.projects.slice(0, 3).map((p) => projectTopicId(p.slug)), "contact"],
      de: { a: `Ja, zum Beispiel ${projectList(group.projects, "de")}.` },
      en: { a: `Yes, for example ${projectList(group.projects, "en")}.` },
    });
  }

  return result;
}
