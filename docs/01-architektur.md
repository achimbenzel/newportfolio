# 01 – Architektur

## Das Problem der alten Seite

- Der komplette Inhalt wurde **im Browser per JavaScript erzeugt**. Suchmaschinen und KI-Crawler sahen
  zunächst eine leere Seite.
- Inhalte lagen als JSON-Dateien in Ordnern, nach jeder Änderung musste ein Skript laufen.
- Eine große globale CSS-Datei mit vielen Theme-Varianten (`[data-theme=…]`) – schwer zu ändern,
  ohne etwas anderes kaputtzumachen.

## Die neue Architektur in einem Satz

**Inhalte werden in Sanity gepflegt, beim Build abgeholt und jede Seite wird als fertiges HTML
erzeugt. Der Server liefert nur noch statische Dateien aus.**

```
 Redaktion                    Build (z. B. bei jedem Veröffentlichen)          Besucher
┌──────────────┐  GROQ   ┌──────────────────────────────────────────┐   ┌──────────────────┐
│ Sanity Studio │ ──────▶ │ React Router + Vite                      │   │ nginx (Hosting   │
│ (Inhalte,     │         │  1. Inhalte aus Sanity holen             │──▶│ in Deutschland)  │
│  Bilder)      │         │  2. Bilder herunterladen → /media        │   │ liefert nur      │
└──────────────┘          │  3. jede Seite als HTML vorrendern       │   │ statische Dateien│
                          │  4. sitemap.xml, robots.txt, llms.txt    │   └──────────────────┘
                          └──────────────────────────────────────────┘
```

Der Browser des Besuchers spricht **nur mit unserem eigenen Server** – nie mit Sanity, Google Fonts o. Ä.

## Technologien

| Bereich       | Wahl                                   | Warum                                                              |
| ------------- | -------------------------------------- | ------------------------------------------------------------------ |
| UI            | React 19                               | gewünscht, großes Ökosystem                                        |
| Build/Dev     | Vite 8                                 | schnell, Standard                                                  |
| Routing + SSG | React Router 8 (Framework-Modus)       | baut auf Vite auf und kann **jede Seite vorrendern** (`prerender`) |
| CMS           | Sanity (Studio im Ordner `studio/`)    | Inhalte im Browser pflegen statt JSON + Skript                     |
| Styling       | CSS Modules + Design-Tokens (CSS-Vars) | kein globales Durcheinander, keine Zusatz-Bibliothek nötig         |
| Sprache       | TypeScript (strict)                    | Fehler fallen beim Schreiben auf, nicht beim Besucher              |
| Animationen   | reines CSS                             | leicht, funktioniert auch vor dem Laden von JavaScript             |
| Hosting       | nginx (Docker), Server in Deutschland  | statische Dateien, kein Node-Server in Produktion nötig            |

**Warum nicht „nur Vite + React“?** Eine reine Vite-SPA rendert wieder alles im Browser – genau das
Problem der alten Seite. React Router im Framework-Modus nutzt Vite, erzeugt aber beim Build echtes HTML.

## Wie eine Seite entsteht

1. `web/app/routes.ts` definiert alle URLs (`/:lang/…`).
2. `web/app/content/pages.server.ts` listet alle Seiten, die gebaut werden (inkl. Projekt-Slugs aus Sanity).
3. Beim `npm run build` ruft React Router für jede Seite den `loader` auf (holt Inhalte über den
   Content-Layer), rendert die Komponente zu HTML und schreibt:
   - `build/client/de/work/index.html` – das HTML für Besucher & Crawler
   - `build/client/de/work.data` – dieselben Daten für schnelle Navigation im Browser
4. Im Browser übernimmt React („Hydration“): Header-Animationen, Ask-Widget, Navigation ohne Neuladen.

Unbekannte URLs liefert nginx mit Status 404 und der Datei `__spa-fallback.html` aus – die App zeigt
dann die gestaltete 404-Seite.

## Datenfluss im Code

```
routes/project.tsx            ← loader(): getProject(locale, slug)
  └─ content/projects.server.ts   ← EINZIGER Zugriff auf Projekte
       ├─ lib/sanity/client.server.ts  (wenn SANITY_PROJECT_ID gesetzt)
       ├─ lib/sanity/media.server.ts   (Bilder → lokale /media/-Dateien)
       └─ content/fallback/…           (sonst Platzhalter)
  └─ components/project/…         ← bekommt fertig lokalisierte Daten (content/types.ts)
```

- Dateien mit `.server.ts` landen **nie** im Browser-Bundle (React Router erzwingt das).
- Komponenten wissen nicht, woher Daten kommen – sie bekommen die Typen aus `content/types.ts`.

## Sprachen

- Jede URL beginnt mit `/de/` oder `/en/`. `/` leitet auf `/de/` weiter.
- Beide Sprachen nutzen **dieselben Slugs** (`/de/work`, `/en/work`) → Sprachwechsel ist immer 1:1.
- UI-Texte: `web/app/i18n/de.ts` + `en.ts`. Redaktionelle Texte: zweisprachige Felder in Sanity.

## Ordnerstruktur `web/app`

| Ordner                 | Zweck                                                           | Beispiel                 |
| ---------------------- | --------------------------------------------------------------- | ------------------------ |
| `routes/`              | eine Datei pro Seite/Route, nur Zusammenbau                     | `home.tsx`               |
| `components/ui/`       | generische Bausteine ohne Fachlogik                             | `Button`, `Section`      |
| `components/layout/`   | Seitenrahmen                                                    | `Header`, `Footer`       |
| `components/sections/` | größere Seitenabschnitte                                        | `Hero`, `PageHeader`     |
| `components/project/`  | alles rund um Projekte                                          | `ProjectCard`            |
| `components/brand/`    | Logo & Marke                                                    | `Logo`                   |
| `features/`            | abgeschlossene Funktionen mit eigener Logik + UI + Doku im Kopf | `ask/`, `consent/`       |
| `content/`             | Content-Layer: Typen, Zugriff, Platzhalter                      | `projects.server.ts`     |
| `lib/`                 | Helfer ohne UI                                                  | `seo.ts`, `paths.ts`     |
| `i18n/`                | UI-Texte & Sprachlogik                                          | `de.ts`                  |
| `config/`              | feste Konfiguration                                             | `site.ts`, `services.ts` |
| `styles/`              | Tokens, Schriften, Basis-CSS                                    | `tokens.css`             |
