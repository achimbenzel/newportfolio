/**
 * Wissensbasis des „Frag Achim“-Bots. Anleitung: docs/09-ask-widget.md
 *
 * ── PERSÖNLICHKEIT ───────────────────────────────────────────────────────────────
 * Der Bot ist Achims Assistent: freundlich, direkt und auf den Punkt – locker im Ton
 * („du“, kurze Sätze), aber professionell. Ehrlich, wenn er etwas nicht weiß (→ E-Mail),
 * keine Floskeln, keine Emojis, ab und zu ein Augenzwinkern. Über sich spricht er in der
 * 1. Person („ich“), über Achim in der 3. Person („Achim …“). Antworten: 1–3 Sätze.
 *
 * ── AUFBAU EINES THEMAS ─────────────────────────────────────────────────────────
 * - id        eindeutiger Schlüssel
 * - kind      smallTalk  Begrüßung, Danke … (verliert immer gegen ein echtes Thema)
 *             subject    Fachgebiet / Gegenstand (Branding, Logo, Musik … – Projekte automatisch)
 *             aspect     Frage NACH etwas rund um ein Projekt (Dauer, Preis, Ablauf …) – geht
 *                        vor; mit `facets` gibt es je Fachgebiet eine gezielte Antwort
 *             general    alles andere (Über Achim, Programme, Hobbys …)
 * - keywords  Suchbegriffe; Mehrwort-Ausdrücke („wie lange“) zählen stärker.
 *             `*` = Lücke für bis zu drei Wörter: „wie läuft * ab“ passt auch auf
 *             „Wie läuft ein Branding-Projekt ab?“. Synonyme gehören in `synonyms`, nicht hierher.
 * - examples  Beispielfragen DE/EN – liefern zusätzliche Stichwörter UND werden automatisch
 *             als Tests geprüft (jede Beispielfrage muss bei ihrem Thema landen).
 * - facets    nur bei `aspect`: Antwort je Fachgebiet (Fallback: übergeordnetes Fachgebiet,
 *             dann die allgemeine Antwort `a`)
 * - parent    nur bei `subject`: übergeordnetes Fachgebiet (Logo → Branding)
 * - followUps Vorschläge nach der Antwort (Themen-IDs); leer = passend zum Gesprächsthema
 * - de / en   label (Vorschlags-Chip), q (Frage beim Klick), a (Antwort – Text oder Liste
 *             von Varianten, dann wird zufällig gewählt)
 *
 * Platzhalter: {base} → /de bzw. /en · {email} → Kontaktadresse · {age} → Achims Alter
 *              {birthdayNote} → Hinweis, falls heute Geburtstag ist
 * Links: [Text](url) – intern mit {base}, extern mit https://, Mail mit mailto:
 *
 * Was AUTOMATISCH kommt (hier NICHT eintragen): Projekte aus Sanity (Titel, Kunde, Branche,
 * Beschreibung) und Leistungsseiten (Einleitung, Ablauf) – siehe content/ask.server.ts.
 *
 * Nach jeder Änderung: `npm test`.
 */
import type { Locale } from "~/i18n/config";

export type TopicKind = "smallTalk" | "subject" | "aspect" | "general";
/** Ein Text oder mehrere Varianten (zufällige Auswahl → wirkt lebendiger) */
export type Text = string | string[];
export type TopicText = { label?: string; q?: string; a: Text };

export type Topic = {
  id: string;
  kind: TopicKind;
  keywords: string[];
  examples?: Record<Locale, string[]>;
  followUps: string[];
  parent?: string;
  facets?: Record<string, Record<Locale, Text>>;
} & Record<Locale, TopicText>;

/** Feste Fakten für berechnete Antworten */
export const profile = {
  birthDate: "2000-10-04",
};

export const askTexts: Record<
  Locale,
  {
    greeting: Text;
    offTopic: Text;
    fallback: Text;
    unsure: Text;
    clarify: string;
    also: string;
    birthdayToday: string;
    /* ── Vorlagen für automatisch erzeugte Antworten (content.ts) ── */
    projects: string;
    projectFacet: string;
    project: string;
    projectQ: string;
    industry: string;
    industryQ: string;
    serviceMore: string;
    steps: string;
    processIntro: string;
    socials: string;
    and: string;
    numbers: string[];
  }
> = {
  de: {
    greeting: [
      "Hi! Ich bin Achims Assistent. Frag mich gern zu seinen Leistungen, Projekten oder wie eine Zusammenarbeit abläuft.",
      "Hallo! Ich beantworte dir Fragen rund um Achim – von Branding über Motion Design bis zur Kontaktaufnahme.",
    ],
    offTopic: [
      "Da bin ich leider der Falsche – ich kenne mich nur mit Achims Designarbeit aus. Soll ich dir erzählen, was er anbietet?",
      "Das liegt außerhalb meines Fachgebiets. Bei Fragen zu Achims Arbeit bin ich aber ganz Ohr.",
    ],
    fallback: [
      "Da muss ich passen – dazu habe ich keine Infos. Am schnellsten hilft dir Achim direkt weiter: [{email}](mailto:{email}).",
      "Gute Frage, darauf habe ich aber keine sichere Antwort. Schreib Achim einfach kurz: [{email}](mailto:{email}).",
    ],
    unsure: [
      "Ich bin mir nicht ganz sicher, was du meinst. Geht es um eines davon?",
      "Da bin ich nicht sicher, ob ich dich richtig verstehe. Meinst du vielleicht eines davon?",
    ],
    clarify: "Meinst du {a} oder {b}?",
    also: "\n\nAußerdem: ",
    birthdayToday: " – also heute!",
    /** Antwort auf „Welche Projekte/Kunden?“, sobald es Projekte gibt – {list} = Projekte mit Links */
    projects:
      "Zum Beispiel {list}. Alle Projekte findest du auf der Seite [Projekte]({base}/work).",
    /** Aspekt-Frage zu einem konkreten Projekt („Wie lange hat Gute Stube gedauert?“) */
    projectFacet: "Wie das genau bei {title} war, weiß ich nicht – allgemein gilt: ",
    project: "{title} ({category}, {year}): {summary} Mehr dazu auf der [Projektseite]({link}).",
    projectQ: "Erzähl mir von {title}",
    industry: "Ja, zum Beispiel {list}.",
    industryQ: "Hast du schon etwas im Bereich {industry} gemacht?",
    serviceMore: " Mehr unter [{title}]({link}).",
    steps: "Bei {title} läuft es in {count} Schritten: {list}.",
    processIntro:
      "Jedes Projekt beginnt mit einem Gespräch und bleibt bis zum Ende bei derselben Person. Die Schritte hängen von der Art ab:",
    socials: "Du findest Achim hier: {list}.",
    and: " und ",
    numbers: [
      "null",
      "einem",
      "zwei",
      "drei",
      "vier",
      "fünf",
      "sechs",
      "sieben",
      "acht",
      "neun",
      "zehn",
    ],
  },
  en: {
    greeting: [
      "Hi! I'm Achim's assistant. Feel free to ask about his services, projects or how working together works.",
      "Hello! I answer questions about Achim – from branding and motion design to getting in touch.",
    ],
    offTopic: [
      "I'm afraid that's not my area – I only know about Achim's design work. Want to hear what he offers?",
      "That's outside my field. But if you have questions about Achim's work, I'm all ears.",
    ],
    fallback: [
      "I'll have to pass on that one – I don't have any info on it. Achim can help you fastest: [{email}](mailto:{email}).",
      "Good question, but I don't have a reliable answer. Just drop Achim a line: [{email}](mailto:{email}).",
    ],
    unsure: [
      "I'm not quite sure what you mean. Is it about one of these?",
      "I'm not sure I understood you correctly. Did you mean one of these?",
    ],
    clarify: "Do you mean {a} or {b}?",
    also: "\n\nAlso: ",
    birthdayToday: " – that's today!",
    projects: "For example {list}. You'll find all projects on the [Work page]({base}/work).",
    projectFacet: "I don't know the exact details for {title} – in general: ",
    project: "{title} ({category}, {year}): {summary} More on the [project page]({link}).",
    projectQ: "Tell me about {title}",
    industry: "Yes, for example {list}.",
    industryQ: "Have you done anything in {industry}?",
    serviceMore: " See [{title}]({link}).",
    steps: "{title} runs in {count} steps: {list}.",
    processIntro:
      "Every project starts with a conversation and stays with the same person until it's finished. The steps depend on the type:",
    socials: "You can find Achim here: {list}.",
    and: " and ",
    numbers: [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ],
  },
};

/** Begrüßung über dem Chatfenster – je nach Tageszeit, zufällig gewählt */
export const timeGreetings: Record<
  Locale,
  Record<"morning" | "midday" | "afternoon" | "evening" | "night", string[]>
> = {
  de: {
    morning: ["Guten Morgen", "Moin", "Einen schönen guten Morgen"],
    midday: ["Mahlzeit", "Guten Tag", "Hallo"],
    afternoon: ["Guten Tag", "Schönen Nachmittag", "Hallo"],
    evening: ["Guten Abend", "Schönen Abend", "N'Abend"],
    night: ["Noch so spät wach?", "Hallo, Nachteule", "Guten Abend"],
  },
  en: {
    morning: ["Good morning", "Morning", "Rise and shine"],
    midday: ["Good day", "Hello", "Hi there"],
    afternoon: ["Good afternoon", "Hello", "Hi there"],
    evening: ["Good evening", "Evening", "Hello"],
    night: ["Up late?", "Hello, night owl", "Good evening"],
  },
};

export const greetingPrompts: Record<Locale, string[]> = {
  de: [
    "Was möchtest du über Achim wissen?",
    "Wie kann ich dir helfen?",
    "Frag mich alles rund um Design, Projekte und Zusammenarbeit.",
    "Womit kann ich dir weiterhelfen?",
  ],
  en: [
    "What would you like to know about Achim?",
    "How can I help you?",
    "Ask me anything about design, projects and working together.",
    "What can I help you with?",
  ],
};

/** Vorschläge, bevor etwas gefragt wurde */
export const defaultChips = ["services", "process", "price", "revisions", "contact"];

/** Begriffe für Fragen, die nichts mit Achims Arbeit zu tun haben */
export const offTopicWords = [
  "code",
  "python",
  "javascript",
  "html",
  "weather",
  "recipe",
  "politics",
  "stock",
  "stocks",
  "homework",
  "translate",
  "joke",
  "wetter",
  "rezept",
  "hausaufgaben",
  "witz",
  "bitcoin",
];

/**
 * Erkennt die Sprache der Frage (deutsche Frage auf /en/ → deutsche Antwort).
 * Nur eindeutige Wörter eintragen („was“, „also“, „in“ gibt es in beiden Sprachen!).
 * Gleichstand → Sprache der Seite.
 */
export const languageHints: Record<Locale, string[]> = {
  de: [
    "ich",
    "du",
    "dir",
    "mir",
    "mich",
    "dich",
    "kann",
    "kannst",
    "wie",
    "wer",
    "welche",
    "welcher",
    "welches",
    "wann",
    "warum",
    "wo",
    "dauert",
    "kostet",
    "bitte",
    "und",
    "ist",
    "sind",
    "ein",
    "eine",
    "einen",
    "der",
    "die",
    "das",
    "den",
    "dem",
    "nicht",
    "machst",
    "bietest",
    "bist",
    "hast",
    "habt",
    "mein",
    "meine",
    "dein",
    "deine",
    "für",
    "mit",
    "auch",
    "noch",
    "gibt",
    "geht",
    "gehts",
    "danke",
    "hallo",
    "moin",
    "servus",
    "tschüss",
    "sprichst",
    "bekomme",
    "brauche",
    "möchte",
    "würde",
    "viele",
    "oft",
    "alt",
  ],
  en: [
    "i",
    "you",
    "your",
    "my",
    "me",
    "is",
    "are",
    "do",
    "does",
    "can",
    "could",
    "what",
    "who",
    "how",
    "when",
    "where",
    "why",
    "the",
    "of",
    "to",
    "for",
    "with",
    "it",
    "have",
    "get",
    "much",
    "long",
    "hello",
    "thanks",
    "thank",
    "please",
    "bye",
    "many",
    "speak",
    "offer",
    "old",
  ],
};

/**
 * Füllwörter – werden beim Ableiten von Stichwörtern aus den Beispielfragen ignoriert.
 */
export const fillerWords = [
  "ich",
  "du",
  "dir",
  "mir",
  "mich",
  "dich",
  "er",
  "sie",
  "es",
  "wir",
  "ihr",
  "man",
  "ein",
  "eine",
  "einen",
  "einem",
  "einer",
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "und",
  "oder",
  "aber",
  "auch",
  "noch",
  "schon",
  "mal",
  "so",
  "sehr",
  "gern",
  "gerne",
  "bitte",
  "ist",
  "sind",
  "bin",
  "bist",
  "hast",
  "habe",
  "hat",
  "haben",
  "kann",
  "kannst",
  "konnte",
  "wird",
  "werden",
  "wie",
  "was",
  "wer",
  "wo",
  "wann",
  "warum",
  "welche",
  "welcher",
  "welches",
  "mit",
  "für",
  "von",
  "zu",
  "zum",
  "zur",
  "bei",
  "auf",
  "an",
  "in",
  "im",
  "über",
  "nach",
  "aus",
  "um",
  "mein",
  "meine",
  "meinen",
  "dein",
  "deine",
  "deinen",
  "deiner",
  "nicht",
  "kein",
  "keine",
  "gibt",
  "machst",
  "mache",
  "macht",
  "tun",
  "sein",
  "gut",
  "erzähl",
  "erzähle",
  "sag",
  "sage",
  "mehr",
  "etwas",
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "also",
  "is",
  "are",
  "am",
  "be",
  "do",
  "does",
  "did",
  "you",
  "your",
  "i",
  "my",
  "me",
  "we",
  "it",
  "of",
  "to",
  "for",
  "with",
  "on",
  "in",
  "at",
  "about",
  "from",
  "what",
  "how",
  "who",
  "when",
  "where",
  "why",
  "which",
  "can",
  "could",
  "would",
  "will",
  "have",
  "has",
  "get",
  "any",
  "some",
  "there",
  "this",
  "that",
  "these",
  "those",
  "please",
  "much",
  "many",
  "more",
  "tell",
  // in dieser Wissensbasis zu allgemein, um ein Thema zu erkennen
  "achim",
  "achims",
  "projekt",
  "projekte",
  "project",
  "projects",
];

/**
 * Wörter, die sich auf das vorherige Thema beziehen („Wie lange dauert DAS?“).
 * Dann nutzt der Bot das zuletzt besprochene Fachgebiet/Projekt (Gesprächsgedächtnis).
 */
export const referenceWords = [
  "das",
  "dies",
  "diese",
  "dieser",
  "dieses",
  "dafür",
  "dabei",
  "damit",
  "davon",
  "dazu",
  "es",
  "sowas",
  "it",
  "that",
  "this",
  "these",
  "those",
  "they",
  "them",
];

/**
 * Anfänge kurzer Nachfragen, die die vorige FRAGE auf ein neues Thema übertragen:
 * „Wie lange dauert Branding?“ → „Und bei Musik?“ = Dauer für Musik.
 */
export const followUpStarters = [
  "und",
  "and",
  "und bei",
  "und für",
  "was ist mit",
  "wie ist es mit",
  "wie sieht es mit",
  "what about",
  "how about",
  "and for",
];

/**
 * Wörter mit gleicher Bedeutung („Synonym-Gruppen“).
 * Jedes Wort einer Gruppe wird intern durch das ERSTE Wort ersetzt – in der Frage UND in den
 * Stichwörtern. Ein neues Synonym hier eintragen = es funktioniert sofort in allen Themen.
 * Das erste Wort muss ein einzelnes Wort sein. Mehrwort-Ausdrücke („how much“) sind erlaubt.
 * Groß-/Kleinschreibung, Umlaute (ä = a) und Endungen (-en, -e, -s …) werden automatisch angeglichen.
 */
export const synonyms: string[][] = [
  // Preis
  [
    "preis",
    "preise",
    "kosten",
    "kostet",
    "budget",
    "honorar",
    "stundensatz",
    "tagessatz",
    "teuer",
    "günstig",
    "billig",
    "bezahlen",
    "price",
    "prices",
    "pricing",
    "cost",
    "costs",
    "fee",
    "fees",
    "rate",
    "rates",
    "quote",
    "expensive",
    "cheap",
    "rabatt",
    "discount",
    "discounts",
    "wie viel",
    "wieviel",
    "how much",
  ],
  // Dauer
  [
    "dauer",
    "dauert",
    "dauern",
    "zeitraum",
    "zeitrahmen",
    "wie lange",
    "duration",
    "timeline",
    "timeframe",
    "turnaround",
    "how long",
  ],
  // Korrekturschleifen
  [
    "korrektur",
    "korrekturen",
    "korrekturschleife",
    "korrekturschleifen",
    "korrekturrunde",
    "korrekturrunden",
    "feedbackrunde",
    "feedbackrunden",
    "feedbackschleife",
    "feedbackschleifen",
    "änderungswunsch",
    "änderungswünsche",
    "revision",
    "revisions",
    "iteration",
    "iterations",
    "feedback round",
    "feedback rounds",
    "rounds of feedback",
  ],
  // Kontakt
  [
    "kontakt",
    "kontaktieren",
    "erreichen",
    "melden",
    "anfragen",
    "anfrage",
    "anrufen",
    "telefon",
    "telefonnummer",
    "contact",
    "reach",
    "call",
    "phone",
    "get in touch",
    "in touch",
  ],
  // E-Mail
  ["email", "e mail", "mail", "mailadresse"],
  // Logo
  ["logo", "logos", "signet", "bildmarke", "wortmarke", "emblem", "logodesign", "logo design"],
  // Marke
  [
    "branding",
    "brand",
    "marke",
    "markenidentität",
    "markenauftritt",
    "erscheinungsbild",
    "corporate design",
    "corporate identity",
    "identity",
    "brand identity",
  ],
  // Überarbeitung von Bestehendem
  ["redesign", "refresh", "relaunch", "rebranding", "auffrischen", "modernisieren", "überarbeiten"],
  // Animation / Video
  [
    "animation",
    "animationen",
    "animieren",
    "animiert",
    "animate",
    "animated",
    "motion",
    "motion design",
    "bewegtbild",
    "video",
    "videos",
    "clip",
    "film",
  ],
  // Musik
  [
    "musik",
    "music",
    "song",
    "songs",
    "track",
    "tracks",
    "album",
    "single",
    "release",
    "veröffentlichung",
    "künstler",
    "artist",
    "band",
    "musiker",
    "musician",
    "rapper",
  ],
  // Cover
  ["cover", "albumcover", "plattencover", "artwork", "cover art"],
  // Plakat
  ["plakat", "plakate", "poster", "posters"],
  // 3D
  ["3d", "dreidimensional", "c4d", "cinema 4d", "render", "rendering", "modeling", "modelling"],
  // Ablauf
  ["ablauf", "prozess", "vorgehen", "vorgehensweise", "workflow", "process", "schritte", "steps"],
  // Vorbereitung
  ["vorbereiten", "vorbereitung", "mitbringen", "unterlagen", "prepare", "preparation", "bring"],
  // Projektdateien
  [
    "quelldateien",
    "projektdateien",
    "arbeitsdateien",
    "rohdateien",
    "offene dateien",
    "source files",
    "project files",
    "working files",
    "open files",
    "editable files",
  ],
  // Studium
  [
    "studium",
    "studiert",
    "studieren",
    "studiengang",
    "hochschule",
    "uni",
    "universität",
    "bachelor",
    "degree",
    "university",
    "college",
    "studied",
    "study",
    "studies",
    "graduated",
  ],
  // Schriften
  ["schrift", "schriften", "schriftart", "schriftarten", "font", "fonts", "typeface", "typefaces"],
  // Verfügbarkeit
  [
    "verfügbar",
    "verfügbarkeit",
    "kapazität",
    "kapazitäten",
    "available",
    "availability",
    "capacity",
  ],
  // Freizeit
  ["hobby", "hobbys", "hobbies", "freizeit", "free time", "spare time"],
  // Geburtstag
  ["geburtstag", "birthday", "geburtsdatum", "date of birth"],
  // Sprachen
  ["sprache", "sprachen", "language", "languages"],
  ["englisch", "english"],
  ["deutsch", "german"],
  // Smalltalk
  ["hallo", "hi", "hey", "hello", "moin", "servus", "guten tag", "howdy", "grüß dich"],
  ["danke", "dankeschön", "vielen dank", "thanks", "thank you", "thx", "merci"],
  [
    "tschüss",
    "tschüs",
    "ciao",
    "bye",
    "goodbye",
    "auf wiedersehen",
    "bis bald",
    "bis dann",
    "see you",
  ],
];

const email = "[{email}](mailto:{email})";

export const topics: Topic[] = [
  /* ── Smalltalk ─────────────────────────────────────────────────── */
  {
    id: "greeting",
    kind: "smallTalk",
    keywords: ["hallo"],
    examples: { de: ["Hallo!", "Hi Achim"], en: ["Hello!", "Hey there"] },
    followUps: ["services", "process", "contact"],
    de: { a: ["Hallo! Wie kann ich dir helfen?", "Hi! Was möchtest du über Achim wissen?"] },
    en: { a: ["Hello! How can I help you?", "Hi! What would you like to know about Achim?"] },
  },
  {
    id: "howAreYou",
    kind: "smallTalk",
    keywords: [
      "wie geht",
      "wie gehts",
      "alles gut bei dir",
      "alles klar bei dir",
      "how are you",
      "how s it going",
      "how is it going",
      "how are things",
      "what s up",
      "whats up",
      "how you doing",
    ],
    examples: {
      de: ["Hallo, wie geht's dir?", "Na, wie gehts?"],
      en: ["Hey, how are you?", "How's it going?"],
    },
    followUps: ["services", "process", "contact"],
    de: {
      a: [
        "Mir geht's gut, danke der Nachfrage! Wie kann ich dir helfen?",
        "Alles bestens, danke! Was möchtest du über Achim wissen?",
      ],
    },
    en: {
      a: [
        "I'm doing well, thanks for asking! How can I help you?",
        "All good, thanks! What would you like to know about Achim?",
      ],
    },
  },
  {
    id: "thanks",
    kind: "smallTalk",
    keywords: ["danke"],
    examples: { de: ["Danke dir!", "Vielen Dank"], en: ["Thanks a lot", "Thank you!"] },
    followUps: ["contact", "work", "services"],
    de: {
      a: [
        "Gern geschehen! Wenn noch etwas offen ist, frag einfach.",
        "Sehr gerne! Melde dich, wenn du noch Fragen hast.",
      ],
    },
    en: {
      a: [
        "You're welcome! If anything else comes up, just ask.",
        "My pleasure! Let me know if you have more questions.",
      ],
    },
  },
  {
    id: "bye",
    kind: "smallTalk",
    keywords: ["tschüss"],
    examples: { de: ["Tschüss!", "Bis bald"], en: ["Bye!", "See you"] },
    followUps: ["contact"],
    de: { a: `Bis bald! Wenn später noch Fragen auftauchen, erreichst du Achim unter ${email}.` },
    en: { a: `See you! If any questions come up later, you can reach Achim at ${email}.` },
  },

  {
    id: "help",
    kind: "smallTalk",
    keywords: [
      "frage",
      "helfen",
      "hilfe",
      "help",
      "question",
      "kannst du mir helfen",
      "can you help",
    ],
    examples: {
      de: ["Ich habe eine Frage", "Kannst du mir helfen?"],
      en: ["I have a question", "Can you help me?"],
    },
    followUps: [],
    de: {
      a: [
        "Klar, frag einfach! Zum Beispiel nach Leistungen, Ablauf, Preisen oder Projekten.",
        "Gerne – worum geht es dir?",
      ],
    },
    en: {
      a: [
        "Sure, just ask! For example about services, process, pricing or projects.",
        "Happy to – what's on your mind?",
      ],
    },
  },
  {
    id: "more",
    kind: "smallTalk",
    keywords: [
      "erzähl mehr",
      "erzähl mir mehr",
      "mehr dazu",
      "mehr darüber",
      "tell me more",
      "more about it",
      "go on",
    ],
    examples: { de: ["Erzähl mir mehr", "Mehr dazu?"], en: ["Tell me more", "Go on"] },
    followUps: [],
    de: { a: ["Gern! Wozu möchtest du mehr wissen?", "Klar – was genau interessiert dich?"] },
    en: {
      a: [
        "Sure! What would you like to know more about?",
        "Of course – what exactly are you curious about?",
      ],
    },
  },

  /* ── Fachgebiete (subject) ─────────────────────────────────────── */
  {
    id: "branding",
    kind: "subject",
    keywords: ["branding", "guidelines", "styleguide", "corporate"],
    examples: {
      de: ["Erzähl mir etwas über Branding", "Machst du auch Corporate Design?"],
      en: ["Tell me about brand identity", "Do you do branding?"],
    },
    followUps: ["duration", "process", "existing"],
    de: {
      label: "Branding",
      q: "Erzähl mir etwas über Brand- und Logo-Design",
      a: "Branding heißt hier: alle Entscheidungen, die ein Unternehmen wiedererkennbar machen, in ein System zu bringen – Logo, Typografie, Farbe und Bildwelt, dokumentiert übergeben. Mehr unter [Brand & Logo Design]({base}/branding).",
    },
    en: {
      label: "branding",
      q: "Tell me about brand and logo design",
      a: "Branding here means bringing every decision that makes a company recognisable into one system – logo, typography, colour and imagery, handed over documented. See [Brand & Logo Design]({base}/branding).",
    },
  },
  {
    id: "logo",
    kind: "subject",
    parent: "branding",
    keywords: ["logo"],
    examples: {
      de: ["Ich brauche ein neues Logo", "Machst du Logos?"],
      en: ["I need a logo", "Do you design logos?"],
    },
    followUps: ["duration", "existing", "price"],
    de: {
      label: "Logo-Design",
      q: "Gestaltest du auch einzelne Logos?",
      a: "Ja! Logo-Design gehört zu [Brand & Logo Design]({base}/branding) – als einzelnes Logo oder als Teil einer kompletten Markenidentität mit Typografie, Farben und Bildwelt.",
    },
    en: {
      label: "logo design",
      q: "Do you design individual logos?",
      a: "Yes! Logo design is part of [Brand & Logo Design]({base}/branding) – as a single logo or as part of a complete brand identity with typography, colours and imagery.",
    },
  },
  {
    id: "logoAnimation",
    kind: "subject",
    parent: "motion",
    keywords: [
      "logoanimation",
      "logo animation",
      "animate my logo",
      "animate logo",
      "logo animieren",
      "animiertes logo",
    ],
    examples: {
      de: ["Kannst du mein Logo animieren?", "Machst du Logoanimationen?"],
      en: ["Can you animate my logo?", "Do you do logo animations?"],
    },
    followUps: ["duration", "existing", "price"],
    de: {
      label: "Logo-Animation",
      q: "Kannst du mein Logo animieren?",
      a: "Ja – Achim bringt Logos in Bewegung, auch solche, die er nicht selbst gestaltet hat. Mehr unter [Motion Design]({base}/motion-design).",
    },
    en: {
      label: "logo animation",
      q: "Can you animate my logo?",
      a: "Yes – Achim brings logos to life, including ones he didn't design himself. See [Motion Design]({base}/motion-design).",
    },
  },
  {
    id: "motion",
    kind: "subject",
    keywords: ["animation", "launch video", "storyboard", "intro", "outro"],
    examples: {
      de: ["Erzähl mir etwas über Motion Design", "Ich brauche ein Video für meinen Launch"],
      en: ["Tell me about motion design", "Do you make videos?"],
    },
    followUps: ["duration", "process", "existing"],
    de: {
      label: "Motion Design",
      q: "Erzähl mir etwas über Motion Design",
      a: "Motion Design bedeutet hier: Animation, die aus dem Brand-System entsteht und nicht daneben steht. Erst kommt das Storyboard, dann Frames, 3D-Szenen, Animation und Sound – geliefert in allen nötigen Formaten. Mehr unter [Motion Design]({base}/motion-design).",
    },
    en: {
      label: "motion design",
      q: "Tell me about motion design",
      a: "Motion design here means animation that comes out of the brand system instead of sitting next to it. The storyboard comes first, then frames, 3D scenes, animation and sound – delivered in every format you need. See [Motion Design]({base}/motion-design).",
    },
  },
  {
    id: "music",
    kind: "subject",
    keywords: ["musik", "cover", "visuals", "visualizer", "visualiser", "canvas", "vinyl"],
    examples: {
      de: ["Was machst du für Musik?", "Gestaltest du auch Albumcover?"],
      en: ["What do you do for music?", "I need a visualizer for my new single"],
    },
    followUps: ["prepare", "duration", "work"],
    de: {
      label: "Musik-Visuals",
      q: "Was machst du für Musik?",
      a: "Für Musik gestaltet Achim Cover, Typografie und Farbe als ein Artwork, von dem sich alles andere ableiten lässt – für Streaming, Vinyl, Canvas und Feed, still und bewegt. Ein Cover lässt sich auch zum Visualizer animieren. Mehr unter [Music & Visuals]({base}/music-visuals).",
    },
    en: {
      label: "music visuals",
      q: "What do you do for music?",
      a: "For music, Achim designs cover, typography and colour as one artwork that everything else can be derived from – for streaming, vinyl, canvas and feed, still and in motion. A cover can also be animated into a visualizer. See [Music & Visuals]({base}/music-visuals).",
    },
  },
  {
    id: "three_d",
    kind: "subject",
    parent: "motion",
    keywords: ["3d"],
    examples: {
      de: ["Machst du 3D?", "Machst du auch 3D-Visualisierungen?"],
      en: ["Do you do 3D?", "Can you make 3D renders?"],
    },
    followUps: ["motion", "software", "work"],
    de: {
      label: "3D",
      q: "Machst du auch 3D?",
      a: "Ja. Achim hat 2014 seine ersten 3D-Intros in Cinema 4D gebaut, und 3D-Szenen gehören zur Produktion in seinen [Motion-Design]({base}/motion-design)-Projekten.",
    },
    en: {
      label: "3D",
      q: "Do you do 3D?",
      a: "Yes. Achim made his first 3D intros in Cinema 4D back in 2014, and 3D scenes are part of the production step in his [motion design]({base}/motion-design) projects.",
    },
  },

  {
    id: "graphic",
    kind: "subject",
    keywords: [
      "grafik",
      "grafikdesign",
      "graphic",
      "graphic design",
      "plakat",
      "flyer",
      "print",
      "printdesign",
      "drucksachen",
      "visitenkarte",
      "visitenkarten",
      "business card",
      "business cards",
      "broschüre",
      "brochure",
    ],
    examples: {
      de: ["Kannst du Plakate gestalten?", "Machst du auch Flyer?"],
      en: ["Do you design posters?", "Can you make a flyer for my event?"],
    },
    followUps: ["branding", "price", "contact"],
    de: {
      label: "Grafikdesign",
      q: "Machst du auch Grafikdesign?",
      a: `Ja – Grafikdesign gehört zu Achims Leistungen, zum Beispiel Poster und Flyer. Am stärksten wirkt das als Teil einer [Markenidentität]({base}/branding). Für Details schreib ihm kurz: ${email}.`,
    },
    en: {
      label: "graphic design",
      q: "Do you do graphic design?",
      a: `Yes – graphic design is part of Achim's services, for example posters and flyers. It works best as part of a [brand identity]({base}/branding). For details, just drop him a line: ${email}.`,
    },
  },

  /* ── Aspekte (aspect) – mit gezielten Antworten je Fachgebiet ─── */
  {
    id: "duration",
    kind: "aspect",
    keywords: ["dauer", "wochen", "deadline", "schnell", "weeks", "fast", "quick", "quickly"],
    examples: {
      de: ["Wie lange dauert ein Projekt?", "Wie schnell bist du fertig?"],
      en: ["How long does a project take?", "What's the turnaround?"],
    },
    followUps: ["price", "revisions", "process"],
    de: {
      label: "Dauer",
      q: "Wie lange dauert ein Projekt?",
      a: "Das hängt vom Projekt ab: Eine Markenidentität dauert meist sechs bis zehn Wochen, eine Logo-Animation ein bis zwei Wochen und ein längerer Motion-Film drei bis sechs Wochen. Einen Terminplan bekommst du immer vorab.",
    },
    en: {
      label: "how long?",
      q: "How long does a project take?",
      a: "It depends on the project: a brand identity usually takes six to ten weeks, a logo animation one to two weeks and a longer motion piece three to six weeks. You always get a schedule up front.",
    },
    facets: {
      branding: {
        de: "Eine Markenidentität dauert meist sechs bis zehn Wochen vom Kick-off bis zur Übergabe. Einen Terminplan bekommst du vorab – und schnelles Feedback beschleunigt alles.",
        en: "A brand identity usually takes six to ten weeks from kick-off to handover. You get a schedule up front – and quick feedback speeds everything up.",
      },
      logo: {
        de: `Wie lange ein einzelnes Logo dauert, hängt vom Umfang ab – eine komplette Markenidentität sind meist sechs bis zehn Wochen. Für eine genaue Einschätzung schreib Achim kurz: ${email}.`,
        en: `How long a single logo takes depends on the scope – a complete brand identity is usually six to ten weeks. For an exact estimate, drop Achim a line: ${email}.`,
      },
      logoAnimation: {
        de: "Eine Logo-Animation dauert in der Regel ein bis zwei Wochen.",
        en: "A logo animation usually takes one to two weeks.",
      },
      motion: {
        de: "Eine Logo-Animation dauert ein bis zwei Wochen, ein längerer Motion-Film mit 3D oder komplettem Storyboard drei bis sechs Wochen.",
        en: "A logo animation takes one to two weeks, a longer motion piece with 3D or a full storyboard three to six weeks.",
      },
      music: {
        de: `Bei Musikprojekten hängt das stark vom Umfang ab – ein einzelnes Cover ist etwas anderes als eine komplette Künstleridentität. Am besten fragst du Achim direkt: ${email}.`,
        en: `For music projects it really depends on the scope – a single cover is different from a whole artist identity. Best to ask Achim directly: ${email}.`,
      },
    },
  },
  {
    id: "price",
    kind: "aspect",
    keywords: ["preis", "kostenvoranschlag", "was nimmst du", "what do you charge"],
    examples: {
      de: ["Was kostet das?", "Wie teuer ist ein Logo?", "Was nimmst du für ein Cover?"],
      en: ["What does it cost?", "What's your rate?", "How much does a brand identity cost?"],
    },
    followUps: ["revisions", "contact", "process"],
    de: {
      label: "Preise",
      q: "Was kostet das?",
      a: `Feste Preise gibt es nicht, weil jedes Projekt anders ist. Beschreib kurz, was du brauchst, per Mail an ${email} – dann meldet sich Achim mit einem Angebot.`,
    },
    en: {
      label: "pricing",
      q: "What does it cost?",
      a: `There are no fixed prices, because every project is different. Describe what you need by email to ${email} – Achim will get back to you with a quote.`,
    },
  },
  {
    id: "revisions",
    kind: "aspect",
    keywords: [
      "korrektur",
      "wie viele überarbeitungen",
      "wie viele änderungen",
      "wie oft kann ich",
      "how many changes",
      "how often can i",
    ],
    examples: {
      de: ["Wie viele Korrekturschleifen sind dabei?", "Gibt es Feedbackrunden?"],
      en: ["How many revisions do I get?", "Are rounds of feedback included?"],
    },
    followUps: ["duration", "price", "process"],
    de: {
      label: "Korrekturschleifen",
      q: "Wie viele Korrekturschleifen sind enthalten?",
      a: "Das hängt vom Projekt ab. Im Standardfall sind zwei Korrekturschleifen enthalten.",
    },
    en: {
      label: "revisions",
      q: "How many rounds of revisions are included?",
      a: "That depends on the project. By default, two rounds of revisions are included.",
    },
  },
  {
    id: "process",
    kind: "aspect",
    keywords: [
      "ablauf",
      "wie läuft * ab",
      "wie funktioniert",
      "wie arbeitest du",
      "how does * work",
      "how do you work",
      "how it works",
      "get started",
      "start a project",
    ],
    examples: {
      de: ["Wie läuft ein Projekt ab?", "Wie arbeitest du?"],
      en: ["How does it work?", "What does your process look like?"],
    },
    followUps: ["duration", "revisions", "price"],
    de: {
      label: "Ablauf",
      q: "Wie läuft ein Projekt ab?",
      a: "Jedes Projekt beginnt mit einem Gespräch und bleibt bis zum Ende bei derselben Person. Die Schritte hängen von der Art ab:\nBrand: Discovery, Strategie & Positionierung, Identity-System, Rollout & Guidelines.\nMotion: Discovery, Konzept & Storyboard, Design & Animation, Auslieferung & Templates.\nMusik: Zuhören, Richtung, Design & Motion, Auslieferung.",
    },
    en: {
      label: "how it works",
      q: "How does a project work?",
      a: "Every project starts with a conversation and stays with the same person until it's finished. The steps depend on the type:\nBrand: discovery, strategy & positioning, identity system, rollout & guidelines.\nMotion: discovery, concept & storyboard, design & animation, delivery & templates.\nMusic: listening, direction, design & motion, delivery.",
    },
    // werden automatisch durch die Schritte der Leistungsseiten ersetzt, sobald Inhalte da sind
    facets: {
      branding: {
        de: "Branding läuft in vier Schritten: Discovery, Strategie & Positionierung, Identity-System sowie Rollout & Guidelines.",
        en: "Branding runs in four steps: discovery, strategy & positioning, identity system, and rollout & guidelines.",
      },
      motion: {
        de: "Motion Design läuft in vier Schritten: Discovery, Konzept & Storyboard, Design & Animation sowie Auslieferung & Templates.",
        en: "Motion design runs in four steps: discovery, concept & storyboard, design & animation, and delivery & templates.",
      },
      music: {
        de: "Bei Musik läuft es in vier Schritten: Zuhören, Richtung, Design & Motion sowie Auslieferung.",
        en: "For music it runs in four steps: listening, direction, design & motion, and delivery.",
      },
    },
  },
  {
    id: "prepare",
    kind: "aspect",
    keywords: [
      "vorbereiten",
      "was brauchst du",
      "brauchst du von mir",
      "benötigst",
      "brief",
      "briefing",
      "need from me",
      "what do you need",
    ],
    examples: {
      de: ["Was muss ich vorbereiten?", "Was brauchst du von mir?"],
      en: ["What do I need to prepare?", "What do you need from me?"],
    },
    followUps: ["process", "price", "contact"],
    de: {
      label: "Vorbereitung",
      q: "Was muss ich vorbereiten?",
      a: "Fürs Branding: alles, was schon da ist – alte Dateien, Namen von Wettbewerbern, Fotos und eine grobe Vorstellung, an wen du verkaufst. Für Musik: der Track oder ein Rough Mix, Lyrics oder der Titel und die Stimmung, die du dir vorstellst. Nichts muss vollständig sein.",
    },
    en: {
      label: "what to prepare",
      q: "What do I need to prepare?",
      a: "For branding: whatever exists already – old files, competitor names, photos and a rough sense of who you're selling to. For music: the track or a rough mix, lyrics or the title, and the mood you're after. Nothing has to be complete.",
    },
    facets: {
      branding: {
        de: "Alles, was schon da ist: alte Dateien, Namen von Wettbewerbern, Fotos und eine grobe Vorstellung, an wen du verkaufst. Fehlendes klärt die Discovery – nichts muss vollständig sein.",
        en: "Whatever exists already: old files, competitor names, photos and a rough sense of who you're selling to. Missing pieces are part of the discovery – nothing has to be complete.",
      },
      music: {
        de: "Der Track oder ein Rough Mix, Lyrics oder der Titel und die Stimmung, die du dir vorstellst – mehr braucht es zum Start nicht.",
        en: "The track or a rough mix, lyrics or the title, and the mood you're after – that's all it takes to get started.",
      },
    },
  },
  {
    id: "source",
    kind: "aspect",
    keywords: ["quelldateien", "dateien", "files", "editable", "psd", "aep"],
    examples: {
      de: ["Bekomme ich die Projektdateien?", "Bekomme ich die offenen Dateien?"],
      en: ["Do I get the source files?", "Do I get the project files?"],
    },
    followUps: ["revisions", "price", "contact"],
    de: {
      label: "Projektdateien",
      q: "Bekomme ich die Projektdateien?",
      a: "Nein, offene Projektdateien (z. B. aus Illustrator, Photoshop oder After Effects) gibt Achim nicht heraus. Du bekommst die fertigen Dateien in allen Formaten, die du für dein Projekt brauchst.",
    },
    en: {
      label: "project files",
      q: "Do I get the project files?",
      a: "No, Achim doesn't hand over open project files (e.g. from Illustrator, Photoshop or After Effects). You get the finished files in all the formats you need for your project.",
    },
  },
  {
    id: "existing",
    kind: "aspect",
    keywords: [
      "redesign",
      "bestehend",
      "vorhanden",
      "schon ein logo",
      "existing",
      "already have",
      "did not design",
      "didn t design",
    ],
    examples: {
      de: [
        "Kannst du mein bestehendes Logo überarbeiten?",
        "Ich habe schon ein Logo – geht trotzdem was?",
      ],
      en: ["Can you redesign my existing logo?", "I already have a logo, can you work with it?"],
    },
    followUps: ["branding", "price", "contact"],
    de: {
      label: "bestehendes Logo",
      q: "Kannst du mit meinem bestehenden Logo arbeiten?",
      a: "Ja. Ein Refresh, der dein Logo behält und alles drumherum neu aufbaut, ist ein häufiger Auftrag – oft der sinnvollere, wenn es Wiedererkennung zu bewahren gibt. Achim animiert auch Identitäten, die er nicht selbst gestaltet hat.",
    },
    en: {
      label: "existing logo",
      q: "Can you work with my existing logo?",
      a: "Yes. A refresh that keeps your logo and rebuilds everything around it is a common brief – often the more sensible one when there's recognition worth keeping. Achim also animates identities he didn't design himself.",
    },
  },
  {
    id: "availability",
    kind: "aspect",
    keywords: [
      "verfügbar",
      "hast du zeit",
      "hast du gerade zeit",
      "wann kannst du",
      "when can you",
      "taking on",
      "booked",
      "ausgebucht",
    ],
    examples: {
      de: ["Bist du gerade verfügbar?", "Hast du Zeit für ein Projekt?"],
      en: ["Are you available next month?", "Are you taking on new projects?"],
    },
    followUps: ["contact", "duration", "price"],
    de: {
      label: "Verfügbarkeit",
      q: "Bist du für neue Projekte verfügbar?",
      a: `Das ändert sich laufend – am schnellsten erfährst du es per Mail an Achim: ${email}.`,
    },
    en: {
      label: "availability",
      q: "Are you available for new projects?",
      a: `That changes all the time – the quickest way to find out is to email Achim: ${email}.`,
    },
  },
  {
    id: "languages",
    kind: "aspect",
    keywords: [
      "sprache",
      "englisch",
      "deutsch",
      "sprichst",
      "speak",
      "international",
      "ausland",
      "abroad",
    ],
    examples: {
      de: ["Sprichst du Englisch?", "In welchen Sprachen arbeitest du?"],
      en: ["Do you speak German?", "Can we run the project in English?"],
    },
    followUps: ["process", "contact", "services"],
    de: {
      label: "Sprachen",
      q: "In welchen Sprachen arbeitest du?",
      a: "Achim arbeitet auf Deutsch und Englisch – Gespräche, Abstimmungen und komplette Projekte laufen in beiden Sprachen.",
    },
    en: {
      label: "languages",
      q: "Which languages do you work in?",
      a: "Achim works in German and English – conversations, feedback and entire projects can run in either language.",
    },
  },
  {
    id: "journey",
    kind: "general",
    keywords: [
      "werdegang",
      "lebenslauf",
      "erfahrung",
      "seit wann",
      "wie lange * schon",
      "angefangen",
      "wann hast du angefangen",
      "wie hast du angefangen",
      "photoshop elements",
      "minecraft",
      "career",
      "background",
      "experience",
      "how long have you been",
      "been designing",
      "been doing this",
      "since when",
      "when did you start",
      "how did you start",
    ],
    examples: {
      de: ["Seit wann designst du?", "Wann hast du angefangen?"],
      en: ["How long have you been designing?", "How did you start?"],
    },
    followUps: ["studied", "three_d", "contact"],
    de: {
      label: "Werdegang",
      q: "Wie war Achims Werdegang?",
      a: "2013: mit 12 Jahren mit Photoshop Elements 11 angefangen und Banner für Minecraft-Server gebaut.\n2014: erste 3D-Intros in Cinema 4D.\n2019: Poster und Tickets für die Schule – das Erste, was andere in der Hand hielten.\n2023: Studium Zeitbasierte Medien in Mainz begonnen und im selben Sommer selbstständig gemacht.\n2026: Bachelor abgeschlossen, und was nebenher lief, wurde der Beruf.",
    },
    en: {
      label: "Achim's journey",
      q: "What's Achim's journey?",
      a: "2013: started at 12 with Photoshop Elements 11 and made banners for Minecraft servers.\n2014: first 3D intros in Cinema 4D.\n2019: posters and tickets for school – the first things other people held in their hands.\n2023: started studying Time-Based Media in Mainz and went freelance the same summer.\n2026: bachelor's degree finished, and what ran alongside became the job.",
    },
  },
  {
    id: "studied",
    kind: "general",
    keywords: [
      "studium",
      "mainz",
      "zeitbasierte medien",
      "time based media",
      "abschluss",
      "education",
      "ausbildung",
      "wie lange * studium",
      "how long * studium",
    ],
    examples: {
      de: ["Was hast du studiert?", "Wo hast du deinen Bachelor gemacht?"],
      en: ["Where did you study?", "What did Achim study?"],
    },
    followUps: ["journey", "languages", "contact"],
    de: {
      label: "Studium",
      q: "Was hat Achim studiert?",
      a: "Achim hat in Mainz Zeitbasierte Medien studiert und den Bachelor 2026 abgeschlossen. Angefangen hat er 2023 – im selben Sommer hat er sich auch selbstständig gemacht.",
    },
    en: {
      label: "studies",
      q: "What did Achim study?",
      a: "Achim studied Time-Based Media (Zeitbasierte Medien) in Mainz and finished his bachelor's degree in 2026. He started in 2023 and went freelance the same summer.",
    },
  },
  {
    id: "work",
    kind: "aspect",
    keywords: [
      "portfolio",
      "referenzen",
      "beispiele",
      "examples",
      "arbeiten sehen",
      "deine arbeiten",
      "welche projekte",
      "deine projekte",
      "projekte sehen",
      "projekte gemacht",
      "zeig mir",
      "references",
      "your work",
      "selected work",
      "case studies",
      "your projects",
      "which projects",
      "projects have you",
      "show me",
      "kunden",
      "kundenprojekte",
      "für wen",
      "clients",
      "client work",
      "worked with",
      "worked for",
    ],
    examples: {
      de: [
        "Kann ich Referenzen sehen?",
        "Für welche Kunden hast du gearbeitet?",
        "Welche Projekte hast du gemacht?",
      ],
      en: [
        "Do you have a portfolio?",
        "Which clients have you worked with?",
        "Show me your projects",
      ],
    },
    followUps: ["branding", "motion", "contact"],
    de: {
      label: "Arbeiten",
      q: "Kann ich Arbeiten sehen?",
      a: "Ausgewählte Projekte findest du auf der Seite [Projekte]({base}/work).",
    },
    en: {
      label: "work",
      q: "Can I see some work?",
      a: "You can browse selected projects on the [Work page]({base}/work).",
    },
  },
  {
    id: "contact",
    kind: "aspect",
    keywords: [
      "kontakt",
      "email",
      "zusammenarbeiten",
      "beauftragen",
      "buchen",
      "projekt starten",
      "mit dir arbeiten",
      "hire",
      "book",
      "work together",
      "collaborate",
      "work with you",
    ],
    examples: {
      de: ["Wie erreiche ich dich?", "Wie ist deine E-Mail-Adresse?"],
      en: ["How can I get in touch?", "Can I call you?"],
    },
    followUps: ["price", "process", "work"],
    de: {
      label: "Kontakt",
      q: "Wie kann ich Kontakt aufnehmen?",
      a: `Schreib Achim an ${email} oder nutze die [Kontaktseite]({base}/contact). Wenn du zusammenarbeiten möchtest, freut er sich von dir zu hören.`,
    },
    en: {
      label: "get in touch",
      q: "How can I get in touch?",
      a: `Email Achim at ${email} or use the [contact page]({base}/contact). If you'd like to work together, he'd love to hear from you.`,
    },
  },

  /* ── Allgemeines (general) ─────────────────────────────────────── */
  {
    id: "services",
    kind: "general",
    keywords: [
      "leistungen",
      "leistung",
      "angebot",
      "anbieten",
      "was machst du",
      "was bietest",
      "was kannst du",
      "services",
      "service",
      "offer",
      "what do you do",
      "what can you",
    ],
    examples: {
      de: ["Was bietest du an?", "Was machst du so?"],
      en: ["What services do you offer?", "What do you do?"],
    },
    followUps: ["branding", "motion", "music"],
    de: {
      label: "Leistungen",
      q: "Was bietest du an?",
      a: "Achim ist freiberuflicher Designer für Markenidentität und Logos, Motion Design und Visuals für Musik, dazu Grafik und 3D. Du sprichst dabei immer mit der Person, die die Arbeit auch macht – vom ersten Gespräch bis zum fertigen Ergebnis. Mehr dazu: [Brand & Logo Design]({base}/branding), [Motion Design]({base}/motion-design) und [Music & Visuals]({base}/music-visuals).",
    },
    en: {
      label: "services",
      q: "What services do you offer?",
      a: "Achim is a freelance designer for brand identity and logos, motion design and visuals for music, plus graphic and 3D work. You always talk to the person who actually does the work – from the first conversation to the finished result. See [Brand & Logo Design]({base}/branding), [Motion Design]({base}/motion-design) and [Music & Visuals]({base}/music-visuals).",
    },
  },
  {
    id: "about",
    kind: "general",
    keywords: [
      "wer ist achim",
      "wer bist du",
      "über achim",
      "über dich",
      "erzähl von dir",
      "who is achim",
      "who are you",
      "about achim",
      "about you",
      "freelancer",
      "freiberuflich",
      "selbstständig",
    ],
    examples: {
      de: ["Wer bist du?", "Erzähl mal was über Achim"],
      en: ["Who is Achim?", "Tell me about you"],
    },
    followUps: ["journey", "studied", "languages"],
    de: {
      label: "über Achim",
      q: "Wer ist Achim?",
      a: "Achim ist freiberuflicher Designer. Angefangen hat er 2013 mit zwölf Jahren – aus reinem Hobby, mit Photoshop Elements 11. Später hat er in Mainz Zeitbasierte Medien studiert und 2026 seinen Bachelor abgeschlossen. Die Neugier ist geblieben: Wenn ein Projekt etwas braucht, das es noch nicht gibt, baut er es – ob Schrift oder kleines Tool. Mehr unter [Über mich]({base}/about).",
    },
    en: {
      label: "about Achim",
      q: "Who is Achim?",
      a: "Achim is a freelance designer. He started in 2013 at the age of twelve – purely as a hobby, with Photoshop Elements 11. Later he studied Time-Based Media in Mainz and finished his bachelor's degree in 2026. The curiosity stayed: if a project needs something that doesn't exist yet, he makes it – whether that's a typeface or a small tool. More on the [About page]({base}/about).",
    },
  },
  {
    id: "bot",
    kind: "general",
    keywords: [
      "ki",
      "ai",
      "bot",
      "chatbot",
      "künstliche intelligenz",
      "artificial intelligence",
      "chatgpt",
      "roboter",
      "robot",
      "bist du ein mensch",
      "echter mensch",
      "are you human",
      "real person",
    ],
    examples: {
      de: ["Bist du eine KI?", "Bist du ein Bot?"],
      en: ["Are you an AI?", "Am I talking to a real person?"],
    },
    followUps: ["about", "contact", "services"],
    de: {
      label: "über mich",
      q: "Bist du eine KI?",
      a: `Ich bin Achims digitaler Assistent – keine KI, sondern ein kleines Programm, das deine Fragen anhand der Inhalte dieser Website beantwortet. Wenn du lieber direkt mit Achim sprechen möchtest: ${email}.`,
    },
    en: {
      label: "about me",
      q: "Are you an AI?",
      a: `I'm Achim's digital assistant – not an AI, but a small program that answers your questions based on the content of this website. If you'd rather talk to Achim directly: ${email}.`,
    },
  },
  {
    id: "social",
    kind: "general",
    keywords: [
      "instagram",
      "social media",
      "socials",
      "linkedin",
      "behance",
      "tiktok",
      "youtube",
      "profil",
    ],
    examples: {
      de: ["Wie ist dein Instagram?", "Bist du auf Social Media?"],
      en: ["What's your Instagram?", "Are you on LinkedIn?"],
    },
    followUps: ["contact", "work", "about"],
    // wird automatisch durch die verlinkten Profile ersetzt, sobald es welche gibt (content.ts)
    de: {
      label: "Social Media",
      q: "Wo finde ich Achim auf Social Media?",
      a: `Social-Media-Profile sind hier noch nicht verlinkt – am besten erreichst du Achim per Mail: ${email}.`,
    },
    en: {
      label: "social media",
      q: "Where can I find Achim on social media?",
      a: `Social media profiles aren't linked here yet – the best way to reach Achim is by email: ${email}.`,
    },
  },
  {
    id: "age",
    kind: "general",
    keywords: ["wie alt", "alter", "how old", "age", "jahrgang"],
    examples: {
      de: ["Wie alt bist du?", "Wie alt ist Achim?"],
      en: ["How old are you?", "How old is Achim?"],
    },
    followUps: ["journey", "about", "studied"],
    de: {
      label: "Alter",
      q: "Wie alt ist Achim?",
      a: ["Achim ist {age} Jahre alt.", "Achim ist {age} – Jahrgang 2000."],
    },
    en: {
      label: "age",
      q: "How old is Achim?",
      a: ["Achim is {age} years old.", "Achim is {age} – born in 2000."],
    },
  },
  {
    id: "birthday",
    kind: "general",
    keywords: ["geburtstag", "geboren", "born", "when were you born"],
    examples: {
      de: ["Wann hast du Geburtstag?", "Wann bist du geboren?"],
      en: ["When is your birthday?", "When were you born?"],
    },
    followUps: ["age", "about", "journey"],
    de: {
      label: "Geburtstag",
      q: "Wann hat Achim Geburtstag?",
      a: "Achim hat am 4. Oktober Geburtstag{birthdayNote}.",
    },
    en: {
      label: "birthday",
      q: "When is Achim's birthday?",
      a: "Achim's birthday is on 4 October{birthdayNote}.",
    },
  },
  {
    id: "software",
    kind: "general",
    keywords: [
      "software",
      "programm",
      "programme",
      "program",
      "programs",
      "tools",
      "apps",
      "adobe",
      "creative cloud",
      "illustrator",
      "photoshop",
      "indesign",
      "after effects",
      "premiere",
      "blender",
      "fl studio",
    ],
    examples: {
      de: [
        "Mit welchen Programmen arbeitest du?",
        "Kannst du After Effects?",
        "Welche Tools nutzt du?",
      ],
      en: ["Which software do you use?", "Do you work in Blender?"],
    },
    followUps: ["three_d", "motion", "music"],
    de: {
      label: "Programme",
      q: "Mit welchen Programmen arbeitest du?",
      a: "Achim arbeitet mit Illustrator, Photoshop, InDesign, After Effects, Premiere Pro, Blender und FL Studio.",
    },
    en: {
      label: "software",
      q: "Which software do you use?",
      a: "Achim works with Illustrator, Photoshop, InDesign, After Effects, Premiere Pro, Blender and FL Studio.",
    },
  },
  {
    id: "fonts",
    kind: "general",
    keywords: ["schrift", "type design", "eigene schrift"],
    examples: { de: ["Entwirfst du eigene Schriften?"], en: ["Do you design your own typefaces?"] },
    followUps: ["tools", "about", "work"],
    de: {
      label: "eigene Schriften",
      q: "Entwirft Achim eigene Schriften?",
      a: "Ja. Wenn keine vorhandene Schrift zu einem Projekt passt, zeichnet Achim eine von Grund auf.",
    },
    en: {
      label: "own typefaces",
      q: "Does Achim design his own typefaces?",
      a: "Yes. When no existing typeface fits a project, Achim draws one from scratch.",
    },
  },
  {
    id: "tools",
    kind: "general",
    keywords: [
      "eigene tools",
      "eigene werkzeuge",
      "own tools",
      "skript",
      "skripte",
      "script",
      "scripts",
      "automatisierung",
      "automation",
      "automate",
      "programmieren",
      "programming",
      "coden",
      "coding",
    ],
    examples: {
      de: ["Baust du eigene Tools?", "Schreibst du Skripte?"],
      en: ["Do you build your own tools?", "Do you write scripts?"],
    },
    followUps: ["fonts", "hobbies", "contact"],
    de: {
      label: "eigene Tools",
      q: "Baut Achim eigene Tools?",
      a: "Ja. Er schreibt kleine Skripte, die wiederkehrende Schritte übernehmen – damit mehr Zeit fürs eigentliche Design bleibt.",
    },
    en: {
      label: "own tools",
      q: "Does Achim build his own tools?",
      a: "Yes. He writes small scripts that take over repetitive steps – which leaves more time for the actual design.",
    },
  },
  {
    id: "hobbies",
    kind: "general",
    keywords: [
      "hobby",
      "in deiner freizeit",
      "neben der arbeit",
      "outside of work",
      "radfahren",
      "fahrrad",
      "cycling",
      "bike",
      "tee",
      "tea",
      "playstation",
      "ps1",
      "ps2",
      "games",
      "gaming",
      "videospiele",
      "zocken",
    ],
    examples: {
      de: ["Was machst du in deiner Freizeit?", "Hast du Hobbys?"],
      en: ["What do you do outside of work?", "Any hobbies?"],
    },
    followUps: ["about", "work", "contact"],
    de: {
      label: "Hobbys",
      q: "Was macht Achim neben der Arbeit?",
      a: "Radfahren, PS1- und PS2-Klassiker und – wie er selbst sagt – zu viel Tee.",
    },
    en: {
      label: "hobbies",
      q: "What does Achim do outside of work?",
      a: "Cycling, PS1 and PS2 classics and – in his own words – too much tea.",
    },
  },
];
