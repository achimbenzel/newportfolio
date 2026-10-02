/**
 * Antwort-Logik des Widgets – reine Funktionen ohne UI (getestet in knowledge.test.ts).
 *
 * Damit unterschiedliche Formulierungen funktionieren, wird jede Frage UND jedes Stichwort
 * gleich aufbereitet:
 *   1. normalisieren   Kleinschreibung, ä → a, ß → ss, Satzzeichen weg
 *   2. Synonyme        „how much“, „kostet“, „honorar“ … → „preis“ (siehe knowledge.ts)
 *   3. Wortstamm       Endungen kürzen: „Korrekturen“ → „korrektur“, „dauert“ → „dauer“
 * Danach werden Treffer gezählt (exakt, Wortanfang/-ende, Tippfehler, Mehrwort-Ausdrücke).
 */
import { site } from "~/config/site";
import type { Locale } from "~/i18n/config";
import { askConfig } from "./config";
import {
  askTexts,
  defaultChips,
  intentTopics,
  languageHints,
  offTopicWords,
  synonyms,
  topics,
  type Topic,
} from "./knowledge";

export type AskAnswer = { topicId: string | null; lang: Locale; text: string; followUps: string[] };
export type HistoryEntry = { role: "user" | "assistant"; content: string };

const topicById = new Map(topics.map((topic) => [topic.id, topic]));

export function getTopic(id: string): Topic | undefined {
  return topicById.get(id);
}

/* ── 1. Normalisieren ─────────────────────────────────────────────── */

export const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // Akzente/Umlaut-Punkte entfernen: ä → a
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/* ── 3. Wortstamm (einfacher Stemmer für DE + EN) ─────────────────── */

const SUFFIXES = ["ungen", "ing", "en", "er", "es", "et", "ed", "e", "n", "s", "t"];
const MIN_STEM = 4;

export function stem(word: string): string {
  let result = word;
  for (let pass = 0; pass < 2; pass++) {
    const suffix = SUFFIXES.find((s) => result.endsWith(s) && result.length - s.length >= MIN_STEM);
    if (!suffix) break;
    result = result.slice(0, -suffix.length);
  }
  return result;
}

/* ── 2. Synonyme ──────────────────────────────────────────────────── */

const wordSynonyms = new Map<string, string>(); // Wortstamm → Stellvertreter
const phraseSynonyms: { phrase: string; canonical: string }[] = []; // Mehrwort-Ausdrücke

for (const group of synonyms) {
  const canonical = stem(normalize(group[0]!));
  for (const member of group) {
    const normalized = normalize(member);
    if (normalized.includes(" ")) phraseSynonyms.push({ phrase: normalized, canonical });
    else if (!wordSynonyms.has(stem(normalized))) wordSynonyms.set(stem(normalized), canonical);
  }
}
// Längere Ausdrücke zuerst ersetzen („rounds of feedback“ vor „feedback“)
phraseSynonyms.sort((a, b) => b.phrase.length - a.phrase.length);

/** Bereitet Text für den Vergleich auf → Liste von Wortstämmen/Stellvertretern. */
export function prepare(text: string): string[] {
  let normalized = ` ${normalize(text)} `;
  for (const { phrase, canonical } of phraseSynonyms) {
    normalized = normalized.replaceAll(` ${phrase} `, ` ${canonical} `);
  }
  return normalized
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const stemmed = stem(word);
      return wordSynonyms.get(stemmed) ?? stemmed;
    });
}

/* ── Bewertung ────────────────────────────────────────────────────── */

/** Kleine Levenshtein-Distanz – reicht, um Tippfehler wie „brandign“ zu erkennen. */
function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i]![j] = Math.min(
        d[i - 1]![j]! + 1,
        d[i]![j - 1]! + 1,
        d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return d[a.length]![b.length]!;
}

type PreparedTopic = { topic: Topic; words: string[]; phrases: string[][] };

/** Stichwörter einmalig aufbereiten (doppelte nach Synonym-Ersetzung entfernen). */
const preparedTopics: PreparedTopic[] = topics.map((topic) => {
  const words = new Set<string>();
  const phrases = new Map<string, string[]>();
  for (const keyword of topic.keywords) {
    const tokens = prepare(keyword);
    if (tokens.length === 1) words.add(tokens[0]!);
    else if (tokens.length > 1) phrases.set(tokens.join(" "), tokens);
  }
  return { topic, words: [...words], phrases: [...phrases.values()] };
});

function containsSequence(tokens: string[], sequence: string[]): boolean {
  outer: for (let i = 0; i <= tokens.length - sequence.length; i++) {
    for (let j = 0; j < sequence.length; j++) if (tokens[i + j] !== sequence[j]) continue outer;
    return true;
  }
  return false;
}

/** Punkte für ein einzelnes Stichwort gegen ein Wort der Frage. */
function wordPoints(keyword: string, token: string): number {
  if (token === keyword) return 3;
  // Zusammensetzungen: „logoanimation“, „markenlogo“
  if (keyword.length >= 4 && (token.startsWith(keyword) || token.endsWith(keyword))) return 2;
  // Tippfehler: „brandign“
  if (keyword.length >= 5 && token.length >= 5 && distance(token, keyword) <= 1) return 2;
  return 0;
}

/** Jedes Stichwort zählt höchstens einmal – Wiederholungen in der Frage blähen nichts auf. */
function score({ words, phrases }: PreparedTopic, tokens: string[]): number {
  let total = 0;
  for (const phrase of phrases) if (containsSequence(tokens, phrase)) total += 4;
  for (const keyword of words)
    total += Math.max(0, ...tokens.map((token) => wordPoints(keyword, token)));
  return total;
}

const firstSentence = (text: string) => (text.match(/^[\s\S]*?[.!?](?=\s|$)/) ?? [text])[0];

/* ── Sprache ──────────────────────────────────────────────────────── */

const hints = {
  de: new Set(languageHints.de.map(normalize)),
  en: new Set(languageHints.en.map(normalize)),
};

/** Sprache der Frage – bei Gleichstand (z. B. nur „Logo?“) die Sprache der Seite. */
export function detectLanguage(question: string, fallback: Locale): Locale {
  const words = normalize(question).split(" ");
  const de = words.filter((w) => hints.de.has(w)).length;
  const en = words.filter((w) => hints.en.has(w)).length;
  if (de === en) return fallback;
  return de > en ? "de" : "en";
}

export function fillPlaceholders(text: string, lang: Locale): string {
  return text.replaceAll("{base}", `/${lang}`).replaceAll("{email}", site.email);
}

/* ── Antwort finden ───────────────────────────────────────────────── */

/**
 * Rangfolge der passenden Themen:
 * 1. Aspekt-Themen (Dauer, Preis, Korrekturen …) mit vollem Treffer zuerst –
 *    „Wie lange dauert eine Logo-Animation?“ ist eine Frage nach der DAUER, nicht nach Motion.
 * 2. Danach nach Punkten.
 * Smalltalk („Hallo“, „Danke“) nur, wenn sonst nichts Inhaltliches gefragt wurde.
 */
export type RankedTopic = { topic: Topic; score: number; intent: boolean };

export function findTopic(question: string): RankedTopic[] {
  const tokens = prepare(question);
  const ranked = preparedTopics
    .map((prepared) => {
      const raw = score(prepared, tokens);
      const intent = raw >= 3 && intentTopics.has(prepared.topic.id);
      return { topic: prepared.topic, score: intent ? raw + 3 : raw, intent };
    })
    .filter((entry) => entry.score > 0);

  const content = ranked.filter((entry) => !entry.topic.smallTalk);
  return (content.length > 0 ? content : ranked).sort(
    (a, b) => Number(b.intent) - Number(a.intent) || b.score - a.score,
  );
}

export function answerLocally(
  question: string,
  options: { lang: Locale; topicId?: string },
): AskAnswer {
  const { lang } = options;
  const texts = askTexts[lang];
  const forced = options.topicId ? getTopic(options.topicId) : undefined;
  if (forced) {
    return {
      topicId: forced.id,
      lang,
      text: fillPlaceholders(forced[lang].a, lang),
      followUps: forced.followUps,
    };
  }

  const [top, second] = findTopic(question);
  if (!top) {
    const offTopic = normalize(question)
      .split(" ")
      .some((word) => offTopicWords.includes(word));
    return {
      topicId: null,
      lang,
      text: fillPlaceholders(offTopic ? texts.offTopic : texts.fallback, lang),
      followUps: defaultChips,
    };
  }

  let text = top.topic[lang].a;
  // Zweites Thema nur anhängen, wenn es eine eigene Frage ist („Wie lange dauert es und was kostet es?“)
  // – nicht, wenn es nur das Fachgebiet der Aspekt-Frage ist („Wie teuer ist ein Logo?“).
  const addSecond =
    second &&
    !top.topic.smallTalk &&
    second.score >= 3 &&
    second.score >= top.score * 0.7 &&
    (second.intent || !top.intent);
  if (addSecond) text += texts.also + firstSentence(second.topic[lang].a);

  return {
    topicId: top.topic.id,
    lang,
    text: fillPlaceholders(text, lang),
    followUps: top.topic.followUps,
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Holt eine Antwort – vom (optionalen) Backend oder lokal. Fällt bei Fehlern immer auf lokal zurück. */
export async function getAnswer(
  history: HistoryEntry[],
  question: string,
  options: { lang: Locale; topicId?: string },
): Promise<AskAnswer> {
  const { min, max } = askConfig.thinkingDelay;
  if (!askConfig.endpoint || options.topicId) {
    await wait(min + Math.random() * (max - min));
    return answerLocally(question, options);
  }
  try {
    const response = await fetch(askConfig.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: options.lang, messages: history }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { reply?: unknown };
    if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Leere Antwort");
    return { topicId: null, lang: options.lang, text: data.reply, followUps: defaultChips };
  } catch {
    return answerLocally(question, options);
  }
}

/* ── Rich-Text: [Text](url) → Links ──────────────────────────────── */

export type RichToken =
  { type: "text"; value: string } | { type: "link"; label: string; href: string };

const LINK_PATTERN = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^)\s]+)\)/g;

/** Zerlegt eine Antwort in Wörter und Links (Grundlage für die Tipp-Animation). */
export function tokenize(text: string): RichToken[] {
  const tokens: RichToken[] = [];
  const pushWords = (chunk: string) => {
    for (const word of chunk.match(/\S+\s*|\s+/g) ?? []) tokens.push({ type: "text", value: word });
  };
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    if (match.index > last) pushWords(text.slice(last, match.index));
    tokens.push({ type: "link", label: match[1]!, href: match[2]! });
    last = match.index + match[0].length;
  }
  if (last < text.length) pushWords(text.slice(last));
  return tokens;
}
