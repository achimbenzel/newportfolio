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
- Großes, fast deckend weißes Fenster mit breitem, durchscheinendem Glas-Rahmen auf dem
  Hintergrundfoto, unten links „Achim · Assistent“ mit Bildmarke, unten rechts der runde
  Senden-Button. `Enter` sendet, `Shift+Enter` = neue Zeile.
- Sobald gefragt wird, klappt der Verlauf **im selben Fenster über dem Eingabefeld** auf.
- Chat-Bubbles: Achims Antworten **links** (dunkle Bubble, Avatar = Bildmarke `LogoMark3D`),
  die Fragen der Besucher **rechts** (Petrol-Bubble).
- **Vorschläge im Fenster:** vor dem ersten Gespräch als Zeile unter dem Eingabefeld, danach unter
  der jeweils letzten Antwort (passen sich an). Fragt der Bot zurück („Meinst du …?“) oder ist er
  unsicher, stehen die Auswahlmöglichkeiten als klickbare Liste direkt unter seiner Nachricht.
  Stellt er eine Ja/Nein-Frage, gibt es Buttons dafür („Ja, gern“ hervorgehoben, „Nein, danke“).
- Über dem Fenster „Neuer Chat“ / „Schließen“, sobald es einen Verlauf gibt.

## Persönlichkeit

Der Bot spricht **als Achim in der Ich-Form** und **duzt**: freundlich, direkt und auf den Punkt –
locker im Ton, aber professionell. Er ist ehrlich, wenn er etwas nicht weiß (→ andere Frage oder
E-Mail), nutzt keine Floskeln und keine Emojis. Antworten: 1–3 Sätze, lieber auf eine Seite verlinken.

**Transparenz mit Augenzwinkern:** Die Oberfläche zeigt „Achim · Assistent“. Auf „Bist du eine
KI?“ kontert er erst mit einer Gegenfrage („Gegenfrage: Bist du eine?“) und sagt dann ehrlich, dass
hier ein kleines Programm in Achims Namen antwortet. Für „Bist du ein Bot?“ und „Bist du ein
Mensch?“ gibt es passende Varianten („Bist du einer?“) – Themen `bot`, `robot`, `human`. Auf die
Gegenfrage kann man mit „Ja, erwischt“ / „Nein, bin ein Mensch“ antworten (`visitorAi`,
`visitorHuman`).

**Verkaufen, ohne aufdringlich zu sein:** Wer mit dem Bot schreibt, soll merken, dass Achim der
Richtige für den Job ist – siehe [„Kannst du XY designen?“](#kannst-du-xy-designen--verkaufen).

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

### Die „Intelligenz“-Bausteine

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
6. **Anfrage-Absicht & Leistungskatalog** – „Kannst du …?“, „Ich brauche …“, „Can you …?“ werden
   als Anfrage erkannt (nicht nach einem Fragewort wie „Was kannst du …?“ und nicht bei „Kannst du
   mir sagen/zeigen …“). Dann sucht der Bot das gemeinte Ding im Leistungskatalog – auch mehrere
   auf einmal („Logo und Visitenkarten“) – und antwortet mit Ja / teilweise / kommt drauf an / Nein.
   Details unten.

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
| Tippfehler: 1 Buchstabe anders oder Dreher (ab 5 Zeichen)        | 2 × Gewicht |
| Wort aus einer Beispielfrage                                     | 2 × Gewicht |

Gewicht = 1, wenn nur ein Thema das Wort nutzt, sonst weniger (mind. 0,35); halbiert, wenn das Wort
Teil eines längeren Ausdrucks eines anderen Themas ist. Jedes Stichwort zählt pro Frage einmal.

Danach wird entschieden (Schwellen in `engine.ts`): Ein **sicherer** Treffer braucht mindestens ein
eingetragenes Stichwort und 2,4 Punkte. Aspekte gehen vor (außer ein allgemeines Thema passt klar
besser), Fachgebiete schlagen allgemeine Themen, unter 2 Punkten (oder nur ein einzelnes
Beispiel-Wort) gibt es Vorschläge statt einer geratenen Antwort.

## Gespräch & Extras

### Ja/Nein und Auswahl

- Ein Thema kann am Ende eine **Ja/Nein-Frage** stellen (`offer` in `knowledge.ts`): „Reist du
  gern?“ → „… Möchtest du ein paar Bilder sehen?“ → „Ja, gerne“ zeigt die Galerie. Auch Kontakt,
  Leistungen, Preise, „Warum du?“ („Wollen wir über dein Projekt sprechen?“) und Off-Topic-Fragen
  bieten etwas an. „Nein“ wird freundlich beantwortet.
- Unter der Frage stehen Buttons „Ja, gern“ / „Nein, danke“ (eigene Beschriftung: `offer.replies`).
  Mit `offer.no` gibt es auch auf „Nein“ eine eigene Antwort (Beispiel: KI-Gegenfrage). Steht die
  Frage schon in der Antwort selbst, bleibt der Text in `offer.de`/`offer.en` weg.
- Nach einer **Rückfrage oder Vorschlagsliste** versteht der Bot „das erste“, „Nummer zwei“,
  „the last one“ usw.
- Angebote gelten nur für die direkt folgende Nachricht. Wörter dafür: `replyWords` in `knowledge.ts`.

### „Kannst du XY designen?“ – Verkaufen

Der **Leistungskatalog** `deliverables` in `knowledge.ts` listet Dinge, nach denen Leute fragen –
mit Status und passendem Thema:

| Status   | Beispiel                      | Antwort                                                                                                     |
| -------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `yes`    | Logo, T-Shirt, Flyer, Reels   | „Ja – …“ + kurzes Argument + „Soll ich dir helfen, eine Anfrage vorzubereiten?“                             |
| `partly` | App programmieren, live VJ    | eigene Antwort („nicht selbst – aber das UI/UX-Design“) + Angebot                                           |
| `maybe`  | Tattoo, Buchcover, Icons      | „Das ist nicht mein Schwerpunkt – ob es passt, hängt vom Projekt ab.“ + „Magst du mir kurz davon erzählen?“ |
| `no`     | Onlineshop, Fotografie, Druck | ehrliche Antwort mit Alternative, ohne Verkaufsfrage                                                        |

- **Mehrere Dinge:** „Kannst du Flyer gestalten und drucken?“ → „Poster & Flyer? Na klar …
  Drucken lasse ich selbst nichts – druckfertige Dateien bekommst du aber …“.
- **Genauere Treffer gewinnen:** „Buchcover“ vor „Cover“, „Logo-Animation“ vor „Logo“.
- **Unbekanntes Ding** mit Gestaltungs-Verb („Kannst du mir eine Hundehütte designen?“) →
  „„Hundehütte“ steht so nicht auf meiner Liste – mein Schwerpunkt sind …“ + Angebot.
- **Kurzes Argument** (`askTexts.sales.pitch`: direkter Kontakt, über 50 Kunden, kostenloses
  Erstgespräch) höchstens **einmal pro Gespräch** und nur, wenn die Antwort kurz ist.
- **„Ja“** startet die geführte Anfrage **mit dem Projekt schon eingetragen** („Super! Für dein
  Projekt (Merch) brauche ich nur noch zwei, drei Angaben …“). „Ja, ein Logo“ auf „Hast du schon
  ein Projekt im Kopf?“ trägt das Logo ebenfalls ein.
- Eine klare Frage **nach** etwas geht vor: „Kannst du ein Logo bis morgen machen?“ → Eilaufträge,
  „Ich brauche ein Logo – was kostet das?“ → Preis.
- **Verkaufsthemen** mit Angebot einer Anfrage: „Warum du?“ (`whyMe`), „Bist du der Richtige für
  mein Projekt?“ (`fit`), „Das ist mir zu teuer“ (`lowBudget`), „Vorteil gegenüber einer Agentur?“
  (`vsAgency`), Leistungen, Preise.
- **Nichts erfinden:** Was Achim nicht ausdrücklich anbietet, kommt als `maybe` in den Katalog.
- Logik: `capability.ts` (Erkennung), `engine.ts` (`answerCapability`, `sell`).

### Geführte Anfrage („Projekt anfragen“)

Chip „Projekt anfragen“, Sätze wie „Ich möchte dich buchen“ oder „Ja“ auf das Angebot beim Kontakt
starten drei kurze Fragen – **Art des Projekts, Zeitraum, Budget** – plus optional eine kurze
Beschreibung. Antwortmöglichkeiten gibt es zum Anklicken, frei tippen geht immer.

- Am Ende steht eine fertige Nachricht als **E-Mail- und WhatsApp-Link** (ein Klick, die Website
  speichert und verschickt nichts).
- Budget unter 300 € → Hinweis „ab 300 €“; ab 750 € → Hinweis auf den Call (Grenzen: `profile`).
- „Abbrechen“ beendet die Anfrage; eine Zwischenfrage („Wie lange dauert das?“) wird beantwortet,
  danach geht es mit der Anfrage weiter.
- Ist das Projekt schon bekannt („Kannst du ein T-Shirt designen?“ → „Ja“), entfällt die erste
  Frage (`askTexts[lang].inquiry.prefilled`).
- Texte und Antwortmöglichkeiten: `askTexts[lang].inquiry`, Ablauf: `inquiry.ts`.

### Suche in den Website-Texten

Passt kein Thema sicher, durchsucht der Bot die Texte der Website (Projektbeschreibungen,
Leistungsseiten inkl. Ablauf-Texten) und antwortet mit einem kurzen Ausschnitt + Link:
„Wer ist Kiara Balling?“ → Ausschnitt aus dem Projekt Gute Stube. Seltene Wörter (z. B. Namen)
zählen mehr. Neue Inhalte sind automatisch dabei (`search.ts`).

### Bildergalerien

Antworten können eine Galerie zeigen (`gallery` am Thema, Beispiel: `japanPhotos`). Vorschaubilder
erscheinen unter der Antwort, ein Klick öffnet die **Vergrößerung** (Pfeiltasten, Wischen,
`Esc`). Bilder liegen auf dem eigenen Server (keine Anfragen an Dritte).

Neue Fotos: siehe [10-anleitungen.md → Fotos für den Chat](10-anleitungen.md#fotos-für-den-chat).

### Unbeantwortete Fragen sammeln (optional, standardmäßig aus)

Fragen, bei denen der Bot passen musste (fallback, unsure, offTopic), können **anonym an den
eigenen Server** gehen – damit die Wissensbasis mit echten Fragen wächst.

- Browser: `log.ts` – E-Mail-Adressen, Telefonnummern und Links werden vorher unkenntlich gemacht,
  gesendet werden nur Frage, Sprache und Art der Antwort.
- Server: `deploy/ask-log/server.mjs` (kleiner Node-Dienst, keine Pakete) speichert je Zeile Datum
  (ohne Uhrzeit), Sprache, Art und Frage – keine IP. nginx leitet `/api/ask-log` weiter.
- Auswerten: `npm run ask:report -- deploy/data/ask-log.jsonl` → häufigste Fragen zuerst; dann als
  Beispielfragen eintragen (am besten mit Claude und dem Skill `frag-achim-wissen`).
- **Einschalten:** `logEndpoint: "/api/ask-log"` in `config.ts` – erst wenn der Dienst läuft
  (`deploy/docker-compose.yml`) **und** die Datenschutzerklärung den Abschnitt enthält
  ([06-datenschutz.md](06-datenschutz.md#chat-unbeantwortete-fragen-optional)).

## Dateien (`web/app/features/ask/`)

| Datei               | Inhalt                                                                           |
| ------------------- | -------------------------------------------------------------------------------- |
| `knowledge.ts`      | **Wissensbasis**: Persönlichkeit, Themen, Antworten DE/EN, Synonyme, Begrüßungen |
| `knowledge.test.ts` | **Testfragen** + automatische Prüfung aller Beispielfragen (`npm test`)          |
| `engine.ts`         | Antwortlogik (Aufbereitung, Gewichtung, Entscheidung, Gedächtnis), Link-Parser   |
| `content.ts`        | macht aus Website-Inhalten (Projekte, Leistungen) automatisch Chat-Wissen        |
| `text.ts`           | Textaufbereitung: Normalisieren, Synonyme, Wortstamm, Tippfehler                 |
| `capability.ts`     | „Kannst du XY?“: Anfrage-Absicht + Leistungskatalog durchsuchen                  |
| `inquiry.ts`        | geführte Anfrage (Fragen → fertige E-Mail/WhatsApp-Nachricht)                    |
| `search.ts`         | Suche in den Website-Texten (letzte Rettung vor „weiß ich nicht“)                |
| `log.ts`            | unbeantwortete Fragen anonym an den eigenen Server (optional, standardmäßig aus) |
| `galleries.ts`      | Bildergalerien + Alternativtexte DE/EN (`photos.generated.ts` = Dateiliste)      |
| `greeting.ts`       | Begrüßung je nach Tageszeit (zufällig, nur im Browser)                           |
| `store.ts`          | Chat-Zustand, Gesprächsgedächtnis, Tipp-Animation (im Arbeitsspeicher)           |
| `config.ts`         | Einstellungen (Tippgeschwindigkeit, optionales Backend)                          |
| `AskWidget.tsx`     | Oberfläche (`TimeGreeting`, `ChatGallery`, `Lightbox` = Teilkomponenten)         |

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

| Inhalt                   | Was der Chat daraus macht                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| Projekte                 | eigenes Thema je Projekt, Projektliste (auch je Fachgebiet), Branchen-Themen              |
| Leistungsseiten          | Einleitung = Antwort zu Branding/Motion/Musik, Ablauf-Schritte = „Wie läuft Branding ab?“ |
| Social-Profile, WhatsApp | aus `config/site.ts` über Platzhalter (`{socials}`, `{social:behance}`, `{whatsapp}`)     |

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
- Platzhalter: `{base}` → `/de` bzw. `/en`, `{email}` → E-Mail, `{age}`, `{birthdayNote}`,
  `{whatsapp}` / `{whatsappLink}`, `{socials}` (alle Profile als Links), `{social:instagram}`
  (ein Profil). Kontaktdaten stehen nur in `config/site.ts` – nie direkt in Antworten tippen.
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

**Tippfehler** werden zweifach abgefangen: bei Stichwörtern (ab 5 Buchstaben) und bei allen
Synonymen (ab 6 Buchstaben, z. B. „kontatkieren“ → Kontakt). Ein falscher, fehlender oder
zusätzlicher Buchstabe oder zwei vertauschte Buchstaben zählen als ein Fehler. Eingetragene
Stichwörter gelten nie als Tippfehler eines anderen Worts („Schnitt“ bleibt „Schnitt“).

Kürzt der Wortstamm ein Wort falsch (z. B. „Poster“ → „post“ wie ein Social-Media-Post), hilft ein
Eintrag in `stemExceptions`.

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
6. **„Kannst du XY?“ wird nicht verstanden** → Ding in `deliverables` eintragen (passender
   Status, Thema, Begriffe DE + EN, Bezeichnung). Nur was Achim anbietet als `yes`, Unklares als
   `maybe`. Der Test prüft, dass jeder Begriff seinen Eintrag findet.

### Testen

```bash
npm test     # alle Testfragen + alle Beispielfragen (DE + EN) + Konsistenz der Wissensbasis
npm run dev  # → http://localhost:5173/de/ und selbst ausprobieren
```

Die Tests prüfen außerdem automatisch: jedes Thema hat Beispielfragen und Antworten in beiden
Sprachen (auch Varianten und Facetten), alle Verweise (`followUps`, `parent`, `facets`) zeigen auf
passende Themen, Vorschläge haben Beschriftungen, Synonym-Gruppen überschneiden sich nicht.

### Woher kommen neue Fragen?

Aus Gesprächen mit Kunden, E-Mails und Feedback – und, sobald eingeschaltet, aus dem Protokoll
unbeantworteter Fragen (siehe oben, `npm run ask:report`). Ohne dieses Protokoll speichert das
Widget **nichts**.

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
