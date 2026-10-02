/**
 * Antwort-Logik des Widgets – reine Funktionen ohne UI (getestet in knowledge.test.ts).
 * Keine KI, kein Server: alles läuft im Browser. Ablauf pro Frage:
 *
 * 1. Aufbereiten   Frage UND Stichwörter gleich behandeln: normalisieren (ä → a, ß → ss),
 *                  Synonyme ersetzen („kostet“ → „preis“), Wortstamm („Korrekturen“ → „korrektur“)
 * 2. Wissen        feste Themen (knowledge.ts) + Themen aus den Inhalten (content.ts).
 *                  Stichwörter = eingetragene `keywords` + Wörter aus den Beispielfragen
 * 3. Gewichtung    Wörter, die bei vielen Themen vorkommen, zählen automatisch weniger
 * 4. Bewertung     Mehrwort-Ausdruck 4 · Stichwort/Lücken-Ausdruck 3 · Zusammensetzung/Tippfehler 2 ·
 *                  Wort aus einer Beispielfrage 2 (Wörter × Gewicht, jedes Stichwort einmal)
 * 5. Entscheiden   Aspekt × Fachgebiet → gezielte Antwort („Wie lange dauert eine Logo-Animation?“),
 *                  Gesprächsgedächtnis („Und was kostet das?“), Rückfrage bei Gleichstand,
 *                  Vorschläge statt Raten bei unsicheren Treffern
 */
import { site } from "~/config/site";
import type { AskContent } from "~/content/types";
import type { Locale } from "~/i18n/config";
import { askConfig } from "./config";
import { applyContent, buildContentTopics, fill, isProjectTopic, joinList } from "./content";
import type { GalleryId } from "./galleries";
import {
  cancelInquiry,
  continueInquiry,
  repeatInquiry,
  startInquiry,
  type InquiryReply,
  type InquiryState,
} from "./inquiry";
import { searchContent } from "./search";
import { distance, matchesReply, normalize, prepare, registerKnownWords } from "./text";

export { normalize, prepare, stem } from "./text";
import {
  askTexts,
  defaultChips,
  fillerWords,
  followUpStarters,
  languageHints,
  offTopicWords,
  profile,
  referenceWords,
  replyWords,
  topics,
  type Text,
  type Topic,
} from "./knowledge";

/** Gesprächsgedächtnis (nur im Arbeitsspeicher, nach dem Neuladen weg) */
export type AskContext = {
  /** zuletzt besprochenes Fachgebiet/Projekt */
  subject?: string;
  /** zuletzt gefragter Aspekt (Dauer, Preis …) */
  aspect?: string;
  /** der Bot hat eine Ja/Nein-Frage gestellt – bei „Ja“ kommt dieses Thema */
  offer?: string;
  /** der Bot hat eine Auswahl angeboten – „das erste“ → choices[0] */
  choices?: string[];
  /** laufende geführte Anfrage */
  inquiry?: InquiryState;
};

export type AskAnswer = {
  /**
   * answer = Thema gefunden · clarify = Rückfrage · unsure = Vorschläge · search = Treffer in den
   * Website-Texten · inquiry = geführte Anfrage · fallback/offTopic = nichts gefunden
   */
  kind: "answer" | "clarify" | "unsure" | "search" | "inquiry" | "fallback" | "offTopic";
  topicId: string | null;
  lang: Locale;
  text: string;
  /** Vorschläge = Themen-IDs */
  followUps: string[];
  /** Antwortmöglichkeiten als Text (geführte Anfrage) – werden wie getippt verschickt */
  replies?: string[];
  /** Bildergalerie unter der Antwort */
  gallery?: GalleryId;
  context: AskContext;
};

export type AskOptions = {
  lang: Locale;
  /** Klick auf einen Vorschlag – Thema steht fest */
  topicId?: string;
  /** Wissen aus dem Content-Layer (Projekte, Leistungen) */
  content?: AskContent;
  context?: AskContext;
  /** nur für Tests: Datum (Alter) und Zufall (Varianten) festlegen */
  now?: Date;
  random?: () => number;
};

export type HistoryEntry = { role: "user" | "assistant"; content: string };

/* ── 2. Wissen aufbauen ───────────────────────────────────────────── */

type PreparedTopic = {
  topic: Topic;
  /** eingetragene Stichwörter (ein Wort) */
  words: string[];
  /** eingetragene Mehrwort-Ausdrücke, ggf. mit Lücke (GAP) */
  phrases: string[][];
  /** Wörter aus den Beispielfragen */
  derived: string[];
};

type Knowledge = {
  prepared: PreparedTopic[];
  byId: Map<string, Topic>;
  /** Gewicht je Wort (1 = kommt nur bei einem Thema vor) */
  weights: Map<string, number>;
};

const filler = new Set(fillerWords.flatMap((word) => prepare(word, false)));

/** Lücke in einem Stichwort („wie läuft * ab“) – steht für 0 bis MAX_GAP Wörter */
const GAP = "*";
const MAX_GAP = 3;

/** Stichwort aufbereiten (ohne Tippfehler-Suche); `*` bleibt als Lücke erhalten */
function prepareKeyword(keyword: string): string[] {
  const tokens = keyword
    .split(GAP)
    .map((part) => prepare(part, false))
    .flatMap((part, index) => (index === 0 ? part : [GAP, ...part]));
  registerKnownWords(tokens.filter((token) => token !== GAP));
  return tokens;
}

function buildKnowledge(all: Topic[]): Knowledge {
  const explicit = all.map((topic) => {
    const words = new Set<string>();
    const phrases = new Map<string, string[]>();
    for (const keyword of topic.keywords) {
      const tokens = prepareKeyword(keyword);
      if (tokens.length === 1) words.add(tokens[0]!);
      else if (tokens.length > 1) phrases.set(tokens.join(" "), tokens);
    }
    return { topic, words, phrases: [...phrases.values()] };
  });

  // Wem gehört ein Wort? Eingetragene Stichwörter eines Themas werden nicht zusätzlich
  // aus Beispielfragen ANDERER Themen übernommen („Wie teuer ist ein Logo?“ → „logo“ bleibt beim Logo).
  const owners = new Map<string, Set<string>>();
  for (const { topic, words } of explicit) {
    for (const word of words) owners.set(word, (owners.get(word) ?? new Set()).add(topic.id));
  }

  const prepared: PreparedTopic[] = explicit.map(({ topic, words, phrases }) => {
    const examples = topic.examples ? [...topic.examples.de, ...topic.examples.en] : [];
    const derived = new Set(
      examples
        .flatMap((example) => prepare(example, false))
        .filter(
          (word) => word.length >= 3 && !filler.has(word) && !words.has(word) && !owners.has(word),
        ),
    );
    return { topic, words: [...words], phrases, derived: [...derived] };
  });

  // Automatische Gewichtung (IDF): je mehr Themen ein Wort nutzen, desto weniger zählt es
  const counts = new Map<string, number>();
  for (const { words, derived } of prepared) {
    for (const word of new Set([...words, ...derived]))
      counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  const n = prepared.length + 1;
  const weights = new Map<string, number>();
  for (const [word, count] of counts) {
    const weight = count <= 1 ? 1 : Math.log(n / (count + 0.5)) / Math.log(n / 1.5);
    weights.set(word, Math.max(0.35, Math.min(1, weight)));
  }

  return { prepared, byId: new Map(all.map((topic) => [topic.id, topic])), weights };
}

const staticKnowledge = buildKnowledge(topics);
const knowledgeCache = new WeakMap<AskContent, Knowledge>();

function knowledgeFor(content?: AskContent): Knowledge {
  if (!content) return staticKnowledge;
  let knowledge = knowledgeCache.get(content);
  if (!knowledge) {
    // Inhalts-Themen zuerst: bei Punktgleichstand gewinnt das spezifischere Thema (Projekt)
    knowledge = buildKnowledge([...buildContentTopics(content), ...applyContent(topics, content)]);
    knowledgeCache.set(content, knowledge);
  }
  return knowledge;
}

export function getTopic(id: string, content?: AskContent): Topic | undefined {
  return knowledgeFor(content).byId.get(id);
}

/* ── 3./4. Bewerten ───────────────────────────────────────────────── */

const POINTS = { phrase: 4, gapPhrase: 3, word: 3, partial: 2, example: 2 };
/** sicherer Treffer: mindestens ein eingetragenes Stichwort mit ordentlich Punkten */
const STRONG = 2.4;
/** darunter wird nicht geraten, sondern nachgefragt */
const UNSURE = 2;
/** zwei Fachgebiete so nah beieinander → Rückfrage „Meinst du A oder B?“ */
const CLOSE = 0.85;
/** zweite Frage in derselben Nachricht wird ab diesem Verhältnis mitbeantwortet */
const SECOND = 0.7;
/** so viel besser muss ein allgemeines Thema sein, um ein sicheres Fachgebiet zu schlagen */
const GENERAL_LEAD = 1.5;

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

function findPhrase(tokens: string[], phrase: string[]): number[] | null {
  for (let t = 0; t < tokens.length; t++) {
    const match = matchAt(tokens, phrase, t);
    if (match) return match;
  }
  return null;
}

/** Punkte für ein eingetragenes Stichwort gegen ein Wort der Frage. */
function wordPoints(keyword: string, token: string): number {
  if (token === keyword) return POINTS.word;
  // Zusammensetzungen: „logoanimation“, „markenlogo“
  if (keyword.length >= 4 && (token.startsWith(keyword) || token.endsWith(keyword))) {
    return POINTS.partial;
  }
  // Tippfehler: „brandign“
  if (keyword.length >= 5 && token.length >= 5 && distance(token, keyword) <= 1) {
    return POINTS.partial;
  }
  return 0;
}

export type RankedTopic = {
  topic: Topic;
  score: number;
  /** mindestens ein eingetragenes Stichwort getroffen (nicht nur Beispiel-Wörter) */
  explicit: boolean;
};

/** Wort ist Teil eines längeren Ausdrucks eines ANDEREN Themas → zählt nur noch so viel */
const COVERED = 0.5;

function rank(tokens: string[], k: Knowledge): RankedTopic[] {
  const weight = (word: string) => k.weights.get(word) ?? 1;

  // 1. Mehrwort-Ausdrücke – und merken, welche Wörter der Frage sie „belegen“
  const phraseHits = k.prepared.map((prepared) => {
    let score = 0;
    const covered = new Set<number>();
    for (const phrase of prepared.phrases) {
      const match = findPhrase(tokens, phrase);
      if (!match) continue;
      score += phrase.includes(GAP) ? POINTS.gapPhrase : POINTS.phrase;
      match.forEach((index) => covered.add(index));
    }
    return { score, covered };
  });
  const coveredBy = new Map<number, Set<number>>(); // Wort-Position → Themen (Index)
  phraseHits.forEach(({ covered }, topicIndex) => {
    for (const index of covered)
      coveredBy.set(index, (coveredBy.get(index) ?? new Set()).add(topicIndex));
  });
  /** Spezifischeres schlägt Allgemeines: „wie lange … schon“ (Werdegang) vor „wie lange“ (Dauer) */
  const factor = (index: number, topicIndex: number) => {
    const owners = coveredBy.get(index);
    return owners && [...owners].some((owner) => owner !== topicIndex) ? COVERED : 1;
  };

  // 2. Einzelne Wörter (eingetragen und aus Beispielfragen), jedes Stichwort zählt einmal
  return k.prepared
    .map((prepared, topicIndex): RankedTopic => {
      let { score } = phraseHits[topicIndex]!;
      let explicit = score > 0;
      for (const keyword of prepared.words) {
        let best = 0;
        tokens.forEach((token, index) => {
          best = Math.max(best, wordPoints(keyword, token) * factor(index, topicIndex));
        });
        if (best > 0) {
          score += best * weight(keyword);
          explicit = true;
        }
      }
      for (const word of prepared.derived) {
        const index = tokens.indexOf(word);
        if (index >= 0) score += POINTS.example * weight(word) * factor(index, topicIndex);
      }
      return { topic: prepared.topic, score, explicit };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Alle passenden Themen, beste zuerst (bei Gleichstand: Reihenfolge der Wissensbasis). */
export function findTopics(question: string, content?: AskContent): RankedTopic[] {
  const k = knowledgeFor(content);
  return rank(prepare(question), k);
}

const isStrong = (entry: RankedTopic | undefined): entry is RankedTopic =>
  !!entry && entry.explicit && entry.score >= STRONG;

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

/* ── Texte: Varianten, Platzhalter ────────────────────────────────── */

type Env = { lang: Locale; now: Date; random: () => number };

/** Varianten → eine zufällig wählen (wirkt weniger wie ein Automat) */
function pickText(text: Text, random: () => number): string {
  if (typeof text === "string") return text;
  return text[Math.min(text.length - 1, Math.floor(random() * text.length))] ?? "";
}

/** Alter am Datum `now` – aus profile.birthDate berechnet, nie fest eingetragen. */
export function ageAt(now: Date): number {
  const [year, month, day] = profile.birthDate.split("-").map(Number) as [number, number, number];
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  return now.getFullYear() - year - (hadBirthday ? 0 : 1);
}

function isBirthday(now: Date): boolean {
  const [, month, day] = profile.birthDate.split("-").map(Number);
  return now.getMonth() + 1 === month && now.getDate() === day;
}

const socialLink = ({ label, url }: { label: string; url: string }) => `[${label}](${url})`;

export function fillPlaceholders(text: string, lang: Locale, now = new Date()): string {
  return text
    .replaceAll("{base}", `/${lang}`)
    .replaceAll("{email}", site.email)
    .replaceAll("{whatsapp}", site.whatsapp)
    .replaceAll("{whatsappLink}", `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`)
    .replaceAll("{socials}", joinList(site.socials.map(socialLink), lang))
    .replace(/\{social:(\w+)\}/g, (_, name: string) => {
      const found = site.socials.find((s) => s.label.toLowerCase() === name.toLowerCase());
      return found ? socialLink(found) : name;
    })
    .replaceAll("{age}", String(ageAt(now)))
    .replaceAll("{birthdayNote}", isBirthday(now) ? askTexts[lang].birthdayToday : "");
}

const firstSentence = (text: string) => (text.match(/^[\s\S]*?[.!?](?=\s|$)/) ?? [text])[0];

/* ── 5. Entscheiden ───────────────────────────────────────────────── */

const references = new Set(referenceWords.map(normalize));
const starters = followUpStarters.map(normalize);

/** Fachgebiet + übergeordnete Fachgebiete (Logo → Branding) */
function subjectChain(id: string | undefined, k: Knowledge): string[] {
  const chain: string[] = [];
  for (let current = id; current && !chain.includes(current);) {
    chain.push(current);
    current = k.byId.get(current)?.parent;
  }
  return chain;
}

/** Zwei Fachgebiete gehören zusammen (eins ist dem anderen übergeordnet). */
const related = (a: string, b: string, k: Knowledge) =>
  subjectChain(a, k).includes(b) || subjectChain(b, k).includes(a);

const label = (topic: Topic, lang: Locale) => topic[lang].label;

type Reply = { topic: Topic; subject?: string };

/** Antworttext eines Themas – bei Aspekten gezielt für das Fachgebiet (facets). */
function render({ topic, subject }: Reply, k: Knowledge, env: Env): string {
  const { lang, random } = env;
  if (topic.kind !== "aspect" || !subject || !topic.facets) return pickText(topic[lang].a, random);

  const via = subjectChain(subject, k).find((id) => topic.facets?.[id]);
  if (!via) return pickText(topic[lang].a, random);
  const text = pickText(topic.facets[via]![lang], random);

  // Frage zu einem konkreten Projekt, Antwort gilt allgemein für sein Fachgebiet
  const project = k.byId.get(subject);
  if (via !== subject && project && isProjectTopic(subject)) {
    const title = project[lang].label ?? "";
    if (!text.includes(title)) return fill(askTexts[lang].projectFacet, { title }) + text;
  }
  return text;
}

function build(
  kind: AskAnswer["kind"],
  text: string,
  followUps: string[],
  context: AskContext,
  env: Env,
  topicId: string | null = null,
  extra: Pick<AskAnswer, "replies" | "gallery"> = {},
): AskAnswer {
  return {
    kind,
    topicId,
    lang: env.lang,
    text: fillPlaceholders(text, env.lang, env.now),
    followUps,
    context,
    ...extra,
  };
}

/** Nur das Langzeit-Gedächtnis behalten (Angebote/Auswahl gelten immer nur für eine Antwort) */
const keep = ({ subject, aspect }: AskContext): AskContext => ({ subject, aspect });

/** Antwort der geführten Anfrage in eine AskAnswer verpacken */
function inquiryAnswer(reply: InquiryReply, context: AskContext, env: Env): AskAnswer {
  const next: AskContext = { ...keep(context), inquiry: reply.state };
  const followUps = reply.state ? [] : defaultChips;
  return build("inquiry", reply.text, followUps, next, env, "inquiry", {
    replies: reply.replies,
  });
}

/** Antwort auf ein Thema (+ optional eine zweite Frage aus derselben Nachricht). */
function answerTopic(
  reply: Reply,
  context: AskContext,
  k: Knowledge,
  env: Env,
  second?: Reply,
): AskAnswer {
  const { topic } = reply;
  // „Projekt anfragen“ startet die geführte Anfrage
  if (topic.id === "inquiry") return inquiryAnswer(startInquiry(env.lang), context, env);

  let text = render(reply, k, env);
  if (second) text += askTexts[env.lang].also + firstSentence(render(second, k, env));

  // leere Vorschläge (z. B. „Erzähl mehr“) → passend zum Gesprächsthema
  const contextTopic = context.subject ? k.byId.get(context.subject) : undefined;
  const followUps =
    topic.followUps.length > 0 ? topic.followUps : (contextTopic?.followUps ?? defaultChips);

  // Gedächtnis fortschreiben
  let next = keep(context);
  if (topic.kind === "subject") next = { subject: topic.id };
  else if (topic.kind === "aspect")
    next = { subject: reply.subject ?? context.subject, aspect: topic.id };
  else if (topic.kind === "general") next = {};

  // Ja/Nein-Angebot am Ende („Möchtest du Bilder sehen?“)
  if (topic.offer && !second) {
    text += ` ${topic.offer[env.lang]}`;
    next.offer = topic.offer.yes;
  }

  return build("answer", text, followUps, next, env, topic.id, { gallery: topic.gallery });
}

const noThanks = (context: AskContext, env: Env) =>
  build(
    "answer",
    pickText(askTexts[env.lang].noThanks, env.random),
    defaultChips,
    keep(context),
    env,
  );

/** Welche Option der letzten Auswahl ist gemeint? („das erste“, „Nummer 2“, „the second one“) */
function pickChoice(question: string, choices: string[]): string | undefined {
  const words = normalize(question).split(" ");
  if (words.length > 4) return undefined;
  // Wörter der Reihe nach prüfen: „the second one“ → „second“ zählt, nicht „one“
  for (const word of words) {
    const ordinal = replyWords.ordinals.find((o) => o.words.includes(word));
    if (ordinal) return choices.at(ordinal.index);
  }
  return undefined;
}

export function answerLocally(question: string, options: AskOptions): AskAnswer {
  const env: Env = {
    lang: options.lang,
    now: options.now ?? new Date(),
    random: options.random ?? Math.random,
  };
  const { lang } = env;
  const texts = askTexts[lang];
  const k = knowledgeFor(options.content);
  const context = options.context ?? {};

  // Laufende geführte Anfrage: jede Nachricht ist die Antwort auf die aktuelle Frage –
  // außer „Abbrechen“ oder eine echte Zwischenfrage („Was kostet das?“)
  if (context.inquiry && !options.topicId) {
    if (matchesReply(question, replyWords.cancel)) {
      return inquiryAnswer(cancelInquiry(lang), context, env);
    }
    if (question.trim().endsWith("?")) {
      const side = answerLocally(question, { ...options, context: keep(context) });
      if (side.kind === "answer" && side.topicId !== "inquiry") {
        const back = repeatInquiry(context.inquiry, lang);
        return {
          ...side,
          text: `${side.text}\n\n${fillPlaceholders(back.text, lang, env.now)}`,
          followUps: [],
          replies: back.replies,
          context: { ...keep(context), inquiry: back.state },
        };
      }
    }
    const skipped = matchesReply(question, replyWords.skip, 2);
    return inquiryAnswer(continueInquiry(context.inquiry, question, lang, skipped), context, env);
  }

  // Klick auf einen Vorschlag: Thema steht fest, Aspekte nutzen das Fachgebiet des Gesprächs
  const forced = options.topicId ? k.byId.get(options.topicId) : undefined;
  if (forced) {
    const subject = forced.kind === "aspect" ? context.subject : undefined;
    return answerTopic({ topic: forced, subject }, context, k, env);
  }

  // Antwort auf eine Auswahl-Rückfrage: „das erste“, „Nummer zwei“
  const chosen = context.choices && pickChoice(question, context.choices);
  const chosenTopic = chosen ? k.byId.get(chosen) : undefined;
  if (chosenTopic) return answerTopic({ topic: chosenTopic }, context, k, env);

  // Antwort auf eine Ja/Nein-Frage des Bots („Möchtest du Bilder sehen?“ → „Ja, gerne“)
  const offered = context.offer ? k.byId.get(context.offer) : undefined;
  if (matchesReply(question, replyWords.yes)) {
    if (offered) return answerTopic({ topic: offered, subject: context.subject }, context, k, env);
    if (context.choices?.length === 1) {
      const only = k.byId.get(context.choices[0]!);
      if (only) return answerTopic({ topic: only }, context, k, env);
    }
  }
  if (matchesReply(question, replyWords.no) && (offered || context.choices)) {
    return noThanks(context, env);
  }

  const tokens = prepare(question);
  const ranked = rank(tokens, k);
  const candidates = ranked.filter((entry) => entry.topic.kind !== "smallTalk");
  const smallTalk = ranked.find((entry) => entry.topic.kind === "smallTalk");
  const [top] = candidates;

  // Smalltalk („Hallo“, „Wie geht’s?“) nur, wenn nichts Inhaltliches sicher erkannt wurde
  if (smallTalk && !isStrong(top)) return answerTopic({ topic: smallTalk.topic }, context, k, env);

  // „Ja“/„Nein“ ohne offene Frage → freundlich weiterhelfen statt „weiß ich nicht“
  if (!isStrong(top) && matchesReply(question, [...replyWords.yes, ...replyWords.no])) {
    const help = k.byId.get("help");
    if (help) return answerTopic({ topic: help }, context, k, env);
  }

  // Nichts Sicheres gefunden → in den Website-Texten suchen (Projekte, Leistungsseiten)
  const unsure = !top || top.score < UNSURE || (!top.explicit && top.score < STRONG);
  if (unsure) {
    const hit = searchContent(question, options.content, lang, filler);
    if (hit && (!top || hit.matched >= 2)) {
      const text = fill(texts.searchHit, {
        title: hit.title,
        snippet: hit.snippet,
        link: hit.link,
      });
      return build("search", text, defaultChips, keep(context), env);
    }
  }

  if (!top) {
    const offTopic = normalize(question)
      .split(" ")
      .some((word) => offTopicWords.includes(word));
    const next: AskContext = offTopic ? { ...keep(context), offer: "services" } : keep(context);
    return build(
      offTopic ? "offTopic" : "fallback",
      pickText(offTopic ? texts.offTopic : texts.fallback, env.random),
      defaultChips,
      next,
      env,
    );
  }

  // Unsicher → nicht raten, sondern die naheliegendsten Themen vorschlagen
  // (zu wenig Punkte oder nur ein einzelnes Wort aus einer Beispielfrage getroffen)
  if (unsure) {
    const suggestions = candidates
      .filter((entry) => label(entry.topic, lang))
      .slice(0, 3)
      .map((entry) => entry.topic.id);
    if (suggestions.length === 0) {
      return build(
        "fallback",
        pickText(texts.fallback, env.random),
        defaultChips,
        keep(context),
        env,
      );
    }
    const next = { ...keep(context), choices: suggestions };
    return build("unsure", pickText(texts.unsure, env.random), suggestions, next, env);
  }

  const normalized = normalize(question);
  const words = normalized.split(" ");
  const subjects = candidates.filter((entry) => entry.topic.kind === "subject");
  const subject = subjects.find((entry) => entry.explicit && entry.score >= UNSURE);
  const aspects = candidates.filter((entry) => entry.topic.kind === "aspect" && isStrong(entry));
  const generals = candidates.filter((entry) => entry.topic.kind === "general" && isStrong(entry));
  /** „… das?“, „… dafür?“ oder sehr kurze Frage → bezieht sich aufs vorige Thema */
  const refersBack = words.some((word) => references.has(word)) || tokens.length <= 2;
  /** „Und bei Musik?“ → vorige Frage auf neues Fachgebiet übertragen */
  const continues =
    tokens.length <= 4 && starters.some((s) => normalized === s || normalized.startsWith(`${s} `));

  // 1. Frage NACH etwas (Dauer, Preis …) – gezielt fürs Fachgebiet der Frage oder des Gesprächs.
  //    Ein klar besser passendes allgemeines Thema geht vor („Wie lange hast du studiert?“),
  //    die Aspekt-Frage wird dann ggf. als zweite Frage mitbeantwortet.
  const [aspect, secondAspect] = aspects;
  if (aspect) {
    const facetSubject =
      subject?.topic.id ?? (refersBack || continues ? context.subject : undefined);
    const general = generals[0];
    const [first, ...others] =
      general && general.score > aspect.score ? [general, aspect] : [aspect, secondAspect, general];
    const second = others.find((entry) => entry && entry.score >= first.score * SECOND);
    return answerTopic(
      { topic: first.topic, subject: facetSubject },
      context,
      k,
      env,
      second && { topic: second.topic, subject: facetSubject },
    );
  }

  // 2. Nachfrage mit neuem Fachgebiet: „Wie lange dauert Branding?“ → „Und bei Musik?“
  const lastAspect = context.aspect ? k.byId.get(context.aspect) : undefined;
  if (subject && continues && lastAspect && generals.length === 0) {
    return answerTopic({ topic: lastAspect, subject: subject.topic.id }, context, k, env);
  }

  // 3. Fachgebiet schlägt Allgemeines („Was machst du für Musik?“ → Musik, nicht Leistungen) –
  //    außer das allgemeine Thema passt deutlich besser („Bist du auf Social Media?“)
  const strongSubject = subjects.find(isStrong);
  const main =
    strongSubject && top.score < strongSubject.score * GENERAL_LEAD ? strongSubject : top;
  const rest = candidates.filter((entry) => entry !== main);

  // Rückfrage, wenn zwei verschiedene Fachgebiete gleich gut passen („Cover oder Logo?“)
  // oder nur Wörter aus Beispielfragen getroffen wurden und ein zweites Thema genauso nah ist
  const rival = rest[0];
  const bothSubjects = main.topic.kind === "subject" && rival?.topic.kind === "subject";
  if (
    rival &&
    (bothSubjects || !main.explicit) &&
    rival.score >= main.score * CLOSE &&
    !related(main.topic.id, rival.topic.id, k) &&
    label(main.topic, lang) &&
    label(rival.topic, lang)
  ) {
    // Passt eins davon zum bisherigen Gespräch, nimm das statt nachzufragen
    const fromContext = [main, rival].find((entry) =>
      subjectChain(context.subject, k).includes(entry.topic.id),
    );
    if (fromContext) return answerTopic({ topic: fromContext.topic }, context, k, env);
    const text = fill(texts.clarify, {
      a: label(main.topic, lang)!,
      b: label(rival.topic, lang)!,
    });
    const choices = [main.topic.id, rival.topic.id];
    return build("clarify", text, choices, { ...keep(context), choices }, env);
  }

  // Zweite Frage in derselben Nachricht („Wer bist du und welche Programme nutzt du?“)
  const second = rest.find(
    (entry) =>
      entry.topic.kind !== "subject" && isStrong(entry) && entry.score >= main.score * SECOND,
  );
  return answerTopic(
    { topic: main.topic },
    context,
    k,
    env,
    second && {
      topic: second.topic,
      subject: main.topic.kind === "subject" ? main.topic.id : undefined,
    },
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Holt eine Antwort – vom (optionalen) Backend oder lokal. Fällt bei Fehlern immer auf lokal zurück. */
export async function getAnswer(
  history: HistoryEntry[],
  question: string,
  options: AskOptions,
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
    return {
      kind: "answer",
      topicId: null,
      lang: options.lang,
      text: data.reply,
      followUps: defaultChips,
      context: options.context ?? {},
    };
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
