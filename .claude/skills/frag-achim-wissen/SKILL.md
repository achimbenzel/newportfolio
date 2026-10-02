---
name: frag-achim-wissen
description: Hält das Wissen des Chat-Widgets „Frag Achim“ aktuell. Verwenden, sobald auf der Website Wissen dazukommt oder sich ändert – neue Seite, neue Inhaltsart in Sanity/Content-Layer, neue Fakten über Achim (Leistungen, Preise, Werdegang, Programme …), geänderte Texte – oder wenn der Chat eine Frage falsch/nicht beantwortet.
---

# Wissen für „Frag Achim“ pflegen

Grundsatz: **Alles, was auf der Website als Wissen dazukommt, muss auch der Chat kennen – auf
Deutsch UND Englisch.** Der Bot ist keine KI; er kennt nur, was in seiner Wissensbasis steht.
Ausführliche Doku: `docs/09-ask-widget.md`.

## 1. Woher kommt das neue Wissen?

| Fall                                                                       | Wohin                                                                                     |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Inhalt aus dem CMS / Content-Layer (Projekte, Leistungen, neue Inhaltsart) | automatisch anbinden: `web/app/content/ask.server.ts` → `web/app/features/ask/content.ts` |
| fester Fakt über Achim oder die Zusammenarbeit                             | Thema in `web/app/features/ask/knowledge.ts`                                              |
| neue Formulierung für bekanntes Wissen                                     | Beispielfrage (`examples`) bzw. Synonym in `knowledge.ts`                                 |

Bevorzuge die automatische Anbindung: Wenn Achim den Inhalt später in Sanity ändert, soll der Chat
ohne Code-Änderung mitwachsen. Texte, die auf der Website stehen, nicht zusätzlich in
`knowledge.ts` duplizieren.

## 2. Inhalt automatisch anbinden (Content-Layer)

1. `content/types.ts`: Typ ergänzen und in `AskContent` aufnehmen (beide Sprachen: `Record<"de" | "en", …>`).
2. `content/ask.server.ts`: Daten in `getAskContent()` holen – über die vorhandenen
   `content/*.server.ts`-Funktionen, nie direkt Sanity (Regel A.2/A.3). Lange Texte mit
   `summarize()` kürzen (landet im Browser-Bundle der Startseite).
3. `features/ask/content.ts`: in Themen übersetzen –
   - eigene Themen erzeugen (wie Projekte: `kind: "subject"`, `keywords` aus Titeln/Namen), oder
   - Antworten/Facetten fester Themen ersetzen (`applyContent`, wie Leistungen → `process`).
     Feste Satzbausteine als Vorlage in `askTexts` (DE + EN), nicht im Code.
4. Test im Abschnitt „Inhalte aus dem Content-Layer“ in `knowledge.test.ts`.
5. Tabelle „Bereits automatisch angebunden“ in `docs/09-ask-widget.md` ergänzen.

## 3. Festes Wissen als Thema (`knowledge.ts`)

- Passende `kind` wählen: `subject` (Fachgebiet), `aspect` (Frage nach etwas rund um ein Projekt:
  Dauer, Preis …), `general` (alles andere), `smallTalk`.
- Mindestens **zwei Beispielfragen pro Sprache** (`examples.de`, `examples.en`) – sie liefern
  Stichwörter und werden automatisch getestet. Wenige eindeutige `keywords`, Mehrwort-Ausdrücke
  bevorzugen, `*` für Lücken („wie läuft * ab“). Synonyme in `synonyms`, nicht in `keywords`.
- Antworten `de.a` und `en.a` im Ton der **Persönlichkeit** (Kopf von `knowledge.ts`): als Achim
  in der **Ich-Form**, duzen, freundlich, direkt, professionell, 1–3 Sätze, keine Emojis, ehrlich →
  bei Unklarem auf `{email}` verweisen. Gern Varianten als Liste.
- Kontaktdaten/Profile nie abtippen, sondern Platzhalter nutzen (`{email}`, `{whatsapp}`,
  `{socials}`, `{social:behance}` – Werte in `web/app/config/site.ts`).
- Gibt es je Fachgebiet eine andere Antwort? → `facets` beim Aspekt.
- `label` + `q` setzen, wenn das Thema als Vorschlag (Chip) auftauchen kann.
- Werte, die sich ändern (Alter …), nie fest eintragen, sondern berechnen (`profile`, Platzhalter).
- **Nichts erfinden:** keine Preise, Termine, Kunden oder Leistungen, die Achim nicht genannt hat.

## 4. Prüfen

```bash
npm test          # alle Test- und Beispielfragen DE + EN
npm run check     # vor dem Commit (Format, Lint, Typen, Tests, Build)
```

Schlägt eine Beispielfrage fehl: zuerst Synonym oder Mehrwort-Ausdruck ergänzen, nicht die
Schwellenwerte in `engine.ts` verändern. Vorsicht bei kurzen Stichwörtern (≤ 4 Zeichen) – sie
treffen auch Wortteile („spiel“ in „Beispiel“).
