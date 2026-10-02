# 04 – Inhalte & Sanity

## Grundprinzip

- **Sanity Studio** (Ordner `studio/`) ist der Ort, an dem Inhalte gepflegt werden – im Browser, ohne Skripte.
- Die Website holt Inhalte **nur beim Build**. Nach dem Veröffentlichen in Sanity muss die Website
  neu gebaut werden (später automatisch per Webhook, siehe [08-roadmap.md](08-roadmap.md)).
- Solange `SANITY_PROJECT_ID` leer ist, nutzt die Website die Platzhalter aus
  `web/app/content/fallback/` – so läuft der Prototyp ohne Konto.

## Einrichtung (einmalig)

1. Sanity-Projekt anlegen: <https://www.sanity.io/manage> → Projekt-ID notieren.
2. `studio/.env.example` → `studio/.env` kopieren, `SANITY_STUDIO_PROJECT_ID` eintragen.
3. `web/.env.example` → `web/.env` kopieren, `SANITY_PROJECT_ID` eintragen.
4. In Sanity unter **API → CORS origins** `http://localhost:3333` erlauben.
5. `npm run studio` → <http://localhost:3333>

Studio online stellen (optional): `npm run studio:deploy` → `https://<host>.sanity.studio`.

## Content-Modell (Entwurf v0)

> Das Projekt-Schema ist ein **erster Entwurf** auf Basis der alten `project.json`-Dateien. Wie Projekte
> genau angelegt werden, wird im nächsten Schritt finalisiert.

| Dokumenttyp    | Zweck                                                     | Datei                                          |
| -------------- | --------------------------------------------------------- | ---------------------------------------------- |
| `project`      | Portfolio-Projekt                                         | `studio/schemaTypes/documents/project.ts`      |
| `service`      | Text einer Leistungsseite (3 feste Seiten)                | `studio/schemaTypes/documents/service.ts`      |
| `siteSettings` | E-Mail, Social-Profile, Standard-Vorschaubild (Singleton) | `studio/schemaTypes/documents/siteSettings.ts` |

Bausteine:

| Typ                                                  | Zweck                                                 |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `localeString`                                       | kurzer Text DE/EN (DE Pflicht, EN empfohlen)          |
| `localeText`                                         | langer Text DE/EN                                     |
| `imageWithAlt`                                       | Bild mit Hotspot + **Pflicht-Alternativtext** (DE/EN) |
| `seo`                                                | optionale Overrides für Seitentitel/Beschreibung      |
| `imageBlock`, `imageGrid`, `textBlock`, `videoEmbed` | Inhaltsblöcke einer Projektseite                      |

### Regeln für das Content-Modell

1. Jeder sichtbare Text ist ein `localeString`/`localeText` – nie ein einfacher `string`.
   (Ausnahmen: Eigennamen wie Kundenname, Software-Namen.)
2. Fehlt Englisch, zeigt die Website automatisch Deutsch (`coalesce(feld[$locale], feld.de)` in GROQ).
3. Slugs nach dem Veröffentlichen nicht mehr ändern (URLs brechen sonst).
4. Neues Feld oder neuer Blocktyp → **an drei Stellen** ergänzen:
   Studio-Schema → GROQ in `web/app/lib/sanity/queries.ts` → Mapping in `web/app/content/*.server.ts`
   (+ Typ in `content/types.ts`, + Darstellung in der Komponente).

## Projekte und der Chat „Frag Achim“

Der Chat kennt alle Projekte automatisch (nach dem nächsten Build). Er nutzt dafür:

| Feld                             | Wofür im Chat                                                    |
| -------------------------------- | ---------------------------------------------------------------- |
| Titel, Kunde                     | erkennt das Projekt („Erzähl mir von Gute Stube“)                |
| Branche                          | „Hast du schon was für Gastronomie gemacht?“ → passende Projekte |
| Kategorie, Jahr                  | steht in der Antwort                                             |
| Beschreibung (erste zwei Sätze)  | Kurzantwort zum Projekt                                          |
| **Stichwörter für „Frag Achim“** | weitere Begriffe, z. B. „Café“, „Foodtruck“, ein Produktname     |

Details: [09-ask-widget.md → Kundenprojekte](09-ask-widget.md#kundenprojekte-im-chat).

## Bilder

- Bilder werden in Sanity hochgeladen, die Website lädt sie **beim Build herunter** und liefert sie
  selbst aus (`/media/<hash>.webp`, mehrere Breiten für `srcset`). Code: `web/app/lib/sanity/media.server.ts`.
- Vorteil: keine Verbindung vom Besucher zu `cdn.sanity.io` (Datenschutz) und volle Cache-Kontrolle.

## Veröffentlichen (Ablauf)

```
In Sanity „Publish“ → (später: Webhook) → Build-Server baut die Website → neue Dateien auf den Server
```

Bis der Webhook eingerichtet ist: nach Änderungen `npm run build` und Deploy manuell auslösen.
