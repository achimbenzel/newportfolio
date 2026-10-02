# 09 – „Frag Achim“ (Ask-Widget)

Das Chat-Widget ist das einzige Element im Hero der Startseite. Es beantwortet Fragen zu Leistungen,
Ablauf, Preisen, Werdegang und Kontakt – auf **Deutsch und Englisch**.

## Aufbau der Oberfläche

- Großes, dunkles Eingabefenster mit Neon-Glow (`--color-neon`), unten links „Achim · Assistent“
  mit Bildmarke, unten rechts der runde Senden-Button. `Enter` sendet, `Shift+Enter` = neue Zeile.
- Sobald gefragt wird, klappt der Verlauf **im selben Fenster über dem Eingabefeld** auf.
- Chat-Bubbles: Achims Antworten **links** (dunkle Bubble, Avatar = Bildmarke `LogoMark3D`),
  die Fragen der Besucher **rechts** (Petrol-Bubble).
- Darunter Vorschläge (passen sich nach jeder Antwort an), darüber „Neuer Chat“ / „Schließen“.

## Wie es funktioniert

```
Frage ──▶ aufbereiten ──▶ Themen bewerten ──▶ Antwort (+ Vorschläge)
          1. normalisieren   „Wie läuft's?“ → „wie lauft s“ (klein, ä = a, ß = ss)
          2. Synonyme        „honorar“, „kostet“, „how much“ … → „preis“
          3. Wortstamm       „Korrekturschleifen“ → „korrekturschleif“, „dauert“ → „dauer“
```

- **Sprache:** wird an typischen Wörtern erkannt (deutsche Frage auf `/en/` → deutsche Antwort);
  ist es unklar (z. B. nur „Logo?“), gilt die Sprache der Seite.
- **Smalltalk** („Hallo“, „Wie geht's?“, „Danke“, „Tschüss“) wird beantwortet – aber nur,
  wenn sonst nichts gefragt wurde. „Hallo, was kostet ein Logo?“ → Antwort zum Preis.
- **Aspekt-Fragen** (Dauer, Preis, Korrekturen, Ablauf …) gehen vor: „Wie lange dauert eine
  Logo-Animation?“ beantwortet die Dauer, nicht „Motion Design“.
- **Zwei Fragen in einer** („Wie lange dauert es und was kostet es?“) → zweite Antwort wird
  mit „Außerdem: …“ angehängt.
- Läuft **komplett im Browser**, es werden **keine Daten gesendet oder gespeichert**. Der Verlauf
  bleibt bei Navigation erhalten (Arbeitsspeicher), nach dem Neuladen ist er weg.

## Dateien (`web/app/features/ask/`)

| Datei               | Inhalt                                                                           |
| ------------------- | -------------------------------------------------------------------------------- |
| `knowledge.ts`      | **Wissensbasis**: Themen, Antworten DE/EN, Synonyme, Sprach-Hinweiswörter        |
| `knowledge.test.ts` | **Testfragen** – prüft mit `npm test`, ob jede Frage beim richtigen Thema landet |
| `engine.ts`         | Antwortlogik (Aufbereitung, Bewertung, Sprache), Link-Parser                     |
| `store.ts`          | Chat-Zustand + Tipp-Animation (im Arbeitsspeicher)                               |
| `config.ts`         | Einstellungen (Tippgeschwindigkeit, optionales Backend)                          |
| `AskWidget.tsx`     | Oberfläche                                                                       |

## Inhalte pflegen („trainieren“)

Das Widget ist **keine trainierte KI**. „Trainieren“ heißt: Themen, Stichwörter und Synonyme in
`knowledge.ts` ergänzen – und mit Testfragen absichern. Was dort steht, wird beim nächsten Build live.

### Ein Thema

```ts
{
  id: "revisions",
  keywords: ["korrektur", "wie viele änderungen", "how many changes"], // DE + EN
  followUps: ["duration", "price", "process"],                          // Vorschläge danach
  de: { label: "Korrekturschleifen", q: "Wie viele Korrekturschleifen …?", a: "Das hängt vom Projekt ab. …" },
  en: { label: "revisions", q: "How many rounds of revisions …?", a: "That depends on the project. …" },
}
```

- `label` = Text des Vorschlag-Chips, `q` = Frage beim Klick, `a` = Antwort.
- In Antworten: `{base}` → `/de` bzw. `/en`, `{email}` → Kontaktadresse, Links als `[Text](url)`.
- `smallTalk: true` für Begrüßung & Co. (verliert immer gegen ein echtes Thema).

### Synonyme – damit andere Formulierungen automatisch klappen

Statt jedes Wort bei jedem Thema einzutragen, gibt es **Synonym-Gruppen** (`synonyms` in
`knowledge.ts`). Alle Wörter einer Gruppe gelten als gleich – in der Frage und in den Stichwörtern:

```ts
["preis", "kosten", "kostet", "honorar", "budget", "teuer", "price", "cost", "fee", "how much", …]
```

Ein neues Wort in die Gruppe → es funktioniert sofort bei **allen** Themen, die „preis“ als
Stichwort haben. Endungen (Plural, „dauert“/„dauern“), Groß-/Kleinschreibung und Umlaute
(„uberarbeiten“ = „überarbeiten“) werden automatisch angeglichen, Tippfehler mit einem
falschen Buchstaben ebenso.

### So bewertet die Suche

| Treffer                                                         | Punkte |
| --------------------------------------------------------------- | ------ |
| Mehrwort-Stichwort steckt in der Frage („wie viele änderungen“) | 4      |
| Wort stimmt überein (nach Synonym & Wortstamm)                  | 3      |
| Teil eines zusammengesetzten Worts („logo“ in „markenlogo“)     | 2      |
| Tippfehler mit 1 Buchstaben Abweichung (ab 5 Zeichen)           | 2      |
| Bonus für Aspekt-Themen (`intentTopics`)                        | +3     |

Jedes Stichwort zählt pro Frage höchstens einmal.

### Typische Aufgaben

1. **Eine Formulierung wird nicht erkannt** → zuerst als Testfall in `knowledge.test.ts` eintragen.
   Dann: Bedeutet das Wort dasselbe wie ein vorhandenes? → in die passende **Synonym-Gruppe**.
   Sonst → als `keyword` beim Thema ergänzen. Immer **DE und EN** mitdenken.
2. **Falsches Thema gewinnt** → beim richtigen Thema einen Mehrwort-Ausdruck ergänzen
   (zählt stärker) oder beim falschen Thema ein zu allgemeines Stichwort entfernen.
3. **Neues Thema** → Eintrag mit eindeutiger `id`, Antwort auf DE und EN, `followUps` setzen.
   Startvorschlag? → `id` in `defaultChips`. Fragt es nach einem Aspekt (Dauer, Preis …)? → `intentTopics`.
4. **Antwort ändern** → nur `a` anpassen. Kurz halten (1–4 Sätze), lieber auf eine Seite verlinken.

### Testen

```bash
npm test     # prüft alle Testfragen (DE + EN) und die Konsistenz der Wissensbasis
npm run dev  # → http://localhost:5173/de/ und selbst ausprobieren
```

Die Tests prüfen außerdem automatisch: jedes Thema hat DE- und EN-Antworten, alle Vorschläge
existieren und haben Beschriftungen, Synonym-Gruppen überschneiden sich nicht.

### Woher kommen neue Fragen?

Aus Gesprächen mit Kunden, E-Mails und Feedback. Das Widget speichert bewusst **nichts**
(Datenschutz). Eine Auswertung „welche Fragen wurden nicht erkannt?“ wäre technisch möglich,
braucht aber einen eigenen Server-Endpoint und einen Hinweis in der Datenschutzerklärung.

## Optional: echte KI als Backend

`askConfig.endpoint` in `config.ts` kann auf einen **eigenen** Endpoint zeigen (z. B. `/api/ask`),
der eine KI befragt. Erwartet `POST { lang, messages: [{ role, content }] }` → `{ reply }`.
Fällt das Backend aus, antwortet das Widget automatisch wieder lokal.

**Wichtig vor dem Einschalten:**

- Der API-Schlüssel gehört **nur** auf den Server, nie in den Website-Code.
- Fragen werden dann an einen KI-Anbieter übertragen → Datenschutzerklärung anpassen, ggf.
  Einwilligung einholen, Anbieter mit EU-Verarbeitung/AV-Vertrag bevorzugen.
- Systemprompt-Vorschlag (aus dem Entwurf): nur Fragen zu Achims Arbeit beantworten, in der Sprache
  der Frage, unter 80 Wörtern, keine erfundenen Preise/Termine/Kunden – stattdessen auf die E-Mail verweisen.
