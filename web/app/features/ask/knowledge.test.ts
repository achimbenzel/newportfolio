/**
 * Testfragen für das „Frag Achim“-Widget. `npm test` prüft, ob jede Frage beim richtigen
 * Thema landet und in der richtigen Sprache beantwortet wird.
 *
 * Neue Formulierung gefunden, die nicht klappt? → hier als Testfall eintragen,
 * dann Stichwörter/Synonyme in knowledge.ts ergänzen, bis `npm test` grün ist.
 */
import { describe, expect, it } from "vitest";
import type { AskProject } from "~/content/types";
import type { Locale } from "~/i18n/config";
import { answerLocally, detectLanguage, getTopic, normalize, stem } from "./engine";
import { defaultChips, intentTopics, synonyms, topics } from "./knowledge";

/** [Frage, erwartetes Thema (null = keine Antwort), erwartete Sprache] */
const cases: [string, string | null, Locale][] = [
  // Smalltalk
  ["Hallo", "greeting", "de"],
  ["Hi!", "greeting", "de"],
  ["Hallo, wie geht's dir?", "howAreYou", "de"],
  ["Na, wie gehts?", "howAreYou", "de"],
  ["Hey, how are you?", "howAreYou", "en"],
  ["How's it going?", "howAreYou", "en"],
  ["Danke dir!", "thanks", "de"],
  ["Thanks a lot", "thanks", "en"],
  ["Tschüss!", "bye", "de"],
  ["Hallo, was kostet ein Logo?", "price", "de"],

  // Leistungen
  ["Was bietest du an?", "services", "de"],
  ["Was machst du so?", "services", "de"],
  ["What services do you offer?", "services", "en"],
  ["Ich brauche ein neues Logo", "branding", "de"],
  ["Machst du auch Corporate Design?", "branding", "de"],
  ["Kannst du mein Logo animieren?", "motion", "de"],
  ["Can you animate my logo?", "motion", "en"],
  ["Ich brauche ein Video für meinen Launch", "motion", "de"],
  ["Gestaltest du auch Albumcover?", "music", "de"],
  ["I need a visualizer for my new single", "music", "en"],
  ["Machst du 3D?", "three_d", "de"],
  ["Do you work in Blender?", "software", "en"],
  ["Mit welchen Programmen arbeitest du?", "software", "de"],
  ["Kannst du After Effects?", "software", "de"],
  ["Which software do you use?", "software", "en"],
  ["Welche Tools nutzt du?", "software", "de"],
  ["Baust du eigene Tools?", "tools", "de"],

  // Zusammenarbeit
  ["Wie läuft ein Projekt ab?", "process", "de"],
  ["How does it work?", "process", "en"],
  ["Wie lange dauert ein Branding?", "duration", "de"],
  ["Wie lange brauchst du für ein Logo?", "duration", "de"],
  ["How long does a logo animation take?", "duration", "en"],
  ["Was kostet das?", "price", "de"],
  ["Wie teuer ist ein Logo?", "price", "de"],
  ["Wie viel nimmst du für ein Cover?", "price", "de"],
  ["What's your rate?", "price", "en"],
  ["How much does a brand identity cost?", "price", "en"],
  ["Wie viele Korrekturschleifen sind dabei?", "revisions", "de"],
  ["Wie viele Änderungen sind inklusive?", "revisions", "de"],
  ["Gibt es Feedbackrunden?", "revisions", "de"],
  ["How many revisions do I get?", "revisions", "en"],
  ["Are rounds of feedback included?", "revisions", "en"],
  ["Kannst du mein bestehendes Logo überarbeiten?", "existing", "de"],
  ["Can you redesign my existing logo?", "existing", "en"],
  ["Bekomme ich die Projektdateien?", "source", "de"],
  ["Bekomme ich die offenen Dateien?", "source", "de"],
  ["Do I get the source files?", "source", "en"],
  ["Was muss ich vorbereiten?", "prepare", "de"],
  ["Sprichst du Englisch?", "languages", "de"],
  ["Do you speak German?", "languages", "en"],
  ["Can we run the project in English?", "languages", "en"],
  ["Bist du gerade verfügbar?", "availability", "de"],
  ["Are you available next month?", "availability", "en"],

  // Über Achim
  ["Wer bist du?", "about", "de"],
  ["Who is Achim?", "about", "en"],
  ["Seit wann designst du?", "journey", "de"],
  ["Wann hast du angefangen?", "journey", "de"],
  ["How long have you been designing?", "journey", "en"],
  ["Was hast du studiert?", "studied", "de"],
  ["Wo hast du deinen Bachelor gemacht?", "studied", "de"],
  ["Where did you study?", "studied", "en"],
  ["Entwirfst du eigene Schriften?", "fonts", "de"],
  ["Was machst du in deiner Freizeit?", "hobbies", "de"],

  // Arbeiten & Kontakt
  ["Kann ich Referenzen sehen?", "work", "de"],
  ["Do you have a portfolio?", "work", "en"],
  ["Wie erreiche ich dich?", "contact", "de"],
  ["Wie ist deine E-Mail-Adresse?", "contact", "de"],
  ["Can I call you?", "contact", "en"],

  // Tippfehler
  ["Wie lange dauert ein Brandign?", "duration", "de"],
  ["Do you do anmation?", "motion", "en"],

  // Nichts gefunden
  ["Wie wird das Wetter morgen?", null, "de"],
];

describe("Frag Achim – Testfragen", () => {
  it.each(cases)("„%s“ → %s (%s)", (question, expectedTopic, expectedLang) => {
    // Seite absichtlich in der „falschen“ Sprache, damit die Spracherkennung mitgeprüft wird
    const pageLocale: Locale = expectedLang === "de" ? "en" : "de";
    const ambiguous = detectLanguage(question, "de") !== detectLanguage(question, "en");
    const lang = detectLanguage(question, ambiguous ? expectedLang : pageLocale);
    const answer = answerLocally(question, { lang });
    expect(answer.topicId).toBe(expectedTopic);
    expect(lang).toBe(expectedLang);
  });
});

describe("Frag Achim – Inhalte", () => {
  it("gibt keine offenen Projektdateien heraus", () => {
    expect(answerLocally("Bekomme ich die Projektdateien?", { lang: "de" }).text).toMatch(/^Nein/);
    expect(answerLocally("Do I get the project files?", { lang: "en" }).text).toMatch(/^No/);
  });

  it("beantwortet zwei Fragen in einer, hängt aber kein bloßes Fachgebiet an", () => {
    const both = answerLocally("Wie lange dauert ein Logo und was kostet es?", { lang: "de" });
    expect(both.topicId).toBe("duration");
    expect(both.text).toContain("Außerdem: Auf der Seite stehen keine Preise");
    expect(answerLocally("Wie teuer ist ein Logo?", { lang: "de" }).text).not.toContain("Außerdem");
  });

  it("nennt zwei Korrekturschleifen als Standard", () => {
    expect(answerLocally("Korrekturschleifen?", { lang: "de" }).text).toContain(
      "zwei Korrekturschleifen",
    );
    expect(answerLocally("revisions?", { lang: "en" }).text).toContain("two rounds of revisions");
  });

  it("jedes Thema hat Antworten auf Deutsch und Englisch", () => {
    for (const topic of topics) {
      expect(topic.de.a, topic.id).toBeTruthy();
      expect(topic.en.a, topic.id).toBeTruthy();
    }
  });

  it("alle Verweise zeigen auf existierende Themen", () => {
    const ids = new Set(topics.map((t) => t.id));
    for (const topic of topics)
      for (const id of topic.followUps) expect(ids.has(id), `${topic.id} → ${id}`).toBe(true);
    for (const id of [...defaultChips, ...intentTopics]) expect(ids.has(id), id).toBe(true);
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
});

/* ── Kundenprojekte (kommen später aus Sanity – hier feste Testdaten) ── */

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

describe("Frag Achim – Kundenprojekte", () => {
  const ask = (question: string, lang: Locale = "de") =>
    answerLocally(question, { lang, projects });

  it.each([
    ["Erzähl mir was über Gute Stube", "project:gute-stube"],
    ["Was hast du für Joeys Picknick gemacht?", "project:joeys-picknick"],
    ["Was ist LumaKeys?", "project:lumakeys"],
    ["Hast du schon mal ein Café gestaltet?", "project:gute-stube"],
    ["Hast du schon was für Gastronomie gemacht?", "industry:gastronomie"],
    ["Für welche Kunden hast du gearbeitet?", "work"],
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
    expect(getTopic("project:gute-stube", projects)?.de.label).toBe("Gute Stube Freisen");
  });

  it("Branche listet alle passenden Projekte", () => {
    const answer = ask("Have you done anything in gastronomy?", "en");
    expect(answer.text).toContain("Gute Stube Freisen");
    expect(answer.text).toContain("Joeys Picknick Mainz");
  });

  it("ohne Projekte bleibt alles beim Alten", () => {
    expect(answerLocally("Welche Projekte hast du gemacht?", { lang: "de" }).text).toContain(
      "[Projekte](/de/work)",
    );
  });
});
