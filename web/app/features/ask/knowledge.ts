/**
 * Wissensbasis des „Frag Achim“-Widgets.
 *
 * Aufbau eines Themas:
 * - id         eindeutiger Schlüssel
 * - keywords   Suchbegriffe (DE + EN gemischt). Mehrwort-Begriffe („wie lange“) zählen stärker.
 *              Synonyme müssen NICHT hier stehen – die kommen aus `synonyms` (siehe unten).
 * - followUps  IDs der Themen, die danach als Vorschläge erscheinen
 * - smallTalk  Begrüßung, Danke … – verliert immer gegen ein echtes Thema
 * - de / en    label (Vorschlags-Chip), q (Frage beim Klick), a (Antwort)
 *
 * Platzhalter in Antworten: {base} → /de bzw. /en, {email} → Kontaktadresse.
 * Links: [Text](url) – interne Links mit {base}, extern mit https://, Mail mit mailto:.
 *
 * Nach jeder Änderung: `npm test` – prüft die Testfragen in knowledge.test.ts.
 * Anleitung: docs/09-ask-widget.md
 */
import type { Locale } from "~/i18n/config";

export type TopicText = { label?: string; q?: string; a: string };

export type Topic = {
  id: string;
  keywords: string[];
  followUps: string[];
  smallTalk?: boolean;
} & Record<Locale, TopicText>;

export const askTexts: Record<
  Locale,
  { greeting: string; offTopic: string; fallback: string; also: string }
> = {
  de: {
    greeting:
      "Hi, ich bin Achims Assistent. Frag mich zu Branding, Motion Design, Musik-Visuals, zum Ablauf eines Projekts oder wie du Kontakt aufnimmst.",
    offTopic:
      "Ich kann nur Fragen zu Achim Benzels Designarbeit und zur Kontaktaufnahme beantworten. Soll ich erzählen, was er anbietet?",
    fallback:
      "Dazu habe ich keine genaue Antwort. Am schnellsten klärst du das per Mail an Achim: [{email}](mailto:{email}).",
    also: "\n\nAußerdem: ",
  },
  en: {
    greeting:
      "Hi, I'm Achim's assistant. Ask about branding, motion design, music visuals, how a project runs, or how to get in touch.",
    offTopic:
      "I can only help with questions about Achim Benzel's design work and how to get in touch. Want to know what he offers?",
    fallback:
      "I don't have a precise answer to that. The quickest way to get one is to email Achim: [{email}](mailto:{email}).",
    also: "\n\nAlso: ",
  },
};

/** Vorschläge, bevor etwas gefragt wurde */
export const defaultChips = ["services", "process", "price", "revisions", "contact"];

/** Themen, die einen Aspekt erfragen (Dauer, Preis …) – schlagen reine Fachthemen */
export const intentTopics = new Set([
  "duration",
  "price",
  "revisions",
  "prepare",
  "existing",
  "source",
  "process",
  "availability",
  "journey",
  "studied",
  "languages",
]);

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
  ],
};

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
  // 3D
  [
    "3d",
    "dreidimensional",
    "c4d",
    "cinema 4d",
    "blender",
    "render",
    "rendering",
    "modeling",
    "modelling",
  ],
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

export const topics: Topic[] = [
  /* ── Smalltalk ─────────────────────────────────────────────────── */
  {
    id: "greeting",
    smallTalk: true,
    keywords: ["hallo"],
    followUps: ["services", "process", "contact"],
    de: {
      a: "Hey! Wie kann ich dir helfen? Frag mich gern nach Achims Leistungen, dem Ablauf eines Projekts oder wie du ihn erreichst.",
    },
    en: {
      a: "Hey! How can I help you? Feel free to ask about Achim's services, how a project works or how to reach him.",
    },
  },
  {
    id: "howAreYou",
    smallTalk: true,
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
    followUps: ["services", "process", "contact"],
    de: { a: "Hey, mir geht's gut, danke! Wie kann ich dir helfen?" },
    en: { a: "Hey, I'm doing well, thanks! How can I help you?" },
  },
  {
    id: "thanks",
    smallTalk: true,
    keywords: ["danke"],
    followUps: ["contact", "work", "services"],
    de: { a: "Gern geschehen! Wenn du noch etwas wissen möchtest, frag einfach." },
    en: { a: "You're welcome! If there's anything else, just ask." },
  },
  {
    id: "bye",
    smallTalk: true,
    keywords: ["tschüss"],
    followUps: ["contact"],
    de: {
      a: "Bis bald! Wenn später noch Fragen auftauchen, erreichst du Achim unter [{email}](mailto:{email}).",
    },
    en: {
      a: "See you! If any questions come up later, you can reach Achim at [{email}](mailto:{email}).",
    },
  },

  /* ── Leistungen ────────────────────────────────────────────────── */
  {
    id: "services",
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
    followUps: ["branding", "motion", "music"],
    de: {
      label: "Leistungen",
      q: "Was bietest du an?",
      a: "Achim Benzel ist freiberuflicher Designer für Markenidentität und Logos, Motion Design und Visuals für Musik, dazu Grafik und 3D. Du sprichst immer mit der Person, die die Arbeit auch macht, vom ersten Gespräch bis zum fertigen Ergebnis. Mehr dazu: [Brand & Logo Design]({base}/branding), [Motion Design]({base}/motion-design) und [Music & Visuals]({base}/music-visuals).",
    },
    en: {
      label: "services",
      q: "What services do you offer?",
      a: "Achim Benzel is a freelance designer for brand identity and logos, motion design, and visuals for music, with graphic and 3D work on top. You always talk to the person who actually does the work, from the first conversation to the finished result. See [Brand & Logo Design]({base}/branding), [Motion Design]({base}/motion-design) and [Music & Visuals]({base}/music-visuals).",
    },
  },
  {
    id: "branding",
    keywords: ["branding", "logo", "guidelines", "styleguide", "corporate"],
    followUps: ["duration", "revisions", "existing"],
    de: {
      label: "Branding",
      q: "Erzähl mir etwas über Brand- und Logo-Design",
      a: "Branding heißt hier: alle Entscheidungen, die ein Unternehmen wiedererkennbar machen, in ein System zu bringen. Logo, Typografie, Farbe und Bildwelt, dokumentiert übergeben. Es läuft in vier Schritten: Discovery, Strategie & Positionierung, Identity-System, Rollout & Guidelines. Mehr unter [Brand & Logo Design]({base}/branding).",
    },
    en: {
      label: "branding",
      q: "Tell me about brand and logo design",
      a: "Branding here means bringing every decision that makes a company recognisable into one system: logo, typography, colour and imagery, handed over documented. It runs in four steps: discovery, strategy & positioning, identity system, rollout & guidelines. See [Brand & Logo Design]({base}/branding).",
    },
  },
  {
    id: "motion",
    keywords: [
      "animation",
      "logoanimation",
      "logo animation",
      "animate my logo",
      "logo animieren",
      "animiertes logo",
      "launch video",
      "storyboard",
      "intro",
      "outro",
    ],
    followUps: ["duration", "revisions", "existing"],
    de: {
      label: "Motion Design",
      q: "Erzähl mir etwas über Motion Design",
      a: "Motion Design bedeutet hier: Animation, die aus dem Brand-System entsteht und nicht daneben steht. Erst kommt das Storyboard, dann entstehen Frames, 3D-Szenen, Animation und Sound, geliefert in allen nötigen Formaten: hochkant, quadratisch, breit, mit oder ohne Ton. Mehr unter [Motion Design]({base}/motion-design).",
    },
    en: {
      label: "motion design",
      q: "Tell me about motion design",
      a: "Motion design here means animation that comes out of the brand system instead of sitting next to it. The storyboard comes before the first keyframe, then frames, 3D scenes, animation and sound are produced, and everything is delivered in the formats you need: vertical, square, wide, with or without sound. See [Motion Design]({base}/motion-design).",
    },
  },
  {
    id: "music",
    keywords: ["musik", "cover", "visuals", "visualizer", "visualiser", "canvas", "vinyl"],
    followUps: ["prepare", "contact", "work"],
    de: {
      label: "Musik-Visuals",
      q: "Was machst du für Musik?",
      a: "Für Musik gestaltet Achim Cover, Typografie und Farbe als ein Artwork, von dem sich alles andere ableiten lässt, für Streaming, Vinyl, Canvas und Feed, still und bewegt. Ein Cover lässt sich zum Visualizer für YouTube, Reels oder eine Bühnenleinwand animieren. Das geht für eine einzelne Veröffentlichung oder eine ganze Künstleridentität. Mehr unter [Music & Visuals]({base}/music-visuals).",
    },
    en: {
      label: "music visuals",
      q: "What do you do for music?",
      a: "For music, Achim designs cover, typography and colour as one artwork that everything else can be derived from, for streaming, vinyl, canvas and feed, still and in motion. A cover can be animated into a visualizer for YouTube, Reels or a stage screen. It works for a single release or a whole artist identity. See [Music & Visuals]({base}/music-visuals).",
    },
  },
  {
    id: "three_d",
    keywords: ["3d"],
    followUps: ["motion", "work", "contact"],
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

  /* ── Zusammenarbeit ────────────────────────────────────────────── */
  {
    id: "process",
    keywords: [
      "ablauf",
      "wie läuft ein",
      "wie funktioniert",
      "wie arbeitest du",
      "how does it work",
      "how do you work",
      "how it works",
      "how does a project",
      "get started",
      "start a project",
    ],
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
  },
  {
    id: "duration",
    keywords: ["dauer", "wochen", "deadline", "schnell", "weeks", "fast", "quick", "quickly"],
    followUps: ["price", "revisions", "contact"],
    de: {
      label: "Dauer",
      q: "Wie lange dauert ein Projekt?",
      a: "Eine Markenidentität dauert meist sechs bis zehn Wochen vom Kick-off bis zur Übergabe. Einen Terminplan bekommst du vorher, und schnelles Feedback beschleunigt alles. Eine Logo-Animation dauert ein bis zwei Wochen, ein längerer Motion-Film mit 3D oder komplettem Storyboard drei bis sechs Wochen. Für Musikprojekte frag Achim direkt: [{email}](mailto:{email}).",
    },
    en: {
      label: "how long?",
      q: "How long does a project take?",
      a: "A brand identity usually takes six to ten weeks from kick-off to handover; you get a dated schedule before starting, and quick feedback rounds speed things up. A logo animation takes one to two weeks, a longer motion piece with 3D or a full storyboard three to six weeks. For music projects, ask Achim directly: [{email}](mailto:{email}).",
    },
  },
  {
    id: "revisions",
    keywords: [
      "korrektur",
      "wie viele überarbeitungen",
      "wie viele änderungen",
      "wie oft kann ich",
      "how many changes",
      "how often can i",
    ],
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
    id: "existing",
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
    followUps: ["branding", "price", "contact"],
    de: {
      label: "bestehendes Logo",
      q: "Kannst du mit meinem bestehenden Logo arbeiten?",
      a: "Ja. Ein Refresh, der dein Logo behält und alles drumherum neu aufbaut, ist ein häufiger Auftrag und oft der sinnvollere, wenn es Wiedererkennung zu bewahren gibt. Achim kann auch eine Identität animieren, die er nicht gestaltet hat. Er arbeitet nach deinen Guidelines und definiert fehlende Motion-Regeln im Projekt.",
    },
    en: {
      label: "existing logo",
      q: "Can you work with my existing logo?",
      a: "Yes. A refresh that keeps your logo and rebuilds everything around it is a common brief, and often the more sensible one when there's recognition worth keeping. Achim can also animate an identity he didn't design, working from your guidelines and defining any missing motion rules as part of the project.",
    },
  },
  {
    id: "source",
    keywords: ["quelldateien", "dateien", "files", "editable", "psd", "aep"],
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
    id: "prepare",
    keywords: [
      "vorbereiten",
      "brauchst du von mir",
      "benötigst",
      "brief",
      "briefing",
      "need from me",
    ],
    followUps: ["process", "price", "contact"],
    de: {
      label: "Vorbereitung",
      q: "Was muss ich vorbereiten?",
      a: "Fürs Branding: alles, was schon da ist, etwa alte Dateien, Namen von Wettbewerbern, Fotos und eine grobe Vorstellung, an wen du verkaufst. Fehlendes klärt die Discovery, nichts muss vollständig sein. Für Musik: der Track oder ein Rough Mix, Lyrics oder der Titel und die Stimmung, die du dir vorstellst.",
    },
    en: {
      label: "what to prepare",
      q: "What do I need to prepare?",
      a: "For branding: whatever exists already, like old files, competitor names, photos and a rough sense of who you're selling to. Missing pieces are part of the discovery, so nothing has to be complete. For music: the track or a rough mix, lyrics or the title, and the mood you're after.",
    },
  },
  {
    id: "price",
    keywords: ["preis", "kostenvoranschlag", "was nimmst du", "what do you charge"],
    followUps: ["revisions", "contact", "process"],
    de: {
      label: "Preise",
      q: "Was kostet das?",
      a: "Auf der Seite stehen keine Preise, weil sie vom Projekt abhängen. Beschreib kurz, was du brauchst, per Mail an [{email}](mailto:{email}), dann meldet sich Achim bei dir.",
    },
    en: {
      label: "pricing",
      q: "What does it cost?",
      a: "There are no prices on the site, because they depend on the project. Describe what you need by email and Achim will get back to you: [{email}](mailto:{email}).",
    },
  },
  {
    id: "languages",
    keywords: ["sprache", "englisch", "deutsch", "sprichst", "speak", "international"],
    followUps: ["process", "contact", "services"],
    de: {
      label: "Sprachen",
      q: "In welchen Sprachen arbeitest du?",
      a: "Achim arbeitet auf Deutsch und Englisch. Gespräche, Abstimmungen und komplette Projekte laufen in beiden Sprachen.",
    },
    en: {
      label: "languages",
      q: "Which languages do you work in?",
      a: "Achim works in German and English. Conversations, feedback and entire projects can run in either language.",
    },
  },
  {
    id: "availability",
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
    followUps: ["contact", "duration", "price"],
    de: {
      label: "Verfügbarkeit",
      q: "Bist du für neue Projekte verfügbar?",
      a: "Zur aktuellen Verfügbarkeit steht auf der Seite nichts. Am schnellsten erfährst du es per Mail an Achim: [{email}](mailto:{email}).",
    },
    en: {
      label: "availability",
      q: "Are you available for new projects?",
      a: "The site doesn't say anything about current availability. The quickest way to find out is to email Achim: [{email}](mailto:{email}).",
    },
  },

  /* ── Über Achim ────────────────────────────────────────────────── */
  {
    id: "about",
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
    followUps: ["journey", "studied", "languages"],
    de: {
      label: "über Achim",
      q: "Wer ist Achim?",
      a: "Achim ist freiberuflicher Designer. Angefangen hat er 2013 mit zwölf Jahren – aus reinem Hobby, mit Photoshop Elements 11. Später hat er in Mainz Zeitbasierte Medien studiert und 2026 seinen Bachelor abgeschlossen. Die Neugier ist geblieben: Wenn ein Projekt etwas braucht, das es noch nicht gibt, baut er es, ob Schrift oder kleines Tool. Mehr unter [Über mich]({base}/about).",
    },
    en: {
      label: "about Achim",
      q: "Who is Achim?",
      a: "Achim is a freelance designer. He started in 2013 at the age of twelve – purely as a hobby, with Photoshop Elements 11. Later he studied Time-Based Media in Mainz and finished his bachelor's degree in 2026. The curiosity stayed: if a project needs something that doesn't exist yet, he makes it, whether that's a typeface or a small tool. More on the [About page]({base}/about).",
    },
  },
  {
    id: "journey",
    keywords: [
      "werdegang",
      "lebenslauf",
      "erfahrung",
      "seit wann",
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
    followUps: ["studied", "three_d", "contact"],
    de: {
      label: "Werdegang",
      q: "Wie war Achims Werdegang?",
      a: "2013: mit 12 Jahren mit Photoshop Elements 11 angefangen und Banner für Minecraft-Server gebaut.\n2014: erste 3D-Intros in Cinema 4D.\n2019: Poster und Tickets für die Schule, das Erste, was andere in der Hand hielten.\n2023: Studium Zeitbasierte Medien in Mainz begonnen und im selben Sommer selbstständig gemacht.\n2026: Bachelor abgeschlossen, und was nebenher lief, wurde der Beruf.",
    },
    en: {
      label: "Achim's journey",
      q: "What's Achim's journey?",
      a: "2013: started at 12 with Photoshop Elements 11 and made banners for Minecraft servers.\n2014: first 3D intros in Cinema 4D.\n2019: posters and tickets for school, the first things other people held in their hands.\n2023: started studying Time-Based Media in Mainz and went freelance the same summer.\n2026: bachelor's degree finished, and what ran alongside became the job.",
    },
  },
  {
    id: "studied",
    keywords: [
      "studium",
      "mainz",
      "zeitbasierte medien",
      "time based media",
      "abschluss",
      "education",
      "ausbildung",
    ],
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
    id: "fonts",
    keywords: ["schrift", "type design", "eigene schrift"],
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
    keywords: [
      "tool",
      "tools",
      "skript",
      "skripte",
      "script",
      "scripts",
      "automatisierung",
      "automation",
      "automate",
    ],
    followUps: ["fonts", "hobbies", "contact"],
    de: {
      label: "eigene Tools",
      q: "Baut Achim eigene Tools?",
      a: "Ja. Er schreibt kleine Skripte, die wiederkehrende Schritte übernehmen, damit mehr Zeit fürs eigentliche Design bleibt.",
    },
    en: {
      label: "own tools",
      q: "Does Achim build his own tools?",
      a: "Yes. He writes small scripts that take over repetitive steps, which leaves more time for the actual design.",
    },
  },
  {
    id: "hobbies",
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
      "spiele",
    ],
    followUps: ["about", "work", "contact"],
    de: {
      label: "Hobbys",
      q: "Was macht Achim neben der Arbeit?",
      a: "Radfahren, PS1- und PS2-Klassiker und, wie er selbst sagt, zu viel Tee.",
    },
    en: {
      label: "hobbies",
      q: "What does Achim do outside of work?",
      a: "Cycling, PS1 and PS2 classics, and, in his own words, too much tea.",
    },
  },

  /* ── Arbeiten & Kontakt ────────────────────────────────────────── */
  {
    id: "work",
    keywords: [
      "portfolio",
      "projekte",
      "referenzen",
      "beispiele",
      "arbeiten sehen",
      "deine arbeiten",
      "projects",
      "references",
      "examples",
      "your work",
      "selected work",
      "case studies",
    ],
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
    keywords: [
      "kontakt",
      "email",
      "zusammenarbeiten",
      "beauftragen",
      "buchen",
      "hire",
      "book",
      "work together",
      "collaborate",
    ],
    followUps: ["price", "process", "work"],
    de: {
      label: "Kontakt",
      q: "Wie kann ich Kontakt aufnehmen?",
      a: "Schreib Achim an [{email}](mailto:{email}) oder nutze die [Kontaktseite]({base}/contact). Wenn du zusammenarbeiten möchtest, freut er sich von dir zu hören.",
    },
    en: {
      label: "get in touch",
      q: "How can I get in touch?",
      a: "Email Achim at [{email}](mailto:{email}) or use the [contact page]({base}/contact). If you're interested in working together, he'd like to hear from you.",
    },
  },
];
