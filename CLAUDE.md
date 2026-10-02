# Hinweise für KI-Assistenten

Portfolio-Website von Achim Benzel. Monorepo: `web/` (React Router 8 + Vite, vorgerendert),
`studio/` (Sanity Studio), `docs/` (Doku), `deploy/` (nginx/Docker).

**Vor jeder Änderung `docs/02-regeln.md` lesen und einhalten.** Kurzfassung:

- Routen dünn halten; Inhalte nur über `web/app/content/*.server.ts`; Sanity nur in `web/app/lib/sanity/*.server.ts`.
- Interne URLs nur über `web/app/lib/paths.ts`; neue Seite = `routes.ts` + `content/pages.server.ts` + `lib/paths.ts`.
- Styling: CSS Modules + Tokens aus `web/app/styles/tokens.css`, keine Hex-Werte in Komponenten, nur Dark Mode.
- Jeder sichtbare Text auf DE **und** EN (`web/app/i18n/de.ts`/`en.ts` bzw. zweisprachige Sanity-Felder).
- Jede Seite: `meta` mit `pageMeta()`, genau eine `<h1>`, Inhalte im vorgerenderten HTML.
- Datenschutz: keine Requests an Drittanbieter ohne Consent (Fonts/Bilder lokal, Embeds nur via `<ConsentGate>`).
- Keine fremden Code-Schnipsel/Assets ohne passende Lizenz; neue npm-Pakete in `docs/07-lizenzen.md` eintragen.
- Code Englisch, Kommentare & Doku Deutsch.
- Ask-Widget: Inhalte in `web/app/features/ask/knowledge.ts`, Testfragen in `knowledge.test.ts` (siehe `docs/09-ask-widget.md`).
- Vor dem Commit: `npm run check` (Format, Lint, Typen, Tests, Build).
