/**
 * Testfragen für das „Frag Achim“-Widget. `npm test` prüft, ob jede Frage beim richtigen
 * Thema landet und in der richtigen Sprache beantwortet wird.
 *
 * - Jede Beispielfrage aus knowledge.ts (`examples`) wird automatisch mitgeprüft.
 * - Neue Formulierung gefunden, die nicht klappt? → als Beispielfrage beim Thema eintragen
 *   (oder hier als Testfall), dann Stichwörter/Synonyme ergänzen, bis `npm test` grün ist.
 */
import { describe, expect, it } from "vitest";
import type { AskContent, AskProject, AskService } from "~/content/types";
import type { Locale } from "~/i18n/config";
import {
  ageAt,
  answerLocally,
  detectLanguage,
  getTopic,
  normalize,
  stem,
  type AskContext,
  type AskOptions,
} from "./engine";
import { dayPeriod, greetingFor } from "./greeting";
import {
  askTexts,
  defaultChips,
  greetingPrompts,
  synonyms,
  timeGreetings,
  topics,
  type Text,
} from "./knowledge";

/** Sprache wie im Widget erkennen – Seite absichtlich in der „falschen“ Sprache */
function langFor(question: string, expected: Locale): Locale {
  const pageLocale: Locale = expected === "de" ? "en" : "de";
  const ambiguous = detectLanguage(question, "de") !== detectLanguage(question, "en");
  return detectLanguage(question, ambiguous ? expected : pageLocale);
}

/** [Frage, erwartetes Thema (null = keine Antwort), erwartete Sprache] */
const cases: [string, string | null, Locale][] = [
  // Smalltalk
  ["Hallo", "greeting", "de"],
  ["Hi!", "greeting", "de"],
  ["Hi Achim", "greeting", "de"],
  ["Hallo, wie geht's dir?", "howAreYou", "de"],
  ["Hey, how are you?", "howAreYou", "en"],
  ["Danke dir!", "thanks", "de"],
  ["Tschüss!", "bye", "de"],
  ["Hallo, was kostet ein Logo?", "price", "de"],

  // Leistungen
  ["Was bietest du an?", "services", "de"],
  ["What services do you offer?", "services", "en"],
  ["Ich brauche ein neues Logo", "logo", "de"],
  ["Machst du auch Corporate Design?", "branding", "de"],
  ["Kannst du mein Logo animieren?", "logoAnimation", "de"],
  ["Can you animate my logo?", "logoAnimation", "en"],
  ["Ich brauche ein Video für meinen Launch", "motion", "de"],
  ["Gestaltest du auch Albumcover?", "music", "de"],
  ["Was machst du für Musik?", "music", "de"],
  ["Machst du 3D?", "three_d", "de"],
  ["Do you work in Blender?", "software", "en"],
  ["Kannst du After Effects?", "software", "de"],
  ["Welche Tools nutzt du?", "software", "de"],
  ["Baust du eigene Tools?", "tools", "de"],

  // Zusammenarbeit
  ["Wie läuft ein Projekt ab?", "process", "de"],
  ["Wie lange dauert ein Branding?", "duration", "de"],
  ["Wie lange brauchst du für ein Logo?", "duration", "de"],
  ["How long does a logo animation take?", "duration", "en"],
  ["Wie lange dauert ein Projekt?", "duration", "de"],
  ["Wie teuer ist ein Logo?", "price", "de"],
  ["Wie viel nimmst du für ein Cover?", "price", "de"],
  ["How much does a brand identity cost?", "price", "en"],
  ["Wie viele Änderungen sind inklusive?", "revisions", "de"],
  ["Gibt es Feedbackrunden?", "revisions", "de"],
  ["Kannst du mein bestehendes Logo überarbeiten?", "existing", "de"],
  ["Bekomme ich die offenen Dateien?", "source", "de"],
  ["Sprichst du Englisch?", "languages", "de"],
  ["Bist du gerade verfügbar?", "availability", "de"],

  // Über Achim
  ["Wer bist du?", "about", "de"],
  ["Wie alt bist du?", "age", "de"],
  ["How old is Achim?", "age", "en"],
  ["Wann hast du Geburtstag?", "birthday", "de"],
  ["Wann hast du angefangen?", "journey", "de"],
  ["Wie lange machst du das schon?", "journey", "de"],
  ["Wie lange hast du studiert?", "studied", "de"],
  ["Bist du eine KI?", "bot", "de"],
  ["Kannst du programmieren?", "tools", "de"],
  ["Ich möchte ein Projekt starten", "contact", "de"],
  ["Machst du Plakate für Konzerte?", "graphic", "de"],
  ["Was hast du studiert?", "studied", "de"],
  ["Entwirfst du eigene Schriften?", "fonts", "de"],
  ["Was machst du in deiner Freizeit?", "hobbies", "de"],

  // Arbeiten & Kontakt
  ["Kann ich Referenzen sehen?", "work", "de"],
  ["Wie ist deine E-Mail-Adresse?", "contact", "de"],

  // Neue Infos (Fragen außerhalb der Beispielfragen)
  ["Woher kommst du?", "location", "de"],
  ["Machst du Social Media?", "socialContent", "de"],
  ["Machst du Instagram-Posts?", "socialContent", "de"],
  ["Hast du LinkedIn?", "social", "de"],
  ["Machst du Webdesign?", "website", "de"],
  ["Machst du Websites mit WordPress?", "website", "de"],
  ["Kannst du mit Resolume arbeiten?", "stage", "de"],
  ["Machst du Merch für meine Band?", "graphic", "de"],
  ["Machst du auch Sound?", "sound", "de"],
  ["Machst du Fotos?", "photo", "de"],
  ["Gibt es einen Mindestpreis?", "minimum", "de"],
  ["Machst du auch kleine Sachen unter 300 Euro?", "minimum", "de"],
  ["Bist du Kleinunternehmer?", "payment", "de"],
  ["Was kosten weitere Korrekturen?", "revisions", "de"],
  ["Darf ich das Logo überall nutzen?", "rights", "de"],
  ["Bekomme ich die PSD?", "source", "de"],
  ["Bekomme ich ein SVG?", "formats", "de"],
  ["Ich brauche das bis morgen", "rush", "de"],
  ["Wie ist deine Nummer?", "contact", "de"],
  ["Are your designs made with AI?", "ai", "en"],
  ["What was your grade?", "grade", "en"],
  ["Hast du für bekannte Leute gearbeitet?", "clients", "de"],
  ["Hast du Kunden in den USA?", "clients", "de"],
  ["Lieblingsschrift?", "favoriteFont", "de"],
  ["Gehst du auf Festivals?", "musicTaste", "de"],
  ["Warst du schon mal in Japan?", "travel", "de"],
  ["Sammelst du Platten?", "collecting", "de"],
  ["Speicherst du meine Daten?", "privacy", "de"],

  // Tippfehler
  ["Wie lange dauert ein Brandign?", "duration", "de"],
  ["Do you do anmation?", "motion", "en"],

  // Nichts gefunden
  ["Wie wird das Wetter morgen?", null, "de"],
];

describe("Frag Achim – Testfragen", () => {
  it.each(cases)("„%s“ → %s (%s)", (question, expectedTopic, expectedLang) => {
    const lang = langFor(question, expectedLang);
    expect(answerLocally(question, { lang }).topicId).toBe(expectedTopic);
    expect(lang).toBe(expectedLang);
  });
});

/* ── Beispielfragen aus knowledge.ts – automatisch ─────────────────── */

const examples = topics.flatMap((topic) =>
  (["de", "en"] as const).flatMap((lang) =>
    (topic.examples?.[lang] ?? []).map((q) => [q, topic.id, lang] as [string, string, Locale]),
  ),
);

describe("Frag Achim – Beispielfragen", () => {
  it("jedes Thema (außer Smalltalk-Kleinkram) hat Beispielfragen in beiden Sprachen", () => {
    for (const topic of topics) {
      expect(topic.examples?.de.length, `${topic.id}.examples.de`).toBeGreaterThan(0);
      expect(topic.examples?.en.length, `${topic.id}.examples.en`).toBeGreaterThan(0);
    }
  });

  it.each(examples)("„%s“ → %s (%s)", (question, expectedTopic, expectedLang) => {
    const lang = langFor(question, expectedLang);
    expect(answerLocally(question, { lang }).topicId).toBe(expectedTopic);
    expect(lang).toBe(expectedLang);
  });
});

/* ── Inhalte & Struktur ─────────────────────────────────────────────── */

const variants = (text: Text) => (Array.isArray(text) ? text : [text]);

describe("Frag Achim – Inhalte", () => {
  it("Projektdateien nur nach Absprache", () => {
    expect(answerLocally("Bekomme ich die Projektdateien?", { lang: "de" }).text).toContain(
      "nicht automatisch dabei",
    );
    expect(answerLocally("Do I get the project files?", { lang: "en" }).text).toContain(
      "aren't included by default",
    );
  });

  it("nennt Kontaktwege mit Links (E-Mail, WhatsApp, Instagram, X)", () => {
    const answer = answerLocally("Wie erreiche ich dich?", { lang: "de" }).text;
    expect(answer).toContain("(mailto:info@achimbenzel.com)");
    expect(answer).toContain("(https://wa.me/491639877331)");
    expect(answer).toContain("[Instagram](https://instagram.com/achimbenzel)");
    expect(answer).toContain("[X](https://x.com/achimbenzel)");
    expect(answer).not.toMatch(/\{\w+(:\w+)?\}/);
  });

  it("listet alle Social-Profile und verweist für mehr Arbeiten auf Behance", () => {
    const social = answerLocally("Wie ist dein Instagram?", { lang: "en" }).text;
    for (const name of ["LinkedIn", "Instagram", "Behance", "Pinterest", "X"])
      expect(social).toContain(`[${name}](`);
    expect(answerLocally("Kann ich Referenzen sehen?", { lang: "de" }).text).toContain(
      "[Behance](https://behance.net/achimbenzel)",
    );
  });

  it("keine Antwort enthält unbekannte Platzhalter", () => {
    for (const topic of topics) {
      for (const lang of ["de", "en"] as const) {
        const text = answerLocally("", { lang, topicId: topic.id, random: () => 0 }).text;
        expect(text, topic.id).not.toMatch(/\{\w+(:\w+)?\}/);
      }
    }
  });

  it("nennt zwei Korrekturschleifen als Standard", () => {
    expect(answerLocally("Korrekturschleifen?", { lang: "de" }).text).toContain(
      "zwei Korrekturschleifen",
    );
    expect(answerLocally("revisions?", { lang: "en" }).text).toContain("two rounds of revisions");
  });

  it("beantwortet zwei Fragen in einer, hängt aber kein bloßes Fachgebiet an", () => {
    const both = answerLocally("Wie lange dauert ein Logo und was kostet es?", { lang: "de" });
    expect(both.topicId).toBe("duration");
    expect(both.text).toContain("Außerdem: Feste Preise oder Richtwerte gibt es bei mir nicht");
    expect(answerLocally("Wie teuer ist ein Logo?", { lang: "de" }).text).not.toContain("Außerdem");
    expect(answerLocally("Hallo, was kostet ein Logo?", { lang: "de" }).text).not.toContain(
      "Außerdem",
    );
  });

  it("jedes Thema hat Antworten auf Deutsch und Englisch (auch alle Varianten und Facetten)", () => {
    for (const topic of topics) {
      for (const lang of ["de", "en"] as const) {
        for (const text of variants(topic[lang].a))
          expect(text, `${topic.id}.${lang}`).toBeTruthy();
        for (const [id, facet] of Object.entries(topic.facets ?? {}))
          for (const text of variants(facet[lang])) expect(text, `${topic.id}/${id}`).toBeTruthy();
      }
    }
    for (const lang of ["de", "en"] as const) {
      expect(timeGreetings[lang].evening.length).toBeGreaterThan(0);
      expect(greetingPrompts[lang].length).toBeGreaterThan(0);
    }
  });

  it("alle Verweise zeigen auf existierende Themen der richtigen Art", () => {
    const byId = new Map(topics.map((t) => [t.id, t]));
    for (const topic of topics) {
      for (const id of topic.followUps) expect(byId.has(id), `${topic.id} → ${id}`).toBe(true);
      if (topic.parent) expect(byId.get(topic.parent)?.kind, topic.id).toBe("subject");
      for (const id of Object.keys(topic.facets ?? {}))
        expect(byId.get(id)?.kind, `${topic.id}/${id}`).toBe("subject");
      if (topic.facets) expect(topic.kind, topic.id).toBe("aspect");
    }
    for (const id of defaultChips) expect(byId.has(id), id).toBe(true);
  });

  it("Vorschläge haben Beschriftung und Frage in beiden Sprachen", () => {
    const suggested = new Set([...defaultChips, ...topics.flatMap((t) => t.followUps)]);
    for (const id of suggested) {
      const topic = topics.find((t) => t.id === id)!;
      for (const l of ["de", "en"] as const) {
        expect(topic[l].label, `${id}.${l}.label`).toBeTruthy();
        expect(topic[l].q, `${id}.${l}.q`).toBeTruthy();
      }
    }
  });

  it("Synonym-Gruppen überschneiden sich nicht", () => {
    const owner = new Map<string, string>();
    for (const group of synonyms) {
      for (const member of group) {
        const key = normalize(member).includes(" ") ? normalize(member) : stem(normalize(member));
        const previous = owner.get(key);
        expect(
          previous === undefined || previous === group[0],
          `„${member}“ steht in „${previous}“ und „${group[0]}“`,
        ).toBe(true);
        owner.set(key, group[0]!);
      }
    }
  });

  it("Tee: einfach gern, nicht „zu viel“", () => {
    for (const q of ["Was ist dein Lieblingstee?", "Was machst du in deiner Freizeit?"]) {
      expect(answerLocally(q, { lang: "de" }).text).not.toContain("zu viel");
      expect(answerLocally(q, { lang: "en" }).text).not.toContain("too much");
    }
  });

  it("Varianten werden zufällig gewählt", () => {
    const first = answerLocally("Hallo", { lang: "de", random: () => 0 }).text;
    const last = answerLocally("Hallo", { lang: "de", random: () => 0.99 }).text;
    expect(first).not.toBe(last);
  });
});

/* ── Gezielte Antworten, Gedächtnis, Rückfragen ─────────────────────── */

/** Kleines Gespräch: jede Antwort gibt ihr Gedächtnis an die nächste Frage weiter. */
function conversation(lang: Locale, options: Partial<AskOptions> = {}) {
  let context: AskContext = {};
  return (question: string, topicId?: string) => {
    const answer = answerLocally(question, { lang, context, topicId, ...options });
    context = answer.context;
    return answer;
  };
}

describe("Frag Achim – gezielte Antworten (Aspekt × Fachgebiet)", () => {
  it("Dauer einer Logo-Animation statt allgemeiner Dauer", () => {
    const answer = answerLocally("Wie lange dauert eine Logo-Animation?", { lang: "de" });
    expect(answer.text).toContain("ein bis zwei Wochen");
    expect(answer.text).not.toContain("sechs bis zehn");
  });

  it("Unterthema ohne eigene Antwort nutzt das übergeordnete Fachgebiet (3D → Motion)", () => {
    const answer = answerLocally("How long does a 3D project take?", { lang: "en" });
    expect(answer.topicId).toBe("duration");
    expect(answer.text).toContain("three to six weeks");
  });

  it("Ablauf je Fachgebiet", () => {
    const answer = answerLocally("Wie läuft ein Musikprojekt ab?", { lang: "de" });
    expect(answer.topicId).toBe("process");
    expect(answer.text).toContain("Zuhören");
    expect(answer.text).not.toContain("Discovery");
  });
});

describe("Frag Achim – Gesprächsgedächtnis", () => {
  it("„das“ bezieht sich auf das zuletzt besprochene Fachgebiet", () => {
    const ask = conversation("de");
    expect(ask("Kannst du mein Logo animieren?").topicId).toBe("logoAnimation");
    const answer = ask("Wie lange dauert das?");
    expect(answer.topicId).toBe("duration");
    expect(answer.text).toContain("ein bis zwei Wochen");
  });

  it("„Und bei Musik?“ überträgt die vorige Frage auf ein neues Fachgebiet", () => {
    const ask = conversation("de");
    expect(ask("Wie lange dauert ein Branding?").text).toContain("sechs bis zehn Wochen");
    const answer = ask("Und bei Motion Design?");
    expect(answer.topicId).toBe("duration");
    expect(answer.text).toContain("drei bis sechs Wochen");
  });

  it("Vorschlag-Klick auf einen Aspekt nutzt das Gesprächsthema", () => {
    const ask = conversation("en");
    ask("I need a visualizer for my new single");
    expect(ask("What do I need to prepare?", "prepare").text).toContain("rough mix");
  });

  it("ohne Bezug („das“) bleibt die Antwort allgemein", () => {
    const ask = conversation("de");
    ask("Kannst du mein Logo animieren?");
    expect(ask("Wie lange dauert ein Projekt normalerweise?").text).toContain("sechs bis zehn");
  });

  it("allgemeine Themen beenden das Fachgebiet", () => {
    const ask = conversation("de");
    ask("Kannst du mein Logo animieren?");
    ask("Wer bist du?");
    expect(ask("Wie lange dauert das?").text).toContain("sechs bis zehn");
  });
});

describe("Frag Achim – Rückfragen & Unsicherheit", () => {
  it("fragt nach, wenn zwei Fachgebiete gleich gut passen", () => {
    const answer = answerLocally("Cover oder Logo?", { lang: "de" });
    expect(answer.kind).toBe("clarify");
    expect(answer.text).toMatch(/^Meinst du .+ oder .+\?$/);
    expect(answer.followUps.sort()).toEqual(["logo", "music"]);
  });

  it("nimmt bei Gleichstand das Fachgebiet aus dem Gespräch", () => {
    const ask = conversation("de");
    ask("Gestaltest du auch Albumcover?");
    expect(ask("Cover oder Logo?").topicId).toBe("music");
  });

  it("schlägt bei unsicheren Treffern Themen vor statt zu raten", () => {
    const answer = answerLocally("Ich brauche etwas", { lang: "de" });
    expect(answer.kind).toBe("unsure");
    expect(answer.followUps.length).toBeGreaterThan(0);
    for (const id of answer.followUps) expect(getTopic(id)?.de.label, id).toBeTruthy();
  });

  it("beantwortet ein allgemeines Thema zuerst, wenn es klar besser passt", () => {
    expect(answerLocally("Wie lange hast du studiert?", { lang: "de" }).topicId).toBe("studied");
    const both = answerLocally("Wer bist du und was kostet ein Logo?", { lang: "de" });
    expect(both.topicId).toBe("about");
    expect(both.text).toContain("Außerdem: Feste Preise oder Richtwerte gibt es bei mir nicht");
  });

  it("„Erzähl mehr“ schlägt Themen passend zum Gespräch vor", () => {
    const ask = conversation("de");
    ask("Gestaltest du auch Albumcover?");
    const answer = ask("Erzähl mir mehr");
    expect(answer.topicId).toBe("more");
    expect(answer.followUps).toEqual(getTopic("music")!.followUps);
  });

  it("antwortet ehrlich, wenn es nichts weiß", () => {
    expect(answerLocally("Wie heißt deine Katze?", { lang: "de" }).kind).toBe("fallback");
    expect(answerLocally("Tell me a joke", { lang: "en" }).kind).toBe("offTopic");
  });
});

describe("Frag Achim – berechnete Antworten", () => {
  it("rechnet das Alter aus dem Geburtsdatum aus", () => {
    expect(ageAt(new Date(2026, 9, 3))).toBe(25);
    expect(ageAt(new Date(2026, 9, 4))).toBe(26);
    expect(ageAt(new Date(2027, 0, 1))).toBe(26);
    const answer = answerLocally("Wie alt bist du?", { lang: "de", now: new Date(2026, 9, 2) });
    expect(answer.text).toContain("25");
  });

  it("weiß, wann Geburtstag ist – und ob heute", () => {
    const normal = answerLocally("When is your birthday?", {
      lang: "en",
      now: new Date(2026, 5, 1),
    });
    expect(normal.text).toBe("My birthday is on 4 October.");
    const today = answerLocally("Wann hast du Geburtstag?", {
      lang: "de",
      now: new Date(2026, 9, 4),
    });
    expect(today.text).toContain(askTexts.de.birthdayToday.trim());
  });
});

describe("Frag Achim – Begrüßung über dem Chat", () => {
  it.each([
    [7, "morning"],
    [12, "midday"],
    [16, "afternoon"],
    [20, "evening"],
    [2, "night"],
  ] as const)("%i Uhr → %s", (hour, period) => {
    expect(dayPeriod(hour)).toBe(period);
  });

  it("wählt aus den Varianten der Tageszeit", () => {
    const greeting = greetingFor("de", { period: "evening", title: 0, prompt: 0.99 });
    expect(timeGreetings.de.evening).toContain(greeting.title);
    expect(greetingPrompts.de).toContain(greeting.prompt);
  });
});

/* ── Inhalte aus dem Content-Layer (später Sanity – hier feste Testdaten) ── */

const projects: AskProject[] = [
  {
    slug: "gute-stube",
    client: "Gute Stube",
    year: 2025,
    keywords: ["café", "bistro"],
    de: {
      title: "Gute Stube Freisen",
      category: "Brand Identity",
      industry: "Gastronomie",
      summary: "Ein Café & Bistro in Freisen.",
    },
    en: {
      title: "Gute Stube Freisen",
      category: "Brand Identity",
      industry: "Gastronomy",
      summary: "A café and bistro in Freisen.",
    },
  },
  {
    slug: "joeys-picknick",
    client: "Joeys Picknick",
    year: 2026,
    keywords: ["foodtruck"],
    de: {
      title: "Joeys Picknick Mainz",
      category: "Brand Identity",
      industry: "Gastronomie",
      summary: "Ein Foodtruck aus Mainz.",
    },
    en: {
      title: "Joeys Picknick Mainz",
      category: "Brand Identity",
      industry: "Gastronomy",
      summary: "A food truck from Mainz.",
    },
  },
  {
    slug: "lumakeys",
    year: 2026,
    keywords: [],
    de: { title: "LumaKeys", category: "Logo Design", summary: "Ein Logo." },
    en: { title: "LumaKeys", category: "Logo Design", summary: "A logo." },
  },
];

const services: AskService[] = [
  {
    slug: "branding",
    de: {
      title: "Brand & Logo Design",
      intro: "Neue Einleitung aus dem CMS.",
      steps: ["Kennenlernen", "Entwurf", "Übergabe"],
    },
    en: {
      title: "Brand & Logo Design",
      intro: "New intro from the CMS.",
      steps: ["Meeting", "Draft", "Handover"],
    },
  },
];

const content: AskContent = { projects, services };

describe("Frag Achim – Kundenprojekte", () => {
  const ask = (question: string, lang: Locale = "de") => answerLocally(question, { lang, content });

  it.each([
    ["Erzähl mir was über Gute Stube", "project:gute-stube"],
    ["Was hast du für Joeys Picknick gemacht?", "project:joeys-picknick"],
    ["Was ist LumaKeys?", "project:lumakeys"],
    ["Hast du schon mal ein Café gestaltet?", "project:gute-stube"],
    ["Hast du schon was für Gastronomie gemacht?", "industry:gastronomie"],
    ["Für welche Kunden hast du gearbeitet?", "clients"],
    ["Kann ich Referenzen sehen?", "work"],
  ])("„%s“ → %s", (question, expected) => {
    expect(ask(question).topicId).toBe(expected);
  });

  it("Projektantwort enthält Kurzbeschreibung und Link", () => {
    const answer = ask("Tell me about LumaKeys", "en");
    expect(answer.text).toContain("LumaKeys (Logo Design, 2026): A logo.");
    expect(answer.text).toContain("(/en/work/lumakeys)");
  });

  it("Projektliste verlinkt die Projekte und schlägt sie als Chips vor", () => {
    const answer = ask("Welche Projekte hast du gemacht?");
    expect(answer.text).toContain("[Gute Stube Freisen](/de/work/gute-stube)");
    expect(answer.followUps).toContain("project:gute-stube");
    expect(getTopic("project:gute-stube", content)?.de.label).toBe("Gute Stube Freisen");
  });

  it("Projektliste je Fachgebiet („Beispiele dafür?“ nach einer Logo-Frage)", () => {
    const talk = conversation("de", { content });
    talk("Machst du Logos?");
    const answer = talk("Hast du Beispiele dafür?");
    expect(answer.topicId).toBe("work");
    expect(answer.text).toContain("LumaKeys");
    expect(answer.text).not.toContain("Gute Stube");
  });

  it("Branche listet alle passenden Projekte", () => {
    const answer = ask("Have you done anything in gastronomy?", "en");
    expect(answer.text).toContain("Gute Stube Freisen");
    expect(answer.text).toContain("Joeys Picknick Mainz");
  });

  it("Aspekt-Frage zu einem Projekt antwortet fürs Fachgebiet des Projekts", () => {
    const answer = ask("Wie lange hat Gute Stube gedauert?");
    expect(answer.topicId).toBe("duration");
    expect(answer.text).toMatch(/^Für Gute Stube Freisen kann ich dir hier keine genauen Angaben/);
    expect(answer.text).toContain("sechs bis zehn Wochen");
  });

  it("ohne Inhalte bleibt alles beim Alten", () => {
    expect(answerLocally("Welche Projekte hast du gemacht?", { lang: "de" }).text).toContain(
      "[Projekte](/de/work)",
    );
  });
});

describe("Frag Achim – Leistungsseiten", () => {
  it("Einleitung der Leistungsseite ersetzt die feste Antwort", () => {
    const answer = answerLocally("Erzähl mir etwas über Branding", { lang: "de", content });
    expect(answer.text).toBe(
      "Neue Einleitung aus dem CMS. Mehr unter [Brand & Logo Design](/de/branding).",
    );
  });

  it("„Wie funktioniert ein Projekt?“ erklärt den ganzen Projektablauf (auch mit Inhalten)", () => {
    for (const options of [{ lang: "de" as const }, { lang: "de" as const, content }]) {
      const answer = answerLocally("Wie funktioniert ein Projekt?", options);
      expect(answer.topicId).toBe("process");
      expect(answer.text).toContain("1. Anfrage");
      expect(answer.text).toContain("8. Übergabe");
    }
  });

  it("Ablauf-Schritte kommen von der Leistungsseite", () => {
    const answer = answerLocally("How does a branding project work?", { lang: "en", content });
    expect(answer.topicId).toBe("process");
    expect(answer.text).toBe(
      "Brand & Logo Design runs in three steps: Meeting, Draft and Handover.",
    );
  });

  it("ohne Leistungsinhalt bleiben die festen Texte", () => {
    const answer = answerLocally("Erzähl mir etwas über Motion Design", { lang: "de", content });
    expect(answer.text).toContain("Storyboard");
  });
});
