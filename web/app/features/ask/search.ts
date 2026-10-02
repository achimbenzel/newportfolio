/**
 * Suche in den Website-Texten – letzte Rettung, wenn kein Thema passt:
 * „Wer ist Kiara Balling?“ → steht in der Beschreibung von Gute Stube → kurzer Ausschnitt + Link.
 *
 * Durchsucht wird alles, was der Chat aus dem Content-Layer bekommt (Projekte, Leistungsseiten) –
 * neue Inhalte sind also automatisch dabei. Gewichtung: seltene Wörter zählen mehr (IDF).
 */
import type { AskContent } from "~/content/types";
import type { Locale } from "~/i18n/config";
import { prepare } from "./text";

type SearchDoc = {
  title: string;
  link: string;
  sentences: { text: string; tokens: Set<string> }[];
  tokens: Set<string>;
};

type SearchIndex = { docs: SearchDoc[]; df: Map<string, number> };

export type SearchHit = { title: string; link: string; snippet: string; matched: number };

/** Wörter unter dieser Länge sind zu allgemein für die Suche */
const MIN_WORD = 4;
const MAX_SNIPPET = 220;

const sentencesOf = (text: string) =>
  (text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]*/g) ?? []).map((s) => s.trim()).filter(Boolean);

function buildIndex(content: AskContent, lang: Locale, ignore: Set<string>): SearchIndex {
  const raw: { title: string; link: string; texts: string[] }[] = [
    ...content.projects.map((p) => ({
      title: p[lang].title,
      link: `/${lang}/work/${p.slug}`,
      texts: [p[lang].text || p[lang].summary, p.client ?? "", p[lang].industry ?? ""],
    })),
    ...content.services.map((s) => ({
      title: s[lang].title,
      link: `/${lang}/${s.slug}`,
      texts: [s[lang].intro, ...s[lang].details],
    })),
  ];
  const tokenize = (text: string) =>
    new Set(prepare(text).filter((t) => t.length >= MIN_WORD && !ignore.has(t)));

  const docs = raw.map(({ title, link, texts }) => {
    const sentences = texts.flatMap(sentencesOf).map((text) => ({ text, tokens: tokenize(text) }));
    const tokens = new Set(sentences.flatMap((s) => [...s.tokens]));
    return { title, link, sentences, tokens };
  });
  const df = new Map<string, number>();
  for (const doc of docs) for (const t of doc.tokens) df.set(t, (df.get(t) ?? 0) + 1);
  return { docs, df };
}

const cache = new WeakMap<AskContent, Partial<Record<Locale, SearchIndex>>>();

/**
 * Bester Treffer für die Frage oder null.
 * Treffer = mindestens zwei Wörter der Frage im selben Text – oder ein seltenes, langes Wort
 * (z. B. ein Name), das nur in einem Text vorkommt.
 */
export function searchContent(
  question: string,
  content: AskContent | undefined,
  lang: Locale,
  ignore: Set<string>,
): SearchHit | null {
  if (!content) return null;
  const perLang = cache.get(content) ?? {};
  const index = (perLang[lang] ??= buildIndex(content, lang, ignore));
  cache.set(content, perLang);

  const words = [...new Set(prepare(question))].filter(
    (t) => t.length >= MIN_WORD && !ignore.has(t),
  );
  const n = index.docs.length + 1;
  let best: { doc: SearchDoc; score: number; matched: string[] } | null = null;
  for (const doc of index.docs) {
    const matched = words.filter((w) => doc.tokens.has(w));
    const score = matched.reduce((sum, w) => sum + Math.log(n / ((index.df.get(w) ?? 0) + 0.5)), 0);
    if (matched.length > 0 && (!best || score > best.score)) best = { doc, score, matched };
  }
  if (!best) return null;
  const rare = best.matched.some((w) => w.length >= 6 && index.df.get(w) === 1);
  if (best.matched.length < 2 && !rare) return null;

  const sentence = [...best.doc.sentences].sort(
    (a, b) =>
      best.matched.filter((w) => b.tokens.has(w)).length -
      best.matched.filter((w) => a.tokens.has(w)).length,
  )[0]!;
  const snippet =
    sentence.text.length > MAX_SNIPPET
      ? `${sentence.text.slice(0, MAX_SNIPPET).replace(/\s+\S*$/, "")} …`
      : sentence.text;
  return {
    title: best.doc.title,
    link: best.doc.link,
    snippet: snippet.replace(/[[\]{}]/g, ""),
    matched: best.matched.length,
  };
}
