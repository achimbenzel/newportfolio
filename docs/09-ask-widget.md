# 09 – „Frag Achim“ (Ask-Widget)

Das Chat-Widget ist das einzige Element im Hero der Startseite. Es beantwortet Fragen zu Leistungen,
Ablauf, Preisen, Projekten, Werdegang und Kontakt – auf **Deutsch und Englisch**.

Es ist **keine KI** und wird auch keine angebunden: Das Widget sucht in einer Wissensbasis die
passende Antwort. Dafür nutzt es ein paar Techniken, die es trotzdem „gesprächig“ wirken lassen
(gezielte Antworten, Gedächtnis, Rückfragen – siehe unten). Alles läuft **im Browser**, es werden
**keine Daten gesendet oder gespeichert**.

## Aufbau der Oberfläche

- Über dem Fenster eine **Begrüßung je nach Tageszeit** („Guten Morgen“, „Mahlzeit“,
  „Guten Abend“, „Noch so spät wach?“ …) plus eine Einladung („Wie kann ich dir helfen?“) –
  **zufällig** gewählt, nach dem Neuladen steht ggf. etwas anderes da. Die Uhrzeit gibt es erst im
  Browser, deshalb wird die Zeile nach dem Laden sanft eingeblendet. Läuft ein Gespräch, klappt sie
  weg; „Neuer Chat“ bringt sie zurück.
- Großes, dunkles Eingabefenster mit Neon-Glow (`--color-neon`), unten links „Achim · Assistent“
  mit Bildmarke, unten rechts der runde Senden-Button. `Enter` sendet, `Shift+Enter` = neue Zeile.
- Sobald gefragt wird, klappt der Verlauf **im selben Fenster über dem Eingabefeld** auf.
- Chat-Bubbles: Achims Antworten **links** (dunkle Bubble, Avatar = Bildmarke `LogoMark3D`),
  die Fragen der Besucher **rechts** (Petrol-Bubble).
- Darunter Vorschläge (passen sich nach jeder Antwort an), darüber „Neuer Chat“ / „Schließen“.

## Persönlichkeit

Der Bot ist **Achims Assistent**: freundlich, direkt und auf den Punkt – locker im Ton („du“,
kurze Sätze), aber professionell. Er ist ehrlich, wenn er etwas nicht weiß (→ verweist auf die
E-Mail), nutzt keine Floskeln und keine Emojis. Über sich spricht er in der 1. Person („ich“),
über Achim in der 3. Person. Antworten: 1–3 Sätze, lieber auf eine Seite verlinken.

Damit er nicht wie ein Automat wirkt, können Antworten **Varianten** haben (Liste statt Text) –
dann wird zufällig gewählt. Die Persönlichkeit steht auch oben in `knowledge.ts`; neue Texte bitte
in diesem Ton schreiben.

## Wie es funktioniert

```
Frage ──▶ aufbereiten ──▶ Themen bewerten ──▶ entscheiden ──▶ Antwort (+ Vorschläge)
          1. normalisieren   „Wie läuft's?“ → „wie lauft s“ (klein, ä = a, ß = ss)
          2. Synonyme        „honorar“, „kostet“, „how much“ … → „preis“
          3. Wortstamm       „Korrekturschleifen“ → „korrekturschleif“, „dauert“ → „dauer“
```

### Arten von Themen

| Art (`kind`) | Beispiele                                     | Rolle                                               |
| ------------ | --------------------------------------------- | --------------------------------------------------- |
| `smallTalk`  | Hallo, Wie geht's?, Danke, Hilfe, Erzähl mehr | nur, wenn sonst nichts sicher erkannt wurde         |
| `subject`    | Branding, Logo, Motion, Musik, 3D, Projekte   | **Fachgebiet** – worüber gesprochen wird            |
| `aspect`     | Dauer, Preis, Korrekturen, Ablauf, Kontakt …  | **Frage nach etwas** rund um ein Projekt – geht vor |
| `general`    | Über Achim, Alter, Programme, Hobbys …        | alles andere                                        |

### Die fünf „Intelligenz“-Bausteine

1. **Aspekt × Fachgebiet (Facetten)** – „Wie lange dauert eine Logo-Animation?“ ist eine Frage
   nach der _Dauer_ für das Fachgebiet _Logo-Animation_. Hat das Aspekt-Thema eine passende
   Facette (`facets.logoAnimation`), kommt die gezielte Antwort („ein bis zwei Wochen“). Sonst wird
   das übergeordnete Fachgebiet versucht (`parent`: 3D → Motion), zuletzt die allgemeine Antwort.
   Bei Projekten zählt die Kategorie: „Wie lange hat Gute Stube gedauert?“ → Branding-Dauer mit dem
   ehrlichen Hinweis „Wie das genau bei Gute Stube war, weiß ich nicht – allgemein gilt: …“.
2. **Gesprächsgedächtnis** – der Bot merkt sich das zuletzt besprochene Fachgebiet und den
   zuletzt gefragten Aspekt (nur im Arbeitsspeicher):
   - „Kannst du mein Logo animieren?“ → „Wie lange dauert **das**?“ → Dauer einer Logo-Animation
     (Bezugswörter: `referenceWords`; sehr kurze Fragen wie „Preise?“ zählen auch).
   - „Wie lange dauert Branding?“ → „**Und bei** Musik?“ → Dauer für Musik (`followUpStarters`).
   - Ein Vorschlag-Klick auf einen Aspekt nutzt ebenfalls das Gesprächsthema.
   - Allgemeine Themen („Wer bist du?“) beenden das Fachgebiet, Smalltalk nicht.
3. **Rückfragen & Unsicherheit** – passen zwei verschiedene Fachgebiete gleich gut („Cover oder
   Logo?“), fragt der Bot nach („Meinst du Logo-Design oder Musik-Visuals?“) und bietet beide als
   Vorschlag an – außer eins davon passt zum bisherigen Gespräch. Ist der Treffer zu schwach, rät er
   nicht, sondern schlägt die naheliegendsten Themen vor („Ich bin mir nicht ganz sicher …“).
4. **Automatische Wortgewichtung** – Wörter, die bei vielen Themen vorkommen, zählen weniger
   (IDF). Und: Ist ein Wort Teil eines längeren Ausdrucks eines anderen Themas, zählt es nur halb –
   „Wie lange machst du das **schon**?“ landet beim Werdegang, nicht bei der Projektdauer.
5. **Beispielfragen statt langer Stichwortlisten** – jedes Thema hat `examples` (DE + EN). Daraus
   werden zusätzliche Stichwörter abgeleitet (ohne Füllwörter und ohne Wörter, die einem anderen
   Thema gehören), und **jede Beispielfrage wird automatisch als Test geprüft**.

Weitere Regeln:

- **Sprache:** wird an typischen Wörtern erkannt (deutsche Frage auf `/en/` → deutsche Antwort);
  ist es unklar (z. B. nur „Logo?“), gilt die Sprache der Seite.
- **Zwei Fragen in einer** („Wie lange dauert es und was kostet es?“, „Wer bist du und was kostet
  ein Logo?“) → die zweite Antwort wird mit „Außerdem: …“ angehängt.
- **Berechnete Antworten:** `{age}` wird aus `profile.birthDate` (4. Oktober 2000) berechnet –
  das Alter stimmt also immer. `{birthdayNote}` ergänzt „– also heute!“, wenn Geburtstag ist.
  Hinweis: Das Geburtsdatum steht damit öffentlich im JavaScript der Website.
- Der Verlauf bleibt bei Navigation erhalten (Arbeitsspeicher), nach dem Neuladen ist er weg.

### So bewertet die Suche

| Treffer                                                          | Punkte      |
| ---------------------------------------------------------------- | ----------- |
| Mehrwort-Stichwort steckt in der Frage („wie viele änderungen“)  | 4           |
| Lücken-Ausdruck passt („wie läuft \* ab“, bis zu 3 Wörter Lücke) | 3           |
| Wort stimmt überein (nach Synonym & Wortstamm)                   | 3 × Gewicht |
| Teil eines zusammengesetzten Worts („logo“ in „markenlogo“)      | 2 × Gewicht |
| Tippfehler mit 1 Buchstaben Abweichung (ab 5 Zeichen)            | 2 × Gewicht |
| Wort aus einer Beispielfrage                                     | 2 × Gewicht |

Gewicht = 1, wenn nur ein Thema das Wort nutzt, sonst weniger (mind. 0,35); halbiert, wenn das Wort
Teil eines längeren Ausdrucks eines anderen Themas ist. Jedes Stichwort zählt pro Frage einmal.

Danach wird entschieden (Schwellen in `engine.ts`): Ein **sicherer** Treffer braucht mindestens ein
eingetragenes Stichwort und 2,4 Punkte. Aspekte gehen vor (außer ein allgemeines Thema passt klar
besser), Fachgebiete schlagen allgemeine Themen, unter 2 Punkten (oder nur ein einzelnes
Beispiel-Wort) gibt es Vorschläge statt einer geratenen Antwort.

## Dateien (`web/app/features/ask/`)

| Datei               | Inhalt                                                                            |
| ------------------- | --------------------------------------------------------------------------------- |
| `knowledge.ts`      | **Wissensbasis**: Persönlichkeit, Themen, Antworten DE/EN, Synonyme, Begrüßungen  |
| `knowledge.test.ts` | **Testfragen** + automatische Prüfung aller Beispielfragen (`npm test`)           |
| `engine.ts`         | Antwortlogik (Aufbereitung, Gewichtung, Entscheidung, Gedächtnis), Link-Parser    |
| `content.ts`        | macht aus Website-Inhalten (Projekte, Leistungen, Social) automatisch Chat-Wissen |
| `greeting.ts`       | Begrüßung je nach Tageszeit (zufällig, nur im Browser)                            |
| `store.ts`          | Chat-Zustand, Gesprächsgedächtnis, Tipp-Animation (im Arbeitsspeicher)            |
| `config.ts`         | Einstellungen (Tippgeschwindigkeit, optionales Backend)                           |
| `AskWidget.tsx`     | Oberfläche (`TimeGreeting.tsx` = Begrüßungszeile)                                 |

Dazu im Content-Layer: `web/app/content/ask.server.ts` (`getAskContent()`) sammelt beim Build alles,
was der Chat aus den Inhalten wissen soll.

## Wissen wächst automatisch mit der Website

Grundsatz: **Alles, was auf der Website als Wissen dazukommt, soll auch der Chat kennen – auf
Deutsch und Englisch.** Dafür gibt es zwei Wege:

| Wissen                                      | Weg                                                       | Pflege              |
| ------------------------------------------- | --------------------------------------------------------- | ------------------- |
| Inhalte aus dem CMS (Projekte, Leistungen)  | automatisch: `ask.server.ts` → `content.ts` → Chat-Themen | in Sanity           |
| Feste Fakten (Werdegang, Programme, Preise) | `knowledge.ts` (Thema mit Beispielfragen DE + EN)         | im Code, mit Claude |

**Bereits automatisch angebunden** (kein Eintrag in `knowledge.ts` nötig):

| Inhalt                     | Was der Chat daraus macht                                                         |
| -------------------------- | --------------------------------------------------------------------------------- |
| Projekte                   | eigenes Thema je Projekt, Projektliste (auch je Fachgebiet), Branchen-Themen      |
| Leistungsseiten            | Einleitung = Antwort zu Branding/Motion/Musik, Ablauf-Schritte = Antwort „Ablauf“ |
| Social-Profile (`site.ts`) | Antwort auf „Wie ist dein Instagram?“, sobald Profile eingetragen sind            |

**Neue Seite oder neue Inhaltsart, die Wissen enthält** (z. B. „Über mich“-Text, FAQ, Preise,
Testimonials) – immer mitdenken:

1. Daten in `content/ask.server.ts` holen (Typ in `content/types.ts` → `AskContent` erweitern).
2. In `features/ask/content.ts` in Themen übersetzen: eigene Themen erzeugen oder Antworten/
   Facetten fester Themen ersetzen (`applyContent`). Texte immer in beiden Sprachen.
3. Testfall in `knowledge.test.ts` (Abschnitt „Inhalte aus dem Content-Layer“).
4. Diese Tabelle hier ergänzen.

Für Claude gibt es dazu den Skill **`frag-achim-wissen`** (`.claude/skills/frag-achim-wissen/SKILL.md`),
der diese Schritte bei jeder inhaltlichen Änderung an der Website anstößt.

## Inhalte pflegen („trainieren“)

„Trainieren“ heißt: Themen, Beispielfragen und Synonyme in `knowledge.ts` ergänzen – und mit
`npm test` prüfen. Was dort steht, wird beim nächsten Build live.

### Ein Thema

```ts
{
  id: "duration",
  kind: "aspect",
  keywords: ["dauer", "wochen", "deadline"],               // eindeutige Suchbegriffe
  examples: {                                               // = zusätzliche Stichwörter + Tests
    de: ["Wie lange dauert ein Projekt?", "Wie schnell bist du fertig?"],
    en: ["How long does a project take?", "What's the turnaround?"],
  },
  followUps: ["price", "revisions", "process"],             // Vorschläge danach
  de: { label: "Dauer", q: "Wie lange dauert ein Projekt?", a: "Das hängt vom Projekt ab: …" },
  en: { label: "how long?", q: "How long does a project take?", a: "It depends on the project: …" },
  facets: {                                                 // nur bei Aspekten: je Fachgebiet
    logoAnimation: { de: "Eine Logo-Animation dauert …", en: "A logo animation usually takes …" },
  },
}
```

- `label` = Text des Vorschlag-Chips, `q` = Frage beim Klick, `a` = Antwort (Text oder Liste von
  Varianten). `followUps: []` = Vorschläge passend zum Gesprächsthema.
- Platzhalter: `{base}` → `/de` bzw. `/en`, `{email}` → Kontaktadresse, `{age}`, `{birthdayNote}`.
  Links als `[Text](url)`.
- `keywords` mit `*` = Lücke: `"wie läuft * ab"` passt auch auf „Wie läuft ein Branding-Projekt ab?“.

### Synonyme – damit andere Formulierungen automatisch klappen

Statt jedes Wort bei jedem Thema einzutragen, gibt es **Synonym-Gruppen** (`synonyms`). Alle
Wörter einer Gruppe gelten als gleich – in der Frage und in den Stichwörtern:

```ts
["preis", "kosten", "kostet", "honorar", "budget", "teuer", "price", "cost", "fee", "how much", …]
```

Ein neues Wort in die Gruppe → es funktioniert sofort bei **allen** Themen. Endungen,
Groß-/Kleinschreibung, Umlaute und Tippfehler mit einem falschen Buchstaben werden automatisch
angeglichen.

### Typische Aufgaben

1. **Eine Formulierung wird nicht erkannt** → als **Beispielfrage** beim richtigen Thema
   eintragen (DE und EN). Reicht das nicht: Bedeutet ein Wort dasselbe wie ein vorhandenes? →
   **Synonym-Gruppe**. Sonst → `keyword` (gern als Mehrwort- oder Lücken-Ausdruck).
2. **Falsches Thema gewinnt** → beim richtigen Thema einen Mehrwort-Ausdruck ergänzen
   (zählt stärker und „belegt“ die Wörter) oder beim falschen ein zu allgemeines Stichwort entfernen.
3. **Gezielte Antwort für ein Fachgebiet** („Dauer bei Musik“) → Facette beim Aspekt ergänzen.
4. **Neues Thema** → eindeutige `id`, passende `kind`, Beispielfragen + Antwort DE und EN,
   `followUps`. Startvorschlag? → `id` in `defaultChips`.
5. **Antwort ändern** → nur `a` anpassen, im Ton der Persönlichkeit, kurz (1–3 Sätze).

### Testen

```bash
npm test     # alle Testfragen + alle Beispielfragen (DE + EN) + Konsistenz der Wissensbasis
npm run dev  # → http://localhost:5173/de/ und selbst ausprobieren
```

Die Tests prüfen außerdem automatisch: jedes Thema hat Beispielfragen und Antworten in beiden
Sprachen (auch Varianten und Facetten), alle Verweise (`followUps`, `parent`, `facets`) zeigen auf
passende Themen, Vorschläge haben Beschriftungen, Synonym-Gruppen überschneiden sich nicht.

### Woher kommen neue Fragen?

Aus Gesprächen mit Kunden, E-Mails und Feedback. Das Widget speichert bewusst **nichts**
(Datenschutz). Eine Auswertung „welche Fragen wurden nicht erkannt?“ wäre technisch möglich,
braucht aber einen eigenen Server-Endpoint und einen Hinweis in der Datenschutzerklärung.

## Kundenprojekte im Chat

Projekte muss man **nicht** in `knowledge.ts` eintragen. Der Chat erzeugt sie automatisch aus
denselben Daten wie die Projektseiten (Sanity – bzw. bis dahin `web/app/content/fallback/projects.ts`):

| Frage (Beispiel)                                  | Antwort                                                     |
| ------------------------------------------------- | ----------------------------------------------------------- |
| „Erzähl mir von Gute Stube“ / „Was ist LumaKeys?“ | Titel, Kategorie, Jahr, Kurzbeschreibung + Link zum Projekt |
| „Welche Projekte/Kunden hattest du?“              | Liste der Projekte mit Links, Projekte als Vorschläge       |
| „Machst du Logos?“ → „Hast du Beispiele dafür?“   | nur die Logo-Projekte (Kategorie → Fachgebiet)              |
| „Hast du schon was für Gastronomie gemacht?“      | alle Projekte dieser Branche                                |
| „Hast du schon mal ein Café gestaltet?“           | Projekt mit dem Stichwort „Café“                            |
| „Wie lange hat Gute Stube gedauert?“              | Dauer fürs Fachgebiet des Projekts, mit ehrlichem Hinweis   |

**Neues Kundenprojekt hinzufügen:**

1. In Sanity ein Projekt anlegen: Titel, Kunde, Jahr, **Kategorie**, **Branche**, **Beschreibung**.
2. Optional im Feld **„Stichwörter für Frag Achim“** Begriffe ergänzen, unter denen Leute nach dem
   Projekt fragen könnten (Spitzname, Produkt, Ort, Art des Betriebs …).
3. Veröffentlichen → nach dem nächsten Build kennt der Chat das Projekt.

Die Kategorie wird über Muster in `content.ts` (`categorySubjects`) einem Fachgebiet zugeordnet
(„Logo Design“ → Logo, „Brand Identity“ → Branding, „Motion“ → Motion …).

## Optional: echte KI als Backend

Aktuell nicht geplant. `askConfig.endpoint` in `config.ts` könnte auf einen **eigenen** Endpoint
zeigen (z. B. `/api/ask`), der eine KI befragt. Erwartet `POST { lang, messages: [{ role, content }] }`
→ `{ reply }`. Fällt das Backend aus, antwortet das Widget automatisch wieder lokal.

**Wichtig vor dem Einschalten:** API-Schlüssel nur auf den Server; Fragen gehen dann an einen
KI-Anbieter → Datenschutzerklärung anpassen, ggf. Einwilligung, Anbieter mit EU-Verarbeitung bevorzugen.
