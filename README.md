# achimbenzel.com – Portfolio

Neue Portfolio-Website von Achim Benzel. **React + Vite (React Router 8) + Sanity CMS**, komplett
vorgerendert (statisches HTML pro Seite), nur Dark Mode, zweisprachig (DE/EN), gehostet in Deutschland.

> Status: **Grundstruktur + optischer Prototyp.** Inhalte, Umgebungsvariablen, Kontaktformular und das
> finale Projekt-Schema folgen – siehe [docs/08-roadmap.md](docs/08-roadmap.md).

## Schnellstart

Voraussetzung: Node.js ≥ 22.22 (siehe `.nvmrc`).

```bash
npm install          # installiert Website + Studio (npm workspaces)
npm run dev          # Website lokal → http://localhost:5173/de/
npm run studio       # Sanity Studio lokal → http://localhost:3333 (braucht studio/.env)
npm run build        # statischen Build erzeugen → web/build/client
npm run preview      # Build lokal ansehen (verhält sich wie der nginx-Server)
npm test             # Testfragen des Ask-Widgets (DE + EN)
npm run photos       # Fotos aus assets/photos/ fürs Web aufbereiten (ohne Metadaten)
npm run ask:report -- <datei>  # unbeantwortete Chat-Fragen auswerten (falls eingeschaltet)
npm run check        # Format, Lint, Typen, Tests, Build – vor jedem Commit
```

Ohne Sanity-Zugangsdaten läuft die Website mit Platzhalter-Inhalten aus `web/app/content/fallback`.

## Struktur

```
.
├─ web/            Website (React Router 8 + Vite, TypeScript, CSS Modules)
│  ├─ app/
│  │  ├─ routes/      Seiten (dünn: Daten laden, Meta-Tags, Komponenten zusammensetzen)
│  │  ├─ components/  UI-Bausteine (ui/, layout/, sections/, project/, brand/)
│  │  ├─ features/    in sich geschlossene Funktionen (ask/ = „Frag Achim“, consent/ = Cookie-Banner)
│  │  ├─ content/     Content-Layer: EINZIGER Zugriff auf Inhalte (Sanity oder Platzhalter)
│  │  ├─ lib/         Helfer (SEO, Pfade, Sanity-Client, …)
│  │  ├─ i18n/        UI-Texte DE/EN
│  │  ├─ config/      feste Website-Konfiguration
│  │  └─ styles/      Design-Tokens, Schriften, Basis-CSS
│  └─ public/      statische Dateien (lokale Schriften, Favicon)
├─ studio/         Sanity Studio (Content-Modell / Schemas)
├─ assets/         Quelldateien, die NICHT ausgeliefert werden (z. B. Original-Fotos)
├─ deploy/         nginx, Dockerfile, docker-compose, ask-log (optionaler Dienst für Chat-Fragen)
└─ docs/           Dokumentation & verbindliche Regeln
```

## Dokumentation

| Dokument                                           | Inhalt                                                |
| -------------------------------------------------- | ----------------------------------------------------- |
| [01 Architektur](docs/01-architektur.md)           | Wie die Seite aufgebaut ist und warum                 |
| [02 Regeln](docs/02-regeln.md)                     | **Verbindliche Regeln** für Code, Inhalte & Struktur  |
| [03 Design-System](docs/03-design-system.md)       | Farben, Schriften, Abstände, Animationen              |
| [04 Inhalte & Sanity](docs/04-inhalte-sanity.md)   | Content-Modell, Studio, Veröffentlichen               |
| [05 SEO & KI](docs/05-seo-ki.md)                   | Prerendering, Meta-Tags, Sitemap, llms.txt            |
| [06 Datenschutz](docs/06-datenschutz.md)           | DSGVO, Cookie-Banner, lokale Fonts, Checkliste        |
| [07 Lizenzen](docs/07-lizenzen.md)                 | Herkunft von Code, Schriften & Assets                 |
| [08 Roadmap](docs/08-roadmap.md)                   | Was noch offen ist                                    |
| [09 Ask-Widget](docs/09-ask-widget.md)             | „Frag Achim“ – Funktionsweise & Pflege                |
| [10 Anleitungen](docs/10-anleitungen.md)           | Schritt für Schritt: neue Seite, Komponente, …        |
| [11 Barrierefreiheit](docs/11-barrierefreiheit.md) | Freiwilliges Ziel (WCAG 2.2 AA) – Empfehlungen, Tests |
