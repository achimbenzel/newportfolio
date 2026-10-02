/**
 * „Kannst du XY designen?“ – erkennt Anfrage-Absicht und Dinge aus dem Leistungskatalog.
 *
 *   hasRequestIntent   „Kannst du …“, „Ich brauche …“, „Can you …“ (nicht nach einem Fragewort,
 *                      nicht „Kannst du mir sagen …“)
 *   findDeliverables   welche Dinge aus `deliverables` gemeint sind – genauere Treffer gewinnen
 *                      („Buchcover“ vor „Cover“, „Logo-Animation“ vor „Logo“)
 *   askedObject        das gefragte Ding als Text, wenn es nicht im Katalog steht
 *                      („Kannst du mir eine Hundehütte designen?“ → „Hundehütte“)
 *
 * Daten (Wendungen, Verben, Katalog): knowledge.ts · Antworten: engine.ts
 */
import {
  deliverables,
  designVerbs,
  infoVerbs,
  questionWords,
  requestPhrases,
  type Deliverable,
} from "./knowledge";
import { distance, findPhrase, normalize, prepareKeyword } from "./text";

const requests = requestPhrases.map((phrase) => normalize(phrase).split(" "));
const questions = new Set(questionWords.map(normalize));
const infos = new Set(infoVerbs.map(normalize));
const verbs = new Set(designVerbs.map(normalize));

/** Position der ersten Anfrage-Wendung in den Wörtern – oder -1 */
function requestAt(words: string[]): { index: number; length: number } | undefined {
  for (let i = 0; i < words.length; i++) {
    const phrase = requests.find((p) => p.every((word, offset) => words[i + offset] === word));
    if (phrase) return { index: i, length: phrase.length };
  }
  return undefined;
}

/** Fragt jemand nach einer Leistung? („Kannst du …?“, „Ich brauche …“) */
export function hasRequestIntent(question: string): boolean {
  const words = normalize(question).split(" ");
  const found = requestAt(words);
  if (!found) return false;
  // „Was kannst du alles?“ → Wissensfrage
  if (words.slice(0, found.index).some((word) => questions.has(word))) return false;
  // „Kannst du mir sagen/zeigen …“ → Wissensfrage (Verb bis zu drei Wörter nach der Wendung)
  const after = words.slice(found.index + found.length, found.index + found.length + 3);
  return !after.some((word) => infos.has(word));
}

/** Kommt ein Gestaltungs-Verb vor („designen“, „gestalten“, „draw“ …)? */
export const hasDesignVerb = (question: string) =>
  normalize(question)
    .split(" ")
    .some((word) => verbs.has(word));

/* ── Katalog durchsuchen ──────────────────────────────────────────── */

const prepared = deliverables.map((deliverable) => ({
  deliverable,
  keywords: deliverable.words.map((word) => ({ word, tokens: prepareKeyword(word) })),
}));

type Hit = { deliverable: Deliverable; positions: number[]; quality: number };

/**
 * Güte eines Treffers: mehr getroffene Wörter > genaues Wort > Wortteil/Tippfehler > längeres
 * Stichwort. So gewinnt bei Überschneidung das Genauere.
 */
const quality = (words: number, exact: boolean, length: number) =>
  words * 1000 + (exact ? 500 : 0) + length;

function bestHit(tokens: string[], entry: (typeof prepared)[number]): Hit | undefined {
  let best: Hit | undefined;
  const consider = (hit: Hit) => {
    if (!best || hit.quality > best.quality) best = hit;
  };
  for (const { word, tokens: keyword } of entry.keywords) {
    if (keyword.length > 1) {
      const positions = findPhrase(tokens, keyword);
      if (positions) {
        consider({
          deliverable: entry.deliverable,
          positions,
          quality: quality(positions.length, true, word.length),
        });
      }
      continue;
    }
    const k = keyword[0]!;
    tokens.forEach((token, index) => {
      const exact = token === k;
      // Zusammensetzungen („Bandshirt“, „Weinetikett“) und Tippfehler, nur bei längeren Wörtern
      const partial =
        !exact &&
        k.length >= 4 &&
        (token.startsWith(k) ||
          token.endsWith(k) ||
          (k.length >= 5 && token.length >= 5 && distance(token, k) <= 1));
      if (exact || partial) {
        consider({
          deliverable: entry.deliverable,
          positions: [index],
          quality: quality(1, exact, k.length),
        });
      }
    });
  }
  return best;
}

/** Gemeinte Dinge aus dem Katalog, in der Reihenfolge der Frage (höchstens vier). */
export function findDeliverables(tokens: string[]): Deliverable[] {
  const hits = prepared
    .map((entry) => bestHit(tokens, entry))
    .filter((hit): hit is Hit => !!hit)
    .sort((a, b) => b.quality - a.quality);

  // Überschneidungen: Wörter, die ein genauerer Treffer schon belegt, zählen nicht noch einmal
  const taken = new Set<number>();
  const accepted: Hit[] = [];
  for (const hit of hits) {
    if (hit.positions.some((position) => taken.has(position))) continue;
    hit.positions.forEach((position) => taken.add(position));
    accepted.push(hit);
  }
  return accepted
    .sort((a, b) => Math.min(...a.positions) - Math.min(...b.positions))
    .slice(0, 4)
    .map((hit) => hit.deliverable);
}

/* ── Unbekanntes Ding aus der Frage lesen ─────────────────────────── */

const DE_OBJECT =
  /\b(?:kannst|könntest|würdest|machst|gestaltest|designst|entwirfst|erstellst|zeichnest|malst)\s+du\s+(?:(?:mir|uns|auch|bitte|vielleicht|mal|eventuell|noch|so)\s+)*(?:(?:ein|eine|einen|einem|einer|mein|meine|meinen|unser|unsere|unseren|das|die|den|der)\s+)?(.+?)\s+(?:designen|gestalten|entwerfen|zeichnen|malen|illustrieren|erstellen|kreieren)\b/i;
const EN_OBJECT =
  /\b(?:can|could|would|will)\s+you\s+(?:please\s+)?(?:design|draw|illustrate|create|sketch|paint)\s+(?:(?:me|us)\s+)?(?:(?:a|an|the|my|our|some)\s+)?(.+?)(?=\s+(?:for|with|in|that|which|please|by)\b|[?.!,]|$)/i;
/** Platzhalter-Wörter: dann lieber keine Wiederholung („Kannst du was Schönes designen?“) */
const VAGUE = new Set(["was", "etwas", "das", "dies", "es", "something", "anything", "it", "this"]);

/** Das gefragte Ding als kurzer Text – oder undefined, wenn es sich nicht sauber lesen lässt. */
export function askedObject(question: string): string | undefined {
  const match = question.match(DE_OBJECT) ?? question.match(EN_OBJECT);
  const object = match?.[1]
    ?.replace(/[[\]{}()„“"'‚‘«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!object || object.length > 40) return undefined;
  const words = object.split(" ");
  if (words.length > 4 || words.some((word) => VAGUE.has(normalize(word)))) return undefined;
  return object;
}
