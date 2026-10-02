/**
 * Antwort-Logik des Widgets: unscharfe Stichwortsuche über die Themen aus knowledge.ts.
 * Reine Funktionen ohne UI → leicht testbar und austauschbar (z. B. gegen ein KI-Backend).
 */
import { site } from "~/config/site";
import type { Locale } from "~/i18n/config";
import { askConfig } from "./config";
import {
  askTexts,
  defaultChips,
  germanHints,
  intentTopics,
  offTopicWords,
  topics,
  type Topic,
} from "./knowledge";

export type AskAnswer = { topicId: string | null; lang: Locale; text: string; followUps: string[] };
export type HistoryEntry = { role: "user" | "assistant"; content: string };

const topicById = new Map(topics.map((topic) => [topic.id, topic]));

export function getTopic(id: string): Topic | undefined {
  return topicById.get(id);
}

export const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

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

function score(topic: Topic, question: string, tokens: string[]): number {
  let total = 0;
  for (const keyword of topic.keywords) {
    const k = normalize(keyword);
    if (k.includes(" ")) {
      if (question.includes(k)) total += 4;
      continue;
    }
    for (const token of tokens) {
      if (token === k) total += 3;
      else if (k.length >= 4 && token.startsWith(k))
        total += 2; // Plural: „animations“
      else if (k.length >= 5 && token.length >= 5 && distance(token, k) <= 1) total += 2; // Tippfehler
    }
  }
  return total;
}

const firstSentence = (text: string) => (text.match(/^[\s\S]*?[.!?](?=\s|$)/) ?? [text])[0];

/** Antwortet in der Sprache der Frage – auch wenn sie auf der „falschen“ Sprachseite gestellt wird. */
export function detectLanguage(question: string): Locale {
  return normalize(question)
    .split(" ")
    .some((word) => germanHints.includes(word))
    ? "de"
    : "en";
}

export function fillPlaceholders(text: string, lang: Locale): string {
  return text.replaceAll("{base}", `/${lang}`).replaceAll("{email}", site.email);
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

  const normalized = normalize(question);
  const tokens = normalized.split(" ").filter(Boolean);
  const ranked = topics
    .filter((topic) => topic.id !== "greeting" || tokens.length <= 3)
    .map((topic) => {
      const s = score(topic, normalized, tokens);
      return { topic, score: s > 0 && intentTopics.has(topic.id) ? s + 3 : s };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const [top, second] = ranked;
  if (!top) {
    const offTopic = tokens.some((word) => offTopicWords.includes(word));
    return {
      topicId: null,
      lang,
      text: fillPlaceholders(offTopic ? texts.offTopic : texts.fallback, lang),
      followUps: defaultChips,
    };
  }

  let text = top.topic[lang].a;
  const addSecond =
    second &&
    second.score >= top.score * 0.7 &&
    second.score >= 3 &&
    top.topic.id !== "greeting" &&
    second.topic.id !== "greeting";
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
