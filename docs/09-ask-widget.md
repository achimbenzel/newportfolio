# 09 – „Frag Achim“ (Ask-Widget)

Das Chat-Widget ist das einzige Element im Hero der Startseite. Es beantwortet Fragen zu Leistungen,
Ablauf, Preisen, Werdegang und Kontakt – auf **Deutsch und Englisch**.

## Aufbau der Oberfläche

- Großes, dunkles Eingabefenster mit Neon-Glow (`--color-neon`), unten links „Achim · Assistent“
  mit Bildmarke, unten rechts der runde Senden-Button. `Enter` sendet, `Shift+Enter` = neue Zeile.
- Sobald gefragt wird, klappt der Verlauf **im selben Fenster über dem Eingabefeld** auf.
  Achims Avatar ist die Bildmarke (`LogoMark3D`).
- Darunter Vorschläge (passen sich nach jeder Antwort an), darüber „Neuer Chat“ / „Schließen“.

## Wie es funktioniert

```
Frage ──▶ engine.ts: Stichwortsuche über knowledge.ts ──▶ Antwort (+ Vorschläge)
            • unscharfe Treffer (Tippfehler, Plural)
            • Sprache der Frage wird erkannt (deutsche Frage auf /en/ → deutsche Antwort)
            • „Aspekt“-Themen (Dauer, Preis …) schlagen Fachthemen (Branding …)
            • nichts gefunden → Hinweis auf E-Mail
```

- Läuft **komplett im Browser**, es werden **keine Daten gesendet oder gespeichert**.
- Der Verlauf bleibt bei Navigation innerhalb der Website erhalten (Arbeitsspeicher), nach dem
  Neuladen ist er weg – dadurch kein Cookie/Storage, kein Consent nötig.
- Links in Antworten: interne Links navigieren ohne Neuladen, Mail-Links öffnen das Mailprogramm.

## Dateien (`web/app/features/ask/`)

| Datei           | Inhalt                                                            |
| --------------- | ----------------------------------------------------------------- |
| `knowledge.ts`  | **Wissensbasis**: Themen, Stichwörter, Antworten DE/EN, Begrüßung |
| `engine.ts`     | Antwortlogik (reine Funktionen), Link-Parser                      |
| `store.ts`      | Chat-Zustand + Tipp-Animation (im Arbeitsspeicher)                |
| `config.ts`     | Einstellungen (Tippgeschwindigkeit, optionales Backend)           |
| `AskWidget.tsx` | Oberfläche                                                        |

## Inhalte pflegen

> Die aktuellen Inhalte stammen aus dem Widget-Entwurf und sind **vorläufig**.

Ein Thema in `knowledge.ts`:

```ts
{
  id: "duration",
  keywords: ["how long", "dauer", "wie lange", "wochen"],   // DE + EN, klein geschrieben
  followUps: ["price", "process", "contact"],               // Vorschläge danach
  de: { label: "Dauer", q: "Wie lange dauert ein Projekt?", a: "Eine Markenidentität dauert …" },
  en: { label: "how long?", q: "How long does a project take?", a: "A brand identity usually …" },
}
```

- `label` = Text des Vorschlag-Chips, `q` = Frage beim Klick, `a` = Antwort.
- In Antworten: `{base}` → `/de` bzw. `/en`, `{email}` → Kontaktadresse, Links als `[Text](url)`.
- Mehrwort-Stichwörter („wie lange“) zählen stärker als einzelne Wörter.
- Nach Änderungen: ein paar typische Fragen auf DE und EN durchtesten.

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
