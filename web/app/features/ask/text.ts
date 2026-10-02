/**
 * Textaufbereitung für das Widget: Frage UND Stichwörter werden gleich behandelt.
 *   normalisieren   Kleinschreibung, ä → a, ß → ss, Satzzeichen weg
 *   Synonyme        „kostet“, „how much“ … → „preis“ (siehe knowledge.ts)
 *   Wortstamm       „Korrekturen“ → „korrektur“, „dauert“ → „dauer“
 *   Tippfehler      „kontatkieren“ → Kontakt (ein Buchstabe anders oder ein Dreher)
 * Genutzt von engine.ts (Themen), search.ts (Website-Texte) und inquiry.ts (Anfrage).
 */
import { stemExceptions, synonyms } from "./knowledge";

export const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // Akzente/Umlaut-Punkte entfernen: ä → a
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Einfacher Wortstamm für DE + EN: Endungen kürzen, Mindestlänge 4 */
const SUFFIXES = ["ungen", "ing", "en", "er", "es", "et", "ed", "e", "n", "s", "t"];
const MIN_STEM = 4;

export function stem(word: string): string {
  const exception = stemExceptions[word];
  if (exception) return exception;
  let result = word;
  for (let pass = 0; pass < 2; pass++) {
    const suffix = SUFFIXES.find((s) => result.endsWith(s) && result.length - s.length >= MIN_STEM);
    if (!suffix) break;
    result = result.slice(0, -suffix.length);
  }
  return result;
}

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

/**
 * Kleine Tippfehler-Distanz (Damerau-Levenshtein): ein falscher, fehlender oder zusätzlicher
 * Buchstabe – oder zwei vertauschte („kontatkieren“) – zählt als 1.
 */
export function distance(a: string, b: string): number {
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
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + 1);
      }
    }
  }
  return d[a.length]![b.length]!;
}

/** Tippfehler in Synonymen erkennen – nur bei längeren Wörtern, sonst gibt es Verwechslungen */
const FUZZY_MIN = 6;
const fuzzyKeys = [...wordSynonyms].filter(([key]) => key.length >= FUZZY_MIN);
const fuzzyCache = new Map<string, string | undefined>();
/** Eingetragene Stichwörter sind nie ein Tippfehler („schnitt“ ist nicht „schritt“) */
const knownWords = new Set<string>();

/** Wörter als eingetragene Stichwörter merken (dann nie als Tippfehler behandeln) */
export function registerKnownWords(words: string[]) {
  for (const word of words) {
    if (!knownWords.has(word)) {
      knownWords.add(word);
      fuzzyCache.delete(word);
    }
  }
}

function fuzzySynonym(word: string): string | undefined {
  if (word.length < FUZZY_MIN || knownWords.has(word)) return undefined;
  if (!fuzzyCache.has(word)) {
    fuzzyCache.set(word, fuzzyKeys.find(([key]) => distance(word, key) <= 1)?.[1]);
  }
  return fuzzyCache.get(word);
}

/** Bereitet Text für den Vergleich auf → Liste von Wortstämmen/Stellvertretern. */
export function prepare(text: string, fuzzy = true): string[] {
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
      return wordSynonyms.get(stemmed) ?? (fuzzy ? fuzzySynonym(stemmed) : undefined) ?? stemmed;
    });
}

/** Lücke in einem Stichwort („wie läuft * ab“) – steht für 0 bis MAX_GAP Wörter */
export const GAP = "*";
const MAX_GAP = 3;

/** Stichwort aufbereiten (ohne Tippfehler-Suche); `*` bleibt als Lücke erhalten */
export function prepareKeyword(keyword: string): string[] {
  const tokens = keyword
    .split(GAP)
    .map((part) => prepare(part, false))
    .flatMap((part, index) => (index === 0 ? part : [GAP, ...part]));
  registerKnownWords(tokens.filter((token) => token !== GAP));
  return tokens;
}

/**
 * Passt der Ausdruck ab Position `t`? Lücken überspringen bis zu MAX_GAP Wörter.
 * Ergebnis: Positionen der getroffenen Wörter (ohne Lücken) oder null.
 */
function matchAt(tokens: string[], phrase: string[], t: number, p = 0): number[] | null {
  if (p === phrase.length) return [];
  if (phrase[p] === GAP) {
    for (let skip = 0; skip <= MAX_GAP && t + skip <= tokens.length; skip++) {
      const rest = matchAt(tokens, phrase, t + skip, p + 1);
      if (rest) return rest;
    }
    return null;
  }
  if (tokens[t] !== phrase[p]) return null;
  const rest = matchAt(tokens, phrase, t + 1, p + 1);
  return rest && [t, ...rest];
}

/** Erste Fundstelle eines (Mehrwort-)Ausdrucks in der Frage – Positionen oder null */
export function findPhrase(tokens: string[], phrase: string[]): number[] | null {
  for (let t = 0; t < tokens.length; t++) {
    const match = matchAt(tokens, phrase, t);
    if (match) return match;
  }
  return null;
}

/** Ist die (kurze) Nachricht eine dieser Antworten? „ja“, „ja bitte, gerne“, „nein danke“ … */
export function matchesReply(message: string, phrases: string[], maxWords = 4): boolean {
  const normalized = normalize(message);
  if (!normalized || normalized.split(" ").length > maxWords) return false;
  return phrases
    .map(normalize)
    .some((phrase) => normalized === phrase || normalized.startsWith(`${phrase} `));
}
