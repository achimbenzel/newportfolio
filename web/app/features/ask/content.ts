/**
 * Macht aus den Inhalten der Website (Sanity bzw. Platzhalter) automatisch Chat-Wissen.
 * Hier muss man nichts pflegen – neue Inhalte kennt der Chat nach dem nächsten Build.
 *
 * - Projekte      ein Thema pro Projekt („Erzähl mir von Gute Stube“) → Kurzbeschreibung + Link.
 *                 Erkannt an Titel, Kunde und „Stichwörter für Frag Achim“ (Sanity).
 *                 Die Kategorie ordnet das Projekt einem Fachgebiet zu (für Dauer, Ablauf …).
 * - Branchen      „Hast du was für Gastronomie gemacht?“ → passende Projekte
 * - Projektliste  „Welche Projekte hast du gemacht?“ → Thema „work“, je Fachgebiet gefiltert
 * - Leistungen    Einleitung + Ablauf der Leistungsseiten ersetzen die festen Antworten
 *                 von branding/motion/music und die Ablauf-Antworten (process)
 * - Social Media  verlinkte Profile ersetzen die Antwort von „social“
 *
 * Neue Inhaltsart? → Daten in content/ask.server.ts holen, hier in Themen übersetzen.
 */
import type { ServiceSlug } from "~/config/services";
import type { AskContent, AskProject, AskService } from "~/content/types";
import { locales, type Locale } from "~/i18n/config";
import { askTexts, type Topic } from "./knowledge";

/** Leistungsseite → Fachgebiet (Thema in knowledge.ts) */
export const serviceSubjects: Record<ServiceSlug, string> = {
  branding: "branding",
  "motion-design": "motion",
  "music-visuals": "music",
};

/** Projekt-Kategorie → Fachgebiet (Reihenfolge zählt: das Erste, was passt, gewinnt) */
const categorySubjects: [RegExp, string][] = [
  [/logo.?anim|anim\w* logo/i, "logoAnimation"],
  [/logo/i, "logo"],
  [/brand|marke|identit|corporate/i, "branding"],
  [/\b3d\b/i, "three_d"],
  [/motion|anim|video|film/i, "motion"],
  [/music|musik|cover|album|visuali/i, "music"],
  [/grafik|graphic|print|poster|plakat|flyer/i, "graphic"],
];

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

const PROJECT_PREFIX = "project:";
export const projectTopicId = (slug: string) => `${PROJECT_PREFIX}${slug}`;
export const isProjectTopic = (id: string) => id.startsWith(PROJECT_PREFIX);

const words = (value: string) =>
  value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word));

const unique = <T>(items: T[]) => [...new Set(items)];

/** Ersetzt {name} in einer Vorlage – unbekannte Platzhalter ({base} …) bleiben stehen. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );

/** „A, B und C“ bzw. „A, B and C“ */
export function joinList(items: string[], lang: Locale): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")}${askTexts[lang].and}${items.at(-1)}`;
}

const projectLink = (project: AskProject, lang: Locale) =>
  `[${project[lang].title}]({base}/work/${project.slug})`;

/** Projektliste für „Welche Projekte …?“ – {list} in askTexts.projects */
export function projectList(projects: AskProject[], lang: Locale, max = 5): string {
  return joinList(
    projects.slice(0, max).map((p) => `${projectLink(p, lang)} (${p[lang].category}, ${p.year})`),
    lang,
  );
}

/** Fachgebiet eines Projekts anhand seiner Kategorie (oder undefined) */
export function projectSubject(project: AskProject): string | undefined {
  const category = `${project.en.category} ${project.de.category}`;
  return categorySubjects.find(([pattern]) => pattern.test(category))?.[1];
}

/* ── Projekte & Branchen → eigene Themen ─────────────────────────── */

export function buildContentTopics({ projects }: AskContent): Topic[] {
  const result: Topic[] = projects.map((project) => {
    const names = unique(
      [project.de.title, project.en.title, project.client ?? ""].filter(Boolean),
    );
    const text = (lang: Locale) => ({
      label: project[lang].title,
      q: fill(askTexts[lang].projectQ, { title: project[lang].title }),
      a: fill(askTexts[lang].project, {
        title: project[lang].title,
        category: project[lang].category,
        year: project.year,
        summary: project[lang].summary,
        link: `{base}/work/${project.slug}`,
      }),
    });
    return {
      id: projectTopicId(project.slug),
      kind: "subject",
      parent: projectSubject(project),
      keywords: unique([...names, ...names.flatMap(words), ...project.keywords]),
      followUps: ["work", "contact", "price"],
      de: text("de"),
      en: text("en"),
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
    const text = (lang: Locale) => ({
      label: group[lang],
      q: fill(askTexts[lang].industryQ, { industry: group[lang] }),
      a: fill(askTexts[lang].industry, { list: projectList(group.projects, lang) }),
    });
    result.push({
      id: `industry:${key}`,
      kind: "subject",
      keywords: unique([group.de, group.en]),
      followUps: [...group.projects.slice(0, 3).map((p) => projectTopicId(p.slug)), "contact"],
      de: text("de"),
      en: text("en"),
    });
  }

  return result;
}

/* ── Feste Themen mit Inhalten aktualisieren ─────────────────────── */

const byLocale = (make: (lang: Locale) => string) =>
  Object.fromEntries(locales.map((lang) => [lang, make(lang)])) as Record<Locale, string>;

function stepsText(service: AskService, lang: Locale): string {
  const { title, steps } = service[lang];
  const texts = askTexts[lang];
  return fill(texts.steps, {
    title,
    count: texts.numbers[steps.length] ?? steps.length,
    list: joinList(steps, lang),
  });
}

/**
 * Gibt die festen Themen mit Inhalten aus dem Content-Layer zurück (Kopien – die Originale
 * in knowledge.ts bleiben unverändert und dienen als Fallback).
 */
export function applyContent(
  topics: Topic[],
  { projects, services, socials }: AskContent,
): Topic[] {
  const parents = new Map(topics.map((topic) => [topic.id, topic.parent]));
  /** Fachgebiet + alle übergeordneten (Logo → Branding) */
  const chain = (id: string | undefined): string[] =>
    id ? [id, ...chain(parents.get(id)).filter((p) => p !== id)] : [];

  return topics.map((topic) => {
    // Leistungsseite: Einleitung ersetzt die feste Antwort des Fachgebiets
    const service = services.find((s) => serviceSubjects[s.slug] === topic.id);
    if (service && service.de.intro) {
      const answer = byLocale(
        (lang) =>
          service[lang].intro +
          fill(askTexts[lang].serviceMore, {
            title: service[lang].title,
            link: `{base}/${service.slug}`,
          }),
      );
      return { ...topic, de: { ...topic.de, a: answer.de }, en: { ...topic.en, a: answer.en } };
    }

    // Ablauf: Schritte der Leistungsseiten
    if (topic.id === "process") {
      const withSteps = services.filter((s) => s.de.steps.length > 0);
      if (withSteps.length === 0) return topic;
      const facets = { ...topic.facets };
      for (const s of withSteps) facets[serviceSubjects[s.slug]] = byLocale((l) => stepsText(s, l));
      const answer = byLocale((lang) =>
        [
          askTexts[lang].processIntro,
          ...withSteps.map((s) => `${s[lang].title}: ${s[lang].steps.join(", ")}.`),
        ].join("\n"),
      );
      return {
        ...topic,
        facets,
        de: { ...topic.de, a: answer.de },
        en: { ...topic.en, a: answer.en },
      };
    }

    // Social-Media-Profile
    if (topic.id === "social" && socials.length > 0) {
      const answer = byLocale((lang) =>
        fill(askTexts[lang].socials, {
          list: joinList(
            socials.map((s) => `[${s.label}](${s.url})`),
            lang,
          ),
        }),
      );
      return { ...topic, de: { ...topic.de, a: answer.de }, en: { ...topic.en, a: answer.en } };
    }

    // Projektliste – insgesamt und je Fachgebiet („Welche Logo-Projekte …?“)
    if (topic.id === "work" && projects.length > 0) {
      const groups = new Map<string, AskProject[]>();
      for (const project of projects) {
        for (const id of chain(projectSubject(project))) {
          groups.set(id, [...(groups.get(id) ?? []), project]);
        }
      }
      const listText = (list: AskProject[]) =>
        byLocale((lang) => fill(askTexts[lang].projects, { list: projectList(list, lang) }));
      const all = listText(projects);
      return {
        ...topic,
        facets: Object.fromEntries([...groups].map(([id, list]) => [id, listText(list)])),
        followUps: [...projects.slice(0, 3).map((p) => projectTopicId(p.slug)), "contact"],
        de: { ...topic.de, a: all.de },
        en: { ...topic.en, a: all.en },
      };
    }

    return topic;
  });
}
