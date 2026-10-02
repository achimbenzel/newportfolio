# 02 – Regeln (verbindlich)

Diese Regeln gelten für jede Änderung – egal ob von Hand oder mit KI-Unterstützung geschrieben.
Wer eine Regel brechen muss, ändert zuerst dieses Dokument (mit Begründung).

## A. Struktur

1. **Routen bleiben dünn.** Eine Datei in `routes/` lädt Daten (`loader`), setzt Meta-Tags (`meta`) und
   setzt Komponenten zusammen. Keine großen UI-Blöcke, keine Fachlogik.
2. **Inhalte nur über den Content-Layer.** Routen holen Inhalte ausschließlich über
   `content/*.server.ts`. Kein direkter Sanity-Zugriff in Routen oder Komponenten.
3. **Sanity nur in `lib/sanity/*.server.ts`.** ESLint verbietet `@sanity/*`-Imports an anderen Stellen.
4. **Server-Code endet auf `.server.ts`.** Alles mit Geheimnissen, Dateisystem oder CMS-Zugriff.
5. **Komponenten bekommen fertige Daten.** Lokalisiert, Bilder bereits lokal, Typen aus `content/types.ts`.
6. **Eine Komponente = ein Ordner-Eintrag:** `Name.tsx` + `Name.module.css` nebeneinander.
7. **Interne URLs nur über `lib/paths.ts`.** Nie `"/de/work"` als String in Komponenten.
8. **Neue Seite = drei Stellen:** `routes.ts`, `content/pages.server.ts`, `lib/paths.ts`
   (Anleitung: [10-anleitungen.md](10-anleitungen.md)).
9. **Module, die `react-router.config.ts` lädt** (`content/pages.server.ts` und alles, was es
   importiert), nutzen **relative Imports** – dort gibt es den `~/`-Alias nicht.

## B. Benennung

| Was                  | Schreibweise         | Beispiel                              |
| -------------------- | -------------------- | ------------------------------------- |
| Komponenten          | PascalCase           | `ProjectCard.tsx`                     |
| Hooks                | `use` + camelCase    | `useConsent`                          |
| Helfer/Module        | camelCase / kebab    | `paths.ts`, `project-slugs.server.ts` |
| CSS-Klassen (Module) | camelCase            | `.serviceCard`                        |
| URL-Slugs            | kebab-case, Englisch | `/motion-design`                      |
| Sanity-Felder        | camelCase, Englisch  | `sortOrder`                           |

Code (Variablen, Typen) ist **Englisch**, Kommentare und Doku sind **Deutsch**.

## C. Styling

1. **Nur Tokens.** Farben, Abstände, Radien, Schatten, Kurven kommen aus `styles/tokens.css`.
   Keine Hex-Werte in Komponenten-CSS. Ausnahmen (z. B. Logo-Verläufe) im Kommentar begründen.
2. **CSS Modules für Komponenten**, globale Styles nur in `styles/` (Reset, Schriften, Tokens).
3. **Keine Inline-Styles** – außer CSS-Variablen für Werte pro Element (z. B. `--i` für Staffelung).
4. **Nur Dark Mode.** Kein Theme-Switch, keine `[data-theme]`-Varianten.
5. **Mobile zuerst mitdenken:** jede Komponente bei 360 px, 768 px, 1440 px prüfen.
6. **Animationen:** CSS bevorzugen, Kurven `--ease-out` / `--ease-in-out` verwenden,
   `prefers-reduced-motion` wird global respektiert (nicht abschalten).

## D. Texte & Sprachen

1. Jeder sichtbare Text existiert auf **Deutsch und Englisch**.
2. **UI-Texte** (Buttons, Navigation, Labels) → `i18n/de.ts` + `i18n/en.ts` (gleiche Schlüssel; TypeScript prüft das).
3. **Redaktionelle Inhalte** (Projekte, Leistungen) → Sanity, zweisprachige Felder (`localeString`, `localeText`).
4. Keine Texte fest in Komponenten schreiben.

## E. SEO & KI

1. Jede Seite exportiert `meta` und nutzt `pageMeta()` aus `lib/seo.ts` (Title, Description,
   Canonical, hreflang, Open Graph).
2. **Genau eine `<h1>` pro Seite** (im Hero bzw. `PageHeader`), Sektionen nutzen `<h2>`.
3. Inhalte, die gefunden werden sollen, müssen **im vorgerenderten HTML** stehen – nicht erst
   per JavaScript nachgeladen werden.
4. Jedes Bild hat einen sinnvollen Alternativtext (in Sanity Pflichtfeld).
5. Details: [05-seo-ki.md](05-seo-ki.md).

## F. Datenschutz (Hosting in Deutschland)

1. **Keine Verbindung zu Drittanbietern ohne Einwilligung.** Schriften, Bilder, Skripte kommen vom
   eigenen Server. Kein Google Fonts-/CDN-Link, keine eingebetteten Tracker.
2. Externe Inhalte (Videos, Karten) **nur über `<ConsentGate>`**.
3. Neuer Dienst mit Cookies/Datenübertragung → Consent-Kategorie in `features/consent/config.ts`,
   `CONSENT_VERSION` erhöhen, Datenschutzerklärung anpassen.
4. Kein `localStorage`/Cookie für Dinge, die nicht technisch notwendig sind.
5. Details & Checkliste vor Livegang: [06-datenschutz.md](06-datenschutz.md).

## G. Rechtliches & Herkunft von Code („nichts klauen“)

1. Code wird **selbst geschrieben**. Kein Kopieren von Code aus Templates, Themes, fremden Websites
   oder Tutorials ohne passende Lizenz.
2. **Neue Abhängigkeit (npm-Paket)?** Nur mit erlaubter Lizenz (MIT, ISC, BSD, Apache-2.0, OFL für
   Schriften). Vorher in [07-lizenzen.md](07-lizenzen.md) eintragen. Keine GPL/AGPL-Pakete im Browser-Bundle.
3. **Schriften, Bilder, Icons, Videos:** nur mit nachweisbarer Lizenz oder selbst erstellt. Quelle notieren.
4. KI-generierter Code wird wie eigener Code behandelt: verstehen, prüfen, keine 1:1-Kopien erkennbar
   fremder Projekte übernehmen.

## H. Barrierefreiheit

1. Alles per Tastatur bedienbar, sichtbarer Fokus (`:focus-visible`) nicht entfernen.
2. Buttons sind `<button>`, Links sind `<a>`/`<Link>` – nie `div` mit `onClick`.
3. Icon-Buttons brauchen ein `aria-label`.
4. Textkontrast ≥ 4.5 : 1 (Tokens sind entsprechend gewählt, siehe [03-design-system.md](03-design-system.md)).

## I. Qualität & Git

1. Vor jedem Commit: `npm run check` (Format, Lint, Typen, Build) muss grün sein.
2. TypeScript ist `strict` – kein `any`, kein `// @ts-ignore` ohne Begründung.
3. Commits klein und beschreibend (Was + Warum).
4. `.env`-Dateien **niemals** committen – nur `.env.example` pflegen.
