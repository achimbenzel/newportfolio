/**
 * Wissensbasis des „Frag Achim“-Widgets.
 *
 * ⚠️ INHALTE SIND VORLÄUFIG – übernommen aus dem Widget-Entwurf (ask-achim-widget-v2).
 * Die finalen Informationen folgen; dann nur DIESE Datei anpassen (oder später nach
 * Sanity verschieben, siehe docs/08-roadmap.md).
 *
 * Aufbau eines Themas:
 * - id         eindeutiger Schlüssel
 * - keywords   Suchbegriffe (DE + EN gemischt, Kleinschreibung). Mehrwort-Begriffe zählen stärker.
 * - followUps  IDs der Themen, die danach als Vorschläge erscheinen
 * - de / en    label (Vorschlags-Chip), q (Frage beim Klick), a (Antwort)
 *
 * Platzhalter in Antworten: {base} → /de bzw. /en, {email} → Kontaktadresse.
 * Links: [Text](url) – interne Links mit {base}, extern mit https://, Mail mit mailto:.
 */
import type { Locale } from "~/i18n/config";

export type TopicText = { label?: string; q?: string; a: string };

export type Topic = {
  id: string;
  keywords: string[];
  followUps: string[];
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
export const defaultChips = ["services", "process", "price", "motion", "contact"];

/** Themen, die einen Aspekt erfragen (Dauer, Preis …) – schlagen reine Fachthemen */
export const intentTopics = new Set([
  "duration",
  "price",
  "prepare",
  "existing",
  "source",
  "process",
  "availability",
  "journey",
  "studied",
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

/** Erkennt deutsche Fragen auf der englischen Seite (und umgekehrt) */
export const germanHints = [
  "ich",
  "du",
  "dir",
  "mir",
  "kann",
  "kannst",
  "wie",
  "wer",
  "welche",
  "dauert",
  "kostet",
  "bitte",
  "und",
  "ist",
  "ein",
  "eine",
  "der",
  "die",
  "das",
  "nicht",
  "machst",
  "bietest",
  "bist",
  "hast",
  "habt",
  "mein",
  "meine",
  "für",
];

export const topics: Topic[] = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "hallo", "moin", "servus"],
    followUps: ["services", "process", "contact"],
    de: {
      a: "Hi! Frag mich nach Achims Leistungen, dem Ablauf eines Projekts oder wie du ihn erreichst.",
    },
    en: {
      a: "Hi! Ask me about Achim's services, how a project runs or how to reach him.",
    },
  },
  {
    id: "services",
    keywords: [
      "services",
      "service",
      "offer",
      "what do you do",
      "do you do",
      "what can you",
      "leistungen",
      "leistung",
      "was machst du",
      "was bietest",
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
    keywords: [
      "brand",
      "branding",
      "logo",
      "logos",
      "identity",
      "corporate",
      "guidelines",
      "marke",
      "markenidentität",
      "identität",
    ],
    followUps: ["duration", "existing", "prepare"],
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
      "motion",
      "animation",
      "animations",
      "animate",
      "animated",
      "animieren",
      "video",
      "film",
      "launch video",
      "storyboard",
    ],
    followUps: ["duration", "source", "existing"],
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
    keywords: [
      "music",
      "visuals",
      "visualizer",
      "visualiser",
      "album",
      "cover",
      "artwork",
      "release",
      "single",
      "song",
      "track",
      "musik",
      "albumcover",
      "veröffentlichung",
    ],
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
    keywords: ["3d", "cinema", "c4d", "render", "rendering", "blender"],
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
  {
    id: "process",
    keywords: [
      "process",
      "workflow",
      "steps",
      "how does it work",
      "how do you work",
      "how it works",
      "how does a project",
      "how a project",
      "get started",
      "getting started",
      "start a project",
      "ablauf",
      "prozess",
      "vorgehen",
      "wie läuft",
      "wie funktioniert",
      "schritte",
    ],
    followUps: ["duration", "price", "contact"],
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
    keywords: [
      "how long",
      "duration",
      "weeks",
      "week",
      "timeline",
      "turnaround",
      "deadline",
      "fast",
      "quick",
      "quickly",
      "wie lange",
      "dauer",
      "wochen",
      "schnell",
      "dauert",
    ],
    followUps: ["price", "process", "contact"],
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
    id: "existing",
    keywords: [
      "existing",
      "refresh",
      "redesign",
      "relaunch",
      "already have",
      "did not design",
      "didnt design",
      "didn't design",
      "bestehend",
      "bestehende",
      "bestehendes",
      "überarbeitung",
      "überarbeiten",
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
    keywords: [
      "source files",
      "source",
      "project files",
      "editable",
      "files",
      "quelldateien",
      "projektdateien",
      "dateien",
      "offene dateien",
    ],
    followUps: ["existing", "price", "contact"],
    de: {
      label: "Quelldateien",
      q: "Bekomme ich die Quelldateien?",
      a: "Bei Motion-Projekten ja. Bearbeitbare Projektdateien gehören zu jeder Übergabe, dazu ein Hinweis, welche Schriften und Plugins sie brauchen, damit später jemand anderes weiterarbeiten kann.",
    },
    en: {
      label: "source files",
      q: "Do I get the source files?",
      a: "For motion projects, yes. Editable project files are part of every handover, along with a note on which fonts and plugins they need, so another editor can pick them up later.",
    },
  },
  {
    id: "prepare",
    keywords: [
      "prepare",
      "preparation",
      "need from me",
      "bring",
      "brief",
      "vorbereiten",
      "vorbereitung",
      "brauchst du von mir",
      "unterlagen",
      "benötigst",
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
    keywords: [
      "price",
      "prices",
      "pricing",
      "cost",
      "costs",
      "rate",
      "rates",
      "budget",
      "quote",
      "expensive",
      "cheap",
      "preis",
      "preise",
      "kosten",
      "kostet",
      "angebot",
      "budget",
    ],
    followUps: ["contact", "process", "work"],
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
    id: "about",
    keywords: [
      "who is achim",
      "who are you",
      "about achim",
      "about you",
      "about",
      "story",
      "freelance",
      "freelancer",
      "independent",
      "wer ist achim",
      "wer bist du",
      "über achim",
      "über dich",
      "über mich",
    ],
    followUps: ["journey", "studied", "fonts"],
    de: {
      label: "über Achim",
      q: "Wer ist Achim?",
      a: "Achim hat mit zwölf aus reinem Hobby in Photoshop herumprobiert, später Time Based Media in Mainz studiert und sich selbstständig gemacht. Heute ist Design sein Beruf, aber die Neugier ist geblieben: Wenn ein Projekt etwas braucht, das es noch nicht gibt, baut er es, ob Schrift oder kleines Tool. Ein kleines Projekt bekommt dieselbe Sorgfalt wie ein großes. Mehr auf der [About-Seite]({base}/about).",
    },
    en: {
      label: "about Achim",
      q: "Who is Achim?",
      a: "Achim started messing around in Photoshop at twelve, purely as a hobby, later studied Time Based Media in Mainz and went freelance. Design is his job now, but the curiosity stayed: if a project needs something that doesn't exist yet, he makes it, whether that's a typeface or a small tool. A small project gets the same care as a big one. More on the [About page]({base}/about).",
    },
  },
  {
    id: "journey",
    keywords: [
      "journey",
      "career",
      "history",
      "background",
      "photoshop",
      "minecraft",
      "werdegang",
      "lebenslauf",
      "geschichte",
      "anfang",
    ],
    followUps: ["studied", "three_d", "contact"],
    de: {
      label: "Achims Werdegang",
      q: "Wie war Achims Werdegang?",
      a: "2013: mit 12 Photoshop Elements entdeckt und Banner für Minecraft-Server gebaut.\n2014: erste 3D-Intros in Cinema 4D.\n2019: Poster und Tickets für die Schule, das Erste, was andere in der Hand hielten.\n2023: Studium Time Based Media in Mainz begonnen und im selben Sommer selbstständig gemacht.\n2026: Bachelor abgeschlossen, und was nebenher lief, wurde der Beruf.",
    },
    en: {
      label: "Achim's journey",
      q: "What's Achim's journey?",
      a: "2013: found Photoshop Elements at 12 and made banners for Minecraft servers.\n2014: first 3D intros in Cinema 4D.\n2019: posters and tickets for school, the first things other people held in their hands.\n2023: started studying time-based media in Mainz and went freelance the same summer.\n2026: bachelor finished, and what ran alongside became the job.",
    },
  },
  {
    id: "studied",
    keywords: [
      "study",
      "studied",
      "studies",
      "university",
      "degree",
      "bachelor",
      "mainz",
      "education",
      "studium",
      "studiert",
      "uni",
      "ausbildung",
    ],
    followUps: ["journey", "fonts", "contact"],
    de: {
      label: "Studium",
      q: "Was hat Achim studiert?",
      a: "Achim hat einen Bachelor in Time Based Media in Mainz gemacht. Er hat 2023 angefangen, im selben Sommer begann die Selbstständigkeit, und 2026 war der Abschluss.",
    },
    en: {
      label: "studies",
      q: "What did Achim study?",
      a: "Achim did a bachelor's in Time Based Media in Mainz. He started in 2023, went freelance the same summer, and finished the degree in 2026.",
    },
  },
  {
    id: "fonts",
    keywords: [
      "font",
      "fonts",
      "typeface",
      "typefaces",
      "type design",
      "schrift",
      "schriften",
      "schriftart",
      "schriftarten",
    ],
    followUps: ["tools", "about", "work"],
    de: {
      label: "eigene Schriften",
      q: "Entwirft Achim eigene Schriften?",
      a: "Ja. Wenn keine vorhandene Schrift zu einem Projekt passt, zeichnet Achim eine von Grund auf. Einige davon gibt es auf der Fonts-Seite seiner Website.",
    },
    en: {
      label: "own typefaces",
      q: "Does Achim design his own typefaces?",
      a: "Yes. When no existing typeface fits a project, Achim draws one from scratch. A few of them are on the Fonts page of his site.",
    },
  },
  {
    id: "tools",
    keywords: [
      "tool",
      "tools",
      "script",
      "scripts",
      "automation",
      "automate",
      "werkzeuge",
      "skripte",
      "automatisierung",
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
      "hobbies",
      "cycling",
      "bike",
      "tea",
      "playstation",
      "ps1",
      "ps2",
      "games",
      "gaming",
      "freizeit",
      "hobbys",
      "fahrrad",
      "tee",
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
  {
    id: "work",
    keywords: [
      "portfolio",
      "projects",
      "project examples",
      "examples",
      "references",
      "selected work",
      "your work",
      "arbeiten",
      "projekte",
      "referenzen",
      "beispiele",
    ],
    followUps: ["branding", "motion", "contact"],
    de: {
      label: "Arbeiten",
      q: "Kann ich Arbeiten sehen?",
      a: "Ausgewählte Projekte findest du auf der [Work-Seite]({base}/work).",
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
      "contact",
      "email",
      "mail",
      "reach",
      "touch",
      "hire",
      "book",
      "get in touch",
      "work together",
      "collaborate",
      "kontakt",
      "kontaktieren",
      "schreiben",
      "anfrage",
      "zusammenarbeiten",
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
  {
    id: "availability",
    keywords: [
      "available",
      "availability",
      "capacity",
      "free",
      "taking on",
      "booked",
      "verfügbar",
      "verfügbarkeit",
      "kapazität",
      "frei",
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
];
